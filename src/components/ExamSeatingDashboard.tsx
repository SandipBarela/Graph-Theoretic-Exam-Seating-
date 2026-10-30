import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings,
  Users,
  Printer,
  Search,
  Network,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import type { Student, Subject } from "@/types/seating";
import {
  DEFAULT_SUBJECTS,
  INITIAL_STUDENTS,
  getSeatLabel,
  getNeighbors,
  calculateScore,
  generateRandomLayout,
  generatePatternLayout,
  generateGreedyLayout,
  generateOptimizedLayout,
  computeGraphStatistics,
} from "@/utils/graphSeatingAlgorithms";
import { StudentSubjectManagerModal } from "@/components/StudentSubjectManagerModal";
import { HallConfigModal } from "@/components/HallConfigModal";
import { DeskInspectorModal } from "@/components/DeskInspectorModal";
import { PrintManifestModal } from "@/components/PrintManifestModal";

interface ExamSeatingDashboardProps {
  onBackToLanding?: () => void;
}

export function ExamSeatingDashboard({ onBackToLanding }: ExamSeatingDashboardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Hall Dimensions
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  // Student & Subject Data
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);

  // Seating Configuration
  const [includeDiagonals, setIncludeDiagonals] = useState(false);
  const [method, setMethod] = useState<"random" | "pattern" | "greedy" | "optimize">("pattern");
  const [grid, setGrid] = useState<(Student | null)[][]>(() =>
    generatePatternLayout(INITIAL_STUDENTS, 5, 6, false)
  );

  // Interaction State
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);
  const [inspectedCell, setInspectedCell] = useState<{ r: number; c: number } | null>(null);
  const [deskSearch, setDeskSearch] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showTheory, setShowTheory] = useState(false);

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const simulationRef = useRef(false);

  // Re-generate layout when solver, connectivity, dimensions, or student roster change
  useEffect(() => {
    if (simulationRef.current) return;
    recomputeLayout(method, includeDiagonals, rows, cols, students);
  }, [method, includeDiagonals, rows, cols, students]);

  const recomputeLayout = (
    currentMethod: "random" | "pattern" | "greedy" | "optimize",
    withDiag: boolean,
    r: number,
    c: number,
    studs: Student[]
  ) => {
    if (currentMethod === "pattern") {
      setGrid(generatePatternLayout(studs, r, c, withDiag));
    } else if (currentMethod === "random") {
      setGrid(generateRandomLayout(studs, r, c));
    } else if (currentMethod === "greedy") {
      setGrid(generateGreedyLayout(studs, r, c, withDiag));
    } else if (currentMethod === "optimize") {
      setGrid(generateOptimizedLayout(studs, r, c, withDiag));
    }
  };

  // Graph and Metric calculations
  const capacity = rows * cols;
  const score = calculateScore(grid, rows, cols, includeDiagonals);
  const graphStats = computeGraphStatistics(rows, cols, includeDiagonals);

  // Maximum course size among currently enrolled candidates
  const courseCounts: Record<string, number> = {};
  students.forEach((s) => {
    courseCounts[s.code] = (courseCounts[s.code] || 0) + 1;
  });
  const maxCohortSize = Math.max(0, ...Object.values(courseCounts));
  const isPhpFeasible = maxCohortSize <= graphStats.alphaBound;

  // Active hover edges & conflicts
  const activeNeighbors = hoveredCell
    ? getNeighbors(hoveredCell.r, hoveredCell.c, rows, cols, includeDiagonals)
    : [];

  const conflictingNeighbors =
    hoveredCell && grid[hoveredCell.r]?.[hoveredCell.c]
      ? activeNeighbors.filter(([nr, nc]) => {
          const curr = grid[hoveredCell.r][hoveredCell.c];
          const nbr = grid[nr]?.[nc];
          return curr && nbr && curr.code === nbr.code;
        })
      : [];

  // Live Hill-Climbing Step-by-Step Simulation
  const runLiveOptimization = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    simulationRef.current = true;
    setMethod("optimize");

    let liveGrid = generateRandomLayout(students, rows, cols);
    setGrid(liveGrid);

    let curScore = calculateScore(liveGrid, rows, cols, includeDiagonals);
    const allSeats: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) allSeats.push([r, c]);
    }

    const steps = Math.min(100, rows * cols * 3);
    for (let step = 0; step < steps; step++) {
      if (curScore === 0) break;
      const i1 = Math.floor(Math.random() * allSeats.length);
      const i2 = Math.floor(Math.random() * allSeats.length);
      if (i1 === i2) continue;

      const [r1, c1] = allSeats[i1];
      const [r2, c2] = allSeats[i2];

      const temp = liveGrid[r1][c1];
      liveGrid[r1][c1] = liveGrid[r2][c2];
      liveGrid[r2][c2] = temp;

      const newScore = calculateScore(liveGrid, rows, cols, includeDiagonals);
      if (newScore < curScore) {
        curScore = newScore;
        setGrid(liveGrid.map((row) => [...row]));
        await new Promise((resolve) => setTimeout(resolve, 50));
      } else {
        liveGrid[r2][c2] = liveGrid[r1][c1];
        liveGrid[r1][c1] = temp;
      }
    }

    setGrid(liveGrid.map((row) => [...row]));
    simulationRef.current = false;
    setIsSimulating(false);
  };

  const handleShuffle = () => {
    recomputeLayout(method, includeDiagonals, rows, cols, students);
  };

  // Student / Subject management handlers
  const handleAddStudent = (newSt: Omit<Student, "id">) => {
    const studentWithId: Student = {
      ...newSt,
      id: Date.now().toString(),
    };
    setStudents((prev) => [...prev, studentWithId]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSubject = (newSub: Subject) => {
    if (subjects.some((s) => s.code === newSub.code)) return;
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleDeleteSubject = (code: string) => {
    if (subjects.length <= 2) return;
    setSubjects((prev) => prev.filter((s) => s.code !== code));
    setStudents((prev) => prev.filter((s) => s.code !== code));
  };

  const handleResetToDefault = () => {
    setSubjects(DEFAULT_SUBJECTS);
    setStudents(INITIAL_STUDENTS);
  };

  const handleClearSeat = (r: number, c: number) => {
    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      if (copy[r]) copy[r][c] = null;
      return copy;
    });
  };

  const getCourseBadge = (code: string) => {
    const sub = subjects.find((s) => s.code === code);
    if (!sub) {
      return isDark
        ? "bg-white/10 text-white/70 border-white/20"
        : "bg-slate-100 text-slate-700 border-slate-300";
    }
    return isDark ? sub.badgeDark : sub.badgeLight;
  };

  // Count occupied seats
  let occupiedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r]?.[c]) occupiedCount++;
    }
  }

  return (
    <div
      className={`relative min-h-screen w-full transition-colors duration-500 overflow-x-hidden p-2 sm:p-4 md:p-6 lg:p-8 ${
        isDark ? "bg-[#030303] text-[#E1E0CC]" : "bg-[#f5f4ed] text-slate-900"
      }`}
    >
      {/* Outer rounded frame */}
      <div
        className={`relative min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] w-full overflow-hidden rounded-2xl md:rounded-[2rem] border transition-colors duration-500 ${
          isDark
            ? "border-white/10 bg-black/85 backdrop-blur-2xl shadow-2xl"
            : "border-slate-300 bg-white/90 backdrop-blur-2xl shadow-xl"
        }`}
      >
        {/* Background video overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-500 ${
            isDark ? "opacity-25 filter blur-sm" : "opacity-15 filter blur-sm brightness-110"
          }`}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay" />
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            isDark
              ? "bg-gradient-to-b from-black/80 via-black/60 to-black/90"
              : "bg-gradient-to-b from-white/80 via-white/60 to-white/90"
          }`}
        />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col min-h-full">
          {/* Header */}
          <header className="px-4 pt-4 sm:px-8 sm:pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onBackToLanding && (
                <button
                  onClick={onBackToLanding}
                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs md:text-sm font-medium transition-all shadow-md cursor-pointer ${
                    isDark
                      ? "bg-black/60 hover:bg-black/90 border-white/15 text-[#E1E0CC] hover:border-[#E1E0CC]/50"
                      : "bg-white/80 hover:bg-white border-slate-300 text-slate-800 hover:border-slate-500"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>Landing Page</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm md:text-base font-semibold tracking-tight ${
                    isDark ? "text-[#E1E0CC]" : "text-slate-900"
                  }`}
                >
                  Graph-Theoretic Exam Seating
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? "bg-[#E1E0CC]/10 text-[#E1E0CC] border-[#E1E0CC]/20"
                      : "bg-slate-900 text-white border-slate-800"
                  }`}
                >
                  Discrete Mathematics
                </span>
              </div>
            </div>

            {/* Top Toolbar Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Hall Configuration Button */}
              <button
                onClick={() => setIsHallModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-black/60 border-white/15 text-[#E1E0CC] hover:border-[#E1E0CC]/40"
                    : "bg-white border-slate-300 text-slate-800 hover:border-slate-500"
                }`}
                title="Configure Room Dimensions & Capacity"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>
                  Size: <strong>{rows}×{cols}</strong> ({capacity} Desks)
                </span>
              </button>

              {/* Student & Subject Manager Button */}
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-black/60 border-white/15 text-[#E1E0CC] hover:border-[#E1E0CC]/40"
                    : "bg-white border-slate-300 text-slate-800 hover:border-slate-500"
                }`}
                title="Manage Candidates & Exam Subjects"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  Candidates: <strong>{students.length}</strong> ({subjects.length} Courses)
                </span>
              </button>

              {/* Print Seating Manifest Button */}
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition cursor-pointer shadow-sm ${
                  isDark
                    ? "bg-black/60 border-white/15 text-[#E1E0CC] hover:border-[#E1E0CC]/40"
                    : "bg-white border-slate-300 text-slate-800 hover:border-slate-500"
                }`}
                title="Print or Export Attendance Manifest"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Chart</span>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            {/* Title & Subtitle banner */}
            <div
              className={`flex flex-col gap-1 border-b pb-4 ${
                isDark ? "border-white/10" : "border-slate-200"
              }`}
            >
              <h1
                className={`text-2xl sm:text-3xl md:text-4xl font-medium tracking-[-0.03em] ${
                  isDark ? "text-[#E1E0CC]" : "text-slate-900"
                }`}
              >
                Seating Conflict Optimizer
              </h1>
              <p
                className={`text-xs sm:text-sm max-w-2xl font-normal ${
                  isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                }`}
              >
                Minimising adjacent same-course conflicts using chromatic vertex colouring,
                independent sets, and 2-opt hill-climbing heuristics.
              </p>
            </div>

            {/* Controls Bar */}
            <section
              className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-3.5 sm:p-4 backdrop-blur-xl shadow-lg transition-colors ${
                isDark ? "bg-black/60 border-white/15" : "bg-white/80 border-slate-300"
              }`}
            >
              {/* Connectivity toggle */}
              <div
                className={`flex items-center p-1 rounded-full border ${
                  isDark ? "bg-black/80 border-white/10" : "bg-slate-100 border-slate-300"
                }`}
              >
                <button
                  onClick={() => setIncludeDiagonals(false)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    !includeDiagonals
                      ? isDark
                        ? "bg-[#E1E0CC] text-black shadow-md font-semibold"
                        : "bg-slate-900 text-white shadow-md font-semibold"
                      : isDark
                      ? "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  4-Way (Grid Graph)
                </button>
                <button
                  onClick={() => setIncludeDiagonals(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    includeDiagonals
                      ? isDark
                        ? "bg-[#E1E0CC] text-black shadow-md font-semibold"
                        : "bg-slate-900 text-white shadow-md font-semibold"
                      : isDark
                      ? "text-[#E1E0CC]/60 hover:text-[#E1E0CC]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  8-Way (King's Graph)
                </button>
              </div>

              {/* Method Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setMethod("random")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border cursor-pointer ${
                    method === "random"
                      ? isDark
                        ? "bg-[#E1E0CC]/20 border-[#E1E0CC] text-[#E1E0CC] shadow-inner font-semibold"
                        : "bg-slate-900 border-slate-900 text-white font-semibold"
                      : isDark
                      ? "bg-black/40 border-white/10 text-white/60 hover:text-[#E1E0CC]"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  1. Random
                </button>
                <button
                  onClick={() => setMethod("pattern")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border cursor-pointer ${
                    method === "pattern"
                      ? isDark
                        ? "bg-[#E1E0CC]/20 border-[#E1E0CC] text-[#E1E0CC] shadow-inner font-semibold"
                        : "bg-slate-900 border-slate-900 text-white font-semibold"
                      : isDark
                      ? "bg-black/40 border-white/10 text-white/60 hover:text-[#E1E0CC]"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  2. Graph Pattern
                </button>
                <button
                  onClick={() => setMethod("greedy")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border cursor-pointer ${
                    method === "greedy"
                      ? isDark
                        ? "bg-[#E1E0CC]/20 border-[#E1E0CC] text-[#E1E0CC] shadow-inner font-semibold"
                        : "bg-slate-900 border-slate-900 text-white font-semibold"
                      : isDark
                      ? "bg-black/40 border-white/10 text-white/60 hover:text-[#E1E0CC]"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  3. Greedy DSatur
                </button>
                <button
                  onClick={() => setMethod("optimize")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border cursor-pointer ${
                    method === "optimize"
                      ? isDark
                        ? "bg-[#E1E0CC]/20 border-[#E1E0CC] text-[#E1E0CC] shadow-inner font-semibold"
                        : "bg-slate-900 border-slate-900 text-white font-semibold"
                      : isDark
                      ? "bg-black/40 border-white/10 text-white/60 hover:text-[#E1E0CC]"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  4. Hill Climbing
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={runLiveOptimization}
                  disabled={isSimulating}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all hover:gap-3 cursor-pointer disabled:opacity-50 shadow-md ${
                    isDark
                      ? "bg-[#E1E0CC] text-black hover:bg-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-700/20"
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${isDark ? "fill-black" : "fill-white"}`} />
                  <span>{isSimulating ? "Optimizing..." : "Live Optimize"}</span>
                </button>
                <button
                  onClick={handleShuffle}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    isDark
                      ? "bg-black/50 hover:bg-black/80 border-white/15 text-[#E1E0CC] hover:border-white/30"
                      : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-solve</span>
                </button>
              </div>
            </section>

            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`relative overflow-hidden rounded-2xl border p-4.5 backdrop-blur-xl shadow-md transition-colors ${
                  isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                }`}
              >
                <div
                  className={`text-[11px] uppercase tracking-wider font-medium ${
                    isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                  }`}
                >
                  Adjacent Risk Score
                </div>
                <div
                  className={`text-3xl font-medium mt-1 flex items-baseline gap-2 ${
                    score === 0
                      ? isDark
                        ? "text-[#E1E0CC]"
                        : "text-emerald-700"
                      : "text-rose-500"
                  }`}
                >
                  {score}
                </div>
                <div
                  className={`text-xs mt-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}
                >
                  {score === 0 ? "Conflict-Free (Optimal)" : `${score} Conflict Pairs Detected`}
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border p-4.5 backdrop-blur-xl shadow-md transition-colors ${
                  isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                }`}
              >
                <div
                  className={`text-[11px] uppercase tracking-wider font-medium ${
                    isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                  }`}
                >
                  Chromatic Number &chi;(G)
                </div>
                <div
                  className={`text-3xl font-medium mt-1 ${
                    isDark ? "text-[#E1E0CC]" : "text-slate-900"
                  }`}
                >
                  {includeDiagonals ? "4 Colors" : "2 Colors"}
                </div>
                <div
                  className={`text-xs mt-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}
                >
                  {includeDiagonals ? "(r%2)*2 + (c%2) (K₄ Cliques)" : "(r + c) mod 2 (Bipartite)"}
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border p-4.5 backdrop-blur-xl shadow-md transition-colors ${
                  isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                }`}
              >
                <div
                  className={`text-[11px] uppercase tracking-wider font-medium ${
                    isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                  }`}
                >
                  Pigeonhole Bound
                </div>
                <div
                  className={`text-3xl font-medium mt-1 ${
                    isPhpFeasible
                      ? isDark
                        ? "text-[#E1E0CC]"
                        : "text-emerald-700"
                      : "text-rose-500"
                  }`}
                >
                  {isPhpFeasible ? "Feasible" : "Infeasible"}
                </div>
                <div
                  className={`text-xs mt-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}
                >
                  Largest Cohort ({maxCohortSize}) &le; &alpha;(G) ({graphStats.alphaBound})
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border p-4.5 backdrop-blur-xl shadow-md transition-colors ${
                  isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                }`}
              >
                <div
                  className={`text-[11px] uppercase tracking-wider font-medium ${
                    isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                  }`}
                >
                  Hall Capacity
                </div>
                <div
                  className={`text-3xl font-medium mt-1 ${
                    isDark ? "text-[#E1E0CC]" : "text-slate-900"
                  }`}
                >
                  {occupiedCount} / {capacity}
                </div>
                <div
                  className={`text-xs mt-1 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}
                >
                  {capacity - occupiedCount} Empty Seats Available ({Math.round((occupiedCount / capacity) * 100)}% Utilized)
                </div>
              </div>
            </section>

            {/* Matrix & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Matrix Layout */}
              <div
                className={`lg:col-span-8 rounded-2xl border p-5 backdrop-blur-xl shadow-xl flex flex-col gap-4 ${
                  isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                }`}
              >
                <div
                  className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
                    isDark ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  <h2
                    className={`text-sm md:text-base font-medium flex items-center gap-2 ${
                      isDark ? "text-[#E1E0CC]" : "text-slate-900"
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${isDark ? "text-[#E1E0CC]" : "text-slate-700"}`} />
                    Seating Matrix:{" "}
                    {method === "pattern"
                      ? "Graph Pattern Colouring"
                      : method === "random"
                      ? "Random Baseline"
                      : method === "greedy"
                      ? "Greedy DSatur Heuristic"
                      : "Hill Climbing"}{" "}
                    [{includeDiagonals ? "King's Graph" : "4-Way Grid"}]
                  </h2>

                  {/* Invigilator Desk Quick Search */}
                  <div className="relative">
                    <Search
                      className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${
                        isDark ? "text-[#E1E0CC]/40" : "text-slate-400"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Search Roll No / Name..."
                      value={deskSearch}
                      onChange={(e) => setDeskSearch(e.target.value)}
                      className={`text-xs rounded-full pl-8 pr-3 py-1.5 border outline-none w-48 sm:w-56 transition ${
                        isDark
                          ? "bg-black/50 border-white/15 text-[#E1E0CC] focus:border-[#E1E0CC]"
                          : "bg-white border-slate-300 text-slate-900 focus:border-slate-800"
                      }`}
                    />
                  </div>
                </div>

                {/* Dynamic Grid Layout */}
                <div
                  className="grid gap-2.5 py-1 overflow-x-auto"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, minmax(110px, 1fr))`,
                  }}
                >
                  {grid.map((row, r) =>
                    row.map((student, c) => {
                      const clrId = includeDiagonals
                        ? (r % 2) * 2 + (c % 2)
                        : (r + c) % 2;

                      const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                      const isNeighbor = activeNeighbors.some(
                        ([nr, nc]) => nr === r && nc === c
                      );
                      const isConflict =
                        conflictingNeighbors.some(([nr, nc]) => nr === r && nc === c) ||
                        (isHovered && conflictingNeighbors.length > 0);

                      const deskLabel = getSeatLabel(r, c);

                      // Match search query
                      const isSearchMatch =
                        deskSearch.trim().length > 0 &&
                        student &&
                        (student.name.toLowerCase().includes(deskSearch.toLowerCase()) ||
                          student.roll.toLowerCase().includes(deskSearch.toLowerCase()));

                      let cellStyle = isDark
                        ? "border-white/10 bg-black/50 hover:border-[#E1E0CC]/40"
                        : "border-slate-200 bg-slate-50 hover:border-slate-400";

                      if (isConflict) {
                        cellStyle = isDark
                          ? "border-rose-400 bg-rose-500/20 shadow-lg shadow-rose-950/60 animate-pulse"
                          : "border-rose-500 bg-rose-100 shadow-md shadow-rose-200 animate-pulse";
                      } else if (isSearchMatch) {
                        cellStyle = isDark
                          ? "border-amber-400 bg-amber-400/20 ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-[1.04]"
                          : "border-amber-500 bg-amber-100 ring-2 ring-amber-500 ring-offset-2 scale-[1.04]";
                      } else if (isHovered) {
                        cellStyle = isDark
                          ? "border-[#E1E0CC] bg-[#E1E0CC]/15 shadow-xl scale-[1.03]"
                          : "border-slate-900 bg-slate-200 shadow-md scale-[1.03]";
                      } else if (isNeighbor) {
                        cellStyle = isDark
                          ? "border-[#E1E0CC]/40 bg-[#E1E0CC]/10"
                          : "border-blue-400 bg-blue-50";
                      }

                      return (
                        <div
                          key={`${r}-${c}`}
                          onMouseEnter={() => setHoveredCell({ r, c })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setInspectedCell({ r, c })}
                          className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border min-h-[96px] transition-all duration-150 cursor-pointer ${cellStyle}`}
                          title={`Desk ${deskLabel} (Click to inspect desk details)`}
                        >
                          <span
                            className={`absolute top-1.5 left-2 font-mono font-bold text-[10px] ${
                              isDark ? "text-[#E1E0CC]/50" : "text-slate-500"
                            }`}
                          >
                            {deskLabel}
                          </span>
                          <span
                            className={`absolute top-1.5 right-2 font-mono text-[9px] px-1.5 py-0.5 rounded-full border ${
                              isDark
                                ? "bg-white/5 text-[#E1E0CC]/60 border-white/10"
                                : "bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                          >
                            C{clrId}
                          </span>

                          {student ? (
                            <>
                              <div
                                className={`mt-3 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${getCourseBadge(
                                  student.code
                                )}`}
                              >
                                {student.code}
                              </div>
                              <div
                                className={`text-xs font-medium mt-1 ${
                                  isDark ? "text-[#E1E0CC]" : "text-slate-900"
                                }`}
                              >
                                {student.roll}
                              </div>
                              <div
                                className={`text-[10px] truncate max-w-[90%] text-center mt-0.5 ${
                                  isDark ? "text-[#E1E0CC]/60" : "text-slate-500"
                                }`}
                              >
                                {student.name}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className={`mt-3 px-2 py-0.5 rounded-md text-[11px] font-medium border border-dashed ${
                                  isDark
                                    ? "text-white/40 border-white/20 bg-white/5"
                                    : "text-slate-400 border-slate-300 bg-slate-100"
                                }`}
                              >
                                ---
                              </div>
                              <div
                                className={`text-xs mt-1 font-mono ${
                                  isDark ? "text-white/40" : "text-slate-400"
                                }`}
                              >
                                (Empty)
                              </div>
                              <div
                                className={`text-[10px] mt-0.5 ${
                                  isDark ? "text-white/30" : "text-slate-400"
                                }`}
                              >
                                -
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] opacity-60 pt-2 border-t border-white/5">
                  <span>💡 Tip: Click on any desk to inspect adjacent edges, neighbors, and clear seats.</span>
                  <span>Grid: {rows} Rows × {cols} Columns</span>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Course Legend */}
                <div
                  className={`rounded-2xl border p-4.5 backdrop-blur-xl shadow-md ${
                    isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Course Populations</span>
                    </h3>
                    <button
                      onClick={() => setIsStudentModalOpen(true)}
                      className="text-[11px] underline cursor-pointer opacity-75 hover:opacity-100"
                    >
                      + Manage
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {subjects.map((sub) => {
                      const count = students.filter((s) => s.code === sub.code).length;
                      return (
                        <div
                          key={sub.code}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                            isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${sub.dotColor}`} />
                            <span
                              className={
                                isDark
                                  ? "text-[#E1E0CC]/80 font-normal"
                                  : "text-slate-700 font-normal"
                              }
                            >
                              {sub.name} ({sub.code})
                            </span>
                          </div>
                          <span
                            className={`font-medium ${
                              isDark ? "text-[#E1E0CC]" : "text-slate-900"
                            }`}
                          >
                            {count} Students
                          </span>
                        </div>
                      );
                    })}

                    {/* Empty seats item */}
                    <div
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                        isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDark
                              ? "bg-white/40 border border-dashed border-white"
                              : "bg-slate-300 border border-dashed border-slate-400"
                          }`}
                        />
                        <span
                          className={
                            isDark
                              ? "text-[#E1E0CC]/80 font-normal"
                              : "text-slate-700 font-normal"
                          }
                        >
                          Unoccupied Seats
                        </span>
                      </div>
                      <span
                        className={`font-medium ${
                          isDark ? "text-[#E1E0CC]" : "text-slate-900"
                        }`}
                      >
                        {capacity - occupiedCount} Seats
                      </span>
                    </div>
                  </div>
                </div>

                {/* Graph Theory Topology Stats */}
                <div
                  className={`rounded-2xl border p-4.5 backdrop-blur-xl shadow-md ${
                    isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                  }`}
                >
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                      isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Graph Topologic Metrics</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="opacity-60 text-[10px] uppercase">Vertices |V|</div>
                      <div className="font-bold text-sm mt-0.5">{graphStats.vertices} Nodes</div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="opacity-60 text-[10px] uppercase">Edges |E|</div>
                      <div className="font-bold text-sm mt-0.5">{graphStats.edges} Edges</div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="opacity-60 text-[10px] uppercase">Max Degree &Delta;(G)</div>
                      <div className="font-bold text-sm mt-0.5">{graphStats.maxDegree} Degree</div>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="opacity-60 text-[10px] uppercase">Indep. Bound &alpha;(G)</div>
                      <div className="font-bold text-sm mt-0.5">{graphStats.alphaBound} Desks</div>
                    </div>
                  </div>
                </div>

                {/* Pigeonhole Explorer */}
                <div
                  className={`rounded-2xl border p-4.5 backdrop-blur-xl shadow-md ${
                    isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
                  }`}
                >
                  <h3
                    className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                      isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pigeonhole Feasibility Bound</span>
                  </h3>
                  <div
                    className={`rounded-xl border p-3.5 flex flex-col gap-3 ${
                      isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-between text-xs ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      <span>Largest Course Cohort:</span>
                      <strong
                        className={`text-sm ${isDark ? "text-[#E1E0CC]" : "text-slate-900"}`}
                      >
                        {maxCohortSize} Students
                      </strong>
                    </div>

                    <div
                      className={`flex items-center justify-between text-xs ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      <span>Max Independent Set &alpha;(G):</span>
                      <strong
                        className={`text-sm ${isDark ? "text-[#E1E0CC]" : "text-slate-900"}`}
                      >
                        {graphStats.alphaBound} Desks
                      </strong>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold border ${
                        isPhpFeasible
                          ? isDark
                            ? "bg-emerald-400/15 text-emerald-300 border-emerald-400/30"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : isDark
                          ? "bg-rose-400/15 text-rose-300 border-rose-400/30"
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {isPhpFeasible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0" /> Zero-Conflict Achievable
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 shrink-0" /> Mathematically Impossible
                        </>
                      )}
                    </div>

                    <p
                      className={`text-[11px] leading-relaxed font-normal ${
                        isDark ? "text-[#E1E0CC]/60" : "text-slate-600"
                      }`}
                    >
                      {isPhpFeasible
                        ? `Largest course cohort size (${maxCohortSize}) ≤ maximum independent set α(G) (${graphStats.alphaBound}). Zero conflicts mathematically achievable without adjacent overlaps.`
                        : `By Dirichlet's Pigeonhole Principle, placing ${maxCohortSize} candidates of the same exam into at most ${graphStats.alphaBound} independent positions forces at least two candidates into adjacent desks!`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <section
              className={`rounded-2xl border p-5 backdrop-blur-xl shadow-md ${
                isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
              }`}
            >
              <h2
                className={`text-sm md:text-base font-medium mb-3 ${
                  isDark ? "text-[#E1E0CC]" : "text-slate-900"
                }`}
              >
                Analytical Method Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr
                      className={`border-b font-medium ${
                        isDark
                          ? "border-white/10 bg-black/40 text-[#E1E0CC]/60"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Approach</th>
                      <th className="py-2.5 px-3">Theoretical Guarantee</th>
                      <th className="py-2.5 px-3">Computational Complexity</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/10" : "divide-slate-200"}`}>
                    <tr className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                      <td
                        className={`py-3 px-3 font-medium ${
                          isDark ? "text-[#E1E0CC]" : "text-slate-900"
                        }`}
                      >
                        1. Random Baseline
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                        Stochastic Unconstrained
                      </td>
                      <td className="py-3 px-3 text-rose-500 font-semibold">High Collisions (Unbounded)</td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>O(N)</td>
                    </tr>
                    <tr className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                      <td
                        className={`py-3 px-3 font-medium ${
                          isDark ? "text-[#E1E0CC]" : "text-slate-900"
                        }`}
                      >
                        2. Graph Pattern Colouring
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                        Parity / Modular Graph Coloring
                      </td>
                      <td className="py-3 px-3 text-emerald-500 font-semibold">Provably Zero (If Feasible)</td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>O(N)</td>
                    </tr>
                    <tr className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                      <td
                        className={`py-3 px-3 font-medium ${
                          isDark ? "text-[#E1E0CC]" : "text-slate-900"
                        }`}
                      >
                        3. Greedy DSatur Heuristic
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                        Saturation Degree & Neighborhood Greedy
                      </td>
                      <td className="py-3 px-3 text-emerald-500 font-semibold">&le; &Delta;(G) + 1 Colors</td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>O(V²)</td>
                    </tr>
                    <tr className={isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}>
                      <td
                        className={`py-3 px-3 font-medium ${
                          isDark ? "text-[#E1E0CC]" : "text-slate-900"
                        }`}
                      >
                        4. Hill Climbing (2-Opt)
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>
                        Monotonic Local Desks Swaps
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/80" : "text-slate-700"}`}>
                        Monotonically Non-Increasing Risk
                      </td>
                      <td className={`py-3 px-3 ${isDark ? "text-[#E1E0CC]/60" : "text-slate-500"}`}>O(K &bull; N)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Proofs Accordion */}
            <section
              className={`rounded-2xl border p-5 backdrop-blur-xl shadow-md ${
                isDark ? "bg-black/60 border-white/15" : "bg-white/90 border-slate-300"
              }`}
            >
              <button
                onClick={() => setShowTheory(!showTheory)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <h2
                  className={`text-sm md:text-base font-medium ${
                    isDark ? "text-[#E1E0CC]" : "text-slate-900"
                  }`}
                >
                  Discrete Mathematics Theoretical Foundations
                </h2>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    isDark ? "text-[#E1E0CC]" : "text-slate-800"
                  }`}
                >
                  {showTheory ? (
                    <>
                      <ChevronUp className="w-4 h-4" /> Collapse Proofs
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" /> Expand Proofs
                    </>
                  )}
                </span>
              </button>

              {showTheory && (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t ${
                    isDark ? "border-white/10" : "border-slate-200"
                  }`}
                >
                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                        isDark ? "text-[#E1E0CC]" : "text-slate-900"
                      }`}
                    >
                      Theorem 1: Bipartiteness of Grid Graph
                    </h4>
                    <p
                      className={`text-xs leading-relaxed font-normal ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      Two seats (r₁, c₁) and (r₂, c₂) are adjacent iff |r₁ - r₂| + |c₁ - c₂| = 1.
                      The parity (r + c) mod 2 strictly alternates across every edge. Thus, all closed
                      cycles have even length. By <strong>König's Theorem</strong>, a graph has no odd
                      cycles iff it is bipartite (&chi;(G) = 2).
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                        isDark ? "text-[#E1E0CC]" : "text-slate-900"
                      }`}
                    >
                      Theorem 2: 4-Colourability of King's Graph
                    </h4>
                    <p
                      className={`text-xs leading-relaxed font-normal ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      Every 2×2 block forms a complete subgraph K₄ where all pairs share an edge. Since
                      &chi;(G) &ge; &omega;(G) = 4, at least 4 colours are necessary. Modular formula
                      colour(r, c) = (r mod 2)×2 + (c mod 2) guarantees adjacent seats never share
                      coordinates modulo 2.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                        isDark ? "text-[#E1E0CC]" : "text-slate-900"
                      }`}
                    >
                      Theorem 3: Pigeonhole Feasibility Bound
                    </h4>
                    <p
                      className={`text-xs leading-relaxed font-normal ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      To achieve zero conflicts, each course cohort C must sit in an{" "}
                      <strong>independent set</strong>. If |C| &gt; &alpha;(G), by Dirichlet's Pigeonhole
                      Principle, at least two students must occupy adjacent seats, making zero
                      conflicts mathematically impossible.
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-xl border ${
                      isDark ? "bg-black/50 border-white/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <h4
                      className={`text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                        isDark ? "text-[#E1E0CC]" : "text-slate-900"
                      }`}
                    >
                      Theorem 4: Greedy Colouring Bound &Delta;(G) + 1
                    </h4>
                    <p
                      className={`text-xs leading-relaxed font-normal ${
                        isDark ? "text-[#E1E0CC]/70" : "text-slate-600"
                      }`}
                    >
                      A sequential greedy vertex colouring uses at most &Delta;(G) + 1 colours. Since a
                      vertex has at most &Delta;(G) neighbours, at least one colour from {"{0, 1, ..., Δ(G)}"} remains
                      free for each node during assignment.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </main>

          {/* Footer */}
          <footer
            className={`border-t px-4 py-4 text-center text-xs mt-8 transition-colors ${
              isDark
                ? "border-white/10 bg-black/80 text-[#E1E0CC]/60"
                : "border-slate-200 bg-white/80 text-slate-500"
            }`}
          >
            <p>
              Discrete Mathematics Project &bull;{" "}
              <strong className={isDark ? "text-[#E1E0CC]" : "text-slate-800"}>
                Graph-Theoretic Exam Seating Arrangement
              </strong>
            </p>
          </footer>
        </div>
      </div>

      {/* Modals */}
      <StudentSubjectManagerModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        subjects={subjects}
        onAddStudent={handleAddStudent}
        onDeleteStudent={handleDeleteStudent}
        onAddSubject={handleAddSubject}
        onDeleteSubject={handleDeleteSubject}
        onResetToDefault={handleResetToDefault}
        isDark={isDark}
      />

      <HallConfigModal
        isOpen={isHallModalOpen}
        onClose={() => setIsHallModalOpen(false)}
        rows={rows}
        cols={cols}
        totalStudents={students.length}
        onApplyConfig={(newR, newC) => {
          setRows(newR);
          setCols(newC);
        }}
        isDark={isDark}
      />

      <DeskInspectorModal
        cell={inspectedCell}
        onClose={() => setInspectedCell(null)}
        grid={grid}
        rows={rows}
        cols={cols}
        withDiag={includeDiagonals}
        subjects={subjects}
        isDark={isDark}
        onClearSeat={handleClearSeat}
      />

      <PrintManifestModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        grid={grid}
        rows={rows}
        cols={cols}
        conflicts={score}
        withDiag={includeDiagonals}
        isDark={isDark}
      />
    </div>
  );
}
