import { useRef, useState, useEffect, useCallback } from "react"
import t1 from "../../assets/Project Ex - Tranquility (freetouse.com).mp3"
import t2 from "../../assets/Walen - Dark Heart (freetouse.com).mp3"
import t3 from "../../assets/Aetheric - Sacred Connection (freetouse.com).mp3"
import t4 from "../../assets/Lukrembo - Donut (freetouse.com).mp3"
import t5 from "../../assets/Lukrembo - This Is For You (freetouse.com).mp3"
import t6 from "../../assets/Lukrembo - Rose (freetouse.com).mp3"

const TRACKS = [
	{ artist: "Project Ex", title: "Tranquility", src: t1 },
	{ artist: "Walen", title: "Dark Heart", src: t2 },
	{ artist: "Aetheric", title: "Sacred Connection", src: t3 },
	{ artist: "Lukrembo", title: "Donut", src: t4 },
	{ artist: "Lukrembo", title: "This Is For You", src: t5 },
	{ artist: "Lukrembo", title: "Rose", src: t6 },
]

const BAR_COUNT = 36

function fmt(s: number) {
	if (!isFinite(s) || isNaN(s)) return "0:00"
	return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
}

export function BhMusicContent({ color }: { color: string }) {
	const audioRef = useRef<HTMLAudioElement>(null)
	const playingRef = useRef(false)
	const pendingPlayRef = useRef(false)
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

	// Visualizer
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
			ctx.clearRect(0, 0, W, H)

			const analyser = analyserRef.current
			const gap = 2
			const barW = Math.max(1, Math.floor((W - gap * (BAR_COUNT + 1)) / BAR_COUNT))

			if (analyser) {
				const data = new Uint8Array(analyser.frequencyBinCount)
				analyser.getByteFrequencyData(data)
				const peaks = peaksRef.current
				for (let i = 0; i < BAR_COUNT; i++) {
					const bin = Math.floor(Math.pow(i / BAR_COUNT, 1.2) * analyser.frequencyBinCount * 0.75)
					const v = data[bin] / 255
					const barH = Math.floor(v * H)
					const x = gap + i * (barW + gap)
					if (barH > peaks[i]) peaks[i] = barH
					else peaks[i] = Math.max(0, peaks[i] - 1.2)

					// Bar — section color gradient
					const grad = ctx.createLinearGradient(0, H, 0, H - barH)
					grad.addColorStop(0, color + "44")
					grad.addColorStop(1, color + "cc")
					ctx.fillStyle = grad
					ctx.fillRect(x, H - barH, barW, barH)

					// Peak dot
					if (peaks[i] > 2) {
						ctx.fillStyle = color
						ctx.fillRect(x, H - peaks[i], barW, 2)
					}
				}
			} else {
				// Idle flat bars
				ctx.fillStyle = color + "22"
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
	}, [color])

	const track = TRACKS[trackIdx]

	useEffect(() => { playingRef.current = playing }, [playing])

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

	useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])

	const play = () => { initAudio(); audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}) }
	const pause = () => { audioRef.current?.pause(); setPlaying(false) }
	const stop = () => {
		const a = audioRef.current
		if (!a) return
		a.pause(); a.currentTime = 0
		setPlaying(false); setCurrentTime(0)
	}
	const prev = () => setTrackIdx((i) => (i === 0 ? TRACKS.length - 1 : i - 1))
	const next = () => setTrackIdx((i) => (i === TRACKS.length - 1 ? 0 : i + 1))

	const seek = (e: React.MouseEvent<HTMLDivElement>) => {
		const a = audioRef.current
		if (!a || !duration) return
		const rect = e.currentTarget.getBoundingClientRect()
		a.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration
	}

	const progress = duration ? (currentTime / duration) * 100 : 0

	const ctrlBtn = (label: string, action: () => void, title?: string) => (
		<button
			key={label}
			onClick={action}
			title={title}
			style={{
				background: "transparent",
				border: `1px solid ${color}44`,
				borderRadius: 4,
				color: color,
				cursor: "pointer",
				fontSize: 14,
				width: 36,
				height: 32,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				transition: "background 0.15s",
				flexShrink: 0,
			}}
			onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = color + "22")}
			onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
		>
			{label}
		</button>
	)

	return (
		<div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, userSelect: "none" }}>
			<audio
				ref={audioRef}
				onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
				onDurationChange={(e) => setDuration(e.currentTarget.duration)}
				onEnded={next}
			/>

			{/* Now playing */}
			<div
				style={{
					background: "#0a0a18",
					border: `1px solid ${color}22`,
					borderRadius: 6,
					padding: "10px 14px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 12,
				}}
			>
				<div style={{ overflow: "hidden" }}>
					<p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#e0e0f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{track.title}
					</p>
					<p style={{ margin: 0, fontSize: 11, color: "#6060a0", marginTop: 2 }}>{track.artist}</p>
				</div>
				<span style={{ fontSize: 11, color: "#6060a0", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
					{fmt(currentTime)} / {fmt(duration)}
				</span>
			</div>

			{/* Progress bar */}
			<div
				onClick={seek}
				style={{ height: 4, background: "#1a1a30", borderRadius: 2, cursor: "pointer", position: "relative", overflow: "hidden" }}
			>
				<div
					style={{
						background: `linear-gradient(90deg, ${color}88, ${color})`,
						height: "100%",
						width: `${progress}%`,
						borderRadius: 2,
						transition: "width 0.1s linear",
						pointerEvents: "none",
					}}
				/>
			</div>

			{/* Visualizer */}
			<div style={{ height: 64, background: "#080810", borderRadius: 4, overflow: "hidden" }}>
				<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
			</div>

			{/* Controls */}
			<div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
				{ctrlBtn("⏮", prev, "Previous")}
				{ctrlBtn(playing ? "⏸" : "▶", playing ? pause : play, playing ? "Pause" : "Play")}
				{ctrlBtn("⏹", stop, "Stop")}
				{ctrlBtn("⏭", next, "Next")}
			</div>

			{/* Volume */}
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<span style={{ fontSize: 11, color: "#6060a0", flexShrink: 0 }}>Vol</span>
				<div
					style={{ flex: 1, height: 4, background: "#1a1a30", borderRadius: 2, cursor: "pointer", position: "relative" }}
					onClick={(e) => {
						const rect = e.currentTarget.getBoundingClientRect()
						setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
					}}
				>
					<div
						style={{
							background: `linear-gradient(90deg, ${color}66, ${color})`,
							height: "100%",
							width: `${volume * 100}%`,
							borderRadius: 2,
							pointerEvents: "none",
						}}
					/>
				</div>
				<span style={{ fontSize: 11, color: "#6060a0", flexShrink: 0, width: 30, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
					{Math.round(volume * 100)}%
				</span>
			</div>

			{/* Playlist */}
			<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
				{TRACKS.map((t, i) => (
					<div
						key={i}
						onClick={() => setTrackIdx(i)}
						onDoubleClick={() => { pendingPlayRef.current = true; setTrackIdx(i) }}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 10,
							padding: "7px 10px",
							borderRadius: 4,
							cursor: "pointer",
							background: i === trackIdx ? color + "18" : "transparent",
							border: `1px solid ${i === trackIdx ? color + "44" : "transparent"}`,
							transition: "background 0.15s",
						}}
					>
						<span style={{ fontSize: 10, width: 12, color: i === trackIdx && playing ? color : "transparent", flexShrink: 0 }}>▶</span>
						<span style={{ fontSize: 11, color: i === trackIdx ? color : "#7070a0", fontWeight: i === trackIdx ? 600 : 400 }}>
							{t.artist}
						</span>
						<span style={{ fontSize: 12, color: i === trackIdx ? "#e0e0f0" : "#9090b0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{t.title}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
