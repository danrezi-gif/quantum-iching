// Run once: node src/data/generate_pt.mjs
// Translates Wilhelm short texts (judgment, image, lines) to Portuguese
// Batches 8 hexagrams per call — 8 total API calls

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import 'dotenv/config'

const __dir = dirname(fileURLToPath(import.meta.url))
const enData = JSON.parse(readFileSync(join(__dir, 'en_texts_for_translation.json'), 'utf8'))

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a careful literary translator specializing in sacred and philosophical texts. Translate I Ching (Wilhelm) oracular texts from English to Brazilian Portuguese.

Rules:
- Preserve the poetic, oracular, archaic tone
- Keep line breaks (\\n) in exactly the same positions
- Do NOT translate proper names like "Yin", "Yang", "Tao"
- Return ONLY valid JSON, no commentary, no markdown fences
- Translate faithfully and with gravitas — these are divinatory texts`

async function translateBatch(hexNums) {
  const input = Object.fromEntries(hexNums.map(n => [n, enData[n]]))

  const prompt = `Translate these I Ching hexagram texts to Brazilian Portuguese. Return a JSON object with the same structure, keyed by hexagram number.

${JSON.stringify(input, null, 2)}`

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].text.trim()
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

async function main() {
  const pt = {}
  const batches = []
  for (let i = 1; i <= 64; i += 8) {
    batches.push(Array.from({ length: Math.min(8, 65 - i) }, (_, j) => i + j))
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]
    process.stdout.write(`Batch ${b + 1}/${batches.length} (hex ${batch[0]}–${batch[batch.length - 1]})...`)
    try {
      const result = await translateBatch(batch)
      Object.assign(pt, result)
      process.stdout.write(' done\n')
    } catch (e) {
      process.stdout.write(` ERROR: ${e.message}\n`)
      for (const n of batch) pt[n] = enData[n] // fallback to English
    }
    if (b < batches.length - 1) await new Promise(r => setTimeout(r, 500))
  }

  const output = `// Auto-generated Portuguese Wilhelm texts — do not edit manually
// Run src/data/generate_pt.mjs to regenerate
export default ${JSON.stringify(pt, null, 2)}
`
  writeFileSync(join(__dir, 'wilhelm_pt.js'), output, 'utf8')
  console.log('\nWrote src/data/wilhelm_pt.js')
}

main().catch(console.error)
