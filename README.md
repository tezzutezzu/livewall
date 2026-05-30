# LiveWall — Real-Time Event Interaction Wall

A high-performance, real-time "Live Wall" for conferences. Attendees scan a QR
code, post a photo + message from their phone, event staff moderate, and
approved posts animate onto a giant projected screen in real time.

Built with **React (Vite)**, **TailwindCSS v4**, and the **Firebase Suite**
(Realtime Database + Cloud Storage + anonymous Auth).

## Three surfaces

| Route | Purpose |
| --- | --- |
| `/join/:eventId` | **User upload form** — name, message, photo. Compresses the image on-device, uploads to Storage, writes to RTDB. The QR deep-link target. |
| `/event/:eventId/admin` | **Moderation dashboard** — live `pending_posts` queue with one-tap approve / reject (with reason). |
| `/event/:eventId/wall` | **Live Wall** — full-screen projected feed with smooth entrance animations, a memory-capped DOM, and an idle/lull fallback slideshow. |
| `/` | Operator launcher for opening any of the above against an event ID. |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase credentials
npm run dev
```

Without Firebase credentials the app still boots and shows a friendly
"configure Firebase" notice on each surface.

### Build

```bash
npm run build && npm run preview
```

## Architecture

```
src/
  firebase/
    config.js        Firebase init from env vars + silent anonymous auth
    paths.js         Single source of truth for the shallow RTDB/Storage paths
    storage.js       Compressed-image upload → download URL + storage path
    posts.js         submit / listen / approve / reject (atomic multi-path moves)
  hooks/
    useEventSettings.js   Live settings + per-event color theming via CSS vars
    usePosts.js           usePendingPosts / useApprovedPosts (limitToLast)
    useWallController.js  Queue + rotation worker + DOM cap + lull heartbeat
    useOnlineStatus.js    Connectivity watch for defensive upload UX
  lib/compressImage.js    browser-image-compression pipeline (1200px / 0.6 MB)
  components/             Button, Modal, Spinner, WallCard, FallbackRotator, …
  pages/                 HomePage, JoinPage, AdminPage, WallPage
  data/fallbackSlides.js Pre-cached lull slides (CTA / instructions / sponsors)
```

### How the blueprint maps to the code

- **Client-side compression** — `lib/compressImage.js` targets
  `maxWidthOrHeight: 1200`, `maxSizeMB: 0.6`, `useWebWorker: true`.
- **Shallow data schema** — every node path lives in `firebase/paths.js`; posts
  are flat objects under `pending_posts` / `approved_posts` / `rejected_posts`.
- **Atomic moderation** — approve/reject use a single `update()` multi-path
  write so a post is copied and deleted in one transaction (no orphan states).
- **Memory-constrained wall** — listener uses `limitToLast(30)`; the rendered
  DOM is hard-capped at 16 cards (`useWallController`), older nodes drop off.
- **Rotation worker** — a `setInterval` pops one queued post per
  `rotationSpeedMs`, injecting it with a CSS keyframe entrance animation.
- **Lull / heartbeat fallback** — a 10s heartbeat flips to `idle` after 60s with
  no *new* posts and crossfades to a rotating fallback slideshow; any new post
  instantly interrupts it back to the live feed.
- **Defensive UX** — offline detection, file validation, and non-intrusive modal
  error alerts encourage retry. All RTDB listeners unsubscribe in effect cleanup.

## Firebase setup

1. Create a project; enable **Realtime Database**, **Cloud Storage**, and
   **Anonymous Authentication**.
2. Seed an event matching the schema in `instructions.md` (e.g. `evt_alpha_2026`
   with a `settings` node). Defaults are applied client-side if absent.
3. Lock down access with **security rules** — this is the authoritative guard.
   The `VITE_ADMIN_PASSCODE` gate on the dashboard is only a client convenience;
   restrict writes to `approved_posts` / `rejected_posts` to authorized staff in
   your RTDB rules, and keep `pending_posts` write-open to anonymous users.

> Optional: a Cloud Function can garbage-collect rejected Storage objects, as
> noted in blueprint §4.2.
