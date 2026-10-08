import React, { useState } from 'react';
import { History, Search, Download, Trash2, ArrowRight, Bug, Calendar, Filter, Sparkles } from 'lucide-react';
import { PestDetection } from '../types';

interface HistoryViewProps {
  history: PestDetection[];
  onSelectPest: (pestName: string) => void;
  onClearHistory: () => void;
  onRefreshHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectPest,
  onClearHistory,
  onRefreshHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPest, setFilterPest] = useState('all');

  const filteredHistory = history.filter((item) => {
    const pestName = item.pest || 'Unknown';
    const matchesSearch =
      pestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.remedy && item.remedy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.field_zone && item.field_zone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterPest === 'all' || pestName === filterPest;
    return matchesSearch && matchesFilter;
  });

  const uniquePests = Array.from(new Set(history.map((h) => h.pest).filter(Boolean))) as string[];

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Pest', 'Confidence', 'Decibels (dB)', 'Frequency (Hz)', 'Field Zone', 'Prescribed Remedy'];
    const rows = history.map((h) => [
      `"${h.timestamp}"`,
      `"${h.pest || 'Unknown'}"`,
      `"${h.confidence}%"`,
      `"${h.db_level}"`,
      `"${h.frequency_hz}"`,
      `"${h.field_zone || 'Field'}"`,
      `"${(h.remedy || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agrisound_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      };
    } catch {
      return { date: 'Recent', time: '' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            Detection & Acoustic Incident History
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Chronological record of acoustic pest alerts captured by your field INMP441 microphone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={exportCSV}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Download CSV for agricultural logs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Export CSV
              </button>

              <button
                onClick={onClearHistory}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Clear local logs"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by pest name, remedy, or field zone..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-emerald-600 focus:bg-white text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterPest}
            onChange={(e) => setFilterPest(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-emerald-600"
          >
            <option value="all">All Detected Pests ({history.length})</option>
            {uniquePests.map((pest) => (
              <option key={pest} value={pest}>
                {pest}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents Table / Card List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Incidents Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm || filterPest !== 'all'
              ? 'No detection matches your search filters. Try clearing the filter.'
              : 'Your field logs are clear. Acknowledged pest detections from the ESP32 will automatically record here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredHistory.map((item, index) => {
            const { date, time } = formatDate(item.timestamp);
            const pestName = item.pest || 'Unidentified Pest';
            return (
              <div
                key={item.id || index}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bug className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                        {pestName}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 tabular-nums">
                        {item.confidence}% Match
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        · {item.field_zone || 'South Field'}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      <span className="font-semibold text-slate-700">Prescribed: </span>
                      {item.remedy || 'Chlorantraniliprole 18.5% SC or Neem NSKE 5% whorl spray'}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {date} at {time}
                      </span>
                      <span>·</span>
                      <span>{item.frequency_hz} Hz peak</span>
                      <span>·</span>
                      <span>{item.db_level.toFixed(1)} dB</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Action */}
                <button
                  onClick={() => onSelectPest(pestName)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shrink-0"
                >
                  <span>View Treatment Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
