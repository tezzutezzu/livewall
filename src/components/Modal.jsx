import { useEffect } from 'react'

/**
 * Non-intrusive centered modal used for error alerts and confirmation prompts.
 * Closes on Escape and on backdrop click.
 */
export default function Modal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-all duration-300 ease-in-out"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
        ) : null}
        <div className="text-white/75">{children}</div>
        {actions ? (
          <div className="mt-6 flex justify-end gap-3">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}
