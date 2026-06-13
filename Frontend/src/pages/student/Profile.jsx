import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FileText, Save, X, Download, Trash2 } from 'lucide-react';
import { useMyStudentProfile, useUpdateStudentProfile, useUploadStudentPicture, useUploadStudentResume, useRemoveStudentResume } from '../../hooks/useStudent.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { GlassCard } from '../../components/Card.jsx';
import { Input, Select } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Avatar from '../../components/Avatar.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import { BRANCH_OPTIONS } from '../../utils/constants.js';

// Inserts fl_attachment into a Cloudinary URL to force browser download
const toDownloadUrl = (url) => url.replace('/upload/', '/upload/fl_attachment/');

const ResumePreviewModal = ({ url, onClose }) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    fetch(url)
      .then((r) => r.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      })
      .catch(() => { setFailed(true); setLoading(false); });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm" onClick={onClose}>
      {/* Toolbar */}
      <div
        className="flex h-14 shrink-0 items-center justify-between bg-[#0D0028] px-4 shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <FileText className="h-4 w-4 text-violet-400" />
          Resume Preview
        </div>
        <div className="flex items-center gap-2">
          <a
            href={toDownloadUrl(url)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-700"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex flex-1 items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div className="flex flex-col items-center gap-3 text-white/60">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
            <p className="text-sm">Loading PDF…</p>
          </div>
        )}
        {!loading && failed && (
          <div className="flex flex-col items-center gap-3 text-center text-white/60">
            <FileText className="h-12 w-12 opacity-40" />
            <p className="text-sm">Could not load the PDF for preview.</p>
            <a href={toDownloadUrl(url)} target="_blank" rel="noreferrer"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700">
              Download instead
            </a>
          </div>
        )}
        {!loading && blobUrl && (
          <iframe
            src={blobUrl}
            title="Resume preview"
            className="h-full w-full border-0"
          />
        )}
      </div>
    </div>
  );
};

const currentYear = new Date().getFullYear();
const GRAD_YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear - 1 + i;
  return { value: year, label: String(year) };
});

const Profile = () => {
  const { user } = useAuth();
  const { data: student, isLoading } = useMyStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const uploadPicture = useUploadStudentPicture();
  const uploadResume = useUploadStudentResume();
  const removeResume = useRemoveStudentResume();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { rollNumber: '', branch: '', cgpa: '', phone: '', graduationYear: '' } });

  useEffect(() => {
    if (!student) return;
    reset({
      rollNumber: student.rollNumber || '',
      branch: student.branch || '',
      cgpa: student.cgpa ?? '',
      phone: student.phone || '',
      graduationYear: student.graduationYear || '',
    });
    setSkills(student.skills || []);
  }, [student, reset]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkills((prev) => [...prev, value]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill));

  const onSubmit = async (values) => {
    try {
      await updateProfile.mutateAsync({
        ...values,
        cgpa: values.cgpa === '' ? undefined : Number(values.cgpa),
        graduationYear: values.graduationYear === '' ? undefined : Number(values.graduationYear),
        skills: skills.join(','),
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update your profile');
    }
  };

  const handleRemoveResume = async () => {
    if (!window.confirm('Remove your current resume?')) return;
    try {
      await removeResume.mutateAsync();
      toast.success('Resume removed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not remove resume');
    }
  };

  const handlePictureSelected = async (file) => {
    try {
      await uploadPicture.mutateAsync(file);
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    }
  };

  const handleResumeSelected = async (file) => {
    try {
      const result = await uploadResume.mutateAsync(file);
      const { extracted, profile } = result;

      // Auto-fill form with returned profile values
      reset({
        rollNumber:     student?.rollNumber || '',
        branch:         profile.branch         || student?.branch         || '',
        cgpa:           profile.cgpa           ?? student?.cgpa           ?? '',
        phone:          profile.phone          || student?.phone          || '',
        graduationYear: profile.graduationYear ?? student?.graduationYear ?? '',
      });
      setSkills(profile.skills?.length ? profile.skills : student?.skills || []);

      // Build a readable summary of what was found
      const found = [];
      if (extracted.cgpa)           found.push(`CGPA ${extracted.cgpa}`);
      if (extracted.phone)          found.push(`Phone ${extracted.phone}`);
      if (extracted.branch)         found.push(extracted.branch);
      if (extracted.graduationYear) found.push(`Grad year ${extracted.graduationYear}`);
      if (extracted.skills?.length) found.push(`${extracted.skills.length} skill${extracted.skills.length > 1 ? 's' : ''}`);

      if (found.length) {
        toast.success(`Auto-filled from resume: ${found.join(', ')}`);
      } else {
        toast.success('Resume uploaded — no fields could be auto-detected');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">My Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Keep your details current — recruiters and eligibility checks rely on this.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center gap-4 text-center lg:col-span-1">
          <Avatar src={user?.profilePicture} name={user?.name} size="xl" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
          <div className="w-full">
            <FileDrop
              label="Profile picture"
              accept="image/*"
              hint="JPG or PNG, up to 5MB"
              isUploading={uploadPicture.isPending}
              onFileSelected={handlePictureSelected}
            />
          </div>

          <div className="w-full border-t border-slate-100 pt-4 dark:border-slate-800">
            {student?.resumeUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-violet-200/60 bg-violet-50/60 px-3.5 py-2.5 dark:border-violet-800/40 dark:bg-violet-900/20">
                  <FileText className="h-4 w-4 shrink-0 text-violet-500" />
                  <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">Resume on file</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={toDownloadUrl(student.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    disabled={removeResume.isPending}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                  <p className="mb-2 text-xs font-medium text-slate-400">Replace resume</p>
                  <FileDrop
                    accept=".pdf,.doc,.docx"
                    hint="PDF or Word document, up to 5MB"
                    isUploading={uploadResume.isPending}
                    onFileSelected={handleResumeSelected}
                  />
                </div>
              </div>
            ) : (
              <FileDrop
                label="Resume"
                accept=".pdf,.doc,.docx"
                hint="PDF or Word document, up to 5MB"
                isUploading={uploadResume.isPending}
                onFileSelected={handleResumeSelected}
              />
            )}
          </div>

        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-800 dark:text-white">Academic details</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Roll number"
                placeholder="CSE2021001"
                error={errors.rollNumber?.message}
                {...register('rollNumber')}
              />
              <Select
                label="Branch"
                placeholder="Select your branch"
                options={BRANCH_OPTIONS}
                error={errors.branch?.message}
                {...register('branch')}
              />
              <Input
                label="CGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.5"
                error={errors.cgpa?.message}
                {...register('cgpa', {
                  min: { value: 0, message: 'CGPA cannot be negative' },
                  max: { value: 10, message: 'CGPA cannot exceed 10' },
                })}
              />
              <Select
                label="Graduation year"
                placeholder="Select graduation year"
                options={GRAD_YEAR_OPTIONS}
                error={errors.graduationYear?.message}
                {...register('graduationYear')}
              />
              <Input
                label="Phone number"
                placeholder="9876543210"
                error={errors.phone?.message}
                {...register('phone', {
                  pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Enter a valid phone number' },
                })}
              />
            </div>

            <div>
              <p className="label">Skills</p>
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

            <div className="flex justify-end pt-2">
              <Button type="submit" icon={Save} isLoading={updateProfile.isPending} disabled={!isDirty && skills.join() === (student?.skills || []).join()}>
                Save changes
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Profile;
