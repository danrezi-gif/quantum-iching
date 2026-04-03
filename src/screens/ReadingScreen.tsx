import { useEffect, useRef, useState } from 'react'
import type { CastLine, Hexagram } from '../types'
import type { Lang } from '../strings'
import strings, { hexagramName } from '../strings'
import { getTexts } from '../iching'
import HexagramDisplay from '../components/HexagramDisplay'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

// Insert a line break after the all-caps title at the start of a judgment text
// e.g. "ENTUSIASMO. É favorável..." → "ENTUSIASMO.\nÉ favorável..."
function breakAfterTitle(text: string): string {
  return text.replace(/^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŒ\s]+[.,])\s+/, '$1\n')
}

interface Props {
  lang: Lang
  reading: { primary: Hexagram; changing: Hexagram | null; movingLines: number[] }
  lines: CastLine[]
  intention: string
  onReset: () => void
}

export default function ReadingScreen({ lang, reading, lines, intention, onReset }: Props) {
  const s = strings[lang]
  const { primary, changing, movingLines } = reading
  const texts = getTexts(primary.hex, lang)
  const [interpretation, setInterpretation] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startReading()
  }, [])

  async function startReading() {
    setStreaming(true)
    setInterpretation('')

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          hexagram: {
            number: primary.hex,
            english: primary.english,
            trad_chinese: primary.trad_chinese,
            pinyin: primary.pinyin,
          },
          changingHexagram: changing ? {
            number: changing.hex,
            english: changing.english,
          } : null,
          movingLines,
          intention,
          wilhelmData: {
            judgment: texts.judgment,
            image: texts.image,
            lines: Object.fromEntries(
              movingLines.map(l => [l, texts.lines[String(l)] ?? ''])
            ),
          },
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const { text } = JSON.parse(data)
            if (text) {
              setInterpretation(prev => prev + text)
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
            }
          } catch {}
        }
      }
    } catch {
      setInterpretation(s.oracleSilent)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(40px, 7vh, 80px) clamp(32px, 7vw, 100px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(28px, 4vh, 48px)',
          maxWidth: 780,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Large hex glyph + name */}
        <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{
            fontSize: 'clamp(80px, 14vw, 120px)',
            lineHeight: 1,
            color: '#b8d8b4',
            display: 'block',
          }}>
            {primary.hex_font}
          </span>
          <h2 style={{
            ...cinzel,
            fontSize: 'clamp(20px, 3vw, 30px)',
            fontWeight: 400,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#d8e8d4',
            marginTop: 4,
          }}>
            {hexagramName(primary.hex, lang) || primary.english}
          </h2>
          <p style={{
            ...cormorant,
            fontSize: 'clamp(14px, 1.5vw, 17px)',
            color: '#7aaa80',
            letterSpacing: '0.15em',
          }}>
            {primary.trad_chinese} · {primary.pinyin} · {s.hexagramLabel(primary.hex)}
          </p>
          {intention && (
            <p style={{
              ...cormorant,
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              fontStyle: 'italic',
              color: '#a0c4a0',
              marginTop: 4,
            }}>
              "{intention}"
            </p>
          )}
        </div>

        {/* Gold rule */}
        <div style={{
          width: 'clamp(40px, 8vw, 80px)',
          height: 1,
          background: 'linear-gradient(to right, transparent, #b08030, transparent)',
          opacity: 0.5,
        }} />

        {/* Hexagram visual + changing hex */}
        <div className="fade-in" style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <HexagramDisplay lines={lines} />
          {movingLines.length > 0 && changing && (
            <>
              <div style={{
                ...cormorant,
                fontSize: 'clamp(20px, 3vw, 28px)',
                color: '#7ecf8a',
                opacity: 0.6,
              }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 'clamp(40px, 7vw, 60px)', color: '#b8d8b4', lineHeight: 1 }}>
                  {changing.hex_font}
                </span>
                <span style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.2vw, 13px)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#7aaa80',
                }}>
                  {hexagramName(changing.hex, lang) || changing.english}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Moving lines */}
        {movingLines.length > 0 && (
          <div className="fade-in" style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12 }}>
              <p style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#7ecf8a',
              }}>{s.movingLines}</p>
              <p style={{
                ...cormorant,
                fontSize: 'clamp(10px, 1vw, 11px)',
                color: '#5a8a60',
                fontStyle: 'italic',
              }}>{s.wilhelmNote}</p>
            </div>
            {movingLines.map(l => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#7ecf8a',
                  letterSpacing: '0.15em',
                }}>
                  {s.line(l)}
                </span>
                <p style={{
                  ...cormorant,
                  fontSize: 'clamp(15px, 1.7vw, 18px)',
                  lineHeight: 1.65,
                  color: '#b0d0b0',
                  fontStyle: 'italic',
                  whiteSpace: 'pre-line',
                }}>
                  {texts.lines[String(l)]}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Gold rule */}
        <div style={{
          width: '100%',
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(80,180,100,0.25), transparent)',
        }} />

        {/* Interpretation */}
        <div style={{ width: '100%' }}>
          {interpretation ? (
            <div style={{
              ...cormorant,
              fontSize: 'clamp(18px, 2.1vw, 23px)',
              lineHeight: 1.85,
              color: '#c8e0c4',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.3em',
            }}>
              {interpretation.split('\n\n').map((para, i) => (
                <p key={i}>{para.trim()}</p>
              ))}
              {streaming && <span className="pulse" style={{ opacity: 0.35 }}>▍</span>}
            </div>
          ) : (
            <p className="pulse" style={{
              ...cormorant,
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              fontStyle: 'italic',
              color: '#7aaa80',
              textAlign: 'center',
            }}>
              {s.oracleSpeaking}
            </p>
          )}
        </div>

        {/* Wilhelm source texts — revealed after streaming */}
        {!streaming && interpretation && (
          <div className="fade-in" style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(20px, 3vh, 32px)',
            paddingTop: 'clamp(16px, 2.5vh, 28px)',
            borderTop: '1px solid rgba(80,180,100,0.12)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
                <p style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#5a8a60',
                }}>{s.theJudgment}</p>
              </div>
              <p style={{
                ...cormorant,
                fontSize: 'clamp(15px, 1.7vw, 18px)',
                lineHeight: 1.75,
                color: '#b0d0b0',
                fontStyle: 'italic',
                whiteSpace: 'pre-line',
              }}>
                {breakAfterTitle(texts.judgment)}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
                <p style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#5a8a60',
                }}>{s.theImage}</p>
              </div>
              <p style={{
                ...cormorant,
                fontSize: 'clamp(15px, 1.7vw, 18px)',
                lineHeight: 1.75,
                color: '#b0d0b0',
                fontStyle: 'italic',
                whiteSpace: 'pre-line',
              }}>
                {texts.image}
              </p>
            </div>
          </div>
        )}

        {/* Cast again */}
        {!streaming && interpretation && (
          <button
            onClick={onReset}
            className="fade-in"
            style={{
              ...cinzel,
              fontSize: 'clamp(10px, 1.2vw, 13px)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#b0d0b0',
              background: 'none',
              border: '1px solid rgba(100,200,120,0.3)',
              borderRadius: 2,
              padding: 'clamp(12px, 1.8vw, 16px) clamp(28px, 5vw, 48px)',
              cursor: 'pointer',
              marginBottom: 'clamp(32px, 5vh, 60px)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#d8e8d4'
              e.currentTarget.style.borderColor = 'rgba(100,200,120,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#b0d0b0'
              e.currentTarget.style.borderColor = 'rgba(100,200,120,0.3)'
            }}
          >
            {s.castAgain}
          </button>
        )}
      </div>
    </div>
  )
}
