// The web app manifest: what a phone shows when Arbor is installed. Paths are relative, so the same build works
// at the root of a site and under a sub-path such as https://yozo06.github.io/wildarc-arbor/.
// The icons are placeholders drawn by scripts/make-icons.mjs; swap in a real mark at any time.
export const manifest = {
  name: 'Arbor',
  short_name: 'Arbor',
  description: 'Every tree on your farm, in your pocket.',
  theme_color: '#2A5934',
  background_color: '#F7F5EE',
  display: 'standalone' as const,
  start_url: './',
  scope: './',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ] as Array<{ src: string; sizes: string; type: string; purpose?: string }>,
}
