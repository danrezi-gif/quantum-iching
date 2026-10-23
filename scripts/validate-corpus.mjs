import { readFileSync, existsSync } from 'node:fs'
import assert from 'node:assert/strict'

const parse = path => JSON.parse(readFileSync(path, 'utf8'))
const corpus = parse('src/data/legge.json')
const metadata = parse('src/data/hexagrams_meta.json')
assert.equal(Object.keys(corpus).length, 64, '64 public-domain hexagrams')
assert.equal(metadata.length, 64, '64 metadata entries')
for (let n = 1; n <= 64; n++) {
  const h = corpus[String(n)]
  assert.ok(h && typeof h.judgment === 'string' && h.judgment.length > 8, 'judgment ' + n)
  assert.ok(h.image && h.image.length > 8, 'image ' + n)
  assert.deepEqual(Object.keys(h.lines).sort(), ['1','2','3','4','5','6'], 'six lines ' + n)
  for (let line = 1; line <= 6; line++) {
    assert.ok(h.lines[String(line)].length > 5, 'line ' + n + '.' + line)
  }
  assert.equal(metadata[n-1].hex, n, 'King Wen number')
  assert.equal(metadata[n-1].hex_font, String.fromCodePoint(0x4dc0+n-1))
}
for(const path of [
  'src/data/wilhelm_raw.js', 'src/data/wilhelm_pt.js',
  'src/data/en_texts_for_translation.json', 'src/data/generate_pt.mjs',
]) {
  assert.equal(existsSync(path), false, 'retired corpus must not be active: ' + path)
}
const activeSource = ['src/iching.ts','src/screens/ReadingScreen.tsx','server/index.ts'].map(
  path => readFileSync(path, 'utf8')).join('\n')
assert.equal(/wilhelmData|wilhelmRaw|wilhelmPt/.test(activeSource), false, 'no legacy text usage')
console.log('Validated 64 judgments, 64 images, 384 line passages, metadata and active imports.')
