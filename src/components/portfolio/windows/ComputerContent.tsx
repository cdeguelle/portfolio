import computerIcon from "../../../assets/computer.png"
import diskSpaceIcon from "../../../assets/disk_space.png"
import { FONT, sunken } from "../theme"

const drives = [
	{ name: "Drive C: — Frontend", skills: "React · TypeScript · Next.js · Vite · React Native", level: 95 },
	{ name: "Drive D: — 3D / WebGL", skills: "Three.js · GLSL · WebGL", level: 57 },
	{ name: "Drive E: — Animation", skills: "GSAP · Canvas · Framer", level: 65 },
	{ name: "Drive F: — Tools", skills: "Git · Expo · Vercel · Figma", level: 83 },
]

export function ComputerContent() {
	return (
		<div>
			<div
				style={{
					fontWeight: "bold",
					marginBottom: 12,
					fontSize: 13,
					fontFamily: FONT,
					display: "flex",
					alignItems: "center",
					gap: 6,
				}}
			>
				<img src={computerIcon} width={16} height={16} /> Clément OS v1.0 — System Skills
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
				{drives.map((d) => (
					<div key={d.name} style={{ ...sunken, background: "#f0f0f0", padding: 10, cursor: "default" }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 6,
								fontWeight: "bold",
								fontSize: 11,
								fontFamily: FONT,
								marginBottom: 4,
							}}
						>
							<img src={diskSpaceIcon} width={16} height={16} />
							<span>{d.name}</span>
						</div>
						<div style={{ fontSize: 10, color: "#555", fontFamily: FONT, marginBottom: 6 }}>{d.skills}</div>
						<div style={{ ...sunken, background: "#ffffff", height: 10, position: "relative" }}>
							<div
								style={{
									position: "absolute",
									inset: 0,
									width: `${d.level}%`,
									background: "linear-gradient(to right, #000080, #0080ff)",
								}}
							/>
						</div>
						<div style={{ fontSize: 9, marginTop: 3, fontFamily: FONT, color: "#333" }}>Mastery: {d.level}%</div>
					</div>
				))}
			</div>
		</div>
	)
}
