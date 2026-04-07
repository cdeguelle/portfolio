import { useState, useEffect, useRef } from "react"

type TerminalLine = { type: "cmd" | "out" | "pwd"; text: string }
type Mode = "normal" | "password" | "transitioning"

// ── Fake filesystem ──────────────────────────────────────────────────────────
type FSDir = { [name: string]: FSDir | string }

const FS: FSDir = {
	"about.txt": "User    : Clément Deguelle\nRole    : Creative Fullstack Developer\nPassion : Creative interfaces & interactive experiences\nStatus  : Always curious, always experimenting.",
	"skills.txt": "Frontend  : React · TypeScript · Next.js · Vite · React Native\n3D/WebGL  : Three.js · GLSL · WebGL\nAnimation : GSAP · ScrollTrigger · Canvas API\nBackend   : Node.js · Express · MongoDB · PostgreSQL · Firebase\nDevOps    : Docker · CI/CD\nUI/UX     : Figma",
	"contact.txt": "Email    : clement.deguelle@hotmail.com\nGitHub   : github.com/cdeguelle\nLinkedIn : linkedin.com/in/clement-deguelle",
	projects: {
		"mobile-app.txt": "Delivery driver schedule manager.\nRoute planning, absence tracking, live stats, event management.\nStack: React Native · Expo · Node.js · PostgreSQL",
		"3d-isometric-map.txt": "Interactive 3D globe rendered with Three.js.\nNASA GeoTIFF elevation data → custom terrain mesh.\nStack: Three.js · WebGL · GLSL",
		"le-petit-crocus.txt": "Florist e-commerce website.\nStack: Next.js · TypeScript · Stripe",
		"discord-bot.txt": "Feature-rich Discord bot for community management.\nStack: Node.js · Discord.js · MongoDB",
	},
	system: {
		"ver.txt": "Clément OS [Version 1.0.2026]\n(C) Clément Deguelle. All rights reserved.",
		"config.sys": "DEVICE=C:\\WINDOWS\\HIMEM.SYS\nDEVICE=C:\\WINDOWS\\EMM386.EXE\nFILES=40\nBUFFERS=20",
		logs: {
			"boot.log": "[OK] Memory check passed\n[OK] Drivers loaded\n[OK] Network interface up\n[WARN] Anomaly detected in root filesystem\n[OK] System ready",
		},
	},
	// hidden — only visible with ls -a
	".anomaly": "[ENCRYPTED — ATBASH CIPHER]\n\nhfwl yozxpslov\n\n[ACCESS LEVEL: SUPERUSER REQUIRED]\n[hint: the key lies elsewhere]",
}

function getNode(path: string[]): FSDir | string | null {
	let node: FSDir | string = FS
	for (const seg of path) {
		if (typeof node === "string") return null
		if (!(seg in node)) return null
		node = node[seg]
	}
	return node
}

function listDir(path: string[], showHidden: boolean): string[] {
	const node = getNode(path)
	if (!node || typeof node === "string") return []
	return Object.keys(node).filter((k) => showHidden || !k.startsWith("."))
}

