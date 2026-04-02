export type LineValue = 6 | 7 | 8 | 9

export type LineType = 'old-yin' | 'young-yang' | 'young-yin' | 'old-yang'

export interface CastLine {
  value: LineValue   // 6=old yin, 7=young yang, 8=young yin, 9=old yang
  coins: [number, number, number]  // 2 or 3 each
}

export interface Hexagram {
  hex: number
  hex_font: string
  trad_chinese: string
  pinyin: string
  english: string
  binary: string
  wilhelm_above: { chinese: string; symbolic: string; alchemical: string }
  wilhelm_below: { chinese: string; symbolic: string; alchemical: string }
  wilhelm_judgment: { text: string; comments: string }
  wilhelm_image: { text: string; comments: string }
  wilhelm_lines: Record<string, { text: string; comments: string }>
}

export type AppScreen = 'intention' | 'casting' | 'reading'
