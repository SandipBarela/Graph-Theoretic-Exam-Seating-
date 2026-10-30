import React, { useState } from "react";
import { X, Grid, AlertCircle, CheckCircle } from "lucide-react";

interface HallConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: number;
  cols: number;
  totalStudents: number;
  onApplyConfig: (newRows: number, newCols: number) => void;
  isDark: boolean;
}

const PRESETS = [
  { label: "Micro Room", r: 3, c: 4, desc: "12 Seats" },
  { label: "Standard Hall", r: 5, c: 6, desc: "30 Seats (Default)" },
  { label: "Wide Gallery", r: 4, c: 8, desc: "32 Seats" },
  { label: "Large Hall", r: 6, c: 8, desc: "48 Seats" },
  { label: "Auditorium", r: 8, c: 8, desc: "64 Seats" },
];

export const HallConfigModal: React.FC<HallConfigModalProps> = ({
  isOpen,
  onClose,
  rows,
  cols,
  totalStudents,
  onApplyConfig,
  isDark,
}) => {
  const [tempRows, setTempRows] = useState(rows);
  const [tempCols, setTempCols] = useState(cols);

  if (!isOpen) return null;

  const capacity = tempRows * tempCols;
  const isOverCapacity = totalStudents > capacity;

  const handleApply = () => {
    onApplyConfig(tempRows, tempCols);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "bg-[#0c0c0c] border-white/15 text-[#E1E0CC]"
            : "bg-white border-slate-300 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark ? "bg-[#E1E0CC]/10 text-[#E1E0CC]" : "bg-slate-900 text-white"
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                Exam Hall Dimensions & Capacity
              </h3>
              <p
                className={`text-xs ${
                  isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                }`}
              >
                Customize graph vertices & room seating topology
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full border transition cursor-pointer ${
              isDark
                ? "border-white/10 hover:bg-white/10 text-[#E1E0CC]"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Presets */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDark ? "text-[#E1E0CC]/70" : "text-slate-600"}`}>
              Standard Room Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setTempRows(preset.r);
                    setTempCols(preset.c);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    tempRows === preset.r && tempCols === preset.c
                      ? isDark
                        ? "bg-[#E1E0CC]/20 border-[#E1E0CC] text-[#E1E0CC]"
                        : "bg-slate-900 border-slate-900 text-white"
                      : isDark
                      ? "bg-black/40 border-white/10 hover:border-white/30 text-[#E1E0CC]/80"
                      : "bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800"
                  }`}
                >
                  <div className="text-xs font-semibold">{preset.label}</div>
                  <div className="text-[11px] opacity-70">
                    {preset.r} × {preset.c} ({preset.desc})
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className={`p-4.5 rounded-2xl border space-y-4 ${
            isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span>Desk Rows (Horizontal Depth):</span>
                <span className="font-mono font-bold text-sm">{tempRows} Rows</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={tempRows}
                onChange={(e) => setTempRows(Number(e.target.value))}
                className={`w-full cursor-pointer h-1.5 rounded-lg appearance-none ${
                  isDark ? "accent-[#E1E0CC] bg-white/10" : "accent-slate-900 bg-slate-300"
                }`}
              />
              <div className="flex justify-between text-[10px] opacity-50 mt-1 font-mono">
                <span>Min: 2</span>
                <span>Max: 10</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <span>Desk Columns (Aisle Width):</span>
                <span className="font-mono font-bold text-sm">{tempCols} Columns</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                value={tempCols}
                onChange={(e) => setTempCols(Number(e.target.value))}
                className={`w-full cursor-pointer h-1.5 rounded-lg appearance-none ${
                  isDark ? "accent-[#E1E0CC] bg-white/10" : "accent-slate-900 bg-slate-300"
                }`}
              />
              <div className="flex justify-between text-[10px] opacity-50 mt-1 font-mono">
                <span>Min: 2</span>
                <span>Max: 12</span>
              </div>
            </div>
          </div>

          {/* Mini Topology Preview */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={`font-semibold uppercase tracking-wider ${isDark ? "text-[#E1E0CC]/70" : "text-slate-600"}`}>
                Grid Blueprint Preview ({tempRows} × {tempCols})
              </span>
              <span className={`text-[11px] ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                {capacity} Total Seats
              </span>
            </div>
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 overflow-auto max-h-36 ${
                isDark ? "bg-black/60 border-white/10" : "bg-white border-slate-200"
              }`}
            >
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${tempCols}, minmax(10px, 1fr))`,
                  width: `${Math.min(100, tempCols * 24)}px`,
                }}
              >
                {Array.from({ length: tempRows * tempCols }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 rounded-sm border ${
                      i < totalStudents
                        ? isDark
                          ? "bg-[#E1E0CC]/30 border-[#E1E0CC]/50"
                          : "bg-slate-700 border-slate-900"
                        : isDark
                        ? "bg-white/5 border-dashed border-white/20"
                        : "bg-slate-100 border-dashed border-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Capacity Status Notice */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              isOverCapacity
                ? isDark
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : "bg-rose-100 border-rose-300 text-rose-800"
                : isDark
                ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-300"
                : "bg-emerald-50 border-emerald-300 text-emerald-800"
            }`}
          >
            {isOverCapacity ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                {isOverCapacity ? "Capacity Deficit!" : "Sufficient Capacity"}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {isOverCapacity
                  ? `Hall capacity is ${capacity} desks, but you have ${totalStudents} candidates enrolled. Only ${capacity} students can be seated simultaneously.`
                  : `Room has ${capacity} desks for ${totalStudents} students (${capacity - totalStudents} empty desks for spacing buffer).`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-t text-xs ${
            isDark ? "border-white/10 bg-black/60" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="font-mono text-[11px] opacity-70">
            Dimensions: {tempRows}R × {tempCols}C = {capacity} Seats
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded-full border transition cursor-pointer ${
                isDark
                  ? "border-white/15 text-[#E1E0CC] hover:bg-white/5"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className={`px-5 py-1.5 rounded-full font-semibold transition cursor-pointer shadow ${
                isDark
                  ? "bg-[#E1E0CC] text-black hover:bg-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Apply Dimensions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

