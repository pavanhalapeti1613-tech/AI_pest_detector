import { PestDetection, ESP32Status } from '../types';

const DEFAULT_IP = 'http://192.168.1.50';
const STORAGE_IP_KEY = 'agrisound_esp32_ip';
const STORAGE_HISTORY_KEY = 'agrisound_local_history';

class ESP32Client {
  private ipAddress: string;
  private history: PestDetection[] = [];

  constructor() {
    this.ipAddress = localStorage.getItem(STORAGE_IP_KEY) || DEFAULT_IP;

    // Load persisted real history if any exists from past sessions
    const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        // Filter out any previous dummy/demo IDs if left over
        this.history = Array.isArray(parsed)
          ? parsed.filter((item: PestDetection) => !item.id?.startsWith('det-hist-') && !item.id?.startsWith('det-live-'))
          : [];
      } catch {
        this.history = [];
      }
    } else {
      this.history = [];
    }
    this.persistHistory();
  }

  private persistHistory() {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(this.history));
    } catch {
      // Ignore storage errors
    }
  }

  public getIpAddress(): string {
    return this.ipAddress;
  }

  public setIpAddress(ip: string) {
    let cleanIp = ip.trim();
    if (!cleanIp.startsWith('http://') && !cleanIp.startsWith('https://')) {
      cleanIp = 'http://' + cleanIp;
    }
    cleanIp = cleanIp.replace(/\/+$/, '');
    this.ipAddress = cleanIp;
    localStorage.setItem(STORAGE_IP_KEY, this.ipAddress);
  }

  /**
   * Helper to execute fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  /**
   * Poll GET /api/latest directly from the ESP32
   */
  public async getLatest(): Promise<{ data: PestDetection; status: ESP32Status }> {
    const endpoint = `${this.ipAddress}/api/latest`;
    try {
      const res = await this.fetchWithTimeout(endpoint, { method: 'GET' }, 2200);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const rawData = await res.json();
      const detection: PestDetection = {
        id: rawData.id || `esp-${Date.now()}`,
        detected: Boolean(rawData.detected),
        pest: rawData.pest || null,
        confidence: typeof rawData.confidence === 'number' ? rawData.confidence : (rawData.detected ? 85 : 0),
        timestamp: rawData.timestamp || new Date().toISOString(),
        db_level: typeof rawData.db_level === 'number' ? rawData.db_level : 0,
        frequency_hz: typeof rawData.frequency_hz === 'number' ? rawData.frequency_hz : 0,
        device_id: rawData.device_id || 'ESP32-INMP441',
        battery_v: rawData.battery_v || 4.10,
        acknowledged: Boolean(rawData.acknowledged),
        field_zone: rawData.field_zone || 'Field Sensor',
        remedy: rawData.remedy,
      };

      return {
        data: detection,
        status: {
          ipAddress: this.ipAddress,
          isOnline: true,
          isSimulated: false,
          lastSuccessfulPing: new Date().toISOString(),
          errorMessage: null,
          isPolling: true,
          batteryVoltage: detection.battery_v || 4.10,
          micNoiseFloorDb: detection.db_level,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Waiting for connection';
      return {
        data: {
          id: 'waiting',
          detected: false,
          pest: null,
          confidence: 0,
          timestamp: new Date().toISOString(),
          db_level: 0,
          frequency_hz: 0,
          device_id: 'ESP32-INMP441',
          battery_v: 0,
          acknowledged: false,
        },
        status: {
          ipAddress: this.ipAddress,
          isOnline: false,
          isSimulated: false,
          lastSuccessfulPing: null,
          errorMessage: `Waiting to connect to ESP32 at ${this.ipAddress}. Connect your phone/PC to the farm WiFi. (${message})`,
          isPolling: true,
          batteryVoltage: 0,
          micNoiseFloorDb: 0,
        },
      };
    }
  }

  /**
   * Fetch real history from ESP32: GET /api/history
   */
  public async getHistory(): Promise<PestDetection[]> {
    const endpoint = `${this.ipAddress}/api/history`;
    try {
      const res = await this.fetchWithTimeout(endpoint, { method: 'GET' }, 2500);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        this.history = data;
        this.persistHistory();
        return data;
      }
      return [...this.history];
    } catch {
      return [...this.history];
    }
  }

  /**
   * Send acknowledgment to ESP32: POST /api/ack
   */
  public async acknowledgeDetection(detection: PestDetection): Promise<{ success: boolean; message: string }> {
    const endpoint = `${this.ipAddress}/api/ack`;
    try {
      const res = await this.fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: detection.id,
            pest: detection.pest,
            timestamp: detection.timestamp,
          }),
        },
        3000
      );

      // Record in local cache
      const archived: PestDetection = {
        ...detection,
        acknowledged: true,
      };
      this.history = [archived, ...this.history.filter((h) => h.id !== archived.id)];
      this.persistHistory();

      if (!res.ok) {
        return {
          success: true,
          message: 'Saved to local history (ESP32 responded with status ' + res.status + ').',
        };
      }
      const json = await res.json().catch(() => ({}));
      return {
        success: true,
        message: json.message || 'Detection acknowledged and cleared on ESP32.',
      };
    } catch {
      // Even if connection drops momentarily, archive locally so farmer does not lose record
      const archived: PestDetection = {
        ...detection,
        acknowledged: true,
      };
      this.history = [archived, ...this.history.filter((h) => h.id !== archived.id)];
      this.persistHistory();

      return {
        success: true,
        message: 'Detection acknowledged and recorded in history.',
      };
    }
  }

  public clearHistory() {
    this.history = [];
    this.persistHistory();
  }
}

export const esp32 = new ESP32Client();
