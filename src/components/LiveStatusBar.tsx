import React from 'react';
import { Wifi, RefreshCw, Settings, Sparkles, Usb } from 'lucide-react';
import { ESP32Status, PestDetection } from '../types';

interface LiveStatusBarProps {
  status: ESP32Status;
  currentDetection?: PestDetection | null;
  onOpenSettings?: () => void;
  onRetryConnection: () => void;
  onEnableSimulation?: () => void;
  onAddDemoData?: () => void;
  onConnectUsb?: () => void;
}

export const LiveStatusBar: React.FC<LiveStatusBarProps> = ({
  status,
  onOpenSettings,
  onRetryConnection,
  onAddDemoData,
  onConnectUsb,
}) => {
  if (status.isOnline) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800">
            ESP32 Sensor Active & Connected
          </span>
          <span className="text-slate-500 hidden sm:inline">
            · Continuous bio-acoustic surveillance ({status.ipAddress})
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
        >
          Manage Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Waiting for ESP32 Connection Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Wifi className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-amber-900">
              Ready for ESP32 Connection
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
              Listening for acoustic sensor at <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-semibold text-amber-900">{status.ipAddress}</code>.
              Connect via WiFi IP, direct USB cable, or ESP32 Cloud Push.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:flex-initial shrink-0">
          {onConnectUsb && (
            <button
              onClick={onConnectUsb}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Usb className="w-3.5 h-3.5" />
              Connect USB
            </button>
          )}
          <button
            onClick={onRetryConnection}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check IP
          </button>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold bg-amber-700 text-white rounded-lg hover:bg-amber-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Configure IP
            </button>
          )}
          {onAddDemoData && (
            <button
              onClick={onAddDemoData}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Add Demo Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
