import { useState, useEffect, useRef } from "react"
import { BG, FONT, raised } from "./theme"

export type CtxItem = { label: string; action?: () => void; disabled?: boolean; arrow?: boolean } | "separator"

function CtxMenuItem({ item, onClose }: { item: Exclude<CtxItem, "separator">; onClose: () => void }) {
	const [hovered, setHovered] = useState(false)
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
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "3px 16px 3px 20px",
				cursor: "default",
				fontSize: 11,
				fontFamily: FONT,
				color: item.disabled ? "#808080" : hovered ? "#ffffff" : "#000000",
				background: hovered && !item.disabled ? "#000080" : "transparent",
				userSelect: "none",
				gap: 16,
			}}
		>
			<span>{item.label}</span>
			{item.arrow && <span style={{ fontSize: 9 }}>►</span>}
		</div>
	)
}

export function ContextMenu({
	x,
	y,
	items,
	onClose,
}: {
	x: number
	y: number
	items: CtxItem[]
	onClose: () => void
}) {
	const ref = useRef<HTMLDivElement>(null)
	const [pos, setPos] = useState({ x, y })

	useEffect(() => {
		if (!ref.current) return
		const { offsetWidth, offsetHeight } = ref.current
		setPos({
			x: Math.min(x, window.innerWidth - offsetWidth - 4),
			y: Math.min(y, window.innerHeight - offsetHeight - 42),
		})
	}, [x, y])

	return (
		<div
			ref={ref}
			style={{
				position: "fixed",
				left: pos.x,
				top: pos.y,
				zIndex: 2000,
				...raised,
				background: BG,
				boxShadow: "2px 2px 0 #000000",
				minWidth: 180,
				padding: "2px 0",
			}}
		>
			{items.map((item, i) =>
				item === "separator" ? (
					<div
						key={i}
						style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #ffffff", margin: "4px 2px" }}
					/>
				) : (
					<CtxMenuItem key={i} item={item} onClose={onClose} />
				),
			)}
		</div>
	)
}
