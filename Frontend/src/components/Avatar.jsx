const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (src) {
    return <img src={src} alt={name || 'Avatar'} className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`} />;
  }

  return (
    <span className={`flex ${sizeClass} items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-white dark:ring-slate-800 ${className}`}>
      {initialsOf(name) || '?'}
    </span>
  );
};

export default Avatar;
