import musicIcon from "../../../assets/music.png"
import { FONT, sunken } from "../theme"

// Remplace par l'URL d'une playlist publique Spotify :
// https://open.spotify.com/embed/playlist/{PLAYLIST_ID}?utm_source=generator
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/6b3bU23MjR1UHb2WJD0WtB?si=b44d90a07dfe4e1d?utm_source=generator"

export function MusicContent() {
	return (
		<div>
			<div
				style={{
					fontWeight: "bold",
					marginBottom: 10,
					fontSize: 13,
					fontFamily: FONT,
					display: "flex",
					alignItems: "center",
					gap: 6,
				}}
			>
				<img src={musicIcon} width={16} height={16} /> Now Playing
			</div>
			<div style={{ ...sunken, background: "#000", overflow: "hidden" }}>
				<iframe
					src={SPOTIFY_EMBED_URL}
					width="100%"
					height="352"
					style={{ border: "none" }}
					allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
					loading="lazy"
				/>
			</div>
		</div>
	)
}
