import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', wrapperClassName = '', ...rest }, ref) => (
  <div className={wrapperClassName}>
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={`input ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`} {...rest} />
    {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
  </div>
));
Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, className = '', wrapperClassName = '', rows = 4, ...rest }, ref) => (
  <div className={wrapperClassName}>
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} rows={rows} className={`input resize-y ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`} {...rest} />
    {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, options = [], placeholder, className = '', wrapperClassName = '', ...rest }, ref) => (
  <div className={wrapperClassName}>
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={`input ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''} ${className}`} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
  </div>
));
Select.displayName = 'Select';

export default Input;
