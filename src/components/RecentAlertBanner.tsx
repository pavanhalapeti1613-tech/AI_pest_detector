import React from 'react';
import { ShieldCheck, ArrowRight, Activity, Bug } from 'lucide-react';
import { PestDetection } from '../types';

interface RecentAlertBannerProps {
  detection: PestDetection | null;
  onViewDetails: (pestName: string) => void;
}

export const RecentAlertBanner: React.FC<RecentAlertBannerProps> = ({
  detection,
  onViewDetails,
}) => {
  const isPestDetected = Boolean(detection && detection.detected && detection.pest);
  const pestName = detection?.pest || 'Unknown Pest';
  const confidence = detection?.confidence || 0;

  if (isPestDetected) {
    const isBeneficial = pestName.toLowerCase().includes('dragon');
    const isCritical = confidence >= 90;

    const bannerBg = isBeneficial
      ? 'bg-emerald-50 border-emerald-300'
      : isCritical
      ? 'bg-rose-50 border-rose-300'
      : 'bg-amber-50 border-amber-300';

    const accentTextColor = isBeneficial
      ? 'text-emerald-950'
      : isCritical
      ? 'text-rose-950'
      : 'text-amber-950';

    const badgeColor = isBeneficial
      ? 'bg-emerald-700 text-white'
      : isCritical
      ? 'bg-rose-600 text-white'
      : 'bg-amber-600 text-white';

    const badgeText = isBeneficial
      ? 'BENEFICIAL INSECT DETECTED'
      : isCritical
      ? 'URGENT ROOT PEST DETECTED'
      : 'PEST SOUND DETECTED';

    return (
      <div
        className={`relative overflow-hidden rounded-2xl border-2 p-5 sm:p-7 shadow-sm transition-all duration-300 ${bannerBg}`}
      >
        {/* Urgent acoustic alert pulse bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isBeneficial
              ? 'bg-emerald-500'
              : isCritical
              ? 'bg-rose-500 animate-pulse'
              : 'bg-amber-500 animate-pulse'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isBeneficial
                  ? 'bg-emerald-600 text-white'
                  : isCritical
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <Bug className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${badgeColor}`}>
                  {badgeText}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  Acoustic INMP441 Match · Zone A
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${accentTextColor}`}>
                {pestName}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 font-medium">
                {isBeneficial
                  ? 'Natural aerial predator wing flutter detected in your field. Dragonflies hunt harmful pests—do not spray.'
                  : 'Subterranean root-chewing and burrow stridulation detected in crop soil. Seedbed inspection advised.'}
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 shrink-0">
            <button
              onClick={() => onViewDetails(pestName)}
              className={`px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold text-white shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer ${
                isBeneficial
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : isCritical
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              <span>{isBeneficial ? 'View Conservation Guide' : 'View Treatment & Details'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CALM GREEN FIELD CLEAR STATE
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-700 text-white">
                All Quiet
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                Continuous Acoustic Surveillance
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950">
              Field Clear - No Active Pest Sounds Detected
            </h2>
            <p className="text-xs sm:text-sm text-emerald-800/90 font-medium">
              The INMP441 microphone is actively sampling crop leaf vibrations. No chewing, boring, or swarming sounds registered.
            </p>
          </div>
        </div>

        {/* Live Audio Activity Visualizer */}
        <div className="flex items-center justify-between md:justify-end gap-4 bg-emerald-100/70 border border-emerald-200/80 rounded-xl px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-900 font-mono text-xs">
            <Activity className="w-4 h-4 text-emerald-700 animate-pulse" />
            <span>Mic Listening</span>
          </div>

          {/* Dynamic Soundwave Bars */}
          <div className="flex items-end gap-1 h-6">
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-2"></span>
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-4 delay-75"></span>
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-5 delay-150"></span>
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-3 delay-100"></span>
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-4 delay-200"></span>
            <span className="w-1 bg-emerald-600 rounded-full animate-pulse h-2 delay-300"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
