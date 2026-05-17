import { useState, useRef, useEffect } from 'react'
import { useGroqChat } from './useGroqChat'

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const IconBot     = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M12 11V7"/><circle cx="12" cy="5" r="2"/>
    <path d="M8 15h.01M16 15h.01"/>
  </svg>
)
const IconSend    = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconClose   = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconTrash   = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)
const IconStop    = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
)
const IconMinus   = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)

// ─── Suggestions rapides ──────────────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  'Résume mon tableau de bord',
  'Combien de patients ai-je et qui a le plus d\'analyses ?',
  'Quels sont mes derniers résultats IDC ?',
  'Donne-moi les stats mammographie et risque SEER',
  'Y a-t-il des alertes critiques à surveiller ?',
]

// ─── Rendu Markdown simple ────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g,  '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,      '<em>$1</em>')
    .replace(/`(.+?)`/g,        '<code style="background:rgba(225,29,72,0.08);padding:2px 6px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>')
    .replace(/^### (.+)$/gm,    '<strong style="display:block;margin-top:10px;color:#9d174d">$1</strong>')
    .replace(/^## (.+)$/gm,     '<strong style="display:block;margin-top:10px;font-size:14px;color:#be185d">$1</strong>')
    .replace(/^- (.+)$/gm,      '<span style="display:block;padding-left:12px">• $1</span>')
    .replace(/\n\n/g,            '<br/><br/>')
    .replace(/\n/g,              '<br/>')
}

// ─── Composant message ────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display:        'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom:   10,
      animation:      'fadeSlideIn 0.2s ease',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background:     'linear-gradient(135deg, #9d174d 0%, #be185d 100%)',
          display:        'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink:     0,
          marginRight:    8,
          marginTop:      2,
          color:          '#fff',
          fontSize:       11,
          fontWeight:     700,
        }}>AI</div>
      )}
      <div style={{
        maxWidth:     '82%',
        padding:      '10px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background:   isUser
          ? 'linear-gradient(135deg, #1a0a10 0%, #4c0519 100%)'
          : 'rgba(255,255,255,0.9)',
        color:        isUser ? '#fff' : '#1a0a10',
        fontSize:     13,
        lineHeight:   1.6,
        border:       isUser ? 'none' : '1px solid rgba(225,29,72,0.12)',
        boxShadow:    isUser
          ? '0 2px 8px rgba(26,10,16,0.2)'
          : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {isUser ? (
          <span>{msg.content}</span>
        ) : (
          <span
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}
        {msg.streaming && (
          <span style={{ display: 'inline-block', width: 8, height: 14, background: '#be185d', borderRadius: 2, marginLeft: 3, animation: 'blink 0.8s infinite', verticalAlign: 'middle' }} />
        )}
      </div>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ChatBot({ groqApiKey }) {
  const [open,      setOpen]      = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input,     setInput]     = useState('')
  const [showSugg,  setShowSugg]  = useState(true)
  const messagesEndRef            = useRef(null)
  const inputRef                  = useRef(null)
  const textareaRef               = useRef(null)

  const { messages, isLoading, error, sendMessage, clearMessages, stopStreaming } =
    useGroqChat(groqApiKey)

  // Auto-scroll
  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, minimized])

  // Focus input à l'ouverture
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [open, minimized])

  // Masquer suggestions dès qu'on écrit ou qu'il y a des messages
  useEffect(() => {
    if (messages.length > 0 || input.trim()) setShowSugg(false)
    else if (!input.trim() && messages.length === 0) setShowSugg(true)
  }, [messages.length, input])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input.trim())
    setInput('')
    // Auto-resize reset
    if (textareaRef.current) textareaRef.current.style.height = '40px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (text) => {
    sendMessage(text)
    setShowSugg(false)
  }

  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = '40px'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const hasMessages = messages.length > 0

  return (
    <>
      {/* ── Styles globaux ── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(6px) }
          to   { opacity:1; transform:translateY(0)   }
        }
        @keyframes blink {
          0%,100% { opacity:1 }
          50%      { opacity:0 }
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(0.85) translateY(10px) }
          to   { opacity:1; transform:scale(1)    translateY(0)     }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0   rgba(190,24,93,0.4) }
          70%  { box-shadow: 0 0 0 10px rgba(190,24,93,0)  }
          100% { box-shadow: 0 0 0 0   rgba(190,24,93,0)  }
        }
        .pathobot-input::placeholder { color: #b0818f !important }
        .pathobot-input:focus        { outline: none !important }
        .pathobot-scroll::-webkit-scrollbar       { width: 4px }
        .pathobot-scroll::-webkit-scrollbar-track { background: transparent }
        .pathobot-scroll::-webkit-scrollbar-thumb { background: rgba(190,24,93,0.2); border-radius: 4px }
        .sugg-btn:hover { background: rgba(225,29,72,0.1) !important; border-color: rgba(225,29,72,0.3) !important }
        .icon-btn:hover { background: rgba(255,255,255,0.15) !important }
        .send-btn:hover:not(:disabled) { background: #be185d !important; transform: scale(1.05) }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed }
      `}</style>

      {/* ── Bouton flottant ── */}
      <button
        onClick={() => { setOpen(o => !o); setMinimized(false) }}
        style={{
          position:     'fixed',
          bottom:       24,
          right:        24,
          zIndex:       9999,
          width:        54,
          height:       54,
          borderRadius: '50%',
          border:       'none',
          background:   'linear-gradient(135deg, #1a0a10 0%, #9d174d 50%, #be185d 100%)',
          color:        '#fff',
          cursor:       'pointer',
          boxShadow:    '0 4px 20px rgba(26,10,16,0.35)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'all 0.2s',
          animation:    !open ? 'pulse-ring 2.5s infinite' : 'none',
        }}
        aria-label="Ouvrir PathoBot"
      >
        {open ? <IconClose /> : <IconBot />}
        {/* Badge notification */}
        {!open && (
          <div style={{
            position:   'absolute',
            top:        -2, right: -2,
            width:      14, height: 14,
            borderRadius: '50%',
            background: '#e11d48',
            border:     '2px solid #fff',
            fontSize:   8,
            display:    'flex', alignItems: 'center', justifyContent: 'center',
            color:      '#fff', fontWeight: 700,
          }}>AI</div>
        )}
      </button>

      {/* ── Fenêtre chatbot ── */}
      {open && (
        <div style={{
          position:     'fixed',
          bottom:       90,
          right:        24,
          zIndex:       9998,
          width:        370,
          borderRadius: 20,
          background:   '#fff9fb',
          boxShadow:    '0 20px 60px rgba(26,10,16,0.18), 0 4px 20px rgba(190,24,93,0.1)',
          border:       '1px solid rgba(225,29,72,0.12)',
          overflow:     'hidden',
          animation:    'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          display:      'flex',
          flexDirection:'column',
          maxHeight:    minimized ? 58 : 560,
          transition:   'max-height 0.3s ease',
        }}>
          {/* ── Header ── */}
          <div style={{
            background:    'linear-gradient(135deg, #1a0a10 0%, #4c0519 60%, #9d174d 100%)',
            padding:       '14px 16px',
            display:       'flex',
            alignItems:    'center',
            gap:           10,
            flexShrink:    0,
            cursor:        'pointer',
          }}
            onClick={() => setMinimized(m => !m)}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border:     '1px solid rgba(255,255,255,0.2)',
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              color:      '#fda4af', flexShrink: 0,
            }}>
              <IconBot />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display, system-ui)', letterSpacing: '-0.3px' }}>PathoBot</div>
              <div style={{ color: '#fda4af', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Assistant médical IA · PathoScan
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {hasMessages && !minimized && (
                <button className="icon-btn" onClick={e => { e.stopPropagation(); clearMessages(); setShowSugg(true) }} style={{
                  background: 'transparent', border: 'none', color: '#fda4af',
                  cursor: 'pointer', padding: '5px 6px', borderRadius: 8, display: 'flex',
                }} title="Effacer la conversation">
                  <IconTrash />
                </button>
              )}
              <button className="icon-btn" onClick={e => { e.stopPropagation(); setMinimized(m => !m) }} style={{
                background: 'transparent', border: 'none', color: '#fda4af',
                cursor: 'pointer', padding: '5px 6px', borderRadius: 8, display: 'flex',
              }} title={minimized ? 'Agrandir' : 'Réduire'}>
                {minimized ? <IconChevron /> : <IconMinus />}
              </button>
              <button className="icon-btn" onClick={e => { e.stopPropagation(); setOpen(false) }} style={{
                background: 'transparent', border: 'none', color: '#fda4af',
                cursor: 'pointer', padding: '5px 6px', borderRadius: 8, display: 'flex',
              }} title="Fermer">
                <IconClose />
              </button>
            </div>
          </div>

          {/* ── Corps ── */}
          {!minimized && (
            <>
              {/* Zone messages */}
              <div
                className="pathobot-scroll"
                style={{
                  flex:       1,
                  overflowY:  'auto',
                  padding:    '16px 14px 8px',
                  minHeight:  0,
                }}
              >
                {/* Message de bienvenue */}
                {!hasMessages && (
                  <div style={{ textAlign: 'center', padding: '10px 0 16px', animation: 'fadeSlideIn 0.4s ease' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #fce7f3, #fda4af)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(225,29,72,0.15)',
                    }}>
                      <IconBot />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a0a10', marginBottom: 5 }}>Bonjour, je suis PathoBot 👋</div>
                    <div style={{ fontSize: 12, color: '#9d174d', lineHeight: 1.5 }}>
                      Je réponds à vos questions sur PathoScan,<br />
                      l'oncologie et la gestion des patients.
                    </div>
                  </div>
                )}

                {/* Suggestions rapides */}
                {showSugg && !hasMessages && (
                  <div style={{ marginBottom: 12 }}>
                    {QUICK_SUGGESTIONS.map((s, i) => (
                      <button key={i} className="sugg-btn" onClick={() => handleSuggestion(s)} style={{
                        display:       'block',
                        width:         '100%',
                        textAlign:     'left',
                        padding:       '8px 12px',
                        marginBottom:  6,
                        borderRadius:  10,
                        border:        '1px solid rgba(225,29,72,0.15)',
                        background:    'rgba(253,244,246,0.8)',
                        color:         '#9d174d',
                        fontSize:      12,
                        cursor:        'pointer',
                        transition:    'all 0.15s',
                        fontFamily:    'inherit',
                      }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => (
                  <Message key={msg.id} msg={msg} />
                ))}

                {/* Indicateur chargement */}
                {isLoading && !messages.find(m => m.streaming) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #9d174d, #be185d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>AI</div>
                    <div style={{ display: 'flex', gap: 4, padding: '10px 14px', borderRadius: 12, background: '#fff', border: '1px solid rgba(225,29,72,0.12)' }}>
                      {[0, 150, 300].map(delay => (
                        <div key={delay} style={{
                          width: 7, height: 7, borderRadius: '50%', background: '#be185d',
                          animation: `blink 1.2s ${delay}ms infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Erreur */}
                {error && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 10, marginBottom: 10,
                    background: '#fff1f2', border: '1px solid #fecdd3',
                    color: '#9f1239', fontSize: 12,
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bouton stop */}
              {isLoading && (
                <div style={{ textAlign: 'center', padding: '4px 14px 0' }}>
                  <button onClick={stopStreaming} style={{
                    padding: '5px 14px', borderRadius: 8, border: '1px solid rgba(225,29,72,0.2)',
                    background: 'rgba(255,241,242,0.8)', color: '#be185d',
                    fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
                  }}>
                    <IconStop /> Arrêter la génération
                  </button>
                </div>
              )}

              {/* ── Zone saisie ── */}
              <div style={{
                padding:    '10px 14px 14px',
                borderTop:  '1px solid rgba(225,29,72,0.08)',
                background: '#fff',
                flexShrink: 0,
              }}>
                <div style={{
                  display:      'flex',
                  alignItems:   'flex-end',
                  gap:          8,
                  background:   '#fdf2f4',
                  borderRadius: 14,
                  border:       '1.5px solid rgba(225,29,72,0.15)',
                  padding:      '6px 8px 6px 14px',
                  transition:   'border-color 0.2s',
                }}>
                  <textarea
                    ref={textareaRef}
                    className="pathobot-input"
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question médicale…"
                    rows={1}
                    style={{
                      flex:       1,
                      background: 'transparent',
                      border:     'none',
                      resize:     'none',
                      fontSize:   13,
                      color:      '#1a0a10',
                      fontFamily: 'inherit',
                      lineHeight: 1.5,
                      height:     40,
                      maxHeight:  120,
                      paddingTop: 8,
                      overflowY:  'auto',
                    }}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    style={{
                      width:        36,
                      height:       36,
                      borderRadius: 10,
                      border:       'none',
                      background:   input.trim() && !isLoading
                        ? 'linear-gradient(135deg, #9d174d, #e11d48)'
                        : 'rgba(225,29,72,0.15)',
                      color:        input.trim() && !isLoading ? '#fff' : '#fda4af',
                      display:      'flex',
                      alignItems:   'center',
                      justifyContent: 'center',
                      cursor:       'pointer',
                      flexShrink:   0,
                      transition:   'all 0.2s',
                    }}
                    aria-label="Envoyer"
                  >
                    <IconSend />
                  </button>
                </div>
                <div style={{ fontSize: 10, color: '#c4859a', textAlign: 'center', marginTop: 7 }}>
                  Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}