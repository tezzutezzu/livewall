import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config'
import { setPostHidden, deletePost } from '../firebase/posts'
import { useAllPosts } from '../hooks/usePosts'
import { useEventSettings } from '../hooks/useEventSettings'
import AdminGate from '../components/AdminGate'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import FirebaseNotice from '../components/FirebaseNotice'
import { t } from '../i18n/strings'

export default function AdminPage() {
  const { eventId } = useParams()
  useEventSettings(eventId) // applies the event's color theme
  const { posts, loaded } = useAllPosts(eventId)

  // Track which posts are mid-action so their buttons disable individually.
  const [acting, setActing] = useState({})
  const [deleting, setDeleting] = useState(null) // post awaiting delete confirmation
  const [error, setError] = useState(null)

  const hiddenCount = useMemo(
    () => posts.filter((p) => p.hidden).length,
    [posts],
  )

  async function toggleHidden(post) {
    setActing((a) => ({ ...a, [post.id]: 'hide' }))
    try {
      await setPostHidden(eventId, post.id, !post.hidden)
    } catch (err) {
      console.error(err)
      setError(t.admin.hideError)
    } finally {
      setActing((a) => ({ ...a, [post.id]: undefined }))
    }
  }

  async function confirmDelete() {
    const post = deleting
    setDeleting(null)
    setActing((a) => ({ ...a, [post.id]: 'delete' }))
    try {
      await deletePost(eventId, post)
      // The realtime listener drops the row; no local cleanup needed.
    } catch (err) {
      console.error(err)
      setError(t.admin.deleteError)
      setActing((a) => ({ ...a, [post.id]: undefined }))
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <FirebaseNotice />
      </div>
    )
  }

  return (
    <AdminGate>
      <div className="min-h-svh bg-ink-950 text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-950/80 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{t.admin.title}</h1>
              <p className="text-sm text-white/50">
                {t.admin.eventLabel}{' '}
                <code className="text-white/70">{eventId}</code>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400"
                title="Live"
              />
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                {t.admin.count(posts.length)}
              </span>
              {hiddenCount > 0 ? (
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm font-semibold text-amber-200">
                  {t.admin.hiddenCount(hiddenCount)}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {!loaded ? (
            <div className="flex justify-center py-20">
              <Spinner label={t.admin.connecting} />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <MessageCard
                  key={post.id}
                  post={post}
                  busy={acting[post.id]}
                  onToggleHidden={() => toggleHidden(post)}
                  onDelete={() => setDeleting(post)}
                />
              ))}
            </div>
          )}
        </main>

        {/* Delete confirmation */}
        <Modal
          open={Boolean(deleting)}
          onClose={() => setDeleting(null)}
          title={t.admin.deleteTitle}
          actions={
            <>
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                {t.admin.cancel}
              </Button>
              <Button variant="reject" onClick={confirmDelete}>
                {t.admin.confirmDelete}
              </Button>
            </>
          }
        >
          {t.admin.deleteBody}
        </Modal>

        <Modal
          open={Boolean(error)}
          onClose={() => setError(null)}
          title={t.admin.actionFailedTitle}
          actions={
            <Button variant="ghost" onClick={() => setError(null)}>
              {t.common.dismiss}
            </Button>
          }
        >
          {error}
        </Modal>
      </div>
    </AdminGate>
  )
}

function MessageCard({ post, busy, onToggleHidden, onDelete }) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border shadow-xl transition ${
        post.hidden
          ? 'border-amber-400/30 bg-ink-800/60'
          : 'border-white/10 bg-ink-800'
      }`}
    >
      {post.imageUrl ? (
        <div className="relative">
          <img
            src={post.imageUrl}
            alt={t.wallCard.imageAlt}
            className={`aspect-[4/3] w-full object-cover ${post.hidden ? 'opacity-40' : ''}`}
          />
          {post.hidden ? (
            <span className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-ink-950">
              {t.admin.hiddenBadge}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {!post.imageUrl && post.hidden ? (
          <span className="self-start rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-ink-950">
            {t.admin.hiddenBadge}
          </span>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white">
            {post.userName || t.common.guest}
          </span>
          <span className="text-white/40">{formatTime(post.timestamp)}</span>
        </div>
        {post.text ? (
          <p className="text-white/85">{post.text}</p>
        ) : (
          <p className="italic text-white/40">{t.admin.noMessage}</p>
        )}
        <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
          <Button variant="ghost" onClick={onToggleHidden} disabled={Boolean(busy)}>
            {busy === 'hide' ? (
              <Spinner />
            ) : post.hidden ? (
              t.admin.unhide
            ) : (
              t.admin.hide
            )}
          </Button>
          <Button variant="reject" onClick={onDelete} disabled={Boolean(busy)}>
            {busy === 'delete' ? <Spinner /> : t.admin.delete}
          </Button>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="text-5xl">💬</span>
      <h2 className="text-xl font-semibold text-white">{t.admin.emptyTitle}</h2>
      <p className="max-w-sm text-white/50">{t.admin.emptyBody}</p>
    </div>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
