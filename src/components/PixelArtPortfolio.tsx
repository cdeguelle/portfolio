import { useRef, useEffect, useState } from "react"
import type { ReactNode } from "react"

// ── Imports sprites ───────────────────────────────────────────────────────────
// Bâtiments interactifs
import houseBlue6Img        from "../assets/pixelart/houses/house_blue6.png"
import forgeHouseImg        from "../assets/pixelart/forge with anim/blacksmith_forge_house.png"
import forgeFrame1Img       from "../assets/pixelart/forge with anim/forge_frame1.png"
import forgeFrame2Img       from "../assets/pixelart/forge with anim/forge_frame2.png"
import forgeFrame3Img       from "../assets/pixelart/forge with anim/forge_frame3.png"
import forgeFrame4Img       from "../assets/pixelart/forge with anim/forge_frame4.png"
import forgeFrame5Img       from "../assets/pixelart/forge with anim/forge_frame5.png"
import farmerMarketImg      from "../assets/pixelart/market/farmer_market.png"
import tavernHouseImg       from "../assets/pixelart/tavern/tavern_house.png"
import barnHouseImg         from "../assets/pixelart/barn/barn_house.png"
// Maisons décoratives
import houseBlue1Img        from "../assets/pixelart/houses/house_blue1.png"
import houseRed1Img         from "../assets/pixelart/houses/house_red1.png"
import houseBlack1Img       from "../assets/pixelart/houses/house_black1.png"
import houseRed3Img         from "../assets/pixelart/houses/house_red3.png"
// Props
import crossGardenImg       from "../assets/pixelart/tiles and exterior items/cross_garden.png"
import twinStreetlampImg    from "../assets/pixelart/tiles and exterior items/twin_streetlamp.png"
import well1Img             from "../assets/pixelart/tiles and exterior items/well1.png"
import benchHImg            from "../assets/pixelart/tiles and exterior items/wooden_bench_horizontal.png"
import vegMarketImg         from "../assets/pixelart/market/vegetable_market.png"
import vegMarket2Img        from "../assets/pixelart/market/vegetable_market2.png"
import flowerStoneBoxImg    from "../assets/pixelart/tiles and exterior items/flower_stone_box.png"
import barrelOpenFullImg    from "../assets/pixelart/tiles and exterior items/wooden_barrel_open_full.png"
import barnHay1Img          from "../assets/pixelart/barn/barn_hay1.png"
import barnHay2Img          from "../assets/pixelart/barn/barn_hay2.png"
import barnTroughImg        from "../assets/pixelart/barn/barn_watering-trough.png"

// ── Contenu des modals ────────────────────────────────────────────────────────
import { AboutContent }    from "./portfolio/windows/AboutContent"
import { ProjectsContent } from "./portfolio/windows/ProjectsContent"
import { ContactContent }  from "./portfolio/windows/ContactContent"
import { CvContent }       from "./portfolio/windows/CvContent"
import { MusicContent }    from "./portfolio/windows/MusicContent"

// ── Constantes ────────────────────────────────────────────────────────────────
const TILE   = 32
const COLS   = 40
const ROWS   = 30
const W      = COLS * TILE   // 1280 px
const H      = ROWS * TILE   // 960 px
const SC     = 2             // échelle globale des sprites
const SPEED  = 2.5
const PXFONT = '"Press Start 2P", monospace'
const PHW    = 7             // demi-largeur hitbox joueur
const PHH    = 8             // demi-hauteur hitbox joueur

// ── Types ─────────────────────────────────────────────────────────────────────
type Sprite = HTMLImageElement | HTMLCanvasElement

/** Bâtiment interactif (ouvre un modal) */
interface Bld {
  id:      string
  label:   string
  color:   string
  img:     string   // clé dans SPRITES
  scale:   number
  wx:      number   // position monde (px) coin haut-gauche du sprite
  wy:      number
  doorX:   number   // point de proximité (centre de la porte)
  doorY:   number
  colFrac: number   // fraction de hauteur du sprite utilisée pour la collision
}

