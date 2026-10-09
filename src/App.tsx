import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LiveStatusBar } from './components/LiveStatusBar';
import { RecentAlertBanner } from './components/RecentAlertBanner';
import { PestDetailView } from './components/PestDetailView';
import { HistoryView } from './components/HistoryView';
import { PestGuideCatalog } from './components/PestGuideCatalog';
import { SettingsModal } from './components/SettingsModal';
import { AgriLogo } from './components/AgriLogo';
import { esp32 } from './utils/esp32Client';
import { soundAlert } from './utils/audioAlert';
import { STANDALONE_HTML } from './data/standaloneHtml';
import { PestDetection, ESP32Status } from './types';
import {
  History,
  BookOpen,
  ArrowRight,
  Sparkles,
  Bug,
  Cpu,
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'detail' | 'history' | 'catalog'>('home');
  const [selectedPestForDetail, setSelectedPestForDetail] = useState<string>('Mole Cricket');
  const [currentDetection, setCurrentDetection] = useState<PestDetection | null>(null);
  const [history, setHistory] = useState<PestDetection[]>([]);
  const [espStatus, setEspStatus] = useState<ESP32Status>({
    ipAddress: esp32.getIpAddress(),
    isOnline: false,
    isSimulated: false,
    lastSuccessfulPing: null,
    errorMessage: null,
    isPolling: true,
    batteryVoltage: 0,
    micNoiseFloorDb: 0,
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundAlert.getIsMuted());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAcknowledging, setIsAcknowledging] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevDetectedRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Fetch initial history from real device / local storage
  const loadHistory = useCallback(async () => {
    try {
      const records = await esp32.getHistory();
      setHistory(records);
    } catch {
      // Ignored
    }
  }, []);

  // Polling loop: polls GET /api/latest on real ESP32 every 2 seconds
  const pollDevice = useCallback(async () => {
    try {
      const { data, status } = await esp32.getLatest();
      setCurrentDetection(data);
      setEspStatus(status);

      // Trigger sound alert only if genuine pest sound was detected by real ESP32
      if (data.detected && data.pest && !prevDetectedRef.current) {
        const isDragonfly = data.pest.toLowerCase().includes('dragon');
        soundAlert.playPestAlert(isDragonfly ? 'beneficial' : 'critical');
        showToast(isDragonfly
          ? `Beneficial Insect: ${data.pest} wing flutter detected in field (Do not spray)`
          : `Acoustic Alert: ${data.pest} detected! Check soil roots immediately.`);
      }
      prevDetectedRef.current = Boolean(data.detected && data.pest);
    } catch {
      // Handled in client
    }
  }, []);

  useEffect(() => {
    loadHistory();
    pollDevice();
    const pollInterval = setInterval(pollDevice, 2000);

    // Subscribe to live USB serial streaming events if user connects via USB
    const unsubscribeSerial = esp32.addSerialListener((detection) => {
      setCurrentDetection(detection);
      setEspStatus({
        ipAddress: 'USB Serial (115200 baud)',
        isOnline: true,
        isSimulated: false,
        lastSuccessfulPing: new Date().toISOString(),
        errorMessage: null,
        isPolling: true,
        batteryVoltage: detection.battery_v || 4.12,
        micNoiseFloorDb: detection.db_level,
      });

      if (detection.detected && detection.pest && !prevDetectedRef.current) {
        const isDragonfly = detection.pest.toLowerCase().includes('dragon');
        soundAlert.playPestAlert(isDragonfly ? 'beneficial' : 'critical');
        showToast(
          isDragonfly
            ? `Beneficial Insect: ${detection.pest} detected via USB`
            : `Acoustic Alert: ${detection.pest} detected via USB!`
        );
      }
      prevDetectedRef.current = Boolean(detection.detected && detection.pest);
    });

    return () => {
      clearInterval(pollInterval);
      unsubscribeSerial();
    };
  }, [loadHistory, pollDevice]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextState = soundAlert.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      soundAlert.playTestBeep();
      showToast('Sound alerts enabled');
    } else {
      showToast('Sound alerts muted');
    }
  };

  // Open detail view for a specific pest
  const handleViewPestDetails = (pestName: string) => {
    setSelectedPestForDetail(pestName);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Acknowledge recent detection (calls POST /api/ack on ESP32)
  const handleAcknowledgeAndBack = async () => {
    if (!currentDetection) {
      setCurrentView('home');
      return;
    }

    setIsAcknowledging(true);
    try {
      const res = await esp32.acknowledgeDetection(currentDetection);
      showToast(res.message);
      await loadHistory();
      await pollDevice();
      setCurrentView('home');
    } catch (err: unknown) {
      showToast('Acknowledged.');
      setCurrentView('home');
    } finally {
      setIsAcknowledging(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // IP configuration update
  const handleUpdateIp = (newIp: string) => {
    esp32.setIpAddress(newIp);
    setEspStatus((prev) => ({ ...prev, ipAddress: newIp }));
    pollDevice();
    showToast(`Target ESP32 IP set to ${newIp}`);
  };

  const handleTriggerTestPest = (pestName: 'Mole Cricket' | 'Dragonfly') => {
    esp32.setSimulationMode(true);
    esp32.triggerTestPest(pestName, 95);
    if (pestName === 'Dragonfly') {
      soundAlert.playPestAlert('beneficial');
      showToast('Acoustic Match: Dragonfly beneficial wing flutter (240 Hz)');
    } else {
      soundAlert.playPestAlert('high');
      showToast('Acoustic Match: Mole Cricket subterranean vibration (2,180 Hz)');
    }
    pollDevice();
  };

  const handleClearTestMode = () => {
    esp32.clearTestPest();
    esp32.setSimulationMode(false);
    showToast('Resumed live ESP32 microphone surveillance');
    pollDevice();
  };

  // Add demo data handler
  const handleAddDemoData = () => {
    const updatedHistory = esp32.seedDemoData();
    setHistory([...updatedHistory]);
    soundAlert.playPestAlert('high');
    showToast('Demo data added: Sample field incidents & active Mole Cricket alert loaded!');
    pollDevice();
  };

  // Clear history logs
  const handleClearHistory = () => {
    esp32.clearHistory();
    setHistory([]);
    showToast('Incident history cleared');
  };

  const hasActiveAlert = Boolean(currentDetection && currentDetection.detected && currentDetection.pest);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        status={espStatus}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddDemoData={handleAddDemoData}
        hasActiveAlert={hasActiveAlert}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main App Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Connection status bar (Displays when waiting for ESP32 on WiFi) */}
        <LiveStatusBar
          status={espStatus}
          currentDetection={currentDetection}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRetryConnection={pollDevice}
          onAddDemoData={handleAddDemoData}
          onConnectUsb={() => setIsSettingsOpen(true)}
        />

        {/* VIEW 1: HOME DASHBOARD */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Recent Detection Banner (Urgent Amber/Red when genuine pest detected, Calm Green when clear) */}
            <RecentAlertBanner
              detection={currentDetection}
              onViewDetails={handleViewPestDetails}
            />

            {/* Quick Action Card for Farmers */}
            <div
              onClick={() => setCurrentView('catalog')}
              className="bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Pest Treatment & Dosage Guide
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Recommended sprays, organic alternatives, and safety precautions
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Detection History Preview Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-emerald-700" />
                    Detection History
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acoustic incidents detected by your ESP32 INMP441 sensor and acknowledged by the farmer.
                  </p>
                </div>

                {history.length > 0 && (
                  <button
                    onClick={() => setCurrentView('history')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({history.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No previous pest sound detections recorded. Real detections from the ESP32 will automatically appear here once acknowledged.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.slice(0, 3).map((item, idx) => {
                    const timeStr = new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const dateStr = new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={item.id || idx}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <Bug className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.pest}
                              </span>
                              <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded tabular-nums">
                                {item.confidence}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                              {item.remedy || 'Treatment applied'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto">
                          <span className="text-xs font-mono text-slate-400 tabular-nums">
                            {dateStr} · {timeStr}
                          </span>
                          <button
                            onClick={() => handleViewPestDetails(item.pest || 'Mole Cricket')}
                            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Guide
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: PEST DETAIL VIEW */}
        {currentView === 'detail' && (
          <PestDetailView
            pestName={selectedPestForDetail}
            detection={currentDetection}
            onAcknowledgeAndBack={handleAcknowledgeAndBack}
            onBackWithoutAck={() => setCurrentView('home')}
            isAcknowledging={isAcknowledging}
          />
        )}

        {/* VIEW 3: FULL INCIDENT HISTORY */}
        {currentView === 'history' && (
          <HistoryView
            history={history}
            onSelectPest={handleViewPestDetails}
            onClearHistory={handleClearHistory}
            onRefreshHistory={loadHistory}
            onAddDemoData={handleAddDemoData}
          />
        )}

        {/* VIEW 4: TREATMENT GUIDE CATALOG */}
        {currentView === 'catalog' && (
          <PestGuideCatalog onSelectPest={handleViewPestDetails} />
        )}
      </main>

      {/* Settings & Hardware Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={espStatus}
        onUpdateIp={handleUpdateIp}
        onTriggerTestPest={handleTriggerTestPest}
        onClearTestMode={handleClearTestMode}
        isTestMode={espStatus.isSimulated}
        standaloneHtmlCode={STANDALONE_HTML}
        onAddDemoData={handleAddDemoData}
        onDetectionReceived={(det) => {
          setCurrentDetection(det);
          setEspStatus((prev) => ({
            ...prev,
            isOnline: true,
            lastSuccessfulPing: new Date().toISOString(),
          }));
        }}
      />

      {/* Professional Vertical Agricultural Tech Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 mt-16 text-slate-600 text-xs">
        <div className="max-w-2xl mx-auto px-4 flex flex-col items-center text-center space-y-4">
          {/* Brand & Bio-Acoustic Title */}
          <div className="flex items-center gap-2.5">
            <AgriLogo className="w-8 h-8" size={32} />
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              AI Pest Detector
            </span>
          </div>

          {/* Mission & Purpose */}
          <p className="text-slate-500 leading-relaxed text-xs max-w-md">
            Real-time bio-acoustic field surveillance protecting crop yields through smart microphone frequency recognition and ESP32 IoT sensors.
          </p>

          {/* Sensor & Hardware Indicators */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sensors Active
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Cpu className="w-3 h-3 text-slate-500" />
              ESP32 I2S
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              INMP441 Microphone
            </span>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-slate-200 my-1"></div>

          {/* Copyright & Technical Edge Specs */}
          <div className="flex flex-col items-center space-y-1.5 text-[11px] text-slate-400">
            <div>
              <span>&copy; {new Date().getFullYear()} AI Pest Detector. Smart Agricultural IoT System.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500">
              <span>ESP32 WiFi Connected</span>
              <span>•</span>
              <span>Autonomous Edge Detection</span>
              <span>•</span>
              <span>Dragonfly & Mole Cricket Acoustics</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
