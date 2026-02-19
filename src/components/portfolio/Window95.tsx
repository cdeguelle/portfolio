import { useState, useEffect, useRef, useCallback } from "react"
import { BG, FONT, raised, sunken } from "./theme"
import type { WinMeta, Position } from "./types"

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

// ─── Menu Bar ─────────────────────────────────────────────────────────────
type MenuItem = { label: string; action?: () => void; disabled?: boolean } | "separator"

const MENUS: Record<string, MenuItem[]> = {
	File: [
		{ label: "New", disabled: true },
		{ label: "Open...", disabled: true },
		"separator",
		{ label: "Close" },
		"separator",
		{ label: "Exit" },
	],
	Edit: [
		{ label: "Undo", disabled: true },
		"separator",
		{ label: "Cut", disabled: true },
		{ label: "Copy", disabled: true },
		{ label: "Paste", disabled: true },
		"separator",
		{ label: "Select All", disabled: true },
	],
	View: [
		{ label: "Toolbar", disabled: true },
		{ label: "Status Bar", disabled: true },
		"separator",
		{ label: "Large Icons", disabled: true },
		{ label: "Small Icons", disabled: true },
		{ label: "List", disabled: true },
		{ label: "Details", disabled: true },
		"separator",
		{ label: "Refresh", disabled: true },
	],
	Help: [{ label: "Help Topics", disabled: true }, "separator", { label: "About Windows 95", disabled: true }],
}

function DropdownItem({ item, onClose }: { item: MenuItem; onClose: () => void }) {
	const [hovered, setHovered] = useState(false)
	if (item === "separator") {
		return <div style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #ffffff", margin: "4px 2px" }} />
	}
	return (
		<div
			onMouseDown={() => {
				if (item.disabled) return
				item.action?.()
				onClose()
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				padding: "3px 24px 3px 20px",
				cursor: "default",
				fontSize: 11,
				fontFamily: FONT,
				color: item.disabled ? "#808080" : hovered ? "#ffffff" : "#000000",
				background: hovered && !item.disabled ? "#000080" : "transparent",
				userSelect: "none",
			}}
		>
			{item.label}
		</div>
	)
}

function MenuBar({ onClose }: { onClose: () => void }) {
	const [openMenu, setOpenMenu] = useState<string | null>(null)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!openMenu) return
		const handler = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpenMenu(null)
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [openMenu])

	const resolvedMenus = Object.fromEntries(
		Object.entries(MENUS).map(([name, items]) => [
			name,
			items.map((item) => {
				if (item === "separator") return item
				if (item.label === "Close" || item.label === "Exit") return { ...item, action: onClose }
				return item
			}),
		]),
	)

	return (
		<div
			ref={ref}
			style={{
				padding: "2px 4px",
				borderBottom: "1px solid #808080",
				fontSize: 11,
				fontFamily: FONT,
				display: "flex",
				gap: 0,
				position: "relative",
			}}
		>
			{Object.entries(resolvedMenus).map(([name, items]) => (
				<div key={name} style={{ position: "relative" }}>
					<span
						onMouseDown={(e) => {
							e.stopPropagation()
							setOpenMenu(openMenu === name ? null : name)
						}}
						style={{
							padding: "1px 8px",
							cursor: "default",
							display: "inline-block",
							background: openMenu === name ? "#000080" : "transparent",
							color: openMenu === name ? "#ffffff" : "#000000",
						}}
					>
						{name}
					</span>
					{openMenu === name && (
						<div
							style={{
								position: "absolute",
								top: "100%",
								left: 0,
								zIndex: 100,
								...raised,
								background: BG,
								boxShadow: "2px 2px 0 #000000",
								minWidth: 160,
								padding: "2px 0",
							}}
						>
							{items.map((item, i) => (
								<DropdownItem key={i} item={item} onClose={() => setOpenMenu(null)} />
							))}
						</div>
					)}
				</div>
			))}
		</div>
	)
}

// ─── Window95 ─────────────────────────────────────────────────────────────
export function Window95({
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
				transition: meta.isDialog ? "left 0.25s ease-out, top 0.25s ease-out" : undefined,
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
					background: isActive
						? "linear-gradient(to right, #000080, #1084d0)"
						: "linear-gradient(to right, #7b7b7b, #a8a8a8)",
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
					{!meta.isDialog && <CtrlBtn label="─" onClick={onMinimize} />}
					{!meta.isDialog && <CtrlBtn label="□" disabled />}
					<CtrlBtn label="✕" onClick={onClose} />
				</div>
			</div>

			{meta.isDialog ? (
				<div style={{ padding: 16, background: BG, fontFamily: FONT }}>{children}</div>
			) : (
				<>
					<MenuBar onClose={onClose} />

					<div
						style={{
							margin: 4,
							...sunken,
							background: meta.id === "terminal" ? "#000000" : "#ffffff",
							padding: meta.id === "cv" || meta.id === "terminal" ? 0 : 8,
							maxHeight: meta.contentHeight ?? 380,
							overflowY: "auto",
							fontSize: 11,
							fontFamily: FONT,
						}}
					>
						{children}
					</div>

					<div style={{ padding: "2px 8px", fontSize: 10, fontFamily: FONT, display: "flex", gap: 8 }}>
						<div style={{ ...sunken, padding: "0 8px", flex: 1, fontSize: 10 }}>Ready</div>
						{meta.statusText && (
							<div style={{ ...sunken, padding: "0 8px", width: 80, fontSize: 10 }}>{meta.statusText}</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
