import { useState, useEffect, useCallback } from "react"
import { FONT } from "./theme"
import { WIN_META, DESKTOP_ICONS, INITIAL_POS } from "./types"
import type { WinId, Position } from "./types"
import { Window95 } from "./Window95"
import { DesktopIcon } from "./DesktopIcon"
import { StartMenu } from "./StartMenu"
import { ContextMenu } from "./ContextMenu"
import type { CtxItem } from "./ContextMenu"
import { Taskbar } from "./Taskbar"
import { getContent } from "./windows"

export default function Portfolio() {
	const [openWindows, setOpenWindows] = useState<WinId[]>([])
	const [zOrder, setZOrder] = useState<WinId[]>([])
	const [minimized, setMinimized] = useState<Set<WinId>>(new Set())
	const [positions, setPositions] = useState<Record<WinId, Position>>(INITIAL_POS)
	const [startOpen, setStartOpen] = useState(false)
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
	const [time, setTime] = useState(new Date())

	useEffect(() => {
		document.documentElement.classList.add("w95-theme")
		return () => document.documentElement.classList.remove("w95-theme")
	}, [])

	useEffect(() => {
		const t = setInterval(() => setTime(new Date()), 1000)
		return () => clearInterval(t)
	}, [])

	const openWindow = useCallback((id: WinId) => {
		setOpenWindows((prev) => (prev.includes(id) ? prev : [...prev, id]))
		setZOrder((prev) => [...prev.filter((w) => w !== id), id])
		setMinimized((prev) => {
			const n = new Set(prev)
			n.delete(id)
			return n
		})
		setStartOpen(false)
	}, [])

	const closeWindow = useCallback((id: WinId) => {
		setOpenWindows((prev) => prev.filter((w) => w !== id))
		setZOrder((prev) => prev.filter((w) => w !== id))
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
		setZOrder((prev) => [...prev.filter((w) => w !== id), id])
		setMinimized((prev) => {
			const n = new Set(prev)
			n.delete(id)
			return n
		})
	}, [])

	const setPosition = useCallback((id: WinId, pos: Position) => {
		setPositions((prev) => ({ ...prev, [id]: pos }))
	}, [])

	const activeWindow = zOrder.filter((id) => !minimized.has(id)).at(-1)

	const desktopContextItems: CtxItem[] = [
		{ label: "Arrange Icons By", disabled: true, arrow: true },
		{ label: "Line Up Icons", disabled: true },
		"separator",
		{ label: "Refresh", disabled: true },
		"separator",
		{ label: "Open My Projects", action: () => openWindow("projects") },
		{ label: "Open About", action: () => openWindow("about") },
		{ label: "Open Contact", action: () => openWindow("contact") },
		"separator",
		{ label: "New", disabled: true, arrow: true },
		"separator",
		{ label: "Properties", disabled: true },
	]

	return (
		<div
			onContextMenu={(e) => {
				e.preventDefault()
				setStartOpen(false)
				setContextMenu({ x: e.clientX, y: e.clientY })
			}}
			onClick={() => setContextMenu(null)}
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
						zIndex={zOrder.indexOf(id) + 10}
						isActive={activeWindow === id}
					>
						{getContent(id, () => closeWindow(id), (pos) => setPosition(id, pos), openWindow)}
					</Window95>
				)
			})}

			{/* Context Menu */}
			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					items={desktopContextItems}
					onClose={() => setContextMenu(null)}
				/>
			)}

			{/* Start Menu */}
			{startOpen && <StartMenu onOpenWindow={openWindow} onClose={() => setStartOpen(false)} />}

			{/* Taskbar */}
			<Taskbar
				openWindows={openWindows}
				minimized={minimized}
				activeWindow={activeWindow}
				startOpen={startOpen}
				time={time}
				onStartClick={() => setStartOpen((v) => !v)}
				onWindowClick={focusWindow}
				onWindowMinimize={minimizeWindow}
			/>
		</div>
	)
}
