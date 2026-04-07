import type { RefObject } from "react"

interface ContactSectionProps {
	contactTagsRef: RefObject<HTMLDivElement | null>
}

export function ContactSection({ contactTagsRef }: ContactSectionProps) {
	return (
		<section id="contact" className="ed-section">
			<div className="ed-sec-head ed-fade">
				<span className="ed-sec-num">[03]</span>
				<span className="ed-sec-label">Contact</span>
			</div>

			<div className="ed-contact-body">
				<div className="ed-contact-left">
					<div className="ed-clip">
						<h2 className="ed-rise ed-contact-title">
							Let's work
							<br />
							together.
						</h2>
					</div>
					<div className="ed-contact-links ed-fade ed-d1">
						<a href="mailto:clement.deguelle@hotmail.com" className="ed-contact-link ed-link">
							clement.deguelle@hotmail.com →
						</a>
						<a href="https://github.com/cdeguelle" target="_blank" rel="noreferrer" className="ed-contact-link ed-link">
							github.com/cdeguelle →
						</a>
						<a href="https://linkedin.com/in/clement-deguelle" target="_blank" rel="noreferrer" className="ed-contact-link ed-link">
							linkedin.com/in/clement-deguelle →
						</a>
					</div>
				</div>

				<div className="ed-contact-tags-col" ref={contactTagsRef} />
			</div>
		</section>
	)
}
