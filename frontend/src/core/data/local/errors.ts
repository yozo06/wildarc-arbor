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
