import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-mono font-medium rounded-lg transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#e8834a] hover:bg-[#d9733a] active:bg-[#b85822] text-zinc-950 font-bold shadow-[0_0_12px_rgba(232,131,74,0.2)]',
    secondary:
      'bg-zinc-900 border border-zinc-800 hover:border-[#e8834a] text-zinc-300 hover:text-[#e8834a]',
    outline:
      'border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white bg-transparent',
    ghost:
      'text-zinc-400 hover:text-white hover:bg-zinc-800/50 bg-transparent',
    danger:
      'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`bg-[#0f1117] border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl transition-colors ${className}`}>
    {children}
  </div>
);

export const Input = React.forwardRef(({
  label,
  error,
  leftSymbol,
  className = '',
  ...props
}, ref) => (
  <div className="w-full flex flex-col gap-1">
    {label && <label className="text-[11px] font-mono text-zinc-400 block">{label}</label>}
    <div className="relative flex items-center">
      {leftSymbol && (
        <span className="absolute left-3 text-xs font-mono text-zinc-500 select-none pointer-events-none">
          {leftSymbol}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full bg-[#09090b] border ${
          error ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-800 focus:border-[#e8834a]'
        } rounded-lg ${leftSymbol ? 'pl-7' : 'px-3'} pr-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none font-mono transition-colors ${className}`}
        {...props}
      />
    </div>
    {error && <span className="text-[10px] font-mono text-rose-500">{error}</span>}
  </div>
));
Input.displayName = 'Input';

export const Select = ({ label, options, value, onChange, className = '', children, ...props }) => (
  <div className="w-full flex flex-col gap-1">
    {label && <label className="text-[11px] font-mono text-zinc-400 block">{label}</label>}
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#e8834a] transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {children ? children : options?.map((opt) => (
        <option key={opt.value || opt} value={opt.value || opt}>
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-[#0f1117] ${maxWidth} w-full p-6 rounded-2xl border border-zinc-800 space-y-4 relative shadow-2xl`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>
        {(title || subtitle) && (
          <div>
            {title && (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#e8834a]" />
                <h3 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wide">
                  {title}
                </h3>
              </div>
            )}
            {subtitle && <p className="text-xs text-zinc-400 font-mono">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};