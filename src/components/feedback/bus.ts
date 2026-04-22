export type ToastEvent = {
  id: number
  text: string
  tone: 'success' | 'error'
}

export type ConfettiEvent = {
  x: number
  y: number
}

type ToastListener = (e: ToastEvent) => void
type ConfettiListener = (e: ConfettiEvent) => void

const toastListeners = new Set<ToastListener>()
const confettiListeners = new Set<ConfettiListener>()
let nextToastId = 0

export const toastBus = {
  push(text: string, tone: 'success' | 'error' = 'success') {
    nextToastId += 1
    const event: ToastEvent = { id: nextToastId, text, tone }
    toastListeners.forEach(l => l(event))
  },
  subscribe(l: ToastListener): () => void {
    toastListeners.add(l)
    return () => toastListeners.delete(l)
  },
}

export const confettiBus = {
  burst(x: number, y: number) {
    confettiListeners.forEach(l => l({ x, y }))
  },
  subscribe(l: ConfettiListener): () => void {
    confettiListeners.add(l)
    return () => confettiListeners.delete(l)
  },
}

export function fireFromRect(rect: DOMRect) {
  confettiBus.burst(rect.left + rect.width / 2, rect.top + rect.height / 2)
}
