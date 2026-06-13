const VARIANT_CLASSES = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={`${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${className}`}
    {...rest}
  >
    {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
    {!isLoading && Icon && <Icon className="h-4 w-4" />}
    {children}
  </button>
);

export default Button;
