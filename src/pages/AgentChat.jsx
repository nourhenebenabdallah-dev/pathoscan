import { useState, useRef, useEffect } from 'react'

const API = 'http://localhost:8000'
const SESSION_ID = 'admin-session-' + new Date().toISOString().slice(0, 10)

const suggestions = [
  'Combien de médecins sont en attente ?',
  'Quel est le taux d\'approbation global ?',
  'Explique le processus de vérification CNOM',
  'Y a-t-il des signaux de fraude récents ?',
]

function SessionItem({ session, active, onClick }) {
  const last = session.last_message
  return (
    <div onClick={onClick} style={{
      padding: '12px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      background: active ? 'rgba(225,29,72,0.04)' : 'transparent',
      border: active ? '1px solid rgba(225,29,72,0.1)' : '1px solid transparent',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--dark-50)')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? 'var(--accent)' : 'var(--text2)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        💬 {session.session_id}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text4)', marginTop: 4 }}>
        {session.message_count} messages
      </div>
      {last && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {last.content?.slice(0, 40)}...
        </div>
      )}
    </div>
  )
}

export default function AgentChat() {
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState(SESSION_ID)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/admin/chat/sessions`)
      .then(r => r.json())
      .then(setSessions)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoadingHistory(true)
    setMessages([])
    fetch(`${API}/admin/chat/history/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages?.length > 0) {
          setMessages(data.messages)
        } else {
          setMessages([{
            role: 'assistant',
            content: 'Bonjour ! Je suis votre assistant IA PathoScan.\nJe peux vous aider à analyser les demandes de médecins, consulter les statistiques et vous guider dans le processus de vérification.',
          }])
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false))
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const newSession = () => {
    const sid = 'session-' + Date.now()
    setSessionId(sid)
  }

  const deleteSession = async (sid) => {
    await fetch(`${API}/admin/chat/history/${sid}`, { method: 'DELETE' })
    setSessions(prev => prev.filter(s => s.session_id !== sid))
    if (sid === sessionId) newSession()
  }

  const send = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')

    const userMsg = { role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(`${API}/admin/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, session_id: sessionId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      fetch(`${API}/admin/chat/sessions`).then(r => r.json()).then(setSessions).catch(() => {})
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Erreur de connexion au backend.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)' }}>
      {/* Sidebar sessions */}
      <div style={{
        width: 260, flexShrink: 0,
        background: 'var(--panel)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 12px', gap: 10, overflowY: 'auto',
      }}>
        <button onClick={newSession} style={{
          padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
          background: 'var(--gradient-dark)',
          color: '#fff', fontWeight: 600, fontSize: 13,
          boxShadow: '0 4px 16px rgba(26,10,16,0.2)',
          marginBottom: 6,
          transition: 'var(--transition)',
          letterSpacing: '-0.2px',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >+ Nouvelle session</button>

        <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px' }}>
          Historique
        </div>

        {sessions.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--text4)', textAlign: 'center', padding: '16px 0' }}>
            Aucune session
          </div>
        )}

        {sessions.map(s => (
          <div key={s.session_id} style={{ position: 'relative' }}>
            <SessionItem session={s} active={s.session_id === sessionId} onClick={() => setSessionId(s.session_id)} />
            <button
              onClick={e => { e.stopPropagation(); deleteSession(s.session_id) }}
              style={{
                position: 'absolute', right: 8, top: 8,
                width: 20, height: 20, borderRadius: '50%', border: 'none',
                background: 'rgba(254,242,242,0.8)', color: '#dc2626',
                fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(254,242,242,0.8)'}
            >×</button>
          </div>
        ))}
      </div>

      {/* Chat main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24, gap: 16, minWidth: 0 }}>
        {/* Header */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: '0 4px 12px rgba(26,10,16,0.2)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text1)' }}>
              Assistant IA PathoScan
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text4)' }}>
              Session : {sessionId}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'var(--green-bg)', color: 'var(--green)',
            fontSize: 12, fontWeight: 600, border: '1px solid rgba(5,150,105,0.15)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--green)',
              display: 'inline-block',
              boxShadow: '0 0 6px rgba(5,150,105,0.4)',
              animation: 'pulse-soft 2s infinite',
            }} />
            En ligne
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: '0 4px' }}>
          {loadingHistory && (
            <div style={{ textAlign: 'center', color: 'var(--text4)', padding: 32 }}>
              <div style={{
                width: 32, height: 32, margin: '0 auto 12px',
                borderRadius: '50%',
                border: '2px solid var(--dark-200)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: `fadeInUp 0.4s ${i * 0.05}s both`,
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, marginRight: 10, flexShrink: 0, alignSelf: 'flex-end',
                  background: 'var(--gradient-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  boxShadow: '0 3px 10px rgba(26,10,16,0.2)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                  </svg>
                </div>
              )}
              <div style={{
                maxWidth: '68%', padding: '12px 18px',
                borderRadius: msg.role === 'user' ? '16px 16px 6px 16px' : '16px 16px 16px 6px',
                background: msg.role === 'user'
                  ? 'var(--gradient-dark)'
                  : 'var(--panel)',
                color: msg.role === 'user' ? '#fff' : 'var(--text1)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                boxShadow: msg.role === 'user'
                  ? '0 4px 16px rgba(26,10,16,0.2)'
                  : 'var(--shadow-xs)',
              }}>
                {msg.content}
                {msg.created_at && (
                  <div style={{ fontSize: 10, opacity: 0.4, marginTop: 6, textAlign: 'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'var(--gradient-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(26,10,16,0.2)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                </svg>
              </div>
              <div style={{
                padding: '12px 18px', borderRadius: '16px 16px 16px 6px',
                background: 'var(--panel)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[0,1,2].map(n => (
                    <div key={n} style={{
                      width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
                      animation: 'bounce 1.2s infinite', animationDelay: `${n * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                padding: '8px 18px', borderRadius: 99,
                border: '1.5px solid var(--border2)',
                background: 'var(--panel)',
                color: 'var(--text2)', fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; e.target.style.background = 'var(--dark-50)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)'; e.target.style.background = 'var(--panel)' }}
              >{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          display: 'flex', gap: 12,
          background: 'var(--panel)',
          border: '1.5px solid var(--border2)',
          borderRadius: 16, padding: '8px 8px 8px 18px',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Posez votre question..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', color: 'var(--text1)',
              fontFamily: 'var(--font-body)', fontSize: 14,
            }}
            onFocus={e => e.currentTarget.parentElement.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.parentElement.style.borderColor = 'var(--border2)'}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            padding: '10px 22px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: !input.trim() || loading
              ? 'var(--dark-200)'
              : 'var(--gradient-dark)',
            color: !input.trim() || loading ? 'var(--text4)' : '#fff',
            fontWeight: 600, fontSize: 15, transition: 'all 0.2s',
            boxShadow: !input.trim() || loading ? 'none' : '0 4px 16px rgba(26,10,16,0.2)',
          }}
            onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.transform = 'scale(1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-soft { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </div>
  )
}