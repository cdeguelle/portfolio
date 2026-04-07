const links = [
	{ emoji: "✉", label: "Email", value: "clement.deguelle@hotmail.com", href: "mailto:clement.deguelle@hotmail.com" },
	{ emoji: "⌥", label: "GitHub", value: "github.com/cdeguelle", href: "https://github.com/cdeguelle" },
	{ emoji: "◈", label: "LinkedIn", value: "linkedin.com/in/clement-deguelle", href: "https://linkedin.com/in/clement-deguelle" },
]

export function BhContactContent({ color }: { color: string }) {
	return (
		<div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
			<p style={{ margin: 0, fontSize: 13, color: "#9090a8", lineHeight: 1.6 }}>
				Feel free to reach out for any project or collaboration!
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{links.map(({ emoji, label, value, href }) => (
					<a
						key={label}
						href={href}
						target="_blank"
						rel="noreferrer"
						style={{
							display: "flex",
							alignItems: "center",
							gap: 14,
							padding: "12px 16px",
							background: "#0d0d1f",
							border: `1px solid ${color}22`,
							borderRadius: 6,
							textDecoration: "none",
							transition: "border-color 0.2s",
						}}
						onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}66`)}
						onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}22`)}
					>
						<span style={{ fontSize: 18, width: 24, textAlign: "center", color }}>{emoji}</span>
						<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<span style={{ fontSize: 11, fontWeight: 600, color: "#7070a0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
								{label}
							</span>
							<span style={{ fontSize: 13, color: "#c8c8e0" }}>{value}</span>
						</div>
					</a>
				))}
			</div>
		</div>
	)
}
