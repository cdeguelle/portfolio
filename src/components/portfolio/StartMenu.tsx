import { useState } from "react"
import folderIcon from "../../assets/directory.png"
import notePadIcon from "../../assets/notepad.png"
import mailIcon from "../../assets/mail.png"
import computerIcon from "../../assets/computer.png"
import consoleIcon from "../../assets/console.png"
import stopIcon from "../../assets/stop.png"
import { BG, FONT, raised } from "./theme"
import type { WinId } from "./types"

const isImg = (s: string) => s.startsWith("/") || s.startsWith("data:") || s.startsWith("blob:")

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

export function StartMenu({ onOpenWindow, onClose }: { onOpenWindow: (id: WinId) => void; onClose: () => void }) {
	const items: { icon: string; label: string; action: () => void; dividerBefore?: boolean }[] = [
		{ icon: folderIcon, label: "My Projects", action: () => onOpenWindow("projects") },
		{ icon: notePadIcon, label: "About", action: () => onOpenWindow("about") },
		{ icon: mailIcon, label: "Contact", action: () => onOpenWindow("contact") },
		{ icon: computerIcon, label: "My Computer", action: () => onOpenWindow("computer") },
		{ icon: consoleIcon, label: "Open Terminal", action: () => onOpenWindow("terminal"), dividerBefore: true },
		{ icon: stopIcon, label: "Shut Down...", action: () => onOpenWindow("rusure") },
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
