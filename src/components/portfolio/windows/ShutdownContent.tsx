import { BG, FONT, raised } from "../theme"
import type { Position } from "../types"

export function ShutdownContent({ onClose, onMove }: { onClose: () => void; onMove: (p: Position) => void }) {
	const WIN_W = 360
	const WIN_H = 170
	const TASKBAR = 38
	const MARGIN = 12

	const flee = (e: React.MouseEvent) => {
		const mx = e.clientX
		const my = e.clientY
		const maxX = window.innerWidth - WIN_W - MARGIN
		const maxY = window.innerHeight - TASKBAR - WIN_H - MARGIN

		let nx = MARGIN, ny = MARGIN, attempts = 0
		do {
			nx = MARGIN + Math.random() * (maxX - MARGIN)
			ny = MARGIN + Math.random() * (maxY - MARGIN)
			attempts++
		} while (attempts < 30 && Math.hypot(nx - mx, ny - my) < 260)

		onMove({ x: Math.round(nx), y: Math.round(ny) })
	}

	const btnStyle: React.CSSProperties = {
		...raised,
		background: BG,
		padding: "4px 0",
		fontSize: 11,
		fontFamily: FONT,
		cursor: "pointer",
		width: 80,
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: "50%",
						background: "#000080",
						color: "white",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: "bold",
						fontSize: 20,
						fontFamily: FONT,
						flexShrink: 0,
					}}
				>
					?
				</div>
				<span style={{ fontSize: 11, fontFamily: FONT, lineHeight: 1.5 }}>
					Are you sure you want to shut down your computer?
				</span>
			</div>
			<div style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #ffffff", margin: "0 -16px" }} />
			<div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
				<button style={btnStyle} onMouseEnter={flee}>Yes</button>
				<button style={btnStyle} onClick={onClose}>No</button>
			</div>
		</div>
	)
}
