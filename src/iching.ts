import type { CastLine, Hexagram, LineValue } from './types'
// @ts-ignore
import wilhelmRaw from './data/wilhelm_raw.js'

const wilhelm: Record<string, Hexagram> = wilhelmRaw

// Full King Wen lookup table (above trigram, below trigram) → hexagram number
// Using the standard binary encoding
const KW_TABLE: number[][] = [
  //       below: KUN CHN KAN KEN SUN  LI TUI CHN
  /* KUN */ [  2, 24,  7, 15, 46, 36, 19, 11],
  /* CHN */ [ 16, 51,  3, 27, 32, 21, 17, 34],
  /* KAN */ [  8,  3, 29,  4, 48, 63, 60, 5 ],
  /* KEN */ [ 23, 27,  4, 52, 18, 22, 41, 26],
  /* SUN */ [ 20, 42, 59, 53, 57, 37, 61,  9],
  /* LI  */ [ 35, 21, 64, 56, 50, 30, 38, 13],
  /* TUI */ [ 45, 17, 47, 31, 28, 49, 58, 43],
  /* CHN */ [ 12, 25,  6, 33, 44, 14, 10,  1],
]

// Convert 6 line values to trigram indices (bottom-to-top)
function lineToYang(v: LineValue): 0 | 1 {
  return (v === 7 || v === 9) ? 1 : 0
}

function trigramIndex(lines: [LineValue, LineValue, LineValue]): number {
  // lines[0]=bottom, lines[2]=top
  return (lineToYang(lines[2]) << 2) | (lineToYang(lines[1]) << 1) | lineToYang(lines[0])
}

export function castToHexagram(cast: CastLine[]): {
  primary: Hexagram
  changing: Hexagram | null
  movingLines: number[]  // 1-indexed
} {
  // cast[0] = line 1 (bottom), cast[5] = line 6 (top)
  const values = cast.map(c => c.value) as LineValue[]

  const belowLines: [LineValue, LineValue, LineValue] = [values[0], values[1], values[2]]
  const aboveLines: [LineValue, LineValue, LineValue] = [values[3], values[4], values[5]]

  const belowIdx = trigramIndex(belowLines)
  const aboveIdx = trigramIndex(aboveLines)

  const primaryNum = KW_TABLE[aboveIdx][belowIdx]
  const primary = wilhelm[String(primaryNum)]

  // Moving lines: 6 (old yin → yang) or 9 (old yang → yin)
  const movingLines = values
    .map((v, i) => (v === 6 || v === 9) ? i + 1 : null)
    .filter(Boolean) as number[]

  let changing: Hexagram | null = null
  if (movingLines.length > 0) {
    // Transform moving lines
    const changedValues = values.map(v => {
      if (v === 6) return 7 as LineValue  // old yin → young yang
      if (v === 9) return 8 as LineValue  // old yang → young yin
      return v
    }) as LineValue[]
    const cBelow: [LineValue, LineValue, LineValue] = [changedValues[0], changedValues[1], changedValues[2]]
    const cAbove: [LineValue, LineValue, LineValue] = [changedValues[3], changedValues[4], changedValues[5]]
    const changedNum = KW_TABLE[trigramIndex(cAbove)][trigramIndex(cBelow)]
    changing = wilhelm[String(changedNum)]
  }

  return { primary, changing, movingLines }
}

export function coinsToLineValue(coins: [number, number, number]): LineValue {
  const sum = coins[0] + coins[1] + coins[2]
  return sum as LineValue
}

export function getHexagram(n: number): Hexagram {
  return wilhelm[String(n)]
}

export { wilhelm }
