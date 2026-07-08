// ============================================================
//  ✏️✏️✏️  YOUR CONTENT LIVES HERE — everything marked FILL ME
//  is a placeholder for you to replace. The 3D room reads from
//  this file, so you rarely need to touch the three/ folder.
// ============================================================

export const CONTENT = {
  siteTitle: 'AUDREY LI',                       // ✏️ FILL ME — your name as it appears on the loading screen
  tagline: 'the colourless room: a portfolio',                 // ✏️ FILL ME — subtitle under your name
  email: 'audreyli2025@gmail.com',                 // ✏️ FILL ME — your contact email
  // ✏️ FILL ME — paste your playlist link, e.g. 'https://open.spotify.com/playlist/XXXX'.
  // A playable Spotify player appears inside the vinyl popup automatically.
  spotifyUrl: 'https://open.spotify.com/playlist/2700rSzXFDK1FqCact9aKw?si=0a43c4ca6d2a4ab6',
  planningDocUrl: 'https://docs.google.com/document/d/1zF2Lp-dUv09x-QOmOnOEq1drrMW4FKe-dxbRZrIX4Qo/edit?usp=sharing',                          // ✏️ FILL ME — link to this project's planning process doc
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
    afterKey: 'a key... where does it unlock?',
    catAsleep: 'the marble cat sleeps too deeply to be moved. it seems to be waiting for something...',
    doorFound: 'so that is what the cat was keeping warm.',
  },

  // Each key below is one interactive object in the room.
  // popup: 'paper' (paintings — un-crumples) | 'marble' (statues — builds up)
  items: {
    'work-1': {
      popup: 'paper',
      title: 'Project One',                     // ✏️ FILL ME
      subtitle: 'found me!', // FILL ME — year · role · medium
      body: 'also in the works :D', // FILL ME — two or three sentences about this piece of work: what it is, why you made it, what it taught you.
      link: '#',                                // ✏️ FILL ME — live link or repo
      linkLabel: 'View project',
    },
    'work-2': {
      popup: 'paper',
      title: 'Project Two',                     // ✏️ FILL ME
      subtitle: 'in the works!',
      body: 'also in the works :P',
      link: '#',
      linkLabel: 'View project',
    },
    'work-3': {
      popup: 'paper',
      title: 'Project Three',                   // ✏️ FILL ME
      subtitle: 'found me!',
      body: 'waiting for more details...',
      link: '#',
      linkLabel: 'View project',
    },
    'food': {
      popup: 'paper',
      title: 'The Apple',
      subtitle: 'will be filled soon...',
      body: 'maybe a Beli list? lol', // FILL ME — your love of food. Favourite dishes, places, things you cook. You can link a photo gallery here.
      link: '#',                                // ✏️ FILL ME — food gallery link (optional)
      linkLabel: 'Open the food gallery',
    },
    'fencing': {
      popup: 'marble',
      title: 'En Garde',
      subtitle: 'marble, mostly · the sword is real',
      body: 'I like to travel the world to poke people with bendy sticks',
      link: '',
      linkLabel: '',
    },
    'portrait': {
      popup: 'paper',
      title: 'Self Portrait, Unfinished',
      subtitle: 'I'll tell you all about me...',
      body: '...once I get to it ofc lol.',
      link: '',
      linkLabel: '',
    },
    'contact': {
      popup: 'paper',
      title: 'Correspondence',
      subtitle: 'let's chat?',
      body: 'or smth else 😏',
      link: 'MAILTO',                           // keep as 'MAILTO' to use the email above
      linkLabel: 'write to me',
    },
    'spotify': {
      popup: 'paper',
      title: 'Now Spinning',
      subtitle: 'my joy',
      body: 'my recents and inspo for this portfolio!',
      link: 'SPOTIFY',                          // keep as 'SPOTIFY' to use spotifyUrl above
      linkLabel: 'Listen on Spotify',
    },
  },

  // The void behind the hidden door.
  secretNote: {
    // ✏️ FILL ME — the quote that breaks the fourth wall. Swap for any line you love.
    watching: '“You mistook the brightest things for the whole world.”',
    watchingBy: '',
    lines: [
      'Woah! you actually spent time looking around, I appreciate you! ☺️',
      'I wanted something unique for a personal piece, while also learning how to be a more technical creative.',
      'Thank you for taking the time to view my portfolio! More to come once I finish that Three.js Journey course :P',
    ],
    planningLabel: 'the planning process, attached',
    beyondLabel: 'open your eyes',
  },

  // The thank-you letter under the cat's paw (after "take me beyond").
  thankYou: {
    title: 'Thank you for your company ❤️',
    body: 'We all have a story to share, so feel free to reach out!',
  },

  // Museum wall labels. They read like real gallery labels — the
  // painting's own name — while your popups live behind the colour.
  plaques: {
    'work-1': ['The Starry Night', 'van Gogh, 1889'],
    'work-2': ['The Great Wave off Kanagawa', 'Hokusai, c. 1831'],
    'work-3': ['The Scream', 'Munch, 1893'],
    'food': ['The Basket of Apples', 'Cézanne, c. 1893'],
    'fencing': ['En Garde', 'the sword is real'],
    'portrait': ['Mona Lisa', 'da Vinci, c. 1506'],
    'contact': ['Girl Reading a Letter', 'Vermeer, c. 1657'],
    'spotify': ['Now Spinning', 'gramophone, brass & wood'],
    'reel': ['A Moving Picture', 'press play'],
    'catstatue': ['Gallery Cat', 'marble · do not disturb'],
  },
}
