/**
 * Shown when the build has no Firebase credentials. Keeps the app from crashing
 * on first clone and tells the developer exactly what to do.
 */
import { t } from '../i18n/strings'

export default function FirebaseNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-left">
      <h2 className="mb-2 text-lg font-semibold text-amber-200">
        {t.firebaseNotice.title}
      </h2>
      <p className="text-sm leading-relaxed text-amber-100/80">
        {t.firebaseNotice.bodyBefore}
        <code className="rounded bg-black/30 px-1.5 py-0.5">.env.example</code>
        {t.firebaseNotice.bodyMiddle}
        <code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code>
        {t.firebaseNotice.bodyAfter}
      </p>
    </div>
  )
}
