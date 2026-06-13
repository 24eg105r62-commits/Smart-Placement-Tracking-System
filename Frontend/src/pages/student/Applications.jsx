import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, IndianRupee, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useMyApplications } from '../../hooks/useApplications.js';
import { GlassCard } from '../../components/Card.jsx';
import { StatusPill } from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import { formatDate, formatPackage } from '../../utils/format.js';
import { APPLICATION_STATUS_VALUES } from '../../utils/constants.js';

const TRACKER_STEPS = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected'];

const STATUS_FILTERS = ['All', ...APPLICATION_STATUS_VALUES];

const StatusTracker = ({ status }) => {
  if (status === 'Rejected') {
    return (
      <div className="flex items-center gap-2 text-sm text-danger">
        <XCircle className="h-4 w-4" />
        Application not progressed
      </div>
    );
  }

  const currentIndex = TRACKER_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {TRACKER_STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const isLast = index === TRACKER_STEPS.length - 1;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                  reached ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                }`}
              >
                {reached ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span className={`max-w-20 text-center text-[11px] leading-tight ${reached ? 'font-medium text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {!isLast && <span className={`mx-1.5 mb-4 h-0.5 w-8 sm:w-14 ${index < currentIndex ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`} />}
          </div>
        );
      })}
    </div>
  );
};

const Applications = () => {
  const [filter, setFilter] = useState('All');
  const { data: applications, isLoading } = useMyApplications();

  const filtered = (applications || []).filter((app) => filter === 'All' || app.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">My Applications</h1>
        <p className="mt-1 text-sm text-slate-400">Track the progress of every role you've applied to.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              filter === status
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 text-slate-500 hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:text-slate-400'
            }`}
          >
            {status}
            {status !== 'All' && applications && (
              <span className="ml-1.5 text-slate-400">{applications.filter((a) => a.status === status).length}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={filter === 'All' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
          description={filter === 'All' ? "Browse open jobs and apply to roles that fit your profile." : 'Try a different filter to see other applications.'}
          action={
            filter === 'All' && (
              <Link to="/student/jobs" className="btn-primary">
                Browse jobs
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <GlassCard key={app._id} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                    {app.jobId?.companyId?.logo ? (
                      <img src={app.jobId.companyId.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <Link to={`/student/jobs/${app.jobId?._id}`} className="flex items-center gap-1 font-semibold text-slate-800 hover:text-primary dark:text-white">
                      {app.jobId?.title} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <p className="text-xs text-slate-400">{app.jobId?.companyId?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <IndianRupee className="h-3.5 w-3.5" /> {formatPackage(app.jobId?.package)}
                  </span>
                  <StatusPill status={app.status} />
                </div>
              </div>

              <div className="overflow-x-auto border-t border-slate-100 pt-4 dark:border-slate-800">
                <StatusTracker status={app.status} />
              </div>

              <p className="text-xs text-slate-400">Applied on {formatDate(app.createdAt)}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
