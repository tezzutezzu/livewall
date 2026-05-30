import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ensureAnonAuth, isFirebaseConfigured } from '../firebase/config'
import { uploadPendingImage } from '../firebase/storage'
import { submitPost } from '../firebase/posts'
import { compressImage, validateImageFile } from '../lib/compressImage'
import { useEventSettings } from '../hooks/useEventSettings'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import FirebaseNotice from '../components/FirebaseNotice'
import { t } from '../i18n/strings'

const STAGES = {
  idle: 'idle',
  compressing: t.join.stageCompressing,
  uploading: t.join.stageUploading,
  saving: t.join.stageSaving,
}

export default function JoinPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { settings } = useEventSettings(eventId)
  const online = useOnlineStatus()

  const [userName, setUserName] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [stage, setStage] = useState(STAGES.idle)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef(null)

  const busy = stage !== STAGES.idle
  const maxChars = settings.maxCharacters || 300
  const remaining = maxChars - text.length

  // Silently establish anonymous auth in the background on mount.
  useEffect(() => {
    if (isFirebaseConfigured) ensureAnonAuth().catch(() => {})
  }, [])

  // Build (and revoke) an object URL for the local image preview.
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const canSubmit = useMemo(
    () => userName.trim() && (text.trim() || file) && !busy && online,
    [userName, text, file, busy, online],
  )

  function handleFileChange(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    const validationError = validateImageFile(picked)
    if (validationError) {
      setError(validationError)
      e.target.value = ''
      return
    }
    setFile(picked)
  }

  function resetForm() {
    setText('')
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    if (!online) {
      setError(t.join.errorOffline)
      return
    }

    try {
      const userId = (await ensureAnonAuth().catch(() => null)) || 'anon_local'

      let imageUrl = null
      let storagePath = null

      if (file) {
        setStage(STAGES.compressing)
        const compressed = await compressImage(file)

        setStage(STAGES.uploading)
        // postId is generated client-side only to name the storage object;
        // the canonical RTDB key is created by submitPost().
        const tmpId = `${Date.now()}_${Math.round(performance.now())}`
        const result = await uploadPendingImage({
          eventId,
          blob: compressed,
          postId: tmpId,
        })
        imageUrl = result.imageUrl
        storagePath = result.storagePath
      }

      setStage(STAGES.saving)
      await submitPost({
        eventId,
        userId,
        userName: userName.trim(),
        text: text.trim(),
        imageUrl,
        storagePath,
      })

      setStage(STAGES.idle)
      setDone(true)
      resetForm()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      setStage(STAGES.idle)
      setError(t.join.errorSubmit)
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <Shell>
        <FirebaseNotice />
      </Shell>
    )
  }

  return (
    <Shell>
      {/* Top quick links */}
      <div className="mb-6 flex justify-between items-center select-none">
        <span className="text-xs tracking-widest text-white/30 uppercase font-mono">
          Event ID: {eventId}
        </span>
        <button
          type="button"
          onClick={() => navigate(`/event/${eventId}/feed`)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur transition duration-200 hover:bg-white/10 hover:text-white hover:scale-105 cursor-pointer outline-none"
        >
          📱 Feed Live
        </button>
      </div>

      {/* Offline banner */}
      {!online ? (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {t.join.offlineBanner}
        </div>
      ) : null}

      <header className="mb-8 text-center">
        <div
          className="mx-auto mb-4 h-1.5 w-16 rounded-full"
          style={{ background: 'var(--event-secondary)' }}
        />
        <h1 className="text-3xl font-bold text-white">{t.join.title}</h1>
        <p className="mt-2 text-white/60">{t.join.subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label={t.join.nameLabel}>
          <input
            type="text"
            value={userName}
            maxLength={40}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t.join.namePlaceholder}
            className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-white/30"
            required
          />
        </Field>

        <Field
          label={t.join.messageLabel}
          hint={t.join.charsLeft(remaining)}
          hintTone={remaining < 0 ? 'error' : 'muted'}
        >
          <textarea
            value={text}
            maxLength={maxChars}
            rows={3}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.join.messagePlaceholder}
            className="w-full resize-none rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-white/30"
          />
        </Field>

        <Field label={t.join.photoLabel}>
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <img
                src={preview}
                alt="Selected preview"
                className="max-h-72 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur transition hover:bg-black/90"
              >
                {t.common.remove}
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-ink-800/50 px-4 py-10 text-center text-white/60 transition hover:border-white/40 hover:text-white/80">
              <span className="text-3xl">📷</span>
              <span className="text-sm">{t.join.addPhoto}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </Field>

        <Button type="submit" disabled={!canSubmit} className="mt-2 w-full py-4 text-lg">
          {busy ? <Spinner label={stage} /> : t.join.submit}
        </Button>
      </form>

      {/* Success confirmation */}
      <Modal
        open={done}
        onClose={() => setDone(false)}
        title={t.join.successTitle}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate(`/event/${eventId}/feed`)}>
              📱 Feed Live
            </Button>
            <Button variant="primary" onClick={() => setDone(false)}>
              {t.join.postAnother}
            </Button>
          </>
        }
      >
        {t.join.successDirect}
      </Modal>

      {/* Error alert */}
      <Modal
        open={Boolean(error)}
        onClose={() => setError(null)}
        title={t.join.errorTitle}
        actions={
          <Button variant="ghost" onClick={() => setError(null)}>
            {t.common.tryAgain}
          </Button>
        }
      >
        {error}
      </Modal>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div
      className="min-h-svh w-full px-4 py-8"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--event-primary) 45%, var(--color-ink-950)) 0%, var(--color-ink-950) 60%)',
      }}
    >
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  )
}

function Field({ label, hint, hintTone = 'muted', children }) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="flex items-center justify-between text-sm font-medium text-white/80">
        {label}
        {hint ? (
          <span
            className={
              hintTone === 'error' ? 'text-rose-400' : 'text-white/40'
            }
          >
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}
