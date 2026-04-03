import type { CastLine, Hexagram, LineValue } from './types'
// @ts-ignore
import wilhelmRaw from './data/wilhelm_raw.js'
// @ts-ignore
import wilhelmPt from './data/wilhelm_pt.js'

const wilhelm: Record<string, Hexagram> = wilhelmRaw

export interface HexTexts {
  judgment: string
  image: string
  lines: Record<string, string>
}

export function getTexts(hexNum: number, lang: string): HexTexts {
  const src = lang === 'pt' ? wilhelmPt : wilhelmRaw
  const h = src[String(hexNum)]
  if (lang === 'pt') return h as HexTexts
  return {
    judgment: h.wilhelm_judgment.text,
    image: h.wilhelm_image.text,
    lines: Object.fromEntries(
      Object.entries(h.wilhelm_lines as Record<string, { text: string }>)
        .map(([k, v]) => [k, v.text])
    ),
  }
}

// King Wen lookup table: KW_TABLE[aboveIdx][belowIdx] → hexagram number
// Indices match trigramIndex() binary encoding:
//   0=KUN 1=CHEN 2=KAN 3=TUI 4=KEN 5=LI 6=SUN 7=CHIEN
const KW_TABLE: number[][] = [
  //        below: KUN CHN KAN TUI KEN  LI SUN CHN
  /* KUN  */ [  2, 24,  7, 19, 15, 36, 46, 11],
  /* CHEN */ [ 16, 51, 40, 54, 62, 55, 32, 34],
  /* KAN  */ [  8,  3, 29, 60, 39, 63, 48,  5],
  /* TUI  */ [ 45, 17, 47, 58, 31, 49, 28, 43],
  /* KEN  */ [ 23, 27,  4, 41, 52, 22, 18, 26],
  /* LI   */ [ 35, 21, 64, 38, 56, 30, 50, 14],
  /* SUN  */ [ 20, 42, 59, 61, 53, 37, 57,  9],
  /* CHIEN*/ [ 12, 25,  6, 10, 33, 13, 44,  1],
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
