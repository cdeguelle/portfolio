import { useState } from "react"
import LoadingProcess, { type PortfolioStyle } from "./components/LoadingProcess"
import Portfolio from "./components/Portfolio"
import PixelArtPortfolio from "./components/PixelArtPortfolio"

type AppMode = "loading" | "w95" | "pixelart"

function App() {
	const [appMode, setAppMode] = useState<AppMode>("loading")

	if (appMode === "w95") return <Portfolio />
	if (appMode === "pixelart") return <PixelArtPortfolio />

	return <LoadingProcess onComplete={(style: PortfolioStyle) => setAppMode(style)} />
}

export default App
