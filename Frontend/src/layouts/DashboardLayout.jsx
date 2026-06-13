import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sun, Moon, LogOut, ChevronDown, Star, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useThemeStore } from '../store/themeStore.js';
import { NAV_ITEMS } from './navConfig.js';
import Avatar from '../components/Avatar.jsx';
import { useMyNotifications } from '../hooks/useNotifications.js';

const ROLE_LABEL = { ADMIN: 'Administrator', STUDENT: 'Student', RECRUITER: 'Recruiter' };
const NOTIF_PATH = { ADMIN: '/admin/notifications', STUDENT: '/student/notifications', RECRUITER: '/recruiter/notifications' };

const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const navItems = NAV_ITEMS[role] || [];
  const { data: notifData } = useMyNotifications({ unreadOnly: 'true' });
  const unreadCount = notifData?.unreadCount ?? 0;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch {
      toast.error('Something went wrong while logging out');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1FF] dark:bg-[#0A0018]">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar — always deep purple ───────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/8 bg-[#0D0028] transition-transform duration-200
          lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Subtle gradient glow inside sidebar */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-none">
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute -top-10 right-0 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex h-16 items-center border-b border-white/8 px-5">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Star className="h-4.5 w-4.5 fill-white text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">vSmart</p>
              <p className="text-[11px] text-white/40">{ROLE_LABEL[role]} Console</p>
            </div>
          </NavLink>
        </div>

        {/* Nav items */}
        <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/25'
                    : 'text-white/50 hover:bg-white/6 hover:text-white/90'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="relative border-t border-white/8 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main column ────────────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Header — always deep purple */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/8 bg-[#0D0028]/90 px-4 backdrop-blur-md sm:px-6">
          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Toggle dark / light mode"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Notification bell */}
          <button
            type="button"
            onClick={() => navigate(NOTIF_PATH[role] || '/')}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#0D0028]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-white/10"
            >
              <Avatar src={user?.profilePicture} name={user?.name} size="sm" />
              <span className="hidden text-sm sm:block">
                <span className="block font-medium text-white">{user?.name}</span>
                <span className="block text-xs text-white/40">{ROLE_LABEL[role]}</span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-white/40 sm:block" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 animate-fade-in overflow-hidden rounded-2xl border border-white/10 bg-[#1A0040] shadow-xl shadow-black/40">
                  <p className="truncate px-3 py-2.5 text-xs text-white/35">{user?.email}</p>
                  <div className="mx-2 mb-2 border-t border-white/8" />
                  <div className="px-1.5 pb-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
