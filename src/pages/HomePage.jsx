import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { t } from '../i18n/strings'

const DEFAULT_EVENT = 'innovare-territori'

/**
 * Developer/operator landing page. Real attendees arrive via a QR deep-link
 * straight to /join/:eventId, so this is mainly a launcher for the three
 * surfaces during setup and demos.
 */
export default function HomePage() {
  const navigate = useNavigate()
  const [eventId, setEventId] = useState(DEFAULT_EVENT)

  const id = eventId.trim() || DEFAULT_EVENT
  const routes = [
    { to: `/join/${id}`, emoji: '📲', ...t.home.routes.join },
    { to: `/event/${id}/admin`, emoji: '🛡️', ...t.home.routes.admin },
    { to: `/event/${id}/wall`, emoji: '🖥️', ...t.home.routes.wall },
    { to: `/event/${id}/feed`, emoji: '📱', ...t.home.routes.feed },
    { to: `/event/${id}/print`, emoji: '🖨️', ...t.home.routes.print },
    { to: `/event/${id}/json`, emoji: '🕸️', ...t.home.routes.json },
  ]

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-6 py-12"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #142a63 0%, var(--color-ink-950) 60%)',
      }}
    >
      <div className="w-full max-w-6xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          LiveWall
        </h1>
        <p className="mt-3 text-lg text-white/60">{t.home.tagline}</p>

        <label className="mx-auto mt-10 flex max-w-sm flex-col gap-2 text-left">
          <span className="text-sm font-medium text-white/70">
            {t.home.eventId}
          </span>
          <input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-center font-mono text-white outline-none focus:border-white/30"
          />
        </label>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {routes.map((r) => (
            <button
              key={r.to}
              onClick={() => navigate(r.to)}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-ink-700"
            >
              <span className="text-4xl">{r.emoji}</span>
              <span className="text-lg font-semibold text-white">{r.title}</span>
              <span className="text-sm text-white/50">{r.desc}</span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <Button onClick={() => navigate(`/join/${id}`)}>
            {t.home.openForm}
          </Button>
        </div>
      </div>
    </div>
  )
}
