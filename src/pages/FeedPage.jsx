import { useParams, useNavigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config'
import { useApprovedPosts } from '../hooks/usePosts'
import { useEventSettings } from '../hooks/useEventSettings'
import WallCard from '../components/WallCard'
import FirebaseNotice from '../components/FirebaseNotice'
import Spinner from '../components/Spinner'
import { t } from '../i18n/strings'

export default function FeedPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { settings } = useEventSettings(eventId)
  const { posts, loaded } = useApprovedPosts(eventId, 100)

  const eventName = settings.eventName

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 p-6">
        <FirebaseNotice />
      </div>
    )
  }

  // Reverse posts so the latest added are displayed at the top
  const latestFirstPosts = [...posts].reverse()

  return (
    <div
      className="min-h-svh w-full flex flex-col bg-ink-950 pb-24"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--event-primary) 45%, var(--color-ink-950)) 0%, var(--color-ink-950) 60%)',
      }}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-950/80 px-6 py-4 backdrop-blur select-none">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {t.home.routes.wall.title}
            </h1>
            {eventName ? (
              <p className="text-xs uppercase tracking-widest text-white/40 mt-0.5">
                {eventName}
              </p>
            ) : (
              <p className="text-xs uppercase tracking-widest text-white/40 mt-0.5">
                ID: {eventId}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </header>

      {/* Feed Content */}
      <main className="flex-1 mx-auto w-full max-w-md px-4 py-6">
        {!loaded ? (
          <div className="flex justify-center py-20">
            <Spinner label={t.common.loading} />
          </div>
        ) : latestFirstPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center select-none">
            <span className="text-5xl">📡</span>
            <h2 className="text-xl font-semibold text-white">
              {t.admin.emptyTitle}
            </h2>
            <p className="max-w-xs text-sm text-white/50 mt-1">
              I post appariranno qui in tempo reale non appena approvati.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {latestFirstPosts.map((post) => (
              <WallCard key={post.id} post={post} entering={false} />
            ))}
          </div>
        )}
      </main>

      {/* Glowing Floating Action Button (FAB) to create a new post */}
      <button
        type="button"
        onClick={() => navigate(`/join/${eventId}`)}
        title="Crea un post"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition duration-300 hover:scale-110 active:scale-95 cursor-pointer outline-none"
        style={{
          background: 'var(--event-secondary)',
          boxShadow: '0 0 20px 0 var(--event-secondary)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  )
}
