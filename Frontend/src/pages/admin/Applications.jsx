import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Building2, ExternalLink } from 'lucide-react';
import { useAllApplications } from '../../hooks/useApplications.js';
import { Select } from '../../components/Input.jsx';
import { Table, Tr, Td } from '../../components/Table.jsx';
import { StatusPill } from '../../components/Badge.jsx';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/Skeleton.jsx';
import { formatDate } from '../../utils/format.js';
import { APPLICATION_STATUS_OPTIONS } from '../../utils/constants.js';

const COLUMNS = ['Student', 'Job', 'Company', 'Applied on', 'Status'];

const Applications = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAllApplications({ status: status || undefined, page, limit: 12 });
  const applications = data?.applications || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Applications</h1>
          <p className="mt-1 text-sm text-slate-400">Track every application moving through the pipeline.</p>
        </div>
        <Select
          options={APPLICATION_STATUS_OPTIONS}
          placeholder="All statuses"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          wrapperClassName="sm:w-56"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : applications.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No applications found" description="Try a different status filter." />
      ) : (
        <Table columns={COLUMNS}>
          {applications.map((application) => {
            const student = application.studentId;
            const user = student?.userId;
            const job = application.jobId;
            return (
              <Tr key={application._id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.profilePicture} name={user?.name} size="sm" />
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-100">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Link to={`/student/jobs/${job?._id}`} className="flex items-center gap-1 font-medium text-slate-700 hover:text-primary dark:text-slate-100">
                    {job?.title} <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                      {job?.companyId?.logo ? <img src={job.companyId.logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-3.5 w-3.5" />}
                    </span>
                    {job?.companyId?.name}
                  </span>
                </Td>
                <Td>{formatDate(application.createdAt)}</Td>
                <Td>
                  <StatusPill status={application.status} />
                </Td>
              </Tr>
            );
          })}
        </Table>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
};

export default Applications;
