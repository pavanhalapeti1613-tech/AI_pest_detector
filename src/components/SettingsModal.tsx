import React, { useState } from 'react';
import {
  X,
  Sliders,
  Code,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Wifi,
  FileCode,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ESP32Status } from '../types';
import { ESP32_ARDUINO_SKETCH } from '../data/esp32ArduinoCode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ESP32Status;
  onUpdateIp: (ip: string) => void;
  onTriggerTestPest?: (pest: 'Mole Cricket' | 'Dragonfly') => void;
  onClearTestMode?: () => void;
  isTestMode?: boolean;
  standaloneHtmlCode: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onUpdateIp,
  onTriggerTestPest,
  onClearTestMode,
  isTestMode = false,
  standaloneHtmlCode,
}) => {
  const [ipInput, setIpInput] = useState(status.ipAddress);
  const [activeTab, setActiveTab] = useState<'connection' | 'arduino' | 'esp32code' | 'help'>('connection');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedArduino, setCopiedArduino] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    isMixedContent?: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

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
      const id = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        setPingResult({ success: true, message: `Connected to ESP32! HTTP ${res.status} OK` });
      } else {
        setPingResult({ success: false, message: `Device responded with HTTP ${res.status}` });
      }
    } catch (err: unknown) {
      if (isHttps && targetIp.startsWith('http://')) {
        setPingResult({
          success: false,
          isMixedContent: true,
          message:
            'Browser Blocked Request (Mixed Content): Modern browsers block secure HTTPS websites from fetching local HTTP IP addresses directly without site permissions or local hosting.',
        });
      } else {
        setPingResult({
          success: false,
          isMixedContent: false,
          message: 'Could not connect. Ensure your ESP32 is powered on and connected to this WiFi network.',
        });
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyArduino = () => {
    navigator.clipboard.writeText(ESP32_ARDUINO_SKETCH);
    setCopiedArduino(true);
    setTimeout(() => setCopiedArduino(false), 2000);
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
              <h2 className="text-lg font-bold text-slate-900">ESP32 Hardware & Connection</h2>
              <p className="text-xs text-slate-500 font-medium">WiFi IP, Browser Security & Arduino Code</p>
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
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'connection'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            WiFi & IP Setup
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'help'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Fix Connection Error
          </button>
          <button
            onClick={() => setActiveTab('arduino')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'arduino'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Arduino ESP32 Sketch
          </button>
          <button
            onClick={() => setActiveTab('esp32code')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'esp32code'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            LittleFS index.html
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: WiFi & IP Setup */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              {/* Mixed Content Warning Alert (Shown if on HTTPS) */}
              {isHttps && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    Important: Browser Mixed Content Note
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Because this preview runs over <strong>HTTPS</strong>, web browsers block requests to local <strong>HTTP</strong> IPs (<code className="bg-amber-100 px-1 rounded font-mono">{status.ipAddress}</code>) unless you allow insecure content or use the standalone HTML.
                  </p>
                  <button
                    onClick={() => setActiveTab('help')}
                    className="text-amber-900 font-bold underline cursor-pointer mt-1 block"
                  >
                    View 3 Simple Solutions to Connect &rarr;
                  </button>
                </div>
              )}

              {/* IP Input Form */}
              <form onSubmit={handleSaveIp} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ESP32 IP Address
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
                    Save & Ping
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Default: <code className="font-mono text-slate-700 font-semibold">{status.ipAddress}</code>. The app polls <code className="font-mono text-slate-700 font-semibold">GET /api/latest</code> every 2 seconds.
                </p>
              </form>

              {/* Ping Result */}
              {isPinging && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 p-3 rounded-xl">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Testing connection to {ipInput}...</span>
                </div>
              )}

              {pingResult && !isPinging && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium space-y-1.5 ${
                    pingResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {pingResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block text-sm">
                        {pingResult.success ? 'ESP32 Connected!' : 'Connection Notice'}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{pingResult.message}</p>
                    </div>
                  </div>

                  {pingResult.isMixedContent && (
                    <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                      <span className="text-[11px] text-amber-800">
                        Browser blocked local HTTP call from HTTPS.
                      </span>
                      <button
                        onClick={() => setActiveTab('help')}
                        className="font-bold text-emerald-800 bg-white border border-amber-300 px-2.5 py-1 rounded text-xs hover:bg-amber-100"
                      >
                        How to Fix &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Acoustic Detection Test Panel (Only Mole Cricket & Dragonfly) */}
              {onTriggerTestPest && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                        Acoustic Detection Simulation
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Test system response with calibrated pest sound profiles
                      </span>
                    </div>
                    {isTestMode && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
                        Simulating
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onTriggerTestPest('Mole Cricket')}
                      className="p-2.5 bg-white border border-rose-200 hover:border-rose-400 rounded-xl font-bold text-rose-950 hover:bg-rose-50 flex flex-col items-start gap-0.5 transition-colors cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        <span className="font-extrabold">Mole Cricket</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Underground burrow stridulation (2.1 kHz)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onTriggerTestPest('Dragonfly')}
                      className="p-2.5 bg-white border border-emerald-200 hover:border-emerald-400 rounded-xl font-bold text-emerald-950 hover:bg-emerald-50 flex flex-col items-start gap-0.5 transition-colors cursor-pointer text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="font-extrabold">Dragonfly</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Beneficial wing flutter (240 Hz)
                      </span>
                    </button>
                  </div>

                  {isTestMode && onClearTestMode && (
                    <button
                      type="button"
                      onClick={onClearTestMode}
                      className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Set Field Clear (Resume Live Listening)</span>
                    </button>
                  )}
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
              </div>
            </div>
          )}

          {/* TAB 2: Fix Connection Error (Browser Mixed Content Guide) */}
          {activeTab === 'help' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  Why is it showing this error with the correct IP?
                </h3>
                <p className="text-amber-900">
                  This application is currently running on a secure cloud URL starting with <strong>HTTPS</strong>. For security, modern web browsers (Chrome, Edge, Safari) automatically block web pages from directly calling unencrypted local IP addresses (like <code className="bg-amber-100 px-1 rounded font-mono">http://192.168.1.50</code>).
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm pt-1">
                Choose One of These 3 Solutions:
              </h4>

              {/* Solution 1 */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 text-sm">
                    Option 1 (Recommended): Run Standalone HTML
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    EASIEST & ZERO-RESTRICTION
                  </span>
                </div>
                <p className="text-emerald-900">
                  Download the self-contained single-file HTML and open it directly from your computer or upload it to your ESP32’s LittleFS storage. When opened locally, there is <strong>NO HTTPS Mixed-Content block</strong>!
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleDownloadStandaloneHtml}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    Download index.html for Local / ESP32 Use
                  </button>
                </div>
              </div>

              {/* Solution 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">
                  Option 2: Allow Insecure Content in Your Browser (10 Seconds)
                </span>
                <p className="text-slate-600">
                  If you want to keep viewing this cloud dashboard:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700 font-medium">
                  <li>Click the <strong>Lock / Settings icon 🔒</strong> to the left of the URL address bar.</li>
                  <li>Click <strong>Site settings</strong>.</li>
                  <li>Scroll to <strong>Insecure content</strong> and change from <em>Block</em> to <strong>Allow</strong>.</li>
                  <li>Reload this page. The browser will now allow connecting to <code className="font-mono font-bold text-slate-900">http://192.168.1.50</code>!</li>
                </ol>
              </div>

              {/* Solution 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">
                  Option 3: Enable CORS on your ESP32 Code
                </span>
                <p className="text-slate-600">
                  Ensure your ESP32 Arduino sketch has CORS headers enabled in the HTTP response.
                </p>
                <pre className="bg-slate-900 text-slate-100 p-2.5 rounded text-[11px] font-mono overflow-x-auto">
                  <code>{`server.enableCORS(true); // Call in setup()`}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Full Arduino Sketch */}
          {activeTab === 'arduino' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
                <span className="font-bold block mb-1">Production-Ready ESP32 Firmware:</span>
                This Arduino C++ sketch connects to WiFi, configures the INMP441 I2S microphone, and provides the REST endpoints (<code className="font-mono">/api/latest</code>, <code className="font-mono">/api/history</code>, <code className="font-mono">/api/ack</code>) with CORS headers enabled!
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyArduino}
                  className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedArduino ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedArduino ? 'Copied Arduino Sketch!' : 'Copy Arduino Sketch (.ino)'}
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono max-h-72 overflow-y-auto leading-relaxed">
                <code>{ESP32_ARDUINO_SKETCH}</code>
              </pre>
            </div>
          )}

          {/* TAB 4: LittleFS HTML */}
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

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto leading-relaxed">
                <code>{standaloneHtmlCode.slice(0, 1200)}...</code>
              </pre>
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
