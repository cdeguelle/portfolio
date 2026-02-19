import { useState, useEffect, useRef, useCallback } from "react"
import computerIcon from "../assets/computer.png"
import folderIcon from "../assets/directory.png"
import mailIcon from "../assets/mail.png"
import notePadIcon from "../assets/notepad.png"
import windowsIcon from "../assets/windows.png"
import consoleIcon from "../assets/console.png"
import stopIcon from "../assets/stop.png"
import githubIcon from "../assets/github.png"
import linkedinIcon from "../assets/linkedin.jpg"
import diskSpaceIcon from "../assets/disk_space.png"
import speakerIcon from "../assets/speaker.png"

const isImg = (s: string) => s.startsWith("/") || s.startsWith("data:") || s.startsWith("blob:")

// ─── Types ────────────────────────────────────────────────────────────────
type Position = { x: number; y: number }
type WinId = "projects" | "about" | "contact" | "computer"

interface WinMeta {
	id: WinId
	title: string
	icon: string
	width: number
}

// ─── Window definitions ───────────────────────────────────────────────────
const WIN_META: WinMeta[] = [
	{ id: "projects", title: "My Projects - Windows Explorer", icon: folderIcon, width: 580 },
	{ id: "about", title: "About - Notepad", icon: notePadIcon, width: 440 },
	{ id: "contact", title: "Contact", icon: mailIcon, width: 380 },
	{ id: "computer", title: "My Computer", icon: computerIcon, width: 440 },
]

const DESKTOP_ICONS: { id: WinId; label: string; icon: string }[] = [
	{ id: "computer", label: "My\nComputer", icon: computerIcon },
	{ id: "projects", label: "My Projects", icon: folderIcon },
	{ id: "about", label: "About", icon: notePadIcon },
	{ id: "contact", label: "Contact", icon: mailIcon },
]

const INITIAL_POS: Record<WinId, Position> = {
	projects: { x: 100, y: 30 },
	about: { x: 200, y: 50 },
	contact: { x: 280, y: 70 },
	computer: { x: 140, y: 40 },
}

// ─── Win95 shared styles ──────────────────────────────────────────────────
const raised = {
	borderStyle: "solid" as const,
	borderWidth: 2,
	borderTopColor: "#ffffff",
	borderLeftColor: "#ffffff",
	borderRightColor: "#808080",
	borderBottomColor: "#808080",
}

const sunken = {
	borderStyle: "solid" as const,
	borderWidth: 2,
	borderTopColor: "#808080",
	borderLeftColor: "#808080",
	borderRightColor: "#ffffff",
	borderBottomColor: "#ffffff",
}

const BG = "#c0c0c0"
const FONT = '"MS Sans Serif", Tahoma, Geneva, sans-serif'

// ─── Control Button ───────────────────────────────────────────────────────
function CtrlBtn({ label, onClick, disabled }: { label: string; onClick?: () => void; disabled?: boolean }) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			style={{
				width: 16,
				height: 14,
				...raised,
				background: BG,
				cursor: disabled ? "default" : "pointer",
				fontSize: 10,
				fontFamily: FONT,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 0,
				lineHeight: 1,
				opacity: disabled ? 0.4 : 1,
				flexShrink: 0,
			}}
		>
			{label}
		</button>
	)
}

