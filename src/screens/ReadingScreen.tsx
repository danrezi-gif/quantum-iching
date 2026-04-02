import { useEffect, useRef, useState } from 'react'
import type { CastLine, Hexagram } from '../types'
import HexagramDisplay from '../components/HexagramDisplay'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

interface Props {
  reading: { primary: Hexagram; changing: Hexagram | null; movingLines: number[] }
  lines: CastLine[]
  intention: string
  onReset: () => void
}

export default function ReadingScreen({ reading, lines, intention, onReset }: Props) {
  const { primary, changing, movingLines } = reading
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
            judgment: primary.wilhelm_judgment.text,
            image: primary.wilhelm_image.text,
            lines: Object.fromEntries(
              movingLines.map(l => [l, primary.wilhelm_lines[String(l)]?.text ?? ''])
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
      setInterpretation('The oracle fell silent. Please try again.')
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
          padding: 'clamp(40px, 7vh, 80px) clamp(28px, 7vw, 100px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(28px, 4vh, 48px)',
          maxWidth: 700,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Large hex glyph + name */}
        <div className="fade-in" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{
            fontSize: 'clamp(80px, 14vw, 120px)',
            lineHeight: 1,
            color: '#3a3228',
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
            color: '#1a1a1a',
            marginTop: 4,
          }}>
            {primary.english}
          </h2>
          <p style={{
            ...cormorant,
            fontSize: 'clamp(14px, 1.5vw, 17px)',
            color: '#6b6355',
            letterSpacing: '0.15em',
          }}>
            {primary.trad_chinese} · {primary.pinyin} · Hexagram {primary.hex}
          </p>
          {intention && (
            <p style={{
              ...cormorant,
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              fontStyle: 'italic',
              color: '#4a4540',
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
                color: '#b08030',
                opacity: 0.6,
              }}>→</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 'clamp(40px, 7vw, 60px)', color: '#3a3228', lineHeight: 1 }}>
                  {changing.hex_font}
                </span>
                <span style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.2vw, 13px)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#6b6355',
                }}>
                  {changing.english}
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
            borderLeft: '2px solid rgba(176,128,48,0.35)',
            paddingLeft: 'clamp(14px, 2.5vw, 24px)',
          }}>
            <p style={{
              ...cinzel,
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#b08030',
              marginBottom: 2,
            }}>Moving lines</p>
            {movingLines.map(l => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  ...cinzel,
                  fontSize: 'clamp(10px, 1.1vw, 12px)',
                  color: '#b08030',
                  letterSpacing: '0.15em',
                }}>
                  Line {l}
                </span>
                <p style={{
                  ...cormorant,
                  fontSize: 'clamp(15px, 1.7vw, 18px)',
                  lineHeight: 1.65,
                  color: '#3a3530',
                  fontStyle: 'italic',
                }}>
                  {primary.wilhelm_lines[String(l)]?.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Gold rule */}
        <div style={{
          width: '100%',
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(176,128,48,0.3), transparent)',
        }} />

        {/* Interpretation */}
        <div style={{ width: '100%' }}>
          {interpretation ? (
            <div style={{
              ...cormorant,
              fontSize: 'clamp(17px, 2vw, 21px)',
              lineHeight: 1.85,
              color: '#2a2520',
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
              color: '#6b6355',
              textAlign: 'center',
            }}>
              The oracle is speaking...
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
            borderTop: '1px solid rgba(44,44,44,0.1)',
          }}>
            <div>
              <p style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#8a8070',
                marginBottom: 10,
              }}>The Judgment</p>
              <p style={{
                ...cormorant,
                fontSize: 'clamp(15px, 1.7vw, 18px)',
                lineHeight: 1.75,
                color: '#3a3530',
                fontStyle: 'italic',
              }}>
                {primary.wilhelm_judgment.text}
              </p>
            </div>
            <div>
              <p style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.1vw, 12px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#8a8070',
                marginBottom: 10,
              }}>The Image</p>
              <p style={{
                ...cormorant,
                fontSize: 'clamp(15px, 1.7vw, 18px)',
                lineHeight: 1.75,
                color: '#3a3530',
                fontStyle: 'italic',
              }}>
                {primary.wilhelm_image.text}
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
              color: '#3a3530',
              background: 'none',
              border: '1px solid rgba(44,44,44,0.25)',
              borderRadius: 2,
              padding: 'clamp(12px, 1.8vw, 16px) clamp(28px, 5vw, 48px)',
              cursor: 'pointer',
              marginBottom: 'clamp(32px, 5vh, 60px)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#1a1a1a'
              e.currentTarget.style.borderColor = 'rgba(44,44,44,0.6)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#3a3530'
              e.currentTarget.style.borderColor = 'rgba(44,44,44,0.25)'
            }}
          >
            Cast again
          </button>
        )}
      </div>
    </div>
  )
}
