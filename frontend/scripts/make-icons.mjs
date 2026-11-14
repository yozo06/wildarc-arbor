// Draws Arbor's placeholder app icon (a pale tree on the app's green) and writes the PNGs and the SVG the web app
// manifest and the page use. No dependencies: shapes are drawn into RGBA pixels and encoded with Node's zlib.
// Run from frontend/: node scripts/make-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { crc32, deflateSync } from 'node:zlib'

const OUT = fileURLToPath(new URL('../public/icons/', import.meta.url))
const GREEN = [0x2a, 0x59, 0x34]
const PALE = [0xf7, 0xf5, 0xee]

// The tree in a unit square: a round canopy over a trunk. `inset` shrinks it toward the centre, so the maskable
// icon keeps the tree inside the safe circle launchers crop to.
function shapes(inset) {
  const s = v => 0.5 + (v - 0.5) * inset
  return {
    canopy: { cx: s(0.5), cy: s(0.4), r: 0.25 * inset },
    trunk: { x0: s(0.455), x1: s(0.545), y0: s(0.5), y1: s(0.8) },
  }
}

function insideTree(x, y, { canopy, trunk }) {
  const inCanopy = (x - canopy.cx) ** 2 + (y - canopy.cy) ** 2 <= canopy.r ** 2
  const inTrunk = x >= trunk.x0 && x <= trunk.x1 && y >= trunk.y0 && y <= trunk.y1
  return inCanopy || inTrunk
}

function png(size, inset) {
  const tree = shapes(inset)
  const SS = 4 // samples per pixel side, for smooth edges
  const rows = []
  for (let py = 0; py < size; py++) {
    const row = Buffer.alloc(1 + size * 4)
    for (let px = 0; px < size; px++) {
      let hits = 0
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        if (insideTree((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size, tree)) hits++
      }
      const t = hits / (SS * SS)
      for (let c = 0; c < 3; c++) row[1 + px * 4 + c] = Math.round(GREEN[c] * (1 - t) + PALE[c] * t)
      row[1 + px * 4 + 3] = 255
    }
    rows.push(row)
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type), data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0)),
  ])
}

function svg() {
  const { canopy, trunk } = shapes(1)
  const n = v => +(v * 64).toFixed(2)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2A5934"/>` +
    `<rect x="${n(trunk.x0)}" y="${n(trunk.y0)}" width="${n(trunk.x1 - trunk.x0)}" height="${n(trunk.y1 - trunk.y0)}" fill="#F7F5EE"/>` +
    `<circle cx="${n(canopy.cx)}" cy="${n(canopy.cy)}" r="${n(canopy.r)}" fill="#F7F5EE"/></svg>\n`
}

mkdirSync(OUT, { recursive: true })
writeFileSync(`${OUT}icon-192.png`, png(192, 1))
writeFileSync(`${OUT}icon-512.png`, png(512, 1))
writeFileSync(`${OUT}icon-maskable-512.png`, png(512, 0.7))
writeFileSync(`${OUT}icon.svg`, svg())
console.log(`wrote icons to ${OUT}`)