// ─── Draggable Window ─────────────────────────────────────────────────────
function Window95({
	meta,
	children,
	position,
	onMove,
	onClose,
	onMinimize,
	onFocus,
	zIndex,
	isActive,
}: {
	meta: WinMeta
	children: React.ReactNode
	position: Position
	onMove: (p: Position) => void
	onClose: () => void
	onMinimize: () => void
	onFocus: () => void
	zIndex: number
	isActive: boolean
}) {
	const dragging = useRef(false)
	const offset = useRef<Position>({ x: 0, y: 0 })

	const onTitleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if ((e.target as HTMLElement).tagName === "BUTTON") return
			dragging.current = true
			offset.current = { x: e.clientX - position.x, y: e.clientY - position.y }
			onFocus()

			const move = (ev: MouseEvent) => {
				if (!dragging.current) return
				onMove({
					x: Math.max(0, Math.min(window.innerWidth - meta.width, ev.clientX - offset.current.x)),
					y: Math.max(0, Math.min(window.innerHeight - 80, ev.clientY - offset.current.y)),
				})
			}
			const up = () => {
				dragging.current = false
				document.removeEventListener("mousemove", move)
				document.removeEventListener("mouseup", up)
			}
			document.addEventListener("mousemove", move)
			document.addEventListener("mouseup", up)
		},
		[position, meta.width, onMove, onFocus],
	)

	return (
		<div
			onMouseDown={onFocus}
			style={{
				position: "absolute",
				left: position.x,
				top: position.y,
				width: meta.width,
				zIndex,
				...raised,
				boxShadow: "2px 2px 0 #000000",
				background: BG,
				userSelect: "none",
			}}
		>
			{/* Title bar */}
			<div
				onMouseDown={onTitleMouseDown}
				style={{
					background: isActive ? "linear-gradient(to right, #000080, #1084d0)" : "linear-gradient(to right, #7b7b7b, #a8a8a8)",
					display: "flex",
					alignItems: "center",
					padding: "2px 4px",
					cursor: "move",
					gap: 4,
					height: 22,
				}}
			>
				<img src={meta.icon} width={16} height={16} style={{ pointerEvents: "none", flexShrink: 0 }} />
				<span
					style={{
						flex: 1,
						color: "white",
						fontSize: 11,
						fontWeight: "bold",
						fontFamily: FONT,
						pointerEvents: "none",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{meta.title}
				</span>
				<div style={{ display: "flex", gap: 2 }}>
					<CtrlBtn label="─" onClick={onMinimize} />
					<CtrlBtn label="□" disabled />
					<CtrlBtn label="✕" onClick={onClose} />
				</div>
			</div>

			{/* Menu bar */}
			<div
				style={{
					padding: "2px 4px",
					borderBottom: "1px solid #808080",
					fontSize: 11,
					fontFamily: FONT,
					display: "flex",
					gap: 0,
				}}
			>
				{["File", "Edit", "View", "Help"].map((m) => (
					<span
						key={m}
						style={{
							padding: "1px 8px",
							cursor: "default",
							display: "inline-block",
						}}
					>
						{m}
					</span>
				))}
			</div>

			{/* Content area */}
			<div
				style={{
					margin: 4,
					...sunken,
					background: "#ffffff",
					padding: 8,
					maxHeight: 380,
					overflowY: "auto",
					fontSize: 11,
					fontFamily: FONT,
				}}
			>
				{children}
			</div>

			{/* Status bar */}
			<div
				style={{
					padding: "2px 8px",
					fontSize: 10,
					fontFamily: FONT,
					display: "flex",
					gap: 8,
				}}
			>
				<div style={{ ...sunken, padding: "0 8px", flex: 1, fontSize: 10 }}>Ready</div>
				<div style={{ ...sunken, padding: "0 8px", width: 80, fontSize: 10 }}>1 object</div>
			</div>
		</div>
	)
}

// ─── Desktop Icon ─────────────────────────────────────────────────────────
function DesktopIcon({ label, icon, onOpen }: { label: string; icon: string; onOpen: () => void }) {
	const [selected, setSelected] = useState(false)
	const clickCount = useRef(0)
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

	const handleClick = () => {
		clickCount.current++
		setSelected(true)
		clearTimeout(timer.current)
		if (clickCount.current >= 2) {
			clickCount.current = 0
			setSelected(false)
			onOpen()
		} else {
			timer.current = setTimeout(() => {
				clickCount.current = 0
			}, 400)
		}
	}

	const handleBlur = () => setSelected(false)

	return (
		<div
			onClick={handleClick}
			onBlur={handleBlur}
			tabIndex={0}
			style={{
				width: 76,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 4,
				cursor: "default",
				padding: "6px 4px",
				outline: "none",
			}}
		>
			<div style={{ filter: selected ? "brightness(0.5)" : "none" }}>
				<img src={icon} width={32} height={32} style={{ display: "block", imageRendering: "pixelated" }} />
			</div>
			<div
				style={{
					color: "white",
					fontSize: 11,
					textAlign: "center",
					fontFamily: FONT,
					background: selected ? "#000080" : "transparent",
					padding: "1px 3px",
					textShadow: selected ? "none" : "1px 1px 2px #000000",
					lineHeight: 1.3,
					whiteSpace: "pre-wrap",
					wordBreak: "break-word",
					maxWidth: 72,
				}}
			>
				{label}
			</div>
		</div>
	)
}

// ─── Start Menu ───────────────────────────────────────────────────────────
function StartMenu({ onOpenWindow, onBack, onClose }: { onOpenWindow: (id: WinId) => void; onBack: () => void; onClose: () => void }) {
	const items: { icon: string; label: string; action: () => void; dividerBefore?: boolean }[] = [
		{ icon: folderIcon, label: "My Projects", action: () => onOpenWindow("projects") },
		{ icon: notePadIcon, label: "About", action: () => onOpenWindow("about") },
		{ icon: mailIcon, label: "Contact", action: () => onOpenWindow("contact") },
		{ icon: computerIcon, label: "My Computer", action: () => onOpenWindow("computer") },
		{ icon: consoleIcon, label: "Back to terminal", action: onBack, dividerBefore: true },
		{ icon: stopIcon, label: "Shut Down...", action: onBack, dividerBefore: false },
	]

	return (
		<>
			<div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={onClose} />
			<div
				style={{
					position: "fixed",
					bottom: 38,
					left: 2,
					zIndex: 999,
					width: 220,
					...raised,
					background: BG,
					boxShadow: "2px 2px 0 #000000",
					display: "flex",
				}}
			>
				{/* Side banner */}
				<div
					style={{
						width: 26,
						background: "linear-gradient(to top, #000080, #808080)",
						display: "flex",
						alignItems: "flex-end",
						justifyContent: "center",
						paddingBottom: 8,
						flexShrink: 0,
					}}
				>
					<span
						style={{
							transform: "rotate(-90deg)",
							fontSize: 11,
							fontFamily: FONT,
							fontWeight: "bold",
							color: "#c0c0c0",
							whiteSpace: "nowrap",
							letterSpacing: 1,
							paddingLeft: 90,
						}}
					>
						Clément Deguelle
					</span>
				</div>

				{/* Items */}
				<div style={{ flex: 1, padding: "2px 0" }}>
					{items.map((item, i) => (
						<div key={i}>
							{item.dividerBefore && (
								<div
									style={{
										borderTop: "1px solid #808080",
										borderBottom: "1px solid #ffffff",
										margin: "4px 0",
									}}
								/>
							)}
							<StartMenuItem
								icon={item.icon}
								label={item.label}
								onClick={() => {
									item.action()
									onClose()
								}}
							/>
						</div>
					))}
				</div>
			</div>
		</>
	)
}

function StartMenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
	const [hovered, setHovered] = useState(false)
	return (
		<div
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "5px 10px",
				cursor: "default",
				fontSize: 11,
				fontFamily: FONT,
				background: hovered ? "#000080" : "transparent",
				color: hovered ? "#ffffff" : "#000000",
			}}
		>
			{isImg(icon) ? <img src={icon} width={18} height={18} /> : <span style={{ fontSize: 18 }}>{icon}</span>}
			<span>{label}</span>
		</div>
	)
}

