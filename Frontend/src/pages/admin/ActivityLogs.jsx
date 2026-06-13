import { useState } from 'react';
import {
  History,
  LogIn,
  UserPlus,
  UserCog,
  Briefcase,
  FilePenLine,
  ClipboardCheck,
  RefreshCcw,
  Building2,
  Megaphone,
} from 'lucide-react';
import { useAllActivity } from '../../hooks/useActivity.js';
import { Select } from '../../components/Input.jsx';
import { GlassCard } from '../../components/Card.jsx';
import { Badge } from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import { timeAgo } from '../../utils/format.js';

const ACTION_META = {
  LOGIN: { icon: LogIn, tone: 'bg-primary/10 text-primary' },
  REGISTER: { icon: UserPlus, tone: 'bg-success/10 text-success' },
  PROFILE_UPDATED: { icon: UserCog, tone: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
  JOB_CREATED: { icon: Briefcase, tone: 'bg-primary/10 text-primary' },
  JOB_UPDATED: { icon: FilePenLine, tone: 'bg-warning/10 text-warning' },
  APPLICATION_SUBMITTED: { icon: ClipboardCheck, tone: 'bg-primary/10 text-primary' },
  APPLICATION_STATUS_CHANGED: { icon: RefreshCcw, tone: 'bg-success/10 text-success' },
  COMPANY_CREATED: { icon: Building2, tone: 'bg-primary/10 text-primary' },
  NOTIFICATION_SENT: { icon: Megaphone, tone: 'bg-warning/10 text-warning' },
};

const ACTION_OPTIONS = Object.keys(ACTION_META).map((action) => ({
  value: action,
  label: action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const ActivityLogs = () => {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAllActivity({ action: action || undefined, page, limit: 20 });
  const activity = data?.activity || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Activity logs</h1>
          <p className="mt-1 text-sm text-slate-400">A live trail of what's happening across the platform.</p>
        </div>
        <Select
          options={ACTION_OPTIONS}
          placeholder="All actions"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          wrapperClassName="sm:w-60"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : activity.length === 0 ? (
        <EmptyState icon={History} title="No activity found" description="Try a different action filter." />
      ) : (
        <div className="space-y-3">
          {activity.map((entry) => {
            const meta = ACTION_META[entry.action] || ACTION_META.PROFILE_UPDATED;
            const Icon = meta.icon;
            const user = entry.userId;
            return (
              <GlassCard key={entry._id} className="flex items-start gap-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Avatar src={user?.profilePicture} name={user?.name} size="sm" />
                    <p className="font-medium text-slate-700 dark:text-slate-100">{user?.name || 'Unknown user'}</p>
                    <Badge>{entry.action.replace(/_/g, ' ')}</Badge>
                    {user?.role && <Badge tone="primary">{user.role}</Badge>}
                  </div>
                  {entry.description && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{entry.description}</p>}
                  <p className="mt-2 text-xs text-slate-400">{timeAgo(entry.timestamp || entry.createdAt)}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
};

export default ActivityLogs;
