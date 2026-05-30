/**
 * A single attendee post as rendered on the projected Live Wall.
 *
 * Tuned for dark ambient projection: deep translucent panel, luminous accent
 * border, large highly-readable typography, and a soft drop-shadow glow. The
 * `entering` flag drives the keyframe entrance animation.
 */
import { t } from '../i18n/strings'

export default function WallCard({ post, entering = true }) {
  const initial = (post.userName || '?').trim().charAt(0).toUpperCase()

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md ${
        entering ? 'animate-pop-in' : ''
      }`}
      style={{
        boxShadow:
          '0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px -12px rgba(0,0,0,0.7), 0 0 40px -10px var(--event-secondary)',
      }}
    >
      {post.imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-800">
          <img
            src={post.imageUrl}
            alt={post.text ? post.text.slice(0, 80) : t.wallCard.imageAlt}
            loading="eager"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 p-6">
        {post.text ? (
          <p className="text-2xl font-medium leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {post.text}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-2">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold text-white shadow-lg"
            style={{ background: 'var(--event-secondary)' }}
          >
            {initial}
          </span>
          <span className="text-lg font-semibold text-white/90">
            {post.userName || t.common.guest}
          </span>
        </div>
      </div>
    </article>
  )
}
