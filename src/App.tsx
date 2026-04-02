import { useState } from 'react'
import type { AppScreen, CastLine } from './types'
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
      background: '#faf9f7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {screen === 'intention' && (
        <IntentionScreen onReady={handleIntentionReady} />
      )}
      {screen === 'casting' && (
        <CastingScreen
          lines={lines}
          onLineCast={handleLineCast}
          onComplete={handleCastingComplete}
        />
      )}
      {screen === 'reading' && reading && (
        <ReadingScreen
          reading={reading}
          lines={lines}
          intention={intention}
          onReset={handleReset}
        />
      )}

      {/* Info button — fixed bottom-right */}
      <button
        onClick={() => setInfoOpen(true)}
        title="About this oracle"
        style={{
          position: 'fixed',
          bottom: 'clamp(16px, 3vh, 28px)',
          right: 'clamp(16px, 3vw, 28px)',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'none',
          border: '1px solid rgba(44,44,44,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...cinzel,
          fontSize: 14,
          color: 'rgba(44,44,44,0.4)',
          transition: 'all 0.3s ease',
          zIndex: 40,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#3a3530'
          e.currentTarget.style.borderColor = 'rgba(44,44,44,0.5)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'rgba(44,44,44,0.4)'
          e.currentTarget.style.borderColor = 'rgba(44,44,44,0.2)'
        }}
      >
        ⓘ
      </button>

      {/* Info overlay */}
      {infoOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(250,249,247,0.92)',
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
              color: '#2a2520',
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
                color: '#6b6355',
                fontWeight: 400,
              }}>
                About this oracle
              </h2>
              <button
                onClick={() => setInfoOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  lineHeight: 1,
                  color: 'rgba(44,44,44,0.35)',
                  padding: '4px 8px',
                }}
              >×</button>
            </div>

            {/* About */}
            <p style={{
              fontSize: 'clamp(16px, 1.9vw, 20px)',
              lineHeight: 1.8,
              marginBottom: 'clamp(16px, 2.5vh, 28px)',
              color: '#2a2520',
            }}>
              Quantum I Ching uses the traditional three-coin method of divination, but replaces
              physical coins with quantum randomness sourced from photon detection hardware at the
              LfD Laboratory in Germany (ID Quantique). Each coin flip is derived from a single
              bit of a genuine quantum random number — not a mathematical simulation.
            </p>

            <p style={{
              fontSize: 'clamp(15px, 1.7vw, 18px)',
              lineHeight: 1.8,
              marginBottom: 'clamp(24px, 4vh, 44px)',
              color: '#4a4540',
              fontStyle: 'italic',
            }}>
              Three coins are cast per line, six lines build the hexagram from the bottom up.
              A coin summing to 6 or 9 becomes a moving line — the seed of transformation — and
              generates a second, changing hexagram. The interpretation draws on the Richard Wilhelm
              translation of the I Ching (1950), the canonical Western edition.
            </p>

            {/* How it works */}
            <div style={{ marginBottom: 'clamp(24px, 4vh, 44px)' }}>
              <h3 style={{
                ...cinzel,
                fontSize: 'clamp(10px, 1.2vw, 13px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#8a8070',
                marginBottom: 'clamp(12px, 2vh, 20px)',
              }}>
                The coin method
              </h3>
              {[
                ['6 — old yin ──×──', 'Three tails. A moving line — yin transforming into yang.'],
                ['7 — young yang ────', 'Two tails, one heads. Stable yang line.'],
                ['8 — young yin ── ──', 'One tails, two heads. Stable yin line.'],
                ['9 — old yang ────○', 'Three heads. A moving line — yang transforming into yin.'],
              ].map(([label, desc]) => (
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
                    color: '#b08030',
                    minWidth: 'clamp(120px, 16vw, 160px)',
                    flexShrink: 0,
                    paddingTop: 2,
                  }}>{label}</span>
                  <span style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#4a4540',
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
                color: '#8a8070',
                marginBottom: 'clamp(10px, 1.5vh, 16px)',
              }}>
                Sources
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href="https://lfdr.de/QRNG/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#7a6845',
                    textDecoration: 'none',
                    lineHeight: 1.6,
                  }}
                >
                  LfD Laboratory — Quantum Random Number Generation (ID Quantique hardware)
                </a>
                <a
                  href="https://www.iging.com/intro/introduc.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'clamp(14px, 1.6vw, 17px)',
                    color: '#7a6845',
                    textDecoration: 'none',
                    lineHeight: 1.6,
                  }}
                >
                  Richard Wilhelm — I Ching or Book of Changes (1950)
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
