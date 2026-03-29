import { FONT, sunken } from "../theme"

export function AboutContent() {
	return (
		<div style={{ lineHeight: 1.7, fontSize: 12, fontFamily: '"Courier New", monospace' }}>
			<div
				style={{
					marginBottom: 12,
					paddingBottom: 8,
					borderBottom: "1px solid #c0c0c0",
					fontFamily: FONT,
					fontWeight: "bold",
					fontSize: 13,
				}}
			>
				👋 Clément Deguelle — Creative fullstack developer
			</div>
			<p style={{ marginBottom: 10 }}>
				Fullstack developer passionate about creative interfaces and interactive experiences. I work with React, TypeScript, WebGL and everything that pushes the boundaries
				of the web.
			</p>
			<p style={{ marginBottom: 10 }}>I love building sensitive, effective and memorable web experiences, at the crossroads of code, design and interaction.</p>
			<p style={{ marginBottom: 12 }}>Always curious, always experimenting.</p>
			<div style={{ ...sunken, background: "#f8f8f8", padding: 10, fontFamily: FONT }}>
				<div style={{ fontWeight: "bold", marginBottom: 6, fontSize: 11 }}>🛠 Tech stack:</div>
				{[
					["Frontend", "React · TypeScript · Next.js · Vite · React Native · Expo"],
					["3D / WebGL", "Three.js · GLSL · WebGL"],
					["Animation", "GSAP · ScrollTrigger · Canvas API"],
					["Backend", "Node.js · Express · MongoDB · PostgreSQL · MySQL · Firebase"],
					["DevOps", "Docker · CI/CD"],
					["UI/UX", "Figma"],
				].map(([cat, techs]) => (
					<div key={cat} style={{ marginBottom: 4, fontSize: 11 }}>
						<span style={{ fontWeight: "bold", color: "#000080" }}>{cat} : </span>
						{techs}
					</div>
				))}
			</div>
		</div>
	)
}
