import { useEffect, useState } from 'react'
import type { Hexagram } from '../types'
import type { Lang } from '../strings'

type Config = { paidEnabled: boolean; checkoutUrl: string | null; packCredits: number; packPriceUsd: number }
type Props = {
  lang: Lang
  primary: Hexagram
  changing: Hexagram | null
  movingLines: number[]
  intention: string
}
const green = '#b9d5bb'
const muted = '#82ad8a'
const fieldStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid rgba(120,190,130,.35)',
  borderRadius: 3, color: green, background: 'rgba(12,30,16,.6)',
  fontFamily: "'Cormorant Garamond', serif", fontSize: 17,
}
const buttonStyle = {
  padding: '12px 18px', color: green, background: 'rgba(55,102,65,.22)',
  border: '1px solid rgba(120,190,130,.45)', borderRadius: 3, cursor: 'pointer',
  fontFamily: "'Cinzel', serif", letterSpacing: '.08em', fontSize: 11,
}

export default function PremiumOffer({ lang, primary, changing, movingLines, intention }: Props) {
  const pt = lang === 'pt'
  const [config, setConfig] = useState<Config | null>(null)
  const [token, setToken] = useState(() => localStorage.getItem('quantum-iching-credits') || '')
  const [balance, setBalance] = useState<number | null>(null)
  const [receiptEmail, setReceiptEmail] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [showClaim, setShowClaim] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig).catch(() => setConfig(null))
  }, [])
  useEffect(() => {
    if (!config?.paidEnabled || !token) return
    fetch('/api/credits/balance', { headers: { Authorization: 'Bearer ' + token } })
      .then(async r => { if (!r.ok) throw new Error('Invalid credential'); return r.json() })
      .then(r => setBalance(r.remaining))
      .catch(() => { localStorage.removeItem('quantum-iching-credits'); setToken(''); setBalance(null) })
  }, [config, token])

  async function redeem() {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/credits/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, email: receiptEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase could not be found')
      localStorage.setItem('quantum-iching-credits', data.token)
      setToken(data.token); setBalance(data.remaining); setShowClaim(false)
    } catch (e) { setError(String(e instanceof Error ? e.message : e)) }
    finally { setBusy(false) }
  }

  async function deepen() {
    if (!token || !balance) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          lang, hexagram: { number: primary.hex },
          changingHexagram: changing ? { number: changing.hex } : null,
          movingLines, intention,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to generate reflection')
      setText(data.interpretation); setBalance(data.remaining)
    } catch (e) { setError(String(e instanceof Error ? e.message : e)) }
    finally { setBusy(false) }
  }

  function saveReflection() {
    if (!text) return
    const title = pt ? 'I Ching Quântico — Reflexão' : 'Quantum I Ching — Reflection'
    const body = title + '\n' + (intention || '') + '\n\n' + text
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'quantum-iching-reading.txt'
    a.click(); URL.revokeObjectURL(url)
  }

  if (!config?.paidEnabled) return null
  return (
    <section style={{ width: '100%', borderTop: '1px solid rgba(100,170,110,.25)',
      padding: '28px 0 10px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 14, color: green, textAlign: 'center' }}>
      <h3 style={{ fontFamily: "'Cinzel', serif", letterSpacing: '.22em',
        textTransform: 'uppercase', fontSize: 14, fontWeight: 400 }}>
        {pt ? 'Aprofundar a leitura' : 'Deepen this reading'}
      </h3>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.5,
        color: muted, maxWidth: 540 }}>
        {pt
          ? 'Uma reflexão mais extensa sobre o hexagrama, as mudanças e três perguntas para seu diário.'
          : 'An extended reflection on the hexagram, its changes, and three questions for your journal.'}
      </p>
      {text ? (
        <>
          <div style={{ textAlign: 'left', fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>
          <button style={buttonStyle} onClick={saveReflection}>
            {pt ? 'Salvar reflexão' : 'Save reflection'}
          </button>
        </>
      ) : balance !== null && balance > 0 ? (
        <>
          <p style={{ color: muted, fontSize: 13 }}>
            {balance} {pt ? 'créditos restantes' : 'credits remaining'}
          </p>
          <button disabled={busy} style={buttonStyle} onClick={deepen}>
            {busy ? (pt ? 'Escrevendo...' : 'Composing...') :
              (pt ? 'Usar 1 crédito' : 'Use 1 credit')}
          </button>
        </>
      ) : (
        <>
          <p style={{ color: muted, fontSize: 14 }}>
            {pt ? '5 leituras aprofundadas por US$ 9, pagamento único.' :
              '5 extended readings for $9, one-time purchase.'}
          </p>
          {config.checkoutUrl && (
            <a href={config.checkoutUrl} target="_blank" rel="noopener noreferrer" style={buttonStyle}>
              {pt ? 'Comprar 5 leituras — US$ 9' : 'Get 5 readings — $9'}
            </a>
          )}
          <button style={{ ...buttonStyle, background: 'none', border: 'none', textDecoration: 'underline' }}
            onClick={() => setShowClaim(!showClaim)}>
            {pt ? 'Já paguei — ativar créditos' : 'Already purchased? Activate credits'}
          </button>
          {showClaim && (
            <div style={{ width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input aria-label="Ko-fi payment email" type="email" value={receiptEmail}
                onChange={e => setReceiptEmail(e.target.value)}
                placeholder={pt ? 'E-mail usado no Ko-fi' : 'Email used at Ko-fi'}
                style={fieldStyle}/>
              <input aria-label="Ko-fi transaction ID" value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder={pt ? 'ID da transação Ko-fi' : 'Ko-fi transaction ID'}
                style={fieldStyle}/>
              <p style={{ fontSize: 13, color: muted }}>
                {pt
                  ? 'Use o ID da transação no recibo. A confirmação pode levar alguns instantes.'
                  : 'Use the transaction ID from your receipt. Processing may take a moment.'}
              </p>
              <button disabled={busy || !receiptEmail || !transactionId} style={buttonStyle} onClick={redeem}>
                {busy ? '...' : (pt ? 'Ativar' : 'Activate')}
              </button>
            </div>
          )}
        </>
      )}
      {error && <p role="alert" style={{ color: '#edb1a5', fontSize: 14 }}>{error}</p>}
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: muted }}>
        {pt ? 'Reflexão simbólica, não previsão nem aconselhamento clínico.' :
          'Symbolic reflection, not prediction or clinical advice.'}
      </p>
    </section>
  )
}
