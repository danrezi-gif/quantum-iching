import { useRef, useState } from 'react'
import type { CastLine } from '../types'
import type { Lang } from '../strings'
import strings from '../strings'
import { coinsToLineValue } from '../iching'
import CoinFlip from '../components/CoinFlip'
import HexagramDisplay from '../components/HexagramDisplay'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

interface Props {
  lang: Lang
  lines: CastLine[]
  onLineCast: (line: CastLine) => void
  onComplete: () => void
}

type CastState = 'idle' | 'fetching' | 'animating' | 'done'

export default function CastingScreen({ lang, lines, onLineCast, onComplete }: Props) {
  const s = strings[lang]
  const [castState, setCastState] = useState<CastState>('idle')
  const [currentCoins, setCurrentCoins] = useState<[number, number, number] | null>(null)
  const [coinsReady, setCoinsReady] = useState(0)
  const [error, setError] = useState('')
  const lineRegisteredRef = useRef(false)

  const currentLineIndex = lines.length  // 0–5
  const isComplete = currentLineIndex === 6

  async function castLine() {
    if (castState !== 'idle') return
    setCastState('fetching')
    setCurrentCoins(null)
    setCoinsReady(0)
    setError('')
    lineRegisteredRef.current = false

    try {
      const res = await fetch('/api/qrng?n=3')
      if (!res.ok) throw new Error('QRNG unavailable')
      const data = await res.json()
      const coins = data.coins as [number, number, number]
      setCurrentCoins(coins)
      setCastState('animating')
    } catch (e: any) {
      setError(e.message)
      setCastState('idle')
    }
  }

  function handleCoinDone() {
    setCoinsReady(prev => {
      const next = prev + 1
      if (next === 3 && currentCoins && !lineRegisteredRef.current) {
        lineRegisteredRef.current = true
        setTimeout(() => {
          const value = coinsToLineValue(currentCoins)
          onLineCast({ value, coins: currentCoins })
          setCastState('done')
          setTimeout(() => {
            setCurrentCoins(null)
            setCoinsReady(0)
            setCastState('idle')
          }, 800)
        }, 400)
      }
      return next
    })
  }

  const lastLine = lines[lines.length - 1]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'clamp(20px, 3.5vh, 36px)',
      padding: 'clamp(24px, 5vw, 64px)',
      width: '100%',
      maxWidth: 480,
      textAlign: 'center',
    }}>

      {/* Line counter */}
      <p style={{
        ...cinzel,
        fontSize: 'clamp(11px, 1.2vw, 14px)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: '#a0c4a0',
      }}>
        {isComplete ? s.hexagramComplete : s.lineLabel(s.lineNames[currentLineIndex])}
      </p>

      {/* Hexagram building */}
      <div style={{ padding: '8px 0' }}>
        <HexagramDisplay lines={lines} />
      </div>

      {/* Last line result */}
      {lastLine && castState === 'idle' && !isComplete && (
        <p className="fade-in" style={{
          ...cormorant,
          fontSize: 'clamp(14px, 1.6vw, 17px)',
          color: '#d8e8d4',
          fontStyle: 'italic',
          letterSpacing: '0.05em',
        }}>
          {s.lineValues[lastLine.value]}
        </p>
      )}

      {/* Coins area */}
      {currentCoins && (
        <div className="fade-in" style={{
          display: 'flex',
          gap: 'clamp(16px, 3vw, 28px)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingBottom: 28,
        }}>
          {currentCoins.map((coin, i) => (
            <CoinFlip
              key={i}
              result={coin as 2 | 3}
              delay={i * 180}
              onDone={handleCoinDone}
            />
          ))}
        </div>
      )}

      {/* Status */}
      {castState === 'fetching' && (
        <p className="pulse" style={{
          ...cormorant,
          fontSize: 'clamp(14px, 1.6vw, 17px)',
          color: '#8aab86',
          fontStyle: 'italic',
        }}>
          {s.consultingQuantum}
        </p>
      )}

      {error && (
        <p style={{ ...cormorant, fontSize: 14, color: '#c44', opacity: 0.7 }}>{error}</p>
      )}

      {/* Cast / Complete button */}
      {!isComplete ? (
        <button
          onClick={castLine}
          disabled={castState !== 'idle'}
          style={{
            ...cinzel,
            fontSize: 'clamp(11px, 1.3vw, 14px)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: castState !== 'idle' ? '#4a7a50' : '#d8e8d4',
            background: 'none',
            border: `1px solid ${castState !== 'idle' ? 'rgba(80,160,90,0.15)' : 'rgba(80,160,90,0.4)'}`,
            borderRadius: 2,
            padding: 'clamp(10px, 1.5vw, 14px) clamp(24px, 4vw, 40px)',
            cursor: castState !== 'idle' ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {s.castLine(currentLineIndex + 1)}
        </button>
      ) : (
        <button
          onClick={onComplete}
          className="fade-in"
          style={{
            ...cinzel,
            fontSize: 'clamp(11px, 1.3vw, 14px)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#d8e8d4',
            background: 'none',
            border: '1px solid rgba(80,160,90,0.4)',
            borderRadius: 2,
            padding: 'clamp(10px, 1.5vw, 14px) clamp(24px, 4vw, 40px)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {s.revealReading}
        </button>
      )}
    </div>
  )
}
