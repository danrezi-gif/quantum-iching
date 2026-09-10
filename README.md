# Quantum I Ching

**An interactive oracle bringing an ancient symbolic system into dialogue with quantum randomness and AI interpretation.**

Quantum I Ching preserves the traditional six-line casting structure of the *I Ching*, but replaces physical coins with bits from a hardware quantum random-number source. The resulting hexagram and moving lines are then interpreted through an AI layer grounded in the Wilhelm translation.

The project is less interested in claiming that quantum randomness is spiritually privileged than in the experience created when **question, chance, symbol and interpretation** meet inside a contemporary computational system.

**Live:** https://iching.monkadelic.me

Available in English and Portuguese.

## The experience

1. **Intention** — enter a question or simply begin without one.
2. **Casting** — six lines are generated sequentially from hardware quantum randomness.
3. **Hexagram** — the resulting figure is identified through the King Wen sequence, including moving lines when present.
4. **Reading** — an AI interpretation is generated using the Wilhelm text as its primary symbolic source.

The result is not presented as prediction or proof of synchronicity. It is an experiment in what happens when an old divinatory form is mediated by contemporary computation.

## How the casting works

Each virtual coin draws bits from the [LfD / ID Quantique QRNG](https://lfdr.de/qrng_api/), a physical entropy source based on photon detection. Three binary values form each traditional coin cast.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Express server with SSE streaming
- Anthropic SDK for the interpretation layer
- LfD / ID Quantique hardware QRNG

## Hexagram texts

- **English:** Richard Wilhelm translation
- **Portuguese:** project translation derived from the English source with AI assistance

The interface distinguishes source texts from generated interpretation.

## Development

```bash
npm install
npm run dev
```

For the interpretation layer, create a `.env` file containing:

```bash
ANTHROPIC_API_KEY=your_key_here
```

Production:

```bash
npm run build
npm run server
```

The Express server serves the built frontend and proxies the QRNG and interpretation requests.

## Context

Quantum I Ching is part of [Monkadelic](https://monkadelic.me), Daniel Rezinovsky's experimental practice across consciousness, symbolic systems, immersive media and artificial intelligence.