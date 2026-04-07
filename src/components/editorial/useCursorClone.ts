import { useEffect, RefObject, MutableRefObject } from "react"

export function useCursorClone(
	ringRef: RefObject<HTMLDivElement | null>,
	dotRef: RefObject<HTMLDivElement | null>,
	cloneRef: MutableRefObject<HTMLElement | null>,
	buildCloneRef: MutableRefObject<(() => void) | null>,
	cursorPos: MutableRefObject<{ x: number; y: number }>,
) {
	useEffect(() => {
		let cx = window.innerWidth / 2,
			cy = window.innerHeight / 2
		let tx = cx,
			ty = cy
		let raf: number

		// ── Build the white-text overlay ────────────────────────────────────
		// Overlay: fixed, covers viewport, clipped to cursor circle.
		// Inner: absolute, shifted by -scrollY so clone aligns with live page.
		// Clone: deep copy of .ed-root with all text forced white, bg transparent.
		const overlay = document.createElement("div")
		overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;clip-path:circle(0px at -999px -999px);"

		const inner = document.createElement("div")
		inner.style.cssText = "position:absolute;top:0;left:0;width:100%;"
		// Note: we use `top` (not transform) so position:fixed children inside
		// the clone remain fixed to the viewport, not to the inner container.

		const buildClone = () => {
			const root = document.querySelector<HTMLElement>(".ed-root")
			if (!root) return
			inner.innerHTML = ""
			const clone = root.cloneNode(true) as HTMLElement
			clone.classList.add("ed-white-clone")
			// Force every animated element to its final visible state so the clone
			// shows all sections (including those not yet scrolled into view).
			clone.querySelectorAll<HTMLElement>(".ed-rise, .ed-fade").forEach((el) => {
				el.style.transition = "none"
				el.classList.add("ed-in")
			})
			// Strip canvas (physics) and cursor nodes from clone
			clone.querySelectorAll("canvas, .ed-cursor-ring, .ed-cursor-dot").forEach((el) => el.remove())
			inner.appendChild(clone)
			cloneRef.current = clone
		}

		buildCloneRef.current = buildClone

		overlay.appendChild(inner)
		document.body.appendChild(overlay)

		// Initial build after 2 rAFs (hero already visible)
		requestAnimationFrame(() => requestAnimationFrame(buildClone))

		// Rebuild once on first scroll: all sections are guaranteed to be in the DOM
		let rebuilt = false
		const onFirstScroll = () => {
			if (rebuilt) return
			rebuilt = true
			buildClone()
		}

		// Keep inner aligned with page scroll
		const syncScroll = () => {
			onFirstScroll()
			inner.style.top = -window.scrollY + "px"
		}
		window.addEventListener("scroll", syncScroll, { passive: true })
		syncScroll()

		// ── Mouse + render loop ──────────────────────────────────────────────
		const onMove = (e: MouseEvent) => {
			tx = e.clientX
			ty = e.clientY
		}
		window.addEventListener("mousemove", onMove)

		const loop = () => {
			cx += (tx - cx) * 0.12
			cy += (ty - cy) * 0.12
			cursorPos.current = { x: cx, y: cy }
			if (ringRef.current) ringRef.current.style.transform = `translate(${cx - 26}px, ${cy - 26}px)`
			if (dotRef.current) dotRef.current.style.transform = `translate(${tx - 2}px, ${ty - 2}px)`
			// Clip the white-text overlay to the cursor circle (lagged position)
			overlay.style.clipPath = `circle(26px at ${cx}px ${cy}px)`

			// Sync hover state of .ed-link to clone so the underline is visible inside the cursor
			if (cloneRef.current) {
				const el = document.elementFromPoint(Math.round(cx), Math.round(cy))
				const hoveredLink = el?.closest<HTMLElement>(".ed-link") ?? null
				const allLinks = [...document.querySelectorAll<HTMLElement>(".ed-link")]
				const cloneLinks = cloneRef.current.querySelectorAll<HTMLElement>(".ed-link")
				cloneLinks.forEach((cl) => cl.classList.remove("ed-link-hover"))
				if (hoveredLink) {
					const idx = allLinks.indexOf(hoveredLink)
					if (idx >= 0 && cloneLinks[idx]) cloneLinks[idx].classList.add("ed-link-hover")
				}
			}

			raf = requestAnimationFrame(loop)
		}
		loop()

		return () => {
			window.removeEventListener("mousemove", onMove)
			window.removeEventListener("scroll", syncScroll)
			cancelAnimationFrame(raf)
			overlay.remove()
		}
	}, [])
}
