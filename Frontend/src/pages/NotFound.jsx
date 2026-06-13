import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/Button.jsx';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center dark:bg-secondary">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Compass className="h-7 w-7" />
    </span>
    <h1 className="text-3xl font-semibold text-slate-800 dark:text-white">404 — Page not found</h1>
    <p className="max-w-sm text-sm text-slate-400">The page you're looking for doesn't exist or may have moved.</p>
    <Link to="/">
      <Button>Back to home</Button>
    </Link>
  </div>
);

export default NotFound;
