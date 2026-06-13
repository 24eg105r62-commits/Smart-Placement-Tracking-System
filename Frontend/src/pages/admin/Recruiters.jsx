import { useState } from 'react';
import { UserCog, Building2, Mail } from 'lucide-react';
import { useRecruiters } from '../../hooks/useRecruiter.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import SearchBar from '../../components/SearchBar.jsx';
import { Table, Tr, Td } from '../../components/Table.jsx';
import Avatar from '../../components/Avatar.jsx';
import { Badge } from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { TableSkeleton } from '../../components/Skeleton.jsx';
import { formatDate } from '../../utils/format.js';

const COLUMNS = ['Recruiter', 'Designation', 'Company', 'Joined'];

const Recruiters = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useRecruiters({ search: debouncedSearch || undefined, page, limit: 10 });
  const recruiters = data?.recruiters || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Recruiters</h1>
          <p className="mt-1 text-sm text-slate-400">Everyone hiring through the platform.</p>
        </div>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by company or designation…"
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={4} />
      ) : recruiters.length === 0 ? (
        <EmptyState icon={UserCog} title="No recruiters found" description="Try a different search term." />
      ) : (
        <Table columns={COLUMNS}>
          {recruiters.map((recruiter) => (
            <Tr key={recruiter._id}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar src={recruiter.userId?.profilePicture} name={recruiter.userId?.name} size="sm" />
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-100">{recruiter.userId?.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3" /> {recruiter.userId?.email}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>{recruiter.designation || '—'}</Td>
              <Td>
                {recruiter.companyId ? (
                  <span className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                      {recruiter.companyId.logo ? (
                        <img src={recruiter.companyId.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-3.5 w-3.5" />
                      )}
                    </span>
                    {recruiter.companyId.name}
                  </span>
                ) : (
                  <Badge>No company yet</Badge>
                )}
              </Td>
              <Td>{formatDate(recruiter.createdAt)}</Td>
            </Tr>
          ))}
        </Table>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
};

export default Recruiters;
