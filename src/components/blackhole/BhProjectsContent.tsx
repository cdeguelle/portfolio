const projects = [
	{
		id: "phone",
		title: "Mobile app",
		description: "Mobile application for schedule management & creation of new events",
		tags: ["React Native", "TypeScript", "Expo"],
	},
	{
		id: "map",
		title: "3D isometric & interactive map",
		description: "Interactive 3D map with animations & 3D effects",
		tags: ["Three.js", "WebGL", "React"],
	},
	{
		id: "crocus",
		title: "Website — Le Petit Crocus",
		description: "Website for restaurant 'le petit crocus'",
		tags: ["TypeScript", "Next.js"],
	},
	{
		id: "discord",
		title: "Discord bot",
		description: "Discord bot for community management",
		tags: ["JavaScript", "Discord.js"],
	},
]

export function BhProjectsContent({ color, onOpen }: { color: string; onOpen: (id: string) => void }) {
	return (
		<div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
			{projects.map((p) => (
				<div
					key={p.id}
					onClick={() => onOpen(p.id)}
					style={{
						background: "#0d0d1f",
						border: `1px solid ${color}20`,
						borderLeft: `3px solid ${color}`,
						borderRadius: 4,
						padding: "12px 16px",
						display: "flex",
						alignItems: "center",
						gap: 12,
						cursor: "pointer",
						transition: "border-color 0.2s, background 0.2s",
					}}
					onMouseEnter={(e) => {
						const el = e.currentTarget as HTMLDivElement
						el.style.background = `${color}0d`
						el.style.borderColor = `${color}55`
					}}
					onMouseLeave={(e) => {
						const el = e.currentTarget as HTMLDivElement
						el.style.background = "#0d0d1f"
						el.style.borderColor = `${color}20`
					}}
				>
					<div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
						<p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e0e0ee" }}>{p.title}</p>
						<p style={{ margin: 0, fontSize: 12, color: "#787894", lineHeight: 1.5 }}>{p.description}</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
							{p.tags.map((t) => (
								<span
									key={t}
									style={{
										background: `${color}18`,
										color: color,
										border: `1px solid ${color}44`,
										borderRadius: 3,
										padding: "1px 8px",
										fontSize: 10,
										fontWeight: 500,
										letterSpacing: "0.04em",
									}}
								>
									{t}
								</span>
							))}
						</div>
					</div>
					<span style={{ color: `${color}88`, fontSize: 20, flexShrink: 0, lineHeight: 1 }}>›</span>
				</div>
			))}
		</div>
	)
}
