import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Building2, IndianRupee, Clock3, SlidersHorizontal } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { GlassCard } from '../../components/Card.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import { Input } from '../../components/Input.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Pagination from '../../components/Pagination.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import { formatPackage, daysUntil, formatDate } from '../../utils/format.js';

const Jobs = () => {
  const [search, setSearch] = useState('');
  const [minPackage, setMinPackage] = useState('');
  const [location, setLocation] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const debouncedLocation = useDebouncedValue(location);
  const debouncedMinPackage = useDebouncedValue(minPackage);

  const { data, isLoading, isFetching } = useJobs({
    search: debouncedSearch || undefined,
    location: debouncedLocation || undefined,
    minPackage: debouncedMinPackage || undefined,
    activeOnly: activeOnly ? 'true' : undefined,
    page,
    limit: 9,
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const resetFilters = () => {
    setSearch('');
    setMinPackage('');
    setLocation('');
    setActiveOnly(true);
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Jobs</h1>
          <p className="mt-1 text-sm text-slate-400">Browse open roles and find the ones you're eligible for.</p>
        </div>
        <div className="flex gap-2">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by title or company…"
            className="sm:w-72"
          />
          <button type="button" onClick={() => setShowFilters((v) => !v)} className="btn-secondary shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <GlassCard className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-in">
          <Input
            label="Location"
            placeholder="e.g. Bengaluru"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
          />
          <Input
            label="Minimum package (LPA)"
            type="number"
            min="0"
            placeholder="e.g. 8"
            value={minPackage}
            onChange={(e) => {
              setMinPackage(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex items-end justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => {
                  setActiveOnly(e.target.checked);
                  setPage(1);
                }}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
              />
              Active listings only
            </label>
            <button type="button" onClick={resetFilters} className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              Reset
            </button>
          </div>
        </GlassCard>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No jobs match your filters" description="Try widening your search or clearing filters." />
      ) : (
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          {jobs.map((job) => {
            const days = daysUntil(job.deadline);
            const isClosingSoon = days !== null && days <= 3 && days >= 0;
            return (
              <Link key={job._id} to={`/student/jobs/${job._id}`}>
                <GlassCard className="flex h-full flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                      {job.companyId?.logo ? (
                        <img src={job.companyId.logo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-white">{job.title}</p>
                      <p className="truncate text-xs text-slate-400">{job.companyId?.name}</p>
                    </div>
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
                  </div>

                  {job.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {job.requiredSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" /> Closes {formatDate(job.deadline)}
                    </span>
                    {isClosingSoon && <span className="badge bg-danger/10 text-danger">Closing soon</span>}
                  </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={pagination?.page || 1} totalPages={pagination?.pages || 1} onPageChange={setPage} />
    </div>
  );
};

export default Jobs;
