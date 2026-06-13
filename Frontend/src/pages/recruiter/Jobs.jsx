import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Users, MapPin, IndianRupee, CalendarClock, X, Briefcase } from 'lucide-react';
import { useMyPostedJobs, useCreateJob, useUpdateJob, useDeleteJob } from '../../hooks/useJobs.js';
import { useMyRecruiterProfile } from '../../hooks/useRecruiter.js';
import { GlassCard } from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import { Input, Textarea } from '../../components/Input.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatDate, formatPackage, daysUntil } from '../../utils/format.js';
import { BRANCHES } from '../../utils/constants.js';

const emptyForm = {
  title: '',
  description: '',
  package: '',
  location: '',
  eligibilityCgpa: '',
  eligibleBranches: [],
  deadline: '',
  isActive: true,
};

const toDateInputValue = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const JobFormModal = ({ isOpen, onClose, job, onSubmit, isSaving }) => {
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm });

  useEffect(() => {
    if (!isOpen) return;
    if (job) {
      reset({
        title: job.title || '',
        description: job.description || '',
        package: job.package ?? '',
        location: job.location || '',
        eligibilityCgpa: job.eligibilityCgpa ?? '',
        eligibleBranches: job.eligibleBranches || [],
        deadline: toDateInputValue(job.deadline),
        isActive: job.isActive ?? true,
      });
      setSkills(job.requiredSkills || []);
    } else {
      reset(emptyForm);
      setSkills([]);
    }
    setSkillInput('');
  }, [isOpen, job, reset]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkills((prev) => [...prev, value]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  const submit = (values) => {
    onSubmit({
      ...values,
      package: Number(values.package),
      eligibilityCgpa: values.eligibilityCgpa === '' ? 0 : Number(values.eligibilityCgpa),
      requiredSkills: skills,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={job ? 'Edit job posting' : 'Post a new job'} size="lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Job title"
          placeholder="e.g. Backend Developer"
          error={errors.title?.message}
          {...register('title', { required: 'Title is required' })}
        />
        <Textarea label="Description" rows={4} placeholder="Describe the role, responsibilities and benefits…" {...register('description')} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Package (LPA)"
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 12"
            error={errors.package?.message}
            {...register('package', { required: 'Package is required', min: { value: 0, message: 'Must be 0 or more' } })}
          />
          <Input
            label="Minimum CGPA"
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="e.g. 7.5"
            error={errors.eligibilityCgpa?.message}
            {...register('eligibilityCgpa', { min: { value: 0, message: '0 - 10' }, max: { value: 10, message: '0 - 10' } })}
          />
          <Input
            label="Application deadline"
            type="date"
            error={errors.deadline?.message}
            {...register('deadline', { required: 'Deadline is required' })}
          />
        </div>

        <Input label="Location" placeholder="e.g. Bengaluru / Remote" {...register('location')} />

        <div>
          <p className="label">Eligible branches (leave empty for all branches)</p>
          <Controller
            control={control}
            name="eligibleBranches"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map((branch) => {
                  const checked = field.value?.includes(branch);
                  return (
                    <button
                      type="button"
                      key={branch}
                      onClick={() =>
                        field.onChange(checked ? field.value.filter((b) => b !== branch) : [...(field.value || []), branch])
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        checked
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 text-slate-500 hover:border-primary/30 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {branch}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <div>
          <p className="label">Required skills</p>
          <div className="flex gap-2">
            <Input
              placeholder="Type a skill and press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              wrapperClassName="flex-1"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="badge bg-primary/10 text-primary">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 rounded-full hover:text-primary-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {job && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30" {...register('isActive')} />
            Listing is active and visible to students
          </label>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {job ? 'Save changes' : 'Post job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const RecruiterJobs = () => {
  const { data: recruiter } = useMyRecruiterProfile();
  const { data: jobs, isLoading } = useMyPostedJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const hasCompany = Boolean(recruiter?.companyId);

  const openCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingJob) {
        await updateJob.mutateAsync({ id: editingJob._id, payload });
        toast.success('Job updated');
      } else {
        await createJob.mutateAsync(payload);
        toast.success('Job posted — eligible students have been notified');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save job');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteJob.mutateAsync(confirmDelete._id);
      toast.success('Job deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete job');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">My Job Postings</h1>
          <p className="mt-1 text-sm text-slate-400">Create, edit and track the roles you've posted.</p>
        </div>
        <Button icon={Plus} onClick={openCreate} disabled={!hasCompany}>
          Post a job
        </Button>
      </div>

      {!hasCompany && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          You need a company profile before you can post jobs.{' '}
          <Link to="/recruiter/company" className="font-medium text-primary hover:text-primary-700">
            Set it up now
          </Link>
          .
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job listing to start receiving applications."
          action={
            hasCompany && (
              <Button icon={Plus} onClick={openCreate}>
                Post a job
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const days = daysUntil(job.deadline);
            const isClosed = days !== null && days < 0;
            return (
              <GlassCard key={job._id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-white">{job.title}</p>
                    <p className="text-xs text-slate-400">Posted {formatDate(job.createdAt)}</p>
                  </div>
                  <Badge tone={!job.isActive ? 'neutral' : isClosed ? 'danger' : 'success'}>
                    {!job.isActive ? 'Inactive' : isClosed ? 'Closed' : 'Active'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" /> {formatPackage(job.package)}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" /> {formatDate(job.deadline)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-700"
                  >
                    <Users className="h-4 w-4" /> View applicants
                  </Link>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(job)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(job)} className="rounded-lg p-2 text-slate-400 transition hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <JobFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        job={editingJob}
        onSubmit={handleSubmit}
        isSaving={createJob.isPending || updateJob.isPending}
      />

      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete job posting"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteJob.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <span className="font-semibold">{confirmDelete?.title}</span>? This cannot be undone and all
          related applications will remain on record.
        </p>
      </Modal>
    </div>
  );
};

export default RecruiterJobs;
