import React from 'react';
import { History as HistoryIcon, Home, BookOpen } from 'lucide-react';
import { ESP32Status } from '../types';

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
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              {/* Clean agricultural sprout + acoustic soundwave icon */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12A10 10 0 0 1 12 2Z" fill="currentColor" fillOpacity="0.15" />
                <path d="M12 18v-7" />
                <path d="M9 13c1.5-2 3-2 3-2s1.5 0 3 2" />
                <path d="M7 16c2.5-3.5 5-3.5 5-3.5s2.5 0 5 3.5" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                AgriSound
                {hasActiveAlert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Active pest alert" />
                )}
              </span>
              <span className="block text-xs font-medium text-slate-500 -mt-0.5">ESP32 Acoustic Field Monitor</span>
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
