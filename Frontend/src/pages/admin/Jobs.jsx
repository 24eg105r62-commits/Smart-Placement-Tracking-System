import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, Building2, Trash2, Power, ExternalLink } from 'lucide-react';
import { useJobs, useUpdateJob, useDeleteJob } from '../../hooks/useJobs.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import SearchBar from '../../components/SearchBar.jsx';
import { Table, Tr, Td } from '../../components/Table.jsx';
import { Badge } from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Modal from '../../components/Modal.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/Skeleton.jsx';
import { formatDate, formatPackage, daysUntil } from '../../utils/format.js';

const COLUMNS = ['Job', 'Company', 'Package', 'Deadline', 'Status', ''];

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useJobs({ search: debouncedSearch || undefined, page, limit: 10 });
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleToggleActive = async (job) => {
    try {
      await updateJob.mutateAsync({ id: job._id, payload: { isActive: !job.isActive } });
      toast.success(job.isActive ? 'Job deactivated' : 'Job activated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update job');
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
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Jobs</h1>
          <p className="mt-1 text-sm text-slate-400">Oversee every job posting across the platform.</p>
        </div>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by title or company…"
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs found" description="Try a different search term." />
      ) : (
        <Table columns={COLUMNS}>
          {jobs.map((job) => {
            const days = daysUntil(job.deadline);
            const isClosed = days !== null && days < 0;
            return (
              <Tr key={job._id}>
                <Td>
                  <Link to={`/student/jobs/${job._id}`} className="flex items-center gap-1 font-medium text-slate-700 hover:text-primary dark:text-slate-100">
                    {job.title} <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                      {job.companyId?.logo ? <img src={job.companyId.logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-3.5 w-3.5" />}
                    </span>
                    {job.companyId?.name}
                  </span>
                </Td>
                <Td>{formatPackage(job.package)}</Td>
                <Td>
                  {formatDate(job.deadline)}
                  {isClosed && <span className="ml-1.5 text-xs text-danger">(closed)</span>}
                </Td>
                <Td>
                  <Badge tone={job.isActive ? 'success' : 'neutral'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(job)}
                      title={job.isActive ? 'Deactivate' : 'Activate'}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(job)}
                      title="Delete"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />

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
          Are you sure you want to delete <span className="font-semibold">{confirmDelete?.title}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Jobs;
