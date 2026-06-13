import { Link } from 'react-router-dom';
import { FileText, Users, CalendarCheck, Trophy, Building2, Clock3, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStudentDashboard } from '../../hooks/useDashboard.js';
import { StatCard, GlassCard } from '../../components/Card.jsx';
import { StatusPill } from '../../components/Badge.jsx';
import { CardSkeleton, Skeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatPackage, daysUntil } from '../../utils/format.js';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useStudentDashboard();

  const cards = data?.cards;
  const recentApplications = data?.recentApplications || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">Here's where your placement journey stands today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !cards ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Applications" value={cards.applied} icon={FileText} accent="primary" />
            <StatCard label="Shortlisted" value={cards.shortlisted} icon={Users} accent="warning" />
            <StatCard label="Interviews" value={cards.interviews} icon={CalendarCheck} accent="secondary" />
            <StatCard label="Selected" value={cards.selected} icon={Trophy} accent="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">Recent applications</h2>
            <Link to="/student/applications" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentApplications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Browse open jobs and apply to roles that match your profile."
              action={
                <Link to="/student/jobs" className="btn-primary">
                  Browse jobs
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentApplications.map((app) => (
                <li key={app._id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                      {app.jobId?.companyId?.logo ? (
                        <img src={app.jobId.companyId.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{app.jobId?.title}</p>
                      <p className="text-xs text-slate-400">
                        {app.jobId?.companyId?.name} · Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={app.status} />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-4.5 w-4.5 text-warning" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Upcoming deadlines</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : upcomingDeadlines.length === 0 ? (
            <EmptyState title="Nothing closing soon" description="You're all caught up on deadlines." />
          ) : (
            <ul className="space-y-3">
              {upcomingDeadlines.map((job) => {
                const days = daysUntil(job.deadline);
                return (
                  <li key={job._id}>
                    <Link
                      to={`/student/jobs/${job._id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-3 transition hover:border-primary/30 hover:bg-primary/5 dark:border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{job.title}</p>
                        <p className="text-xs text-slate-400">
                          {job.companyId?.name} · {formatPackage(job.package)}
                        </p>
                      </div>
                      <span className={`badge ${days <= 2 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                        {days === 0 ? 'Today' : days === 1 ? '1 day left' : `${days} days left`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default StudentDashboard;
