import { Construction } from 'lucide-react';

const ComingSoon = ({ title }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center animate-fade-in">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Construction className="h-6 w-6" />
    </span>
    <h1 className="text-xl font-semibold text-slate-800 dark:text-white">{title}</h1>
    <p className="max-w-sm text-sm text-slate-400">This page is being built. Check back shortly — it'll be wired up to live data soon.</p>
  </div>
);

export default ComingSoon;
