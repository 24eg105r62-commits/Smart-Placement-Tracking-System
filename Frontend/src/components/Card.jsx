export const GlassCard = ({ children, className = '', ...rest }) => (
  <div className={`glass-card p-5 ${className}`} {...rest}>
    {children}
  </div>
);

export const SurfaceCard = ({ children, className = '', ...rest }) => (
  <div className={`surface-card p-5 ${className}`} {...rest}>
    {children}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, accent = 'primary', hint }) => {
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    secondary: 'bg-secondary/10 text-secondary dark:bg-white/10 dark:text-white',
  };

  return (
    <GlassCard className="animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-800 dark:text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent] || accentClasses.primary}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </GlassCard>
  );
};

export default GlassCard;
