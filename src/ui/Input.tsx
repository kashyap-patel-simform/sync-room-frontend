import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
  action?: ReactNode
}

export function Input({ label, hint, error, icon, action, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-fg-subtle"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-fg-subtle pointer-events-none">{icon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-surface border rounded-xl px-4 py-3 text-sm text-fg placeholder:text-fg-subtle',
            'focus:outline-none transition-all duration-150',
            !!icon && 'pl-10',
            !!action && 'pr-28',
            error
              ? 'border-danger/40 focus:border-danger focus:ring-2 focus:ring-danger/15'
              : 'border-border focus:border-teal/50 focus:ring-2 focus:ring-teal/10',
            className,
          )}
          {...props}
        />
        {action && <div className="absolute right-2">{action}</div>}
      </div>
      {(hint || error) && (
        <p className={cn('text-xs', error ? 'text-danger' : 'text-fg-subtle')}>{error || hint}</p>
      )}
    </div>
  )
}
