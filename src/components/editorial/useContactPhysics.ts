import { useEffect, RefObject } from "react"
import Matter from "matter-js"
import { CONTACT_TAGS } from "./constants"

export function useContactPhysics(containerRef: RefObject<HTMLDivElement | null>) {
	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		let disposed = false
		let animFrameId: number
		let spawnTimer: ReturnType<typeof setTimeout>

		const dpr = Math.min(window.devicePixelRatio, 2)
		let W = container.clientWidth
		let H = container.clientHeight

		// Canvas
		const canvas = document.createElement("canvas")
		canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;"
		canvas.width = W * dpr
		canvas.height = H * dpr
		container.appendChild(canvas)
		const ctx = canvas.getContext("2d")!
		ctx.scale(dpr, dpr)

		// Text measurer
		const measurer = document.createElement("canvas").getContext("2d")!
		measurer.font = '400 14px "Space Grotesk", sans-serif'

		// Engine
		const engine = Matter.Engine.create({ gravity: { y: 0.4 } })
		const world = engine.world

		const PILL_H = 38
		const floor = Matter.Bodies.rectangle(W / 2, H + 25, W + 1000, 50, { isStatic: true, restitution: 0.7, friction: 0.1 })
		const wallL = Matter.Bodies.rectangle(-25, H / 2, 50, H * 10, { isStatic: true, restitution: 0.7 })
		const wallR = Matter.Bodies.rectangle(W + 25, H / 2, 50, H * 10, { isStatic: true, restitution: 0.7 })
		Matter.Composite.add(world, [floor, wallL, wallR])

		// Mouse drag
		const mouse = Matter.Mouse.create(canvas)
		const mc = Matter.MouseConstraint.create(engine, {
			mouse,
			constraint: { stiffness: 0.2, damping: 0.1 },
		})
		Matter.Composite.add(world, mc)

		Matter.Events.on(mc, "startdrag", () => {
			container.classList.add("ed-grabbing")
		})
		Matter.Events.on(mc, "enddrag", () => {
			container.classList.remove("ed-grabbing")
		})

		// body → { label, w, h }
		const bodyData = new Map<Matter.Body, { label: string; w: number; h: number }>()

		function spawnTag() {
			if (disposed) return
			const label = CONTACT_TAGS[Math.floor(Math.random() * CONTACT_TAGS.length)]
			const tw = measurer.measureText(label).width
			const bW = tw + 36
			const x = Math.random() * Math.max(W - bW - 20, 1) + bW / 2 + 10
			const body = Matter.Bodies.rectangle(x, -PILL_H / 2 - 10, bW, PILL_H, {
				restitution: 0.7,
				friction: 0.2,
				frictionAir: 0.008,
				chamfer: { radius: PILL_H / 2 },
			})
			Matter.Composite.add(world, body)
			bodyData.set(body, { label, w: bW, h: PILL_H })

			// Cap body count
			const dynamic = Matter.Composite.allBodies(world).filter((b) => !b.isStatic)
			if (dynamic.length > 20) {
				const oldest = dynamic[0]
				Matter.Composite.remove(world, oldest)
				bodyData.delete(oldest)
			}

			spawnTimer = setTimeout(spawnTag, 400 + Math.random() * 300)
		}
		let visible = false

		// Render loop — only runs when section is visible
		function tick() {
			if (disposed || !visible) return
			Matter.Engine.update(engine, 1000 / 60)
			ctx.clearRect(0, 0, W, H)

			for (const [body, { label, w, h }] of bodyData) {
				const { x, y } = body.position
				ctx.save()
				ctx.translate(x, y)
				ctx.rotate(body.angle)
				ctx.beginPath()
				;(ctx as any).roundRect(-w / 2, -h / 2, w, h, h / 2)
				ctx.fillStyle = "#0d0d0d"
				ctx.fill()
				ctx.font = '400 14px "Space Grotesk", sans-serif'
				ctx.fillStyle = "#f0ede6"
				ctx.textAlign = "center"
				ctx.textBaseline = "middle"
				ctx.fillText(label, 0, 1)
				ctx.restore()
			}

			animFrameId = requestAnimationFrame(tick)
		}

		// Pause/resume based on visibility
		const io = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting
				if (visible) {
					// Resume spawn + render
					spawnTimer = setTimeout(spawnTag, 100)
					animFrameId = requestAnimationFrame(tick)
				} else {
					// Pause everything
					clearTimeout(spawnTimer)
					cancelAnimationFrame(animFrameId)
				}
			},
			{ threshold: 0.01 },
		)
		io.observe(container)

		// Resize
		const ro = new ResizeObserver(() => {
			W = container.clientWidth
			H = container.clientHeight
			canvas.width = W * dpr
			canvas.height = H * dpr
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			Matter.Body.setPosition(floor, { x: W / 2, y: H + 25 })
			Matter.Body.setPosition(wallR, { x: W + 25, y: H / 2 })
		})
		ro.observe(container)

		return () => {
			disposed = true
			clearTimeout(spawnTimer)
			cancelAnimationFrame(animFrameId)
			io.disconnect()
			ro.disconnect()
			Matter.Engine.clear(engine)
			if (container.contains(canvas)) container.removeChild(canvas)
		}
	}, [])
}
