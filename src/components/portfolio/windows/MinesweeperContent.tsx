import { useState, useEffect, useRef, useCallback } from "react"
import { BG, FONT, raised, sunken } from "../theme"

// ── Cell sprites (38×38) ──────────────────────────────────────────────────────
import squareDefault from "../../../assets/minesweeper/Square/Square=Default.svg"
import squareRevealed from "../../../assets/minesweeper/Square/Rectangle 1.svg"
import square1 from "../../../assets/minesweeper/Square/Square=1.svg"
import square2 from "../../../assets/minesweeper/Square/Square=2.svg"
import square3 from "../../../assets/minesweeper/Square/Square=3.svg"
import square4 from "../../../assets/minesweeper/Square/Square=4.svg"
import square5 from "../../../assets/minesweeper/Square/Square=5.svg"
import square6 from "../../../assets/minesweeper/Square/Square=6.svg"
import square7 from "../../../assets/minesweeper/Square/Square=7.svg"
import squareBang from "../../../assets/minesweeper/Square/Square=Bang.svg"
import squareMine from "../../../assets/minesweeper/Square/Square=Mine.svg"
import squareMineX from "../../../assets/minesweeper/Square/Square=Mine X.svg"
import squareFlag from "../../../assets/minesweeper/Square/Square=Flag.svg"
import squareQuestion from "../../../assets/minesweeper/Square/Square=Question.svg"

// ── Face sprites (37×37) ─────────────────────────────────────────────────────
import faceYay from "../../../assets/minesweeper/Face/Face=Yay.svg"
import faceNay from "../../../assets/minesweeper/Face/Face=Nay.svg"

// ── Score digit sprites (26×50) ───────────────────────────────────────────────
import score0 from "../../../assets/minesweeper/Score/Score=0.svg"
import score1 from "../../../assets/minesweeper/Score/Score=1.svg"
import score2 from "../../../assets/minesweeper/Score/Score=2.svg"
import score3 from "../../../assets/minesweeper/Score/Score=3.svg"
import score4 from "../../../assets/minesweeper/Score/Score=4.svg"
import score5 from "../../../assets/minesweeper/Score/Score=5.svg"
import score6 from "../../../assets/minesweeper/Score/Score=6.svg"
import score7 from "../../../assets/minesweeper/Score/Score=7.svg"
import score8 from "../../../assets/minesweeper/Score/Score=8.svg"
import score9 from "../../../assets/minesweeper/Score/Score=9.svg"

// ── Game constants ────────────────────────────────────────────────────────────
const ROWS = 8
const COLS = 8
const MINES = 10
const CELL = 38

const SCORE_DIGITS = [score0, score1, score2, score3, score4, score5, score6, score7, score8, score9]
const NUMBER_SQUARES = [square1, square2, square3, square4, square5, square6, square7]

type CellState = "hidden" | "flagged" | "question" | "revealed"
type GameState = "idle" | "playing" | "won" | "lost"

interface Cell {
	mine: boolean
	adj: number
	state: CellState
	exploded?: boolean
	wrongFlag?: boolean
}

// ── Game helpers ──────────────────────────────────────────────────────────────
function makeGrid(): Cell[][] {
	return Array.from({ length: ROWS }, () =>
		Array.from({ length: COLS }, () => ({ mine: false, adj: 0, state: "hidden" as CellState }))
	)
}

function placeMines(grid: Cell[][], safeR: number, safeC: number): Cell[][] {
	const g = grid.map((row) => row.map((cell) => ({ ...cell })))
	let count = 0
	while (count < MINES) {
		const r = Math.floor(Math.random() * ROWS)
		const c = Math.floor(Math.random() * COLS)
		if (g[r][c].mine || (r === safeR && c === safeC)) continue
		g[r][c].mine = true
		count++
	}
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			if (g[r][c].mine) continue
			let adj = 0
			for (let dr = -1; dr <= 1; dr++)
				for (let dc = -1; dc <= 1; dc++) {
					if (!dr && !dc) continue
					const nr = r + dr, nc = c + dc
					if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc].mine) adj++
				}
			g[r][c].adj = adj
		}
	}
	return g
}

function floodReveal(grid: Cell[][], startR: number, startC: number): Cell[][] {
	const g = grid.map((row) => row.map((cell) => ({ ...cell })))
	const queue: [number, number][] = [[startR, startC]]
	const visited = new Set<string>()
	while (queue.length > 0) {
		const [r, c] = queue.shift()!
		const key = `${r},${c}`
		if (visited.has(key) || r < 0 || r >= ROWS || c < 0 || c >= COLS) continue
		visited.add(key)
		const cell = g[r][c]
		if (cell.state === "revealed" || cell.state === "flagged") continue
		cell.state = "revealed"
		if (cell.adj === 0 && !cell.mine)
			for (let dr = -1; dr <= 1; dr++)
				for (let dc = -1; dc <= 1; dc++) {
					if (!dr && !dc) continue
					queue.push([r + dr, c + dc])
				}
	}
	return g
}

function checkWin(grid: Cell[][]): boolean {
	return grid.every((row) => row.every((cell) => cell.mine || cell.state === "revealed"))
}

function getCellSprite(cell: Cell): string {
	if (cell.state === "flagged") return squareFlag
	if (cell.state === "question") return squareQuestion
	if (cell.state === "hidden") return squareDefault
	// revealed
	if (cell.wrongFlag) return squareMineX
	if (cell.mine) return cell.exploded ? squareBang : squareMine
	if (cell.adj === 0) return squareRevealed
	return NUMBER_SQUARES[cell.adj - 1]
}

