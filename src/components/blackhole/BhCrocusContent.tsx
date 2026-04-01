import { useState } from "react"

const URL = "https://www.lepetitcrocus.fr/"

export function BhCrocusContent({ color }: { color: string }) {
	const [blocked, setBlocked] = useState(false)

	return (
		<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
			{/* Address bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					padding: "8px 12px",
					background: "#08081a",
					borderBottom: `1px solid ${color}22`,
					flexShrink: 0,
				}}
			>
				<span style={{ fontSize: 11, color: "#50507a" }}>URL</span>
				<div
					style={{
						flex: 1,
						padding: "4px 10px",
						background: "#0d0d20",
						border: `1px solid ${color}22`,
						borderRadius: 4,
						fontSize: 12,
						color: "#9090b0",
						fontFamily: "monospace",
					}}
				>
					{URL}
				</div>
				<a
					href={URL}
					target="_blank"
					rel="noreferrer"
					style={{
						background: "transparent",
						border: `1px solid ${color}44`,
						borderRadius: 4,
						color: color,
						padding: "4px 12px",
						fontSize: 11,
						cursor: "pointer",
						textDecoration: "none",
					}}
				>
					↗
				</a>
			</div>

			{/* Content */}
			{blocked ? (
				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 16,
						background: "#06060f",
						padding: 24,
						textAlign: "center",
					}}
				>
					<span style={{ fontSize: 32 }}>🚫</span>
					<p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#e0e0f0" }}>
						Ce site refuse d'être affiché dans un cadre
					</p>
					<p style={{ margin: 0, fontSize: 12, color: "#6060a0", maxWidth: 320 }}>
						<strong style={{ color: "#9090c0" }}>lepetitcrocus.fr</strong> bloque l'intégration via iframe
						(X-Frame-Options).
					</p>
					<a
						href={URL}
						target="_blank"
						rel="noreferrer"
						style={{
							border: `1px solid ${color}44`,
							borderRadius: 4,
							color: color,
							padding: "8px 20px",
							fontSize: 12,
							cursor: "pointer",
							textDecoration: "none",
						}}
					>
						Ouvrir dans un nouvel onglet ↗
					</a>
				</div>
			) : (
				<iframe
					src={URL}
					style={{ flex: 1, border: "none", display: "block", width: "100%" }}
					title="Le Petit Crocus"
					onError={() => setBlocked(true)}
				/>
			)}
		</div>
	)
}
