import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useStore } from '../store.js'
import { BEIGE, BEYOND, ACCENTS } from '../palette.js'
import { Room, Bench, H } from './Room.jsx'
import { Artwork, GlbPainting, VinylPlayer, Projector, Screen } from './exhibits.jsx'
import { GlbStatue, EpeeRelic } from './statues.jsx'
import { FallingKey, CatSecret, CatAndMail } from './story.jsx'

const MODELS = import.meta.env.BASE_URL + 'models/'
import { Dust } from './Dust.jsx'
import { CameraRig } from './CameraRig.jsx'

// A wall's local coordinate frame. Wall 0 faces north, then E, S, W.
function WallGroup({ j, children }) {
  return <group rotation-y={-j * Math.PI * 0.5}>{children}</group>
}

export function Scene() {
  const beyond = useStore((s) => s.beyond)
  const P = beyond ? BEYOND : BEIGE

  // key={P.name} remounts the whole room when the world changes.
  return (
    <group key={P.name}>
      <CameraRig />
      <Room P={P} />
      <Dust color={beyond ? '#ffffff' : '#fff6dd'} />

      {/* ---- Wall 0 · WORK ------------------------------------ */}
      {/* your projects hide inside van Gogh, Hokusai and Munch */}
      <WallGroup j={0}>
        <Artwork id="work-1" art="starry" pos={[-3.1, -3.7]} w={2.6} seed={11} P={P} plaque
          icon={{ name: 'star', accent: ACCENTS.teal, fx: 0.72, fy: 0.17, fs: 13 }} />
        <Artwork id="work-2" art="wave" pos={[0, -3.9]} w={2.8} seed={12} P={P} plaque
          icon={{ name: 'sail', accent: ACCENTS.pink, fx: 0.525, fy: 0.56, fs: 10 }} />
        <Artwork id="work-3" art="scream" pos={[3.1, -3.7]} w={2.0} seed={13} P={P} plaque
          icon={{ name: 'sun', accent: ACCENTS.gold, fx: 0.72, fy: 0.08, fs: 11.5 }} />
        <Artwork art="jatte" pos={[0, -0.85]} w={3.4} P={P} />
        <Artwork art="vgself" pos={[-2.9, -0.75]} w={1.5} P={P} />
        <Artwork art="pearl" pos={[2.9, -0.75]} w={1.6} P={P} />
        <Artwork art="sunflowers" pos={[-5.75, -3.7]} w={1.4} P={P} />
        <Artwork art="almond" pos={[-5.4, -0.5]} w={1.9} P={P} />
        <Artwork art="temeraire" pos={[5.4, -0.5]} w={1.9} P={P} />
        <Artwork art="nightwatch" pos={[0, 2.0]} w={3.0} P={P} />
        <GlbPainting url={`${MODELS}flowers-painting.glb`} pos={[5.4, -3.7]} height={2.0} P={P} />
        <group position={[0, -H, -H + 3.4]}>
          <Bench P={P} />
        </group>
        {/* Michelangelo's David, decimated from the real scan (Z-up STL) */}
        <GlbStatue url={`${MODELS}david.glb`} pos={[-5.2, 0]} rot={0.5} height={2.5}
          preRotate={[-Math.PI / 2, 0, 0]}
          pedestal={{ w: 1.3, h: 0.9 }} title="David" sub="after Michelangelo" P={P} />
      </WallGroup>

      {/* ---- Wall 1 · ABOUT ----------------------------------- */}
      <WallGroup j={1}>
        <Artwork id="food" art="apples" pos={[-3.5, -3.9]} w={2.4} seed={7} P={P} plaque
          icon={{ name: 'apple', accent: ACCENTS.red, fx: 0.42, fy: 0.55, fs: 13 }} />
        <Artwork art="swing" pos={[-1.05, -3.7]} w={1.5} P={P} />
        <Artwork art="gothic" pos={[-0.6, -0.7]} w={1.6} P={P} />
        <Artwork art="venus" pos={[2.9, -0.5]} w={3.2} P={P} />
        <Artwork art="napoleon" pos={[-5.95, -3.5]} w={1.3} P={P} />
        <Artwork art="poppies" pos={[-3.5, -0.8]} w={2.0} P={P} />
        <Artwork art="cafeterrace" pos={[5.7, -3.6]} w={1.5} P={P} />
        <Artwork art="delft" pos={[-0.9, 1.8]} w={2.6} P={P} />
        {/* the relic: your épée, the one coloured thing on a pedestal */}
        <EpeeRelic pos={[2.4, 0]} accent={ACCENTS.yellow} P={P} />
        {/* the Caracalla bust keeps an eye on the corner */}
        <GlbStatue url={`${MODELS}caracalla.glb`} pos={[5.6, 0]} rot={-0.4} height={1.15}
          pedestal={{ w: 0.95, h: 1.5 }} title="Caracalla" sub="Roman, c. 212 AD" P={P} />
        {beyond && <CatAndMail P={P} />}
      </WallGroup>

      {/* ---- Wall 2 · THE FILM -------------------------------- */}
      <WallGroup j={2}>
        <Screen P={P} />
        <Projector pos={[1.9, 0]} accent={ACCENTS.yellow} P={P} />
        <VinylPlayer pos={[-4.8, 0]} accent={ACCENTS.orange} P={P} />
        <Artwork art="wanderer" pos={[-4.15, -2.9]} w={1.8} P={P} />
        <Artwork art="kiss" pos={[4.3, -2.9]} w={2.0} P={P} />
        <Artwork art="whistler" pos={[0, 0.5]} w={2.4} P={P} />
        <Artwork art="sunrise" pos={[-6.55, -3.4]} w={1.1} P={P} />
        <GlbPainting url={`${MODELS}ship-painting.glb`} pos={[-4.3, 0.6]} height={1.8} P={P} />
        <GlbPainting url={`${MODELS}landscape-painting.glb`} pos={[4.3, 0.6]} height={1.8} P={P} />
        {/* the sleeping guard and what it guards */}
        {!beyond && <CatSecret P={P} />}
      </WallGroup>

      {/* ---- Wall 3 · THE ARTIST ------------------------------ */}
      <WallGroup j={3}>
        <Artwork id="portrait" art="mona" pos={[-2.5, -3.4]} w={2.0} seed={5} P={P} plaque
          icon={{ name: 'question', accent: ACCENTS.pink, fx: 0.26, fy: 0.32, fs: 10 }} />
        <Artwork id="contact" art="letter" pos={[2.7, -3.6]} w={1.7} seed={17} P={P} plaque
          icon={{ name: 'envelope', accent: ACCENTS.red, fx: 0.33, fy: 0.78, fs: 9.5 }} />
        <Artwork art="lilies" pos={[0.1, -0.5]} w={2.2} P={P} />
        <GlbPainting url={`${MODELS}milkmaid-painting.glb`} pos={[4.9, -1.0]} height={1.8} P={P} />
        {/* real scanned sculptures, recast in faceted marble */}
        <GlbStatue url={`${MODELS}female-statue.glb`} pos={[0.1, 0]} rot={0.4} height={2.0}
          pedestal={{ w: 1.3, h: 0.7 }} title="Winged Victory" sub="after Samothrace" P={P} />
        <GlbStatue url={`${MODELS}thinker.glb`} pos={[3.6, 0]} rot={-0.5} height={1.7}
          preRotate={[-Math.PI / 2, 0, 0]}
          pedestal={{ w: 1.2, h: 0.95 }} title="The Thinker" sub="after Rodin" P={P} />
      </WallGroup>

      {/* ---- The story objects -------------------------------- */}
      {!beyond && <FallingKey />}

      {/* ---- Old-film post-processing -------------------------- */}
      <EffectComposer>
        <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={P.grain} />
        <Vignette eskil={false} offset={0.28} darkness={beyond ? 0.45 : 0.72} />
      </EffectComposer>
    </group>
  )
}
