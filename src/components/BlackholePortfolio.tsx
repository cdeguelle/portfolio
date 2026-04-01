import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js"
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js"
import fragmentShaderSrc from "../lib/blackhole/fragmentShader.glsl?raw"
import milkywayUrl from "../assets/blackhole/milkyway.jpg"
import starUrl from "../assets/blackhole/star_noise.png"
import diskUrl from "../assets/blackhole/accretion_disk.png"
import { BhAboutContent } from "./blackhole/BhAboutContent"
import { BhProjectsContent } from "./blackhole/BhProjectsContent"
import { BhContactContent } from "./blackhole/BhContactContent"
import { BhCvContent } from "./blackhole/BhCvContent"
import { BhMusicContent } from "./blackhole/BhMusicContent"
import { BhPhoneContent } from "./blackhole/BhPhoneContent"
import { BhCrocusContent } from "./blackhole/BhCrocusContent"
import { MapContent } from "./portfolio/windows/MapContent"
import { DiscordContent } from "./portfolio/windows/DiscordContent"

// ── Shader ────────────────────────────────────────────────────────────────────
const VERTEX = `void main() { gl_Position = vec4(position, 1.0); }`
const qualityDefines = (mobile: boolean) => (mobile ? `#define STEP 0.10\n#define NSTEPS 300\n` : `#define STEP 0.05\n#define NSTEPS 600\n`)

// ── Sections ──────────────────────────────────────────────────────────────────
interface Section {
	id: string
	label: string
	color: string
	radius: number
	phase: number
	speed: number
}

const SECTIONS: Section[] = [
	{ id: "about",    label: "About",    color: "#60a5fa", radius: 8,    phase: 0,           speed: 0.14 },
	{ id: "projects", label: "Projects", color: "#f87171", radius: 10.5, phase: Math.PI * 0.4, speed: 0.09 },
	{ id: "contact",  label: "Contact",  color: "#fbbf24", radius: 7.5,  phase: Math.PI * 0.8, speed: 0.17 },
	{ id: "music",    label: "Music",    color: "#c084fc", radius: 12,   phase: Math.PI * 1.2, speed: 0.07 },
	{ id: "cv",       label: "CV",       color: "#34d399", radius: 9.5,  phase: Math.PI * 1.6, speed: 0.11 },
]

