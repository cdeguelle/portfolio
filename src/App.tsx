import { useState } from "react"
import LoadingProcess, { type PortfolioStyle } from "./components/LoadingProcess"
import Portfolio from "./components/Portfolio"
import PixelArtPortfolio from "./components/PixelArtPortfolio"
import BlackholePortfolio from "./components/BlackholePortfolio"

type AppMode = "loading" | "w95" | "pixelart" | "blackhole"

function App() {
	const [appMode, setAppMode] = useState<AppMode>("loading")

	if (appMode === "w95") return <Portfolio />
	if (appMode === "pixelart") return <PixelArtPortfolio />
	if (appMode === "blackhole") return <BlackholePortfolio />

	return <LoadingProcess onComplete={(style: PortfolioStyle) => setAppMode(style)} />
}

export default App
