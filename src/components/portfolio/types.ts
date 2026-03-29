import paintIcon from "../../assets/paint.png"
import computerIcon from "../../assets/computer.png"
import folderIcon from "../../assets/directory.png"
import mailIcon from "../../assets/mail.png"
import notePadIcon from "../../assets/notepad.png"
import windowsIcon from "../../assets/windows.png"
import consoleIcon from "../../assets/console.png"
import signatureIcon from "../../assets/signature.png"
import musicIcon from "../../assets/music.png"
import msieIcon from "../../assets/msie1-5.png"

export type Position = { x: number; y: number }
export type WinId = "projects" | "about" | "contact" | "computer" | "cv" | "terminal" | "rusure" | "music" | "paint" | "map" | "phone" | "crocus" | "discord"

export interface WinMeta {
	id: WinId
	title: string
	icon: string
	width: number
	contentHeight?: number
	statusText?: string
	isDialog?: boolean
}

export const WIN_META: WinMeta[] = [
	{ id: "projects", title: "My Projects - Windows Explorer", icon: folderIcon, width: 580, statusText: "4 objects" },
	{ id: "about", title: "About - Notepad", icon: notePadIcon, width: 440 },
	{ id: "contact", title: "Contact", icon: mailIcon, width: 380, statusText: "3 objects" },
	{ id: "computer", title: "My Computer", icon: computerIcon, width: 440, statusText: "4 objects" },
	{ id: "cv", title: "CV_2026", icon: signatureIcon, width: 680, contentHeight: 500, statusText: "1 object" },
	{ id: "terminal", title: "MS-DOS Prompt", icon: consoleIcon, width: 560 },
	{ id: "rusure", title: "Shut Down Windows", icon: windowsIcon, width: 360, isDialog: true },
	{ id: "music", title: "Music", icon: musicIcon, width: 380, contentHeight: 410 },
	{ id: "paint", title: "Paint", icon: paintIcon, width: 720, contentHeight: 520 },
	{ id: "map", title: "3D Isometric Map", icon: folderIcon, width: 800, contentHeight: 560 },
	{ id: "phone", title: "Mobile App — Screenshots", icon: computerIcon, width: 700, contentHeight: 620 },
	{ id: "crocus", title: "Le Petit Crocus — Internet Explorer", icon: msieIcon, width: 1100, contentHeight: 750 },
	{ id: "discord", title: "Discord Bot — 3D Logo", icon: computerIcon, width: 540, contentHeight: 480 },
]

export const DESKTOP_ICONS: { id: WinId; label: string; icon: string }[] = [
	{ id: "computer", label: "My\nComputer", icon: computerIcon },
	{ id: "projects", label: "My Projects", icon: folderIcon },
	{ id: "about", label: "About", icon: notePadIcon },
	{ id: "contact", label: "Contact", icon: mailIcon },
	{ id: "cv", label: "CV 2026", icon: signatureIcon },
	{ id: "music", label: "Music", icon: musicIcon },
	{ id: "paint", label: "Paint", icon: paintIcon },
]

export const INITIAL_POS: Record<WinId, Position> = {
	projects: { x: 100, y: 30 },
	about: { x: 200, y: 50 },
	contact: { x: 280, y: 70 },
	computer: { x: 140, y: 40 },
	cv: { x: 160, y: 60 },
	terminal: { x: 120, y: 45 },
	rusure: { x: 340, y: 220 },
	music: { x: 180, y: 80 },
	paint: { x: 220, y: 60 },
	map: { x: 80, y: 40 },
	crocus: { x: 60, y: 30 },
	discord: { x: 180, y: 60 },
	phone: { x: 160, y: 50 },
}