// ─── Window Contents ──────────────────────────────────────────────────────
const projects = [
	{
		title: "Mobile app",
		description: "Mobile application for schedule management & creation of new events",
		tags: ["React Native", "TypeScript", "Expo"],
	},
	{
		title: "3D isometric & interactive map",
		description: "Interactive 3D map with animations & 3D effects",
		tags: ["Three.js", "WebGL", "React"],
	},
	{
		title: "Website for restaurant 'le petit crocus'",
		description: "Website for restaurant 'le petit crocus'",
		tags: ["Typescript", "Next.js"],
	},
	{
		title: "Discord bot",
		description: "Discord bot for community management",
		tags: ["Javascript", "Discord.js"],
	},
]

function ProjectsContent() {
	return (
		<div>
			{/* Toolbar */}
			<div
				style={{
					display: "flex",
					gap: 2,
					marginBottom: 8,
					paddingBottom: 6,
					borderBottom: "1px solid #c0c0c0",
				}}
			>
				{["Details", "Icons", "List"].map((v) => (
					<button
						key={v}
						style={{
							...raised,
							background: BG,
							padding: "1px 8px",
							fontSize: 10,
							fontFamily: FONT,
							cursor: "pointer",
						}}
					>
						{v}
					</button>
				))}
			</div>
			{/* Header row */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 160px 130px",
					gap: 0,
					fontWeight: "bold",
					fontSize: 11,
					marginBottom: 2,
				}}
			>
				{["Name", "Description", "Technologies"].map((h) => (
					<div
						key={h}
						style={{
							...raised,
							background: BG,
							padding: "2px 6px",
							cursor: "default",
						}}
					>
						{h}
					</div>
				))}
			</div>
			{/* Project rows */}
			{projects.map((p, i) => (
				<div
					key={i}
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 160px 130px",
						gap: 0,
						background: i % 2 === 0 ? "#ffffff" : "#f4f4f4",
						cursor: "default",
					}}
				>
					<div style={{ padding: "4px 6px", display: "flex", alignItems: "center", gap: 6 }}>
						<img src={folderIcon} width={16} height={16} />
						<span style={{ color: "#000080", fontWeight: "bold", fontSize: 11 }}>{p.title}</span>
					</div>
					<div style={{ padding: "4px 6px", fontSize: 11 }}>{p.description}</div>
					<div style={{ padding: "4px 6px", display: "flex", flexWrap: "wrap", gap: 2 }}>
						{p.tags.map((t) => (
							<span
								key={t}
								style={{
									...raised,
									background: BG,
									padding: "0 4px",
									fontSize: 9,
									fontFamily: FONT,
								}}
							>
								{t}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	)
}

function AboutContent() {
	return (
		<div style={{ lineHeight: 1.7, fontSize: 12, fontFamily: '"Courier New", monospace' }}>
			<div
				style={{
					marginBottom: 12,
					paddingBottom: 8,
					borderBottom: "1px solid #c0c0c0",
					fontFamily: FONT,
					fontWeight: "bold",
					fontSize: 13,
				}}
			>
				👋 Clément Deguelle — Creative fullstack developer
			</div>
			<p style={{ marginBottom: 10 }}>
				Fullstack developer passionate about creative interfaces and interactive experiences. I work with React, TypeScript, WebGL and everything that pushes the boundaries of the web.
			</p>
			<p style={{ marginBottom: 10 }}>I love building weird, effective and memorable web experiences, at the crossroads of code, design and interaction.</p>
			<p style={{ marginBottom: 12 }}>Always curious, always experimenting.</p>
			<div
				style={{
					...sunken,
					background: "#f8f8f8",
					padding: 10,
					fontFamily: FONT,
				}}
			>
				<div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 11 }}>🛠 Tech stack:</div>
				{[
					["Frontend", "React · TypeScript · Next.js · Vite · React Native · Expo"],
					["3D / WebGL", "Three.js · GLSL · WebGL"],
					["Animation", "GSAP · ScrollTrigger · Canvas API"],
					["Backend", "Node.js · Express · MongoDB · PostgreSQL · MySQL · Firebase"],
					["DevOps", "Docker · CI/CD"],
					["UI/UX", "Figma"],
				].map(([cat, techs]) => (
					<div key={cat} style={{ marginBottom: 4, fontSize: 11 }}>
						<span style={{ fontWeight: "bold", color: "#000080" }}>{cat} : </span>
						{techs}
					</div>
				))}
			</div>
		</div>
	)
}

function ContactContent() {
	const links = [
		{ icon: mailIcon, label: "Email", value: "clement.deguelle@hotmail.com", href: "mailto:clement.deguelle@hotmail.com" },
		{ icon: githubIcon, label: "GitHub", value: "github.com/cdeguelle", href: "https://github.com/cdeguelle" },
		{ icon: linkedinIcon, label: "LinkedIn", value: "linkedin.com/in/clement-deguelle", href: "https://linkedin.com/in/clement-deguelle" },
	]
	return (
		<div>
			<p style={{ marginBottom: 12, fontFamily: FONT, fontSize: 11 }}>Feel free to reach out for any project or collaboration!</p>
			{links.map(({ icon, label, value, href }) => (
				<div
					key={label}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 8,
						padding: 8,
						...sunken,
						background: "#f8f8f8",
						cursor: "default",
					}}
				>
					<span style={{ fontSize: 24 }}>
						<img src={icon} width={24} height={24} />
					</span>
					<div>
						<div style={{ fontWeight: "bold", color: "#000080", fontSize: 11, fontFamily: FONT }}>{label}</div>
						<a href={href} target="_blank" style={{ color: "#0000cc", textDecoration: "underline", fontSize: 11, fontFamily: FONT }}>
							{value}
						</a>
					</div>
				</div>
			))}
		</div>
	)
}

