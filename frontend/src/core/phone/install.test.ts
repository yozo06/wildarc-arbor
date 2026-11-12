import { describe, it, expect } from 'vitest'
import { isInstalled, isIos } from './install'

const nav = (userAgent: string, platform = '', maxTouchPoints = 0) => ({ userAgent, platform, maxTouchPoints })

describe('isIos', () => {
  it('is true for an iPhone', () => {
    expect(isIos(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'))).toBe(true)
  })
  it('is true for an iPad that reports itself as a Mac', () => {
    expect(isIos(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 'MacIntel', 5))).toBe(true)
  })
  it('is false for Android and for a Mac', () => {
    expect(isIos(nav('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', 'Linux armv8l', 5))).toBe(false)
    expect(isIos(nav('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15', 'MacIntel', 0))).toBe(false)
  })
  it('is false for an Android browser identity on a Mac platform with touch (device emulators)', () => {
    expect(isIos(nav('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', 'MacIntel', 5))).toBe(false)
  })
})

describe('isInstalled', () => {
  it('is true in standalone display mode or with navigator.standalone', () => {
    expect(isInstalled({ matchMedia: () => ({ matches: true }), navigator: {} } as any)).toBe(true)
    expect(isInstalled({ matchMedia: () => ({ matches: false }), navigator: { standalone: true } } as any)).toBe(true)
    expect(isInstalled({ matchMedia: () => ({ matches: false }), navigator: {} } as any)).toBe(false)
    expect(isInstalled({ navigator: {} } as any)).toBe(false)
  })
})
