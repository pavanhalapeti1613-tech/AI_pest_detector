import React from 'react';
import { Wifi, RefreshCw, Settings, Sparkles } from 'lucide-react';
import { ESP32Status, PestDetection } from '../types';

interface LiveStatusBarProps {
  status: ESP32Status;
  currentDetection?: PestDetection | null;
  onOpenSettings?: () => void;
  onRetryConnection: () => void;
  onEnableSimulation?: () => void;
  onAddDemoData?: () => void;
}

export const LiveStatusBar: React.FC<LiveStatusBarProps> = ({
  status,
  onOpenSettings,
  onRetryConnection,
  onAddDemoData,
}) => {
  if (status.isOnline) {
    return null;
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
              Listening for acoustic sensor at <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-semibold text-amber-900">{status.ipAddress}</code> (polling <code className="font-mono">/api/latest</code> every 2s).
              If the IP is correct, your browser may be blocking local HTTP calls from this HTTPS cloud page.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:flex-initial shrink-0">
          <button
            onClick={onRetryConnection}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Now
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
