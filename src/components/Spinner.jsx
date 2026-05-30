import { t } from '../i18n/strings'

/** Minimal accent-colored loading spinner. */
export default function Spinner({ className = '', label }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} role="status">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white"
        style={{ borderTopColor: 'var(--event-secondary)' }}
        aria-hidden="true"
      />
      {label ? <span className="text-sm text-white/70">{label}</span> : null}
      <span className="sr-only">{t.common.loading}</span>
    </span>
  )
}