// ── Static command outputs (keep legacy DOS commands) ────────────────────────
const LEGACY: Record<string, TerminalLine[]> = {
	help: [
		{ type: "out", text: "" },
		{ type: "out", text: "── Filesystem ──────────────────────────────" },
		{ type: "out", text: "  ls [-a]          List directory contents" },
		{ type: "out", text: "  ls -a            Show hidden files too" },
		{ type: "out", text: "  cat <file>       Read a file" },
		{ type: "out", text: "  cd <dir>         Change directory" },
		{ type: "out", text: "  cd ..            Go up one level" },
		{ type: "out", text: "  pwd              Print working directory" },
		{ type: "out", text: "  whoami           Print current user" },
		{ type: "out", text: "" },
		{ type: "out", text: "── System ──────────────────────────────────" },
		{ type: "out", text: "  about            About this machine" },
		{ type: "out", text: "  skills           Tech stack" },
		{ type: "out", text: "  contact          Contact details" },
		{ type: "out", text: "  ver              OS version" },
		{ type: "out", text: "  echo <text>      Print text" },
		{ type: "out", text: "  clear / cls      Clear screen" },
		{ type: "out", text: "  sudo <cmd>       Run as superuser" },
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

const SUDO_PASSWORD = "singularity"

const TRANSITION_LINES = [
	"",
	"Authenticating...",
	"Access granted. Initiating blackhole sequence...",
	"[WARNING] Spacetime curvature detected",
	"[WARNING] Event horizon approaching",
	"Collapsing filesystem...",
	"",
]

export function TerminalContent() {
	const MONO: React.CSSProperties = { fontFamily: '"Courier New", monospace', fontSize: 12 }

	const [lines, setLines] = useState<TerminalLine[]>(BOOT_LINES)
	const [input, setInput] = useState("")
	const [history, setHistory] = useState<string[]>([])
	const [historyIdx, setHistoryIdx] = useState(-1)
	const [cwdPath, setCwdPath] = useState<string[]>([]) // [] = root C:\
	const [mode, setMode] = useState<Mode>("normal")
	const [sudoAttempts, setSudoAttempts] = useState(0)
	const [, setPendingSudoCmd] = useState("")
	const bottomRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const prompt = cwdPath.length === 0 ? "C:\\>" : `C:\\${cwdPath.join("\\")}>`

	useEffect(() => {
		bottomRef.current?.scrollIntoView()
	}, [lines])

	const addLines = (newLines: TerminalLine[]) => setLines((prev) => [...prev, ...newLines])

	const runCommand = (raw: string) => {
		const cmd = raw.trim()
		const lower = cmd.toLowerCase()
		const parts = cmd.split(/\s+/)
		const verb = parts[0]?.toLowerCase() ?? ""
		const args = parts.slice(1)

		// ── Password mode ────────────────────────────────────────────────────
		if (mode === "password") {
			const attempts = sudoAttempts + 1
			if (cmd === SUDO_PASSWORD) {
				setSudoAttempts(0)
				setMode("transitioning")
				const tLines = TRANSITION_LINES.map((t) => ({ type: "out" as const, text: t }))
				addLines(tLines)
				setInput("")
				setTimeout(() => {
					window.dispatchEvent(new CustomEvent("blackhole-easter-egg"))
				}, 2200)
			} else if (attempts >= 3) {
				addLines([
					{ type: "out", text: "Sorry, 3 incorrect password attempts." },
					{ type: "out", text: "" },
				])
				setSudoAttempts(0)
				setMode("normal")
				setPendingSudoCmd("")
				setInput("")
			} else {
				addLines([{ type: "out", text: `[sudo] Wrong password. ${3 - attempts} attempt(s) remaining.` }])
				setSudoAttempts(attempts)
				setInput("")
			}
			return
		}

		if (mode === "transitioning") {
			setInput("")
			return
		}

		// ── Normal mode ──────────────────────────────────────────────────────
		if (!cmd) {
			addLines([{ type: "cmd", text: "" }])
			setInput("")
			return
		}

		const cmdLine: TerminalLine = { type: "cmd", text: cmd }

		if (lower === "cls" || lower === "clear") {
			setLines([])
			setInput("")
			setHistoryIdx(-1)
			return
		}

		// Legacy shortcuts
		if (LEGACY[lower]) {
			addLines([cmdLine, ...LEGACY[lower]])
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// echo
		if (verb === "echo") {
			const text = args.join(" ")
			addLines([cmdLine, { type: "out", text }])
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// pwd
		if (verb === "pwd") {
			const p = cwdPath.length === 0 ? "C:\\" : `C:\\${cwdPath.join("\\")}`
			addLines([cmdLine, { type: "out", text: p }, { type: "out", text: "" }])
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// whoami
		if (verb === "whoami") {
			addLines([cmdLine, { type: "out", text: "guest" }, { type: "out", text: "" }])
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// ls
		if (verb === "ls") {
			const showHidden = args.includes("-a")
			const entries = listDir(cwdPath, showHidden)
			const node = getNode(cwdPath)
			const outLines: TerminalLine[] = [cmdLine, { type: "out", text: "" }]
			if (!node || typeof node === "string") {
				outLines.push({ type: "out", text: "ls: cannot read directory" })
			} else {
				entries.forEach((name) => {
					const child = (node as FSDir)[name]
					const isDir = typeof child === "object"
					const hidden = name.startsWith(".")
					const color = hidden ? "#808080" : isDir ? "#4fc3f7" : "#c0c0c0"
					outLines.push({ type: "out", text: isDir ? `${name}/` : name })
					// We'll color via a custom type — handled in render
					void color
				})
				// Re-push with color data via special encoding
				outLines.splice(2) // remove the pushed lines
				entries.forEach((name) => {
					const child = (node as FSDir)[name]
					const isDir = typeof child === "object"
					outLines.push({
						type: "out",
						text: isDir ? `\x01${name}/` : name.startsWith(".") ? `\x02${name}` : name,
					})
				})
			}
			outLines.push({ type: "out", text: "" })
			addLines(outLines)
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// cat
		if (verb === "cat") {
			const target = args[0]
			if (!target) {
				addLines([cmdLine, { type: "out", text: "cat: missing operand" }, { type: "out", text: "" }])
			} else {
				// Look in cwd first, then root for hidden files
				const lookupPath = [...cwdPath, target]
				const node = getNode(lookupPath)
				// also allow cat of hidden files at root
				const rootNode = getNode([target])
				const resolved = node ?? rootNode
				if (!resolved) {
					addLines([cmdLine, { type: "out", text: `cat: ${target}: No such file` }, { type: "out", text: "" }])
				} else if (typeof resolved === "object") {
					addLines([cmdLine, { type: "out", text: `cat: ${target}: Is a directory` }, { type: "out", text: "" }])
				} else {
					const fileLines: TerminalLine[] = [cmdLine, { type: "out", text: "" }]
					resolved.split("\n").forEach((l) => fileLines.push({ type: "out", text: l }))
					fileLines.push({ type: "out", text: "" })
					addLines(fileLines)
				}
			}
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// cd
		if (verb === "cd") {
			const target = args[0]
			if (!target || target === ".") {
				addLines([cmdLine])
			} else if (target === "..") {
				const newPath = cwdPath.slice(0, -1)
				setCwdPath(newPath)
				addLines([cmdLine])
			} else {
				const newPath = [...cwdPath, target]
				const node = getNode(newPath)
				if (!node) {
					addLines([cmdLine, { type: "out", text: `cd: ${target}: No such directory` }, { type: "out", text: "" }])
				} else if (typeof node === "string") {
					addLines([cmdLine, { type: "out", text: `cd: ${target}: Not a directory` }, { type: "out", text: "" }])
				} else {
					setCwdPath(newPath)
					addLines([cmdLine])
				}
			}
			setHistory((prev) => [cmd, ...prev])
			setHistoryIdx(-1)
			setInput("")
			return
		}

		// sudo
		if (verb === "sudo") {
			const subcmd = args.join(" ")
			if (subcmd.toLowerCase() === "blackhole") {
				addLines([cmdLine, { type: "out", text: `[sudo] password for guest:` }])
				setPendingSudoCmd(subcmd)
				setMode("password")
				setHistory((prev) => [cmd, ...prev])
				setHistoryIdx(-1)
				setInput("")
			} else {
				addLines([
					cmdLine,
					{ type: "out", text: `sudo: ${subcmd || "(empty)"}: command not found` },
					{ type: "out", text: "" },
				])
				setHistory((prev) => [cmd, ...prev])
				setHistoryIdx(-1)
				setInput("")
			}
			return
		}

		// Unknown
		addLines([
			cmdLine,
			{ type: "out", text: "" },
			{ type: "out", text: `'${cmd}' is not recognized as an internal or external command.` },
			{ type: "out", text: 'Type "help" for a list of available commands.' },
			{ type: "out", text: "" },
		])
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

	const renderOutText = (text: string) => {
		if (text.startsWith("\x01")) {
			// directory
			return <span style={{ color: "#4fc3f7" }}>{text.slice(1)}</span>
		}
		if (text.startsWith("\x02")) {
			// hidden file
			return <span style={{ color: "#808080" }}>{text.slice(1)}</span>
		}
		return <span>{text || "\u00A0"}</span>
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
							<span style={{ color: "#ffff00" }}>{prompt}</span>
							<span style={{ color: "#ffffff" }}> {line.text}</span>
						</>
					) : (
						renderOutText(line.text)
					)}
				</div>
			))}

			{mode !== "transitioning" && (
				<div style={{ display: "flex", alignItems: "center", lineHeight: 1.6 }}>
					<span style={{ color: "#ffff00", flexShrink: 0 }}>
						{mode === "password" ? "" : `${prompt} `}
					</span>
					<input
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						autoFocus
						spellCheck={false}
						type={mode === "password" ? "password" : "text"}
						style={{ background: "transparent", border: "none", outline: "none", color: "#ffffff", ...MONO, flex: 1, padding: 0, caretColor: "#ffffff" }}
					/>
				</div>
			)}
			<div ref={bottomRef} />
		</div>
	)
}
