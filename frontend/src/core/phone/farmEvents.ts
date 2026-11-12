// A page-wide signal that the farm on the phone changed, so banners and the home screen can look again.
const EVENT = 'arbor:farm-changed'

export function notifyFarmChanged(): void {
  window.dispatchEvent(new Event(EVENT))
}

export function onFarmChanged(fn: () => void): () => void {
  window.addEventListener(EVENT, fn)
  return () => window.removeEventListener(EVENT, fn)
}
