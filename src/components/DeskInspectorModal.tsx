import React from "react";
import { X, User, AlertTriangle, ShieldCheck } from "lucide-react";
import type { Student, Subject } from "@/types/seating";
import { getSeatLabel, getNeighbors } from "@/utils/graphSeatingAlgorithms";

interface DeskInspectorModalProps {
  cell: { r: number; c: number } | null;
  onClose: () => void;
  grid: (Student | null)[][];
  rows: number;
  cols: number;
  withDiag: boolean;
  subjects: Subject[];
  isDark: boolean;
  onClearSeat: (r: number, c: number) => void;
}

export const DeskInspectorModal: React.FC<DeskInspectorModalProps> = ({
  cell,
  onClose,
  grid,
  rows,
  cols,
  withDiag,
  subjects,
  isDark,
  onClearSeat,
}) => {
  if (!cell) return null;

  const { r, c } = cell;
  const currentStudent = grid[r]?.[c];
  const deskLabel = getSeatLabel(r, c);
  const nbrs = getNeighbors(r, c, rows, cols, withDiag);

  const neighborDetails = nbrs.map(([nr, nc]) => {
    const nbrStudent = grid[nr]?.[nc];
    const isConflict =
      currentStudent && nbrStudent && currentStudent.code === nbrStudent.code;
    return {
      r: nr,
      c: nc,
      label: getSeatLabel(nr, nc),
      student: nbrStudent,
      isConflict,
    };
  });

  const conflictsCount = neighborDetails.filter((n) => n.isConflict).length;
  const currentSub = subjects.find((s) => s.code === currentStudent?.code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
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
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-base border shadow-sm ${
                isDark
                  ? "bg-[#E1E0CC]/15 text-[#E1E0CC] border-[#E1E0CC]/30"
                  : "bg-slate-900 text-white border-slate-800"
              }`}
            >
              {deskLabel}
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">
                Desk Topology Inspector
              </h3>
              <p
                className={`text-xs ${
                  isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                }`}
              >
                Vertex ({r}, {c}) &bull; Degree: {nbrs.length} Neighboring Edges
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Student Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            {currentStudent ? (
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentSub?.dotColor || "bg-slate-400"
                  } text-black font-bold`}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{currentStudent.name}</div>
                  <div className={`text-xs font-mono ${isDark ? "text-[#E1E0CC]/70" : "text-slate-600"}`}>
                    Roll: <strong>{currentStudent.roll}</strong> &bull; {currentStudent.course}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs opacity-60">This desk is currently unoccupied (Empty).</div>
            )}

            {currentStudent && (
              <span
                className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${
                  isDark
                    ? currentSub?.badgeDark || "border-white/20"
                    : currentSub?.badgeLight || "border-slate-300"
                }`}
              >
                {currentStudent.code}
              </span>
            )}
          </div>

          {/* Conflict Analysis Badge */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
              conflictsCount === 0
                ? isDark
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800"
                : isDark
                ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                : "bg-rose-100 border-rose-300 text-rose-800"
            }`}
          >
            {conflictsCount === 0 ? (
              <>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero adjacency conflicts detected at this vertex.</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>{conflictsCount} active risk(s)</strong> detected! Candidate shares exam subject with neighboring seat(s).
                </span>
              </>
            )}
          </div>

          {/* Adjacent Graph Edges */}
          <div>
            <h4
              className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${
                isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
              }`}
            >
              Incident Edges ({nbrs.length} Adjacent Desks)
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {neighborDetails.map((nbr) => (
                <div
                  key={`${nbr.r}-${nbr.c}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                    nbr.isConflict
                      ? isDark
                        ? "bg-rose-500/20 border-rose-400 text-rose-200"
                        : "bg-rose-50 border-rose-300 text-rose-800"
                      : isDark
                      ? "bg-black/40 border-white/10 text-[#E1E0CC]/80"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-white/10">
                      {nbr.label}
                    </span>
                    <span>
                      {nbr.student ? (
                        <>
                          <strong className="font-medium">{nbr.student.name}</strong>{" "}
                          <span className="opacity-70">({nbr.student.code})</span>
                        </>
                      ) : (
                        <span className="opacity-50 italic">Empty Desk</span>
                      )}
                    </span>
                  </div>

                  <span className="text-[10px] font-semibold">
                    {nbr.isConflict ? (
                      <span className="text-rose-400 font-bold uppercase">Conflict</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">Valid</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-t text-xs ${
            isDark ? "border-white/10 bg-black/60" : "border-slate-200 bg-slate-50"
          }`}
        >
          {currentStudent && (
            <button
              onClick={() => {
                onClearSeat(r, c);
                onClose();
              }}
              className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer underline"
            >
              Clear Seat (Vacate)
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 rounded-full font-semibold transition cursor-pointer ${
                isDark
                  ? "bg-[#E1E0CC] text-black hover:bg-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

