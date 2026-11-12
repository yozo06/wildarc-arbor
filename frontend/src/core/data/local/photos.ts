import { getStore, newUid } from './store'
import { fail, rethrowStorageFull } from './errors'
import { logActivity, ownerName } from './farm'

// Tree photos on the phone. Each photo is shrunk before it is stored (longest side 1600 px, JPEG), kept as bytes
// with its type, and shown through an object URL. The farm file carries the same bytes.

const MAX_SIDE = 1600
const QUALITY = 0.85

type Row = Record<string, any>
export type ImageShrinker = (file: Blob, maxSide: number, quality: number) => Promise<{ bytes: Uint8Array; mime: string }>

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

/** Draws the photo onto a canvas no larger than maxSide and encodes it as JPEG. Small JPEGs pass through. */
async function shrinkInBrowser(file: Blob, maxSide: number, quality: number) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.type === 'image/jpeg') {
    bitmap.close()
    return { bytes: await blobBytes(file), mime: 'image/jpeg' }
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const jpeg = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!jpeg) throw new Error('The photo could not be encoded')
  return { bytes: await blobBytes(jpeg), mime: 'image/jpeg' }
}

let shrinker: ImageShrinker = shrinkInBrowser

/** Tests replace the canvas work, which jsdom cannot do. Call with nothing to restore it. */
export function setImageShrinker(fn?: ImageShrinker): void {
  shrinker = fn ?? shrinkInBrowser
}

const urls = new Map<string, string>()
function urlFor(photo: Row): string {
  if (typeof URL.createObjectURL !== 'function') return ''
  let url = urls.get(photo.uid)
  if (!url) {
    url = URL.createObjectURL(new Blob([photo.bytes], { type: photo.mime }))
    urls.set(photo.uid, url)
  }
  return url
}

const shown = ({ bytes: _bytes, ...photo }: Row): Row => ({ ...photo, photo_url: urlFor({ bytes: _bytes, ...photo }) })

export async function getPhotos(code: string) {
  const store = await getStore()
  const name = await ownerName(store)
  return (await store.byTree<Row>('photos', String(code).trim().toUpperCase()))
    .sort((a, b) => String(b.taken_at).localeCompare(String(a.taken_at)) || b.id - a.id)
    .map(p => ({ ...shown(p), users: { name } }))
}

export async function uploadPhoto(code: string, file: Blob, type: string, caption?: string) {
  const store = await getStore()
  const tree = (await store.get<Row>('trees', String(code).trim().toUpperCase())) ?? fail(404, 'Tree not found')
  let image: { bytes: Uint8Array; mime: string }
  try {
    image = await shrinker(file, MAX_SIDE, QUALITY)
  } catch {
    return fail(400, 'This photo could not be read.')
  }
  const photo: Row = {
    id: await store.nextId('photos'), uid: newUid(), tree_code: tree.tree_code, photo_type: type || 'general',
    caption: caption || null, taken_at: new Date().toISOString(), uploaded_by: 1, ...image,
  }
  try {
    await store.put('photos', photo)
  } catch (err) {
    rethrowStorageFull(err)
  }
  try {
    await logActivity(store, { tree_code: tree.tree_code, action_taken: 'photo_uploaded' })
  } catch (err) {
    await store.remove('photos', photo.id)
    rethrowStorageFull(err)
  }
  return shown(photo)
}
