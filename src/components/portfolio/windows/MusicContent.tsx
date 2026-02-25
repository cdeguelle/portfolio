import { useRef, useState, useEffect } from "react"
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

export function MusicContent() {
	const audioRef = useRef<HTMLAudioElement>(null)
	const playingRef = useRef(false)
	const pendingPlayRef = useRef(false)

	const [trackIdx, setTrackIdx] = useState(0)
	const [playing, setPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [volume, setVolume] = useState(0.7)

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

	const play = () =>
		audioRef.current
			?.play()
			.then(() => setPlaying(true))
			.catch(() => {})

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
