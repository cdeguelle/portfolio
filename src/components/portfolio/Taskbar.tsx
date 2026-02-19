import windowsIcon from "../../assets/windows.png"
import speakerIcon from "../../assets/speaker.png"
import { BG, FONT, raised, sunken } from "./theme"
import { WIN_META } from "./types"
import type { WinId } from "./types"

interface TaskbarProps {
	openWindows: WinId[]
	minimized: Set<WinId>
	activeWindow: WinId | undefined
	startOpen: boolean
	time: Date
	onStartClick: () => void
	onWindowClick: (id: WinId) => void
	onWindowMinimize: (id: WinId) => void
}

export function Taskbar({
	openWindows,
	minimized,
	activeWindow,
	startOpen,
	time,
	onStartClick,
	onWindowClick,
	onWindowMinimize,
}: TaskbarProps) {
	return (
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
				onClick={onStartClick}
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

			{/* Window buttons */}
			<div style={{ display: "flex", gap: 2, flex: 1, overflow: "hidden" }}>
				{openWindows.map((id) => {
					const meta = WIN_META.find((m) => m.id === id)
					if (!meta) return null
					const isActive = activeWindow === id && !minimized.has(id)
					return (
						<button
							key={id}
							onClick={() => (isActive ? onWindowMinimize(id) : onWindowClick(id))}
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
	)
}
