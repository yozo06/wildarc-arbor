import { isIos } from './install'

// Hands a file to the person. On iPhone a download link is unreliable inside a home-screen app, so the share
// sheet is used instead ("Save to Files"); everywhere else a normal download. Rejects if the person cancels.
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const file = typeof File === 'undefined' ? null : new File([blob], filename, { type: blob.type })
  if (file && isIos() && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: filename })
    return
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
