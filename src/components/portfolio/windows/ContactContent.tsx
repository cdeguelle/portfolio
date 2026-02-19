import mailIcon from "../../../assets/mail.png"
import githubIcon from "../../../assets/github.png"
import linkedinIcon from "../../../assets/linkedin.jpg"
import { FONT, sunken } from "../theme"

const links = [
	{ icon: mailIcon, label: "Email", value: "clement.deguelle@hotmail.com", href: "mailto:clement.deguelle@hotmail.com" },
	{ icon: githubIcon, label: "GitHub", value: "github.com/cdeguelle", href: "https://github.com/cdeguelle" },
	{ icon: linkedinIcon, label: "LinkedIn", value: "linkedin.com/in/clement-deguelle", href: "https://linkedin.com/in/clement-deguelle" },
]

export function ContactContent() {
	return (
		<div>
			<p style={{ marginBottom: 12, fontFamily: FONT, fontSize: 11 }}>
				Feel free to reach out for any project or collaboration!
			</p>
			{links.map(({ icon, label, value, href }) => (
				<div
					key={label}
					style={{
						display: "flex",
						alignItems: "center",
						gap: 10,
						marginBottom: 8,
						padding: 8,
						...sunken,
						background: "#f8f8f8",
						cursor: "default",
					}}
				>
					<img src={icon} width={24} height={24} />
					<div>
						<div style={{ fontWeight: "bold", color: "#000080", fontSize: 11, fontFamily: FONT }}>{label}</div>
						<a
							href={href}
							target="_blank"
							style={{ color: "#0000cc", textDecoration: "underline", fontSize: 11, fontFamily: FONT }}
						>
							{value}
						</a>
					</div>
				</div>
			))}
		</div>
	)
}
