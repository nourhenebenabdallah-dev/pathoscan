// VerificationModal.jsx - Version optimisée et harmonisée
import { useState, useEffect } from 'react'
import DocumentUpload from './DocumentUpload'

const API = 'http://localhost:8000'

const checkLabels = {
  diploma: 'Authentification diplôme',
  cnom: 'Validation CNOM',
  identity: 'Vérification identité (OCR)',
  fraud: 'Détection de fraude',
  photo: 'Correspondance photo',
  hospital: 'Validation établissement',
}

const statusStyle = {
  pass:    { bg: 'rgba(5,150,105,0.08)',  color: '#059669',  dot: '#059669', label: 'Valide',   icon: '✓' },
  fail:    { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626',  dot: '#dc2626', label: 'Échec',    icon: '✗' },
  warning: { bg: 'rgba(217,119,6,0.08)',   color: '#d97706',  dot: '#d97706', label: 'Attention', icon: '!' },
}

const recStyle = {
  APPROUVER:            { bg: 'rgba(5,150,105,0.08)',  color: '#059669',  label: 'APPROUVER', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
  REJETER:              { bg: 'rgba(220,38,38,0.08)',   color: '#dc2626',  label: 'REJETER',   gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
  VERIFICATION_MANUELLE:{ bg: 'rgba(217,119,6,0.08)',   color: '#d97706',  label: 'VÉRIF. MANUELLE', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  'VÉRIFICATION_MANUELLE':{ bg: 'rgba(217,119,6,0.08)', color: '#d97706',  label: 'VÉRIF. MANUELLE', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
}

function DocIcon({ name, type }) {
  const n = (name || '').toLowerCase()
  const t = (type || '').toLowerCase()
  if (t === 'diplome' || n.includes('diplom')) return <span style={{ fontSize: 20 }}>🎓</span>
  if (t === 'cin' || n.includes('identit') || n.includes('cin') || n.includes('carte')) return <span style={{ fontSize: 20 }}>🪪</span>
  if (t === 'cnom' || n.includes('cnom') || n.includes('ordre')) return <span style={{ fontSize: 20 }}>🏛️</span>
  if (n.includes('photo') || n.includes('portrait')) return <span style={{ fontSize: 20 }}>📸</span>
  return <span style={{ fontSize: 20 }}>📄</span>
}

// ── Image Lightbox ────────────────────────────────────────────────────────────
function Lightbox({ url, name, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(15, 2, 8, 0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: -16, right: -16, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >×</button>
        <img src={url} alt={name} style={{
          maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain',
          borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
        }} />
        <div style={{ textAlign: 'center', marginTop: 16, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>
          {name}
        </div>
      </div>
    </div>
  )
}

// ── Image Card avec design cohérent ──────────────────────────────────────────
function ImageCard({ file, visualAnalysis, isAnalyzing, onPreview }) {
  const a = visualAnalysis
  const score = a?.visual_score
  const scoreColor = !score ? 'var(--text4)' : score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'

  return (
    <div style={{
      background: 'var(--dark-50)',
      border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div onClick={() => onPreview?.()} style={{
        position: 'relative', height: 130, overflow: 'hidden',
        cursor: 'pointer', background: 'var(--dark-100)',
      }}>
        <img src={file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.style.display = 'none' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '10px 12px',
        }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>🔍 Cliquer pour agrandir</span>
          {score !== undefined && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px',
              borderRadius: 99, background: 'rgba(0,0,0,0.6)', color: scoreColor }}>
              {score}/100
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text1)', marginBottom: 6,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        {isAnalyzing && !a && (
          <div style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic' }}>✧ Analyse en cours...</div>
        )}
        {!isAnalyzing && !a && (
          <div style={{ fontSize: 11, color: 'var(--text4)' }}>En attente d'analyse</div>
        )}
        {a && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 99,
              background: 'rgba(225,29,72,0.05)', color: 'var(--accent)', fontWeight: 600
            }}>
              {a.document_type?.toUpperCase() || 'DOC'}
            </span>
            {a.quality && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                background: a.quality === 'bonne' ? 'rgba(5,150,105,0.08)' : a.quality === 'moyenne' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                color: a.quality === 'bonne' ? '#059669' : a.quality === 'moyenne' ? '#d97706' : '#dc2626',
              }}>{a.quality}</span>
            )}
            {a.is_authentic === true && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(5,150,105,0.08)', color: '#059669', fontWeight: 600 }}>✓ Authentique</span>
            )}
            {a.is_authentic === false && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontWeight: 600 }}>✗ Suspect</span>
            )}
          </div>
        )}
        {a?.anomalies?.length > 0 && a.anomalies.map((an, i) => (
          <div key={i} style={{ fontSize: 10, color: '#dc2626', marginTop: 4 }}>⚠️ {an}</div>
        ))}
        {a?.commentary && (
          <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.45, marginTop: 5,
            padding: '8px', background: 'var(--dark-100)', borderRadius: 6, borderLeft: '2px solid var(--accent)' }}>
            {a.commentary}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Doc Card avec design cohérent ────────────────────────────────────────────
