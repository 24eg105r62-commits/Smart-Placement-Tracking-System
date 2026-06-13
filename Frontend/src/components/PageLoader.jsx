const PageLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
    </div>
  </div>
);

export default PageLoader;
