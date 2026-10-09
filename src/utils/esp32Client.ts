import { PestDetection, ESP32Status } from '../types';

const DEFAULT_IP = 'http://192.168.1.50';
const STORAGE_IP_KEY = 'agrisound_esp32_ip';
const STORAGE_HISTORY_KEY = 'agrisound_local_history';
const STORAGE_SIM_KEY = 'agrisound_sim_mode';

export class ESP32Client {
  private ipAddress: string;
  private history: PestDetection[] = [];
  private isSimulated: boolean = false;
  private simulatedActiveDetection: PestDetection | null = null;
  private serialPort: any = null;
  private serialReader: any = null;
  private isSerialOpen: boolean = false;
  private serialDetection: PestDetection | null = null;
  private serialListeners: Set<(det: PestDetection) => void> = new Set();
  private verifiedWorkingEndpoint: string | null = null;

  constructor() {
    this.ipAddress = this.normalizeIp(localStorage.getItem(STORAGE_IP_KEY) || DEFAULT_IP);
    this.isSimulated = localStorage.getItem(STORAGE_SIM_KEY) === 'true';

    // Load persisted real history if any exists
    const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
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

  /**
   * Cleans, formats and normalizes an IP or URL string
   */
  public normalizeIp(rawInput: string): string {
    let clean = (rawInput || '').trim();
    if (!clean) return DEFAULT_IP;

    // If user typed without protocol (e.g. 192.168.1.50 or 192.168.1.50:80)
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    // Remove trailing slashes
    clean = clean.replace(/\/+$/, '');
    return clean;
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
    this.ipAddress = this.normalizeIp(ip);
    this.verifiedWorkingEndpoint = null;
    localStorage.setItem(STORAGE_IP_KEY, this.ipAddress);
  }

  public isSimulationMode(): boolean {
    return this.isSimulated;
  }

  public setSimulationMode(sim: boolean) {
    this.isSimulated = sim;
    localStorage.setItem(STORAGE_SIM_KEY, String(sim));
  }

  public isSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public isSerialConnected(): boolean {
    return this.isSerialOpen;
  }

  public addSerialListener(listener: (det: PestDetection) => void) {
    this.serialListeners.add(listener);
    return () => this.serialListeners.delete(listener);
  }

  /**
   * Connect via Web Serial API directly to ESP32 over USB cable
   */
  public async connectSerial(): Promise<{ success: boolean; message: string }> {
    if (!this.isSerialSupported()) {
      return { success: false, message: 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.' };
    }

    try {
      const nav = navigator as any;
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 115200 });
      this.serialPort = port;
      this.isSerialOpen = true;

      // Start asynchronous reading loop
      this.startSerialReader(port);

      return { success: true, message: 'Connected to ESP32 via USB Serial at 115200 baud!' };
    } catch (err: any) {
      this.isSerialOpen = false;
      return { success: false, message: err?.message || 'Failed to open serial port' };
    }
  }

  public async disconnectSerial(): Promise<void> {
    try {
      if (this.serialReader) {
        await this.serialReader.cancel();
        this.serialReader.releaseLock();
        this.serialReader = null;
      }
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
    } catch {
      // Ignore disconnect errors
    } finally {
      this.isSerialOpen = false;
    }
  }

