import type { WinId, Position } from "../types"
import { ProjectsContent } from "./ProjectsContent"
import { AboutContent } from "./AboutContent"
import { ContactContent } from "./ContactContent"
import { ComputerContent } from "./ComputerContent"
import { TerminalContent } from "./TerminalContent"
import { CvContent } from "./CvContent"
import { ShutdownContent } from "./ShutdownContent"
import { MusicContent } from "./MusicContent"
import { PaintContent } from "./PaintContent"
import { MapContent } from "./MapContent"
import { PhoneContent } from "./PhoneContent"
import { CrocusContent } from "./CrocusContent"
import { DiscordContent } from "./DiscordContent"

export function getContent(id: WinId, onClose?: () => void, onMove?: (p: Position) => void, onOpenWindow?: (id: WinId) => void) {
	switch (id) {
		case "projects":
			return <ProjectsContent onOpenWindow={onOpenWindow} />
		case "about":
			return <AboutContent />
		case "contact":
			return <ContactContent />
		case "computer":
			return <ComputerContent />
		case "cv":
			return <CvContent />
		case "terminal":
			return <TerminalContent />
		case "rusure":
			return <ShutdownContent onClose={onClose!} onMove={onMove!} />
		case "music":
			return <MusicContent />
		case "paint":
			return <PaintContent />
		case "map":
			return <MapContent />
		case "phone":
			return <PhoneContent />
		case "crocus":
			return <CrocusContent />
		case "discord":
			return <DiscordContent />
	}
}
