import { useRef, useState, useEffect, useCallback } from "react"
import { BG, FONT, raised, sunken } from "../theme"
import pencilIcon from "../../../assets/pencil.png"
import eraserIcon from "../../../assets/eraser.png"
import { paintBus } from "./paintBus"

type Tool =
	| "free-select" | "rect-select"
	| "eraser"      | "fill"
	| "pick"        | "zoom"
	| "pencil"      | "brush"
	| "airbrush"    | "text"
	| "line"        | "curve"
	| "rect"        | "polygon"
	| "ellipse"     | "rounded-rect"

type Pt = { x: number; y: number }

// Standard Windows 95 palette — 2 rows × 14
const PALETTE = [
	"#000000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080c0","#004080","#8000ff","#804000",
	"#ffffff","#c0c0c0","#ff0000","#ffff00","#00ff00","#00ffff","#0000ff","#ff00ff","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040",
]

const TOOL_GRID: { id: Tool; title: string }[][] = [
	[{ id: "free-select", title: "Free Select"   }, { id: "rect-select",  title: "Selection"      }],
	[{ id: "eraser",      title: "Eraser"         }, { id: "fill",         title: "Fill"           }],
	[{ id: "pick",        title: "Color Picker"   }, { id: "zoom",         title: "Zoom"           }],
	[{ id: "pencil",      title: "Pencil"         }, { id: "brush",        title: "Brush"          }],
	[{ id: "airbrush",    title: "Airbrush"       }, { id: "text",         title: "Text"           }],
	[{ id: "line",        title: "Line"           }, { id: "curve",        title: "Curve"          }],
	[{ id: "rect",        title: "Rectangle"      }, { id: "polygon",      title: "Polygon"        }],
	[{ id: "ellipse",     title: "Ellipse"        }, { id: "rounded-rect", title: "Rounded Rect."  }],
]
const ALL_TOOLS = TOOL_GRID.flat()

const SIZES = [1, 2, 4, 6]
const HAS_SIZE: Tool[] = ["pencil", "eraser", "brush", "airbrush", "line", "rect", "ellipse", "rounded-rect", "curve", "polygon"]
const HISTORY_LIMIT = 15

// ── Pure flood-fill ──────────────────────────────────────────────────────────
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
	const { width, height } = ctx.canvas
	const img = ctx.getImageData(0, 0, width, height)
	const d = img.data
	const i0 = (y * width + x) * 4
	const [tR, tG, tB] = [d[i0], d[i0 + 1], d[i0 + 2]]
	const fR = parseInt(hex.slice(1, 3), 16)
	const fG = parseInt(hex.slice(3, 5), 16)
	const fB = parseInt(hex.slice(5, 7), 16)
	if (tR === fR && tG === fG && tB === fB) return
	const stack: number[][] = [[x, y]]
	while (stack.length) {
		const [cx, cy] = stack.pop()!
		if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
		const ci = (cy * width + cx) * 4
		if (d[ci] !== tR || d[ci + 1] !== tG || d[ci + 2] !== tB) continue
		d[ci] = fR; d[ci + 1] = fG; d[ci + 2] = fB; d[ci + 3] = 255
		stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
	}
	ctx.putImageData(img, 0, 0)
}

