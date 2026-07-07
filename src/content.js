// ============================================================
//  ✏️✏️✏️  YOUR CONTENT LIVES HERE — everything marked FILL ME
//  is a placeholder for you to replace. The 3D room reads from
//  this file, so you rarely need to touch the three/ folder.
// ============================================================

export const CONTENT = {
  siteTitle: 'AUDREY LI',                       // ✏️ FILL ME — your name as it appears on the loading screen
  tagline: 'a colourless room',                 // ✏️ FILL ME — subtitle under your name
  email: '4udr3y.li@gmail.com',                 // ✏️ FILL ME — your contact email
  // ✏️ FILL ME — paste your playlist link, e.g. 'https://open.spotify.com/playlist/XXXX'.
  // A playable Spotify player appears inside the vinyl popup automatically.
  spotifyUrl: 'https://open.spotify.com/',
  planningDocUrl: '#',                          // ✏️ FILL ME — link to this project's planning process doc
  // ✏️ FILL ME — your intro film. Put the file in /public and set e.g. '/intro.mp4'.
  // It is projected onto the gallery screen with a camera zoom when
  // someone clicks the projector.
  introVideoSrc: '',
  // Background music: by default the room synthesizes Gymnopédie No. 1
  // (Satie, public domain) through a grand-hall reverb. To use a real
  // recording you own (e.g. the Philippe Entremont performance), put the
  // file in /public and set: musicSrc: '/gymnopedie.mp3'
  musicSrc: '',
  musicCredit: 'Gymnopédie No. 1 — Erik Satie',

  // The room's little riddles. Keep them oblique — they are hints, not signs.
  hints: {
    title: 'everything faded except what mattered',           // ✏️ FILL ME — the one line on the landing page
    afterFilm: '…did you hear that? something slipped from the chandelier.',
    afterKey: 'a key. somewhere, a sleeping guard is keeping its lock warm.',
    catAsleep: 'the marble cat sleeps too deeply to be moved. it seems to be waiting for something.',
    doorFound: 'so that is what the cat was keeping warm.',
  },

  // Each key below is one interactive object in the room.
  // popup: 'paper' (paintings — un-crumples) | 'marble' (statues — builds up)
  items: {
    'work-1': {
      popup: 'paper',
      title: 'Project One',                     // ✏️ FILL ME
      subtitle: 'FILL ME — year · role · medium',
      body: 'FILL ME — two or three sentences about this piece of work: what it is, why you made it, what it taught you.',
      link: '#',                                // ✏️ FILL ME — live link or repo
      linkLabel: 'View project',
    },
    'work-2': {
      popup: 'paper',
      title: 'Project Two',                     // ✏️ FILL ME
      subtitle: 'FILL ME — year · role · medium',
      body: 'FILL ME — description of your second project.',
      link: '#',
      linkLabel: 'View project',
    },
    'work-3': {
      popup: 'paper',
      title: 'Project Three',                   // ✏️ FILL ME
      subtitle: 'FILL ME — year · role · medium',
      body: 'FILL ME — description of your third project.',
      link: '#',
      linkLabel: 'View project',
    },
    'food': {
      popup: 'paper',
      title: 'The Apple',
      subtitle: 'still life · always hungry',
      body: 'FILL ME — your love of food. Favourite dishes, places, things you cook. You can link a photo gallery here.',
      link: '#',                                // ✏️ FILL ME — food gallery link (optional)
      linkLabel: 'Open the food gallery',
    },
    'fencing': {
      popup: 'marble',
      title: 'En Garde',
      subtitle: 'marble, mostly · the sword is real',
      body: 'FILL ME — your fencing story. How you started, what you compete in, what the sport means to you.',
      link: '',
      linkLabel: '',
    },
    'portrait': {
      popup: 'paper',
      title: 'Self Portrait, Unfinished',
      subtitle: 'the artist, about herself',
      body: 'FILL ME — a short introduction to who you are. This is your "about me" painting.',
      link: '',
      linkLabel: '',
    },
    'contact': {
      popup: 'paper',
      title: 'Correspondence',
      subtitle: 'the artist replies to letters',
      body: 'FILL ME — a line inviting people to write to you.',
      link: 'MAILTO',                           // keep as 'MAILTO' to use the email above
      linkLabel: 'write to me',
    },
    'spotify': {
      popup: 'paper',
      title: 'Now Spinning',
      subtitle: 'one record, on repeat',
      body: 'FILL ME — a line about your music taste. The link below should go to your most-listened playlist.',
      link: 'SPOTIFY',                          // keep as 'SPOTIFY' to use spotifyUrl above
      linkLabel: 'Listen on Spotify',
    },
  },

  // The void behind the hidden door.
  secretNote: {
    // ✏️ FILL ME — the quote that breaks the fourth wall. Swap for any line you love.
    watching: '“Reality is created by the mind. We can change our reality by changing our mind.”',
    watchingBy: '— attributed to Plato',
    lines: [
      'FILL ME — this is your handwritten note.',
      'Your views, your philosophy, why you built this room.',
      'Write it like a letter to whoever was curious enough to find it.',
    ],
    planningLabel: 'the planning process, attached',
    beyondLabel: 'open your eyes',
  },

  // The thank-you letter under the cat's paw (after "take me beyond").
  thankYou: {
    title: 'thank you for going beyond',
    body: 'FILL ME — a warm closing note to the visitor who finished the whole story.',
  },

  // Museum wall labels for YOUR pieces (the coloured ones). Decorative
  // paintings get their real title/artist automatically from the catalog.
  plaques: {
    'work-1': ['Project One', 'after van Gogh · FILL ME'],
    'work-2': ['Project Two', 'after Hokusai · FILL ME'],
    'work-3': ['Project Three', 'after Munch · FILL ME'],
    'food': ['The Apple', 'after Cézanne · always hungry'],
    'fencing': ['En Garde', 'marble & one coloured sword'],
    'portrait': ['Self Portrait, Unfinished', 'after da Vinci · the artist'],
    'contact': ['Correspondence', 'after Vermeer · write to me'],
    'spotify': ['Now Spinning', 'vinyl, coloured'],
    'reel': ['A Moving Picture', 'about the artist — press play'],
    'catstatue': ['Gallery Cat', 'marble · do not disturb'],
  },
}
