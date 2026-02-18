import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import LoadingProcess from "./components/LoadingProcess"
import Portfolio from "./components/Portfolio"

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
}

type AppMode = "terminal" | "loading" | "portfolio"

function App() {
	const [appMode, setAppMode] = useState<AppMode>("terminal")
	const [lines, setLines] = useState<Line[]>([])
	const [input, setInput] = useState("")
	const [cursorIndex, setCursorIndex] = useState(0)
	const [history, setHistory] = useState<string[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)

	const inputRef = useRef<HTMLInputElement | null>(null)
	const terminalRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	useEffect(() => {
		terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: "smooth" })
	}, [lines])

	const handleSubmit = useCallback(
		(event: FormEvent) => {
			event.preventDefault()
			const trimmed = input.trim()
			if (!trimmed) return

			const command = trimmed.toLowerCase()

			// Commande clear : on nettoie l'historique sans ajouter de nouvelle ligne
			if (command === "clear") {
				setLines([])
				setHistory((prev) => [...prev, trimmed])
				setHistoryIndex(-1)
				setInput("")
				setCursorIndex(0)
				return
			}

			// Commande run great-exp : lance le process de chargement
			if (command === "run great-exp") {
				setHistory((prev) => [...prev, trimmed])
				setHistoryIndex(-1)
				setInput("")
				setCursorIndex(0)
				setAppMode("loading")
				return
			}

			let output: string[] | undefined

			switch (command) {
				case "help":
					output = [
						`
╭─── Portfolio v1.0.0 ──────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                       │                                                                                   │
│       Welcome back !                  │ Available commands                                                                │
│                                       │ ─────────────────────────────────────────────────────────────────                 │
│              	   / _)                 │ help : show the list of commands                                                  │
│         _.----._/ /                   │ about : about me                                                                  │
│        /         /                    │ projects : some selected projects                                                 │
│     __/ (  | (  |                     │ contact : contact me                                                              │
│    /__.-'|_|--|_|                     │ clear : clear the terminal                                                        │
│                                       │ run great-exp : run the great-exp project                                         │
│      Dino 4.6 · Jurassic Pro          │                                                                                   │
│   ~/Documents/GitHub/portfolio        │                                                                                   │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
						`,
					]
					break
				case "about":
					output = [
						"Hey I'm Clément, creative & fullstack developer.",
						"I love building weird web experiences, playable & memorable,",
						"at the crossroads of code, design & interaction.",
					]
					break
				case "projects":
					output = [
						"[01] Mobile app                                     — React Native, TypeScript, Expo",
						"[02] 3D isometric & interactive map                 — Three.js, WebGL, React",
						"[03] Website for restaurant 'le petit crocus'       — Typescript, Next.js",
						"[04] Discord bot                                    — Javascript, Discord.js",
					]
					break
				case "contact":
					output = ["Email   : clement.deguelle@gmail.com", "GitHub  : github.com/cdeguelle", "LinkedIn: linkedin.com/in/clement-deguelle"]
					break
				default:
					output = [`Unknown command: ${trimmed}`, "Use 'help' to see the available commands."]
					break
			}

			const id = Date.now()

			const newLine: Line = {
				id,
				command: trimmed,
				output,
			}

			setLines((prev) => [...prev, newLine])
			setHistory((prev) => [...prev, trimmed])
			setHistoryIndex(-1)
			setInput("")
			setCursorIndex(0)
		},
		[input],
	)

	const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setInput(value)
		const pos = event.target.selectionStart ?? value.length
		setCursorIndex(pos)
	}, [])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "ArrowUp") {
				event.preventDefault()
				if (history.length === 0) return
				const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
				setHistoryIndex(newIndex)
				const cmd = history[newIndex]
				setInput(cmd)
				setCursorIndex(cmd.length)
			} else if (event.key === "ArrowDown") {
				event.preventDefault()
				if (historyIndex === -1) return
				const newIndex = historyIndex + 1
				if (newIndex >= history.length) {
					setHistoryIndex(-1)
					setInput("")
					setCursorIndex(0)
				} else {
					setHistoryIndex(newIndex)
					const cmd = history[newIndex]
					setInput(cmd)
					setCursorIndex(cmd.length)
				}
			}
		},
		[history, historyIndex],
	)

	const syncCursorFromInput = useCallback(() => {
		const el = inputRef.current
		if (!el) return
		const pos = el.selectionStart ?? input.length
		setCursorIndex(pos)
	}, [input])

	const caretPosition = Math.min(cursorIndex, input.length)
	const chars = input.split("")

	if (appMode === "loading") {
		return <LoadingProcess onComplete={() => setAppMode("portfolio")} />
	}

	if (appMode === "portfolio") {
		return <Portfolio onBack={() => setAppMode("terminal")} />
	}

	return (
		<div ref={terminalRef} className="h-screen overflow-y-auto bg-[#141414] text-gray-200 font-mono text-sm">
			<div className="p-4 space-y-1">
				<pre className="mb-3 text-orange-400 whitespace-pre leading-tight">{ASCII_ART}</pre>
				<pre className="mb-3 text-blue-400 whitespace-pre leading-tight">{ASCII_ART_2}</pre>

				{lines.map((line) => (
					<div key={line.id} className="whitespace-pre-wrap">
						<div>
							<span className="text-green-400">{PROMPT}</span> <span>{line.command}</span>
						</div>
						{line.output && <pre className="mt-1 pl-4 text-red-400 whitespace-pre-wrap">{line.output.join("\n")}</pre>}
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
						onKeyDown={handleKeyDown}
						onKeyUp={syncCursorFromInput}
					/>
					<div className="flex items-center">
						<span className="mr-2 text-green-400">{PROMPT}</span>
						<span>
							{chars.map((ch, index) => {
								if (index === caretPosition) {
									return (
										<span key={index} className="inline-block bg-gray-300 text-black animate-pulse">
											{ch || " "}
										</span>
									)
								}
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
