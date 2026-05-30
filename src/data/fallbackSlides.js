/*
 * Pre-cached fallback assets shown when the wall has had no new posts for 60s
 * (blueprint §4.4). These are pure CSS/text slides so they ship in the bundle
 * and need no network — swap in real sponsor artwork by adding `image` URLs.
 *
 * Each slide: { id, kind, title, subtitle?, emoji?, image? }
 * The `qr` slide is special: FallbackRotator renders a live QR code pointing at
 * the event's join URL (no `emoji`/`image` needed).
 */
export const fallbackSlides = [
  // {
  //   id: 'cta',
  //   kind: 'cta',
  //   emoji: '📲',
  //   title: 'Aiutaci a ',
  //   subtitle: 'Scansiona il QR code sul tuo tavolo e pubblica la tua foto + messaggio.',
  // },
  {
    id: 'qr',
    kind: 'qr',
    title: 'Inquadra per partecipare',
    subtitle: 'Scansiona il QR code per pubblicare il tuo messaggio',
  },
]