// ── Tool icons ────────────────────────────────────────────────────────────────
function ToolIcon({ id }: { id: Tool }) {
	const s: React.CSSProperties = { width: 16, height: 16, display: "block" }
	if (id === "pencil") return <img src={pencilIcon} width={16} height={16} style={{ imageRendering: "pixelated" }} draggable={false} alt="" />
	if (id === "eraser")  return <img src={eraserIcon}  width={16} height={16} style={{ imageRendering: "pixelated" }} draggable={false} alt="" />
	switch (id) {
		case "free-select":  return <svg style={s} viewBox="0 0 16 16"><path d="M5,1 L2,4 L1,8 L2,11 L4,13 L4,15 L14,15 L14,6 L12,6 L12,2 L9,1 Z" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,1"/></svg>
		case "rect-select":  return <svg style={s} viewBox="0 0 16 16"><rect x="2" y="3" width="11" height="9" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,1"/></svg>
		case "fill":         return <svg style={s} viewBox="0 0 16 16"><path d="M9,1 L14,6 L7,13 L2,13 L2,8 Z" fill="none" stroke="#000" strokeWidth="1"/><line x1="11" y1="3" x2="13" y2="5" stroke="#000" strokeWidth="1"/><path d="M2,13 L1,14 Q1,16 3,15 L4,13 Z" fill="#000"/><circle cx="13.5" cy="13.5" r="1.5" fill="#000"/></svg>
		case "pick":         return <svg style={s} viewBox="0 0 16 16"><path d="M11,1 L14,4 L6,12 L2,13 L2,10 Z" fill="white" stroke="#000" strokeWidth="1"/><line x1="9" y1="3" x2="12" y2="6" stroke="#000" strokeWidth="1"/></svg>
		case "zoom":         return <svg style={s} viewBox="0 0 16 16"><circle cx="6" cy="6" r="4" fill="none" stroke="#000" strokeWidth="1.5"/><line x1="9" y1="9" x2="14" y2="14" stroke="#000" strokeWidth="2" strokeLinecap="round"/><text x="3.5" y="9" fontSize="7" fontFamily="sans-serif" fill="#000">+</text></svg>
		case "brush":        return <svg style={s} viewBox="0 0 16 16"><path d="M13,1 L15,3 L7,11 L4,11 L4,8 Z" fill="none" stroke="#000" strokeWidth="1"/><line x1="11" y1="3" x2="13" y2="5" stroke="#000" strokeWidth="1"/><path d="M4,11 Q2,13 3,15 Q5,16 5,14 L4,11 Z" fill="#000"/></svg>
		case "airbrush":     return <svg style={s} viewBox="0 0 16 16"><rect x="1" y="7" width="8" height="6" rx="1" fill="none" stroke="#000" strokeWidth="1"/><rect x="3" y="4" width="4" height="3" fill="none" stroke="#000" strokeWidth="1"/><line x1="9" y1="10" x2="15" y2="10" stroke="#000" strokeWidth="1"/>{([[12,5],[14,6],[11,7],[13,8],[15,5]] as [number,number][]).map(([x,y],i) => <circle key={i} cx={x} cy={y} r="0.8" fill="#000"/>)}</svg>
		case "text":         return <svg style={s} viewBox="0 0 16 16"><text x="2" y="14" fontSize="14" fontFamily="serif" fontWeight="bold" fill="#000">A</text></svg>
		case "line":         return <svg style={s} viewBox="0 0 16 16"><line x1="2" y1="14" x2="14" y2="2" stroke="#000" strokeWidth="1.5"/></svg>
		case "curve":        return <svg style={s} viewBox="0 0 16 16"><path d="M2,14 Q4,4 14,3" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
		case "rect":         return <svg style={s} viewBox="0 0 16 16"><rect x="2" y="3" width="11" height="9" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
		case "polygon":      return <svg style={s} viewBox="0 0 16 16"><polygon points="8,1 14,6 12,14 4,14 1,7" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
		case "ellipse":      return <svg style={s} viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
		case "rounded-rect": return <svg style={s} viewBox="0 0 16 16"><rect x="2" y="3" width="11" height="9" rx="3" ry="3" fill="none" stroke="#000" strokeWidth="1.5"/></svg>
		default:             return <svg style={s} viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" fill="none" stroke="#000"/></svg>
	}
}

