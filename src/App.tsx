import { useState } from "react";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { PrismaHero } from "@/components/ui/prisma-hero";
import { ExamSeatingDashboard } from "@/components/ExamSeatingDashboard";

function MainContent() {
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard">("landing");
  const { theme } = useTheme();

  return (
    <main
      className={`min-h-screen w-full transition-colors duration-500 ${
        theme === "dark" ? "bg-black text-[#E1E0CC]" : "bg-[#ecebe4] text-slate-900"
      }`}
    >
      {currentPage === "landing" ? (
        <PrismaHero onJoinLab={() => setCurrentPage("dashboard")} />
      ) : (
        <ExamSeatingDashboard onBackToLanding={() => setCurrentPage("landing")} />
      )}
    </main>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}

export default App;
