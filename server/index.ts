import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const PORT = 5002
const LFD_URL = 'https://lfdr.de/qrng_api/qrng'

// Serve built frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/public')))
}

// ── QRNG: fetch N random bytes from LfD (ID Quantique hardware) ──────────────
app.get('/api/qrng', async (req, res) => {
  const n = Math.min(parseInt(req.query.n as string) || 3, 100)
  try {
    const r = await fetch(`${LFD_URL}?length=${n}&format=HEX`)
    if (!r.ok) throw new Error(`LfD ${r.status}`)
    const json = await r.json() as { qrn: string }
    if (!json.qrn) throw new Error('LfD bad response')
    // Each hex char = 4 bits; extract LSB of each byte as a coin (0=tails=2, 1=heads=3)
    const bytes = json.qrn.match(/.{2}/g)!.slice(0, n)
    const coins = bytes.map(b => (parseInt(b, 16) & 1) === 1 ? 3 : 2)
    res.json({ coins })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ── Claude: stream reading interpretation ────────────────────────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

app.post('/api/reading', async (req, res) => {
  const { hexagram, changingHexagram, movingLines, intention, wilhelmData } = req.body

  const systemPrompt = `You are a guide for the I Ching — the Book of Changes. You interpret hexagrams with depth, nuance, and psychological insight, drawing on the Richard Wilhelm translation as your primary source. Speak directly to the person, in the present moment. Do not recite the text — reflect on it. Be poetic but grounded. Keep your response to 3-4 paragraphs. Write in plain prose only — no markdown, no headers, no bullet points, no asterisks for emphasis.`

  const userMessage = `The user cast hexagram ${hexagram.number ?? hexagram.hex}: ${hexagram.english} (${hexagram.trad_chinese} — ${hexagram.pinyin}).
${intention ? `Their intention or question: "${intention}"` : 'They cast with silent intention.'}

Wilhelm's Judgment: ${wilhelmData.judgment}
Wilhelm's Image: ${wilhelmData.image}
${movingLines.length > 0 ? `Moving lines: ${movingLines.map((l: number) => `Line ${l}`).join(', ')}
Moving line texts: ${movingLines.map((l: number) => `Line ${l}: ${wilhelmData.lines[l]}`).join('\n')}` : 'No moving lines.'}
${changingHexagram ? `The changing hexagram is ${changingHexagram.number ?? changingHexagram.hex}: ${changingHexagram.english}.` : ''}

Offer a living interpretation of this reading.`

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
      }
    }
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (e: any) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`)
    res.end()
  }
})

// SPA fallback
app.get('/{*path}', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/public/index.html'))
  } else {
    res.status(404).send('Dev mode — use Vite')
  }
})

app.listen(PORT, () => console.log(`[quantum-iching] http://localhost:${PORT}`))
