import {
  Users,
  UserCog,
  Building2,
  Briefcase,
  FileText,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAdminDashboard } from '../../hooks/useDashboard.js';
import { StatCard } from '../../components/Card.jsx';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { CHART_COLORS, chartGridProps, chartTooltipStyle } from '../../components/charts/chartTheme.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const formatMonth = (yearMonth) => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useAdminDashboard();

  const cards = data?.cards;
  const charts = data?.charts;
  const placementsByBranch = charts?.placementsByBranch || [];
  const applicationsPerCompany = charts?.applicationsPerCompany || [];
  const monthlyPlacements = (charts?.monthlyPlacements || []).map((row) => ({ ...row, label: formatMonth(row.month) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">A bird's-eye view of placements across the college.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !cards ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Students" value={cards.totalStudents} icon={Users} accent="primary" />
            <StatCard label="Recruiters" value={cards.totalRecruiters} icon={UserCog} accent="secondary" />
            <StatCard label="Companies" value={cards.totalCompanies} icon={Building2} accent="warning" />
            <StatCard label="Active jobs" value={cards.totalJobs} icon={Briefcase} accent="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading || !cards ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total applications" value={cards.totalApplications} icon={FileText} accent="primary" />
            <StatCard label="Students placed" value={cards.totalSelected} icon={Trophy} accent="success" />
            <StatCard label="Placement rate" value={`${cards.placementPercentage}%`} icon={TrendingUp} accent="warning" hint="Of total students" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Placements by branch"
          subtitle="Selected applications grouped by student branch"
          isEmpty={!isLoading && placementsByBranch.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={placementsByBranch} margin={{ left: -16 }}>
              <CartesianGrid {...chartGridProps} vertical={false} />
              <XAxis
                dataKey="branch"
                stroke="currentColor"
                className="text-xs text-slate-400"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis allowDecimals={false} stroke="currentColor" className="text-xs text-slate-400" />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
              <Bar dataKey="count" name="Placed" radius={[6, 6, 0, 0]} fill={CHART_COLORS[0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Applications per company"
          subtitle="Top 10 companies by application volume"
          isEmpty={!isLoading && applicationsPerCompany.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applicationsPerCompany} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid {...chartGridProps} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="currentColor" className="text-xs text-slate-400" />
              <YAxis
                type="category"
                dataKey="company"
                width={130}
                stroke="currentColor"
                className="text-xs text-slate-400"
                tick={{ fontSize: 11 }}
              />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} />
              <Bar dataKey="count" name="Applications" fill={CHART_COLORS[1]} radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Monthly placements"
        subtitle="Selected applications over time"
        isEmpty={!isLoading && monthlyPlacements.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyPlacements} margin={{ left: -16 }}>
            <CartesianGrid {...chartGridProps} vertical={false} />
            <XAxis dataKey="label" stroke="currentColor" className="text-xs text-slate-400" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} stroke="currentColor" className="text-xs text-slate-400" />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="count" name="Placements" stroke={CHART_COLORS[2]} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default AdminDashboard;