  private async startSerialReader(port: any) {
    try {
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      this.serialReader = reader;

      let buffer = '';
      while (this.isSerialOpen) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              const parsed = this.parseRawData(trimmed, 'ESP32-USB-SERIAL');
              if (parsed) {
                this.serialDetection = parsed;
                this.serialListeners.forEach((fn) => fn(parsed));
              }
            }
          }
        }
      }
    } catch {
      this.isSerialOpen = false;
    }
  }

  /**
   * Extremely tolerant parser for JSON or plain text from ESP32
   */
  public parseRawData(raw: any, deviceFallback = 'ESP32-INMP441'): PestDetection | null {
    if (!raw) return null;

    let obj = raw;
    if (typeof raw === 'string') {
      try {
        obj = JSON.parse(raw);
      } catch {
        // Plain text parsing
        const lower = raw.toLowerCase();
        const isMole = lower.includes('mole') || lower.includes('cricket');
        const isDragon = lower.includes('dragon');

        if (isMole || isDragon) {
          const pest = isMole ? 'Mole Cricket' : 'Dragonfly';
          return {
            id: `esp-ser-${Date.now()}`,
            detected: true,
            pest,
            confidence: 94,
            timestamp: new Date().toISOString(),
            db_level: isMole ? 58.4 : 41.2,
            frequency_hz: isMole ? 2180 : 240,
            device_id: deviceFallback,
            battery_v: 4.12,
            acknowledged: false,
            field_zone: 'Field Sensor',
            remedy: isMole
              ? 'Chlorantraniliprole 18.5% SC root-zone soil drench (0.5 ml/L)'
              : 'Beneficial predator conserved · Zero chemical spray required',
          };
        }
        return null;
      }
    }

    if (typeof obj !== 'object' || obj === null) return null;

    // Detect pest name
    const rawPest = obj.pest || obj.pest_name || obj.target || obj.insect || obj.detection || obj.name || obj.class;
    let pestName: string | null = null;
    if (typeof rawPest === 'string' && rawPest.trim() && !['none', 'clear', 'null'].includes(rawPest.toLowerCase())) {
      if (/mole|cricket/i.test(rawPest)) {
        pestName = 'Mole Cricket';
      } else if (/dragon/i.test(rawPest)) {
        pestName = 'Dragonfly';
      } else {
        pestName = rawPest.trim();
      }
    }

    const detected = Boolean(obj.detected ?? (pestName ? true : false));

    let conf = typeof obj.confidence === 'number' ? obj.confidence : (typeof obj.conf === 'number' ? obj.conf : (typeof obj.accuracy === 'number' ? obj.accuracy : (detected ? 90 : 0)));
    if (conf > 0 && conf <= 1) {
      conf = Math.round(conf * 100);
    }

    const db = typeof obj.db_level === 'number' ? obj.db_level : (typeof obj.db === 'number' ? obj.db : (typeof obj.sound === 'number' ? obj.sound : (detected ? 54.0 : 32.0)));
    const freq = typeof obj.frequency_hz === 'number' ? obj.frequency_hz : (typeof obj.freq === 'number' ? obj.freq : (pestName === 'Dragonfly' ? 240 : 2180));
    const batt = typeof obj.battery_v === 'number' ? obj.battery_v : (typeof obj.battery === 'number' ? obj.battery : 4.12);

    return {
      id: obj.id || `esp-${Date.now()}`,
      detected,
      pest: detected ? (pestName || 'Mole Cricket') : null,
      confidence: conf,
      timestamp: obj.timestamp || new Date().toISOString(),
      db_level: Number(db.toFixed(1)),
      frequency_hz: Math.round(freq),
      device_id: obj.device_id || deviceFallback,
      battery_v: Number(batt.toFixed(2)),
      acknowledged: Boolean(obj.acknowledged),
      field_zone: obj.field_zone || 'Field Sensor Block A',
      remedy: obj.remedy || (pestName === 'Dragonfly'
        ? 'Beneficial natural predator conserved · Zero spray required'
        : 'Chlorantraniliprole 18.5% SC root-zone soil drench (0.5 ml/L)'),
    };
  }

  public triggerTestPest(pestName: 'Mole Cricket' | 'Dragonfly' | string, confidence: number = 94) {
    const isDragonfly = pestName.toLowerCase().includes('dragon');
    const selectedPest = isDragonfly ? 'Dragonfly' : 'Mole Cricket';

    this.simulatedActiveDetection = {
      id: `test-${Date.now()}`,
      detected: true,
      pest: selectedPest,
      confidence,
      timestamp: new Date().toISOString(),
      db_level: isDragonfly ? 41.8 : 58.4,
      frequency_hz: isDragonfly ? 240 : 2180,
      device_id: 'ESP32-TEST',
      battery_v: 4.12,
      acknowledged: false,
      field_zone: 'Zone A',
      remedy: isDragonfly
        ? 'Beneficial natural predator conserved · Zero spray required'
        : 'Chlorantraniliprole 18.5% SC root-zone soil drench (0.5 ml/L)',
    };
  }

  public clearTestPest() {
    this.simulatedActiveDetection = null;
  }

  public seedDemoData(): PestDetection[] {
    const now = Date.now();
    const demoItems: PestDetection[] = [
      {
        id: `demo-mc-1`,
        detected: true,
        pest: 'Mole Cricket',
        confidence: 94,
        timestamp: new Date(now - 8 * 60 * 1000).toISOString(),
        db_level: 58.4,
        frequency_hz: 2180,
        device_id: 'ESP32-AGRI-01',
        battery_v: 4.12,
        acknowledged: true,
        field_zone: 'North Field Block A',
        remedy: 'Chlorantraniliprole 18.5% SC root-zone soil drench (0.5 ml/L water) or neem cake application',
      },
      {
        id: `demo-df-1`,
        detected: true,
        pest: 'Dragonfly',
        confidence: 92,
        timestamp: new Date(now - 42 * 60 * 1000).toISOString(),
        db_level: 41.2,
        frequency_hz: 240,
        device_id: 'ESP32-AGRI-01',
        battery_v: 4.15,
        acknowledged: true,
        field_zone: 'Canopy Border & Irrigation Canal',
        remedy: 'Beneficial predatory insect conserved. Do not spray chemical pesticides.',
      },
      {
        id: `demo-mc-2`,
        detected: true,
        pest: 'Mole Cricket',
        confidence: 88,
        timestamp: new Date(now - 140 * 60 * 1000).toISOString(),
        db_level: 54.0,
        frequency_hz: 2180,
        device_id: 'ESP32-AGRI-01',
        battery_v: 4.18,
        acknowledged: true,
        field_zone: 'Seedling Nursery Greenhouse',
        remedy: 'Deep inter-row soil aeration and moist barrier light traps deployed',
      },
    ];

    this.history = [...demoItems, ...this.history.filter((h) => !h.id.startsWith('demo-'))];
    this.persistHistory();
    this.setSimulationMode(true);
    this.triggerTestPest('Mole Cricket', 95);
    return this.history;
  }

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
   * Candidate endpoint generator for any given IP or base URL
   */
  public getCandidateEndpoints(baseUrl: string): string[] {
    const clean = this.normalizeIp(baseUrl);
    const parsed = new URL(clean);
    const list: string[] = [];

    // If user specified a specific subpath (e.g. http://192.168.1.50/data)
    if (parsed.pathname && parsed.pathname !== '/') {
      list.push(clean);
    }

    const origin = parsed.origin;
    list.push(`${origin}/api/latest`);
    list.push(`${origin}/latest`);
    list.push(`${origin}/data`);
    list.push(`${origin}/status`);
    list.push(`${origin}/sensor`);
    list.push(`${origin}/`);

    // Deduplicate
    return Array.from(new Set(list));
  }

  /**
   * Actively tests connection to an IP address across multiple potential endpoints
   */
  public async testConnection(targetIp: string): Promise<{
    success: boolean;
    endpoint?: string;
    message: string;
    isMixedContent?: boolean;
    latencyMs?: number;
    data?: PestDetection;
  }> {
    const cleanIp = this.normalizeIp(targetIp);
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalHttp = isHttps && cleanIp.startsWith('http://');

    const candidates = this.getCandidateEndpoints(cleanIp);
    const startTime = performance.now();

    // 1. Direct fetch attempt
    for (const endpoint of candidates) {
      try {
        const res = await this.fetchWithTimeout(endpoint, { method: 'GET', mode: 'cors' }, 1800);
        if (res.ok) {
          const text = await res.text();
          const parsed = this.parseRawData(text);
          const latency = Math.round(performance.now() - startTime);
          this.verifiedWorkingEndpoint = endpoint;
          return {
            success: true,
            endpoint,
            latencyMs: latency,
            message: `Connected successfully (${latency}ms) via ${endpoint}`,
            data: parsed || undefined,
          };
        }
      } catch {
        // Try next endpoint
      }
    }

    // 2. Server proxy attempt (for reachable remote IPs/ngrok/tunnels)
    for (const endpoint of candidates.slice(0, 3)) {
      try {
        const proxyUrl = `/api/esp32/proxy?target=${encodeURIComponent(endpoint)}`;
        const res = await this.fetchWithTimeout(proxyUrl, { method: 'GET' }, 2200);
        if (res.ok) {
          const text = await res.text();
          const parsed = this.parseRawData(text);
          const latency = Math.round(performance.now() - startTime);
          this.verifiedWorkingEndpoint = endpoint;
          return {
            success: true,
            endpoint,
            latencyMs: latency,
            message: `Connected via Server Proxy (${latency}ms)`,
            data: parsed || undefined,
          };
        }
      } catch {
        // Try next
      }
    }

    // 3. Check if ESP32 has pushed data to the server ingestion endpoint
    try {
      const res = await this.fetchWithTimeout('/api/esp32/latest', { method: 'GET' }, 1500);
      if (res.ok) {
        const json = await res.json();
        if (json.isOnline && json.data) {
          return {
            success: true,
            endpoint: '/api/esp32/push',
            message: 'Connected via ESP32 Direct Cloud Push!',
            data: json.data,
          };
        }
      }
    } catch {
      // Ignore
    }

    return {
      success: false,
      isMixedContent: isLocalHttp,
      message: isLocalHttp
        ? 'Browser Mixed Content Block: Browser blocks local HTTP IPs from HTTPS cloud pages.'
        : 'Cannot reach ESP32 at specified address.',
    };
  }

  /**
   * Main polling method for live data
   */
  public async getLatest(): Promise<{ data: PestDetection; status: ESP32Status }> {
    // Priority 1: Serial USB connection active
    if (this.isSerialOpen) {
      const current = this.serialDetection || {
        id: 'ser-live',
        detected: false,
        pest: null,
        confidence: 0,
        timestamp: new Date().toISOString(),
        db_level: 38.0,
        frequency_hz: 300,
        device_id: 'ESP32-USB-SERIAL',
        battery_v: 4.12,
        acknowledged: false,
      };

      return {
        data: current,
        status: {
          ipAddress: 'USB Serial (115200 baud)',
          isOnline: true,
          isSimulated: false,
          lastSuccessfulPing: new Date().toISOString(),
          errorMessage: null,
          isPolling: true,
          batteryVoltage: 4.12,
          micNoiseFloorDb: current.db_level,
        },
      };
    }

    // Priority 2: Simulation Mode
    if (this.isSimulated) {
      const current = this.simulatedActiveDetection || {
        id: 'det-clear',
        detected: false,
        pest: null,
        confidence: 0,
        timestamp: new Date().toISOString(),
        db_level: 34.0,
        frequency_hz: 400,
        device_id: 'ESP32-TEST',
        battery_v: 4.12,
        acknowledged: false,
      };

      return {
        data: current,
        status: {
          ipAddress: this.ipAddress,
          isOnline: true,
          isSimulated: true,
          lastSuccessfulPing: new Date().toISOString(),
          errorMessage: null,
          isPolling: true,
          batteryVoltage: 4.12,
          micNoiseFloorDb: current.db_level,
        },
      };
    }

    // Priority 3: Check Cloud Push Ingestion
    try {
      const pushRes = await this.fetchWithTimeout('/api/esp32/latest', { method: 'GET' }, 1200);
      if (pushRes.ok) {
        const pushJson = await pushRes.json();
        if (pushJson.isOnline && pushJson.data) {
          const parsed = this.parseRawData(pushJson.data, 'ESP32-PUSH');
          if (parsed) {
            return {
              data: parsed,
              status: {
                ipAddress: 'Cloud Push API',
                isOnline: true,
                isSimulated: false,
                lastSuccessfulPing: new Date().toISOString(),
                errorMessage: null,
                isPolling: true,
                batteryVoltage: parsed.battery_v || 4.12,
                micNoiseFloorDb: parsed.db_level,
              },
            };
          }
        }
      }
    } catch {
      // Continue to direct IP polling
    }

    // Priority 4: Direct or Proxy Network Polling
    const endpointsToTry = this.verifiedWorkingEndpoint
      ? [this.verifiedWorkingEndpoint, ...this.getCandidateEndpoints(this.ipAddress)]
      : this.getCandidateEndpoints(this.ipAddress);

    for (const endpoint of endpointsToTry) {
      try {
        const res = await this.fetchWithTimeout(endpoint, { method: 'GET', mode: 'cors' }, 1800);
        if (res.ok) {
          const text = await res.text();
          const parsed = this.parseRawData(text);
          if (parsed) {
            this.verifiedWorkingEndpoint = endpoint;
            return {
              data: parsed,
              status: {
                ipAddress: this.ipAddress,
                isOnline: true,
                isSimulated: false,
                lastSuccessfulPing: new Date().toISOString(),
                errorMessage: null,
                isPolling: true,
                batteryVoltage: parsed.battery_v || 4.10,
                micNoiseFloorDb: parsed.db_level,
              },
            };
          }
        }
      } catch {
        // Try proxy next if direct network fails
      }
    }

    // Priority 5: Fallback via Server Proxy
    for (const endpoint of endpointsToTry.slice(0, 2)) {
      try {
        const proxyUrl = `/api/esp32/proxy?target=${encodeURIComponent(endpoint)}`;
        const res = await this.fetchWithTimeout(proxyUrl, { method: 'GET' }, 2000);
        if (res.ok) {
          const text = await res.text();
          const parsed = this.parseRawData(text);
          if (parsed) {
            this.verifiedWorkingEndpoint = endpoint;
            return {
              data: parsed,
              status: {
                ipAddress: this.ipAddress,
                isOnline: true,
                isSimulated: false,
                lastSuccessfulPing: new Date().toISOString(),
                errorMessage: null,
                isPolling: true,
                batteryVoltage: parsed.battery_v || 4.10,
                micNoiseFloorDb: parsed.db_level,
              },
            };
          }
        }
      } catch {
        // Continue
      }
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    let errorNote = 'Cannot reach device';
    if (isHttps && this.ipAddress.startsWith('http://')) {
      errorNote = 'Browser Mixed Content Block: HTTPS page cannot fetch local HTTP endpoint directly without browser permission or standalone HTML.';
    }

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
        errorMessage: errorNote,
        isPolling: true,
        batteryVoltage: 0,
        micNoiseFloorDb: 0,
      },
    };
  }

  public async getHistory(): Promise<PestDetection[]> {
    if (this.isSimulated || this.isSerialOpen) {
      return [...this.history];
    }

    const endpoint = `${this.ipAddress}/api/history`;
    try {
      const res = await this.fetchWithTimeout(endpoint, { method: 'GET' }, 2500);
      if (!res.ok) throw new Error();
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

  public async acknowledgeDetection(detection: PestDetection): Promise<{ success: boolean; message: string }> {
    const archived: PestDetection = {
      ...detection,
      acknowledged: true,
    };
    this.history = [archived, ...this.history.filter((h) => h.id !== archived.id)];
    this.persistHistory();

    if (this.isSimulated) {
      this.simulatedActiveDetection = null;
      return { success: true, message: 'Detection acknowledged and moved to History.' };
    }

    if (this.isSerialOpen) {
      if (this.serialDetection) {
        this.serialDetection = { ...this.serialDetection, detected: false, pest: null };
      }
      return { success: true, message: 'Detection acknowledged and cleared on USB device.' };
    }

    // Try posting ACK to push endpoint
    try {
      await this.fetchWithTimeout('/api/esp32/ack', { method: 'POST' }, 1500);
    } catch {
      // Ignore
    }

    // Try posting ACK to hardware
    try {
      const endpoint = `${this.ipAddress}/api/ack`;
      await this.fetchWithTimeout(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: detection.id,
            pest: detection.pest,
            timestamp: detection.timestamp,
          }),
        },
        2000
      );
    } catch {
      // Handled in local history
    }

    return { success: true, message: 'Detection acknowledged and recorded in history.' };
  }

  public clearHistory() {
    this.history = [];
    this.persistHistory();
  }
}

export const esp32 = new ESP32Client();
