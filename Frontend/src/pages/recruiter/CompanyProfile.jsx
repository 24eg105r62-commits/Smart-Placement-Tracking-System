import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Save, Briefcase } from 'lucide-react';
import { useMyRecruiterProfile, useUpdateRecruiterProfile } from '../../hooks/useRecruiter.js';
import { useCreateCompany, useUpdateCompany, useUploadCompanyLogo } from '../../hooks/useCompanies.js';
import { GlassCard } from '../../components/Card.jsx';
import { Input, Textarea } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import FileDrop from '../../components/FileDrop.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';

const CompanyProfile = () => {
  const { data: recruiter, isLoading } = useMyRecruiterProfile();
  const updateRecruiterProfile = useUpdateRecruiterProfile();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const uploadLogo = useUploadCompanyLogo();

  const company = recruiter?.companyId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { name: '', description: '', website: '', location: '', industry: '' } });

  const {
    register: registerRecruiter,
    handleSubmit: handleSubmitRecruiter,
    reset: resetRecruiter,
    formState: { isDirty: isRecruiterDirty },
  } = useForm({ defaultValues: { designation: '' } });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        location: company.location || '',
        industry: company.industry || '',
      });
    }
  }, [company, reset]);

  useEffect(() => {
    if (recruiter) {
      resetRecruiter({ designation: recruiter.designation || '' });
    }
  }, [recruiter, resetRecruiter]);

  const onSubmitCompany = async (values) => {
    try {
      if (company) {
        await updateCompany.mutateAsync({ id: company._id, payload: values });
        toast.success('Company profile updated');
      } else {
        await createCompany.mutateAsync(values);
        toast.success('Company profile created — you can now post jobs!');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save company details');
    }
  };

  const onSubmitRecruiter = async (values) => {
    try {
      await updateRecruiterProfile.mutateAsync(values);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update your profile');
    }
  };

  const handleLogoSelected = async (file) => {
    if (!company) {
      toast.error('Save your company details first');
      return;
    }
    try {
      await uploadLogo.mutateAsync({ id: company._id, file });
      toast.success('Logo updated');
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

  const isSavingCompany = createCompany.isPending || updateCompany.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Company Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          {company ? 'Keep your company details up to date for prospective applicants.' : 'Set up your company before posting jobs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center gap-4 text-center lg:col-span-1">
          <span className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
            {company?.logo ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" /> : <Building2 className="h-10 w-10" />}
          </span>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{company?.name || 'No company yet'}</p>
            {company?.industry && <p className="text-sm text-slate-400">{company.industry}</p>}
          </div>
          <div className="w-full">
            <FileDrop
              label="Company logo"
              accept="image/*"
              hint={company ? 'JPG or PNG, up to 5MB' : 'Save company details first'}
              isUploading={uploadLogo.isPending}
              onFileSelected={handleLogoSelected}
            />
          </div>

          <div className="w-full border-t border-slate-100 pt-4 dark:border-slate-800">
            <form onSubmit={handleSubmitRecruiter(onSubmitRecruiter)} className="space-y-3 text-left" noValidate>
              <Input label="Your designation" placeholder="e.g. Talent Acquisition Lead" {...registerRecruiter('designation')} />
              <Button type="submit" variant="secondary" className="w-full" isLoading={updateRecruiterProfile.isPending} disabled={!isRecruiterDirty}>
                Save designation
              </Button>
            </form>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <Briefcase className="h-4.5 w-4.5 text-primary" />
            {company ? 'Company details' : 'Create your company'}
          </h2>
          <form onSubmit={handleSubmit(onSubmitCompany)} className="space-y-4" noValidate>
            <Input
              label="Company name"
              placeholder="e.g. NimbusCloud"
              error={errors.name?.message}
              {...register('name', { required: 'Company name is required' })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Industry" placeholder="e.g. Cloud Computing" {...register('industry')} />
              <Input
                label="Location"
                placeholder="e.g. Bengaluru"
                {...register('location')}
              />
            </div>
            <Input
              label="Website"
              type="url"
              placeholder="https://yourcompany.com"
              {...register('website', {
                pattern: { value: /^https?:\/\/.+/i, message: 'Include http:// or https://' },
              })}
              error={errors.website?.message}
            />
            <Textarea
              label="About the company"
              rows={5}
              placeholder="Tell students what makes your company a great place to work…"
              {...register('description')}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" icon={Save} isLoading={isSavingCompany} disabled={company ? !isDirty : false}>
                {company ? 'Save changes' : 'Create company'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default CompanyProfile;