/** Bâtiment décoratif (pas d'interaction) */
interface Dec  { img: string; wx: number; wy: number; scale?: number }

/** Prop décoratif (petit objet) */
interface Prop { img: string; wx: number; wy: number; scale?: number }

// ── Bâtiments interactifs ─────────────────────────────────────────────────────
// Dimensions finales au scale 2 :
//   house_blue6           102×117 → 204×234
//   blacksmith_forge_house 140×105 → 280×210
//   farmer_market          58×55  → 116×110
//   tavern_house          179×112 → 358×224
//   barn_house             80×115 → 160×230
const BLDS: Bld[] = [
  { id:"about",    label:"About",    color:"#5b9bd5", img:"house_blue6",           scale:SC, wx:50,  wy:35,  doorX:152,  doorY:269, colFrac:0.9 },
  { id:"projects", label:"Projects", color:"#d9614a", img:"blacksmith_forge_house", scale:SC, wx:880, wy:35,  doorX:1020, doorY:245, colFrac:0.9 },
  { id:"contact",  label:"Contact",  color:"#e6a023", img:"farmer_market",          scale:SC, wx:582, wy:336, doorX:640,  doorY:446, colFrac:0.7 },
  { id:"music",    label:"Music",    color:"#9b6bd9", img:"tavern_house",           scale:SC, wx:35,  wy:620, doorX:214,  doorY:844, colFrac:0.9 },
  { id:"cv",       label:"CV",       color:"#5abd7a", img:"barn_house",             scale:SC, wx:1060,wy:590, doorX:1140, doorY:820, colFrac:0.9 },
]

// ── Bâtiments décoratifs ──────────────────────────────────────────────────────
// Dimensions au scale 2 :
//   house_blue1   101×77  → 202×154   (wx=310–512, wy=60–214)
//   house_red1    102×76  → 204×152   (wx=660–864, wy=60–212)
//   house_black1  102×77  → 204×154   (wx=440–644, wy=615–769)
//   house_red3    127×109 → 254×218   (wx=730–984, wy=585–803)
const DECS: Dec[] = [
  { img:"house_blue1",  wx:310, wy:60  },
  { img:"house_red1",   wx:660, wy:60  },
  { img:"house_black1", wx:440, wy:615 },
  { img:"house_red3",   wx:730, wy:585 },
]

// ── Props décoratifs ──────────────────────────────────────────────────────────
const PROPS: Prop[] = [
  // Arbres — corners & encadrement
  { img:"cross_garden", wx:516,  wy:55,  scale:1.5 }, // entre les maisons du haut
  { img:"cross_garden", wx:0,    wy:400, scale:1.5 }, // bord gauche
  { img:"cross_garden", wx:1160, wy:400, scale:1.5 }, // bord droit
  { img:"cross_garden", wx:240,  wy:400, scale:1.2 }, // gauche de la place
  { img:"cross_garden", wx:885,  wy:400, scale:1.2 }, // droite de la place
  { img:"cross_garden", wx:540,  wy:820, scale:1.5 }, // bas-centre

  // Réverbères le long de la route
  { img:"twin_streetlamp", wx:148,  wy:380 },
  { img:"twin_streetlamp", wx:476,  wy:380 },
  { img:"twin_streetlamp", wx:750,  wy:380 },
  { img:"twin_streetlamp", wx:1078, wy:380 },
  { img:"twin_streetlamp", wx:148,  wy:512 },
  { img:"twin_streetlamp", wx:1078, wy:512 },

  // Place du village — puits et bancs
  { img:"well1",   wx:608, wy:265 },
  { img:"bench_h", wx:530, wy:290 },
  { img:"bench_h", wx:690, wy:290 },

  // Étals flanquant le Contact
  { img:"vegetable_market",  wx:460, wy:332 },
  { img:"vegetable_market2", wx:706, wy:332 },

  // Déco près de l'About
  { img:"flower_stone_box", wx:50, wy:272 },

  // Barils près de la forge
  { img:"barrel_open_full", wx:1040, wy:248 },
  { img:"barrel_open_full", wx:1072, wy:256 },

  // Cour de la grange
  { img:"barn_hay1",  wx:1000, wy:790 },
  { img:"barn_hay2",  wx:998,  wy:804 },
  { img:"barn_trough", wx:958, wy:808 },

  // Barils près de la taverne
  { img:"barrel_open_full", wx:400, wy:792 },
  { img:"barrel_open_full", wx:430, wy:802 },
]

