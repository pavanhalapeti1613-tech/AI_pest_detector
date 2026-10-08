import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  Leaf,
  ShieldAlert,
  Clock,
  Eye,
  Radio,
  Sparkles,
} from 'lucide-react';
import { PestDetection } from '../types';
import { PEST_DATABASE, DEFAULT_PEST } from '../data/pestDatabase';

interface PestDetailViewProps {
  pestName: string;
  detection: PestDetection | null;
  onAcknowledgeAndBack: () => Promise<void>;
  onBackWithoutAck: () => void;
  isAcknowledging: boolean;
}

export const PestDetailView: React.FC<PestDetailViewProps> = ({
  pestName,
  detection,
  onAcknowledgeAndBack,
  onBackWithoutAck,
  isAcknowledging,
}) => {
  const pestInfo = PEST_DATABASE[pestName] || DEFAULT_PEST;
  const isLiveAlert = Boolean(detection && detection.detected && !detection.acknowledged);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackWithoutAck}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Field Monitor</span>
        </button>

        {isLiveAlert && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-lg text-amber-900 text-xs font-semibold">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Active Incident Waiting for Farmer Acknowledgment</span>
          </div>
        )}
      </div>

      {/* Hero Pest Identification Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              {/* Illustrative pest silhouette SVG */}
              <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 2 1.88 1.88" />
                <path d="M14.12 3.88 16 2" />
                <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                <path d="M12 20v-9" />
                <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                <path d="M6 13H2" />
                <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                <path d="M22 13h-4" />
                <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  pestInfo.urgencyLevel === 'beneficial'
                    ? 'bg-emerald-100 text-emerald-800'
                    : pestInfo.urgencyLevel === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {pestInfo.urgencyLevel === 'beneficial' ? 'Beneficial Natural Predator' : pestInfo.urgencyLevel === 'critical' ? 'Urgent Crop Risk' : 'High Crop Risk'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Target Crops / Habitat: {pestInfo.targetCrops.join(', ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {pestInfo.commonName}
              </h1>

              <div className="text-sm sm:text-base text-slate-600 font-medium">
                Farmer name: <span className="font-semibold text-slate-800">{pestInfo.localFarmerName}</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="italic text-slate-500">{pestInfo.scientificName}</span>
              </div>
            </div>
          </div>

          {/* Acoustic Match Metric Box */}
          <div className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0 font-mono">
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider">Acoustic Match</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {detection?.confidence ? `${detection.confidence}% Match` : '94% Match'}
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Sensor Peak: {detection?.frequency_hz ? `${detection.frequency_hz} Hz` : '3,840 Hz'}
            </div>
          </div>
        </div>

        {/* Acoustic Detection Summary */}
        <div className="mt-6 bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
          <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-700" />
            INMP441 Microphone Acoustic Profile
          </h2>
          <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
            {pestInfo.acousticProfile.description}
          </p>
          <div className="mt-2 text-xs font-mono font-medium text-amber-900">
            Frequencies: {pestInfo.acousticProfile.frequencyRange} · Sound Type: {pestInfo.acousticProfile.soundType}
          </div>
        </div>
      </div>

      {/* Suggested Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 1: Chemical & Pesticide Treatment / Advisory */}
        <div className={`bg-white border-2 rounded-2xl p-6 shadow-xs flex flex-col justify-between ${
          pestInfo.urgencyLevel === 'beneficial' ? 'border-amber-300' : 'border-rose-200'
        }`}>
          <div>
            <div className={`flex items-center gap-3 pb-4 border-b ${
              pestInfo.urgencyLevel === 'beneficial' ? 'border-amber-200' : 'border-rose-100'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                pestInfo.urgencyLevel === 'beneficial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {pestInfo.urgencyLevel === 'beneficial' ? (
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                ) : (
                  <Beaker className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  pestInfo.urgencyLevel === 'beneficial' ? 'text-amber-950' : 'text-rose-950'
                }`}>
                  {pestInfo.urgencyLevel === 'beneficial'
                    ? 'Chemical Spray Warning (DO NOT SPRAY)'
                    : 'Chemical & Pesticide Remedies'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {pestInfo.urgencyLevel === 'beneficial'
                    ? 'Beneficial natural predator — protect from chemical sprays'
                    : 'Fast root-zone knockdown for burrowing mole crickets'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {pestInfo.chemicalTreatments.map((chem, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-slate-900 text-base">{chem.chemicalName}</span>
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      pestInfo.urgencyLevel === 'beneficial'
                        ? 'text-emerald-800 bg-emerald-100'
                        : 'text-rose-700 bg-rose-50'
                    }`}>
                      {chem.activeIngredient}
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-900">
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Recommended Action:</span>
                    {chem.recommendedDosage}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Directive: </span>
                    {chem.applicationMethod}
                  </p>

                  <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pre-harvest interval: {chem.preHarvestInterval}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: Organic & Cultural Alternatives / Conservation */}
        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-950">
                  {pestInfo.urgencyLevel === 'beneficial'
                    ? 'Habitat Conservation & Perch Setup'
                    : 'Organic & Biological Remedies'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  {pestInfo.urgencyLevel === 'beneficial'
                    ? 'Encourage natural biological predation of crop pests'
                    : 'Safe for bees, soil biology, and organic farming'}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {pestInfo.organicAlternatives.map((org, idx) => (
                <div key={idx} className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                  <span className="font-bold text-emerald-950 text-base block">{org.methodName}</span>

                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Materials: </span>
                    {org.materials}
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-xs font-semibold text-emerald-900">
                    <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Setup / Dosage:</span>
                    {org.dosageOrSetup}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Timing: </span>
                    {org.applicationTiming}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spray Precautions & Farmer Safety */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Farmer Spray Safety & Weather Precautions
            </h2>
            <p className="text-xs text-slate-500">Protect your health, honeybees, and prevent wash-off</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {pestInfo.sprayPrecautions.map((precaution, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-snug">{precaution}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Field Identification Signs */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Visual Field Scouting Signs
            </h2>
            <p className="text-xs text-slate-500">What to inspect when walking the rows</p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {pestInfo.identificationTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prominent Action Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md border-2 border-slate-300 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Finished Reading Treatment?
          </h3>
          <p className="text-xs text-slate-600">
            Acknowledging notifies the ESP32 via <code className="font-mono font-semibold">POST /api/ack</code> and clears active alerts into History.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBackWithoutAck}
            className="flex-1 sm:flex-initial px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onAcknowledgeAndBack}
            disabled={isAcknowledging}
            className="flex-1 sm:flex-initial px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer text-base"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isAcknowledging ? 'Acknowledging...' : 'Acknowledge & Return Home'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
