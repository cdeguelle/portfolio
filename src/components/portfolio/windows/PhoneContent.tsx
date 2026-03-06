import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"
import { BG, FONT, raised } from "../theme"

import s0 from "../../../assets/Screenshot_20260305_185759.png"
import s1 from "../../../assets/Screenshot_20260305_190001.png"
import s2 from "../../../assets/Screenshot_20260305_190029.png"
import s3 from "../../../assets/Screenshot_20260305_190038.png"
import s4 from "../../../assets/Screenshot_20260305_190054.png"

const SCREENSHOTS = [s0, s1, s2, s3, s4]

export function PhoneContent() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const screenMatRef = useRef<THREE.MeshBasicMaterial | null>(null)
	const texturesRef = useRef<THREE.Texture[]>([])
	const [currentIdx, setCurrentIdx] = useState(0)

	useEffect(() => {
		const canvas = canvasRef.current
		const container = containerRef.current
		if (!canvas || !container) return

		let animFrameId: number

		// ── Scene ─────────────────────────────────────────────────────────
		const scene = new THREE.Scene()
		scene.background = new THREE.Color("#E0FBF4")

		const sizes = { width: container.clientWidth, height: container.clientHeight }

		const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
		camera.position.set(0, 0, 6)
		scene.add(camera)

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// ── Lights ────────────────────────────────────────────────────────
		scene.add(new THREE.AmbientLight(0xffffff, 1.5))
		const dirLight = new THREE.DirectionalLight(0xffffff, 2)
		dirLight.position.set(3, 3, 3)
		scene.add(dirLight)
		const fillLight = new THREE.DirectionalLight(0x4466ff, 0.5)
		fillLight.position.set(-3, -2, 2)
		scene.add(fillLight)

		// ── Phone body ────────────────────────────────────────────────────
		const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.25 })
		const body = new THREE.Mesh(new RoundedBoxGeometry(1.4, 2.9, 0.12, 8, 0.1), bodyMat)
		scene.add(body)

		// Screen bezel
		const bezelMat = new THREE.MeshStandardMaterial({ color: 0x050505 })
		const bezel = new THREE.Mesh(new RoundedBoxGeometry(1.27, 2.67, 0.01, 8, 0.08), bezelMat)
		bezel.position.z = 0.059
		scene.add(bezel)

		// Screen with screenshot texture
		const textureLoader = new THREE.TextureLoader()
		const textures = SCREENSHOTS.map((src) => {
			const t = textureLoader.load(src)
			t.colorSpace = THREE.SRGBColorSpace
			return t
		})
		texturesRef.current = textures

		const screenMat = new THREE.MeshBasicMaterial({ map: textures[0] })
		screenMatRef.current = screenMat
		const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 2.58), screenMat)
		screen.position.z = 0.07
		scene.add(screen)

		// Front camera dot
		const camDot = new THREE.Mesh(
			new THREE.SphereGeometry(0.035, 8, 8),
			new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
		)
		camDot.position.set(0, 1.32, 0.07)
		scene.add(camDot)

		// Home bar
		const homeBar = new THREE.Mesh(
			new THREE.BoxGeometry(0.38, 0.018, 0.002),
			new THREE.MeshStandardMaterial({ color: 0x888888 }),
		)
		homeBar.position.set(0, -1.37, 0.07)
		scene.add(homeBar)

		// Side buttons
		const btnMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.8, roughness: 0.2 })
		const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.2, 0.04), btnMat)
		powerBtn.position.set(0.715, 0.3, 0)
		scene.add(powerBtn)
		const volUp = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.04), btnMat)
		volUp.position.set(-0.715, 0.55, 0)
		scene.add(volUp)
		const volDown = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.18, 0.04), btnMat)
		volDown.position.set(-0.715, 0.25, 0)
		scene.add(volDown)

		// ── Controls ──────────────────────────────────────────────────────
		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
		controls.enablePan = false
		controls.minDistance = 3
		controls.maxDistance = 10
		controls.autoRotate = true
		controls.autoRotateSpeed = 1.5
		canvas.addEventListener("pointerdown", () => { controls.autoRotate = false })

		// ── Resize ────────────────────────────────────────────────────────
		function onResize() {
			sizes.width = (container as HTMLDivElement).clientWidth
			sizes.height = (container as HTMLDivElement).clientHeight
			camera.aspect = sizes.width / sizes.height
			camera.updateProjectionMatrix()
			renderer.setSize(sizes.width, sizes.height)
		}
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(container)

		// ── Tick ──────────────────────────────────────────────────────────
		function tick() {
			controls.update()
			renderer.render(scene, camera)
			animFrameId = requestAnimationFrame(tick)
		}
		tick()

		return () => {
			cancelAnimationFrame(animFrameId)
			resizeObserver.disconnect()
			renderer.dispose()
			controls.dispose()
			textures.forEach((t) => t.dispose())
		}
	}, [])

	// Update screen texture when screenshot changes
	useEffect(() => {
		const mat = screenMatRef.current
		const textures = texturesRef.current
		if (!mat || textures.length === 0) return
		mat.map = textures[currentIdx]
		mat.needsUpdate = true
	}, [currentIdx])

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
			<div ref={containerRef} style={{ flex: 1, position: "relative" }}>
				<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
			</div>

			{/* W95 navigation bar */}
			<div style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 10,
				padding: "5px 8px",
				background: BG,
				borderTop: "2px solid #808080",
				flexShrink: 0,
			}}>
				<button
					onClick={() => setCurrentIdx((i) => (i - 1 + SCREENSHOTS.length) % SCREENSHOTS.length)}
					style={{ ...raised, background: BG, padding: "2px 10px", fontFamily: FONT, fontSize: 11, cursor: "pointer" }}
				>
					◄
				</button>
				{SCREENSHOTS.map((_, i) => (
					<div
						key={i}
						onClick={() => setCurrentIdx(i)}
						style={{
							width: 10,
							height: 10,
							background: i === currentIdx ? "#000080" : BG,
							border: i === currentIdx ? "2px inset #404040" : "2px outset #ffffff",
							cursor: "pointer",
						}}
					/>
				))}
				<button
					onClick={() => setCurrentIdx((i) => (i + 1) % SCREENSHOTS.length)}
					style={{ ...raised, background: BG, padding: "2px 10px", fontFamily: FONT, fontSize: 11, cursor: "pointer" }}
				>
					►
				</button>
				<span style={{ fontFamily: FONT, fontSize: 10, color: "#444", marginLeft: 8 }}>
					{currentIdx + 1} / {SCREENSHOTS.length}
				</span>
			</div>
		</div>
	)
}
