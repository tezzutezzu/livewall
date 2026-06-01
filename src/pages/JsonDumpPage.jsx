import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { isFirebaseConfigured } from '../firebase/config'
import { useApprovedPosts } from '../hooks/usePosts'
import { useEventSettings } from '../hooks/useEventSettings'
import FirebaseNotice from '../components/FirebaseNotice'
import Spinner from '../components/Spinner'
import Modal from '../components/Modal'

export default function JsonDumpPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  useEventSettings(eventId)
  const { posts, loaded } = useApprovedPosts(eventId, 100) // Fetch up to 100 posts

  const svgRef = useRef(null)
  const [d3Loaded, setD3Loaded] = useState(() => typeof window !== 'undefined' && !!window.d3)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showOverlay, setShowOverlay] = useState(() => {
    const saved = localStorage.getItem('livewall:showRelationMapOverlay')
    return saved !== 'false'
  })

  useEffect(() => {
    localStorage.setItem('livewall:showRelationMapOverlay', showOverlay)
  }, [showOverlay])

  // Helper to highlight hashtags and parse clickable links inside the modal
  const renderParsedText = (text) => {
    if (!text) return null
    // Matches URLs starting with http(s), URLs starting with www., and hashtags
    const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|#\w+)/g
    const parts = text.split(regex)
    return parts.map((part, i) => {
      if (!part) return null
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            className="inline-block font-extrabold text-sky-400 bg-sky-400/15 border border-sky-400/25 px-1.5 py-0.5 rounded-md mx-0.5 select-all"
          >
            {part}
          </span>
        )
      }
      const isUrl = part.startsWith('http://') || part.startsWith('https://') || part.startsWith('www.')
      if (isUrl) {
        const href = part.startsWith('www.') ? `https://${part}` : part
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sky-400 hover:text-sky-300 underline decoration-2 underline-offset-4 transition break-all select-all"
          >
            {part}
          </a>
        )
      }
      return part
    })
  }


  // Load D3 dynamically in browser environment to bypass restricted npm registry
  useEffect(() => {
    if (typeof window === 'undefined' || window.d3) return
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/d3@7'
    script.async = true
    script.onload = () => setD3Loaded(true)
    document.body.appendChild(script)
  }, [])

  // Process network data and draw D3 force graph
  useEffect(() => {
    if (!loaded || !d3Loaded || posts.length === 0 || !svgRef.current) return

    const d3 = window.d3
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous elements

    const width = svgRef.current.clientWidth || window.innerWidth
    const height = svgRef.current.clientHeight || window.innerHeight

    // 1. Helper to extract lowercased hashtags
    const getHashtags = (text) => {
      if (!text) return []
      const matches = text.match(/#\w+/g)
      return matches ? matches.map((h) => h.toLowerCase()) : []
    }

    // 2. Build D3 nodes from approved posts
    const nodes = posts.map((p) => ({
      id: p.id,
      userName: p.userName,
      text: p.text,
      imageUrl: p.imageUrl,
      hashtags: getHashtags(p.text),
    }))

    // 3. Build D3 links where posts share at least one hashtag
    const links = []
    for (let i = 0; i < nodes.length; i++) {
      const tagsA = nodes[i].hashtags
      if (tagsA.length === 0) continue

      for (let j = i + 1; j < nodes.length; j++) {
        const tagsB = nodes[j].hashtags
        const common = tagsA.filter((t) => tagsB.includes(t))
        if (common.length > 0) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            hashtags: common,
          })
        }
      }
    }

    // Container element supporting zoom and pan
    const g = svg.append('g')

    // Configure D3 Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Centered translation by default
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1))

    // 4. Force directed simulation settings
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(300))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(140)) // prevent card overlapping

    // 5. Draw edges (dash-array glowing link lines)
    const linkGroup = g.append('g').selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-element')

    const link = linkGroup.append('line')
      .attr('stroke', 'var(--event-secondary, #3b82f6)')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '4, 4')


    // 6. Draw nodes as HTML blocks embedded inside SVG foreignObjects
    const node = g.append('g').selectAll('foreignObject')
      .data(nodes)
      .enter()
      .append('foreignObject')
      .attr('width', 240)
      .attr('height', 110)
      .attr('x', -120)
      .attr('y', -55)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (event.defaultPrevented) return
        setSelectedPost(d)
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    // Inject high-fidelity CSS glass cards inside the foreignObject containers
    node.append('xhtml:div')
      .style('width', '100%')
      .style('height', '100%')
      .style('box-sizing', 'border-box')
      .html((d) => `
        <div class="rounded-2xl border border-white/10 bg-ink-800/95 shadow-2xl backdrop-blur text-left h-full flex overflow-hidden select-none transition duration-200 hover:border-white/25 hover:scale-102" style="box-shadow: 0 10px 30px rgba(0,0,0,0.65); box-sizing: border-box; width: 100%; height: 100%;">
          ${d.imageUrl ? `
            <div class="w-[80px] h-full flex-shrink-0 overflow-hidden bg-ink-900/50 border-r border-white/5">
              <img src="${d.imageUrl}" class="w-full h-full object-cover" alt="Post preview" />
            </div>
          ` : ''}
          <div class="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <p class="text-[11px] text-white/90 leading-snug font-medium line-clamp-3 overflow-hidden break-words">
                ${d.text || '<span class="italic opacity-30">Nessun testo scritto</span>'}
              </p>
            </div>
            ${d.hashtags.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-1">
                ${d.hashtags.slice(0, 2).map((h) => `<span class="text-[9px] font-bold text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded-md truncate max-w-[80px]">${h}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `)

    // 7. Force tick updates
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)


      node
        .attr('x', (d) => d.x - 120)
        .attr('y', (d) => d.y - 55)
    })

    // Drag behavior implementations
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [loaded, d3Loaded, posts])

  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ink-950 p-6">
        <FirebaseNotice />
      </div>
    )
  }

  return (
    <div className="h-svh w-full bg-ink-950 text-white overflow-hidden relative flex flex-col">
      {/* Floating overlays */}
      <header className="absolute top-0 left-0 w-full z-10 pointer-events-none p-6 flex justify-between items-start">
        {showOverlay ? (
          <div className="relative pointer-events-auto bg-black/50 border border-white/10 backdrop-blur rounded-2xl p-4 max-w-xs shadow-2xl select-none">
            <button
              type="button"
              onClick={() => setShowOverlay(false)}
              className="absolute top-3 right-3 text-white/40 hover:text-white hover:bg-white/10 rounded-lg p-1 transition cursor-pointer"
              aria-label="Chiudi legenda"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-white/60 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer mb-3.5 inline-block transition"
            >
              ← Launcher
            </button>
            <h1 className="text-lg font-black tracking-tight text-white pr-6">
              Mappa Relazioni Evento
            </h1>
            <p className="text-xs text-white/50 leading-relaxed mt-1">
              Grafico interattivo D3 che collega i post aventi hashtag in comune. Trascina le card per riorganizzare o usa la rotellina per zoomare.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowOverlay(true)}
            className="pointer-events-auto bg-black/50 border border-white/10 backdrop-blur rounded-2xl p-3 max-w-xs shadow-2xl text-xs font-semibold text-white/60 hover:text-white hover:bg-black/60 border border-white/5 cursor-pointer transition flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Mostra Legenda</span>
          </button>
        )}

        <div className="pointer-events-auto bg-black/50 border border-white/10 backdrop-blur rounded-xl px-4 py-2 shadow-lg flex items-center gap-3 select-none text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Post Attivi: <strong>{posts.length}</strong></span>
          </div>
          <div className="h-3 w-[1px] bg-white/20" />
          <span>Navigazione: <strong>Rotella & Trascina</strong></span>
        </div>
      </header>

      {/* SVG Rendering Area */}
      <div className="flex-1 h-full w-full relative">
        {!loaded || !d3Loaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950 z-0">
            <Spinner label="Generazione del grafico delle relazioni in corso..." />
          </div>
        ) : posts.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center z-0 select-none">
            <span className="text-6xl">🕸️</span>
            <h2 className="text-xl font-bold text-white">Nessun post correlato</h2>
            <p className="max-w-xs text-sm text-white/50 mt-1">
              I post compariranno qui collegati in rete non appena approvati ed etichettati con hashtag.
            </p>
          </div>
        ) : null}

        <svg
          ref={svgRef}
          className="h-full w-full block bg-ink-950"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Glassmorphic full-text detail modal */}
      <Modal
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        title="Dettaglio Messaggio"
        actions={
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            className="rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
          >
            Chiudi
          </button>
        }
      >
        <div className="pt-2 select-text space-y-4">
          {selectedPost && selectedPost.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-ink-900 max-h-[260px] flex items-center justify-center">
              <img
                src={selectedPost.imageUrl}
                alt="Post media"
                className="w-full h-full object-contain max-h-[260px]"
              />
            </div>
          )}
          <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap break-words">
            {selectedPost && renderParsedText(selectedPost.text)}
          </p>
        </div>
      </Modal>
    </div>
  )
}
