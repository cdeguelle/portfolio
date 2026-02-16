import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

const PROMPT = "clem@portfolio:~$"

const ASCII_ART = String.raw`
  ░██████  ░██                                                     ░██       ░███████                                               ░██ ░██            
 ░██   ░██ ░██                                                     ░██       ░██   ░██                                              ░██ ░██            
░██        ░██  ░███████  ░█████████████   ░███████  ░████████  ░████████    ░██    ░██  ░███████   ░████████ ░██    ░██  ░███████  ░██ ░██  ░███████  
░██        ░██ ░██    ░██ ░██   ░██   ░██ ░██    ░██ ░██    ░██    ░██       ░██    ░██ ░██    ░██ ░██    ░██ ░██    ░██ ░██    ░██ ░██ ░██ ░██    ░██ 
░██        ░██ ░█████████ ░██   ░██   ░██ ░█████████ ░██    ░██    ░██       ░██    ░██ ░█████████ ░██    ░██ ░██    ░██ ░█████████ ░██ ░██ ░█████████ 
 ░██   ░██ ░██ ░██        ░██   ░██   ░██ ░██        ░██    ░██    ░██       ░██   ░██  ░██        ░██   ░███ ░██   ░███ ░██        ░██ ░██ ░██        
  ░██████  ░██  ░███████  ░██   ░██   ░██  ░███████  ░██    ░██     ░████    ░███████    ░███████   ░█████░██  ░█████░██  ░███████  ░██ ░██  ░███████  
                                                                                                          ░██                                          
                                                                                                    ░███████                                           
                                                                                                                                                       
`

const ASCII_ART_2 = String.raw`
██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗ ██████╗ ███████╗██╗   ██╗██████╗     ███████╗██╗   ██╗██╗     ██╗     ███████╗████████╗ █████╗  ██████╗██╗  ██╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗██╔══██╗██╔════╝██║   ██║██╔══██╗    ██╔════╝██║   ██║██║     ██║     ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝██████╔╝█████╗  ██║   ██║██████╔╝    █████╗  ██║   ██║██║     ██║     ███████╗   ██║   ███████║██║     █████╔╝ 
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝ ██╔═══╝ ██╔══╝  ██║   ██║██╔══██╗    ██╔══╝  ██║   ██║██║     ██║     ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ 
██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║     ██║     ███████╗╚██████╔╝██║  ██║    ██║     ╚██████╔╝███████╗███████╗███████║   ██║   ██║  ██║╚██████╗██║  ██╗
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
                                                                                                                                                                         
`

type Line = {
	id: number
	command: string
	output?: string[]
	visibleOutput?: string
}

