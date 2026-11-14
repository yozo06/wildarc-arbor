import { describe, it, expect } from 'vitest'
import html from '../../../index.html?raw'
import { manifest } from './manifest'

// The icon files, read through Vite (no Node APIs: the frontend type-checks with browser types only). Vite reads
// them as text, which is enough to see the PNG signature; their sizes are fixed by scripts/make-icons.mjs.
const icons = import.meta.glob<string>('../../../public/icons/*.png', { query: '?raw', import: 'default', eager: true })

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
      const file = icons[`../../../public/${icon.src}`]
      expect(file, `${icon.src} is missing`).toBeDefined()
      expect(file.slice(1, 4)).toBe('PNG')
      expect(['192x192', '512x512']).toContain(icon.sizes)
    }
  })

  it('the page is titled Arbor, not TMS', () => {
    expect(html).toContain('<title>Arbor</title>')
    expect(html).not.toContain('TMS')
  })
})
