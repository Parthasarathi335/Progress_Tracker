import type { ReactNode } from 'react'

interface CardProps {
  title: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Standard dashboard card: icon + title row, optional right-aligned action. */
export function Card({ title, icon, action, children, className = '' }: CardProps) {
  return (
    <section className={`cc-card p-5 min-w-0 ${className}`}>
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-[#202820] min-w-0">
          {icon && <span className="text-[#176B35] flex-shrink-0">{icon}</span>}
          <span className="leading-tight">{title}</span>
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}