function App() {
	const [lines, setLines] = useState<Line[]>([])
	const [input, setInput] = useState("")
	const [cursorIndex, setCursorIndex] = useState(0)
	const [activeAnimation, setActiveAnimation] = useState<{ id: number; fullText: string } | null>(
		null,
	)
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const handleSubmit = useCallback(
		(event: FormEvent) => {
			event.preventDefault()
			const trimmed = input.trim()
			if (!trimmed) return

			const command = trimmed.toLowerCase()

			// Commande clear : on nettoie l'historique sans ajouter de nouvelle ligne
			if (command === "clear") {
				setLines([])
				setInput("")
				setCursorIndex(0)
				setActiveAnimation(null)
				return
			}

			let output: string[] | undefined

			switch (command) {
				case "help":
					output = [
						"Commandes disponibles :",
						"  help     - afficher la liste des commandes",
						"  about    - qui je suis",
						"  projects - quelques projets sélectionnés",
						"  contact  - me contacter",
						"  clear    - nettoyer le terminal",
					]
					break
				case "about":
					output = [
						"Je suis Clément, creative developer.",
						"J'aime construire des expériences web sensibles, jouables et mémorables,",
						"à la croisée du code, du design et de l'interaction.",
					]
					break
				case "projects":
					output = [
						"[01] Experimental Playground   — WebGL, motion, audio-reactif",
						"[02] Narrative Scroll          — storytelling scroll-based",
						"[03] Generative Identity       — identité générative, canvas",
					]
					break
				case "contact":
					output = ["Email   : hello@clement-deguelle.dev", "GitHub  : github.com/clem-deg", "LinkedIn: linkedin.com/in/clement-deguelle"]
					break
				default:
					output = [`Commande inconnue : ${trimmed}`, "Utilise 'help' pour voir les commandes disponibles."]
					break
			}

			const id = Date.now()

			const newLine: Line = {
				id,
				command: trimmed,
				output,
				visibleOutput: output && output.length > 0 ? "" : undefined,
			}

			setLines((prev) => [...prev, newLine])
			setInput("")
			setCursorIndex(0)

			if (output && output.length > 0) {
				setActiveAnimation({ id, fullText: output.join("\n") })
			} else {
				setActiveAnimation(null)
			}
		},
		[input],
	)

	const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setInput(value)
		const pos = event.target.selectionStart ?? value.length
		setCursorIndex(pos)
	}, [])

	const syncCursorFromInput = useCallback(() => {
		const el = inputRef.current
		if (!el) return
		const pos = el.selectionStart ?? input.length
		setCursorIndex(pos)
	}, [input])

	useEffect(() => {
		if (!activeAnimation) return

		const { id, fullText } = activeAnimation
		if (!fullText.length) {
			setActiveAnimation(null)
			return
		}

		let index = 0
		const interval = setInterval(() => {
			index += 1

			setLines((prev) => {
				const targetIndex = prev.findIndex((line) => line.id === id)
				if (targetIndex === -1) {
					return prev
				}

				const next = [...prev]
				const target = next[targetIndex]
				const nextVisible = fullText.slice(0, Math.min(index, fullText.length))

				next[targetIndex] = { ...target, visibleOutput: nextVisible }
				return next
			})

			if (index >= fullText.length) {
				clearInterval(interval)
				setActiveAnimation(null)
			}
		}, 15)

		return () => clearInterval(interval)
	}, [activeAnimation])

	const caretPosition = Math.min(cursorIndex, input.length)
	const chars = input.split("")

	return (
		<div className="min-h-screen bg-black text-gray-200 font-mono text-sm">
			<div className="p-4 space-y-1">
				<pre className="mb-3 text-orange-400 whitespace-pre leading-tight">{ASCII_ART}</pre>
				<pre className="mb-3 text-blue-400 whitespace-pre leading-tight">{ASCII_ART_2}</pre>

				<div className="mb-3 text-xs text-gray-400 whitespace-pre">
					<span className="text-gray-500"># commandes disponibles</span>
					{"\n"}
					<span className="text-pink-400"> help </span>
					<span>- afficher la liste des commandes</span>
					{"\n"}
					<span className="text-pink-400"> about </span>
					<span>- à propos de moi</span>
					{"\n"}
					<span className="text-pink-400"> projects </span>
					<span>- quelques projets</span>
					{"\n"}
					<span className="text-pink-400"> contact </span>
					<span>- me contacter</span>
					{"\n"}
					<span className="text-pink-400"> clear </span>
					<span>- nettoyer le terminal</span>
				</div>

				{lines.map((line) => (
					<div key={line.id} className="whitespace-pre-wrap">
						<div>
							<span className="text-green-400">{PROMPT}</span> <span>{line.command}</span>
						</div>
						{line.output && (
							<pre className="mt-1 pl-4 text-gray-500 whitespace-pre-wrap">
								{line.visibleOutput ?? line.output.join("\n")}
							</pre>
						)}
					</div>
				))}

				<form onSubmit={handleSubmit} className="relative" onClick={() => inputRef.current?.focus()}>
					<input
						ref={inputRef}
						className="absolute inset-0 w-full h-full opacity-0"
						style={{ caretColor: "transparent" }}
						type="text"
						autoFocus
						value={input}
						onChange={handleInputChange}
						autoComplete="off"
						spellCheck={false}
						onSelect={syncCursorFromInput}
						onKeyUp={syncCursorFromInput}
					/>
					<div className="flex items-center">
						<span className="mr-2 text-green-400">{PROMPT}</span>
						<span>
							{chars.map((ch, index) => {
								if (index === caretPosition) {
									return (
										<span
											// eslint-disable-next-line react/no-array-index-key
											key={index}
											className="inline-block bg-gray-300 text-black animate-pulse"
										>
											{ch || " "}
										</span>
									)
								}
								// eslint-disable-next-line react/no-array-index-key
								return <span key={index}>{ch}</span>
							})}
							{caretPosition === chars.length && <span className="inline-block w-[0.6ch] h-4 bg-gray-300 animate-pulse align-middle" />}
						</span>
					</div>
				</form>
			</div>
		</div>
	)
}

export default App
