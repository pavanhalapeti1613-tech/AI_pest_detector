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
  ShieldAlert,
  Sparkles,
  Usb,
} from 'lucide-react';
import { ESP32Status, PestDetection } from '../types';
import { ESP32_ARDUINO_SKETCH } from '../data/esp32ArduinoCode';
import { esp32 } from '../utils/esp32Client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ESP32Status;
  onUpdateIp: (ip: string) => void;
  onTriggerTestPest?: (pest: 'Mole Cricket' | 'Dragonfly') => void;
  onClearTestMode?: () => void;
  isTestMode?: boolean;
  standaloneHtmlCode: string;
  onAddDemoData?: () => void;
  onDetectionReceived?: (data: PestDetection) => void;
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
  onAddDemoData,
  onDetectionReceived,
}) => {
  const [ipInput, setIpInput] = useState(status.ipAddress);
  const [activeTab, setActiveTab] = useState<'connection' | 'usb' | 'arduino' | 'esp32code' | 'help'>('connection');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedArduino, setCopiedArduino] = useState(false);
  const [copiedPushUrl, setCopiedPushUrl] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isSerialConnecting, setIsSerialConnecting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    isMixedContent?: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const pushUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/esp32/push` : '/api/esp32/push';
  const isSerialConnected = esp32.isSerialConnected();
  const isOnline = status.isOnline || isSerialConnected || (pingResult?.success ?? false);

  const handleSaveIp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = esp32.normalizeIp(ipInput);
    setIpInput(cleanIp);
    onUpdateIp(cleanIp);
    await testPing(cleanIp);
  };

  const testPing = async (targetIp: string) => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const result = await esp32.testConnection(targetIp);
      if (result.success) {
        setPingResult({ success: true, message: 'Connected' });
        if (result.data && onDetectionReceived) {
          onDetectionReceived(result.data);
        }
      } else {
        setPingResult({
          success: false,
          isMixedContent: result.isMixedContent,
          message: 'Not Connected',
        });
      }
    } catch {
      setPingResult({
        success: false,
        isMixedContent: Boolean(isHttps && targetIp.startsWith('http://')),
        message: 'Not Connected',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleConnectSerial = async () => {
    setIsSerialConnecting(true);
    try {
      const res = await esp32.connectSerial();
      if (res.success) {
        setPingResult({ success: true, message: 'Connected' });
        if (onDetectionReceived) {
          esp32.addSerialListener((det) => onDetectionReceived(det));
        }
      } else {
        setPingResult({ success: false, message: 'Not Connected' });
      }
    } catch {
      setPingResult({ success: false, message: 'Not Connected' });
    } finally {
      setIsSerialConnecting(false);
    }
  };

  const handleDisconnectSerial = async () => {
    await esp32.disconnectSerial();
    setPingResult(null);
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

  const handleCopyPushUrl = () => {
    navigator.clipboard.writeText(pushUrl);
    setCopiedPushUrl(true);
    setTimeout(() => setCopiedPushUrl(false), 2000);
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
              <p className="text-xs text-slate-500 font-medium">WiFi IP, Direct USB Serial & Arduino Code</p>
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
            onClick={() => setActiveTab('usb')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'usb'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Usb className="w-3.5 h-3.5 text-blue-600" />
            USB Cable (Instant)
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
              {isHttps && !isOnline && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    Connecting to local WiFi ESP32
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    If this cloud dashboard cannot reach local IP <code className="bg-amber-100 px-1 rounded font-mono font-semibold">{status.ipAddress}</code> directly due to browser mixed-content restrictions, you can connect via <strong>USB Cable</strong> (zero network issues) or download the standalone HTML.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('usb')}
                      className="text-blue-800 font-bold underline cursor-pointer"
                    >
                      Use USB Cable (Instant) &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('help')}
                      className="text-amber-900 font-bold underline cursor-pointer"
                    >
                      Troubleshooting Guide &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* IP Input Form */}
              <form onSubmit={handleSaveIp} className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ESP32 Target IP or Local Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    placeholder="192.168.1.50 or http://192.168.1.50"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:outline-emerald-600 focus:bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={isPinging}
                    className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-sm rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer shrink-0 flex items-center gap-2"
                  >
                    {isPinging ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                    <span>Save & Connect</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Target: <code className="font-mono text-slate-700 font-semibold">{status.ipAddress}</code>. The app checks candidate endpoints (<code className="font-mono">/api/latest</code>, <code className="font-mono">/latest</code>, <code className="font-mono">/data</code>, <code className="font-mono">/</code>) automatically.
                </p>
              </form>

              {/* Ping in progress */}
              {isPinging && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 p-3 rounded-xl">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Testing connection across endpoints to {ipInput}...</span>
                </div>
              )}

              {/* Single Connection Status Message Box (White text, only shows connected or not connected) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isOnline ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span className="font-bold text-white text-sm">
                    {isOnline ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isOnline && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('usb')}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Usb className="w-3 h-3 text-blue-400" />
                      <span>Try USB</span>
                    </button>
                  )}
                  {onAddDemoData && (
                    <button
                      type="button"
                      onClick={() => {
                        onAddDemoData();
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span>Add Demo Data</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cloud Ingestion Push Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    ESP32 Direct Cloud Push Webhook
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPushUrl}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPushUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPushUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Your ESP32 can send detections directly via HTTP POST to this endpoint from any WiFi or SIM card hotspot without any router port forwarding:
                </p>
                <div className="bg-white border border-slate-300 p-2 rounded-lg font-mono text-[11px] text-slate-800 truncate select-all">
                  {pushUrl}
                </div>
              </div>

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
            </div>
          )}

          {/* TAB 2: USB Cable Direct Serial */}
          {activeTab === 'usb' && (
            <div className="space-y-4 text-xs">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                    <Usb className="w-4 h-4 text-blue-700" />
                    Direct USB Connection (Web Serial API)
                  </span>
                  <span className="bg-blue-200 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    100% RELIABLE & ZERO SETUP
                  </span>
                </div>
                <p className="text-blue-900 leading-relaxed">
                  Connect your ESP32 board directly to your computer using a USB data cable. The browser will read real-time bio-acoustic telemetry straight from the microcontroller serial stream at 115200 baud with zero WiFi configuration, no IP needed, and no browser mixed-content restrictions!
                </p>

                <div className="pt-2 flex items-center gap-3">
                  {!isSerialConnected ? (
                    <button
                      type="button"
                      onClick={handleConnectSerial}
                      disabled={isSerialConnecting}
                      className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                    >
                      {isSerialConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Usb className="w-4 h-4" />}
                      <span>Select USB Port & Connect</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected via USB (115200 baud)
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectSerial}
                        className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold cursor-pointer transition-colors"
                      >
                        Disconnect USB
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  How USB Streaming Works
                </span>
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 font-medium">
                  <li>Plug your ESP32 into any USB port on your PC or Mac.</li>
                  <li>Click <strong>Select USB Port & Connect</strong> above.</li>
                  <li>Select your ESP32 device in the browser prompt (usually labelled CP2102, CH340, or USB JTAG).</li>
                  <li>The dashboard immediately streams acoustic data and alerts in real-time!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Fix Connection Error (Browser Mixed Content Guide) */}
          {activeTab === 'help' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
                <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  Why does an IP show "Not Connected"?
                </h3>
                <p className="text-amber-900">
                  This dashboard is hosted on a secure cloud address starting with <strong>HTTPS</strong>. For safety, modern web browsers prevent web pages from silently contacting unencrypted private local network IPs (<code className="bg-amber-100 px-1 rounded font-mono font-bold text-amber-950">http://192.168.x.x</code>).
                </p>
              </div>

              <h4 className="font-bold text-slate-900 text-sm pt-1">
                3 Instant Solutions to Connect:
              </h4>

              {/* Solution 1 */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-emerald-950 text-sm">
                    Option 1: Direct USB Cable (Easiest)
                  </span>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-emerald-900">
                  Switch to the <strong>USB Cable (Instant)</strong> tab and connect your board with a USB cord. It works 100% reliably in Chrome and Edge with no WiFi setup needed!
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('usb')}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Usb className="w-4 h-4" />
                    Open USB Cable Connection
                  </button>
                </div>
              </div>

              {/* Solution 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="font-bold text-slate-900 text-sm block">
                  Option 2: Standalone Local HTML (No HTTPS restrictions)
                </span>
                <p className="text-slate-600">
                  Download the self-contained single-file HTML and open it directly from your computer:
                </p>
                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Download index.html for Local Use
                </button>
              </div>

              {/* Solution 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <span className="font-bold text-slate-900 text-sm block">
                  Option 3: Allow Insecure Content in Chrome / Edge (10 Seconds)
                </span>
                <ol className="list-decimal pl-5 space-y-1 text-slate-700 font-medium">
                  <li>Click the <strong>Lock / Sliders icon</strong> to the left of the URL address bar.</li>
                  <li>Click <strong>Site settings</strong>.</li>
                  <li>Scroll to <strong>Insecure content</strong> and change from <em>Block</em> to <strong>Allow</strong>.</li>
                  <li>Reload this page. The browser will now allow connecting to your local ESP32 IP!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: Full Arduino Sketch */}
          {activeTab === 'arduino' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
                <span className="font-bold block mb-1">Production-Ready ESP32 Firmware:</span>
                This sketch configures the INMP441 I2S microphone, provides local REST endpoints with CORS headers, streams to USB serial at 115200 baud, and supports optional cloud push!
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

          {/* TAB 5: LittleFS HTML */}
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
