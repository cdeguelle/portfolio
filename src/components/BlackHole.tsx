import { useEffect, useRef, useState } from "react"
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

// ── Shader ────────────────────────────────────────────────────────────────────
const VERTEX = `void main() { gl_Position = vec4(position, 1.0); }`
const qualityDefines = (mobile: boolean) => (mobile ? `#define STEP 0.10\n#define NSTEPS 300\n` : `#define STEP 0.05\n#define NSTEPS 600\n`)

// ── Component ─────────────────────────────────────────────────────────────────
export default function BlackholePortfolio() {
	const mountRef = useRef<HTMLDivElement>(null)
	const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map())
	const [activeId, setActiveId] = useState<string | null>(null)
	const activeIdRef = useRef<string | null>(null)
	activeIdRef.current = activeId

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

		// ── Animation loop ─────────────────────────────────────────────────
		let last = performance.now(),
			rafId = 0
		const _camPos = new THREE.Vector3()
		const _camDir = new THREE.Vector3()
		const _camUp = new THREE.Vector3()
		const _right = new THREE.Vector3()
		const _worldUp = new THREE.Vector3(0, 1, 0)

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

	return <div ref={mountRef} style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#000" }} />
}