function ComputerContent() {
	const drives = [
		{ icon: diskSpaceIcon, name: "Drive C: — Frontend", skills: "React · TypeScript · Next.js · Vite · React Native", level: 95 },
		{ icon: diskSpaceIcon, name: "Drive D: — 3D / WebGL", skills: "Three.js · GLSL · WebGL", level: 57 },
		{ icon: diskSpaceIcon, name: "Drive E: — Animation", skills: "GSAP · Canvas · Framer", level: 65 },
		{ icon: diskSpaceIcon, name: "Drive F: — Tools", skills: "Git · Expo · Vercel · Figma", level: 83 },
	]
	return (
		<div>
			<div
				style={{
					fontWeight: "bold",
					marginBottom: 12,
					fontSize: 13,
					fontFamily: FONT,
					display: "flex",
					alignItems: "center",
					gap: 6,
				}}
			>
				<img src={computerIcon} width={16} height={16} /> Clément OS v1.0 — System Skills
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
				{drives.map((d) => (
					<div
						key={d.name}
						style={{
							...sunken,
							background: "#f0f0f0",
							padding: 10,
							cursor: "default",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 6,
								fontWeight: "bold",
								fontSize: 11,
								fontFamily: FONT,
								marginBottom: 4,
							}}
						>
							<span style={{ fontSize: 22 }}>
								<img src={d.icon} width={16} height={16} />
							</span>
							<span>{d.name}</span>
						</div>
						<div style={{ fontSize: 10, color: "#555", fontFamily: FONT, marginBottom: 6 }}>{d.skills}</div>
						<div style={{ ...sunken, background: "#ffffff", height: 10, position: "relative" }}>
							<div
								style={{
									position: "absolute",
									inset: 0,
									width: `${d.level}%`,
									background: "linear-gradient(to right, #000080, #0080ff)",
								}}
							/>
						</div>
						<div style={{ fontSize: 9, marginTop: 3, fontFamily: FONT, color: "#333" }}>Mastery: {d.level}%</div>
					</div>
				))}
			</div>
		</div>
	)
}

