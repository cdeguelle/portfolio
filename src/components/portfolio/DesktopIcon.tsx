import { useState, useRef } from "react"
import { FONT } from "./theme"

export function DesktopIcon({ label, icon, onOpen }: { label: string; icon: string; onOpen: () => void }) {
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

	return (
		<div
			onClick={handleClick}
			onBlur={() => setSelected(false)}
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
