import { useState, useRef, useEffect, useCallback } from "react"

// ── Sprites ───────────────────────────────────────────────────────────────────
import houseBlueImg from "../assets/pixelart/sprites/house_blue.png"
import forgeImg from "../assets/pixelart/sprites/forge.png"
import tavernImg from "../assets/pixelart/sprites/tavern.png"
import barnImg from "../assets/pixelart/sprites/barn.png"
import marketStallImg from "../assets/pixelart/sprites/market_stall.png"
import treeImg from "../assets/pixelart/sprites/tree.png"
import flowersImg from "../assets/pixelart/sprites/flowers.png"
import benchImg from "../assets/pixelart/sprites/bench.png"

// ── Content panels ────────────────────────────────────────────────────────────
import { AboutContent } from "./portfolio/windows/AboutContent"
import { ProjectsContent } from "./portfolio/windows/ProjectsContent"
import { ContactContent } from "./portfolio/windows/ContactContent"
import { CvContent } from "./portfolio/windows/CvContent"
import { MusicContent } from "./portfolio/windows/MusicContent"

// ── Constants ─────────────────────────────────────────────────────────────────
const PIXEL_FONT = '"Press Start 2P", monospace'
const WORLD_W = 3400   // total scrollable width in CSS px
const GROUND_RATIO = 0.68  // ground line at 68% of viewport height

// ── Buildings ─────────────────────────────────────────────────────────────────
interface Building {
	id: string
	src: string
	label: string
	x: number       // left edge in CSS px
	scale: number
	naturalW: number
	naturalH: number
	groundOffset: number  // fine-tune vertical alignment
	color: string   // label accent color
}

const BUILDINGS: Building[] = [
	{ id: "about",    src: houseBlueImg,  label: "About",    x: 160,  scale: 2.5, naturalW: 128, naturalH: 108, groundOffset: 0,   color: "#5b9bd5" },
	{ id: "projects", src: forgeImg,      label: "Projects", x: 680,  scale: 2.5, naturalW: 192, naturalH: 160, groundOffset: 0,   color: "#d9614a" },
	{ id: "music",    src: tavernImg,     label: "Music",    x: 1320, scale: 2.5, naturalW: 192, naturalH: 152, groundOffset: 0,   color: "#9b6bd9" },
	{ id: "cv",       src: barnImg,       label: "CV",       x: 1960, scale: 2.5, naturalW: 128, naturalH: 144, groundOffset: 0,   color: "#5abd7a" },
	{ id: "contact",  src: marketStallImg,label: "Contact",  x: 2580, scale: 2.5, naturalW: 68,  naturalH: 112, groundOffset: 16,  color: "#e6a023" },
]

// ── Decorations ───────────────────────────────────────────────────────────────
interface Deco {
	src: string
	x: number
	scale: number
	naturalW: number
	naturalH: number
	groundOffset: number
	zIndex?: number
}

const DECORATIONS: Deco[] = [
	{ src: treeImg,    x: 20,   scale: 2.2, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 510,  scale: 2.0, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 1100, scale: 2.4, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 1760, scale: 2.0, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 2380, scale: 2.3, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 2980, scale: 2.1, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: treeImg,    x: 3200, scale: 1.9, naturalW: 102, naturalH: 106, groundOffset: 10 },
	{ src: flowersImg, x: 130,  scale: 2.0, naturalW: 112, naturalH: 70,  groundOffset: 50 },
	{ src: flowersImg, x: 630,  scale: 2.0, naturalW: 112, naturalH: 70,  groundOffset: 50 },
	{ src: flowersImg, x: 1850, scale: 2.0, naturalW: 112, naturalH: 70,  groundOffset: 50 },
	{ src: benchImg,   x: 2520, scale: 2.2, naturalW: 72,  naturalH: 48,  groundOffset: 30 },
]

