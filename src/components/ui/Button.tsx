import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'min-h-touch min-w-touch rounded-input px-6 py-3 font-medium transition-all disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary:
      'border border-slate-300 bg-surface text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50',
  }
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
