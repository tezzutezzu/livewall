/**
 * Themed button. `variant` controls intent styling; the primary variant pulls
 * its color from the active event's secondary accent CSS var.
 */
export default function Button({
  variant = 'primary',
  className = '',
  style,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

  const variants = {
    primary: 'text-white shadow-lg hover:brightness-110 active:scale-[0.98]',
    approve:
      'bg-emerald-500/90 text-white hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/20',
    reject:
      'bg-rose-500/90 text-white hover:bg-rose-400 active:scale-[0.98] shadow-lg shadow-rose-500/20',
    ghost: 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10',
  }

  const primaryStyle =
    variant === 'primary' ? { background: 'var(--event-secondary)' } : undefined

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={{ ...primaryStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