// ── Component ─────────────────────────────────────────────────────────────────
export function PaintContent() {
	const canvasRef    = useRef<HTMLCanvasElement>(null)
	const overlayRef   = useRef<HTMLCanvasElement>(null)
	const textInputRef = useRef<HTMLInputElement>(null)

	// UI state
	const [tool,         setTool]         = useState<Tool>("pencil")
	const [color,        setColor]        = useState("#000000")
	const [bgColor,      setBgColor]      = useState("#ffffff")
	const [size,         setSize]         = useState(2)
	const [zoom,         setZoom]         = useState(1)
	const [cursorPos,    setCursorPos]    = useState<Pt | null>(null)
	const [textPos,      setTextPos]      = useState<Pt | null>(null)
	const [curveWaiting, setCurveWaiting] = useState(false)

	// Refs for stable callbacks
	const toolRef      = useRef(tool)
	const colorRef     = useRef(color)
	const sizeRef      = useRef(size)
	const zoomRef      = useRef(zoom)
	const textPosRef   = useRef(textPos)

	// Mid-interaction refs
	const drawingRef     = useRef(false)
	const startPosRef    = useRef<Pt | null>(null)
	const curveDataRef   = useRef<{ start: Pt; end: Pt } | null>(null)
	const polygonPtsRef  = useRef<Pt[]>([])

	// Undo / Redo history
	const historyRef = useRef<ImageData[]>([])
	const redoRef    = useRef<ImageData[]>([])

	// Sync state → refs
	useEffect(() => { toolRef.current    = tool    }, [tool])
	useEffect(() => { colorRef.current   = color   }, [color])
	useEffect(() => { sizeRef.current    = size    }, [size])
	useEffect(() => { zoomRef.current    = zoom    }, [zoom])
	useEffect(() => { textPosRef.current = textPos }, [textPos])

	// Init canvas
	useEffect(() => {
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx) return
		ctx.fillStyle = "#ffffff"
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	}, [])

	// Reset tool-specific state on tool change
	useEffect(() => {
		drawingRef.current    = false
		startPosRef.current   = null
		curveDataRef.current  = null
		polygonPtsRef.current = []
		setCurveWaiting(false)
		setTextPos(null)
		const ov = overlayRef.current?.getContext("2d")
		ov?.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
	}, [tool])

	// ── History helpers ────────────────────────────────────────────────────────
	const pushHistory = useCallback(() => {
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx) return
		const snap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
		historyRef.current = [...historyRef.current.slice(-HISTORY_LIMIT), snap]
		redoRef.current = []
	}, [])

	const undo = useCallback(() => {
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx || historyRef.current.length === 0) return
		const current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
		redoRef.current = [current, ...redoRef.current.slice(0, HISTORY_LIMIT)]
		const prev = historyRef.current[historyRef.current.length - 1]
		historyRef.current = historyRef.current.slice(0, -1)
		ctx.putImageData(prev, 0, 0)
	}, [])

	const redo = useCallback(() => {
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx || redoRef.current.length === 0) return
		const current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
		historyRef.current = [...historyRef.current.slice(-HISTORY_LIMIT), current]
		const next = redoRef.current[0]
		redoRef.current = redoRef.current.slice(1)
		ctx.putImageData(next, 0, 0)
	}, [])

	const clearCanvas = useCallback(() => {
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx) return
		pushHistory()
		ctx.fillStyle = "#ffffff"
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	}, [pushHistory])

	const saveImage = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		canvas.toBlob((blob) => {
			if (!blob) return
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = "untitled.png"
			a.click()
			URL.revokeObjectURL(url)
		}, "image/png")
	}, [])

	// Register actions in paint bus (and keyboard shortcuts)
	useEffect(() => {
		paintBus.undo  = undo
		paintBus.redo  = redo
		paintBus.clear = clearCanvas
		paintBus.save  = saveImage

		const onKey = (e: KeyboardEvent) => {
			const ctrl = e.ctrlKey || e.metaKey
			if (!ctrl) return
			if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
			if (e.key === "z" &&  e.shiftKey) { e.preventDefault(); redo() }
			if (e.key === "y")                { e.preventDefault(); redo() }
			if (e.key === "s")                { e.preventDefault(); saveImage() }
		}
		document.addEventListener("keydown", onKey)
		return () => {
			document.removeEventListener("keydown", onKey)
			paintBus.undo  = undefined
			paintBus.redo  = undefined
			paintBus.clear = undefined
			paintBus.save  = undefined
		}
	}, [undo, redo, clearCanvas, saveImage])

	// ── Canvas helpers ─────────────────────────────────────────────────────────
	const clearOverlay = () => {
		const ov = overlayRef.current?.getContext("2d")
		if (ov) ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
	}

	const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Pt => {
		const rect = canvasRef.current!.getBoundingClientRect()
		const z = zoomRef.current
		return { x: Math.round((e.clientX - rect.left) / z), y: Math.round((e.clientY - rect.top) / z) }
	}, [])

	const applyStroke = (ctx: CanvasRenderingContext2D) => {
		ctx.strokeStyle = colorRef.current
		ctx.lineWidth   = sizeRef.current
		ctx.lineCap     = "round"
		ctx.lineJoin    = "round"
		ctx.setLineDash([])
		ctx.globalAlpha = 1
	}

	const drawPolyOverlay = (pts: Pt[], mouse?: Pt) => {
		const ov = overlayRef.current?.getContext("2d")
		if (!ov || pts.length === 0) return
		ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
		ov.strokeStyle = colorRef.current
		ov.lineWidth   = sizeRef.current
		ov.setLineDash([])
		ov.beginPath()
		ov.moveTo(pts[0].x, pts[0].y)
		for (const p of pts.slice(1)) ov.lineTo(p.x, p.y)
		if (mouse) ov.lineTo(mouse.x, mouse.y)
		ov.stroke()
	}

	// ── onMouseDown ────────────────────────────────────────────────────────────
	const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
		if (e.button !== 0) return
		const t   = toolRef.current
		const pos = getPos(e)
		const ctx = canvasRef.current!.getContext("2d")!

		if (t === "fill") {
			pushHistory()
			floodFill(ctx, pos.x, pos.y, colorRef.current)
			return
		}
		if (t === "pick") {
			const px = ctx.getImageData(pos.x, pos.y, 1, 1).data
			setColor("#" + [px[0], px[1], px[2]].map(v => v.toString(16).padStart(2, "0")).join(""))
			return
		}
		if (t === "zoom") { setZoom(z => Math.min(8, z * 2)); return }
		if (t === "text") { setTextPos(pos); setTimeout(() => textInputRef.current?.focus(), 30); return }
		if (t === "polygon") return

		// Curve phase 2 — commit on click
		if (t === "curve" && curveDataRef.current) {
			const { start, end } = curveDataRef.current
			clearOverlay()
			applyStroke(ctx)
			ctx.beginPath()
			ctx.moveTo(start.x, start.y)
			ctx.quadraticCurveTo(pos.x, pos.y, end.x, end.y)
			ctx.stroke()
			curveDataRef.current = null
			setCurveWaiting(false)
			return
		}

		pushHistory()
		startPosRef.current = pos
		drawingRef.current  = true

		if (t === "pencil" || t === "eraser") {
			ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
			ctx.lineWidth = sizeRef.current; ctx.lineCap = "round"; ctx.lineJoin = "round"
			ctx.strokeStyle = t === "eraser" ? "#ffffff" : colorRef.current
			ctx.setLineDash([])
		} else if (t === "brush") {
			ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
			ctx.lineWidth = sizeRef.current * 3; ctx.lineCap = "round"; ctx.lineJoin = "round"
			ctx.strokeStyle = colorRef.current; ctx.globalAlpha = 0.8; ctx.setLineDash([])
		} else if (t === "free-select") {
			const ov = overlayRef.current!.getContext("2d")!
			ov.setLineDash([4, 2]); ov.strokeStyle = "#000"; ov.lineWidth = 1
			ov.beginPath(); ov.moveTo(pos.x, pos.y)
		}
	}, [getPos, pushHistory])

	// ── onMouseMove ────────────────────────────────────────────────────────────
	const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
		const pos = getPos(e)
		setCursorPos(pos)
		const t = toolRef.current

		if (t === "polygon" && polygonPtsRef.current.length > 0) { drawPolyOverlay(polygonPtsRef.current, pos); return }

		if (t === "curve" && curveDataRef.current) {
			const ov = overlayRef.current!.getContext("2d")!
			ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
			ov.strokeStyle = colorRef.current; ov.lineWidth = sizeRef.current; ov.setLineDash([])
			const { start, end } = curveDataRef.current
			ov.beginPath(); ov.moveTo(start.x, start.y)
			ov.quadraticCurveTo(pos.x, pos.y, end.x, end.y); ov.stroke()
			return
		}

		if (!drawingRef.current || !startPosRef.current) return
		const ctx = canvasRef.current!.getContext("2d")!
		const { x: sx, y: sy } = startPosRef.current

		if (t === "pencil" || t === "eraser") { ctx.lineTo(pos.x, pos.y); ctx.stroke(); return }
		if (t === "brush")    { ctx.lineTo(pos.x, pos.y); ctx.stroke(); return }
		if (t === "airbrush") {
			const r = sizeRef.current * 6
			for (let i = 0; i < 25; i++) {
				const a = Math.random() * Math.PI * 2, d = Math.random() * r
				ctx.fillStyle = colorRef.current; ctx.globalAlpha = 0.25
				ctx.fillRect(Math.round(pos.x + Math.cos(a) * d), Math.round(pos.y + Math.sin(a) * d), 1, 1)
			}
			ctx.globalAlpha = 1; return
		}
		if (t === "free-select") {
			const ov = overlayRef.current!.getContext("2d")!
			ov.lineTo(pos.x, pos.y); ov.stroke(); return
		}

		const ov = overlayRef.current!.getContext("2d")!
		ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
		ov.strokeStyle = colorRef.current; ov.lineWidth = sizeRef.current; ov.setLineDash([])

		if      (t === "line")         { ov.beginPath(); ov.moveTo(sx, sy); ov.lineTo(pos.x, pos.y); ov.stroke() }
		else if (t === "rect")         { ov.strokeRect(sx, sy, pos.x - sx, pos.y - sy) }
		else if (t === "rounded-rect") { const w = pos.x-sx, h = pos.y-sy; ov.beginPath(); ov.roundRect(sx, sy, w, h, Math.min(Math.abs(w),Math.abs(h))*0.15); ov.stroke() }
		else if (t === "ellipse")      { const rx=Math.abs(pos.x-sx)/2, ry=Math.abs(pos.y-sy)/2; ov.beginPath(); ov.ellipse(sx+(pos.x-sx)/2, sy+(pos.y-sy)/2, rx, ry, 0, 0, Math.PI*2); ov.stroke() }
		else if (t === "curve")        { ov.beginPath(); ov.moveTo(sx, sy); ov.lineTo(pos.x, pos.y); ov.stroke() }
		else if (t === "rect-select")  { ov.setLineDash([4,2]); ov.strokeStyle="#000"; ov.lineWidth=1; ov.strokeRect(sx, sy, pos.x-sx, pos.y-sy) }
	}, [getPos])

	// ── onMouseUp ──────────────────────────────────────────────────────────────
	const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!drawingRef.current || !startPosRef.current) return
		const pos = getPos(e)
		const ctx = canvasRef.current!.getContext("2d")!
		const t   = toolRef.current
		const { x: sx, y: sy } = startPosRef.current

		if (t === "pencil" || t === "eraser" || t === "brush") {
			ctx.globalAlpha = 1; drawingRef.current = false; startPosRef.current = null; return
		}
		if (t === "airbrush") {
			ctx.globalAlpha = 1; drawingRef.current = false; startPosRef.current = null; return
		}
		if (t === "free-select") {
			const ov = overlayRef.current!.getContext("2d")!
			ov.closePath(); ov.stroke()
			setTimeout(() => clearOverlay(), 1200)
			drawingRef.current = false; startPosRef.current = null; return
		}

		clearOverlay()
		applyStroke(ctx)

		if      (t === "line")         { ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(pos.x, pos.y); ctx.stroke() }
		else if (t === "rect")         { ctx.strokeRect(sx, sy, pos.x-sx, pos.y-sy) }
		else if (t === "rounded-rect") { const w=pos.x-sx, h=pos.y-sy; ctx.beginPath(); ctx.roundRect(sx, sy, w, h, Math.min(Math.abs(w),Math.abs(h))*0.15); ctx.stroke() }
		else if (t === "ellipse")      { const rx=Math.abs(pos.x-sx)/2, ry=Math.abs(pos.y-sy)/2; ctx.beginPath(); ctx.ellipse(sx+(pos.x-sx)/2, sy+(pos.y-sy)/2, rx, ry, 0, 0, Math.PI*2); ctx.stroke() }
		else if (t === "curve") {
			curveDataRef.current = { start: { x: sx, y: sy }, end: pos }
			setCurveWaiting(true)
			const ov = overlayRef.current!.getContext("2d")!
			ov.strokeStyle = colorRef.current; ov.lineWidth = sizeRef.current; ov.setLineDash([])
			ov.beginPath(); ov.moveTo(sx, sy); ov.lineTo(pos.x, pos.y); ov.stroke()
		} else if (t === "rect-select") {
			const ov = overlayRef.current!.getContext("2d")!
			ov.clearRect(0, 0, overlayRef.current!.width, overlayRef.current!.height)
			ov.setLineDash([4,2]); ov.strokeStyle="#000"; ov.lineWidth=1
			ov.strokeRect(sx, sy, pos.x-sx, pos.y-sy)
		}

		drawingRef.current = false; startPosRef.current = null
	}, [getPos])

	// ── Polygon clicks ─────────────────────────────────────────────────────────
	const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
		if (toolRef.current !== "polygon") return
		const pos = getPos(e)
		if (polygonPtsRef.current.length === 0) pushHistory()
		polygonPtsRef.current = [...polygonPtsRef.current, pos]
		drawPolyOverlay(polygonPtsRef.current)
	}, [getPos, pushHistory])

	const onDblClick = useCallback(() => {
		if (toolRef.current !== "polygon") return
		const pts = polygonPtsRef.current
		if (pts.length < 2) { polygonPtsRef.current = []; clearOverlay(); return }
		clearOverlay()
		const ctx = canvasRef.current!.getContext("2d")!
		applyStroke(ctx)
		ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y)
		for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y)
		ctx.closePath(); ctx.stroke()
		polygonPtsRef.current = []
	}, [])

	// ── Text commit ────────────────────────────────────────────────────────────
	const commitText = useCallback((value: string) => {
		const pos = textPosRef.current
		if (!pos || !value.trim()) { setTextPos(null); return }
		const ctx = canvasRef.current?.getContext("2d")
		if (!ctx) return
		pushHistory()
		ctx.font      = `${12 + sizeRef.current * 2}px ${FONT}`
		ctx.fillStyle = colorRef.current
		ctx.fillText(value, pos.x, pos.y)
		setTextPos(null)
	}, [pushHistory])

	// ── Cursor & status ────────────────────────────────────────────────────────
	const cursor = tool === "text" ? "text" : tool === "zoom" ? "zoom-in" : tool === "pick" ? "crosshair" : tool === "free-select" ? "default" : "crosshair"

	const statusLabel = curveWaiting
		? "Click to set the curve control point — Esc to cancel"
		: polygonPtsRef.current.length > 0
		? "Double-click to close the polygon"
		: ALL_TOOLS.find(t => t.id === tool)?.title ?? ""

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT, userSelect: "none" }}>

			{/* ── Main row ─────────────────────────────────────────────────────── */}
			<div style={{ display: "flex", flex: 1, minHeight: 0, gap: 2, padding: 2 }}>

				{/* Left tool panel */}
				<div style={{ ...raised, flexShrink: 0, background: BG, padding: 2, display: "flex", flexDirection: "column", gap: 2, alignSelf: "flex-start" }}>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
						{ALL_TOOLS.map(({ id, title }) => (
							<button key={id} title={title} onClick={() => setTool(id)}
								style={{ ...(tool === id ? sunken : raised), background: BG, width: 24, height: 24, padding: 3, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<ToolIcon id={id} />
							</button>
						))}
					</div>

					<div style={{ height: 1, background: "#808080", margin: "1px 0" }} />

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
						{HAS_SIZE.includes(tool)
							? SIZES.map(s => (
								<div key={s} onClick={() => setSize(s)}
									style={{ ...(size === s ? sunken : raised), width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", background: BG }}>
									<div style={{ width: Math.min(s * 3, 18), height: Math.min(s * 3, 18), borderRadius: "50%", background: "#000" }} />
								</div>
							))
							: SIZES.map(s => <div key={s} style={{ width: 24, height: 24 }} />)
						}
					</div>

					{zoom !== 1 && (
						<div style={{ fontSize: 9, textAlign: "center", color: "#000080", paddingTop: 2 }}>×{zoom}</div>
					)}
				</div>

				{/* Canvas area */}
				<div style={{ ...sunken, flex: 1, overflow: "auto", background: "#808080" }}>
					<div style={{ position: "relative", display: "inline-block", margin: 4 }}>
						<canvas ref={canvasRef} width={560} height={400}
							style={{ display: "block", cursor, width: 560 * zoom, height: 400 * zoom }}
							onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
							onClick={onClick} onDoubleClick={onDblClick}
							onMouseLeave={e => { setCursorPos(null); if (drawingRef.current) onMouseUp(e) }}
							onContextMenu={e => { e.preventDefault(); e.stopPropagation(); if (toolRef.current === "zoom") setZoom(z => Math.max(1, z / 2)) }}
						/>
						<canvas ref={overlayRef} width={560} height={400}
							style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", width: 560 * zoom, height: 400 * zoom }} />

						{textPos && (
							<input ref={textInputRef} defaultValue=""
								style={{ position: "absolute", left: textPos.x * zoom, top: textPos.y * zoom - 16,
									background: "transparent", border: "1px dashed #000080", outline: "none",
									fontSize: (12 + size * 2) * zoom, fontFamily: FONT, color, minWidth: 60, padding: "0 2px" }}
								onKeyDown={e => { if (e.key === "Enter") commitText(e.currentTarget.value); if (e.key === "Escape") setTextPos(null) }}
								onBlur={e => commitText(e.target.value)}
							/>
						)}
					</div>
				</div>
			</div>

			{/* ── Palette strip ────────────────────────────────────────────────── */}
			<div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 4px", background: BG, borderTop: "2px solid #808080", flexShrink: 0 }}>
				<div style={{ position: "relative", width: 36, height: 26, flexShrink: 0 }}>
					<div style={{ ...raised, position: "absolute", bottom: 0, right: 0, width: 20, height: 18, background: bgColor }} />
					<div style={{ ...raised, position: "absolute", top: 0, left: 0, width: 20, height: 18, background: color }} />
				</div>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(14, 16px)", gridTemplateRows: "repeat(2, 13px)", gap: 1 }}>
					{PALETTE.map((c, i) => (
						<div key={i} onClick={() => setColor(c)}
							onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setBgColor(c) }}
							style={{ ...raised, width: 14, height: 13, background: c, cursor: "default" }} title={c} />
					))}
				</div>
			</div>

			{/* ── Status bar ───────────────────────────────────────────────────── */}
			<div style={{ display: "flex", background: BG, flexShrink: 0 }}>
				<div style={{ ...sunken, flex: 2, padding: "1px 6px", fontSize: 11 }}>{statusLabel}</div>
				<div style={{ ...sunken, width: 120, padding: "1px 6px", fontSize: 11 }}>{cursorPos ? `${cursorPos.x},${cursorPos.y}` : ""}</div>
				<div style={{ ...sunken, width: 80, padding: "1px 6px", fontSize: 11 }} />
			</div>
		</div>
	)
}
