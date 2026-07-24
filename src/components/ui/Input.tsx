import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className = "", id, ...rest }: InputProps) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      {hint && <p className="input-hint">{hint}</p>}
      <input
        id={id}
        className={`input-field ${error ? "error" : ""} ${className}`}
        {...rest}
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = "", id, ...rest }: TextareaProps) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      {hint && <p className="input-hint">{hint}</p>}
      <textarea
        id={id}
        className={`input-field ${error ? "error" : ""} ${className}`}
        {...rest}
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

interface SelectProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  id?: string;
}

export function Select({ label, hint, value, onChange, options, placeholder, id }: SelectProps) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      {hint && <p className="input-hint">{hint}</p>}
      <select
        id={id}
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      {hint && <p className="input-hint">{hint}</p>}
      {children}
    </div>
  );
}
