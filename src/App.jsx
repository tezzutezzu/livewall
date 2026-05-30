import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import AdminPage from './pages/AdminPage'
import WallPage from './pages/WallPage'
import FeedPage from './pages/FeedPage'
import PrintPage from './pages/PrintPage'

/**
 * Route map (blueprint §4):
 *   /                         → operator launcher
 *   /join/:eventId            → attendee upload form (QR deep-link target)
 *   /event/:eventId/admin     → moderation dashboard
 *   /event/:eventId/wall      → projected live wall
 *   /event/:eventId/feed      → attendee-facing mobile feed
 *   /event/:eventId/print     → print-friendly posts grid layout
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join/:eventId" element={<JoinPage />} />
        <Route path="/event/:eventId/admin" element={<AdminPage />} />
        <Route path="/event/:eventId/wall" element={<WallPage />} />
        <Route path="/event/:eventId/feed" element={<FeedPage />} />
        <Route path="/event/:eventId/print" element={<PrintPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
