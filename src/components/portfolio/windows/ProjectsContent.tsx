import { useState } from "react"
import folderIcon from "../../../assets/directory.png"
import { BG, FONT, raised, sunken } from "../theme"

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

type View = "Details" | "Icons" | "List"

export function ProjectsContent() {
	const [view, setView] = useState<View>("Details")
	const [selected, setSelected] = useState<number | null>(null)

	return (
		<div>
			{/* Toolbar */}
			<div style={{ display: "flex", gap: 2, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #808080" }}>
				{(["Details", "Icons", "List"] as View[]).map((v) => (
					<button
						key={v}
						onClick={() => setView(v)}
						style={{
							...(view === v ? sunken : raised),
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

			{/* Details view */}
			{view === "Details" && (
				<div>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 160px 130px", fontWeight: "bold", fontSize: 11, marginBottom: 2 }}>
						{["Name", "Description", "Technologies"].map((h) => (
							<div key={h} style={{ ...raised, background: BG, padding: "2px 6px", cursor: "default" }}>
								{h}
							</div>
						))}
					</div>
					{projects.map((p, i) => (
						<div
							key={i}
							onClick={() => setSelected(i)}
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 160px 130px",
								background: selected === i ? "#000080" : i % 2 === 0 ? "#ffffff" : "#f4f4f4",
								color: selected === i ? "#ffffff" : "#000000",
								cursor: "default",
							}}
						>
							<div style={{ padding: "4px 6px", display: "flex", alignItems: "center", gap: 6 }}>
								<img src={folderIcon} width={16} height={16} />
								<span style={{ fontWeight: "bold", fontSize: 11, color: selected === i ? "#ffffff" : "#000080" }}>{p.title}</span>
							</div>
							<div style={{ padding: "4px 6px", fontSize: 11 }}>{p.description}</div>
							<div style={{ padding: "4px 6px", display: "flex", flexWrap: "wrap", gap: 2 }}>
								{p.tags.map((t) => (
									<span
										key={t}
										style={{
											...raised,
											background: selected === i ? "#000080" : BG,
											color: selected === i ? "#ffffff" : "#000000",
											padding: "0 4px",
											fontSize: 9,
											fontFamily: FONT,
											alignSelf: "center",
										}}
									>
										{t}
									</span>
								))}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Icons view */}
			{view === "Icons" && (
				<div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 8 }}>
					{projects.map((p, i) => (
						<div
							key={i}
							onClick={() => setSelected(i)}
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: 4,
								width: 80,
								padding: 4,
								cursor: "default",
								background: selected === i ? "#000080" : "transparent",
							}}
						>
							<img src={folderIcon} width={32} height={32} style={{ imageRendering: "pixelated" }} />
							<span
								style={{
									fontSize: 11,
									fontFamily: FONT,
									textAlign: "center",
									color: selected === i ? "#ffffff" : "#000000",
									background: selected === i ? "#000080" : "transparent",
									wordBreak: "break-word",
								}}
							>
								{p.title}
							</span>
						</div>
					))}
				</div>
			)}

			{/* List view */}
			{view === "List" && (
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: 0,
					}}
				>
					{projects.map((p, i) => (
						<div
							key={i}
							onClick={() => setSelected(i)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 6,
								padding: "2px 6px",
								cursor: "default",
								background: selected === i ? "#000080" : "transparent",
								color: selected === i ? "#ffffff" : "#000000",
							}}
						>
							<img src={folderIcon} width={16} height={16} />
							<span style={{ fontSize: 11, fontFamily: FONT, color: selected === i ? "#ffffff" : "#000080", fontWeight: "bold" }}>
								{p.title}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
