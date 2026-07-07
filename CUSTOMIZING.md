# Making the room yours — a step-by-step guide

Everything personal lives in **one file: `src/content.js`**. You never
need to touch the 3D code to change what the room says about you.
Open it in any editor and work through this list.

## 0. See your changes live

```bash
cd ~/portfolio-room
npm run dev          # opens http://localhost:5173 — edits hot-reload
```

Add `?reset` to the URL any time you want to replay the easter egg.

## 1. Name and tagline

```js
siteTitle: 'AUDREY LI',       // the big name on the landing page
tagline: 'a colourless room', // the italic line under it
email: 'you@example.com',     // used by every "write to me" link
```

## 2. Your Spotify playlist (it actually plays)

1. In Spotify, open your playlist → ⋯ → Share → **Copy link to playlist**.
2. Paste it in:

```js
spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
```

That's it — because the link contains `/playlist/`, a playable Spotify
player automatically appears inside the vinyl popup. (Album and track
links work too.)

## 3. Your intro film

1. Export your video as `.mp4` (1280×720 is plenty).
2. Drop the file into the `public/` folder, e.g. `public/intro.mp4`.
3. Point at it:

```js
introVideoSrc: '/intro.mp4',
```

Now clicking the projector dims the room, swings the camera, and
broadcasts your film onto the gallery screen. When it ends, the key
falls from the chandelier and the story begins.

## 4. The six coloured things (your actual portfolio)

Each entry in `items` is one popup. The shape is always the same:

```js
'work-1': {
  popup: 'paper',                       // 'paper' un-crumples; 'marble' builds like stone
  title: 'DayWheel',                    // headline of the popup
  subtitle: '2026 · design + code',     // small italic line
  body: 'Two or three sentences about the project…',
  link: 'https://…',                    // any URL, or '' for none
  linkLabel: 'Try it live',
},
```

Where each one lives in the room:

| key        | hides inside                        | the coloured part    |
|------------|-------------------------------------|----------------------|
| `work-1`   | The Starry Night (work wall)        | a teal star          |
| `work-2`   | The Great Wave (work wall)          | a pink sail          |
| `work-3`   | The Scream (work wall)              | a gold sun           |
| `food`     | Cézanne's apples (about wall)       | a red apple          |
| `fencing`  | the épée relic (about wall)         | the yellow épée      |
| `portrait` | Mona Lisa (artist wall)             | a pink question mark |
| `contact`  | Vermeer's letter reader (artist wall)| a red envelope      |
| `spotify`  | the record player (film wall)       | the orange label     |

Keep `link: 'SPOTIFY'` and `link: 'MAILTO'` where you see them — those
route to your `spotifyUrl` and `email` automatically.

## 5. The museum labels

`plaques` holds the little brass labels: `['Title line', 'subtitle line']`.
The famous decorative paintings label themselves automatically.

## 6. The story text

- `hints` — the riddles the room whispers (landing page, after the film,
  after the key, when the cat refuses). Keep them oblique.
- `secretNote` — the void: `watching` is the quote, `watchingBy` its
  attribution, `lines` is your handwritten note, `beyondLabel` is the
  button ("open your eyes"). Set `planningDocUrl` to your process doc.
- `thankYou` — the letter under the cat's paw, the very last thing a
  visitor reads. `email` is appended automatically.

## 7. Adding more art or statues later

- **Painting**: drop a `.jpg` in `public/art/`, add one line to `CATALOG`
  in `src/art.js` (id, file, aspect = width÷height, title, artist), then
  hang it in `src/three/Scene.jsx` with
  `<Artwork art="yourid" pos={[x, y]} w={2} P={P} />`.
- **Statue**: get a `.glb` (or convert an `.stl` with
  `models-src/stl/decimate.py in.stl out.glb 60000`), optimize it:
  `npx @gltf-transform/cli optimize in.glb public/models/out.glb --compress meshopt`,
  then place it with `<GlbStatue url={`${MODELS}out.glb`} … />`.

## 8. Publish

```bash
git add -A && git commit -m "fill in my details"
git push                                  # updates GitHub
npx vercel deploy --prod                  # updates the live site
```