// ── Contenu des modals ────────────────────────────────────────────────────────
const CONTENT: Record<string, { title: string; node: ReactNode }> = {
  about:    { title:"About",    node:<AboutContent /> },
  projects: { title:"Projects", node:<ProjectsContent /> },
  contact:  { title:"Contact",  node:<ContactContent /> },
  music:    { title:"Music",    node:<MusicContent /> },
  cv:       { title:"CV 2026",  node:<CvContent /> },
}

// ── Sources sprites ───────────────────────────────────────────────────────────
const SPRITE_SRCS: Record<string, string> = {
  house_blue6:           houseBlue6Img,
  blacksmith_forge_house: forgeHouseImg,
  forge_frame1:          forgeFrame1Img,
  forge_frame2:          forgeFrame2Img,
  forge_frame3:          forgeFrame3Img,
  forge_frame4:          forgeFrame4Img,
  forge_frame5:          forgeFrame5Img,
  farmer_market:         farmerMarketImg,
  tavern_house:          tavernHouseImg,
  barn_house:            barnHouseImg,
  house_blue1:           houseBlue1Img,
  house_red1:            houseRed1Img,
  house_black1:          houseBlack1Img,
  house_red3:            houseRed3Img,
  cross_garden:          crossGardenImg,
  twin_streetlamp:       twinStreetlampImg,
  well1:                 well1Img,
  bench_h:               benchHImg,
  vegetable_market:      vegMarketImg,
  vegetable_market2:     vegMarket2Img,
  flower_stone_box:      flowerStoneBoxImg,
  barrel_open_full:      barrelOpenFullImg,
  barn_hay1:             barnHay1Img,
  barn_hay2:             barnHay2Img,
  barn_trough:           barnTroughImg,
}

