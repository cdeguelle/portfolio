import { useState } from "react"
import { BG, FONT, raised, sunken } from "../theme"

export function CrocusContent() {
	const [blocked, setBlocked] = useState(false)
	const url = "https://le-petit-crocus-8opa-lvima3fq8-cdeguelles-projects.vercel.app/"

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
			{/* Address bar */}
			<div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", background: BG, borderBottom: "1px solid #808080", flexShrink: 0 }}>
				<span style={{ fontFamily: FONT, fontSize: 10, color: "#444" }}>Address:</span>
				<div style={{ ...sunken, flex: 1, padding: "1px 6px", background: "#ffffff", fontFamily: FONT, fontSize: 11 }}>{"https://www.lepetitcrocus.fr/"}</div>
				<button
					onClick={() => {
						setBlocked(false)
					}}
					style={{ ...raised, background: BG, padding: "1px 10px", fontFamily: FONT, fontSize: 11, cursor: "pointer" }}
				>
					Go
				</button>
			</div>

			{/* Content */}
			{blocked ? (
				<div
					style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#ffffff", fontFamily: FONT }}
				>
					<img src="https://www.google.com/s2/favicons?domain=lepetitcrocus.fr&sz=32" width={32} height={32} />
					<div style={{ fontSize: 13, fontWeight: "bold" }}>Ce site ne peut pas être affiché dans un cadre</div>
					<div style={{ fontSize: 11, color: "#666", textAlign: "center", maxWidth: 320 }}>
						Le site <strong>lepetitcrocus.fr</strong> refuse d'être intégré via iframe (X-Frame-Options).
					</div>
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						style={{ ...raised, background: BG, padding: "3px 14px", fontFamily: FONT, fontSize: 11, cursor: "pointer", textDecoration: "none", color: "#000" }}
					>
						Ouvrir dans un nouvel onglet
					</a>
				</div>
			) : (
				<iframe src={url} style={{ flex: 1, border: "none", display: "block", width: "100%" }} title="Le Petit Crocus" onError={() => setBlocked(true)} />
			)}
		</div>
	)
}
