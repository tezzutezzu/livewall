import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import AdminPage from './pages/AdminPage'
import WallPage from './pages/WallPage'
import FeedPage from './pages/FeedPage'
import PrintPage from './pages/PrintPage'
import JsonDumpPage from './pages/JsonDumpPage'
import AdminGate from './components/AdminGate'

/**
 * Route map (blueprint §4):
 *   /                         → operator launcher (PROTECTED)
 *   /join/:eventId            → attendee upload form (PROTECTED)
 *   /event/:eventId/admin     → moderation dashboard (PROTECTED)
 *   /event/:eventId/wall      → projected live wall (PUBLIC)
 *   /event/:eventId/feed      → attendee-facing mobile feed (PUBLIC)
 *   /event/:eventId/print     → print-friendly posts grid layout (PROTECTED)
 *   /event/:eventId/json      → interactive D3 network graph (PUBLIC)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminGate><HomePage /></AdminGate>} />
        <Route path="/join/:eventId" element={<AdminGate><JoinPage /></AdminGate>} />
        <Route path="/event/:eventId/admin" element={<AdminGate><AdminPage /></AdminGate>} />
        <Route path="/event/:eventId/wall" element={<WallPage />} />
        <Route path="/event/:eventId/feed" element={<FeedPage />} />
        <Route path="/event/:eventId/print" element={<AdminGate><PrintPage /></AdminGate>} />
        <Route path="/event/:eventId/json" element={<JsonDumpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
