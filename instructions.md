# System Architecture & Product Specification: Real-Time Event Interaction Wall

## 1. Executive Summary & Product Vision
The objective is to build a high-performance, real-time interactive "Live Wall" system designed for conferences. The system enables event attendees to scan a localized QR code, access a friction-free mobile web application (no app store download required), upload a text message along with an image, and see their post instantly projected onto a giant screen at the venue.

### Key Technical Pillars
* **Zero-Latency Interactions:** Sub-second updates using WebSocket-based data flows so the crowd experiences immediate feedback loops.
* **Strict Security & Content Control:** A dual-stage data pipeline separating unvetted submissions from public projection spaces to avoid unmoderated or inappropriate content.
* **Hardware Efficiency:** Client-side asset optimization ensuring that large smartphone camera images do not choke network bandwidth or degrade the venue's projector hardware.
* **Dynamic, Dynamic Layouts:** Fluid, automated front-end rendering engines that cycle through content organically, handling both massive traffic spikes and low-engagement lulls.

---

## 2. Tech Stack Blueprint
* **Frontend Ecosystem:** React (Vite-backed for highly responsive development and optimization), TailwindCSS for layout rendering.
* **Backend & State Real-Time Layer:** Firebase Suite
    * **Firebase Realtime Database (RTDB):** For sub-second synchronized system state and operational content nodes.
    * **Firebase Cloud Storage:** Optimized storage buckets for hosted user images.
    * **Firebase Cloud Functions (Optional / Future-Proofing):** For isolated server-side hooks like automated image checking or webhooks.
* **Asset Processing:** `browser-image-compression` or HTML5 Canvas APIs executed client-side.

---

## 3. Detailed Data Architecture (Firebase RTDB JSON Schema)

To keep performance exceptional, data must be kept entirely shallow. Deep nesting must be avoided. The following schema isolates events, configurations, and post lifecycles.

Code output
SUCCESS: Created file live_wall_llm_blueprint.md

