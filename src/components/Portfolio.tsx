type Props = {
	onBack: () => void
}

const projects = [
	{
		title: "Experimental Playground",
		description: "WebGL, motion, audio-reactif",
		tags: ["WebGL", "Three.js", "GLSL"],
	},
	{
		title: "Narrative Scroll",
		description: "Storytelling scroll-based",
		tags: ["GSAP", "ScrollTrigger", "React"],
	},
	{
		title: "Generative Identity",
		description: "Identit\u00e9 g\u00e9n\u00e9rative, canvas",
		tags: ["Canvas", "Generative", "P5.js"],
	},
	{
		title: "WebGL Experiments",
		description: "Shaders & visual experiments",
		tags: ["WebGL", "GLSL", "Motion"],
	},
]

export default function Portfolio({ onBack }: Props) {
	return (
		<div className="min-h-screen bg-[#141414] text-gray-200">
			{/* Nav */}
			<nav className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/80 backdrop-blur-sm border-b border-gray-800">
				<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
					<span className="text-green-400 font-mono text-sm">great-exp v1.0.0</span>
					<button
						onClick={onBack}
						className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors cursor-pointer"
					>
						[exit to terminal]
					</button>
				</div>
			</nav>

			{/* Hero */}
			<section className="pt-32 pb-20 px-6">
				<div className="max-w-5xl mx-auto">
					<p className="text-green-400 font-mono text-sm mb-4">Hello, I'm</p>
					<h1 className="text-5xl font-bold text-white mb-4">Cl\u00e9ment Deguelle</h1>
					<p className="text-xl text-gray-400 max-w-2xl">
						Creative developer. J'aime construire des exp\u00e9riences web sensibles,
						jouables et m\u00e9morables, \u00e0 la crois\u00e9e du code, du design et de l'interaction.
					</p>
				</div>
			</section>

			{/* Projects */}
			<section className="py-16 px-6">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-sm font-mono text-green-400 mb-8">~/projects</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{projects.map((project) => (
							<div
								key={project.title}
								className="border border-gray-800 rounded-lg p-6 hover:border-green-400/50 transition-colors group"
							>
								<h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
									{project.title}
								</h3>
								<p className="text-gray-400 text-sm mb-4">{project.description}</p>
								<div className="flex gap-2 flex-wrap">
									{project.tags.map((tag) => (
										<span
											key={tag}
											className="text-xs font-mono px-2 py-1 rounded bg-gray-800 text-gray-400"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* About */}
			<section className="py-16 px-6">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-sm font-mono text-green-400 mb-8">~/about</h2>
					<div className="max-w-2xl space-y-4 text-gray-400">
						<p>
							D\u00e9veloppeur full stack passionn\u00e9 par les interfaces cr\u00e9atives et les exp\u00e9riences
							interactives. Je travaille avec React, TypeScript, WebGL et tout ce qui
							permet de repousser les limites du web.
						</p>
						<p>
							Toujours curieux, toujours en train d'exp\u00e9rimenter.
						</p>
					</div>
				</div>
			</section>

			{/* Contact */}
			<section className="py-16 px-6 pb-32">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-sm font-mono text-green-400 mb-8">~/contact</h2>
					<div className="space-y-3 font-mono text-sm">
						<p>
							<span className="text-gray-500">email</span>{" "}
							<span className="text-gray-300">hello@clement-deguelle.dev</span>
						</p>
						<p>
							<span className="text-gray-500">github</span>{" "}
							<a href="https://github.com/clem-deg" className="text-gray-300 hover:text-green-400 transition-colors">
								github.com/clem-deg
							</a>
						</p>
						<p>
							<span className="text-gray-500">linkedin</span>{" "}
							<a href="https://linkedin.com/in/clement-deguelle" className="text-gray-300 hover:text-green-400 transition-colors">
								linkedin.com/in/clement-deguelle
							</a>
						</p>
					</div>
				</div>
			</section>
		</div>
	)
}
