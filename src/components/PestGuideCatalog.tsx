import React from 'react';
import { BookOpen, ArrowRight, ShieldCheck, Bug, Sparkles, Check } from 'lucide-react';
import { PEST_DATABASE } from '../data/pestDatabase';

interface PestGuideCatalogProps {
  onSelectPest: (pestName: string) => void;
}

export const PestGuideCatalog: React.FC<PestGuideCatalogProps> = ({ onSelectPest }) => {
  const pests = Object.values(PEST_DATABASE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            Field Crop Pest Treatment Guide
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Agricultural remedies, organic alternatives, and acoustic signatures calibrated for your ESP32 INMP441 sensor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pests.map((pest) => (
          <div
            key={pest.id}
            className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Bug className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {pest.acousticProfile.frequencyRange}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {pest.commonName}
                    </h2>
                    <span className="text-xs text-slate-500 font-medium italic block">
                      {pest.scientificName}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    pest.urgencyLevel === 'beneficial'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pest.urgencyLevel === 'critical'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pest.urgencyLevel === 'beneficial' ? 'Beneficial Predator' : pest.urgencyLevel}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-700">
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                  <span className="font-semibold text-slate-900 block text-[11px] text-slate-500 uppercase tracking-wider mb-0.5">
                    Primary Chemical Remedy:
                  </span>
                  {pest.chemicalTreatments[0]?.chemicalName} ({pest.chemicalTreatments[0]?.recommendedDosage})
                </div>

                <div className="bg-emerald-50/60 rounded-lg p-2.5 border border-emerald-100/80">
                  <span className="font-semibold text-emerald-900 block text-[11px] text-emerald-700 uppercase tracking-wider mb-0.5">
                    Organic / Cultural Alternative:
                  </span>
                  {pest.organicAlternatives[0]?.methodName}
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-500 font-medium">
                Crops: {pest.targetCrops.join(', ')}
              </div>
            </div>

            <button
              onClick={() => onSelectPest(pest.commonName)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>View Full Treatment & Safety Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
