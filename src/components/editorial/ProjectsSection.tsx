import { MutableRefObject } from "react"
import { MapContent } from "../portfolio/windows/MapContent"
import { DiscordContent } from "../portfolio/windows/DiscordContent"
import { PROJECTS, SCROLL_IMGS } from "./constants"

interface ProjectsSectionProps {
	openProj: string | null
	setOpenProj: (val: string | null) => void
	buildCloneRef: MutableRefObject<(() => void) | null>
}

export function ProjectsSection({ openProj, setOpenProj, buildCloneRef }: ProjectsSectionProps) {
	return (
		<section id="projects" className="ed-section">
			<div className="ed-sec-head ed-fade">
				<span className="ed-sec-num">[02]</span>
				<span className="ed-sec-label">Projects</span>
			</div>

			<div className="ed-projects-list">
				{PROJECTS.map((p, i) => {
					const isOpen = openProj === p.num
					return (
						// Wrapper carries open state — ed-proj className never changes
						// so React never overwrites the ed-in class added by IntersectionObserver
						<div key={p.num} className={`ed-proj-wrapper${isOpen ? " ed-proj-open" : ""}`}>
							{/* ── Row ── */}
							<div
								className={`ed-proj ed-fade ed-d${i + 1}`}
								onClick={() => {
									const nextOpen = isOpen ? null : p.num
									setOpenProj(nextOpen)
									if (nextOpen) {
										const section = document.getElementById("projects")
										if (section) {
											const top = section.getBoundingClientRect().top + window.scrollY - 63
											window.scrollTo({ top, behavior: "smooth" })
										}
									}
									setTimeout(() => buildCloneRef.current?.(), 700)
								}}
							>
								<span className="ed-proj-num">{p.num}</span>
								<div className="ed-proj-main">
									<span className="ed-proj-name">{p.name}</span>
									<div className="ed-tags">
										{p.tags.map((t) => (
											<span key={t} className="ed-tag">
												{t}
											</span>
										))}
									</div>
								</div>
								<span className="ed-proj-year">{p.year}</span>
								<span className="ed-proj-arr">→</span>
							</div>

							{/* ── Dropdown panel ── */}
							<div className={`ed-proj-panel${isOpen ? " ed-proj-open" : ""}`}>
								<div className="ed-proj-panel-inner">
									{/* E03: full-height iframe, no sidebar */}
									{p.num === "E03" ? (
										<div className="ed-proj-panel-body--iframe">
											{isOpen && (
												<iframe
													src="https://le-petit-crocus-8opa-lvima3fq8-cdeguelles-projects.vercel.app/"
													title="Le Petit Crocus"
													allow="fullscreen"
												/>
											)}
										</div>
									) : (
										<div className="ed-proj-panel-body">
											{/* Left: description + meta */}
											<div className="ed-proj-panel-left">
												<p className="ed-proj-panel-desc">{p.desc}</p>
												{p.num === "E04" && (
													<>
														<p className="ed-discord-desc">
															Built to manage a growing Discord community. Handles day-to-day moderation autonomously, responds to custom triggers
															and slash commands, streams audio from YouTube, and assigns roles based on member activity metrics.
														</p>
														<div className="ed-discord-feature-list">
															<span className="ed-discord-feature">Moderation — auto-kick, mute, ban with configurable thresholds</span>
															<span className="ed-discord-feature">Music — YouTube queue, skip, volume, playlist support</span>
															<span className="ed-discord-feature">Role engine — activity-based tier promotion</span>
															<span className="ed-discord-feature">Slash commands — fully documented, 30+ commands</span>
														</div>
													</>
												)}
												<div className="ed-proj-panel-meta">
													<div className="ed-proj-panel-meta-item">
														<span className="ed-proj-panel-lbl">Year</span>
														<span className="ed-proj-panel-val">{p.year}</span>
													</div>
													<div className="ed-proj-panel-meta-item">
														<span className="ed-proj-panel-lbl">Role</span>
														<span className="ed-proj-panel-val">{p.role}</span>
													</div>
													<div className="ed-proj-panel-meta-item">
														<span className="ed-proj-panel-lbl">Stack</span>
														<span className="ed-proj-panel-val">{p.tags.join(" · ")}</span>
													</div>
													{p.link && (
														<a href={p.link} target="_blank" rel="noreferrer" className="ed-proj-panel-link">
															Visit site ↗
														</a>
													)}
												</div>
											</div>
											{/* Right: visual */}
											<div className="ed-proj-panel-visual">
												{isOpen && p.num === "E01" && (
													<div className="ed-screenshots-grid">
														{SCROLL_IMGS.map((src, si) => (
															<div key={si} className="ed-screenshot-card">
																<img src={src} alt={`Mobile App screenshot ${si + 1}`} draggable={false} />
																<span className="ed-screenshot-cap">[0{si + 1}]</span>
															</div>
														))}
													</div>
												)}
												{isOpen && p.num === "E02" && (
													<div className="ed-map-visual" style={{ width: "100%", height: "100%" }}>
														<MapContent theme="editorial" />
													</div>
												)}
												{isOpen && p.num === "E04" && <DiscordContent />}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}
