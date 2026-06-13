import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  CalendarCheck,
  Trophy,
  XCircle,
  Clock3,
  MailCheck,
  Circle,
} from 'lucide-react';
import { useMyNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/useNotifications.js';
import { GlassCard } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import { timeAgo } from '../../utils/format.js';

const TYPE_META = {
  JOB_POSTED: { icon: Briefcase, tone: 'bg-primary/10 text-primary' },
  SHORTLISTED: { icon: CheckCircle2, tone: 'bg-warning/10 text-warning' },
  INTERVIEW_SCHEDULED: { icon: CalendarCheck, tone: 'bg-primary/10 text-primary' },
  SELECTED: { icon: Trophy, tone: 'bg-success/10 text-success' },
  REJECTED: { icon: XCircle, tone: 'bg-danger/10 text-danger' },
  DEADLINE: { icon: Clock3, tone: 'bg-warning/10 text-warning' },
  GENERAL: { icon: Bell, tone: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

const Notifications = () => {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading } = useMyNotifications({ unreadOnly: unreadOnly ? 'true' : undefined });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update notifications');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-800 dark:text-white">
            Notifications
            {unreadCount > 0 && <span className="badge bg-primary/10 text-primary">{unreadCount} new</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Stay on top of new postings and application updates.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            Unread only
          </label>
          <Button
            variant="secondary"
            icon={MailCheck}
            onClick={handleMarkAllRead}
            isLoading={markAllAsRead.isPending}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={unreadOnly ? "You're all caught up" : 'No notifications yet'}
          description={unreadOnly ? 'No unread notifications right now.' : "You'll see job postings and application updates here."}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((note) => {
            const meta = TYPE_META[note.type] || TYPE_META.GENERAL;
            const Icon = meta.icon;
            return (
              <GlassCard
                key={note._id}
                className={`flex items-start gap-4 transition ${!note.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-700 dark:text-slate-100">{note.title}</p>
                    {!note.isRead && <Circle className="mt-1 h-2 w-2 shrink-0 fill-primary text-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{note.message}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-slate-400">{timeAgo(note.createdAt)}</span>
                    {!note.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead.mutate(note._id)}
                        className="text-xs font-medium text-primary hover:text-primary-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
