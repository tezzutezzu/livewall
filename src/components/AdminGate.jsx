import { useState } from 'react'
import Button from './Button'
import { t } from '../i18n/strings'

const STORAGE_KEY = 'livewall_admin_ok'
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE

/**
 * Lightweight client-side passcode gate for the moderation dashboard.
 *
 * NOTE: This is a convenience guard only. The authoritative protection for the
 * admin node must live in your Firebase Realtime Database security rules
 * (role-based, per blueprint §4.2) — never trust the client for access control.
 * If no passcode is configured, the gate is a no-op (open) for local dev.
 */
export default function AdminGate({ children }) {
  const [ok, setOk] = useState(
    () => !PASSCODE || sessionStorage.getItem(STORAGE_KEY) === '1',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (ok) return children

  function submit(e) {
    e.preventDefault()
    if (value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setOk(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-800 p-6"
      >
        <h1 className="mb-1 text-xl font-semibold text-white">
          {t.adminGate.title}
        </h1>
        <p className="mb-5 text-sm text-white/50">{t.adminGate.subtitle}</p>
        <input
          type="password"
          value={value}
          autoFocus
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder={t.adminGate.placeholder}
          className="mb-3 w-full rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-white outline-none focus:border-white/30"
        />
        {error ? (
          <p className="mb-3 text-sm text-rose-400">{t.adminGate.incorrect}</p>
        ) : null}
        <Button type="submit" className="w-full">
          {t.adminGate.unlock}
        </Button>
      </form>
    </div>
  )
}
