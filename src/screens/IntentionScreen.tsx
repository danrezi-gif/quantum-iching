import { useState } from 'react'

const cinzel = { fontFamily: "'Cinzel', serif" }
const cormorant = { fontFamily: "'Cormorant Garamond', serif" }

interface Props {
  onReady: (intention: string) => void
}

export default function IntentionScreen({ onReady }: Props) {
  const [intention, setIntention] = useState('')

  return (
    <div className="fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'clamp(24px, 4vh, 48px)',
      padding: 'clamp(24px, 5vw, 64px)',
      maxWidth: 540,
      width: '100%',
      textAlign: 'center',
    }}>

      {/* Glyph */}
      <div className="pulse" style={{
        fontSize: 'clamp(48px, 8vw, 80px)',
        color: '#7a7060',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        ䷀
      </div>

      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{
          ...cinzel,
          fontSize: 'clamp(18px, 2.5vw, 28px)',
          fontWeight: 400,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#1a1a1a',
        }}>
          Quantum I Ching
        </h1>
        <p style={{
          ...cormorant,
          fontSize: 'clamp(13px, 1.4vw, 16px)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#6b6355',
        }}>
          Book of Changes
        </p>
      </div>

      {/* Instruction */}
      <p style={{
        ...cormorant,
        fontSize: 'clamp(17px, 2vw, 22px)',
        lineHeight: 1.7,
        color: '#4a4540',
        fontStyle: 'italic',
      }}>
        Focus on a question or an intention.
      </p>

      {/* Optional text input */}
      <textarea
        value={intention}
        onChange={e => setIntention(e.target.value)}
        placeholder="You may write your question here, or hold it silently..."
        rows={3}
        style={{
          ...cormorant,
          width: '100%',
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          lineHeight: 1.7,
          color: '#1a1a1a',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(44,44,44,0.2)',
          borderRadius: 4,
          padding: 'clamp(12px, 2vw, 20px)',
          resize: 'none',
          outline: 'none',
        }}
      />

      {/* Cast button */}
      <button
        onClick={() => onReady(intention.trim())}
        style={{
          ...cinzel,
          fontSize: 'clamp(12px, 1.4vw, 15px)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#3a3530',
          background: 'none',
          border: '1px solid rgba(44,44,44,0.35)',
          borderRadius: 2,
          padding: 'clamp(10px, 1.5vw, 14px) clamp(24px, 4vw, 40px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          const b = e.currentTarget
          b.style.color = '#1a1a1a'
          b.style.borderColor = 'rgba(44,44,44,0.7)'
        }}
        onMouseLeave={e => {
          const b = e.currentTarget
          b.style.color = '#3a3530'
          b.style.borderColor = 'rgba(44,44,44,0.35)'
        }}
      >
        I am ready
      </button>
    </div>
  )
}
