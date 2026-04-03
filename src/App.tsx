import { useState } from 'react'
import type { AppScreen, CastLine } from './types'
import type { Lang } from './strings'
import strings, { detectLang } from './strings'
import { castToHexagram } from './iching'
import IntentionScreen from './screens/IntentionScreen'
import CastingScreen from './screens/CastingScreen'
import ReadingScreen from './screens/ReadingScreen'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('intention')
  const [intention, setIntention] = useState('')
  const [lines, setLines] = useState<CastLine[]>([])
  const [infoOpen, setInfoOpen] = useState(false)
  const [lang, setLang] = useState<Lang>(detectLang)
  const s = strings[lang]

  function handleIntentionReady(text: string) {
    setIntention(text)
    setLines([])
    setScreen('casting')
  }

  function handleLineCast(line: CastLine) {
    setLines(prev => [...prev, line])
  }

  function handleCastingComplete() {
    setScreen('reading')
  }

  function handleReset() {
    setLines([])
    setIntention('')
    setScreen('intention')
  }

  const reading = lines.length === 6 ? castToHexagram(lines) : null

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {screen === 'intention' && (
        <IntentionScreen lang={lang} onReady={handleIntentionReady} />
      )}
      {screen === 'casting' && (
        <CastingScreen
          lang={lang}
          lines={lines}
          onLineCast={handleLineCast}
          onComplete={handleCastingComplete}
        />
      )}
      {screen === 'reading' && reading && (
        <ReadingScreen
          lang={lang}
          reading={reading}
          lines={lines}
          intention={intention}
          onReset={handleReset}
        />
      )}

      {/* Bottom-right controls: lang toggle + info */}
      <div style={{
        position: 'fixed',
        bottom: 'clamp(16px, 3vh, 28px)',
        right: 'clamp(16px, 3vw, 28px)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        zIndex: 40,
      }}>
        {/* Lang toggle */}
        <button
          onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')}
          title="Switch language"
          style={{
            ...cinzel,
            fontSize: 11,
            letterSpacing: '0.15em',
            color: 'rgba(180, 220, 185, 0.8)',
            background: 'none',
            border: '1px solid rgba(80, 160, 90, 0.4)',
            borderRadius: 2,
            padding: '0 10px',
            height: 36,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#a8e8b0'
            e.currentTarget.style.borderColor = 'rgba(100,220,120,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(180,220,185,0.8)'
            e.currentTarget.style.borderColor = 'rgba(80,160,90,0.4)'
          }}
        >
          {lang === 'en' ? 'PT' : 'EN'}
        </button>

        {/* Info button */}
        <button
          onClick={() => setInfoOpen(true)}
          title={s.aboutTitle}
          style={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'none',
            border: '1px solid rgba(80, 160, 90, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...cinzel,
            fontSize: 14,
            color: 'rgba(180, 220, 185, 0.8)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#a8e8b0'
            e.currentTarget.style.borderColor = 'rgba(100,220,120,0.7)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(180,220,185,0.8)'
            e.currentTarget.style.borderColor = 'rgba(80,160,90,0.4)'
          }}
        >
          ⓘ
        </button>
      </div>

      {/* Info overlay */}
      {infoOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6,14,8,0.92)',
            backdropFilter: 'blur(16px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: 'clamp(48px, 8vh, 80px) clamp(24px, 6vw, 80px)',
          }}
          onClick={() => setInfoOpen(false)}
        >
          <div
            style={{
              maxWidth: 640,
              width: '100%',
              ...cormorant,
              color: '#c8e0c4',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header + close */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'clamp(24px, 4vh, 40px)',
            }}>
              <h2 style={{
                ...cinzel,
                fontSize: 'clamp(13px, 1.6vw, 17px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#7aaa80',
                fontWeight: 400,
              }}>
                {s.aboutTitle}
              </h2>
              <button
                onClick={() => setInfoOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  lineHeight: 1,
                  color: 'rgba(140,210,150,0.5)',
                  padding: '4px 8px',
                }}
              >×</button>
            </div>

            {/* About */}
            <p style={{
              fontSize: 'clamp(16px, 1.9vw, 20px)',
              lineHeight: 1.8,
              marginBottom: 'clamp(16px, 2.5vh, 28px)',
              color: '#c8e0c4',
            }}>
              {s.aboutP1}
            </p>

            <p style={{
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              lineHeight: 1.8,
              marginBottom: 'clamp(24px, 4vh, 44px)',
              color: '#a0c4a0',
              fontStyle: 'italic',
            }}>
              {s.aboutP2}
            </p>

            {/* How it works */}
            <div style={{ marginBottom: 'clamp(24px, 4vh, 44px)' }}>
              <h3 style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#5a8a60',
                marginBottom: 'clamp(12px, 2vh, 20px)',
              }}>
                {s.coinMethodTitle}
              </h3>
              {s.coinMethod.map(([label, desc]) => (
                <div key={label} style={{
                  display: 'flex',
                  gap: 'clamp(12px, 2vw, 20px)',
                  alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(44,44,44,0.06)',
                }}>
                  <span style={{
                    ...cinzel,
                    fontSize: 'clamp(11px, 1.2vw, 13px)',
                    color: '#7ecf8a',
                    minWidth: 'clamp(120px, 16vw, 160px)',
                    flexShrink: 0,
                    paddingTop: 2,
                  }}>{label}</span>
                  <span style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#a0c4a0',
                    lineHeight: 1.6,
                  }}>{desc}</span>
                </div>
              ))}
            </div>

            {/* Source */}
            <div>
              <h3 style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#5a8a60',
                marginBottom: 'clamp(10px, 1.5vh, 16px)',
              }}>
                {s.sourcesTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href="https://lfdr.de/QRNG/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#7ecf8a',
                    textDecoration: 'none',
                    lineHeight: 1.6,
                  }}
                >
                  {s.sourceLfD}
                </a>
                <a
                  href="https://www.iging.com/intro/introduc.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#7ecf8a',
                    textDecoration: 'none',
                    lineHeight: 1.6,
                  }}
                >
                  {s.sourceWilhelm}
                </a>
              </div>
            </div>

            <div style={{ height: 'clamp(32px, 5vh, 60px)' }} />
          </div>
        </div>
      )}
    </div>
  )
}
