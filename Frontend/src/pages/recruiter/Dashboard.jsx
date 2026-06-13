import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  UserCheck,
  Trophy,
  ArrowRight,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRecruiterDashboard } from '../../hooks/useDashboard.js';
import { useMyRecruiterProfile } from '../../hooks/useRecruiter.js';
import { StatCard } from '../../components/Card.jsx';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { CHART_COLORS, chartGridProps, chartTooltipStyle } from '../../components/charts/chartTheme.js';
import { CardSkeleton } from '../../components/Skeleton.jsx';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { data: recruiter } = useMyRecruiterProfile();
  const { data, isLoading } = useRecruiterDashboard();

  const cards = data?.cards;
  const applicantStatistics = data?.applicantStatistics || [];
  const jobWiseApplicants = data?.jobWiseApplicants || [];
  const hasStatusData = applicantStatistics.some((row) => row.count > 0);

  const needsCompany = recruiter && !recruiter.companyId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">Here's how your hiring pipeline is looking today.</p>
      </div>

      {needsCompany && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Building2 className="h-5 w-5" />
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Set up your company profile before posting jobs — students need to see who's hiring.
            </p>
          </div>
          <Link to="/recruiter/company" className="btn-primary shrink-0">
            Set up company
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !cards ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Active jobs" value={cards.activeJobs} icon={Briefcase} accent="primary" />
            <StatCard label="Total applicants" value={cards.totalApplicants} icon={Users} accent="secondary" />
            <StatCard label="Shortlisted" value={cards.shortlisted} icon={UserCheck} accent="warning" />
            <StatCard label="Hired" value={cards.hired} icon={Trophy} accent="success" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Applicant pipeline"
          subtitle="Distribution of applicants by current status"
          isEmpty={!isLoading && !hasStatusData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={applicantStatistics}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {applicantStatistics.map((entry, index) => (
                  <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top jobs by applicants"
          subtitle="Your most popular postings"
          isEmpty={!isLoading && jobWiseApplicants.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobWiseApplicants} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid {...chartGridProps} horizontal={false} />
              <XAxis type="number" allowDecimals={false} stroke="currentColor" className="text-xs text-slate-400" />
              <YAxis
                type="category"
                dataKey="title"
                width={140}
                stroke="currentColor"
                className="text-xs text-slate-400"
                tick={{ fontSize: 12 }}
              />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 px-5 py-4 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">Ready to find your next hire?</p>
        <Link to="/recruiter/jobs" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700">
          Manage your jobs <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
