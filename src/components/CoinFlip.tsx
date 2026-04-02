import { useEffect, useRef, useState } from 'react'

interface Props {
  result: 2 | 3 | null  // 2=tails, 3=heads, null=idle
  delay?: number
  onDone?: () => void
}

export default function CoinFlip({ result, delay = 0, onDone }: Props) {
  const [state, setState] = useState<'idle' | 'flipping' | 'done'>('idle')
  const coinRef = useRef<HTMLDivElement>(null)
  const calledRef = useRef(false)

  useEffect(() => {
    if (result === null) { setState('idle'); calledRef.current = false; return }

    calledRef.current = false
    const t = setTimeout(() => {
      setState('flipping')
      const finalRotation = result === 3 ? 1440 : 1620
      if (coinRef.current) {
        coinRef.current.style.setProperty('--final-rotation', `${finalRotation}deg`)
      }
      const done = setTimeout(() => {
        setState('done')
        if (!calledRef.current) {
          calledRef.current = true
          onDone?.()
        }
      }, 1400)
      return () => clearTimeout(done)
    }, delay)

    return () => clearTimeout(t)
  }, [result])

  return (
    <div className="coin-wrapper flex items-center justify-center">
      <div
        ref={coinRef}
        className={`coin ${state === 'flipping' ? 'flipping' : ''}`}
        style={state === 'done' ? { transform: `rotateY(${result === 3 ? 0 : 180}deg)` } : {}}
      >
        <div className="coin-face front">
          <span style={{ fontSize: 'clamp(18px, 3vw, 26px)', color: '#faf9f7', opacity: 0.8 }}>☰</span>
        </div>
        <div className="coin-face back">
          <span style={{ fontSize: 'clamp(18px, 3vw, 26px)', color: '#faf9f7', opacity: 0.8 }}>☷</span>
        </div>
      </div>
      {state === 'done' && (
        <span style={{
          position: 'absolute',
          bottom: -20,
          fontSize: 11,
          color: 'rgba(44,44,44,0.4)',
          fontFamily: 'Cormorant Garamond, serif',
          letterSpacing: '0.1em',
        }}>
          {result === 3 ? 'yang' : 'yin'}
        </span>
      )}
    </div>
  )
}