// ── LCD display (90×54, matching Figma) ───────────────────────────────────────
function LcdDisplay({ value }: { value: number }) {
	const clamped = Math.min(Math.max(Math.round(value), 0), 999)
	const digits = clamped.toString().padStart(3, "0").split("")
	return (
		<div
			style={{
				width: 90,
				height: 54,
				background: "#000",
				...sunken,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: 2,
				boxSizing: "border-box",
				flexShrink: 0,
			}}
		>
			{digits.map((d, i) => (
				<img key={i} src={SCORE_DIGITS[parseInt(d)]} width={26} height={50} draggable={false} />
			))}
		</div>
	)
}

// ── Face button (56×56, matching Figma Material-Out) ─────────────────────────
function FaceButton({ dead, onClick }: { dead: boolean; onClick: () => void }) {
	const [pressed, setPressed] = useState(false)
	return (
		<div
			onMouseDown={() => setPressed(true)}
			onMouseUp={() => { setPressed(false); onClick() }}
			onMouseLeave={() => setPressed(false)}
			style={{
				...(pressed ? sunken : raised),
				width: 56,
				height: 56,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				userSelect: "none",
				background: BG,
				boxSizing: "border-box",
				flexShrink: 0,
			}}
		>
			<img src={dead ? faceYay : faceNay} width={37} height={37} draggable={false} />
		</div>
	)
}

// ── Game ──────────────────────────────────────────────────────────────────────
export function MinesweeperContent() {
	const [grid, setGrid] = useState<Cell[][]>(makeGrid)
	const [gameState, setGameState] = useState<GameState>("idle")
	const [time, setTime] = useState(0)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const flagCount = grid.flat().filter((c) => c.state === "flagged").length
	const minesLeft = MINES - flagCount

	useEffect(() => {
		if (gameState === "playing") {
			timerRef.current = setInterval(() => setTime((t) => Math.min(t + 1, 999)), 1000)
		} else {
			if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
		}
		return () => { if (timerRef.current) clearInterval(timerRef.current) }
	}, [gameState])

	const reset = useCallback(() => {
		if (timerRef.current) clearInterval(timerRef.current)
		setGrid(makeGrid())
		setGameState("idle")
		setTime(0)
	}, [])

	const handleCellClick = useCallback(
		(r: number, c: number) => {
			if (gameState === "won" || gameState === "lost") return
			const cell = grid[r][c]
			if (cell.state === "flagged" || cell.state === "question" || cell.state === "revealed") return

			let g = grid
			if (gameState === "idle") {
				g = placeMines(grid, r, c)
				setGameState("playing")
			}

			if (g[r][c].mine) {
				const lost = g.map((row) => row.map((c) => ({ ...c })))
				lost[r][c] = { ...lost[r][c], state: "revealed", exploded: true }
				for (let i = 0; i < ROWS; i++)
					for (let j = 0; j < COLS; j++) {
						if (i === r && j === c) continue
						const cell = lost[i][j]
						if (cell.mine && cell.state !== "flagged") lost[i][j] = { ...cell, state: "revealed" }
						else if (!cell.mine && cell.state === "flagged") lost[i][j] = { ...cell, state: "revealed", wrongFlag: true }
					}
				setGrid(lost)
				setGameState("lost")
				return
			}

			const revealed = floodReveal(g, r, c)
			setGrid(revealed)
			if (checkWin(revealed)) setGameState("won")
		},
		[grid, gameState]
	)

	const handleRightClick = useCallback(
		(e: React.MouseEvent, r: number, c: number) => {
			e.preventDefault()
			if (gameState !== "playing") return
			const cell = grid[r][c]
			if (cell.state === "revealed") return
			const newGrid = grid.map((row) => row.map((c) => ({ ...c })))
			const cur = newGrid[r][c]
			if (cur.state === "hidden") newGrid[r][c].state = "flagged"
			else if (cur.state === "flagged") newGrid[r][c].state = "question"
			else newGrid[r][c].state = "hidden"
			setGrid(newGrid)
		},
		[grid, gameState]
	)

	const isInteractable = (cell: Cell) =>
		cell.state !== "revealed" && gameState !== "won" && gameState !== "lost"

	return (
		<div
			style={{
				fontFamily: FONT,
				background: BG,
				padding: 8,
				display: "flex",
				flexDirection: "column",
				gap: 6,
				width: "fit-content",
				margin: "0 auto",
			}}
		>
			{/* Header */}
			<div
				style={{
					...sunken,
					padding: "6px 10px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 8,
				}}
			>
				<LcdDisplay value={minesLeft} />
				<FaceButton dead={gameState === "lost"} onClick={reset} />
				<LcdDisplay value={time} />
			</div>

			{/* Grid */}
			<div style={{ ...sunken, padding: 6, display: "inline-block" }}>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						width: COLS * CELL,
					}}
				>
					{grid.map((row, r) =>
						row.map((cell, c) => (
							<img
								key={`${r}-${c}`}
								src={getCellSprite(cell)}
								width={CELL}
								height={CELL}
								draggable={false}
								onClick={() => handleCellClick(r, c)}
								onContextMenu={(e) => handleRightClick(e, r, c)}
								style={{
									display: "block",
									cursor: isInteractable(cell) ? "pointer" : "default",
									userSelect: "none",
								}}
							/>
						))
					)}
				</div>
			</div>
		</div>
	)
}
