import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

// Official Discord logo SVG path (viewBox 0 0 127.14 96.36)
const DISCORD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
  <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
</svg>`

export function DiscordContent() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const canvas = canvasRef.current
		const container = containerRef.current
		if (!canvas || !container) return

		let animFrameId: number

		// ── Scene ─────────────────────────────────────────────────────────
		const scene = new THREE.Scene()
		scene.background = new THREE.Color("#23272A")

		const sizes = { width: container.clientWidth, height: container.clientHeight }

		const camera = new THREE.PerspectiveCamera(40, sizes.width / sizes.height, 0.1, 100)
		camera.position.set(0, 0, 5)
		scene.add(camera)

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// ── Lights ────────────────────────────────────────────────────────
		scene.add(new THREE.AmbientLight(0xffffff, 1.2))
		const dirLight = new THREE.DirectionalLight(0xffffff, 2.5)
		dirLight.position.set(3, 3, 4)
		scene.add(dirLight)
		const fillLight = new THREE.DirectionalLight(0x8899ff, 1.2)
		fillLight.position.set(-3, -2, 2)
		scene.add(fillLight)
		const rimLight = new THREE.DirectionalLight(0x5865F2, 0.8)
		rimLight.position.set(0, 0, -4)
		scene.add(rimLight)

		// ── Discord logo via SVGLoader ─────────────────────────────────────
		const loader = new SVGLoader()
		const svgData = loader.parse(DISCORD_SVG)
		const group = new THREE.Group()

		svgData.paths.forEach((path) => {
			const shapes = SVGLoader.createShapes(path)
			shapes.forEach((shape) => {
				const geometry = new THREE.ExtrudeGeometry(shape, {
					depth: 12,
					bevelEnabled: true,
					bevelThickness: 2,
					bevelSize: 1.5,
					bevelSegments: 5,
				})
				const material = new THREE.MeshStandardMaterial({
					color: 0x5865F2,
					metalness: 0.25,
					roughness: 0.35,
					envMapIntensity: 1,
				})
				group.add(new THREE.Mesh(geometry, material))
			})
		})

		// Flip Y (SVG Y goes down, Three.js Y goes up) then center
		group.scale.set(0.025, -0.025, 0.025)
		scene.add(group)

		const box = new THREE.Box3().setFromObject(group)
		const center = box.getCenter(new THREE.Vector3())
		group.position.sub(center)

		// ── Controls ──────────────────────────────────────────────────────
		const controls = new OrbitControls(camera, canvas)
		controls.enableDamping = true
		controls.enablePan = false
		controls.minDistance = 2
		controls.maxDistance = 12
		controls.autoRotate = true
		controls.autoRotateSpeed = 2.5
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
		resizeObserver.observe(container as HTMLDivElement)

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
		}
	}, [])

	return (
		<div ref={containerRef} style={{ width: "100%", height: "100%" }}>
			<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
		</div>
	)
}
