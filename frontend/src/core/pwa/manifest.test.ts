import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { manifest } from './manifest'

// Tests run from frontend/ (locally and in CI); jsdom's import.meta.url is not a file path.
const frontend = (path: string) => resolve(process.cwd(), path)

/** Width and height from a PNG's header. */
function pngSize(path: string): [number, number] {
  const b = readFileSync(path)
  expect(b.subarray(1, 4).toString()).toBe('PNG')
  return [b.readUInt32BE(16), b.readUInt32BE(20)]
}

describe('the web app manifest', () => {
  it('is called Arbor and works from a sub-path', () => {
    expect(manifest).toMatchObject({
      name: 'Arbor', short_name: 'Arbor', start_url: './', scope: './', display: 'standalone',
      theme_color: '#2A5934', background_color: '#F7F5EE',
    })
  })

  it('lists three relative icons that exist at their stated size, one maskable', () => {
    expect(manifest.icons).toHaveLength(3)
    expect(manifest.icons.filter(i => i.purpose === 'maskable')).toHaveLength(1)
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith('/')).toBe(false)
      const [w, h] = pngSize(frontend(`public/${icon.src}`))
      expect(`${w}x${h}`).toBe(icon.sizes)
    }
  })

  it('the page is titled Arbor, not TMS', () => {
    const html = readFileSync(frontend('index.html'), 'utf8')
    expect(html).toContain('<title>Arbor</title>')
    expect(html).not.toContain('TMS')
  })
})
