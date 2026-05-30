import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config'
import { useEventSettings } from '../hooks/useEventSettings'
import { useWallController } from '../hooks/useWallController'
import WallCard from '../components/WallCard'
import FallbackQR from '../components/FallbackQR'
import FirebaseNotice from '../components/FirebaseNotice'
import { t } from '../i18n/strings'

export default function WallPage() {
  const { eventId } = useParams()
  const { settings } = useEventSettings(eventId)
  const { visible, idle, totalApproved } = useWallController(eventId)

  // Manual operator override for the fallback layer:
  //   null  → automatic (driven by the idle/lull heartbeat)
  //   true  → force the promo/QR slides on
  //   false → force the live feed on
  const [override, setOverride] = useState(null)
  const showFallback = override ?? idle

  const eventName = settings.eventName

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 p-6">
        <FirebaseNotice />
      </div>
    )
  }

  return (
    <div
      className="relative h-svh w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(130% 100% at 50% -10%, color-mix(in srgb, var(--event-primary) 55%, var(--color-ink-950)) 0%, var(--color-ink-950) 65%)',
      }}
    >
      {/* Ambient drifting glow for visual life on the projector */}
      <div
        className="pointer-events-none absolute -inset-[20%] animate-slow-pan opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(40% 40% at 30% 30%, var(--event-secondary) 0%, transparent 70%), radial-gradient(40% 40% at 70% 70%, var(--event-primary) 0%, transparent 70%)',
        }}
      />

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <FallbackToggle
          showing={showFallback}
          onToggle={() => setOverride(!showFallback)}
        />
        <FullscreenButton />
      </div>

      {/* Live feed layer */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-in-out"
        style={{ opacity: showFallback ? 0 : 1 }}
        aria-hidden={showFallback}
      >
        {visible.length === 0 ? (
          <WaitingState eventName={eventName} />
        ) : (
          <div className="no-scrollbar h-full overflow-hidden p-8">
            <div className="columns-2 gap-6 md:columns-3 xl:columns-4 [&>*]:mb-6 [&>*]:break-inside-avoid">
              {visible.map((post) => (
                <WallCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fallback layer (crossfades in during lulls or on manual override) */}
      <div
        className="absolute inset-0 transition-opacity duration-300 ease-in-out"
        style={{
          opacity: showFallback ? 1 : 0,
          pointerEvents: showFallback ? 'auto' : 'none',
        }}
        aria-hidden={!showFallback}
      >
        <FallbackQR eventId={eventId} eventName={eventName} />
      </div>

      {/* Persistent live badge */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur">
        <span
          className={`h-2.5 w-2.5 rounded-full ${showFallback ? 'bg-white/40' : 'animate-pulse bg-emerald-400'}`}
        />
        <span className="text-sm font-medium text-white/70">
          {showFallback ? t.wall.standingBy : t.wall.postsLive(totalApproved)}
        </span>
      </div>
    </div>
  )
}

function WaitingState({ eventName }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-12 text-center">
      <span className="mb-8 animate-pulse-glow text-[9rem] leading-none">📡</span>
      <h1 className="text-6xl font-extrabold text-white drop-shadow-2xl">
        {t.wall.waitingTitle}
      </h1>
      <p className="mt-6 text-2xl text-white/60">{t.wall.waitingSubtitle}</p>
      {eventName ? (
        <p className="mt-12 text-lg uppercase tracking-[0.3em] text-white/30">
          {eventName}
        </p>
      ) : null}
    </div>
  )
}

/** Shared styling for the unobtrusive top-right wall controls. */
const wallControlClass =
  'rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white/60 opacity-30 backdrop-blur transition hover:opacity-100'

/** Operator override: instantly show or hide the promo/QR fallback layer. */
function FallbackToggle({ showing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={showing ? t.wall.hideFallbackTitle : t.wall.showFallbackTitle}
      aria-pressed={showing}
      className={wallControlClass}
    >
      {showing ? `▦ ${t.wall.hideFallback}` : `▦ ${t.wall.showFallback}`}
    </button>
  )
}

/** Toggles the browser Fullscreen API for true projection mode. */
function FullscreenButton() {
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      /* fullscreen can be blocked without a user gesture — ignore */
    }
  }, [])

  return (
    <button
      onClick={toggle}
      title={isFull ? t.wall.exitFullscreen : t.wall.enterFullscreen}
      className={wallControlClass}
    >
      {isFull ? t.wall.exitFullscreenLabel : t.wall.enterFullscreenLabel}
    </button>
  )
}
