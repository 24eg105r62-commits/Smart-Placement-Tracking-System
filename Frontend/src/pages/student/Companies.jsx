import { useState } from 'react';
import { Building2, MapPin, Globe, Briefcase } from 'lucide-react';
import { useCompanies } from '../../hooks/useCompanies.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { GlassCard } from '../../components/Card.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const Companies = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isFetching } = useCompanies({ search: debouncedSearch || undefined, page, limit: 12 });
  const companies = data?.companies || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Companies</h1>
          <p className="mt-1 text-sm text-slate-400">Explore the organisations actively hiring on campus.</p>
        </div>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by name, industry or location…"
          className="sm:w-80"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState icon={Building2} title="No companies found" description="Try adjusting your search terms." />
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {companies.map((company) => (
            <GlassCard key={company._id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{company.name}</p>
                  {company.industry && <p className="text-xs text-slate-400">{company.industry}</p>}
                </div>
              </div>

              {company.description && (
                <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{company.description}</p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-400">
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.location}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:text-primary-700"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Hiring
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
};

export default Companies;
