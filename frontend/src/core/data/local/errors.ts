// Errors from the phone version carry the same shape as an axios error from the server, because screens
// read `err.response?.data?.error` to show the message.
export class LocalDataError extends Error {
  response: { status: number; data: { error: string } }

  constructor(status: number, message: string) {
    super(message)
    this.name = 'LocalDataError'
    this.response = { status, data: { error: message } }
  }
}

export function fail(status: number, message: string): never {
  throw new LocalDataError(status, message)
}

export const STORAGE_FULL = 'Storage on this device is full. Save your farm to a file, then remove some photos.'

export function isQuotaError(err: unknown): boolean {
  const e = err as { name?: string; code?: number } | null
  return e?.name === 'QuotaExceededError' || e?.code === 22
}

/** Rethrows a full-storage failure as a plain message for the person; anything else as it was. */
export function rethrowStorageFull(err: unknown): never {
  if (isQuotaError(err)) fail(507, STORAGE_FULL)
  throw err
}
