import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { fallbackSlides } from '../data/fallbackSlides'
import { joinUrl } from '../lib/eventUrl'

/**
 * Full-screen rotating loop of pre-cached slides shown during lulls. Each slide
 * crossfades into the next every `intervalMs`. The `qr` slide renders a live,
 * scannable QR code pointing at the event's join URL. Cleans up its timer on
 * unmount.
 */
export default function FallbackRotator({ intervalMs = 7000, eventName, eventId }) {
  const [index, setIndex] = useState(0)
  const url = eventId ? joinUrl(eventId) : null

  useEffect(() => {
    if (fallbackSlides.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % fallbackSlides.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return (
    <div className="relative h-full w-full">
      {fallbackSlides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center transition-opacity duration-300 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          {slide.kind === 'qr' ? (
            <QrSlide slide={slide} url={url} />
          ) : slide.image ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="max-h-[60vh] max-w-[70vw] rounded-3xl object-contain shadow-2xl"
            />
          ) : (
            <>
              <span className="mb-8 text-[10rem] leading-none drop-shadow-2xl">
                {slide.emoji}
              </span>
              <h2
                className="mb-6 text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
                style={{
                  textShadow: '0 0 60px var(--event-secondary)',
                }}
              >
                {slide.title}
              </h2>
              <p className="max-w-4xl text-3xl font-medium text-white/70">
                {slide.subtitle}
              </p>
            </>
          )}
        </div>
      ))}

      {eventName ? (
        <div className="absolute bottom-10 left-0 right-0 text-center text-xl font-semibold uppercase tracking-[0.3em] text-white/40">
          {eventName}
        </div>
      ) : null}
    </div>
  )
}

/** Big scannable QR on a bright panel (high contrast survives projectors). */
function QrSlide({ slide, url }) {
  return (
    <>
      <h2
        className="mb-10 text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
        style={{ textShadow: '0 0 60px var(--event-secondary)' }}
      >
        {slide.title}
      </h2>

      {url ? (
        <div className="rounded-[2rem] bg-white p-8 shadow-2xl">
          <QRCodeSVG
            value={url}
            size={420}
            level="M"
            marginSize={2}
            bgColor="#ffffff"
            fgColor="#05060a"
            className="h-[clamp(220px,34vh,420px)] w-[clamp(220px,34vh,420px)]"
          />
        </div>
      ) : null}

      <p className="mt-10 max-w-4xl text-3xl font-medium text-white/70">
        {slide.subtitle}
      </p>
      {url ? (
        <p className="mt-4 font-mono text-xl text-white/40">
          {url.replace(/^https?:\/\//, '')}
        </p>
      ) : null}
    </>
  )
}
