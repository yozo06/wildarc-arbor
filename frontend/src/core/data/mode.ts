// Where the app keeps its data. Decided when the app is built: `local` keeps everything on the phone,
// `server` talks to the Express API. Anything other than VITE_DATA_MODE=server means local.
export type DataMode = 'local' | 'server'

export const DATA_MODE: DataMode = import.meta.env.VITE_DATA_MODE === 'server' ? 'server' : 'local'

export const isLocal = (): boolean => DATA_MODE === 'local'
