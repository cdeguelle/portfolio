import { useRef, useState, useEffect, useCallback } from "react"
import { BG, FONT, raised, sunken } from "../theme"
import musicIcon from "../../../assets/music.png"
import t1 from "../../../assets/Project Ex - Tranquility (freetouse.com).mp3"
import t2 from "../../../assets/Walen - Dark Heart (freetouse.com).mp3"
import t3 from "../../../assets/Aetheric - Sacred Connection (freetouse.com).mp3"
import t4 from "../../../assets/Lukrembo - Donut (freetouse.com).mp3"
import t5 from "../../../assets/Lukrembo - This Is For You (freetouse.com).mp3"
import t6 from "../../../assets/Lukrembo - Rose (freetouse.com).mp3"

const TRACKS = [
	{ artist: "Project Ex", title: "Tranquility", src: t1 },
	{ artist: "Walen", title: "Dark Heart", src: t2 },
	{ artist: "Aetheric", title: "Sacred Connection", src: t3 },
	{ artist: "Lukrembo", title: "Donut", src: t4 },
	{ artist: "Lukrembo", title: "This Is For You", src: t5 },
	{ artist: "Lukrembo", title: "Rose", src: t6 },
]

function fmt(s: number) {
	if (!isFinite(s) || isNaN(s)) return "00:00"
	const m = Math.floor(s / 60)
	const sec = Math.floor(s % 60)
	return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

const BAR_COUNT = 40

export function MusicContent() {
	const audioRef = useRef<HTMLAudioElement>(null)
	const playingRef = useRef(false)
	const pendingPlayRef = useRef(false)

	// Web Audio
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const audioCtxRef = useRef<AudioContext | null>(null)
	const analyserRef = useRef<AnalyserNode | null>(null)
	const peaksRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))
	const vizFrameRef = useRef<number>(0)

	const [trackIdx, setTrackIdx] = useState(0)
	const [playing, setPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(0.7)

	const initAudio = useCallback(() => {
		const audio = audioRef.current
		if (!audio) return
		if (audioCtxRef.current) {
			if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume()
			return
		}
		const ctx = new AudioContext()
		const analyser = ctx.createAnalyser()
		analyser.fftSize = 256
		analyser.smoothingTimeConstant = 0.8
		const source = ctx.createMediaElementSource(audio)
		source.connect(analyser)
		analyser.connect(ctx.destination)
		audioCtxRef.current = ctx
		analyserRef.current = analyser
	}, [])

	// Visualizer draw loop
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		function draw() {
			const W = canvas!.offsetWidth
			const H = canvas!.offsetHeight
			if (canvas!.width !== W || canvas!.height !== H) {
				canvas!.width = W
				canvas!.height = H
			}
			const ctx = canvas!.getContext("2d")
			if (!ctx) { vizFrameRef.current = requestAnimationFrame(draw); return }

			ctx.fillStyle = "#000000"
			ctx.fillRect(0, 0, W, H)

			const analyser = analyserRef.current
			if (analyser) {
				const dataArray = new Uint8Array(analyser.frequencyBinCount)
				analyser.getByteFrequencyData(dataArray)
				const peaks = peaksRef.current
				const gap = 2
				const barW = Math.floor((W - gap * (BAR_COUNT + 1)) / BAR_COUNT)

				for (let i = 0; i < BAR_COUNT; i++) {
					const binIndex = Math.floor(Math.pow(i / BAR_COUNT, 1.2) * analyser.frequencyBinCount * 0.75)
					const value = dataArray[binIndex] / 255
					const barH = Math.floor(value * H)
					const x = gap + i * (barW + gap)

					// Update peak hold
					if (barH > peaks[i]) peaks[i] = barH
					else peaks[i] = Math.max(0, peaks[i] - 1.2)

					// Bar gradient: dark green → bright green → yellow-green at peak
					const grad = ctx.createLinearGradient(0, H, 0, H - barH)
					grad.addColorStop(0, "#003d00")
					grad.addColorStop(0.6, "#00cc33")
					grad.addColorStop(1, value > 0.8 ? "#ffee00" : "#00ff55")
					ctx.fillStyle = grad
					ctx.fillRect(x, H - barH, barW, barH)

					// Peak indicator
					if (peaks[i] > 2) {
						ctx.fillStyle = value > 0.8 ? "#ffee00" : "#88ffaa"
						ctx.fillRect(x, H - peaks[i], barW, 2)
					}
				}

				// Scanline overlay for LCD feel
				ctx.fillStyle = "rgba(0,0,0,0.12)"
				for (let y = 0; y < H; y += 2) ctx.fillRect(0, y, W, 1)
			} else {
				// Idle: flat low bars
				const gap = 2
				const barW = Math.floor((W - gap * (BAR_COUNT + 1)) / BAR_COUNT)
				ctx.fillStyle = "#002200"
				for (let i = 0; i < BAR_COUNT; i++) {
					ctx.fillRect(gap + i * (barW + gap), H - 3, barW, 3)
				}
			}

			vizFrameRef.current = requestAnimationFrame(draw)
		}

		draw()
		return () => {
			cancelAnimationFrame(vizFrameRef.current)
			audioCtxRef.current?.close()
		}
	}, [])

	const track = TRACKS[trackIdx]

	useEffect(() => {
		playingRef.current = playing
	}, [playing])

	// Load track on index change
	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		audio.src = TRACKS[trackIdx].src
		audio.load()
		setCurrentTime(0)
		setDuration(0)
		const shouldPlay = playingRef.current || pendingPlayRef.current
		pendingPlayRef.current = false
		if (shouldPlay) audio.play().catch(() => setPlaying(false))
	}, [trackIdx])

	useEffect(() => {
		if (audioRef.current) audioRef.current.volume = volume
	}, [volume])

	const play = () => {
		initAudio()
		audioRef.current
			?.play()
			.then(() => setPlaying(true))
			.catch(() => {})
	}

	const pause = () => {
		audioRef.current?.pause()
		setPlaying(false)
	}

	const stop = () => {
		const a = audioRef.current
		if (!a) return
		a.pause()
		a.currentTime = 0
		setPlaying(false)
		setCurrentTime(0)
	}

	const prev = () => setTrackIdx((i) => (i === 0 ? TRACKS.length - 1 : i - 1))
	const next = () => setTrackIdx((i) => (i === TRACKS.length - 1 ? 0 : i + 1))

	const seek = (e: React.MouseEvent<HTMLDivElement>) => {
		const a = audioRef.current
		if (!a || !duration) return
		const rect = e.currentTarget.getBoundingClientRect()
		a.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration
	}

	const selectTrack = (i: number) => setTrackIdx(i)
	const playTrack = (i: number) => {
		pendingPlayRef.current = true
		setTrackIdx(i)
	}

	const progress = duration ? (currentTime / duration) * 100 : 0

	const btn = (label: string, action: () => void, title?: string, wide?: boolean) => (
		<button
			key={label + (title ?? "")}
			onClick={action}
			title={title}
			style={{
				...raised,
				background: BG,
				width: wide ? 36 : 28,
				height: 22,
				cursor: "default",
				fontFamily: "monospace",
				fontSize: 12,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 0,
				border: "none",
				flexShrink: 0,
			}}
		>
			{label}
		</button>
	)

	return (
		<div
			style={{ fontFamily: FONT, userSelect: "none", display: "flex", flexDirection: "column", gap: 4, padding: 4, background: BG, height: "100%", boxSizing: "border-box" }}
		>
			<audio
				ref={audioRef}
				onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
				onDurationChange={(e) => setDuration(e.currentTarget.duration)}
				onEnded={next}
			/>

			{/* Header */}
			<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<img src={musicIcon} width={16} height={16} draggable={false} />
				<span style={{ fontWeight: "bold", fontSize: 12 }}>Mp3 Player</span>
			</div>

			{/* LCD display */}
			<div style={{ ...sunken, background: "#000", padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
				<span style={{ color: "#00ff00", fontSize: 11, fontFamily: "monospace", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
					{String(trackIdx + 1).padStart(2, "0")} {track.artist} — {track.title}
				</span>
				<span style={{ color: "#00ff00", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>
					{fmt(currentTime)}&nbsp;/&nbsp;{fmt(duration)}
				</span>
			</div>

			{/* Progress bar */}
			<div style={{ ...sunken, height: 12, background: "#fff", cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0 }} onClick={seek}>
				<div style={{ background: "#000080", height: "100%", width: `${progress}%`, pointerEvents: "none" }} />
			</div>

			{/* Visualizer */}
			<div style={{ ...sunken, background: "#000", height: 80, overflow: "hidden", flexShrink: 0 }}>
				<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
			</div>

			{/* Transport controls */}
			<div style={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
				{btn("⏮", prev, "Previous")}
				{btn(playing ? "❚❚" : "▶", playing ? pause : play, playing ? "Pause" : "Play", true)}
				{btn("■", stop, "Stop")}
				{btn("⏭", next, "Next")}
			</div>

			{/* Volume */}
			<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
				<span style={{ fontSize: 11, width: 24, flexShrink: 0 }}>Vol:</span>
				<div
					style={{ ...sunken, flex: 1, height: 14, background: "#fff", cursor: "pointer", position: "relative", overflow: "hidden" }}
					onClick={(e) => {
						const rect = e.currentTarget.getBoundingClientRect()
						setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
					}}
				>
					<div style={{ background: "#000080", height: "100%", width: `${volume * 100}%`, pointerEvents: "none" }} />
				</div>
				<span style={{ fontSize: 11, width: 28, textAlign: "right", flexShrink: 0 }}>{Math.round(volume * 100)}%</span>
			</div>

			{/* Playlist */}
			<div style={{ ...sunken, background: "#fff", flex: 1, overflow: "auto", minHeight: 0 }}>
				{TRACKS.map((t, i) => (
					<div
						key={i}
						onClick={() => selectTrack(i)}
						onDoubleClick={() => playTrack(i)}
						style={{
							padding: "2px 6px",
							fontSize: 11,
							cursor: "default",
							background: i === trackIdx ? "#000080" : "transparent",
							color: i === trackIdx ? "#fff" : "#000",
							display: "flex",
							alignItems: "center",
							gap: 4,
							whiteSpace: "nowrap",
						}}
					>
						<span style={{ width: 10, fontSize: 9, flexShrink: 0 }}>{i === trackIdx && playing ? "▶" : " "}</span>
						<span>
							{i + 1}. {t.artist} — {t.title}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
