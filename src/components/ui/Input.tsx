import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`form-input ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
