import folderIcon from "../../../assets/directory.png"
import { BG, FONT, raised } from "../theme"

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

export function ProjectsContent() {
	return (
		<div>
			{/* Toolbar */}
			<div style={{ display: "flex", gap: 2, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #c0c0c0" }}>
				{["Details", "Icons", "List"].map((v) => (
					<button key={v} style={{ ...raised, background: BG, padding: "1px 8px", fontSize: 10, fontFamily: FONT, cursor: "pointer" }}>
						{v}
					</button>
				))}
			</div>

			{/* Header row */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 160px 130px", fontWeight: "bold", fontSize: 11, marginBottom: 2 }}>
				{["Name", "Description", "Technologies"].map((h) => (
					<div key={h} style={{ ...raised, background: BG, padding: "2px 6px", cursor: "default" }}>
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
							<span key={t} style={{ ...raised, background: BG, padding: "0 4px", fontSize: 9, fontFamily: FONT }}>
								{t}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	)
}
