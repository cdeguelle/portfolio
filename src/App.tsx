import { useState, useEffect } from "react"
import LoadingProcess, { type PortfolioStyle } from "./components/LoadingProcess"
import Portfolio from "./components/Portfolio"
import PixelArtPortfolio from "./components/PixelArtPortfolio"
import BlackholePortfolio from "./components/BlackHole"
import EditorialPortfolio from "./components/EditorialPortfolio"

type AppMode = "loading" | "w95" | "pixelart" | "blackhole" | "editorial"

function App() {
	const [appMode, setAppMode] = useState<AppMode>("loading")

	useEffect(() => {
		const handler = () => setAppMode("blackhole")
		window.addEventListener("blackhole-easter-egg", handler)
		return () => window.removeEventListener("blackhole-easter-egg", handler)
	}, [])

	if (appMode === "w95") return <Portfolio />
	if (appMode === "pixelart") return <PixelArtPortfolio />
	if (appMode === "blackhole") return <BlackholePortfolio />
	if (appMode === "editorial") return <EditorialPortfolio />

	return <LoadingProcess onComplete={(style: PortfolioStyle) => setAppMode(style)} />
}

export default App
