// Installing Arbor to the home screen. Android's Chrome offers an install prompt, which we hold on to so a
// button can show it later. iPhone has no prompt: people use Share, then Add to Home Screen.

type NavLike = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/** iPhone, iPod, or an iPad that reports itself as a Mac (Macintosh in its browser identity) but has a touch screen. */
export function isIos(nav: NavLike = navigator): boolean {
  return /iPhone|iPad|iPod/.test(nav.userAgent) || (/Macintosh/.test(nav.userAgent) && nav.maxTouchPoints > 1)
}

/** True when Arbor is running from the home screen rather than in a browser tab. */
export function isInstalled(win: Window = window): boolean {
  return win.matchMedia?.('(display-mode: standalone)').matches === true || (win.navigator as any)?.standalone === true
}

let deferred: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

export function captureInstallPrompt(win: Window = window): void {
  win.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferred = e as InstallPromptEvent
    listeners.forEach(fn => fn())
  })
}

export const canPromptInstall = (): boolean => deferred !== null

export function onInstallAvailable(fn: () => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const prompt = deferred
  deferred = null
  await prompt.prompt()
  return (await prompt.userChoice).outcome === 'accepted'
}
