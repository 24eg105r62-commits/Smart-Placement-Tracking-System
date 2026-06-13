import {
  LayoutDashboard,
  User,
  Building2,
  Briefcase,
  FileText,
  Bell,
  Users,
  ClipboardList,
  ScrollText,
  Send,
} from 'lucide-react';

export const NAV_ITEMS = {
  STUDENT: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'My Profile', icon: User },
    { to: '/student/companies', label: 'Companies', icon: Building2 },
    { to: '/student/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  RECRUITER: [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
    { to: '/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
    { to: '/recruiter/applicants', label: 'Applicants', icon: Users },
    { to: '/recruiter/notifications', label: 'Notifications', icon: Bell },
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/recruiters', label: 'Recruiters', icon: User },
    { to: '/admin/companies', label: 'Companies', icon: Building2 },
    { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
    { to: '/admin/notifications', label: 'Notifications', icon: Send },
    { to: '/admin/activity', label: 'Activity Logs', icon: ScrollText },
  ],
};
