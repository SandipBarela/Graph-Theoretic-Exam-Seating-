import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
const navItems = ["Our story", "Collective", "Workshops", "Programs", "Inquiries"];

interface PrismaHeroProps {
  onJoinLab?: () => void;
}

const PrismaHero = ({ onJoinLab }: PrismaHeroProps) => {
  const { theme } = useTheme();

  return (
    <section className="h-screen w-full">
      <div className={`relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem] transition-colors duration-500 ${
        theme === "dark" ? "bg-black" : "bg-[#f4f3ec]"
      }`}>
        
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            theme === "dark" ? "opacity-100" : "opacity-45 filter contrast-125 brightness-110"
          }`}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.6] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          theme === "dark"
            ? "bg-gradient-to-b from-black/40 via-transparent to-black/70"
            : "bg-gradient-to-b from-white/30 via-transparent to-white/70"
        }`} />

        {/* Navbar */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className={`flex items-center gap-3 rounded-b-2xl px-4 py-2 sm:gap-6 md:gap-10 md:rounded-b-3xl md:px-8 lg:gap-12 transition-colors duration-300 ${
            theme === "dark" ? "bg-black/90 text-[#E1E0CC] border-b border-x border-white/10" : "bg-white/90 text-slate-800 border-b border-x border-slate-200 shadow-md"
          }`}>
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-[10px] transition-colors sm:text-xs md:text-sm font-medium"
                style={{ color: theme === "dark" ? "rgba(225, 224, 204, 0.8)" : "rgba(30, 41, 59, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = theme === "dark" ? "#E1E0CC" : "#0f172a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = theme === "dark" ? "rgba(225, 224, 204, 0.8)" : "rgba(30, 41, 59, 0.8)")}
              >
                {item}
              </a>
            ))}
            <div className="pl-2 border-l border-white/20">
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Hero content */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center px-4 py-16 sm:px-6 md:px-12 lg:px-16">
          <div className="grid w-full grid-cols-12 items-center gap-8 lg:gap-12">
            
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.93] tracking-[-0.04em] text-[11vw] sm:text-[9vw] md:text-[7.2vw] lg:text-[6.2vw] xl:text-[5.4vw] drop-shadow-md"
                style={{ color: theme === "dark" ? "#E1E0CC" : "#1a1a1a" }}
              >
                <WordsPullUp text="Graph-Theoretic Exam Seating" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-sm md:text-base max-w-md font-normal leading-relaxed drop-shadow"
                style={{ color: theme === "dark" ? "rgba(225, 224, 204, 0.88)" : "rgba(20, 20, 20, 0.88)" }}
              >
                Smarter Seating, Fewer Conflicts. Powered by Graph Theory, Optimized by Algorithms. Building Fairer Exams, One Seat at a Time.
              </motion.p>

              <motion.button
                onClick={onJoinLab}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`group inline-flex items-center gap-2 self-start rounded-full py-1 pl-5 pr-1 text-sm font-medium transition-all hover:gap-3 sm:text-base cursor-pointer shadow-xl ${
                  theme === "dark"
                    ? "bg-[#E1E0CC] text-black hover:bg-white"
                    : "bg-black text-[#E1E0CC] hover:bg-zinc-800"
                }`}
              >
                Join the lab
                <span className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:scale-110 sm:h-10 sm:w-10 ${
                  theme === "dark" ? "bg-black text-[#E1E0CC]" : "bg-[#E1E0CC] text-black"
                }`}>
                  <ArrowRight className="h-4 w-4" style={{ color: theme === "dark" ? "#E1E0CC" : "#000" }} />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { PrismaHero };