function DocCard({ name, visualAnalysis, isAnalyzing }) {
  const a = visualAnalysis
  const score = a?.visual_score
  const scoreColor = !score ? 'var(--text4)' : score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626'

  return (
    <div style={{
      background: 'var(--dark-50)',
      border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: 'var(--dark-100)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DocIcon name={name} type={a?.document_type} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text1)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          {score !== undefined && (
            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 99, flexShrink: 0,
              background: score >= 70 ? 'rgba(5,150,105,0.08)' : score >= 40 ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
              color: scoreColor }}>{score}/100</span>
          )}
        </div>
        {isAnalyzing && !a && <div style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic' }}>✧ Analyse IA en cours...</div>}
        {!isAnalyzing && !a && <div style={{ fontSize: 11, color: 'var(--text4)' }}>En attente d'analyse</div>}
        {a && (
          <>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
              {a.document_type && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(225,29,72,0.05)', color: 'var(--accent)', fontWeight: 600 }}>{a.document_type.toUpperCase()}</span>}
              {a.quality && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                background: a.quality === 'bonne' ? 'rgba(5,150,105,0.08)' : a.quality === 'moyenne' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                color: a.quality === 'bonne' ? '#059669' : a.quality === 'moyenne' ? '#d97706' : '#dc2626' }}>{a.quality}</span>}
              {a.is_authentic === true && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(5,150,105,0.08)', color: '#059669', fontWeight: 600 }}>✓ Authentique</span>}
              {a.is_authentic === false && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99,
                background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontWeight: 600 }}>✗ Suspect</span>}
            </div>
            {a.commentary && (
              <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5,
                padding: '8px', background: 'var(--dark-100)', borderRadius: 6,
                borderLeft: '3px solid var(--accent)' }}>
                💬 {a.commentary}
              </div>
            )}
            {a.anomalies?.length > 0 && (
              <div style={{ marginTop: 5 }}>
                {a.anomalies.map((an, i) => <div key={i} style={{ fontSize: 10, color: '#dc2626', marginTop: 2 }}>⚠️ {an}</div>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function VerificationModal({ doctor, result: initialResult, onClose, onApprove, onReject }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [result, setResult] = useState(initialResult)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [lightbox, setLightbox] = useState(null)
  const [activeTab, setActiveTab] = useState('analyse')
  const [loadingFiles, setLoadingFiles] = useState(false)

  const rec = recStyle[result?.recommendation] || recStyle.VERIFICATION_MANUELLE
  const isPending = doctor.status === 'pending'
  const doctorDocs = doctor.documents || []

  const visualMap = {}
  if (result?.visual_analyses) {
    result.visual_analyses.forEach(va => { visualMap[va.name] = va.analysis })
  }

  useEffect(() => {
    fetchUploadedFiles()
  }, [doctor.id])

  const fetchUploadedFiles = async () => {
    setLoadingFiles(true)
    try {
      const res = await fetch(`${API}/doctors/${doctor.id}/documents`)
      const data = await res.json()
      setUploadedFiles(data.files || [])
    } catch (e) {
      console.error('Failed to fetch files', e)
    } finally {
      setLoadingFiles(false)
    }
  }

  const tabs = [
    { id: 'analyse', label: '✧ Analyse IA', badge: result ? '✓' : null },
    { id: 'documents', label: '📁 Documents', badge: uploadedFiles.length > 0 ? uploadedFiles.length : null },
    { id: 'infos', label: '👤 Informations' },
  ]

  return (
    <>
      {lightbox && <Lightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 2, 8, 0.4)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px', overflowY: 'auto',
      }} onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}>
        
        {/* Modal */}
        <div style={{
          background: 'var(--bg1)', borderRadius: 12,
          width: '100%', maxWidth: 960,
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          border: '1px solid var(--border)',
          animation: 'modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          margin: 'auto', flexShrink: 0,
        }} onClick={e => e.stopPropagation()}>
          
          {/* ── Header ── */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--gradient-dark)',
            borderRadius: '12px 12px 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: '#fff',
              }}>✧</div>
              <div>
                <div style={{
                  fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px',
                }}>
                  Vérification — {doctor.name}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {doctor.specialty} · {doctor.hospital}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >×</button>
          </div>

          {/* ── Tabs ── */}
          <div style={{
            display: 'flex', gap: 0,
            borderBottom: '1px solid var(--border)',
            background: 'var(--dark-100)',
            padding: '0 16px',
          }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '12px 20px',
                border: 'none', cursor: 'pointer', background: 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text3)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 12, borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {tab.label}
                {tab.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px',
                    borderRadius: 99, background: 'rgba(225,29,72,0.1)', color: 'var(--accent)',
                  }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* ═════════════ TAB: ANALYSE ═════════════ */}
            {activeTab === 'analyse' && (
              <>
                {result ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    
                    {/* Colonne Gauche : Checks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 11, color: 'var(--text3)',
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4,
                      }}>Vérifications</div>
                      
                      {Object.entries(result.checks || {}).map(([key, check]) => {
                        const s = statusStyle[check.status] || statusStyle.warning
                        return (
                          <div key={key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 8,
                            background: 'var(--dark-50)', border: '1px solid var(--border)',
                            gap: 10,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: s.dot, flexShrink: 0,
                                boxShadow: `0 0 6px ${s.dot}`,
                              }} />
                              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>
                                {checkLabels[key] || key}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '3px 10px',
                              borderRadius: 99, background: s.bg, color: s.color,
                              flexShrink: 0, letterSpacing: '-0.1px',
                            }}>
                              {s.icon} {s.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Colonne Droite : Score */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 11, color: 'var(--text3)',
                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4,
                      }}>Score global</div>
                      
                      {/* Score Card */}
                      <div style={{
                        padding: '18px 20px', borderRadius: 10,
                        background: 'var(--dark-50)', border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 12,
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>
                            Score de Confiance
                          </span>
                          <span style={{
                            fontWeight: 900, fontSize: 32,
                            color: (result.confidence_score || 0) >= 75
                              ? '#059669'
                              : (result.confidence_score || 0) >= 45
                                ? '#d97706'
                                : '#dc2626',
                          }}>
                            {result.confidence_score ?? '—'}%
                          </span>
                        </div>
                        
                        {/* Barre de progression */}
                        <div style={{
                          height: 8, background: 'var(--dark-200)',
                          borderRadius: 99, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${Math.max(0, Math.min(100, result.confidence_score || 0))}%`,
                            minWidth: (result.confidence_score || 0) > 0 ? '8px' : '0px',
                            height: '100%', borderRadius: 99,
                            background: (result.confidence_score || 0) >= 75
                              ? 'linear-gradient(90deg, #059669, #10b981)'
                              : (result.confidence_score || 0) >= 45
                                ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                                : 'linear-gradient(90deg, #dc2626, #ef4444)',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          }} />
                        </div>
                        
                        {/* Score breakdown */}
                        {result.score_breakdown && Object.keys(result.score_breakdown).length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                            {Object.entries(result.score_breakdown).map(([k, v]) => (
                              <span key={k} style={{
                                fontSize: 10, padding: '3px 8px', borderRadius: 99,
                                background: 'rgba(225,29,72,0.05)', color: 'var(--accent)', fontWeight: 600,
                              }}>
                                {k}: {v ?? 0}pts
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Recommandation */}
                        <div style={{
                          marginTop: 14, padding: '10px 14px', borderRadius: 8,
                          background: rec.bg, border: `1px solid ${rec.color}20`,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: rec.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, color: '#fff',
                          }}>
                            {result.recommendation === 'APPROUVER' ? '✓' : result.recommendation === 'REJETER' ? '✗' : '!'}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text3)' }}>Recommandation</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: rec.color }}>{rec.label}</div>
                          </div>
                        </div>
                      </div>

                      {/* Résumé */}
                      {result.summary && (
                        <div style={{
                          padding: '14px', borderRadius: 8,
                          background: 'var(--dark-50)', border: '1px solid var(--border)',
                          fontSize: 12, color: 'var(--text2)', lineHeight: 1.6,
                        }}>
                          <strong style={{
                            color: 'var(--accent)', fontSize: 10,
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                          }}>Résumé</strong>
                          <p style={{ marginTop: 6 }}>{result.summary}</p>
                        </div>
                      )}

                      {/* Alertes */}
                      {result.risk_flags?.length > 0 && (
                        <div style={{
                          padding: '14px', borderRadius: 8,
                          background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.1)',
                        }}>
                          <div style={{
                            fontWeight: 700, fontSize: 11, color: '#dc2626',
                            marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px',
                          }}>⚠️ Alertes</div>
                          {result.risk_flags.map((f, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#991b1b', marginBottom: 3 }}>
                              • {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Pas d'analyse */
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--text4)' }}>
                    <div style={{
                      width: 80, height: 80, margin: '0 auto 16px',
                      borderRadius: '50%', background: 'var(--dark-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 32, border: '1px solid var(--border)',
                    }}>✧</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      Aucune analyse IA disponible pour ce médecin
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, color: 'var(--text4)' }}>
                      Uploadez les documents ci-dessous puis lancez l'analyse
                    </div>
                  </div>
                )}

                {/* Upload + Analyze */}
                <div style={{
                  background: 'var(--dark-50)', borderRadius: 10,
                  border: '1px solid var(--border)', padding: '18px 20px',
                }}>
                  <div style={{
                    fontWeight: 700, fontSize: 11, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14,
                  }}>📤 Uploader & Analyser</div>
                  <DocumentUpload
                    doctorId={doctor.id}
                    doctorName={doctor.name}
                    compact={true}
                    onAnalyzing={setAnalyzing}
                    onVerify={(newResult) => {
                      setResult(newResult)
                      setAnalyzing(false)
                      fetchUploadedFiles()
                    }}
                  />
                </div>

                {/* Actions (seulement pending) */}
                {isPending && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    {!showRejectInput ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={onApprove} style={{
                          flex: 1, padding: '14px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #059669, #10b981)',
                          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(5,150,105,0.3)',
                          transition: 'all 0.2s', letterSpacing: '-0.2px',
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >✓ Approuver</button>
                        <button onClick={() => setShowRejectInput(true)} style={{
                          flex: 1, padding: '14px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                          color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                          transition: 'all 0.2s', letterSpacing: '-0.2px',
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >✗ Rejeter</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <textarea
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Motif du rejet..."
                          style={{
                            padding: '12px 16px', borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--dark-100)',
                            color: 'var(--text1)', fontSize: 13,
                            resize: 'vertical', minHeight: 80, outline: 'none',
                          }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => setShowRejectInput(false)} style={{
                            flex: 1, padding: 12, borderRadius: 8, cursor: 'pointer',
                            border: '1px solid var(--border)', background: 'var(--dark-50)',
                            color: 'var(--text3)', fontWeight: 600, fontSize: 13,
                          }}>Annuler</button>
                          <button onClick={() => onReject(rejectReason || 'Rejeté après analyse')} style={{
                            flex: 2, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                            color: '#fff', fontWeight: 700, fontSize: 13,
                            boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                          }}>Confirmer le rejet</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ═════════════ TAB: DOCUMENTS ═════════════ */}
            {activeTab === 'documents' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text1)' }}>
                    Documents uploadés ({uploadedFiles.length})
                  </div>
                  <button onClick={fetchUploadedFiles} style={{
                    padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: '1px solid var(--border)', background: 'var(--dark-50)',
                    color: 'var(--text3)', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--dark-100)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--dark-50)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >↻ Rafraîchir</button>
                </div>

                {loadingFiles ? (
                  <div style={{ textAlign: 'center', padding: 48, color: 'var(--text4)' }}>
                    <div style={{
                      width: 40, height: 40, margin: '0 auto 16px',
                      borderRadius: '50%', border: '2px solid var(--border)',
                      borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite',
                    }} />
                    Chargement...
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: 48,
                    background: 'var(--dark-50)', borderRadius: 10,
                    border: '1px solid var(--border)', color: 'var(--text4)',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Aucun document image uploadé</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>Utilisez l'onglet "Analyse IA" pour uploader</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {uploadedFiles.map((file, i) => (
                      <ImageCard
                        key={i}
                        file={file}
                        visualAnalysis={visualMap[file.name]}
                        isAnalyzing={analyzing}
                        onPreview={() => setLightbox({ url: file.url, name: file.name })}
                      />
                    ))}
                  </div>
                )}

                {doctorDocs.filter(d => !uploadedFiles.some(f => f.name === d)).length > 0 && (
                  <>
                    <div style={{
                      fontWeight: 700, fontSize: 11, color: 'var(--text3)',
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                      marginTop: 20, marginBottom: 10,
                    }}>Documents déclarés (PDF/non-image)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {doctorDocs.filter(d => !uploadedFiles.some(f => f.name === d)).map((docName, i) => (
                        <DocCard key={i} name={docName} visualAnalysis={visualMap[docName]} isAnalyzing={analyzing} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ═════════════ TAB: INFOS ═════════════ */}
            {activeTab === 'infos' && (
              <div style={{
                background: 'var(--dark-50)', borderRadius: 10,
                border: '1px solid var(--border)', padding: '22px 24px',
              }}>
                <div style={{
                  fontWeight: 700, fontSize: 11, color: 'var(--text3)',
                  textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 18,
                }}>Informations du médecin</div>
                
                {[
                  ['Nom complet', doctor.name],
                  ['Email', doctor.email],
                  ['Téléphone', doctor.phone || 'N/A'],
                  ['Spécialité', doctor.specialty],
                  ['Établissement', doctor.hospital],
                  ['Numéro CNOM', doctor.cnom],
                  ['Date inscription', doctor.date],
                  ['Statut', doctor.status === 'pending' ? '⏳ En attente' : doctor.status === 'approved' ? '✅ Approuvé' : '❌ Rejeté'],
                  ['Score confiance', `${doctor.confidence || 0}%`],
                  ['Raison rejet', doctor.rejection_reason || '—'],
                ].map(([label, value], i) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '10px 0', borderBottom: i < 9 ? '1px solid var(--border)' : 'none', gap: 12,
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text4)', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
                
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 12, color: 'var(--text4)', marginBottom: 10 }}>
                    Documents déclarés ({doctorDocs.length})
                  </div>
                  {doctorDocs.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text4)' }}>Aucun document déclaré</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {doctorDocs.map((d, i) => (
                        <div key={i} style={{
                          fontSize: 12, padding: '8px 14px', borderRadius: 8,
                          background: 'var(--dark-100)', border: '1px solid var(--border)',
                          color: 'var(--text2)', fontWeight: 500,
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <DocIcon name={d} />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  )
}