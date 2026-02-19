import { useState } from "react"
import LoadingProcess from "./components/LoadingProcess"
import Portfolio from "./components/Portfolio"

type AppMode = "terminal" | "loading" | "portfolio"

function App() {
	const [appMode, setAppMode] = useState<AppMode>("terminal")

	if (appMode === "portfolio") {
		return <Portfolio />
	}

	return <LoadingProcess onComplete={() => setAppMode("portfolio")} />
}

export default App
