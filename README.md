# A Colourless Room

An explorable portfolio: you stand inside a beige, old-film cube gallery.
Arrow keys turn you from corner to corner; the only colour in the room
belongs to the things that are about you. There is a film, a key, a door
in the floor that should not exist, and a room that comes back in colour
if you go beyond.

## Run it

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # production build in /dist
npm run preview    # serve the production build locally
```

Visit with `?reset` in the URL (e.g. `localhost:5173/?reset`) to undo
"take me beyond" and replay the story.

## Fill in your content

Almost everything you'll want to change lives in **`src/content.js`** —
every placeholder is marked `FILL ME`:

- your name, tagline, email
- the Spotify playlist link, the planning-doc link
- the text behind every painting and statue
- the handwritten note in the void, and the thank-you letter
- `introVideoSrc`: drop your intro video (e.g. `intro.mp4`) into
  `/public` and set this to `'/intro.mp4'`. Until then, the projector
  shows a placeholder with a "the film ends" button so you can still
  play the whole story.

The little museum plaques are in the same file, under `plaques`.

## The story, for testing

1. Enter → wander with ← → ↑ ↓, click coloured things.
2. Face **the film** wall, click the projector, finish the film.
3. A key drops from the chandelier. Press ↓ to look at the floor, click it.
4. A trapdoor appears in the floor. Click it → the void.
5. "take me beyond" → the room reloads in Monument Valley colour,
   the door is gone, and a sleeping cat guards one envelope.

## The tech, and why (your learning map)

| Piece | What it does here | Where to look |
|---|---|---|
| **Vite** | dev server + bundler; instant reloads | `vite.config.js` |
| **React** | UI state → what's on screen (popups, HUD, title) | `src/ui/`, `src/App.jsx` |
| **Three.js** | the 3D room itself: geometry, materials, lights | `src/three/` |
| **@react-three/fiber** | lets you write Three.js scenes as React components (`<mesh>`, `<spotLight>`) | every file in `src/three/` |
| **zustand** | one tiny shared store for the story state (which corner, has the key, went beyond) | `src/store.js` |
| **@react-three/postprocessing** | the old-film feel: grain + vignette | `src/three/Scene.jsx` |
| **Canvas 2D → textures** | every painting is a *procedural artwork* (sepia landscapes, still lifes, nocturnes, portraits) drawn by code; the one coloured Style-D element inside it is the only clickable part | `src/sketch.js` |
| **WebAudio API** | every sound is synthesized, and everything runs through a generated grand-hall reverb; Gymnopédie No. 1 plays as soft synthesized piano (drop a real recording in /public and set `musicSrc` to swap it) | `src/audio.js` |
| **Composed 3D figures** | the museum statues (bust, seated muse, standing antique, the fencer) are built from lathes, capsules and spheres with flat shading — "poly realism" without any downloaded models | `src/three/statues.jsx` |
| **GLSL shaders** | the drifting dust motes are a hand-written vertex + fragment shader | `src/three/Dust.jsx` |
| **Physics (hand-rolled)** | paintings swing on a damped pendulum when hovered; the key falls with gravity and bounces | `src/three/hooks.js`, `src/three/story.jsx` |

### How the room works

- The room is the inside of a 12-unit cube (`src/three/Room.jsx`). The
  camera never moves — it stands at the centre and *rotates* toward a
  corner, so you always see two walls at once, and glimpse the others
  mid-turn (`src/three/CameraRig.jsx`).
- Each wall is a rotated group; exhibits are placed in wall-local
  coordinates in `src/three/Scene.jsx`. That file is the floor plan.
- The two palettes (beige film world / Monument Valley warmth) live in
  `src/palette.js`. `Scene.jsx` remounts the whole room when `beyond`
  flips — that's the "it reloads everything" beat.

### Where to grow it next

- **Real models**: learn Blender basics, export `.glb`, load with
  `useGLTF` from `@react-three/drei` — replace the lathe-turned statue
  with a sculpted one.
- **Real physics**: swap the hand-rolled gravity for `@react-three/rapier`
  when you want tumbling, colliding objects.
- **Real sound**: record paper/marble foley and load with `howler` or
  drei's `PositionalAudio` so sound comes *from* the objects.
- **More shaders**: Bruno Simon's "Three.js Journey" course is the
  canonical path for exactly this kind of portfolio.
