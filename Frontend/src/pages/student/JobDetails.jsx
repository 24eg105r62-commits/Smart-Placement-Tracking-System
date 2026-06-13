import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  CalendarClock,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react';
import { useJob, useJobEligibility } from '../../hooks/useJobs.js';
import { useApplyToJob, useMyApplications } from '../../hooks/useApplications.js';
import { GlassCard } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import Badge, { StatusPill } from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { formatDate, formatPackage, daysUntil } from '../../utils/format.js';

const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: job, isLoading } = useJob(jobId);
  const { data: eligibility, isLoading: isEligibilityLoading } = useJobEligibility(jobId);
  const { data: myApplications } = useMyApplications();
  const applyToJob = useApplyToJob();

  const existingApplication = myApplications?.find((app) => app.jobId?._id === jobId || app.jobId === jobId);
  const days = job ? daysUntil(job.deadline) : null;
  const isClosed = days !== null && days < 0;

  const handleApply = async () => {
    try {
      await applyToJob.mutateAsync(jobId);
      toast.success('Application submitted successfully!');
      setConfirmOpen(false);
    } catch (err) {
      const message = err?.response?.data?.message || 'Could not submit your application';
      toast.error(message);
      setConfirmOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!job) {
    return <EmptyState title="Job not found" description="This job may have been removed." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <GlassCard className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {job.companyId?.logo ? (
                <img src={job.companyId.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </span>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-white">{job.title}</h1>
              <Link to="/student/companies" className="text-sm text-primary hover:text-primary-700">
                {job.companyId?.name}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4" /> {formatPackage(job.package)}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" />
                  Deadline {formatDate(job.deadline)}
                  {days !== null && (
                    <span className={isClosed ? 'text-danger' : days <= 3 ? 'text-warning' : ''}>
                      {' '}
                      ({isClosed ? 'closed' : days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} left`})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {existingApplication ? (
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs text-slate-400">You've applied to this role</span>
                <StatusPill status={existingApplication.status} />
              </div>
            ) : isClosed ? (
              <Badge tone="neutral">Applications closed</Badge>
            ) : (
              <Button
                icon={Send}
                onClick={() => setConfirmOpen(true)}
                isLoading={applyToJob.isPending}
                disabled={eligibility && !eligibility.eligible}
              >
                Apply now
              </Button>
            )}
            {eligibility && !eligibility.eligible && !existingApplication && (
              <p className="max-w-55 text-right text-xs text-danger">You don't meet all eligibility criteria yet.</p>
            )}
          </div>
        </div>

        {confirmOpen && !existingApplication && (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Submit your application for <span className="font-semibold">{job.title}</span> at{' '}
              <span className="font-semibold">{job.companyId?.name}</span>?
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} isLoading={applyToJob.isPending}>
                Confirm &amp; apply
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {job.description && (
            <GlassCard>
              <h2 className="mb-3 font-semibold text-slate-800 dark:text-white">About the role</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{job.description}</p>
            </GlassCard>
          )}

          {job.requiredSkills?.length > 0 && (
            <GlassCard>
              <h2 className="mb-3 font-semibold text-slate-800 dark:text-white">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => {
                  const missing = eligibility?.checks?.skills?.missing?.includes(skill);
                  return (
                    <span
                      key={skill}
                      className={`badge ${missing ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}
                    >
                      {missing ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>

        <GlassCard className="h-fit">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap className="h-4.5 w-4.5 text-primary" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Eligibility check</h2>
          </div>

          {isEligibilityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : eligibility ? (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-2 rounded-xl px-3.5 py-3 text-sm font-medium ${
                  eligibility.eligible ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}
              >
                {eligibility.eligible ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {eligibility.status}
              </div>

              <CheckRow
                label="Minimum CGPA"
                passed={eligibility.checks.cgpa.passed}
                detail={`Requires ≥ ${eligibility.checks.cgpa.required} · You have ${eligibility.checks.cgpa.actual ?? 'N/A'}`}
              />
              <CheckRow
                label="Eligible branches"
                passed={eligibility.checks.branch.passed}
                detail={
                  eligibility.checks.branch.required.length
                    ? `Open to ${eligibility.checks.branch.required.join(', ')} · You're ${eligibility.checks.branch.actual ?? 'N/A'}`
                    : 'Open to all branches'
                }
              />
              <CheckRow
                label="Required skills"
                passed={eligibility.checks.skills.passed}
                detail={
                  eligibility.checks.skills.required.length
                    ? eligibility.checks.skills.missing.length
                      ? `Missing: ${eligibility.checks.skills.missing.join(', ')}`
                      : 'You have all required skills'
                    : 'No specific skills required'
                }
              />
            </div>
          ) : (
            <p className="text-sm text-slate-400">Complete your student profile to see your eligibility.</p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

const CheckRow = ({ label, passed, detail }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-100 px-3.5 py-3 dark:border-slate-800">
    {passed ? (
      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" />
    ) : (
      <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" />
    )}
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{label}</p>
      <p className="text-xs text-slate-400">{detail}</p>
    </div>
  </div>
);

export default JobDetails;
