import React from "react";
import { X, Printer, Download, FileText } from "lucide-react";
import type { Student } from "@/types/seating";
import { getSeatLabel } from "@/utils/graphSeatingAlgorithms";

interface PrintManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: (Student | null)[][];
  rows: number;
  cols: number;
  conflicts: number;
  withDiag: boolean;
  isDark: boolean;
}

export const PrintManifestModal: React.FC<PrintManifestModalProps> = ({
  isOpen,
  onClose,
  grid,
  rows,
  cols,
  conflicts,
  withDiag,
  isDark,
}) => {
  if (!isOpen) return null;

  const totalSeats = rows * cols;
  const occupiedList: { desk: string; r: number; c: number; student: Student }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const st = grid[r]?.[c];
      if (st) {
        occupiedList.push({
          desk: getSeatLabel(r, c),
          r,
          c,
          student: st,
        });
      }
    }
  }

  // Sort by desk label A1, A2, B1, etc.
  occupiedList.sort((a, b) => a.desk.localeCompare(b.desk));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = "Desk ID,Row,Col,Roll Number,Student Name,Course Code,Course Title\n";
    occupiedList.forEach((item) => {
      csv += `"${item.desk}",${item.r + 1},${item.c + 1},"${item.student.roll}","${item.student.name}","${item.student.code}","${item.student.course}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Exam_Seating_Manifest_${rows}x${cols}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "bg-[#0d0d0d] border-white/15 text-[#E1E0CC]"
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                Official Examination Seating Manifest
              </h3>
              <p className={`text-xs ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                Ready to print or export as attendance roll
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? "border-white/15 hover:bg-white/10 text-[#E1E0CC]"
                  : "border-slate-300 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Export</span>
            </button>
            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow ${
                isDark
                  ? "bg-[#E1E0CC] text-black hover:bg-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
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
        </div>

        {/* Printable Paper View */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:m-0">
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? "bg-black/60 border-white/10" : "bg-white border-slate-300"
            } print:border-none print:shadow-none`}
          >
            {/* Sheet Title */}
            <div className="text-center pb-4 border-b border-dashed border-gray-400">
              <h2 className="text-xl font-bold tracking-tight uppercase">
                Department Examination Hall Seating Roster
              </h2>
              <div className="text-xs opacity-75 mt-1 font-mono">
                Discrete Mathematics & Graph-Theoretic Seating Model
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-3">
                <span>
                  <strong>Hall Dimensions:</strong> {rows} Rows × {cols} Cols ({totalSeats} Total Desks)
                </span>
                <span>
                  <strong>Candidates Seated:</strong> {occupiedList.length} / {totalSeats}
                </span>
                <span>
                  <strong>Model:</strong> {withDiag ? "8-Way King's Graph" : "4-Way Orthogonal Grid"}
                </span>
                <span>
                  <strong>Status:</strong>{" "}
                  {conflicts === 0 ? (
                    <span className="text-emerald-500 font-bold">Conflict-Free (0 Conflicts)</span>
                  ) : (
                    <span className="text-rose-500 font-bold">{conflicts} Conflict Pairs</span>
                  )}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Desk ID</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Subject / Course</th>
                    <th className="py-2.5 px-3">Candidate Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-normal">
                  {occupiedList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-black/5">
                      <td className="py-2 px-3 font-mono font-bold">{item.desk}</td>
                      <td className="py-2 px-3 font-mono">{item.student.roll}</td>
                      <td className="py-2 px-3 font-medium">{item.student.name}</td>
                      <td className="py-2 px-3">
                        <span className="font-semibold">{item.student.code}</span> - {item.student.course}
                      </td>
                      <td className="py-2 px-3 border-b border-dashed border-gray-300 text-center text-[10px] text-gray-400">
                        ___________________
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="mt-12 pt-6 border-t border-dashed border-gray-400 flex items-center justify-between text-xs">
              <div>
                <div className="border-t border-gray-500 w-44 text-center pt-1 font-medium">
                  Invigilator Signature
                </div>
              </div>
              <div>
                <div className="border-t border-gray-500 w-44 text-center pt-1 font-medium">
                  Chief Examination Officer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

