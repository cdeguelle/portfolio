import { useEffect, RefObject, MutableRefObject } from "react"
import Matter from "matter-js"

export function useHeroPhysics(
	heroRef: RefObject<HTMLElement | null>,
	canvasRef: RefObject<HTMLCanvasElement | null>,
	cloneRef: MutableRefObject<HTMLElement | null>,
	buildCloneRef: MutableRefObject<(() => void) | null>,
	cursorPos: MutableRefObject<{ x: number; y: number }>,
) {
	useEffect(() => {
		const hero = heroRef.current
		const canvas = canvasRef.current
		if (!hero || !canvas) return

		// Clear any stale inline styles from HMR / previous renders
		hero.querySelectorAll<HTMLElement>(".ed-hero-title").forEach((t) => {
			t.style.visibility = ""
			t.style.transition = ""
		})

		let rafId = 0
		let physicsEngine: Matter.Engine | null = null
		let started = false
		let _onMouseDown: ((e: MouseEvent) => void) | null = null
		let _onMouseMove: ((e: MouseEvent) => void) | null = null
		let _onMouseUp: (() => void) | null = null
		let _returnFn: (() => void) | null = null

		const startPhysics = () => {
			if (started) return
			started = true
			cancelAnimationFrame(rafId)
			_returnFn = null
			canvas.style.transition = ""

			// Ensure titles are in their final revealed state before measuring.
			// Disabling transition guarantees the transform resolves synchronously.
			const titles = [...hero.querySelectorAll<HTMLElement>(".ed-hero-title")]
			titles.forEach((t) => {
				t.style.transition = "none"
				t.classList.add("ed-in")
				t.style.visibility = "visible"
			})
			void hero.offsetHeight // synchronous layout flush

			const heroRect = hero.getBoundingClientRect()
			const W = heroRect.width
			const H = heroRect.height

			const dpr = window.devicePixelRatio || 1
			canvas.width = W * dpr
			canvas.height = H * dpr
			canvas.style.width = W + "px"
			canvas.style.height = H + "px"

			// Range API: measures each character's exact viewport rect, works
			// correctly inside overflow:hidden + CSS-transformed ancestors.
			type LetterData = {
				char: string
				x: number
				y: number
				w: number
				bodyH: number
				fontSize: number
				fontWeight: string
				fontFamily: string
			}
			const letterData: LetterData[] = []

			for (const title of titles) {
				const st = getComputedStyle(title)
				const fontSize = parseFloat(st.fontSize)
				const fontWeight = st.fontWeight
				const fontFamily = st.fontFamily
				const bodyH = fontSize * 0.72

				const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT)
				let node: Node | null
				while ((node = walker.nextNode())) {
					const text = node.textContent ?? ""
					for (let i = 0; i < text.length; i++) {
						if (text[i].trim() === "") continue
						const range = document.createRange()
						range.setStart(node, i)
						range.setEnd(node, i + 1)
						const r = range.getBoundingClientRect()
						if (r.width === 0 && r.height === 0) continue
						letterData.push({
							char: text[i],
							x: r.left - heroRect.left + r.width / 2,
							y: r.top - heroRect.top + r.height / 2,
							w: Math.max(r.width, 8),
							bodyH,
							fontSize,
							fontWeight,
							fontFamily,
						})
					}
				}
			}

			// ── Matter.js ────────────────────────────────────────────────────
			physicsEngine = Matter.Engine.create({ gravity: { x: 0, y: 1.5 } })

			const bodies = letterData.map((ld) => {
				const body = Matter.Bodies.rectangle(ld.x, ld.y, Math.max(ld.w, 10), ld.bodyH, {
					restitution: 0.18,
					friction: 0.75,
					frictionAir: 0.018,
				})
				;(body as any).__ld = ld
				return body
			})

			const heroBottomEl = hero.querySelector<HTMLElement>(".ed-hero-bottom")
			const floorY = heroBottomEl ? heroBottomEl.getBoundingClientRect().top - heroRect.top : H
			const floor = Matter.Bodies.rectangle(W / 2, floorY + 30, W * 2, 60, { isStatic: true })
			const wallL = Matter.Bodies.rectangle(-35, H / 2, 70, H * 3, { isStatic: true })
			const wallR = Matter.Bodies.rectangle(W + 35, H / 2, 70, H * 3, { isStatic: true })
			Matter.Composite.add(physicsEngine.world, [...bodies, floor, wallL, wallR])

			// Apply a random initial impulse + angular velocity to each body
			// so letters scatter chaotically instead of falling in place.
			bodies.forEach((body) => {
				const vx = (Math.random() - 0.5) * 18
				const vy = (Math.random() - 0.5) * 4 - 2
				Matter.Body.setVelocity(body, { x: vx, y: vy })
				Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4)
			})

			// Swap: hide h1s, show canvas (pointer-events stays none — scroll unblocked)
			titles.forEach((t) => (t.style.visibility = "hidden"))
			// Also hide in the white-text clone so they don't show at their original positions
			cloneRef.current?.querySelectorAll<HTMLElement>(".ed-hero-title").forEach((t) => {
				t.style.visibility = "hidden"
			})
			canvas.style.opacity = "1"

			const ctx = canvas.getContext("2d")!
			ctx.scale(dpr, dpr)

			const eng = physicsEngine

			// ── Manual drag via window listeners (canvas stays pointer-events:none) ──
			let dragBody: Matter.Body | null = null
			let prevPt = { x: 0, y: 0 }
			let dragVel = { x: 0, y: 0 }

			const toHero = (e: MouseEvent) => {
				const r = hero.getBoundingClientRect()
				return { x: e.clientX - r.left, y: e.clientY - r.top }
			}

			const onMouseDown = (e: MouseEvent) => {
				const r = hero.getBoundingClientRect()
				if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
				const pt = toHero(e)
				const hit = Matter.Query.point(bodies, pt)
				if (hit.length === 0) return
				dragBody = hit[0]
				Matter.Body.setStatic(dragBody, true)
				prevPt = pt
				dragVel = { x: 0, y: 0 }
			}

			const onMouseMove = (e: MouseEvent) => {
				if (!dragBody) return
				const pt = toHero(e)
				dragVel = { x: pt.x - prevPt.x, y: pt.y - prevPt.y }
				prevPt = pt
				Matter.Body.setPosition(dragBody, pt)
				Matter.Body.setAngle(dragBody, dragBody.angle + dragVel.x * 0.008)
			}

			const onMouseUp = () => {
				if (!dragBody) return
				Matter.Body.setStatic(dragBody, false)
				Matter.Body.setVelocity(dragBody, { x: dragVel.x * 2.5, y: dragVel.y * 2.5 })
				Matter.Body.setAngularVelocity(dragBody, dragVel.x * 0.04)
				dragBody = null
			}

			_onMouseDown = onMouseDown
			_onMouseMove = onMouseMove
			_onMouseUp = onMouseUp
			window.addEventListener("mousedown", onMouseDown)
			window.addEventListener("mousemove", onMouseMove)
			window.addEventListener("mouseup", onMouseUp)

			const drawLetters = (color: string) => {
				for (const body of bodies) {
					const ld: LetterData = (body as any).__ld
					ctx.save()
					ctx.translate(body.position.x, body.position.y)
					ctx.rotate(body.angle)
					const family = ld.fontFamily.split(",")[0].replace(/['"]/g, "").trim()
					ctx.font = `${ld.fontWeight} ${ld.fontSize}px ${family}`
					ctx.fillStyle = color
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"
					ctx.fillText(ld.char, 0, 0)
					ctx.restore()
				}
			}

			const loop = () => {
				rafId = requestAnimationFrame(loop)
				Matter.Engine.update(eng, 1000 / 60)
				ctx.clearRect(0, 0, W, H)

				// Pass 1 — all letters in dark
				drawLetters("#0d0d0d")

				// Pass 2 — same letters in white, clipped to the cursor circle
				// so only the pixels inside the orange disc appear white.
				const hRect = hero.getBoundingClientRect()
				const lcx = cursorPos.current.x - hRect.left
				const lcy = cursorPos.current.y - hRect.top
				ctx.save()
				ctx.beginPath()
				ctx.arc(lcx, lcy, 26, 0, Math.PI * 2)
				ctx.clip()
				drawLetters("#fff")
				ctx.restore()
			}
			loop()

			// Capture everything needed to animate letters back to origin
			const origPos = letterData.map((ld) => ({ x: ld.x, y: ld.y }))
			_returnFn = () => {
				cancelAnimationFrame(rafId)
				bodies.forEach((b) => Matter.Body.setStatic(b, true))
				const startPos = bodies.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle }))
				const duration = 850
				const t0 = performance.now()
				const returnLoop = () => {
					const elapsed = performance.now() - t0
					const raw = Math.min(elapsed / duration, 1)
					// cubic ease-out
					const ease = 1 - Math.pow(1 - raw, 3)
					bodies.forEach((body, i) => {
						Matter.Body.setPosition(body, {
							x: startPos[i].x + (origPos[i].x - startPos[i].x) * ease,
							y: startPos[i].y + (origPos[i].y - startPos[i].y) * ease,
						})
						Matter.Body.setAngle(body, startPos[i].angle * (1 - ease))
					})
					ctx.clearRect(0, 0, W, H)
					drawLetters("#0d0d0d")
					const hRect = hero.getBoundingClientRect()
					const lcx = cursorPos.current.x - hRect.left
					const lcy = cursorPos.current.y - hRect.top
					ctx.save()
					ctx.beginPath()
					ctx.arc(lcx, lcy, 26, 0, Math.PI * 2)
					ctx.clip()
					drawLetters("#fff")
					ctx.restore()
					if (raw < 1) {
						rafId = requestAnimationFrame(returnLoop)
					} else {
						// Animation done — hide canvas, restore h1
						canvas.style.opacity = "0"
						hero.querySelectorAll<HTMLElement>(".ed-hero-title").forEach((t) => {
							t.style.visibility = "visible"
							t.style.transition = ""
						})
						cloneRef.current?.querySelectorAll<HTMLElement>(".ed-hero-title").forEach((t) => {
							t.style.visibility = "visible"
						})
					}
				}
				rafId = requestAnimationFrame(returnLoop)
			}
		}

		const resetPhysics = () => {
			if (!started) return
			started = false
			if (physicsEngine) {
				Matter.Engine.clear(physicsEngine)
				physicsEngine = null
			}
			if (_onMouseDown) window.removeEventListener("mousedown", _onMouseDown)
			if (_onMouseMove) window.removeEventListener("mousemove", _onMouseMove)
			if (_onMouseUp) window.removeEventListener("mouseup", _onMouseUp)
			_onMouseDown = null
			_onMouseMove = null
			_onMouseUp = null
			// Animate letters back to their original positions
			if (_returnFn) {
				_returnFn()
				_returnFn = null
			}
		}

		const handleScroll = () => {
			if (window.scrollY === 0) resetPhysics()
			else startPhysics()
		}
		window.addEventListener("scroll", handleScroll, { passive: true })

		return () => {
			window.removeEventListener("scroll", handleScroll)
			if (_onMouseDown) window.removeEventListener("mousedown", _onMouseDown)
			if (_onMouseMove) window.removeEventListener("mousemove", _onMouseMove)
			if (_onMouseUp) window.removeEventListener("mouseup", _onMouseUp)
			cancelAnimationFrame(rafId)
			if (physicsEngine) Matter.Engine.clear(physicsEngine)
			hero.querySelectorAll<HTMLElement>(".ed-hero-title").forEach((t) => {
				t.style.visibility = ""
				t.style.transition = ""
			})
			canvas.style.opacity = "0"
			canvas.style.transition = ""
		}
	}, [])
}
