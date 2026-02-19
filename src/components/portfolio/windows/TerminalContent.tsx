import { useState, useEffect, useRef } from "react"

type TerminalLine = { type: "cmd" | "out"; text: string }

const COMMANDS: Record<string, TerminalLine[]> = {
	help: [
		{ type: "out", text: "" },
		{ type: "out", text: "ABOUT    Infos about Clément Deguelle" },
		{ type: "out", text: "CONTACT  Display contact details" },
		{ type: "out", text: "DIR      List portfolio projects" },
		{ type: "out", text: "ECHO     Display a message" },
		{ type: "out", text: "HELP     Show this help" },
		{ type: "out", text: "SKILLS   Display tech stack" },
		{ type: "out", text: "VER      Display OS version" },
		{ type: "out", text: "CLS      Clear the screen" },
		{ type: "out", text: "" },
	],
	ver: [
		{ type: "out", text: "" },
		{ type: "out", text: "Clément OS [Version 1.0.2026]" },
		{ type: "out", text: "" },
	],
	about: [
		{ type: "out", text: "" },
		{ type: "out", text: "User    : Clément Deguelle" },
		{ type: "out", text: "Role    : Creative Fullstack Developer" },
		{ type: "out", text: "Passion : Creative interfaces & interactive experiences" },
		{ type: "out", text: "Status  : Always curious, always experimenting." },
		{ type: "out", text: "" },
	],
	dir: [
		{ type: "out", text: "" },
		{ type: "out", text: " Volume in drive C is PORTFOLIO" },
		{ type: "out", text: " Directory of C:\\Projects" },
		{ type: "out", text: "" },
		{ type: "out", text: "19/02/2026  <DIR>  mobile-app" },
		{ type: "out", text: "19/02/2026  <DIR>  3d-isometric-map" },
		{ type: "out", text: "19/02/2026  <DIR>  le-petit-crocus" },
		{ type: "out", text: "19/02/2026  <DIR>  discord-bot" },
		{ type: "out", text: "" },
		{ type: "out", text: "  4 Dir(s)" },
		{ type: "out", text: "" },
	],
	skills: [
		{ type: "out", text: "" },
		{ type: "out", text: "Frontend  : React · TypeScript · Next.js · Vite · React Native" },
		{ type: "out", text: "3D/WebGL  : Three.js · GLSL · WebGL" },
		{ type: "out", text: "Animation : GSAP · ScrollTrigger · Canvas API" },
		{ type: "out", text: "Backend   : Node.js · Express · MongoDB · PostgreSQL · Firebase" },
		{ type: "out", text: "DevOps    : Docker · CI/CD" },
		{ type: "out", text: "UI/UX     : Figma" },
		{ type: "out", text: "" },
	],
	contact: [
		{ type: "out", text: "" },
		{ type: "out", text: "Email    : clement.deguelle@hotmail.com" },
		{ type: "out", text: "GitHub   : github.com/cdeguelle" },
		{ type: "out", text: "LinkedIn : linkedin.com/in/clement-deguelle" },
		{ type: "out", text: "" },
	],
}

const BOOT_LINES: TerminalLine[] = [
	{ type: "out", text: "Clément OS [Version 1.0.2026]" },
	{ type: "out", text: "(C) Clément Deguelle. All rights reserved." },
	{ type: "out", text: "" },
	{ type: "out", text: 'Type "help" for a list of available commands.' },
	{ type: "out", text: "" },
]

export function TerminalContent() {
	const PROMPT = "C:\\>"
	const MONO: React.CSSProperties = { fontFamily: '"Courier New", monospace', fontSize: 12 }

	const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES)
	const [input, setInput] = useState("")
	const [history, setHistory] = useState<string[]>([])
	const [historyIdx, setHistoryIdx] = useState(-1)
	const bottomRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		bottomRef.current?.scrollIntoView()
	}, [lines])

	const runCommand = (raw: string) => {
		const cmd = raw.trim()
		const lower = cmd.toLowerCase()

		if (lower === "cls" || lower === "clear") {
			setLines([])
			setInput("")
			setHistoryIdx(-1)
			return
		}

		const newLines: TerminalLine[] = [{ type: "cmd", text: cmd }]

		if (!cmd) {
			setLines((prev) => [...prev, { type: "cmd", text: "" }])
			setInput("")
			return
		}

		if (COMMANDS[lower]) {
			newLines.push(...COMMANDS[lower])
		} else if (lower.startsWith("echo ")) {
			newLines.push({ type: "out", text: cmd.slice(5) })
		} else if (lower === "echo") {
			newLines.push({ type: "out", text: "" })
		} else {
			newLines.push(
				{ type: "out", text: "" },
				{ type: "out", text: `'${cmd}' is not recognized as an internal or external command,` },
				{ type: "out", text: "operable program or batch file." },
				{ type: "out", text: "" },
			)
		}

		setLines((prev) => [...prev, ...newLines])
		setHistory((prev) => [cmd, ...prev])
		setHistoryIdx(-1)
		setInput("")
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			runCommand(input)
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			const nextIdx = Math.min(historyIdx + 1, history.length - 1)
			setHistoryIdx(nextIdx)
			setInput(history[nextIdx] ?? "")
		} else if (e.key === "ArrowDown") {
			e.preventDefault()
			const nextIdx = Math.max(historyIdx - 1, -1)
			setHistoryIdx(nextIdx)
			setInput(nextIdx === -1 ? "" : (history[nextIdx] ?? ""))
		}
	}

	return (
		<div
			onClick={() => inputRef.current?.focus()}
			style={{ background: "#000000", color: "#c0c0c0", ...MONO, padding: 8, minHeight: "100%", cursor: "text", boxSizing: "border-box" }}
		>
			{lines.map((line, i) => (
				<div key={i} style={{ lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
					{line.type === "cmd" ? (
						<>
							<span style={{ color: "#ffff00" }}>{PROMPT}</span>
							<span style={{ color: "#ffffff" }}> {line.text}</span>
						</>
					) : (
						<span>{line.text || "\u00A0"}</span>
					)}
				</div>
			))}

			<div style={{ display: "flex", alignItems: "center", lineHeight: 1.6 }}>
				<span style={{ color: "#ffff00", flexShrink: 0 }}>{PROMPT} </span>
				<input
					ref={inputRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					autoFocus
					spellCheck={false}
					style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", ...MONO, flex: 1, padding: 0, caretColor: "#ffffff" }}
				/>
			</div>
			<div ref={bottomRef} />
		</div>
	)
}
