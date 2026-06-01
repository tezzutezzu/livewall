/*
 * Italian UI strings — single source of truth for all user-facing copy.
 *
 * Static strings live as plain values; anything with a count or variant is a
 * small formatter function so pluralization stays correct in Italian.
 * To add another locale later, export a sibling object with the same shape and
 * pick between them here.
 */
export const t = {
  common: {
    guest: 'Ospite',
    loading: 'Caricamento',
    tryAgain: 'Riprova',
    dismiss: 'Chiudi',
    remove: 'Rimuovi',
  },

  firebaseNotice: {
    title: 'Firebase non è ancora configurato',
    // Rendered with <code> chips around the two file names.
    bodyBefore: 'Copia ',
    bodyMiddle: ' in ',
    bodyAfter:
      ' e inserisci le credenziali del tuo progetto Firebase, poi riavvia il server di sviluppo. Sincronizzazione in tempo reale, caricamento immagini e moderazione richiedono questi valori.',
  },

  home: {
    tagline: 'Muro interattivo per eventi in tempo reale — invia, modera, proietta.',
    eventId: 'ID evento',
    openForm: 'Apri il modulo partecipanti →',
    routes: {
      join: {
        title: 'Modulo di invio',
        desc: 'Ciò che vedono i partecipanti dopo aver scansionato il QR code.',
      },
      admin: {
        title: 'Pannello di moderazione',
        desc: 'Approva o rifiuta i post in arrivo in tempo reale.',
      },
      wall: {
        title: 'Muro Live',
        desc: 'Il feed proiettato a schermo intero per la sede.',
      },
      feed: {
        title: 'Feed Mobile',
        desc: 'Il feed social in tempo reale per i telefoni dei partecipanti.',
      },
      print: {
        title: 'Stampa Report',
        desc: 'Layout ad alto contrasto ottimizzato per stampare tutti i post dell’evento.',
      },
      json: {
        title: 'Mappa Relazioni',
        desc: 'Grafico interattivo D3 che collega in rete i post aventi hashtag in comune.',
      },
    },
  },

  join: {
    stageCompressing: 'Ottimizzazione della foto…',
    stageUploading: 'Caricamento…',
    stageSaving: 'Pubblicazione sul muro…',
    offlineBanner: 'Sei offline. Aspettiamo noi — riconnettiti per inviare il tuo post.',
    title: 'Pubblica sul Muro Live',
    subtitle: 'Condividi una foto e un messaggio — apparirà sul grande schermo.',
    nameLabel: 'Il tuo nome',
    namePlaceholder: 'Puoi usare anche un nickname',
    messageLabel: 'Messaggio',
    messagePlaceholder: 'Condividi i tuoi pensieri, una risorsa o commenta l’evento!',
    charsLeft: (n) => `${n} ${n === 1 ? 'carattere rimasto' : 'caratteri rimasti'}`,
    photoLabel: 'Foto (facoltativa)',
    addPhoto: 'Tocca per aggiungere una foto',
    submit: 'Invia al muro →',
    successTitle: 'Sei sul muro! 🎉',
    successDirect:
      'Grazie! Il tuo post sta arrivando sul grande schermo proprio ora.',
    postAnother: 'Pubblica un altro',
    errorTitle: 'Qualcosa è andato storto',
    errorOffline: 'Sembri offline. Riconnettiti e riprova.',
    errorSubmit:
      'Non siamo riusciti a pubblicare il tuo messaggio. Controlla la connessione e riprova.',
  },

  admin: {
    title: 'Pannello di moderazione',
    eventLabel: 'Evento',
    count: (n) => `${n} ${n === 1 ? 'messaggio' : 'messaggi'}`,
    hiddenCount: (n) => `${n} ${n === 1 ? 'nascosto' : 'nascosti'}`,
    connecting: 'Caricamento dei messaggi…',
    emptyTitle: 'Ancora nessun messaggio',
    emptyBody:
      'I messaggi appariranno qui in tempo reale man mano che i partecipanti pubblicano.',
    noMessage: 'Nessun messaggio',
    hide: 'Nascondi',
    unhide: 'Mostra',
    delete: 'Elimina',
    hiddenBadge: 'Nascosto dal muro',
    deleteTitle: 'Eliminare questo messaggio?',
    deleteBody:
      'L’azione è definitiva: il messaggio e la sua immagine verranno rimossi.',
    confirmDelete: 'Elimina definitivamente',
    cancel: 'Annulla',
    save: 'Salva',
    edit: 'Modifica',
    actionFailedTitle: 'Azione non riuscita',
    hideError: 'Impossibile aggiornare il messaggio. Riprova.',
    deleteError: 'Impossibile eliminare il messaggio. Riprova.',
    editError: 'Impossibile modificare il messaggio. Riprova.',
  },

  adminGate: {
    title: 'Area Riservata Amministratore',
    subtitle: 'L\'accesso a questa pagina è limitato esclusivamente all\'operatore autorizzato. Accedi con il tuo account Google.',
    loginWithGoogle: 'Accedi con Google',
    deniedTitle: 'Accesso Non Autorizzato',
    deniedSubtitle: (email) => `L'account ${email} non dispone dei privilegi di amministrazione. Solo danilo@tezzutezzu.com può accedere.`,
    signOut: 'Usa un altro account',
    loading: 'Verifica autorizzazione in corso...',
  },

  wall: {
    postsLive: (n) => `${n} post in diretta`,
    standingBy: 'In attesa',
    waitingTitle: 'In attesa del primo post…',
    waitingSubtitle: ' ',
    enterFullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    enterFullscreenLabel: '⛶ Schermo intero',
    exitFullscreenLabel: '⤢ Esci',
    showFallback: 'Mostra promo',
    hideFallback: 'Nascondi promo',
    showFallbackTitle: 'Mostra le slide promozionali (QR / inviti)',
    hideFallbackTitle: 'Torna al feed dal vivo',
  },

  wallCard: {
    imageAlt: 'Invio di un partecipante',
  },

  validation: {
    chooseImage: 'Scegli un’immagine.',
    notImage: 'Questo file non è un’immagine.',
    tooLarge: 'Questa immagine è troppo grande (max 15 MB).',
  },
}
