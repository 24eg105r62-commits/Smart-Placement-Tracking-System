import { GlassCard } from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';

const ChartCard = ({ title, subtitle, children, isEmpty, emptyLabel = 'No data yet' }) => (
  <GlassCard className="animate-fade-in">
    <div className="mb-4">
      <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>}
    </div>
    {isEmpty ? <EmptyState title={emptyLabel} /> : <div className="h-72 w-full">{children}</div>}
  </GlassCard>
);

export default ChartCard;
