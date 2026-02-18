import { useEffect, useState } from "react"

const STEPS = [
	{ label: "[1/6] Initializing environment...", duration: 800 },
	{ label: "[2/6] Loading modules...", duration: 1200 },
	{ label: "[3/6] Compiling shaders...", duration: 1500 },
	{ label: "[4/6] Building layout engine...", duration: 1000 },
	{ label: "[5/6] Rendering components...", duration: 900 },
	{ label: "[6/6] Starting server on port 3000...", duration: 700 },
]

const BAR_WIDTH = 20

function ProgressBar({ progress }: { progress: number }) {
	const filled = Math.round((progress / 100) * BAR_WIDTH)
	const empty = BAR_WIDTH - filled
	return (
		<span className="text-green-400">
			[{"█".repeat(filled)}{"░".repeat(empty)}] {progress}%
		</span>
	)
}

type Props = {
	onComplete: () => void
}

export default function LoadingProcess({ onComplete }: Props) {
	const [currentStep, setCurrentStep] = useState(0)
	const [progress, setProgress] = useState(0)
	const [completedSteps, setCompletedSteps] = useState<string[]>([])
	const [done, setDone] = useState(false)

	useEffect(() => {
		if (currentStep >= STEPS.length) {
			setDone(true)
			const timeout = setTimeout(onComplete, 1000)
			return () => clearTimeout(timeout)
		}

		const step = STEPS[currentStep]
		const intervalTime = step.duration / 20
		let currentProgress = 0

		const interval = setInterval(() => {
			currentProgress += 5
			if (currentProgress >= 100) {
				currentProgress = 100
				clearInterval(interval)
				setProgress(100)
				setTimeout(() => {
					setCompletedSteps((prev) => [...prev, step.label.replace("...", "... done")])
					setCurrentStep((prev) => prev + 1)
					setProgress(0)
				}, 200)
			} else {
				setProgress(currentProgress)
			}
		}, intervalTime)

		return () => clearInterval(interval)
	}, [currentStep, onComplete])

	return (
		<div className="min-h-screen bg-[#141414] text-gray-200 font-mono text-sm p-4">
			<pre className="text-yellow-400 mb-4">
{`  ▄████  ██▀███  ▓█████ ▄▄▄     ▄▄▄█████▓   ▓█████ ▒██   ██▒ ██▓███
 ██▒ ▀█▒▓██ ▒ ██▒▓█   ▀▒████▄   ▓  ██▒ ▓▒   ▓█   ▀ ▒▒ █ █ ▒░▓██░  ██▒
▒██░▄▄▄░▓██ ░▄█ ▒▒███  ▒██  ▀█▄ ▒ ▓██░ ▒░   ▒███   ░░  █   ░▓██░ ██▓▒
░▓█  ██▓▒██▀▀█▄  ▒▓█  ▄░██▄▄▄▄██░ ▓██▓ ░    ▒▓█  ▄  ░ █ █ ▒ ▒██▄█▓▒ ▒
░▒▓███▀▒░██▓ ▒██▒░▒████▒▓█   ▓██▒ ▒██▒ ░    ░▒████▒▒██▒ ▒██▒▒██▒ ░  ░
 ░▒   ▒ ░ ▒▓ ░▒▓░░░ ▒░ ░▒▒   ▓▒█░ ▒ ░░      ░░ ▒░ ░▒▒ ░ ░▓ ░▒▓▒░ ░ ░
  ░   ░   ░▒ ░ ▒░ ░ ░  ░ ▒   ▒▒ ░   ░        ░ ░  ░░░   ░▒ ░░▒ ░
░ ░   ░   ░░   ░    ░    ░   ▒    ░            ░    ░    ░ ░░
      ░    ░        ░  ░     ░  ░              ░  ░ ░    ░          `}
			</pre>
			<p className="text-gray-400 mb-4">Launching great-exp v1.0.0...</p>
			<div className="space-y-1">
				{completedSteps.map((step, i) => (
					<div key={i} className="text-green-400">
						<span className="text-green-500 mr-2">✔</span>{step}
					</div>
				))}
				{!done && currentStep < STEPS.length && (
					<div>
						<span className="text-yellow-400 mr-2">⠋</span>
						<span className="text-gray-300">{STEPS[currentStep].label}</span>
						<div className="ml-4 mt-1">
							<ProgressBar progress={progress} />
						</div>
					</div>
				)}
				{done && (
					<div className="mt-4 text-green-400 animate-pulse">
						<span className="mr-2">✔</span>Ready! Launching...
					</div>
				)}
			</div>
		</div>
	)
}
