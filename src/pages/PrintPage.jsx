import { useParams, useNavigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config'
import { useApprovedPosts } from '../hooks/usePosts'
import FirebaseNotice from '../components/FirebaseNotice'
import Spinner from '../components/Spinner'
import { t } from '../i18n/strings'

export default function PrintPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { posts, loaded } = useApprovedPosts(eventId, 250) // fetch a generous maximum of 250 approved posts

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 p-6">
        <FirebaseNotice />
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-white text-slate-950 font-sans">
      {/* Print CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print {
            display: none !important;
          }
          body, html, #root {
            background: white !important;
            color: black !important;
          }
          @page {
            margin: 1.2cm;
            size: auto;
          }
        }
      `}} />

      {/* Control Header - Invisible during printing */}
      <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-slate-50 px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition"
            >
              ← Torna alla Home
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Layout Stampa Post
              </h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                ID Evento: {eventId}
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-sm font-semibold cursor-pointer transition flex items-center gap-2 shadow-sm"
          >
            🖨️ Avvia Stampa Report
          </button>
        </div>
      </header>

      {/* Main Printable Content */}
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        {!loaded ? (
          <div className="no-print flex justify-center py-24">
            <Spinner label={t.common.loading} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center select-none">
            <span className="text-5xl">💬</span>
            <h2 className="text-xl font-semibold text-slate-850">
              Nessun post approvato
            </h2>
            <p className="max-w-xs text-sm text-slate-500 mt-1">
              I post appariranno qui in tempo reale non appena approvati ed esposti sul muro.
            </p>
          </div>
        ) : (
          <div>
            {/* Printable Header */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-8 select-none">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                LiveWall - Report Post
              </h1>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>ID Evento: <strong className="text-slate-800">{eventId}</strong></span>
                <span>Totale Post Approvati: <strong className="text-slate-800">{posts.length}</strong></span>
                <span>Data Stampa: {new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Clean Print Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-250 bg-white p-5 shadow-sm break-inside-avoid page-break-inside-avoid"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {post.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 mb-4">
                      <img
                        src={post.imageUrl}
                        alt="Post thumbnail"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex-grow flex flex-col">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed break-words flex-grow">
                      {post.text || <span className="italic text-slate-400">Nessun messaggio scritto.</span>}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-700">
                        👤 {post.userName || t.common.guest}
                      </span>
                      <span>
                        ⏰ {formatPrintTime(post.timestamp)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function formatPrintTime(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}
