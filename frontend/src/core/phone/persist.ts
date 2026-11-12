// Browsers may clear a site's storage when space runs low. Asking once for persistent storage, after the first
// thing is saved, makes that much less likely. Browsers that cannot persist just say no.

let asked = false

export async function requestPersistence(nav: Navigator = navigator): Promise<boolean> {
  if (asked) return false
  asked = true
  try {
    return (await nav.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}

/** Tests only. */
export function resetPersistenceForTests(): void {
  asked = false
}
