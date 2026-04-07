const STACK = [
	["Frontend", "React · TypeScript · Next.js · Vite · React Native · Expo"],
	["3D / WebGL", "Three.js · GLSL · WebGL"],
	["Animation", "GSAP · ScrollTrigger · Canvas API"],
	["Backend", "Node.js · Express · MongoDB · PostgreSQL · MySQL · Firebase"],
	["DevOps", "Docker · CI/CD"],
	["UI/UX", "Figma"],
]

export function BhAboutContent({ color }: { color: string }) {
	return (
		<div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
			<div>
				<p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#e8e8f0", lineHeight: 1.6 }}>
					Clément Deguelle — Creative fullstack developer
				</p>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
				<p style={{ margin: 0, color: "#9090a8", fontSize: 13, lineHeight: 1.75 }}>
					Fullstack developer passionate about creative interfaces and interactive experiences. I work with React,
					TypeScript, WebGL and everything that pushes the boundaries of the web.
				</p>
				<p style={{ margin: 0, color: "#9090a8", fontSize: 13, lineHeight: 1.75 }}>
					I love building weird, effective and memorable web experiences, at the crossroads of code, design and
					interaction.
				</p>
				<p style={{ margin: 0, color: "#9090a8", fontSize: 13, lineHeight: 1.75 }}>
					Always curious, always experimenting.
				</p>
			</div>

			<div
				style={{
					background: "#0d0d1f",
					border: `1px solid ${color}22`,
					borderRadius: 6,
					padding: "14px 16px",
					display: "flex",
					flexDirection: "column",
					gap: 8,
				}}
			>
				<p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.12em" }}>
					Tech stack
				</p>
				{STACK.map(([cat, techs]) => (
					<div key={cat} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
						<span style={{ fontSize: 11, fontWeight: 600, color: "#c8c8d8", minWidth: 90, flexShrink: 0 }}>{cat}</span>
						<span style={{ fontSize: 11, color: "#6e6e88", lineHeight: 1.5 }}>{techs}</span>
					</div>
				))}
			</div>
		</div>
	)
}
