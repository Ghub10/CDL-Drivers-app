import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-card bg-surface p-lg shadow-card ${className}`}
    >
      {children}
    </div>
  )
}
