import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

import s0 from "../../assets/Screenshot_20260305_185759.png"
import s1 from "../../assets/Screenshot_20260305_190001.png"
import s2 from "../../assets/Screenshot_20260305_190029.png"
import s3 from "../../assets/Screenshot_20260305_190038.png"
import s4 from "../../assets/Screenshot_20260305_190054.png"

const SCREENSHOTS = [s0, s1, s2, s3, s4]

export function BhPhoneContent({ color }: { color: string }) {
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

		const scene = new THREE.Scene()
		scene.background = new THREE.Color("#060612")

		const sizes = { width: container.clientWidth, height: container.clientHeight }
		const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
		camera.position.set(0, 0, 6)
		scene.add(camera)

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		scene.add(new THREE.AmbientLight(0xffffff, 1.5))
		const dirLight = new THREE.DirectionalLight(0xffffff, 2)
		dirLight.position.set(3, 3, 3)
		scene.add(dirLight)
		const fillLight = new THREE.DirectionalLight(0x4466ff, 0.5)
		fillLight.position.set(-3, -2, 2)
		scene.add(fillLight)

		const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.25 })
		const body = new THREE.Mesh(new RoundedBoxGeometry(1.4, 2.9, 0.12, 8, 0.1), bodyMat)
		scene.add(body)

		const bezelMat = new THREE.MeshStandardMaterial({ color: 0x050505 })
		const bezel = new THREE.Mesh(new RoundedBoxGeometry(1.27, 2.67, 0.01, 8, 0.08), bezelMat)
		bezel.position.z = 0.059
		scene.add(bezel)

		const loader = new THREE.TextureLoader()
		const textures = SCREENSHOTS.map((src) => {
			const t = loader.load(src)
			t.colorSpace = THREE.SRGBColorSpace
			return t
		})
		texturesRef.current = textures

		const screenMat = new THREE.MeshBasicMaterial({ map: textures[0] })
		screenMatRef.current = screenMat
		const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 2.58), screenMat)
		screen.position.z = 0.07
		scene.add(screen)

		const camDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }))
		camDot.position.set(0, 1.32, 0.07)
		scene.add(camDot)

		const homeBar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.018, 0.002), new THREE.MeshStandardMaterial({ color: 0x888888 }))
		homeBar.position.set(0, -1.37, 0.07)
		scene.add(homeBar)

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

		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
		controls.enablePan = false
		controls.minDistance = 3
		controls.maxDistance = 10
		controls.autoRotate = true
		controls.autoRotateSpeed = 1.5
		canvas.addEventListener("pointerdown", () => { controls.autoRotate = false })

		function onResize() {
			sizes.width = (container as HTMLDivElement).clientWidth
			sizes.height = (container as HTMLDivElement).clientHeight
			camera.aspect = sizes.width / sizes.height
			camera.updateProjectionMatrix()
			renderer.setSize(sizes.width, sizes.height)
		}
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(container)

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

			{/* Dark nav bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 12,
					padding: "10px 16px",
					background: "#08081a",
					borderTop: `1px solid ${color}22`,
					flexShrink: 0,
				}}
			>
				<button
					onClick={() => setCurrentIdx((i) => (i - 1 + SCREENSHOTS.length) % SCREENSHOTS.length)}
					style={{
						background: "transparent",
						border: `1px solid ${color}44`,
						borderRadius: 4,
						color: color,
						cursor: "pointer",
						fontSize: 14,
						width: 32,
						height: 28,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					‹
				</button>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					{SCREENSHOTS.map((_, i) => (
						<div
							key={i}
							onClick={() => setCurrentIdx(i)}
							style={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: i === currentIdx ? color : `${color}33`,
								cursor: "pointer",
								transition: "background 0.2s",
							}}
						/>
					))}
				</div>
				<button
					onClick={() => setCurrentIdx((i) => (i + 1) % SCREENSHOTS.length)}
					style={{
						background: "transparent",
						border: `1px solid ${color}44`,
						borderRadius: 4,
						color: color,
						cursor: "pointer",
						fontSize: 14,
						width: 32,
						height: 28,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					›
				</button>
				<span style={{ fontSize: 11, color: `${color}66`, marginLeft: 4, fontVariantNumeric: "tabular-nums" }}>
					{currentIdx + 1} / {SCREENSHOTS.length}
				</span>
			</div>
		</div>
	)
}
