import React from 'react';

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white border border-institutional-border rounded-sm shadow-sm p-5 ${className}`}>
    {title && <h3 className="text-institutional-text font-semibold mb-4 text-lg border-b border-institutional-border pb-2">{title}</h3>}
    {children}
  </div>
);

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-institutional focus:ring-offset-1";
  const variants = {
    primary: "bg-institutional text-white hover:bg-institutional-light active:bg-institutional-dark",
    secondary: "bg-institutional-bg text-institutional-text border border-institutional-border hover:bg-gray-200",
    outline: "bg-transparent border border-institutional text-institutional hover:bg-institutional-bg",
    ghost: "bg-transparent text-institutional-muted hover:text-institutional hover:bg-gray-100"
  };

  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
};

// --- Input / Label ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5 mb-3">
    <label className="text-xs font-semibold text-institutional-muted uppercase tracking-wide">{label}</label>
    <input 
      className={`border ${error ? 'border-institutional-danger' : 'border-institutional-border'} bg-institutional-bg/50 rounded-sm px-3 py-2 text-sm text-institutional-text font-mono focus:border-institutional focus:ring-1 focus:ring-institutional outline-none transition-colors ${className}`}
      {...props}
    />
    {helperText && !error && <span className="text-xs text-institutional-muted">{helperText}</span>}
    {error && <span className="text-xs text-institutional-danger font-medium">{error}</span>}
  </div>
);

// --- Section Header ---
export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-institutional-text tracking-tight">{title}</h2>
    {subtitle && <p className="text-sm text-institutional-muted mt-1">{subtitle}</p>}
  </div>
);

// --- Slider ---
interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step=1, unit, onChange, ...props }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-institutional-muted uppercase tracking-wide">{label}</label>
        <span className="text-sm font-mono font-medium text-institutional">{value}{unit}</span>
    </div>
    <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-1.5 bg-institutional-border rounded-lg appearance-none cursor-pointer accent-institutional"
        {...props}
    />
  </div>
);
