import { useEffect, useRef, useState } from "react"
import "./editorial.css"
import { useCursorClone } from "./useCursorClone"
import { useHeroPhysics } from "./useHeroPhysics"
import { useContactPhysics } from "./useContactPhysics"
import { ProjectsSection } from "./ProjectsSection"
import { ContactSection } from "./ContactSection"

export default function EditorialPortfolio() {
	const ringRef = useRef<HTMLDivElement>(null)
	const dotRef = useRef<HTMLDivElement>(null)
	const heroRef = useRef<HTMLElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const contactTagsRef = useRef<HTMLDivElement>(null)
	// Shared with physics loop: lagged cursor pos + reference to white clone
	const cloneRef = useRef<HTMLElement | null>(null)
	const buildCloneRef = useRef<(() => void) | null>(null)
	const [openProj, setOpenProj] = useState<string | null>(null)
	// Lagged cursor position shared with the physics canvas loop
	const cursorPos = useRef({ x: -999, y: -999 })

	// Lag cursor + white-text reveal (clip-path on a DOM clone)
	useCursorClone(ringRef, dotRef, cloneRef, buildCloneRef, cursorPos)

	// ── Letter-fall physics ───────────────────────────────────────────────────
	useHeroPhysics(heroRef, canvasRef, cloneRef, buildCloneRef, cursorPos)

	// ── Contact tags physics ─────────────────────────────────────────────────
	useContactPhysics(contactTagsRef)

	// Scroll reveal via IntersectionObserver
	useEffect(() => {
		const obs = new IntersectionObserver(
			(entries) =>
				entries.forEach((e) => {
					if (!e.isIntersecting) return
					// .ed-clip containers: their .ed-rise children are clipped (transform outside overflow),
					// so the observer never sees them as visible. Observe the clip wrapper instead.
					if (e.target.classList.contains("ed-clip")) {
						e.target.querySelectorAll(".ed-rise").forEach((el) => el.classList.add("ed-in"))
					} else {
						e.target.classList.add("ed-in")
					}
					obs.unobserve(e.target)
				}),
			{ threshold: 0.1 },
		)
		document.querySelectorAll(".ed-clip, .ed-fade").forEach((el) => obs.observe(el))
		return () => obs.disconnect()
	}, [])

	return (
		<div className="ed-root">
			{/* Cursor */}
			<div className="ed-cursor-ring" ref={ringRef} />
			<div className="ed-cursor-dot" ref={dotRef} />

			{/* Nav */}
			<nav className="ed-nav">
				<span className="ed-nav-logo">CD_</span>
				<div className="ed-nav-links">
					<a href="#" className="ed-link">
						Index
					</a>
					<a href="#projects" className="ed-link">
						Projects
					</a>
					<a href="#about" className="ed-link">
						About
					</a>
					<a href="#contact" className="ed-link">
						[Contact]
					</a>
				</div>
			</nav>

			{/* ── Hero ── */}
			<section className="ed-hero" ref={heroRef} style={{ position: "relative", overflow: "hidden" }}>
				<canvas ref={canvasRef} className="ed-physics-canvas" />

				<div className="ed-clip" style={{ lineHeight: 1, position: "relative", zIndex: 1 }}>
					<h1 className="ed-rise ed-hero-title">CD_</h1>
				</div>

				<div className="ed-clip" style={{ lineHeight: 1, position: "relative", zIndex: 1, paddingBottom: "clamp(18px, 2.5vw, 48px)" }}>
					<h1 className="ed-rise ed-hero-title">Creative Fullstack Developer</h1>
				</div>

				<div className="ed-hero-bottom" style={{ position: "relative", zIndex: 1 }}>
					<div className="ed-fade ed-d1 ed-hero-desc">
						<span>Clément Deguelle</span>
						<span>Based in France</span>
						<span>©2025</span>
					</div>
					<div className="ed-fade ed-d2 ed-hero-scroll">
						<span>Scroll to Explore</span>
						<span className="ed-scroll-arr">↓</span>
					</div>
				</div>

				<span
					aria-hidden="true"
					style={{
						position: "absolute",
						bottom: 132,
						right: 40,
						fontSize: 10,
						color: "#f0ede6",
						userSelect: "none",
						pointerEvents: "none",
						fontFamily: "'Space Grotesk', sans-serif",
						zIndex: 2,
						letterSpacing: "0.14em",
					}}
				>
					// access: hrmtfozirgb
				</span>
			</section>

			<div className="ed-rule" />

			{/* ── About ── */}
			<section id="about" className="ed-section">
				<div className="ed-sec-head ed-fade">
					<span className="ed-sec-num">[01]</span>
					<span className="ed-sec-label">About</span>
				</div>

				<div className="ed-about-grid">
					<div>
						<div className="ed-clip">
							<p className="ed-rise ed-about-p">
								This portfolio delves into a contemporary approach to web engineering &amp; creative development. Drawing from both technical precision and
								aesthetic sensibility, we build interfaces at the crossroads of code<span className="ed-fn">[*]</span> and design.
							</p>
						</div>
						<div className="ed-clip">
							<p className="ed-rise ed-d1 ed-about-p">
								By pushing what browsers<span className="ed-fn">[**]</span> can render, we craft memorable digital experiences that blend animation, 3D and
								interaction into coherent products.
							</p>
						</div>
						<div className="ed-clip">
							<p className="ed-rise ed-d2 ed-about-p" style={{ marginBottom: 20 }}>
								Always curious, always experimenting<span className="ed-fn">[***]</span>.
							</p>
						</div>
						<div className="ed-fade ed-d3 ed-footnotes">
							<p>[*] — React · TypeScript · Next.js · Vite · React Native · Expo</p>
							<p>[**] — Three.js · GLSL · WebGL · Canvas API · GSAP · ScrollTrigger</p>
							<p>[***] — Node.js · Express · MongoDB · PostgreSQL · Docker · Figma</p>
						</div>
					</div>

					<div className="ed-fade ed-d1 ed-meta-col">
						<div className="ed-meta-item">
							<span className="ed-meta-lbl">Role</span>
							<span className="ed-meta-val">Creative Fullstack Developer</span>
						</div>
						<div className="ed-meta-item">
							<span className="ed-meta-lbl">Location</span>
							<span className="ed-meta-val">France</span>
						</div>
						<div className="ed-meta-item">
							<span className="ed-meta-lbl">Available</span>
							<span className="ed-meta-val">Open to opportunities</span>
						</div>
						<div className="ed-meta-item">
							<span className="ed-meta-lbl">Main tool</span>
							<span className="ed-meta-val">
								<a href="https://github.com/cdeguelle" target="_blank" className="ed-link ed-meta-val">
									github.com/cdeguelle
								</a>
							</span>
						</div>
					</div>
				</div>
			</section>

			<div className="ed-rule" />

			{/* ── Projects ── */}
			<ProjectsSection openProj={openProj} setOpenProj={setOpenProj} buildCloneRef={buildCloneRef} />

			{/* ── CV split ── */}
			<div className="ed-split">
				<div className="ed-clip" style={{ alignSelf: "end", paddingBottom: "clamp(12px, 2vw, 36px)" }}>
					<p className="ed-rise ed-split-title">
						Clément
						<br />
						Deguelle
					</p>
				</div>
				<div className="ed-cv-cols ed-fade ed-d1">
					{/* Education */}
					<div>
						<p className="ed-cv-col-label">Education</p>
						<div className="ed-cv-entries">
							<div className="ed-cv-entry">
								<span className="ed-cv-title">Software Engineering Expert</span>
								<span className="ed-cv-org">Campus Ynov</span>
								<span className="ed-cv-date">2023 — 2025</span>
							</div>
							<div className="ed-cv-entry">
								<span className="ed-cv-title">Application Developer Designer</span>
								<span className="ed-cv-org">École O'Clock</span>
								<span className="ed-cv-date">2022 — 2023</span>
							</div>
							<div className="ed-cv-entry">
								<span className="ed-cv-title">Application Developer</span>
								<span className="ed-cv-org">OpenClassrooms</span>
								<span className="ed-cv-date">2020 — 2021</span>
							</div>
						</div>
					</div>
					{/* Experience */}
					<div>
						<p className="ed-cv-col-label">Experience</p>
						<div className="ed-cv-entries">
							<div className="ed-cv-entry">
								<span className="ed-cv-title">Fullstack Developer</span>
								<span className="ed-cv-org">Obspher</span>
								<span className="ed-cv-date">2023 — now</span>
								<p className="ed-cv-desc">
									Built a mobile app for managing delivery driver schedules — route planning, absence and leave tracking, live statistics and event management.
								</p>
							</div>
							<div className="ed-cv-entry">
								<span className="ed-cv-title">Mobile Developer</span>
								<span className="ed-cv-org">Innovia</span>
								<span className="ed-cv-date">2021 — 2023</span>
								<p className="ed-cv-desc">
									Developed a vehicle fleet management tool for a freight company — backend, database, web interface and mobile application.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="ed-rule" />

			{/* ── Contact ── */}
			<ContactSection contactTagsRef={contactTagsRef} />

			{/* ── Footer ── */}
			<footer className="ed-footer">
				<span>React × Three.js × TypeScript</span>
				<span>Clément Deguelle ©2025</span>
			</footer>
		</div>
	)
}
