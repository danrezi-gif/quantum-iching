export type LineValue = 6 | 7 | 8 | 9
export type LineType = 'old-yin' | 'young-yang' | 'young-yin' | 'old-yang'

export interface CastLine {
  value: LineValue
  coins: [number, number, number]
}

export interface Hexagram {
  hex: number
  hex_font: string
  trad_chinese: string
  pinyin: string
  english: string
  binary: string
}

export type AppScreen = 'intention' | 'casting' | 'reading'