// ── Content map ───────────────────────────────────────────────────────────────
const CONTENT: Record<string, { title: string; component: React.ReactNode }> = {
	about:    { title: "About",    component: <AboutContent /> },
	projects: { title: "Projects", component: <ProjectsContent /> },
	music:    { title: "Music",    component: <MusicContent /> },
	cv:       { title: "CV 2026",  component: <CvContent /> },
	contact:  { title: "Contact",  component: <ContactContent /> },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSpriteStyle(
	item: { x: number; scale: number; naturalW: number; naturalH: number; groundOffset: number },
	groundY: number
): React.CSSProperties {
	const w = item.naturalW * item.scale
	const h = item.naturalH * item.scale
	return {
		position: "absolute",
		left: item.x,
		top: groundY - h + item.groundOffset,
		width: w,
		height: h,
		imageRendering: "pixelated",
		userSelect: "none",
		pointerEvents: "none",
	}
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PixelArtPortfolio() {
	const [camX, setCamX] = useState(0)
	const [activeId, setActiveId] = useState<string | null>(null)
	const [vh, setVh] = useState(window.innerHeight)
	const viewportRef = useRef<HTMLDivElement>(null)
	const drag = useRef({ active: false, startX: 0, startCam: 0, moved: 0 })

	const groundY = vh * GROUND_RATIO
	const maxCam = Math.max(0, WORLD_W - (viewportRef.current?.clientWidth ?? window.innerWidth))

	// Resize
	useEffect(() => {
		const onResize = () => setVh(window.innerHeight)
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	// Keyboard
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (activeId) {
				if (e.key === "Escape") setActiveId(null)
				return
			}
			const step = 300
			if (e.key === "ArrowRight") setCamX(c => Math.min(c + step, maxCam))
			if (e.key === "ArrowLeft")  setCamX(c => Math.max(c - step, 0))
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [activeId, maxCam])

	// Mouse drag
	const onMouseDown = useCallback((e: React.MouseEvent) => {
		drag.current = { active: true, startX: e.clientX, startCam: camX, moved: 0 }
	}, [camX])

	const onMouseMove = useCallback((e: React.MouseEvent) => {
		if (!drag.current.active) return
		const dx = e.clientX - drag.current.startX
		drag.current.moved = Math.abs(dx)
		const next = drag.current.startCam - dx
		setCamX(Math.max(0, Math.min(maxCam, next)))
	}, [maxCam])

	const onMouseUp = useCallback(() => { drag.current.active = false }, [])

	// Touch drag
	const onTouchStart = useCallback((e: React.TouchEvent) => {
		drag.current = { active: true, startX: e.touches[0].clientX, startCam: camX, moved: 0 }
	}, [camX])

	const onTouchMove = useCallback((e: React.TouchEvent) => {
		if (!drag.current.active) return
		const dx = e.touches[0].clientX - drag.current.startX
		drag.current.moved = Math.abs(dx)
		const next = drag.current.startCam - dx
		setCamX(Math.max(0, Math.min(maxCam, next)))
	}, [maxCam])

	const onTouchEnd = useCallback(() => { drag.current.active = false }, [])

	const handleBuildingClick = useCallback((id: string) => {
		if (drag.current.moved > 6) return
		setActiveId(id)
	}, [])

	const content = activeId ? CONTENT[activeId] : null

	return (
		<div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#1a1a2e" }}>

			{/* ── World ──────────────────────────────────────────────────────── */}
			<div
				ref={viewportRef}
				style={{ width: "100%", height: "100%", overflow: "hidden", cursor: drag.current.active ? "grabbing" : "grab" }}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseUp}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				<div style={{
					position: "relative",
					width: WORLD_W,
					height: "100%",
					transform: `translateX(-${camX}px)`,
					willChange: "transform",
				}}>
					{/* Sky gradient */}
					<div style={{
						position: "absolute", inset: 0,
						background: "linear-gradient(to bottom, #1a1a3e 0%, #2d4a7a 40%, #87CEEB 70%, #a8d8a8 100%)",
					}} />

					{/* Grass */}
					<div style={{
						position: "absolute", left: 0, right: 0,
						top: groundY - 20, bottom: 0,
						background: "linear-gradient(to bottom, #5a8a3a 0%, #4a7a2a 40%, #3d6622 100%)",
					}} />

					{/* Path (dirt strip) */}
					<div style={{
						position: "absolute", left: 0, right: 0,
						top: groundY + 20, height: 48,
						background: "linear-gradient(to bottom, #a07840 0%, #8b6530 100%)",
					}} />
					<div style={{
						position: "absolute", left: 0, right: 0,
						top: groundY + 18, height: 4,
						background: "#c8963c",
					}} />

					{/* ── Decorations (behind buildings) ── */}
					{DECORATIONS.map((d, i) => (
						<img
							key={i}
							src={d.src}
							draggable={false}
							style={getSpriteStyle(d, groundY)}
						/>
					))}

					{/* ── Buildings ── */}
					{BUILDINGS.map(b => {
						const w = b.naturalW * b.scale
						const h = b.naturalH * b.scale
						const top = groundY - h + b.groundOffset
						return (
							<div
								key={b.id}
								onClick={() => handleBuildingClick(b.id)}
								style={{
									position: "absolute",
									left: b.x,
									top,
									width: w,
									cursor: "pointer",
									userSelect: "none",
								}}
							>
								{/* Label */}
								<div style={{
									position: "absolute",
									top: -38,
									left: "50%",
									transform: "translateX(-50%)",
									background: "#0a0a1a",
									border: `2px solid ${b.color}`,
									padding: "4px 8px",
									fontFamily: PIXEL_FONT,
									fontSize: 8,
									color: b.color,
									whiteSpace: "nowrap",
									imageRendering: "pixelated",
									boxShadow: `0 0 8px ${b.color}44`,
								}}>
									{b.label}
								</div>
								{/* Sprite */}
								<img
									src={b.src}
									draggable={false}
									style={{
										width: w,
										height: h,
										imageRendering: "pixelated",
										display: "block",
										filter: activeId === b.id ? "brightness(1.3)" : "none",
										transition: "filter 0.15s",
									}}
								/>
							</div>
						)
					})}
				</div>
			</div>

			{/* ── HUD: nav hints ──────────────────────────────────────────────── */}
			<div style={{
				position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
				display: "flex", gap: 16, alignItems: "center",
				fontFamily: PIXEL_FONT, fontSize: 7, color: "#ffffff88",
				pointerEvents: "none",
			}}>
				<span>← → NAVIGATE</span>
				<span>·</span>
				<span>CLICK TO ENTER</span>
			</div>

			{/* ── Nav arrows ─────────────────────────────────────────────────── */}
			{camX > 0 && (
				<button
					onClick={() => setCamX(c => Math.max(0, c - 400))}
					style={navArrowStyle("left")}
				>◀</button>
			)}
			{camX < maxCam && (
				<button
					onClick={() => setCamX(c => Math.min(maxCam, c + 400))}
					style={navArrowStyle("right")}
				>▶</button>
			)}

			{/* ── Content overlay ─────────────────────────────────────────────── */}
			{content && (
				<div
					onClick={() => setActiveId(null)}
					style={{
						position: "fixed", inset: 0,
						background: "#000000cc",
						display: "flex", alignItems: "center", justifyContent: "center",
						zIndex: 100,
					}}
				>
					<div
						onClick={e => e.stopPropagation()}
						style={{
							background: "#0f0f1e",
							border: `2px solid ${BUILDINGS.find(b => b.id === activeId)?.color ?? "#fff"}`,
							boxShadow: `0 0 32px ${BUILDINGS.find(b => b.id === activeId)?.color ?? "#fff"}44`,
							width: "min(720px, 95vw)",
							maxHeight: "85vh",
							display: "flex",
							flexDirection: "column",
							borderRadius: 2,
							overflow: "hidden",
						}}
					>
						{/* Modal header */}
						<div style={{
							display: "flex", alignItems: "center", justifyContent: "space-between",
							padding: "10px 16px",
							borderBottom: `1px solid ${BUILDINGS.find(b => b.id === activeId)?.color ?? "#fff"}44`,
							background: "#0a0a18",
						}}>
							<span style={{
								fontFamily: PIXEL_FONT, fontSize: 10,
								color: BUILDINGS.find(b => b.id === activeId)?.color ?? "#fff",
							}}>
								{content.title}
							</span>
							<button
								onClick={() => setActiveId(null)}
								style={{
									background: "none", border: "none",
									color: "#ffffff88", cursor: "pointer",
									fontFamily: PIXEL_FONT, fontSize: 10,
								}}
							>✕</button>
						</div>

						{/* Content */}
						<div style={{
							overflowY: "auto", flex: 1,
							padding: 0,
							color: "#c0c0c0",
							fontSize: 11,
							fontFamily: '"MS Sans Serif", Tahoma, sans-serif',
						}}>
							{content.component}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

function navArrowStyle(side: "left" | "right"): React.CSSProperties {
	return {
		position: "fixed",
		top: "50%",
		[side]: 16,
		transform: "translateY(-50%)",
		background: "#0a0a1a99",
		border: "2px solid #ffffff44",
		color: "#ffffffcc",
		fontFamily: PIXEL_FONT,
		fontSize: 14,
		width: 40,
		height: 40,
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
	}
}
