import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Menu, X, ArrowRight,
  GraduationCap, Building2, ShieldCheck, Sparkles,
  BarChart3, Bell, FileCheck2, Users, Eye, Briefcase, Star,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore.js';
import { useTypewriter } from '../hooks/useTypewriter.js';
import { useCountUp } from '../hooks/useCountUp.js';
import { fetchSiteStats, trackVisit } from '../api/visitors.js';

const PHRASES = [
  'Grow through your placement journey.',
  'Find your dream job on campus.',
  'Hire the brightest fresh talent.',
  'Track every placement, live.',
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Smart eligibility checker', desc: 'See an instant CGPA, branch and skills breakdown for every job before you apply.' },
  { icon: FileCheck2, title: 'End-to-end application tracking', desc: 'A visual pipeline from Applied to Selected, with full status history and instant updates.' },
  { icon: BarChart3, title: 'Live analytics dashboards', desc: 'Role-aware charts for placements by branch, applications per company, and monthly trends.' },
  { icon: Bell, title: 'Real-time notifications', desc: 'New postings, shortlists, interview calls and results arrive straight in your feed.' },
  { icon: Building2, title: 'Company & job management', desc: 'Recruiters build a profile, post openings with eligibility criteria, and review applicants in one flow.' },
  { icon: Sparkles, title: 'Role-based experience', desc: 'Dedicated dashboards for students, recruiters and admins with a clean, responsive UI.' },
];

const ROLES = [
  {
    icon: GraduationCap,
    title: 'Students',
    color: 'from-violet-500 to-indigo-500',
    light: 'bg-violet-50 text-violet-700',
    points: ['Build a rich profile with skills, resume & CGPA', 'Check eligibility before you apply', 'Track every application status in real time'],
  },
  {
    icon: Briefcase,
    title: 'Recruiters',
    color: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50 text-emerald-700',
    points: ['Create a company profile with logo & details', 'Post jobs with custom eligibility criteria', 'Move applicants through a guided status pipeline'],
  },
  {
    icon: ShieldCheck,
    title: 'Admins',
    color: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50 text-amber-700',
    points: ['Platform-wide placement analytics', 'Manage every student, recruiter, company & job', 'Broadcast announcements & audit activity logs'],
  },
];

const PHOTOS = [12, 5, 47, 25, 33, 64, 9, 41, 16, 58, 27, 36];

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-72px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 28,
      }}
      transition={{ duration: 0.55, delay: isInView ? delay : 0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/* ── Dreamy CSS landscape inside the hero card ─────────────────────────────── */
const HeroBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Base deep-purple gradient */}
    <div className="absolute inset-0 bg-linear-to-b from-[#0D0028] via-[#2D0A5E] to-[#5B18A6]" />

    {/* Purple lavender terrain hills */}
    <div className="absolute -bottom-8 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-[50%_50%_0_0] bg-violet-600/55 blur-2xl" />
    <div className="absolute -bottom-4 left-1/2 h-32 w-full -translate-x-1/2 rounded-[50%_50%_0_0] bg-violet-500/40 blur-xl" />

    {/* Golden / amber grass — left */}
    <div className="absolute -bottom-6 -left-12 h-48 w-95 rounded-full bg-amber-500/55 blur-2xl" />
    <div className="absolute bottom-0 left-0 h-28 w-52 rounded-full bg-amber-400/45 blur-xl" />

    {/* Pink flowering trees — right */}
    <div className="absolute bottom-[16%] -right-12 h-72 w-72 rounded-full bg-pink-400/45 blur-2xl" />
    <div className="absolute bottom-[34%] right-[10%] h-40 w-40 rounded-full bg-pink-300/30 blur-xl" />

    {/* Misty river / water glow — centre */}
    <div className="absolute bottom-[6%] left-1/2 h-14 w-72 -translate-x-1/2 rounded-full bg-white/12 blur-3xl" />

    {/* Sky vignette top */}
    <div className="absolute left-0 right-0 top-0 h-44 bg-linear-to-b from-[#0D0028]/90 to-transparent" />

    {/* Side vignettes */}
    <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#0D0028]/60 to-transparent" />
    <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#0D0028]/60 to-transparent" />

    {/* Subtle star-like sparkles */}
    {[
      'top-[12%] left-[18%] h-1 w-1 opacity-70',
      'top-[8%]  left-[42%] h-1.5 w-1.5 opacity-50',
      'top-[18%] right-[22%] h-1 w-1 opacity-60',
      'top-[6%]  right-[38%] h-1 w-1 opacity-40',
    ].map((cls, i) => (
      <div key={i} className={`absolute rounded-full bg-white ${cls}`} />
    ))}
  </div>
);

