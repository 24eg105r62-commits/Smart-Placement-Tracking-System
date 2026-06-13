import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, GraduationCap, BarChart3, ShieldCheck, Star } from 'lucide-react';
import { useThemeStore } from '../store/themeStore.js';

const HIGHLIGHTS = [
  { icon: GraduationCap, text: 'Track every application from "Applied" to "Selected" in one place.' },
  { icon: BarChart3, text: 'Live placement analytics for admins — branch-wise, company-wise, month-wise.' },
  { icon: ShieldCheck, text: 'Smart eligibility checks so students only chase the roles they qualify for.' },
];

const PanelBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Base deep-purple gradient — identical to landing hero card */}
    <div className="absolute inset-0 bg-linear-to-b from-[#0D0028] via-[#2D0A5E] to-[#5B18A6]" />

    {/* Purple lavender terrain hills */}
    <div className="absolute -bottom-8 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-[50%_50%_0_0] bg-violet-600/55 blur-2xl" />
    <div className="absolute -bottom-4 left-1/2 h-32 w-full -translate-x-1/2 rounded-[50%_50%_0_0] bg-violet-500/40 blur-xl" />

    {/* Golden / amber grass — left */}
    <div className="absolute -bottom-6 -left-12 h-48 w-80 rounded-full bg-amber-500/55 blur-2xl" />
    <div className="absolute bottom-0 left-0 h-28 w-52 rounded-full bg-amber-400/45 blur-xl" />

    {/* Pink flowering trees — right */}
    <div className="absolute bottom-[16%] -right-12 h-72 w-72 rounded-full bg-pink-400/45 blur-2xl" />
    <div className="absolute bottom-[34%] right-[10%] h-40 w-40 rounded-full bg-pink-300/30 blur-xl" />

    {/* Misty river glow — centre */}
    <div className="absolute bottom-[6%] left-1/2 h-14 w-72 -translate-x-1/2 rounded-full bg-white/12 blur-3xl" />

    {/* Sky vignette top */}
    <div className="absolute left-0 right-0 top-0 h-44 bg-linear-to-b from-[#0D0028]/90 to-transparent" />

    {/* Side vignettes */}
    <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#0D0028]/50 to-transparent" />
    <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#0D0028]/50 to-transparent" />

    {/* Subtle sparkle dots */}
    {['top-[10%] left-[20%]', 'top-[7%] left-[50%]', 'top-[15%] right-[25%]', 'top-[5%] right-[45%]'].map((cls, i) => (
      <div key={i} className={`absolute h-1 w-1 rounded-full bg-white/60 ${cls}`} />
    ))}
  </div>
);

const AuthLayout = () => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left panel — hero card background ─────────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <PanelBackground />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Star className="h-5 w-5 fill-white text-white" />
          </span>
          <span className="text-lg font-semibold text-white">vSmart Placement</span>
        </Link>

        {/* Tagline + feature list */}
        <div className="relative space-y-6">
          <h1 className="text-3xl font-bold leading-snug text-white">
            Where colleges, recruiters and students meet to make placements simple.
          </h1>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/70">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-4 w-4 text-violet-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/30">© {new Date().getFullYear()} vSmart Placement. Built for smarter campus hiring.</p>
      </div>

      {/* ── Right panel — form ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-center bg-[#F4F1FF] px-6 py-12 dark:bg-[#0A0018] sm:px-12 lg:px-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/60 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="mx-auto w-full max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Mobile logo (shown when left panel is hidden) */}
            <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-base font-bold text-white">
                <Star className="h-4.5 w-4.5 fill-white" />
              </span>
              <span className="text-lg font-semibold text-slate-800 dark:text-white">vSmart Placement</span>
            </Link>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthLayout;
