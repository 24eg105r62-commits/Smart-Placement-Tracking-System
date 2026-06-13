import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Plus, Pencil, Trash2, Globe, MapPin, Image as ImageIcon } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useUploadCompanyLogo, useDeleteCompany } from '../../hooks/useCompanies.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { GlassCard } from '../../components/Card.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import { Input, Textarea } from '../../components/Input.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import FileDrop from '../../components/FileDrop.jsx';

const emptyForm = { name: '', description: '', website: '', location: '', industry: '' };

const CompanyFormModal = ({ isOpen, onClose, company, onSubmit, isSaving }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      company
        ? {
            name: company.name || '',
            description: company.description || '',
            website: company.website || '',
            location: company.location || '',
            industry: company.industry || '',
          }
        : emptyForm
    );
  }, [isOpen, company, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={company ? 'Edit company' : 'Add company'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Company name"
          placeholder="e.g. NimbusCloud"
          error={errors.name?.message}
          {...register('name', { required: 'Company name is required' })}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Industry" placeholder="e.g. Cloud Computing" {...register('industry')} />
          <Input label="Location" placeholder="e.g. Bengaluru" {...register('location')} />
        </div>
        <Input
          label="Website"
          type="url"
          placeholder="https://company.com"
          error={errors.website?.message}
          {...register('website', { pattern: { value: /^https?:\/\/.+/i, message: 'Include http:// or https://' } })}
        />
        <Textarea label="Description" rows={4} placeholder="What does this company do?" {...register('description')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {company ? 'Save changes' : 'Add company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const Companies = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useCompanies({ search: debouncedSearch || undefined, page, limit: 9 });
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const uploadLogo = useUploadCompanyLogo();
  const deleteCompany = useDeleteCompany();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [logoTarget, setLogoTarget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const companies = data?.companies || [];
  const pagination = data?.pagination;

  const openCreate = () => {
    setEditingCompany(null);
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setEditingCompany(company);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCompany) {
        await updateCompany.mutateAsync({ id: editingCompany._id, payload: values });
        toast.success('Company updated');
      } else {
        await createCompany.mutateAsync(values);
        toast.success('Company added');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save company');
    }
  };

  const handleLogoSelected = async (file) => {
    if (!logoTarget) return;
    try {
      await uploadLogo.mutateAsync({ id: logoTarget._id, file });
      toast.success('Logo updated');
      setLogoTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteCompany.mutateAsync(confirmDelete._id);
      toast.success('Company deleted');
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete company');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Companies</h1>
          <p className="mt-1 text-sm text-slate-400">Manage every company listed on the platform.</p>
        </div>
        <div className="flex gap-2">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search companies…"
            className="sm:w-64"
          />
          <Button icon={Plus} onClick={openCreate} className="shrink-0">
            Add company
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies yet" description="Add your first company to get started." action={<Button icon={Plus} onClick={openCreate}>Add company</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <GlassCard key={company._id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                  {company.logo ? <img src={company.logo} alt={company.name} className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6" />}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800 dark:text-white">{company.name}</p>
                  {company.industry && <p className="truncate text-xs text-slate-400">{company.industry}</p>}
                </div>
              </div>

              {company.description && <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{company.description}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.location}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:text-primary-700">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>

              <div className="mt-auto flex items-center justify-end gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button type="button" onClick={() => setLogoTarget(company)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800" title="Upload logo">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => openEdit(company)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setConfirmDelete(company)} className="rounded-lg p-2 text-slate-400 transition hover:bg-danger/10 hover:text-danger" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      <CompanyFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        company={editingCompany}
        onSubmit={handleSubmit}
        isSaving={createCompany.isPending || updateCompany.isPending}
      />

      <Modal isOpen={Boolean(logoTarget)} onClose={() => setLogoTarget(null)} title={`Upload logo — ${logoTarget?.name || ''}`} size="sm">
        <FileDrop label="Company logo" accept="image/*" hint="JPG or PNG, up to 5MB" isUploading={uploadLogo.isPending} onFileSelected={handleLogoSelected} />
      </Modal>

      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete company"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteCompany.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <span className="font-semibold">{confirmDelete?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Companies;