```json
{
  "events": {
    "evt_alpha_2026": {
      "meta": {
        "eventName": "Global Tech Summit 2026",
        "createdAt": 1774883400000,
        "isActive": true
      },
      "settings": {
        "requireModeration": true,
        "primaryColor": "#1e3a8a",
        "secondaryColor": "#3b82f6",
        "maxCharacters": 150,
        "rotationSpeedMs": 8000
      },
      "pending_posts": {
        "post_99182371_xyz": {
          "userId": "anon_u8812",
          "userName": "Sarah M.",
          "text": "Incredible keynote speech! #TechSummit",
          "imageUrl": "[https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Fpending%2Fimg_99182371.jpg?alt=media](https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Fpending%2Fimg_99182371.jpg?alt=media)",
          "storagePath": "evt_alpha_2026/pending/img_99182371.jpg",
          "timestamp": 1774883415000
        }
      },
      "approved_posts": {
        "post_99182310_abc": {
          "userId": "anon_u1299",
          "userName": "David K.",
          "text": "Stunning venue layout this year!",
          "imageUrl": "[https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Fapproved%2Fimg_99182310.jpg?alt=media](https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Fapproved%2Fimg_99182310.jpg?alt=media)",
          "storagePath": "evt_alpha_2026/approved/img_99182310.jpg",
          "timestamp": 1774883402000
        }
      },
      "rejected_posts": {
        "post_99182102_def": {
          "userId": "anon_u4401",
          "userName": "Troll404",
          "text": "Inappropriate or spam text content here.",
          "imageUrl": "[https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Frejected%2Fimg_99182102.jpg?alt=media](https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/evt_alpha_2026%2Frejected%2Fimg_99182102.jpg?alt=media)",
          "storagePath": "evt_alpha_2026/rejected/img_99182102.jpg",
          "timestamp": 1774883390000,
          "moderatedAt": 1774883395000,
          "rejectionReason": "Profanity detected / Manual flag"
        }
      }
    }
  }
}
4. Operational Procedures & Execution Steps
Step 1: User Upload Journey & Edge Asset Optimization
QR Initialization: User scans a physical table tent card containing an URL paired with parameters: https://livewall.app/join/evt_alpha_2026.

Landing Page: Simple web UI requiring a Name/Nickname and accepting an image/text input. No authentication overhead required (or anonymous Firebase Auth can be initialized silently background to block malicious scripting attacks).

Client-Side Compression Pipeline:

When an image file is attached via <input type="file" accept="image/*">, the web app intercepts the execution thread.

The image file is passed through browser-image-compression utilizing target configuration parameters: maxWidthOrHeight: 1200, maxSizeMB: 0.6, useWebWorker: true.

Reasoning: Reduces raw smartphone captures (ranging between 4MB to 12MB) down to ultra-lean sizes under 600KB instantly on device hardware, preserving client data usage and accelerating network transfer speeds.

Data Transmission: The web app transfers the compressed blob to Firebase Storage (/evt_alpha_2026/pending/), retrieves the downloadable reference token link, and writes a flat schema payload straight to /events/evt_alpha_2026/pending_posts/.

Step 2: Dual-Stage Moderation Flow
The Gatekeeper View: Event coordinators open a specialized route protected by role-based authentication rules (/event/evt_alpha_2026/admin).

Real-Time Hydration: The Admin Dashboard listens to the /pending_posts node using Firebase RTDB .on('child_added'). Incoming items register on an administrative review board immediately.

State Resolution Actions:

Approve Command: A single transaction copies the data over to the /approved_posts node and instantly wipes the item out of /pending_posts.

Reject Command: Data is moved over to /rejected_posts alongside metadata reasons, and safely deleted from /pending_posts. (Optional automated step: A serverless cloud function script triggers to delete the unapproved file payload out of the Storage bucket to optimize usage space).

Step 3: Live Projection Wall Lifecycle Management
Display Client Bootup: The production machine attached to the venue's projection array navigates to the layout route (/event/evt_alpha_2026/wall) and sets the application tab into absolute fullscreen mode (F11).

Constrained Sync Listeners: The React app binds an active listener directly onto the approved node, but tightly constrains memory footprints:

JavaScript
const approvedRef = query(ref(db, 'events/evt_alpha_2026/approved_posts'), limitToLast(30));
Local State Queuing System:

When new items trickle in through the snapshot event pipeline, they are pushed inside a local JavaScript stack or custom state queue array (postQueue).

A background worker interval cycle pops components from the stack one item at a time, injecting them cleanly into viewports via smooth CSS keyframe transformations or CSS transitions.

Layout Dom Management: To protect the browser rendering context from total memory saturation over continuous hours of operation, the active rendered DOM array is hard capped at exactly 15 to 20 visible element representations. Older nodes drop off the DOM entirely as newly accepted elements arrive.

Step 4: Heartbeat & Fallback Protection Routines
Lull Management: In instances where interaction frequency stalls, the screen risks looking completely stagnant or disconnected.

Implementation Logic:

The React layout controller registers a tracking state timestamp variable lastPostReceivedTime = Date.now().

A continuous background worker timer function evaluates this state vector every 10 seconds.

If (Date.now() - lastPostReceivedTime) > 60000 (meaning a full 60 seconds have elapsed with zero incoming live submissions), the display container gracefully crossfades into a rotating loop of local pre-cached layout assets.

Fallback Stack Examples: An instruction overlay visual card ("Text your photos up to the screen! Scan the barcode code now!"), promotional slides highlighting primary corporate sponsors, or key event announcements.

Interrupt Handler: The moment a new approved post pushes through the live Firebase data stream, the system immediately drops the fallback rotation cycle and animations smoothly transition back to the crowd interaction feed.

5. Instructions for the LLM Implementation Generator
When generating code bases from this document, fulfill the following requirements:

Tailwind Class Precision: Implement elegant CSS transitions (transition-all duration-300 ease-in-out) paired with fluid visual designs suited for dark ambient projection environments (e.g., deep background tones, highly readable typography sizes, and subtle luminous dropshadow accents).

Clean State Hooks: Ensure that the Firebase real-time listeners cleanly invoke cleanup reference unsubscriptions inside the React useEffect hooks return blocks to prevent severe thread leaks.

Defensive Processing: Implement strict client errors blocks. If the user's mobile internet connectivity drops or upload pipelines falter, show clear, non-intrusive modal alerts encouraging them to retry their upload.
