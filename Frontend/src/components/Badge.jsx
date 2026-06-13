const TONE_CLASSES = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export const Badge = ({ children, tone = 'neutral', className = '' }) => (
  <span className={`badge ${TONE_CLASSES[tone] || TONE_CLASSES.neutral} ${className}`}>{children}</span>
);

const STATUS_TONES = {
  Applied: 'primary',
  Shortlisted: 'warning',
  'Interview Scheduled': 'warning',
  Selected: 'success',
  Rejected: 'danger',
};

export const StatusPill = ({ status }) => <Badge tone={STATUS_TONES[status] || 'neutral'}>{status}</Badge>;

export default Badge;