/* ── Hero card navbar ───────────────────────────────────────────────────────── */
const HeroNav = ({ onMobileOpen }) => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <div className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-8">
      {/* Brand + Login (top-left) */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-white text-white" />
          </span>
          <span className="text-sm font-semibold text-white">vSmart Placement</span>
        </Link>
        <Link
          to="/login"
          className="hidden rounded-full px-4 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white sm:inline-flex"
        >
          Login
        </Link>
      </div>

      {/* Centre nav links */}
      <nav className="hidden items-center gap-7 md:flex">
        {[['#features', 'Features'], ['#roles', 'How it works'], ['#community', 'Community']].map(([href, label]) => (
          <a key={href} href={href} className="text-sm text-white/65 transition hover:text-white">
            {label}
          </a>
        ))}
      </nav>

      {/* Right: theme toggle + CTA */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggleTheme} className="hidden rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white sm:flex" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link
          to="/register"
          className="hidden rounded-full bg-white/15 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 md:inline-flex"
        >
          Sign up free
        </Link>
        <button type="button" onClick={onMobileOpen} className="rounded-full p-2 text-white/70 hover:bg-white/10 md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

/* ── Hero pill CTA (Bloom-style white pill + coloured circle arrow) ─────────── */
const HeroCTA = () => (
  <Link
    to="/register"
    className="group inline-flex items-center gap-3 rounded-full bg-white/92 py-2.5 pl-2.5 pr-7 shadow-xl shadow-black/20 backdrop-blur-sm transition hover:bg-white hover:shadow-2xl"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 transition group-hover:bg-lime-300">
      <ArrowRight className="h-4.5 w-4.5 text-slate-800 transition group-hover:translate-x-0.5" />
    </span>
    <span className="text-sm font-semibold text-slate-800">Get Started</span>
  </Link>
);

/* ── Full hero card ─────────────────────────────────────────────────────────── */
const HeroCard = ({ onMobileOpen }) => {
  const typed = useTypewriter(PHRASES);

  return (
    <div className="mx-4 overflow-hidden rounded-4xl border border-violet-300/20 shadow-[0_24px_80px_-8px_rgba(100,28,210,0.4)] sm:mx-6 md:mx-8 lg:mx-auto lg:max-w-6xl">
      <div className="relative min-h-140 sm:min-h-155">
        <HeroBackground />
        <HeroNav onMobileOpen={onMobileOpen} />

        {/* Centred hero text */}
        <div className="relative z-10 flex flex-col items-center px-6 pb-20 pt-12 text-center sm:pt-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            Smarter campus placements, end to end
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]"
          >
            <span>{typed}</span>
            <span className="ml-0.5 inline-block h-[0.85em] w-0.75 translate-y-1 animate-pulse bg-violet-300 align-middle" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mt-5 max-w-xl text-sm text-white/60 sm:text-base"
          >
            vSmart connects students, recruiters and placement cells in one elegant workspace —
            eligibility checks, live tracking, analytics and instant notifications, all built in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <HeroCTA />
            <a
              href="#features"
              className="text-sm font-medium text-white/60 transition hover:text-white"
            >
              Explore features ↓
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/* ── Sticky topbar (appears after hero card scrolls out) ────────────────────── */
const StickyBar = ({ heroRef }) => {
  const { theme, toggleTheme } = useThemeStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      setVisible(window.scrollY > heroRef.current.offsetHeight - 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroRef]);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 dark:border-slate-800/60 dark:bg-[#0D0028]/85 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white">
              <Star className="h-3.5 w-3.5 fill-white" />
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">vSmart</span>
          </Link>
          <Link to="/login" className="ml-1 rounded-full px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 transition hover:ring-violet-400 dark:text-slate-300 dark:ring-slate-700">
            Login
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/register" className="rounded-full bg-violet-600 px-5 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700">
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── Mobile nav drawer ──────────────────────────────────────────────────────── */
const MobileDrawer = ({ open, onClose }) => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 dark:bg-[#120040] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-800 dark:text-white">vSmart Placement</span>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {[['#features', 'Features'], ['#roles', 'How it works'], ['#community', 'Community']].map(([href, label]) => (
            <a key={href} href={href} onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
              {label}
            </a>
          ))}
          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
          <Link to="/login" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Login</Link>
          <Link to="/register" onClick={onClose} className="mt-1 rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-700">
            Sign up free
          </Link>
          <button type="button" onClick={toggleTheme} className="mt-2 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            {theme === 'dark' ? <><Sun className="h-4 w-4" /> Light mode</> : <><Moon className="h-4 w-4" /> Dark mode</>}
          </button>
        </nav>
      </div>
    </>
  );
};

