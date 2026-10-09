import React from 'react';
import { History as HistoryIcon, Home, BookOpen } from 'lucide-react';
import { ESP32Status } from '../types';
import { AgriLogo } from './AgriLogo';

interface HeaderProps {
  currentView: 'home' | 'detail' | 'history' | 'catalog';
  onNavigate: (view: 'home' | 'history' | 'catalog') => void;
  status?: ESP32Status;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenSettings?: () => void;
  hasActiveAlert: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  hasActiveAlert,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Zone 1: Agricultural Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            <div className="relative transition-transform duration-200 group-hover:scale-105">
              <AgriLogo className="w-10 h-10 drop-shadow-xs" />
              {hasActiveAlert && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-white animate-ping"
                  title="Active pest detected"
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  AI Pest Detector
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wide uppercase">
                  Agri-IoT
                </span>
              </div>
              <span className="block text-xs font-medium text-slate-500 -mt-0.5">
                ESP32 Smart Acoustic Crop Shield
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'home'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            Field Monitor
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'history'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            Incident History
          </button>

          <button
            onClick={() => onNavigate('catalog')}
            className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentView === 'catalog'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Treatment Guide
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex-1 py-1.5 text-xs font-semibold text-center rounded-md ${
            currentView === 'home' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Monitor
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`flex-1 py-1.5 text-xs font-semibold text-center rounded-md ${
            currentView === 'history' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          History
        </button>
        <button
          onClick={() => onNavigate('catalog')}
          className={`flex-1 py-1.5 text-xs font-semibold text-center rounded-md ${
            currentView === 'catalog' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
          }`}
        >
          Pest Guide
        </button>
      </div>
    </header>
  );
};
