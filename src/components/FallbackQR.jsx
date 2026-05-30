import { QRCodeSVG } from 'qrcode.react'
import { fallbackSlides } from '../data/fallbackSlides'
import { joinUrl } from '../lib/eventUrl'

// Content (title/subtitle) is read from the `qr` entry in fallbackSlides so the
// copy stays editable in one place.
const qrSlide = fallbackSlides.find((s) => s.kind === 'qr') || {}

/**
 * Full-screen fallback shown during lulls (or on manual override): a single
 * large, scannable QR code pointing at the event's join URL. High-contrast
 * white panel so it survives projector washout. No network needed — the QR is
 * generated client-side.
 */
export default function FallbackQR({ eventName, eventId }) {
  const url = eventId ? joinUrl(eventId) : null

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center px-12 text-center">
      {qrSlide.title ? (
        <h2
          className="mb-10 text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          style={{ textShadow: '0 0 60px var(--event-secondary)' }}
        >
          {qrSlide.title}
        </h2>
      ) : null}

      {url ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
          <QRCodeSVG
            value={url}
            size={420}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#05060a"
            className="h-[clamp(220px,40vh,460px)] w-[clamp(220px,40vh,460px)]"
          />
        </div>
      ) : null}

      {qrSlide.subtitle ? (
        <p className="mt-10 max-w-4xl text-3xl font-medium text-white/70">
          {qrSlide.subtitle}
        </p>
      ) : null}

      {url ? (
        <p className="mt-4 font-mono text-xl text-white/40">
          {url.replace(/^https?:\/\//, '')}
        </p>
      ) : null}

      {eventName ? (
        <div className="absolute bottom-10 left-0 right-0 text-center text-xl font-semibold uppercase tracking-[0.3em] text-white/40">
          {eventName}
        </div>
      ) : null}
    </div>
  )
}
