# Quantum I Ching

An I Ching divination app that uses hardware quantum random number generation for coin casting, and a Claude-powered interpretation layer. Available in English and Portuguese.

Live: [iching.monkadelic.me](https://iching.monkadelic.me)

## How it works

1. **Intention** — the user optionally enters a question or focus
2. **Casting** — six lines are cast one at a time using coins whose values come from a hardware QRNG ([LfD/ID Quantique](https://lfdr.de/qrng_api/))
3. **Reading** — the resulting hexagram is identified via King Wen lookup, moving lines are noted, and an interpretation is streamed from Claude using the Wilhelm translation as source material

Each coin flip fetches 3 random bits from a physical quantum entropy source (photon detection). The LSB of each byte is used as the coin value.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Express server (API proxy + SSE streaming)
- Anthropic SDK (claude-sonnet-4-6, streaming)
- QRNG: LfD API (ID Quantique hardware)

## Hexagram data

- English: Richard Wilhelm translation (`wilhelm_raw.js`)
- Portuguese: Claude-translated from Wilhelm (`wilhelm_pt.js`), generated via `src/data/generate_pt.mjs`

## Setup

```bash
npm install
```

Create a `.env` file:

```
ANTHROPIC_API_KEY=your_key_here
```

## Development

```bash
npm run dev
```

Runs the Express server (port 5002) and Vite dev server (port 5173) concurrently.

## Production build

```bash
npm run build
npm run server
```

The Express server serves the built frontend from `dist/public/` and handles `/api/qrng` and `/api/reading` endpoints.

## Regenerating Portuguese texts

```bash
node src/data/generate_pt.mjs
```

Translates all 64 hexagrams (judgment, image, line texts) from English to Brazilian Portuguese in batches of 8, writing to `src/data/wilhelm_pt.js`. Requires `ANTHROPIC_API_KEY`.