// ── Chargement sprites ────────────────────────────────────────────────────────
function loadSprites(): Promise<Record<string, Sprite>> {
  return new Promise(resolve => {
    const result: Record<string, Sprite> = {}
    const keys = Object.keys(SPRITE_SRCS)
    let n = 0
    for (const key of keys) {
      const img = new Image()
      img.src = SPRITE_SRCS[key]
      img.onload = () => {
        result[key] = img
        if (++n === keys.length) resolve(result)
      }
      img.onerror = () => { if (++n === keys.length) resolve(result) }
    }
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sw(s: Sprite) { return s instanceof HTMLCanvasElement ? s.width  : s.naturalWidth  }
function sh(s: Sprite) { return s instanceof HTMLCanvasElement ? s.height : s.naturalHeight }

function blit(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number, w: number, h: number) {
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(s as CanvasImageSource, Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

// ── Collision / proximité ─────────────────────────────────────────────────────
function isBlocked(px: number, py: number, imgs: Record<string, Sprite>): boolean {
  const corners = [
    [px - PHW, py - PHH], [px + PHW, py - PHH],
    [px - PHW, py + PHH], [px + PHW, py + PHH],
  ]
  for (const b of BLDS) {
    const img = imgs[b.img]; if (!img) continue
    const bw = sw(img) * b.scale
    const bh = sh(img) * b.scale * b.colFrac
    for (const [cx, cy] of corners)
      if (cx >= b.wx && cx <= b.wx + bw && cy >= b.wy && cy <= b.wy + bh) return true
  }
  return false
}

function nearBuilding(px: number, py: number): string | null {
  const DIST = TILE * 2.5
  for (const b of BLDS)
    if (Math.abs(px - b.doorX) < DIST && Math.abs(py - b.doorY) < DIST) return b.id
  return null
}

// ── Render ────────────────────────────────────────────────────────────────────
function drawGrass(ctx: CanvasRenderingContext2D, vw: number, vh: number, camX: number, camY: number) {
  const c0 = Math.floor(camX / TILE), r0 = Math.floor(camY / TILE)
  const c1 = Math.min(COLS - 1, c0 + Math.ceil(vw / TILE) + 1)
  const r1 = Math.min(ROWS - 1, r0 + Math.ceil(vh / TILE) + 1)
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      ctx.fillStyle = (c + r) % 2 === 0 ? "#4a8a2e" : "#427a28"
      ctx.fillRect(c * TILE - camX, r * TILE - camY, TILE, TILE)
    }
}

function drawRoads(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
  // Place du village (dallage clair)
  ctx.fillStyle = "#b0a478"
  ctx.fillRect(520 - camX, 270 - camY, 240, 178)

  // Route horizontale principale
  ctx.fillStyle = "#9b8b6a"
  ctx.fillRect(0 - camX, 448 - camY, W, 64)

  // Ombres légères (bas des routes)
  ctx.fillStyle = "#7a6a50"
  ctx.fillRect(0 - camX, 510 - camY, W, 2)
  ctx.fillRect(0 - camX, 448 - camY, W, 2)
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, dir: number,
  camX: number, camY: number,
) {
  const x = Math.round(px - camX)
  const y = Math.round(py - camY)

  ctx.fillStyle = "rgba(0,0,0,0.22)"
  ctx.beginPath(); ctx.ellipse(x, y + 2, 8, 4, 0, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = "#3a6abf"
  ctx.fillRect(x - 7, y - 14, 14, 12)

  ctx.fillStyle = "#f0c090"
  if (dir === 3) ctx.fillRect(x - 11, y - 13, 4, 9)
  if (dir === 1) ctx.fillRect(x + 7,  y - 13, 4, 9)

  if (dir !== 0) {
    ctx.fillStyle = "#2a2a2a"
    ctx.fillRect(x - 7, y - 2, 5, 4)
    ctx.fillRect(x + 2, y - 2, 5, 4)
  }

  ctx.fillStyle = "#f0c090"
  ctx.fillRect(x - 6, y - 25, 12, 11)

  ctx.fillStyle = "#5a3010"
  ctx.fillRect(x - 6, y - 25, 12, 4)
  if (dir === 0) ctx.fillRect(x - 6, y - 16, 12, 4)

  ctx.fillStyle = "#1a1a1a"
  if (dir === 2) { ctx.fillRect(x - 3, y - 17, 2, 2); ctx.fillRect(x + 1, y - 17, 2, 2) }
  if (dir === 3)   ctx.fillRect(x - 4, y - 17, 2, 2)
  if (dir === 1)   ctx.fillRect(x + 2, y - 17, 2, 2)
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function PixelArtPortfolio() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imgsRef    = useRef<Record<string, Sprite>>({})
  const nearIdRef  = useRef<string | null>(null)
  const [ready,    setReady]    = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [nearId,   setNearId]   = useState<string | null>(null)
  const activeRef  = useRef<string | null>(null)
  activeRef.current = activeId

  useEffect(() => {
    loadSprites().then(imgs => { imgsRef.current = imgs; setReady(true) })
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d")!

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const gs = {
      px: W / 2, py: H / 2, dir: 2,
      keys: new Set<string>(),
      forgeFrame: 0, forgeTick: 0,
      raf: 0,
    }

    const tick = () => {
      const vw = canvas.width, vh = canvas.height
      const imgs = imgsRef.current

      // ── Mouvement joueur ──────────────────────────────────────────────
      if (!activeRef.current) {
        let nx = gs.px, ny = gs.py
        if (gs.keys.has("ArrowUp")    || gs.keys.has("w") || gs.keys.has("z")) { ny -= SPEED; gs.dir = 0 }
        if (gs.keys.has("ArrowRight") || gs.keys.has("d"))                      { nx += SPEED; gs.dir = 1 }
        if (gs.keys.has("ArrowDown")  || gs.keys.has("s"))                      { ny += SPEED; gs.dir = 2 }
        if (gs.keys.has("ArrowLeft")  || gs.keys.has("q") || gs.keys.has("a")) { nx -= SPEED; gs.dir = 3 }

        nx = Math.max(PHW, Math.min(W - PHW, nx))
        ny = Math.max(PHH, Math.min(H - PHH, ny))
        if (!isBlocked(nx, gs.py, imgs)) gs.px = nx
        if (!isBlocked(gs.px, ny, imgs)) gs.py = ny

        const nid = nearBuilding(gs.px, gs.py)
        if (nid !== nearIdRef.current) { nearIdRef.current = nid; setNearId(nid) }
      }

      // ── Caméra ───────────────────────────────────────────────────────
      const camX = Math.max(0, Math.min(W - vw, gs.px - vw / 2))
      const camY = Math.max(0, Math.min(H - vh, gs.py - vh / 2))

      // ── Fond ─────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, vw, vh)
      drawGrass(ctx, vw, vh, camX, camY)
      drawRoads(ctx, camX, camY)

      // ── Collecte des draw calls pour depth sort ───────────────────────
      type DI = { y: number; fn: () => void }
      const items: DI[] = []

      const push = (y: number, fn: () => void) => items.push({ y, fn })

      // Bâtiments décoratifs
      for (const d of DECS) {
        const img = imgs[d.img]; if (!img) continue
        const s   = d.scale ?? SC
        const dw  = sw(img) * s
        const dh  = sh(img) * s
        const dx  = d.wx - camX, dy = d.wy - camY
        push(d.wy + dh, () => blit(ctx, img, dx, dy, dw, dh))
      }

      // Bâtiments interactifs
      for (const b of BLDS) {
        const img = imgs[b.img]; if (!img) continue
        const bw  = sw(img) * b.scale
        const bh  = sh(img) * b.scale
        const bx  = b.wx - camX, by = b.wy - camY
        const near = !activeRef.current && b.id === nearIdRef.current

        push(b.wy + bh, () => {
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(img as CanvasImageSource, Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh))

          if (near) {
            ctx.save()
            ctx.shadowColor = b.color; ctx.shadowBlur = 16
            ctx.strokeStyle = b.color; ctx.lineWidth = 2
            ctx.strokeRect(bx, by, bw, bh)
            ctx.restore()
          }

          // Label
          ctx.textAlign = "center"
          ctx.font = `8px ${PXFONT}`
          const lx = b.wx + bw / 2 - camX
          const ly = b.wy - 12 - camY
          ctx.fillStyle = "rgba(0,0,0,0.65)"; ctx.fillText(b.label, lx + 1, ly + 1)
          ctx.fillStyle = b.color;            ctx.fillText(b.label, lx, ly)
        })
      }

      // Animation forge (marteau animé, devant la forge)
      gs.forgeTick++
      if (gs.forgeTick >= 8) { gs.forgeTick = 0; gs.forgeFrame = (gs.forgeFrame + 1) % 5 }
      const fimg = imgs[`forge_frame${gs.forgeFrame + 1}`]
      if (fimg) {
        const fw = sw(fimg) * SC, fh = sh(fimg) * SC
        // Positionné au bas-gauche de la forge (devant l'enclume)
        const fx = 880 + 20 - camX
        const fy = 35 + 210 - fh - camY
        push(35 + 210, () => blit(ctx, fimg, fx, fy, fw, fh))
      }

      // Props
      for (const p of PROPS) {
        const img = imgs[p.img]; if (!img) continue
        const s  = p.scale ?? SC
        const pw = sw(img) * s
        const ph = sh(img) * s
        const px = p.wx - camX, py = p.wy - camY
        push(p.wy + ph, () => blit(ctx, img, px, py, pw, ph))
      }

      // Joueur
      push(gs.py + PHH, () => drawPlayer(ctx, gs.px, gs.py, gs.dir, camX, camY))

      // ── Tri par profondeur et rendu ───────────────────────────────────
      items.sort((a, b) => a.y - b.y)
      for (const item of items) item.fn()

      gs.raf = requestAnimationFrame(tick)
    }

    const onDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault()
      gs.keys.add(e.key)
      if (e.key === "Escape") { setActiveId(null); return }
      if ((e.key === "Enter" || e.key === " ") && !activeRef.current) {
        const nid = nearBuilding(gs.px, gs.py)
        if (nid) setActiveId(nid)
      }
    }
    const onUp = (e: KeyboardEvent) => gs.keys.delete(e.key)

    gs.raf = requestAnimationFrame(tick)
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup",   onUp)

    return () => {
      cancelAnimationFrame(gs.raf)
      window.removeEventListener("resize",  resize)
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup",   onUp)
    }
  }, [ready])

  const content = activeId ? CONTENT[activeId] : null
  const bld     = activeId ? BLDS.find(b => b.id === activeId) : null
  const nearBld = nearId   ? BLDS.find(b => b.id === nearId)   : null

  if (!ready) return (
    <div style={{ width:"100vw", height:"100vh", background:"#0a1a0a", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontFamily:PXFONT, fontSize:10, color:"#4a8a2e" }}>Chargement…</span>
    </div>
  )

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"relative", background:"#000" }}>
      <canvas ref={canvasRef} style={{ display:"block", imageRendering:"pixelated" }} />

      {/* Prompt de proximité */}
      {nearId && !activeId && (
        <div style={{
          position:"fixed", bottom:40, left:"50%", transform:"translateX(-50%)",
          background:"#0a0a1aee", border:`2px solid ${nearBld?.color}`,
          padding:"8px 16px", fontFamily:PXFONT, fontSize:8,
          color:nearBld?.color,
          boxShadow:`0 0 12px ${nearBld?.color}55`,
          whiteSpace:"nowrap",
        }}>
          ↵ Entrée → {nearBld?.label}
        </div>
      )}

      {/* Aide navigation */}
      {!nearId && !activeId && (
        <div style={{
          position:"fixed", bottom:16, left:"50%", transform:"translateX(-50%)",
          fontFamily:PXFONT, fontSize:6, color:"#ffffff44",
          whiteSpace:"nowrap", pointerEvents:"none",
        }}>
          ↑ ↓ ← →  ·  ZQSD / WASD  ·  Entrée pour interagir
        </div>
      )}

      {/* Modal de contenu */}
      {content && (
        <div
          onClick={() => setActiveId(null)}
          style={{ position:"fixed", inset:0, background:"#000000bb", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:"#0f0f1e", border:`2px solid ${bld?.color ?? "#fff"}`,
              boxShadow:`0 0 32px ${bld?.color ?? "#fff"}44`,
              width:"min(720px, 95vw)", maxHeight:"85vh",
              display:"flex", flexDirection:"column", borderRadius:2, overflow:"hidden",
            }}
          >
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom:`1px solid ${bld?.color ?? "#fff"}33`, background:"#0a0a18" }}>
              <span style={{ fontFamily:PXFONT, fontSize:10, color:bld?.color ?? "#fff" }}>{content.title}</span>
              <button onClick={() => setActiveId(null)} style={{ background:"none", border:"none", color:"#ffffff88", cursor:"pointer", fontFamily:PXFONT, fontSize:10 }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", flex:1, color:"#c0c0c0", fontSize:11, fontFamily:'"MS Sans Serif", Tahoma, sans-serif' }}>
              {content.node}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