function getContent(id: WinId) {
	switch (id) {
		case "projects":
			return <ProjectsContent />
		case "about":
			return <AboutContent />
		case "contact":
			return <ContactContent />
		case "computer":
			return <ComputerContent />
	}
}

// ─── Main Portfolio ───────────────────────────────────────────────────────
type Props = {
	onBack: () => void
}

export default function Portfolio({ onBack }: Props) {
	const [openWindows, setOpenWindows] = useState<WinId[]>([])
	const [minimized, setMinimized] = useState<Set<WinId>>(new Set())
	const [positions, setPositions] = useState<Record<WinId, Position>>(INITIAL_POS)
	const [startOpen, setStartOpen] = useState(false)
	const [time, setTime] = useState(new Date())

	useEffect(() => {
		const t = setInterval(() => setTime(new Date()), 1000)
		return () => clearInterval(t)
	}, [])

	const openWindow = useCallback((id: WinId) => {
		setOpenWindows((prev) => (prev.includes(id) ? [...prev.filter((w) => w !== id), id] : [...prev, id]))
		setMinimized((prev) => {
			const n = new Set(prev)
			n.delete(id)
			return n
		})
		setStartOpen(false)
	}, [])

	const closeWindow = useCallback((id: WinId) => {
		setOpenWindows((prev) => prev.filter((w) => w !== id))
		setMinimized((prev) => {
			const n = new Set(prev)
			n.delete(id)
			return n
		})
	}, [])

	const minimizeWindow = useCallback((id: WinId) => {
		setMinimized((prev) => new Set([...prev, id]))
	}, [])

	const focusWindow = useCallback((id: WinId) => {
		setOpenWindows((prev) => [...prev.filter((w) => w !== id), id])
		setMinimized((prev) => {
			const n = new Set(prev)
			n.delete(id)
			return n
		})
	}, [])

	const setPosition = useCallback((id: WinId, pos: Position) => {
		setPositions((prev) => ({ ...prev, [id]: pos }))
	}, [])

	const activeWindow = openWindows.filter((id) => !minimized.has(id)).at(-1)

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				background: "#008080",
				position: "relative",
				overflow: "hidden",
				fontFamily: FONT,
			}}
		>
			{/* Desktop Icons */}
			<div
				style={{
					position: "absolute",
					top: 10,
					left: 10,
					display: "flex",
					flexDirection: "column",
					gap: 4,
				}}
			>
				{DESKTOP_ICONS.map((icon) => (
					<DesktopIcon key={icon.id} label={icon.label} icon={icon.icon} onOpen={() => openWindow(icon.id)} />
				))}
			</div>

			{/* Windows */}
			{openWindows.map((id) => {
				const meta = WIN_META.find((m) => m.id === id)
				if (!meta || minimized.has(id)) return null
				return (
					<Window95
						key={id}
						meta={meta}
						position={positions[id]}
						onMove={(pos) => setPosition(id, pos)}
						onClose={() => closeWindow(id)}
						onMinimize={() => minimizeWindow(id)}
						onFocus={() => focusWindow(id)}
						zIndex={openWindows.indexOf(id) + 10}
						isActive={activeWindow === id}
					>
						{getContent(id)}
					</Window95>
				)
			})}

			{/* Start Menu */}
			{startOpen && <StartMenu onOpenWindow={openWindow} onBack={onBack} onClose={() => setStartOpen(false)} />}

			{/* Taskbar */}
			<div
				style={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					height: 38,
					background: BG,
					borderTop: "2px solid #ffffff",
					display: "flex",
					alignItems: "center",
					padding: "2px 4px",
					gap: 4,
					zIndex: 1000,
				}}
			>
				{/* Start Button */}
				<button
					onClick={() => setStartOpen((v) => !v)}
					style={{
						...raised,
						background: startOpen ? "#b0b0b0" : BG,
						borderTopColor: startOpen ? "#808080" : "#ffffff",
						borderLeftColor: startOpen ? "#808080" : "#ffffff",
						borderRightColor: startOpen ? "#ffffff" : "#808080",
						borderBottomColor: startOpen ? "#ffffff" : "#808080",
						padding: "2px 10px",
						height: 30,
						fontWeight: "bold",
						fontSize: 12,
						fontFamily: FONT,
						display: "flex",
						alignItems: "center",
						gap: 5,
						cursor: "pointer",
						flexShrink: 0,
					}}
				>
					<img src={windowsIcon} width={18} height={18} />
					Start
				</button>

				{/* Divider */}
				<div
					style={{
						width: 1,
						height: 30,
						background: "#808080",
						borderRight: "1px solid #ffffff",
						margin: "0 2px",
						flexShrink: 0,
					}}
				/>

				{/* Open window buttons */}
				<div style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
					{openWindows.map((id) => {
						const meta = WIN_META.find((m) => m.id === id)
						if (!meta) return null
						const isActive = activeWindow === id && !minimized.has(id)
						return (
							<button
								key={id}
								onClick={() => (isActive ? minimizeWindow(id) : focusWindow(id))}
								style={{
									...raised,
									borderTopColor: isActive ? "#808080" : "#ffffff",
									borderLeftColor: isActive ? "#808080" : "#ffffff",
									borderRightColor: isActive ? "#ffffff" : "#808080",
									borderBottomColor: isActive ? "#ffffff" : "#808080",
									background: isActive ? "#b0b0b0" : BG,
									padding: "2px 8px",
									height: 30,
									fontSize: 11,
									fontFamily: FONT,
									cursor: "pointer",
									minWidth: 100,
									maxWidth: 160,
									display: "flex",
									alignItems: "center",
									gap: 4,
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
								}}
							>
								<img src={meta.icon} width={16} height={16} style={{ flexShrink: 0 }} />
								<span
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										fontSize: 11,
									}}
								>
									{meta.title.split(" - ")[0]}
								</span>
							</button>
						)
					})}
				</div>

				{/* System tray */}
				<div
					style={{
						...sunken,
						padding: "2px 10px",
						height: 30,
						display: "flex",
						alignItems: "center",
						gap: 8,
						fontSize: 11,
						fontFamily: FONT,
						flexShrink: 0,
					}}
				>
					<span title="Volume">
						<img src={speakerIcon} width={20} height={20} />
					</span>
					<span>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
				</div>
			</div>
		</div>
	)
}
