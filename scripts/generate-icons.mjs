/**
 * Regenerates static PWA icons from public/icons/icon.svg.
 * Run: node scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public/icons/icon.svg'))

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('Install sharp first: npm install --save-dev sharp')
  process.exit(1)
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

for (const { name, size } of sizes) {
  const out = join(root, 'public/icons', name)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log('wrote', name)
}
