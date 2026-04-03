import { useState } from 'react'
import type { Lang } from '../strings'
import strings from '../strings'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

interface Props {
  lang: Lang
  onReady: (intention: string) => void
}

export default function IntentionScreen({ lang, onReady }: Props) {
  const [intention, setIntention] = useState('')
  const s = strings[lang]

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'clamp(28px, 5vh, 56px)',
      padding: 'clamp(32px, 6vw, 80px)',
      maxWidth: 680,
      width: '100%',
      textAlign: 'center',
    }}>

      {/* Glyph */}
      <div className="pulse" style={{
        fontSize: 'clamp(56px, 10vw, 96px)',
        color: 'rgba(120, 200, 130, 0.5)',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        ䷀
      </div>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1 style={{
          ...cinzel,
          fontSize: 'clamp(22px, 4vw, 44px)',
          fontWeight: 300,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#d8e8d4',
        }}>
          {s.title}
        </h1>
        <p style={{
          ...cormorant,
          fontSize: 'clamp(14px, 1.6vw, 18px)',
          letterSpacing: '0.15em',
          fontStyle: 'italic',
          color: '#8aab86',
        }}>
          {s.subtitle}
        </p>
      </div>

      {/* Intention input */}
      <textarea
        value={intention}
        onChange={e => setIntention(e.target.value)}
        placeholder={s.intentionPlaceholder}
        rows={3}
        style={{
          ...cormorant,
          width: '100%',
          fontSize: 'clamp(17px, 2vw, 21px)',
          lineHeight: 1.7,
          color: '#d8e8d4',
          background: 'rgba(0, 20, 5, 0.45)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(80, 160, 90, 0.3)',
          borderRadius: 6,
          padding: 'clamp(14px, 2vw, 22px)',
          resize: 'none',
          outline: 'none',
        }}
      />

      {/* Begin button */}
      <button
        onClick={() => onReady(intention.trim())}
        style={{
          ...cinzel,
          fontSize: 'clamp(12px, 1.4vw, 14px)',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: '#d8e8d4',
          background: 'none',
          border: '1px solid rgba(80, 160, 90, 0.4)',
          borderRadius: 2,
          padding: 'clamp(12px, 1.8vw, 16px) clamp(32px, 5vw, 56px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          const b = e.currentTarget
          b.style.borderColor = 'rgba(100, 220, 120, 0.7)'
          b.style.color = '#a8e8b0'
        }}
        onMouseLeave={e => {
          const b = e.currentTarget
          b.style.borderColor = 'rgba(80, 160, 90, 0.4)'
          b.style.color = '#d8e8d4'
        }}
      >
        {s.beginButton}
      </button>
    </div>
  )
}
