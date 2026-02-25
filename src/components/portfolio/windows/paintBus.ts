/** Shared action registry between PaintContent and Window95 menu bar */
export const paintBus: {
	undo?:  () => void
	redo?:  () => void
	clear?: () => void
	save?:  () => void
} = {}
