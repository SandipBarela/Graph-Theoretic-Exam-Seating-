import React, { useState } from "react";
import { X, Plus, Trash2, Users, BookOpen, Search, Check } from "lucide-react";
import type { Student, Subject } from "@/types/seating";

interface StudentSubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  subjects: Subject[];
  onAddStudent: (student: Omit<Student, "id">) => void;
  onDeleteStudent: (id: string) => void;
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (code: string) => void;
  onResetToDefault: () => void;
  isDark: boolean;
}

const PALETTE_OPTIONS = [
  {
    name: "Platinum",
    dot: "bg-[#E1E0CC]",
    badgeDark: "bg-[#E1E0CC]/15 text-[#E1E0CC] border-[#E1E0CC]/40",
    badgeLight: "bg-slate-900 text-slate-100 border-slate-700",
  },
  {
    name: "Amber",
    dot: "bg-amber-400",
    badgeDark: "bg-amber-400/15 text-amber-300 border-amber-400/30",
    badgeLight: "bg-amber-100 text-amber-900 border-amber-300",
  },
  {
    name: "Emerald",
    dot: "bg-emerald-400",
    badgeDark: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
    badgeLight: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    name: "Orange",
    dot: "bg-orange-400",
    badgeDark: "bg-orange-400/15 text-orange-300 border-orange-400/30",
    badgeLight: "bg-orange-100 text-orange-900 border-orange-300",
  },
  {
    name: "Purple",
    dot: "bg-purple-400",
    badgeDark: "bg-purple-400/15 text-purple-300 border-purple-400/30",
    badgeLight: "bg-purple-100 text-purple-900 border-purple-300",
  },
  {
    name: "Sky",
    dot: "bg-sky-400",
    badgeDark: "bg-sky-400/15 text-sky-300 border-sky-400/30",
    badgeLight: "bg-sky-100 text-sky-900 border-sky-300",
  },
  {
    name: "Rose",
    dot: "bg-rose-400",
    badgeDark: "bg-rose-400/15 text-rose-300 border-rose-400/30",
    badgeLight: "bg-rose-100 text-rose-900 border-rose-300",
  },
  {
    name: "Indigo",
    dot: "bg-indigo-400",
    badgeDark: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",
    badgeLight: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
];

export const StudentSubjectManagerModal: React.FC<StudentSubjectManagerModalProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  onAddStudent,
  onDeleteStudent,
  onAddSubject,
  onDeleteSubject,
  onResetToDefault,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<"students" | "subjects">("students");

  // New Student State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentRoll, setNewStudentRoll] = useState("");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState(
    subjects[0]?.code || "MTH"
  );

  // New Subject State
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState(PALETTE_OPTIONS[0]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("ALL");

  if (!isOpen) return null;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentRoll.trim()) return;

    const subjectObj = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];
    onAddStudent({
      name: newStudentName.trim(),
      roll: newStudentRoll.trim().toUpperCase(),
      course: subjectObj.name,
      code: subjectObj.code,
    });

    setNewStudentName("");
    setNewStudentRoll("");
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubName.trim()) return;
    const cleanCode = newSubCode.trim().toUpperCase().slice(0, 5);

    onAddSubject({
      code: cleanCode,
      name: newSubName.trim(),
      colorName: selectedPalette.name,
      badgeDark: selectedPalette.badgeDark,
      badgeLight: selectedPalette.badgeLight,
      dotColor: selectedPalette.dot,
    });

    setNewSubCode("");
    setNewSubName("");
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "ALL" || s.code === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark
            ? "bg-[#0c0c0c] border-white/15 text-[#E1E0CC]"
            : "bg-white border-slate-300 text-slate-900"
        }`}
      >
        {/* Modal Header */}
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
              {activeTab === "students" ? (
                <Users className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                Manage Examination Cohort
              </h3>
              <p
                className={`text-xs ${
                  isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                }`}
              >
                {students.length} Total Enrolled Candidates &bull; {subjects.length} Courses
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

        {/* Tab switcher */}
        <div
          className={`flex items-center justify-between px-6 py-2.5 border-b text-xs ${
            isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-100/60"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "students"
                  ? isDark
                    ? "bg-[#E1E0CC] text-black font-semibold shadow"
                    : "bg-slate-900 text-white font-semibold shadow"
                  : isDark
                  ? "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-4 py-1.5 rounded-full font-medium transition cursor-pointer ${
                activeTab === "subjects"
                  ? isDark
                    ? "bg-[#E1E0CC] text-black font-semibold shadow"
                    : "bg-slate-900 text-white font-semibold shadow"
                  : isDark
                  ? "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Subjects / Courses ({subjects.length})
            </button>
          </div>

          <button
            onClick={onResetToDefault}
            className={`text-[11px] underline cursor-pointer opacity-70 hover:opacity-100`}
          >
            Reset to Standard Demo Cohort
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "students" ? (
            <>
              {/* Form to add student */}
              <form
                onSubmit={handleCreateStudent}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider">
                    Add Candidate
                  </h4>
                  <span className={`text-[11px] ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                    Auto-assigns to graph vertex pool
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Student Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vikram Sharma"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border outline-none ${
                        isDark
                          ? "bg-black/80 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Roll Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MTH109"
                      value={newStudentRoll}
                      onChange={(e) => setNewStudentRoll(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border outline-none font-mono ${
                        isDark
                          ? "bg-black/80 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Subject / Course
                    </label>
                    <select
                      value={selectedSubjectCode}
                      onChange={(e) => setSelectedSubjectCode(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${
                        isDark
                          ? "bg-black border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                    >
                      {subjects.map((sub) => (
                        <option key={sub.code} value={sub.code} className={isDark ? "bg-black text-[#E1E0CC]" : "bg-white text-slate-900"}>
                          {sub.code} - {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow ${
                      isDark
                        ? "bg-[#E1E0CC] text-black hover:bg-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Student</span>
                  </button>
                </div>
              </form>

              {/* Roster Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${
                      isDark ? "text-[#E1E0CC]/40" : "text-slate-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full text-xs rounded-full pl-9 pr-4 py-2 border outline-none ${
                      isDark
                        ? "bg-black/60 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                        : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                    Filter:
                  </span>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className={`text-xs rounded-full px-3 py-1.5 border outline-none cursor-pointer ${
                      isDark
                        ? "bg-black/60 border-white/15 text-[#E1E0CC]"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="ALL">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub.code} value={sub.code}>
                        {sub.code} ({students.filter((s) => s.code === sub.code).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Students List Table */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs opacity-60">
                      No candidates match your current filter.
                    </div>
                  ) : (
                    filteredStudents.map((st) => {
                      const sub = subjects.find((s) => s.code === st.code);
                      return (
                        <div
                          key={st.id}
                          className={`flex items-center justify-between px-4 py-2.5 transition ${
                            isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                sub?.dotColor || "bg-slate-400"
                              }`}
                            />
                            <div>
                              <div className="text-xs font-semibold">{st.name}</div>
                              <div
                                className={`text-[10px] font-mono ${
                                  isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                                }`}
                              >
                                {st.roll} &bull; {st.course}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                                isDark
                                  ? sub?.badgeDark || "border-white/20"
                                  : sub?.badgeLight || "border-slate-300"
                              }`}
                            >
                              {st.code}
                            </span>
                            <button
                              onClick={() => onDeleteStudent(String(st.id))}
                              title="Remove Candidate"
                              className={`p-1.5 rounded-lg border text-rose-400 hover:text-rose-300 transition cursor-pointer ${
                                isDark
                                  ? "border-rose-500/20 hover:bg-rose-500/10"
                                  : "border-rose-200 hover:bg-rose-50 text-rose-600"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Form to add subject */}
              <form
                onSubmit={handleCreateSubject}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider">
                    Add Examination Subject / Course
                  </h4>
                  <span className={`text-[11px] ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                    Maps to graph vertex color classes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Course Code (3-5 letters)
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="e.g. BIO"
                      value={newSubCode}
                      onChange={(e) => setNewSubCode(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border outline-none font-mono uppercase ${
                        isDark
                          ? "bg-black/80 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Course Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Molecular Biology"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className={`w-full text-xs rounded-xl px-3 py-2 border outline-none ${
                        isDark
                          ? "bg-black/80 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase font-bold mb-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                      Color Palette
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {PALETTE_OPTIONS.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => setSelectedPalette(pal)}
                          className={`w-6 h-6 rounded-full ${pal.dot} border transition cursor-pointer flex items-center justify-center ${
                            selectedPalette.name === pal.name
                              ? "ring-2 ring-offset-2 ring-white scale-110"
                              : "opacity-70 hover:opacity-100"
                          }`}
                          title={pal.name}
                        >
                          {selectedPalette.name === pal.name && (
                            <Check className="w-3 h-3 text-black stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shadow ${
                      isDark
                        ? "bg-[#E1E0CC] text-black hover:bg-white"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Course</span>
                  </button>
                </div>
              </form>

              {/* Subjects Table */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-white"
                }`}
              >
                <div className="divide-y divide-white/5">
                  {subjects.map((sub) => {
                    const enrolledCount = students.filter((s) => s.code === sub.code).length;
                    return (
                      <div
                        key={sub.code}
                        className={`flex items-center justify-between px-4 py-3 transition ${
                          isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full ${sub.dotColor}`} />
                          <div>
                            <div className="text-xs font-semibold">{sub.name}</div>
                            <div
                              className={`text-[10px] font-mono ${
                                isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                              }`}
                            >
                              Code: {sub.code} &bull; Palette: {sub.colorName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${
                              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-300"
                            }`}
                          >
                            {enrolledCount} enrolled
                          </span>

                          <button
                            onClick={() => onDeleteSubject(sub.code)}
                            disabled={subjects.length <= 2}
                            title={
                              subjects.length <= 2
                                ? "At least 2 subjects required for exam conflict models"
                                : "Remove Subject"
                            }
                            className={`p-1.5 rounded-lg border text-rose-400 hover:text-rose-300 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              isDark
                                ? "border-rose-500/20 hover:bg-rose-500/10"
                                : "border-rose-200 hover:bg-rose-50 text-rose-600"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-t text-xs ${
            isDark ? "border-white/10 bg-black/60" : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="text-[11px] opacity-70">
            Total Enrolled: <strong>{students.length} students</strong>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-1.5 rounded-full font-semibold transition cursor-pointer ${
              isDark
                ? "bg-[#E1E0CC] text-black hover:bg-white"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

