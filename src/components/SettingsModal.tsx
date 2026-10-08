import React, { useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  Code,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Wifi,
} from 'lucide-react';
import { ESP32Status } from '../types';
import { soundAlert } from '../utils/audioAlert';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ESP32Status;
  onUpdateIp: (ip: string) => void;
  standaloneHtmlCode: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onUpdateIp,
  standaloneHtmlCode,
}) => {
  const [ipInput, setIpInput] = useState(status.ipAddress);
  const [activeTab, setActiveTab] = useState<'connection' | 'audio' | 'esp32code'>('connection');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveIp = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIp(ipInput);
    testPing(ipInput);
  };

  const testPing = async (targetIp: string) => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const url = targetIp.replace(/\/+$/, '') + '/api/latest';
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        setPingResult({ success: true, message: `Connected! HTTP ${res.status} OK` });
      } else {
        setPingResult({ success: false, message: `Device responded with error HTTP ${res.status}` });
      }
    } catch (err: unknown) {
      setPingResult({
        success: false,
        message: 'Could not connect. Ensure your ESP32 is powered on and connected to the same WiFi network.',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadStandaloneHtml = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ESP32 & Sensor Configuration</h2>
              <p className="text-xs text-slate-500 font-medium">INMP441 Acoustic Hardware & Connection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            WiFi & IP Connection
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audio'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Audio Alerts
          </button>
          <button
            onClick={() => setActiveTab('esp32code')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'esp32code'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            ESP32 LittleFS Firmware
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: WiFi & IP Connection */}
          {activeTab === 'connection' && (
            <div className="space-y-5">
              {/* IP Input Form */}
              <form onSubmit={handleSaveIp} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ESP32 Microcontroller IP Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="http://192.168.1.50"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:outline-emerald-600 focus:bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
                  >
                    Save & Test
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Target address: <code className="font-mono text-slate-700 font-semibold">{status.ipAddress}</code>. The app automatically polls <code className="font-mono text-slate-700 font-semibold">GET /api/latest</code> every 2 seconds.
                </p>
              </form>

              {/* Ping Result */}
              {isPinging && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 p-3 rounded-xl">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Checking connection to ESP32 at {ipInput}...</span>
                </div>
              )}

              {pingResult && !isPinging && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                    pingResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {pingResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{pingResult.success ? 'ESP32 Connected' : 'Connection Status'}</span>
                    <span>{pingResult.message}</span>
                  </div>
                </div>
              )}

              {/* Hardware Spec Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
                <div className="font-bold text-slate-900 text-sm">INMP441 Microphone Pinout:</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-white p-2 rounded border">SCK &rarr; GPIO 14</div>
                  <div className="bg-white p-2 rounded border">WS / LRCK &rarr; GPIO 15</div>
                  <div className="bg-white p-2 rounded border">SD &rarr; GPIO 32</div>
                  <div className="bg-white p-2 rounded border">VDD &rarr; 3.3V / L/R &rarr; GND</div>
                </div>
                <div className="pt-2 text-slate-500">
                  <span className="font-semibold text-slate-700">Required Endpoints:</span>
                  <div className="font-mono mt-1 space-y-0.5">
                    <div>· <code className="text-emerald-700 font-bold">GET /api/latest</code> &rarr; returns {"{ detected, pest, confidence, timestamp }"}</div>
                    <div>· <code className="text-emerald-700 font-bold">GET /api/history</code> &rarr; returns array of past events</div>
                    <div>· <code className="text-emerald-700 font-bold">POST /api/ack</code> &rarr; acknowledges and archives alert</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Audio Alerts */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Acoustic Sound Alert Test
                </span>
                <p className="text-xs text-slate-600">
                  When the INMP441 microphone identifies a genuine pest sound, AgriSound plays a gentle acoustic chime so farmers working out in the field do not miss urgent infestations.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => soundAlert.playTestBeep()}
                    className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Play Test Alert Beep
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Standalone LittleFS HTML */}
          {activeTab === 'esp32code' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
                <span className="font-bold text-sm block mb-1">
                  Single-File HTML5 for ESP32 LittleFS / SPIFFS
                </span>
                Save this single-file HTML directly as <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold">index.html</code> in your ESP32 Arduino sketch's <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-semibold">data/</code> directory and upload it using LittleFS! It connects directly to the microcontroller with zero dependencies.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download index.html for ESP32
                </button>

                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied to Clipboard!' : 'Copy HTML Code'}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto leading-relaxed">
                  <code>{standaloneHtmlCode.slice(0, 1200)}...</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