/* ── Features ───────────────────────────────────────────────────────────────── */
const Features = () => (
  <section id="features" className="py-24">
    <div className="mx-auto max-w-6xl px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-500">Platform features</p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Everything a placement season needs
        </h2>
        <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
          Built for the way colleges actually run placements — from the first job posting to the final offer letter.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={i * 0.07}>
            <div className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-900/50 dark:text-violet-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-semibold text-slate-800 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── Roles ──────────────────────────────────────────────────────────────────── */
const Roles = () => (
  <section id="roles" className="bg-slate-50 py-24 dark:bg-slate-900/40">
    <div className="mx-auto max-w-6xl px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-500">How it works</p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          One platform, three perspectives
        </h2>
        <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
          Whether you're hunting for your first job, hiring fresh talent, or running the show — vSmart adapts to you.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ROLES.map(({ icon: Icon, title, color, light, points }, i) => (
          <Reveal key={title} delay={i * 0.09}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Gradient accent bar top */}
              <div className={`absolute left-0 right-0 top-0 h-1 bg-linear-to-r ${color}`} />
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${light} dark:bg-opacity-20`}>
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">{title}</h3>
              <ul className="mt-4 space-y-3">
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ── Community / student photos ─────────────────────────────────────────────── */
const Community = () => (
  <section id="community" className="py-24">
    <div className="mx-auto max-w-5xl px-6 text-center">
      <Reveal>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-500">Community</p>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Thousands of students are already a step ahead
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400">
          From first-year explorers to final-year offer-holders — vSmart is where campus careers take shape.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {PHOTOS.map((id, idx) => (
            <motion.img
              key={id}
              src={`https://i.pravatar.cc/160?img=${id}`}
              alt="student"
              loading="lazy"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileOutOfView={{ opacity: 0, scale: 0.85 }}
              viewport={{ margin: '-60px' }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              className={`h-16 w-16 rounded-2xl object-cover shadow-md ring-4 ring-white dark:ring-slate-900 sm:h-18 sm:w-18 ${idx % 4 === 1 ? '-translate-y-3' : idx % 4 === 3 ? 'translate-y-2' : ''}`}
            />
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10">
          <Link
            to="/register"
            className="group inline-flex items-center gap-3 rounded-full bg-violet-600 py-2.5 pl-2.5 pr-7 shadow-lg shadow-violet-400/30 transition hover:bg-violet-700 hover:shadow-xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-4 w-4 text-white transition group-hover:translate-x-0.5" />
            </span>
            <span className="text-sm font-semibold text-white">Create your free profile</span>
          </Link>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ── Stats / visitor counter ─────────────────────────────────────────────────── */
const StatItem = ({ icon: Icon, value, suffix = '', label }) => {
  const ref = useRef(null);
  const animated = useCountUp(value, ref);
  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
        {animated.toLocaleString('en-IN')}{suffix}
      </p>
      <p className="mt-1.5 text-sm text-violet-200">{label}</p>
    </div>
  );
};

const Stats = () => {
  const [stats, setStats] = useState({ visitors: 0, studentsPlaced: 0, companies: 0 });

  useEffect(() => {
    const SESSION_KEY = 'vsmart-visitor-tracked';
    const load = async () => {
      try {
        if (!sessionStorage.getItem(SESSION_KEY)) {
          const data = await trackVisit();
          sessionStorage.setItem(SESSION_KEY, '1');
          setStats(data);
        } else {
          const data = await fetchSiteStats();
          setStats(data);
        }
      } catch {
        // backend unreachable — stats stay at 0
      }
    };
    load();
  }, []);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-linear-to-br from-[#0D0028] via-[#3B0764] to-[#5B18A6]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-pink-500/15 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Trusted by a growing campus community</h2>
          <p className="mt-4 text-sm text-violet-200">Real numbers from students, recruiters and placement cells using vSmart today.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-14 grid grid-cols-3 gap-10">
            <StatItem icon={GraduationCap} value={stats.studentsPlaced} label="Students placed" />
            <StatItem icon={Building2} value={stats.companies} label="Hiring companies" />
            <StatItem icon={Eye} value={stats.visitors} label="Visitors and counting" />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Footer ─────────────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="border-t border-slate-800 bg-[#0D0028] py-10">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/80">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
        </span>
        <span className="text-sm font-medium text-white">vSmart Placement</span>
      </Link>
      <p className="text-xs text-slate-500">© {new Date().getFullYear()} vSmart Placement. Built for smarter campus hiring.</p>
    </div>
  </footer>
);

/* ── Root component ─────────────────────────────────────────────────────────── */
const Landing = () => {
  const heroRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F1FF] pt-8 sm:pt-12 dark:bg-[#0A0018]">
      {/* Sticky bar appears when hero scrolls out */}
      <StickyBar heroRef={heroRef} />

      {/* Mobile drawer */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Hero card — full Bloom-style floating card */}
      <div ref={heroRef}>
        <HeroCard onMobileOpen={() => setMobileOpen(true)} />
      </div>

      {/* Rest of page on lighter bg */}
      <div className="bg-white dark:bg-[#0A0018]">
        <Features />
        <Roles />
        <Community />
        <Stats />
        <Footer />
      </div>
    </div>
  );
};

export default Landing;
