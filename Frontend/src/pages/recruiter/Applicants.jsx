import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, FileText, ExternalLink, GraduationCap, Star, ChevronRight, Briefcase } from 'lucide-react';
import { useMyPostedJobs } from '../../hooks/useJobs.js';
import { useApplicationsForJob, useUpdateApplicationStatus } from '../../hooks/useApplications.js';
import { GlassCard } from '../../components/Card.jsx';
import { StatusPill } from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton, Skeleton } from '../../components/Skeleton.jsx';
import { formatDate, formatPackage } from '../../utils/format.js';
import { ALLOWED_STATUS_TRANSITIONS, APPLICATION_STATUS } from '../../utils/constants.js';

const STATUS_FILTERS = ['All', ...Object.values(APPLICATION_STATUS)];

const JobPicker = () => {
  const { data: jobs, isLoading } = useMyPostedJobs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post a job to start reviewing applicants." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <Link key={job._id} to={`/recruiter/jobs/${job._id}/applicants`}>
          <GlassCard className="flex h-full flex-col gap-2 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="font-semibold text-slate-800 dark:text-white">{job.title}</p>
            <p className="text-xs text-slate-400">{formatPackage(job.package)} · Closes {formatDate(job.deadline)}</p>
            <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
              <Users className="h-4 w-4" /> View applicants <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
};

const ApplicantCard = ({ application }) => {
  const updateStatus = useUpdateApplicationStatus();
  const student = application.studentId;
  const user = student?.userId;
  const nextStatuses = ALLOWED_STATUS_TRANSITIONS[application.status] || [];

  const handleStatusChange = async (status) => {
    try {
      await updateStatus.mutateAsync({ id: application._id, status });
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Avatar src={user?.profilePicture} name={user?.name} />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> {student?.branch}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5" /> CGPA {student?.cgpa ?? 'N/A'}
              </span>
              <span>Roll # {student?.rollNumber}</span>
            </div>
          </div>
        </div>
        <StatusPill status={application.status} />
      </div>

      {student?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {student.skills.map((skill) => (
            <span key={skill} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Applied {formatDate(application.createdAt)}</span>
          {student?.resumeUrl && (
            <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-medium text-primary hover:text-primary-700">
              <FileText className="h-3.5 w-3.5" /> Resume <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {nextStatuses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                  status === 'Rejected'
                    ? 'border-danger/30 text-danger hover:bg-danger/10'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                Move to {status}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs font-medium text-slate-400">Final status — no further action</span>
        )}
      </div>
    </GlassCard>
  );
};

const Applicants = () => {
  const { jobId } = useParams();
  const [filter, setFilter] = useState('All');
  const { data, isLoading } = useApplicationsForJob(jobId, filter !== 'All' ? { status: filter } : undefined);

  if (!jobId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Applicants</h1>
          <p className="mt-1 text-sm text-slate-400">Pick a job posting to review its applicants.</p>
        </div>
        <JobPicker />
      </div>
    );
  }

  const job = data?.job;
  const applications = data?.applications || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/recruiter/jobs" className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to my jobs
      </Link>

      {isLoading ? (
        <Skeleton className="h-10 w-64" />
      ) : (
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">{job?.title}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {applications.length} applicant{applications.length === 1 ? '' : 's'} · {formatPackage(job?.package)} · Closes {formatDate(job?.deadline)}
          </p>
        </div>
      )}

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
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState icon={Users} title="No applicants" description="No one matches this filter yet — check back later." />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicantCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