// ── Project previews ──────────────────────────────────────────────────────────
const PROJECTS: Record<string, { title: string; wide?: boolean }> = {
	phone:   { title: "Mobile app" },
	map:     { title: "3D isometric map", wide: true },
	crocus:  { title: "Le Petit Crocus",  wide: true },
	discord: { title: "Discord bot" },
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BlackholePortfolio() {
	const mountRef = useRef<HTMLDivElement>(null)
	const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map())
	const [activeId, setActiveId] = useState<string | null>(null)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const activeIdRef = useRef<string | null>(null)
	activeIdRef.current = activeId

	// ── Section content nodes (built inside component to capture callbacks) ──
	const sectionNodes: Record<string, { title: string; node: ReactNode }> = {
		about:    { title: "About",    node: <BhAboutContent color="#60a5fa" /> },
		projects: { title: "Projects", node: <BhProjectsContent color="#f87171" onOpen={setPreviewId} /> },
		contact:  { title: "Contact",  node: <BhContactContent color="#fbbf24" /> },
		music:    { title: "Music",    node: <BhMusicContent color="#c084fc" /> },
		cv:       { title: "CV 2026",  node: <BhCvContent /> },
	}

	useEffect(() => {
		const mount = mountRef.current
		if (!mount) return
		const isMobile = window.innerWidth < 768

		// ── Renderer ──────────────────────────────────────────────────────
		const renderer = new THREE.WebGLRenderer({ antialias: false })
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
		renderer.setSize(window.innerWidth, window.innerHeight)
		mount.appendChild(renderer.domElement)

		// ── Scene / cameras ────────────────────────────────────────────────
		// bgCamera: fixed at z=1, renders the fullscreen shader quad
		const bgCamera = new THREE.Camera()
		bgCamera.position.z = 1
		const bgScene = new THREE.Scene()

		// projCamera: perspective camera kept in sync with observer, used for
		// projecting 3D node world-positions to 2D screen coordinates
		const projCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)

		// ── Uniforms ───────────────────────────────────────────────────────
		const uniforms = {
			time: { value: 0.0 },
			resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			accretion_disk: { value: true },
			use_disk_texture: { value: true },
			lorentz_transform: { value: false },
			doppler_shift: { value: false },
			beaming: { value: false },
			cam_pos: { value: new THREE.Vector3() },
			cam_vel: { value: new THREE.Vector3() },
			cam_dir: { value: new THREE.Vector3() },
			cam_up: { value: new THREE.Vector3() },
			fov: { value: 90.0 },
			bg_texture: { value: null as THREE.Texture | null },
			star_texture: { value: null as THREE.Texture | null },
			disk_texture: { value: null as THREE.Texture | null },
		}

		// ── Shader quad ────────────────────────────────────────────────────
		const material = new THREE.ShaderMaterial({
			uniforms,
			vertexShader: VERTEX,
			fragmentShader: qualityDefines(isMobile) + fragmentShaderSrc,
		})
		bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material))

		// ── Post-processing ────────────────────────────────────────────────
		const composer = new EffectComposer(renderer)
		composer.addPass(new RenderPass(bgScene, bgCamera))
		composer.addPass(new UnrealBloomPass(new THREE.Vector2(128, 128), 0.3, 0.6, 0.6))
		const copy = new ShaderPass(CopyShader)
		copy.renderToScreen = true
		composer.addPass(copy)

		// ── Textures ────────────────────────────────────────────────────────
		const loader = new THREE.TextureLoader()
		const load = (url: string, filter: THREE.MagnificationTextureFilter, cb: (t: THREE.Texture) => void) =>
			loader.load(url, (t) => {
				t.magFilter = t.minFilter = filter
				cb(t)
			})
		load(milkywayUrl, THREE.NearestFilter, (t) => {
			uniforms.bg_texture.value = t
		})
		load(starUrl, THREE.LinearFilter, (t) => {
			uniforms.star_texture.value = t
		})
		load(diskUrl, THREE.LinearFilter, (t) => {
			uniforms.disk_texture.value = t
		})

		// ── Observer (camera orbit state) ──────────────────────────────────
		const obs = { theta: 0, phi: -0.08, r: 7.0, autoRotate: true }

		// ── Drag / touch controls ──────────────────────────────────────────
		let dragging = false,
			lastX = 0,
			lastY = 0
		const touchStartPos = { x: 0, y: 0 }

		const onDragStart = (x: number, y: number) => {
			dragging = true
			lastX = x
			lastY = y
			obs.autoRotate = false
		}
		const onDragMove = (x: number, y: number) => {
			if (!dragging) return
			obs.theta -= (x - lastX) * 0.005
			obs.phi = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, obs.phi - (y - lastY) * 0.003))
			lastX = x
			lastY = y
		}
		const onDragEnd = () => {
			dragging = false
			obs.autoRotate = true
		}

		const el = renderer.domElement
		el.addEventListener("mousedown", (e) => onDragStart(e.clientX, e.clientY))
		el.addEventListener("mousemove", (e) => onDragMove(e.clientX, e.clientY))
		el.addEventListener("mouseup", onDragEnd)
		el.addEventListener("mouseleave", onDragEnd)
		el.addEventListener(
			"touchstart",
			(e) => {
				touchStartPos.x = e.touches[0].clientX
				touchStartPos.y = e.touches[0].clientY
				onDragStart(e.touches[0].clientX, e.touches[0].clientY)
			},
			{ passive: true },
		)
		el.addEventListener(
			"touchmove",
			(e) => {
				onDragMove(e.touches[0].clientX, e.touches[0].clientY)
			},
			{ passive: true },
		)
		el.addEventListener(
			"touchend",
			(e) => {
				onDragEnd()
				// If touch barely moved → treat as tap → raycast below
				const dx = e.changedTouches[0].clientX - touchStartPos.x
				const dy = e.changedTouches[0].clientY - touchStartPos.y
				if (Math.sqrt(dx * dx + dy * dy) < 12) {
					handleTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
				}
			},
			{ passive: true },
		)

		// Click on canvas → check if a node label was clicked (handled by label divs)
		// This handles keyboard-less fallback tap detection
		function handleTap(cx: number, cy: number) {
			if (activeIdRef.current) return
			// Check which label is closest to tap
			let closest: string | null = null
			let minDist = 40 // px threshold
			for (const [id, div] of labelRefs.current) {
				const r = div.getBoundingClientRect()
				const dx = cx - (r.left + r.width / 2)
				const dy = cy - (r.top + r.height / 2)
				const d = Math.sqrt(dx * dx + dy * dy)
				if (d < minDist) {
					minDist = d
					closest = id
				}
			}
			if (closest) setActiveId(closest)
		}

		// ── Section orbit angles ────────────────────────────────────────────
		const angles: Record<string, number> = {}
		for (const s of SECTIONS) angles[s.id] = s.phase

		// ── Animation loop ─────────────────────────────────────────────────
		let last = performance.now(),
			rafId = 0
		const _camPos = new THREE.Vector3()
		const _camDir = new THREE.Vector3()
		const _camUp = new THREE.Vector3()
		const _right = new THREE.Vector3()
		const _worldUp = new THREE.Vector3(0, 1, 0)
		const _nodePos = new THREE.Vector3()

		function tick() {
			rafId = requestAnimationFrame(tick)
			const now = performance.now()
			const dt = Math.min((now - last) / 1000, 0.05)
			last = now

			const vw = window.innerWidth,
				vh = window.innerHeight

			// Auto-orbit
			if (obs.autoRotate) obs.theta += dt * 0.08

			// Compute camera vectors
			const cosP = Math.cos(obs.phi),
				sinP = Math.sin(obs.phi)
			const cosT = Math.cos(obs.theta),
				sinT = Math.sin(obs.theta)
			_camPos.set(obs.r * cosP * sinT, obs.r * sinP, obs.r * cosP * cosT)
			_camDir.copy(_camPos).negate().normalize()
			_right.crossVectors(_camDir, _worldUp).normalize()
			_camUp.crossVectors(_right, _camDir).normalize()

			// Update shader uniforms
			uniforms.time.value += dt
			uniforms.resolution.value.set(vw, vh)
			uniforms.cam_pos.value.copy(_camPos)
			uniforms.cam_dir.value.copy(_camDir)
			uniforms.cam_up.value.copy(_camUp)

			// Sync projection camera
			projCamera.aspect = vw / vh
			projCamera.updateProjectionMatrix()
			projCamera.position.copy(_camPos)
			projCamera.up.copy(_camUp)
			projCamera.lookAt(0, 0, 0)
			projCamera.updateMatrixWorld()

			// Update node label positions
			const isActive = !!activeIdRef.current
			// Black hole shadow radius in world units (photon sphere ≈ 3√3 × M, visually ~2.8)
			const BH_SHADOW_R = 2.8
			const BH_FADE_BAND = 1.5  // smooth fade width at shadow edge

			for (const s of SECTIONS) {
				angles[s.id] += s.speed * dt
				_nodePos.set(s.radius * Math.cos(angles[s.id]), 0, s.radius * Math.sin(angles[s.id]))

				const div = labelRefs.current.get(s.id)
				if (!div) continue

				if (isActive) {
					div.style.opacity = "0"
					div.style.pointerEvents = "none"
					div.style.transform = "translate(-50%, -50%) scale(1)"
					continue
				}

				// Vector from camera to node
				const toNode = _nodePos.clone().sub(_camPos)

				// Project onto the look axis (_camDir points from camera toward origin)
				const projOnCam = toNode.dot(_camDir)

				// Nodes behind the camera plane: cull immediately
				if (projOnCam <= 0) {
					div.style.opacity = "0"
					div.style.pointerEvents = "none"
					div.style.transform = "translate(-50%, -50%) scale(1)"
					continue
				}

				// Perpendicular distance from camera-to-origin axis at the node's depth
				const perpDist = toNode.clone().addScaledVector(_camDir, -projOnCam).length()

				// Project to NDC then to screen pixels
				const ndc = _nodePos.clone().project(projCamera)
				const sx = ((ndc.x + 1) / 2) * vw
				const sy = ((-ndc.y + 1) / 2) * vh

				// ── Gravitational lensing ─────────────────────────────────────
				// How "deep" toward or past the BH the node is (0 = near camera, 1+ = past origin)
				const depthFactor = Math.max(0, Math.min(1, projOnCam / obs.r - 0.2))
				// How close to the shadow axis (0 = far out, 1 = at shadow edge)
				const proximityFactor = Math.max(0, 1 - perpDist / (BH_SHADOW_R * 4))
				// Combined lensing strength, sharper near the shadow
				const lensT = Math.pow(proximityFactor * depthFactor, 1.4)

				// Pull toward screen center (BH always projects to vw/2, vh/2)
				const lensedSx = sx + (vw / 2 - sx) * lensT * 0.92
				const lensedSy = sy + (vh / 2 - sy) * lensT * 0.92
				const nodeScale = Math.max(0.05, 1 - lensT * 0.88)

				// ── Occlusion fade at shadow boundary ─────────────────────────
				let bhFade = 1.0
				if (projOnCam > obs.r * 0.9) {
					bhFade = Math.max(0, Math.min(1, (perpDist - BH_SHADOW_R) / BH_FADE_BAND))
				}

				// Fade nodes near the screen edge
				const edgeFade = Math.min(1, Math.min(Math.min(sx, vw - sx) / 60, Math.min(sy, vh - sy) / 60))

				const opacity = Math.max(0, edgeFade * bhFade)
				div.style.left = `${lensedSx}px`
				div.style.top = `${lensedSy}px`
				div.style.transform = `translate(-50%, -50%) scale(${nodeScale})`
				div.style.opacity = String(opacity)
				div.style.pointerEvents = opacity > 0.1 ? "auto" : "none"
			}

			// Resize if needed
			renderer.setSize(vw, vh, false)
			composer.setSize(vw, vh)

			// Render black hole
			composer.render()
		}

		tick()

		return () => {
			cancelAnimationFrame(rafId)
			renderer.dispose()
			mount.removeChild(renderer.domElement)
		}
	}, [])

	const active = SECTIONS.find((s) => s.id === activeId)
	const activeContent = activeId ? sectionNodes[activeId] : null
	const preview = previewId ? PROJECTS[previewId] : null

	return (
		<div ref={mountRef} style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }}>
			{/* ── Node labels (HTML overlay) ── */}
			{SECTIONS.map((s) => (
				<div
					key={s.id}
					ref={(el) => {
						if (el) labelRefs.current.set(s.id, el)
					}}
					onClick={() => !activeId && setActiveId(s.id)}
					style={{
						position: "absolute",
						transform: "translate(-50%, -50%)",
						cursor: "pointer",
						opacity: 0,
						transition: "opacity 0.4s ease",
						zIndex: 10,
						userSelect: "none",
					}}
				>
					{/* Glow dot */}
					<div
						style={{
							width: 12,
							height: 12,
							borderRadius: "50%",
							background: s.color,
							boxShadow: `0 0 10px 3px ${s.color}99, 0 0 20px 6px ${s.color}44`,
							margin: "0 auto 8px",
						}}
					/>
					{/* Label */}
					<div
						style={{
							fontFamily: '"Press Start 2P", monospace',
							fontSize: window.innerWidth < 480 ? 7 : 9,
							color: s.color,
							textShadow: `0 0 6px ${s.color}, 0 0 12px ${s.color}88`,
							whiteSpace: "nowrap",
							textAlign: "center",
						}}
					>
						{s.label}
					</div>
				</div>
			))}

			{/* ── Section modal ── */}
			{active && activeContent && (
				<div
					onClick={() => setActiveId(null)}
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.80)",
						backdropFilter: "blur(6px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 100,
						animation: "bhFadeIn 0.25s ease",
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							background: "#06060f",
							border: `1px solid ${active.color}44`,
							boxShadow: `0 0 60px ${active.color}22, 0 0 120px ${active.color}11`,
							width: "min(720px, 95vw)",
							maxHeight: "88vh",
							display: "flex",
							flexDirection: "column",
							borderRadius: 6,
							overflow: "hidden",
						}}
					>
						{/* Header */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								padding: "14px 20px",
								borderBottom: `1px solid ${active.color}33`,
								background: `linear-gradient(135deg, ${active.color}18 0%, transparent 100%)`,
								flexShrink: 0,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<div style={{ width: 10, height: 10, borderRadius: "50%", background: active.color, boxShadow: `0 0 10px ${active.color}` }} />
								<span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: active.color, letterSpacing: "0.08em" }}>
									{activeContent.title}
								</span>
							</div>
							<button onClick={() => setActiveId(null)} style={{ background: "none", border: "none", color: "#ffffff55", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>
								✕
							</button>
						</div>
						{/* Body */}
						<div style={{ overflowY: "auto", flex: 1, color: "#c8c8d8", fontSize: 13, lineHeight: 1.7, fontFamily: "system-ui, -apple-system, sans-serif" }}>
							{activeContent.node}
						</div>
					</div>
				</div>
			)}

			{/* ── Project preview modal ── */}
			{preview && (
				<div
					onClick={() => setPreviewId(null)}
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0,0,0,0.88)",
						backdropFilter: "blur(8px)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 200,
						animation: "bhFadeIn 0.2s ease",
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							background: "#06060f",
							border: "1px solid #f8717144",
							boxShadow: "0 0 60px #f8717122",
							width: preview.wide ? "min(1000px, 97vw)" : "min(700px, 95vw)",
							height: preview.wide ? "min(700px, 90vh)" : "min(620px, 90vh)",
							display: "flex",
							flexDirection: "column",
							borderRadius: 6,
							overflow: "hidden",
						}}
					>
						{/* Header */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								padding: "12px 20px",
								borderBottom: "1px solid #f8717133",
								background: "linear-gradient(135deg, #f8717118 0%, transparent 100%)",
								flexShrink: 0,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
								<button
									onClick={() => setPreviewId(null)}
									style={{ background: "none", border: "none", color: "#f87171aa", cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}
								>
									‹ Back
								</button>
								<span style={{ color: "#404060", fontSize: 12 }}>|</span>
								<span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#f87171", letterSpacing: "0.08em" }}>
									{preview.title}
								</span>
							</div>
							<button onClick={() => setPreviewId(null)} style={{ background: "none", border: "none", color: "#ffffff55", cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>
								✕
							</button>
						</div>
						{/* Preview content */}
						<div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
							{previewId === "phone"   && <BhPhoneContent color="#f87171" />}
							{previewId === "map"     && <MapContent />}
							{previewId === "crocus"  && <BhCrocusContent color="#f87171" />}
							{previewId === "discord" && <DiscordContent />}
						</div>
					</div>
				</div>
			)}

			{/* ── Navigation hint ── */}
			{!activeId && (
				<div
					style={{
						position: "fixed",
						bottom: 24,
						left: "50%",
						transform: "translateX(-50%)",
						fontFamily: '"Press Start 2P", monospace',
						fontSize: 7,
						color: "rgba(255,255,255,0.25)",
						whiteSpace: "nowrap",
						pointerEvents: "none",
						letterSpacing: "0.1em",
					}}
				>
					{window.innerWidth < 768 ? "drag to orbit  ·  tap a node" : "drag to orbit  ·  click a node to explore"}
				</div>
			)}

			<style>{`
        @keyframes bhFadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
		</div>
	)
}
