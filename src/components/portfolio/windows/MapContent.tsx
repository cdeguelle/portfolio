import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls.js"
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js"
import { FONT } from "../theme"

export function MapContent({ theme }: { theme?: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const canvas = canvasRef.current
		const container = containerRef.current
		if (!canvas || !container) return

		// ── Data ──────────────────────────────────────────────────────────
		let animFrameId: number
		let disposed = false

		const instanceData: { x: number; y: number; z: number; height: number }[] = []

		function determineMinAndMax(grid: any[][]) {
			let max = -Infinity
			let min = Infinity
			for (const row of grid) {
				for (const hex of row) {
					hex.values.sort((a: any, b: any) => b.count - a.count)
					const vals = hex.values
					if (vals[vals.length - 1].value < min) min = vals[vals.length - 1].value
					if (vals[0].value > max) max = vals[0].value
				}
			}
			return { min, max }
		}

		// ── Scene setup ───────────────────────────────────────────────────
		const scene = new THREE.Scene()

		const sizes = {
			width: container.clientWidth,
			height: container.clientHeight,
		}

		// Camera
		const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000)
		camera.position.set(0, 1000, 1000)
		scene.add(camera)

		// Renderer
		const renderer = new THREE.WebGLRenderer({ canvas })
		renderer.setSize(sizes.width, sizes.height)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// Label renderer
		const labelRenderer = new CSS2DRenderer()
		labelRenderer.setSize(sizes.width, sizes.height)
		labelRenderer.domElement.style.position = "absolute"
		labelRenderer.domElement.style.top = "0px"
		labelRenderer.domElement.style.left = "0px"
		labelRenderer.domElement.style.pointerEvents = "none"
		container.appendChild(labelRenderer.domElement)

		// Label
		const labelDiv = document.createElement("div")
		labelDiv.style.cssText = "margin-top:-1em;color:white;padding:2px 5px;background:rgba(0,0,0,0.5);border-radius:3px;font-size:11px;"
		const label = new CSS2DObject(labelDiv)
		label.visible = false
		scene.add(label)

		// Controls
		const controls = new MapControls(camera, canvas)
		controls.enableDamping = true

		// Lights
		scene.add(new THREE.HemisphereLight(0xb1e1ff, 0xb97a20, 4))
		const sunLight = new THREE.DirectionalLight(0xffffff, 4)
		sunLight.position.set(400, 220, -200)
		scene.add(sunLight)
		scene.add(sunLight.target)

		// Raycasting
		const raycaster = new THREE.Raycaster()
		const mouse = new THREE.Vector2()
		let hoveredHex: number | null = null
		let instancedMesh: THREE.InstancedMesh | null = null

		// Mouse: coords relative to canvas, not window
		function onMouseMove(e: MouseEvent) {
			const rect = (canvas as HTMLCanvasElement).getBoundingClientRect()
			mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
			mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
		}
		canvas.addEventListener("mousemove", onMouseMove)

		// Resize: relative to container
		function onResize() {
			sizes.width = (container as HTMLDivElement).clientWidth
			sizes.height = (container as HTMLDivElement).clientHeight
			camera.aspect = sizes.width / sizes.height
			camera.updateProjectionMatrix()
			renderer.setSize(sizes.width, sizes.height)
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
			labelRenderer.setSize(sizes.width, sizes.height)
		}
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(container as HTMLDivElement)

		// Bounce animation
		const dummy = new THREE.Object3D()
		function bounceAnimation(instanceId: number, isEntering: boolean) {
			if (!instancedMesh) return
			const duration = 0.3
			const bounceOffset = 10
			const startTime = Date.now()
			const data = instanceData[instanceId]
			function animate() {
				if (disposed) return
				const elapsed = (Date.now() - startTime) / 1000
				if (elapsed < duration) {
					const t = elapsed / duration
					const bounce = bounceOffset * (1 - Math.pow(2, -10 * t) * Math.cos(t * Math.PI * 3))
					const offsetY = isEntering ? bounce : bounceOffset - bounce
					dummy.position.set(data.x, data.y + offsetY, data.z)
					dummy.scale.set(1, data.height, 1)
					dummy.updateMatrix()
					instancedMesh!.setMatrixAt(instanceId, dummy.matrix)
					instancedMesh!.instanceMatrix.needsUpdate = true
					requestAnimationFrame(animate)
				} else {
					const finalOffsetY = isEntering ? bounceOffset : 0
					dummy.position.set(data.x, data.y + finalOffsetY, data.z)
					dummy.scale.set(1, data.height, 1)
					dummy.updateMatrix()
					instancedMesh!.setMatrixAt(instanceId, dummy.matrix)
					instancedMesh!.instanceMatrix.needsUpdate = true
				}
			}
			animate()
		}

		// Generate tiles from data
		function generateTiles(data: any[][]) {
			const rows = data.length
			const cols = data[0].length
			const tile_radius = 5
			const base_height = 2
			const height_step = 200
			const tile_width = Math.sqrt(3) * tile_radius
			const tile_height_step = tile_radius * 1.5
			const offsetX = ((cols - 1) * tile_width + tile_width) / 2 - tile_width / 2
			const offsetZ = ((rows - 1) * tile_height_step + tile_height_step) / 2 - tile_height_step / 2

			const { min: grid_min, max: grid_max } = determineMinAndMax(data)

			const geometry = new THREE.CylinderGeometry(tile_radius, tile_radius, 1, 6, 1)
			const material = new THREE.MeshStandardMaterial()
			const mesh = new THREE.InstancedMesh(geometry, material, rows * cols)
			mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

			const d = new THREE.Object3D()
			const color = new THREE.Color()
			let idx = 0

			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < cols; j++) {
					const hex = data[i][j]
					const hex_values = hex.values.sort((a: any, b: any) => b.count - a.count)
					const mods = hex_values.slice(0, Math.min(3, hex_values.length))
					let earth = 0,
						water = 0
					mods.forEach((m: any) => {
						m.value < 0 ? (water += m.count) : (earth += m.count)
					})
					const env_type = earth - water < 0 ? "water" : "earth"

					let data_value = env_type === "water" ? hex_values[hex_values.length - 1].value : hex_values[0].value
					const x = j * tile_width + ((i % 2) * tile_width) / 2 - offsetX
					const z = i * tile_height_step - offsetZ
					const normalized = (data_value - grid_min) / (grid_max - grid_min)
					const height = base_height + normalized * height_step
					const y = height / 2

					if (data_value < -1500) color.setRGB(33 / 255, 21 / 255, 138 / 255)
					else if (data_value < -1000) color.setRGB(40 / 255, 38 / 255, 200 / 255)
					else if (data_value < -700) color.setRGB(40 / 255, 82 / 255, 223 / 255)
					else if (data_value < -500) color.setRGB(40 / 255, 124 / 255, 223 / 255)
					else if (data_value > 3000) color.setRGB(125 / 255, 72 / 255, 28 / 255)
					else if (data_value > 2000) color.setRGB(156 / 255, 112 / 255, 18 / 255)
					else if (data_value > 1000) color.setRGB(80 / 255, 135 / 255, 10 / 255)
					else if (data_value > 500) color.setRGB(45 / 255, 187 / 255, 36 / 255)
					else if (env_type === "water") color.setRGB(50 / 255, 183 / 255, 255 / 255)
					else color.setRGB(50 / 255, 255 / 255, 81 / 255)

					d.position.set(x, y, z)
					d.scale.set(1, height, 1)
					d.updateMatrix()
					mesh.setMatrixAt(idx, d.matrix)
					mesh.setColorAt(idx, color)
					instanceData[idx] = { x, y, z, height }
					idx++
				}
			}

			mesh.instanceMatrix.needsUpdate = true
			mesh.instanceColor!.needsUpdate = true
			return mesh
		}

		// Tick
		const clock = new THREE.Clock()
		function tick() {
			if (disposed) return
			clock.getElapsedTime()
			if (instancedMesh) {
				raycaster.setFromCamera(mouse, camera)
				const intersects = raycaster.intersectObject(instancedMesh)
				if (intersects.length > 0) {
					const newId = intersects[0].instanceId!
					if (newId !== hoveredHex) {
						if (hoveredHex !== null) bounceAnimation(hoveredHex, false)
						hoveredHex = newId
						bounceAnimation(hoveredHex, true)
						const d = instanceData[newId]
						label.visible = true
						label.position.set(d.x, d.y + d.height / 2 + 5, d.z)
						labelDiv.textContent = `hex #${newId}`
					}
				} else if (hoveredHex !== null) {
					bounceAnimation(hoveredHex, false)
					hoveredHex = null
					label.visible = false
				}
			}
			controls.update()
			renderer.render(scene, camera)
			labelRenderer.render(scene, camera)
			animFrameId = requestAnimationFrame(tick)
		}

		// Load JSON then start
		fetch("/output_hexagon2.json")
			.then((r) => r.json())
			.then((data) => {
				if (disposed) return
				instancedMesh = generateTiles(data)
				scene.add(instancedMesh)
				setLoading(false)
				tick()
			})

		return () => {
			disposed = true
			cancelAnimationFrame(animFrameId)
			canvas.removeEventListener("mousemove", onMouseMove)
			resizeObserver.disconnect()
			if (container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement)
			renderer.dispose()
			controls.dispose()
		}
	}, [])

	return (
		<div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
			<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
			{loading && (
				theme === "editorial" ? (
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: "#f0ede6",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 20,
						}}
					>
						<div style={{ width: 80, height: 1, background: "#0d0d0d", animation: "edMapLoad 1.1s ease-in-out infinite alternate" }} />
						<p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, letterSpacing: "0.14em", color: "#999", textTransform: "uppercase", margin: 0 }}>
							Loading map data
						</p>
						<style>{`@keyframes edMapLoad { from { width: 40px; opacity: 0.3; } to { width: 140px; opacity: 1; } }`}</style>
					</div>
				) : (
					<div
						style={{
							position: "absolute",
							inset: 0,
							background: "#000000",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							gap: 12,
							fontFamily: FONT,
						}}
					>
						<div style={{ color: "#ffffff", fontSize: 11 }}>Loading map data...</div>
						<div
							style={{
								width: 160,
								height: 16,
								border: "2px inset #808080",
								background: "#c0c0c0",
								padding: 2,
							}}
						>
							<div
								style={{
									height: "100%",
									background: "#000080",
									animation: "w95-progress 1.2s steps(10, end) infinite",
									width: "40%",
								}}
							/>
						</div>
						<style>{`
							@keyframes w95-progress {
								0%   { margin-left: 0%; }
								100% { margin-left: 60%; }
							}
						`}</style>
					</div>
				)
			)}
		</div>
	)
}
