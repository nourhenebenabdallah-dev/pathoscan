import { useState } from 'react'
import VerificationModal from './VerificationModal'
import { api } from '../api'
import { createPortal } from 'react-dom'   // ← AJOUTER

const StatusBadge = ({ status }) => {
  const map = {
    pending: { 
      label: 'En attente', 
      bg: 'var(--yellow-bg)', 
      color: 'var(--yellow)', 
      dot: '#d97706',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    approved: { 
      label: 'Approuvé', 
      bg: 'var(--green-bg)', 
      color: 'var(--green)', 
      dot: '#059669',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    },
    rejected: { 
      label: 'Rejeté', 
      bg: 'var(--red-bg)', 
      color: 'var(--red)', 
      dot: '#dc2626',
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      )
    },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 99,
      fontSize: 11.5,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      letterSpacing: '-0.1px',
      border: `1px solid ${s.color}20`,
    }}>
      {s.icon}
      {s.label}
    </span>
  )
}

const ConfidenceBar = ({ value }) => {
  const safeValue = typeof value === 'number' ? value : parseInt(value) || 0
  const displayValue = Math.max(0, Math.min(100, safeValue))
  const color = displayValue >= 70 ? 'var(--green)' : displayValue >= 40 ? 'var(--yellow)' : 'var(--red)'
  const bgColor = displayValue >= 70 ? 'var(--green-bg)' : displayValue >= 40 ? 'var(--yellow-bg)' : 'var(--red-bg)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: 'var(--dark-100)',
        borderRadius: 99,
        overflow: 'hidden',
        maxWidth: 90,
      }}>
        <div style={{
          width: `${displayValue}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: displayValue > 0 ? '4px' : '0px',
        }} />
      </div>
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        color,
        minWidth: 38,
        textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
        padding: '2px 8px',
        borderRadius: 99,
        background: bgColor,
      }}>{displayValue}%</span>
    </div>
  )
}

// Icônes SVG pour les boutons d'action
const ActionIcons = {
  view: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  analyze: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  approve: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  reject: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  delete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
}

const headers = [
  { key: 'name', label: 'Médecin', width: 'auto' },
  { key: 'specialty', label: 'Spécialité', width: 'auto' },
  { key: 'hospital', label: 'Établissement', width: 'auto' },
  { key: 'cnom', label: 'CNOM', width: 'auto' },
  { key: 'confidence', label: 'Confiance', width: '150px' },
  { key: 'status', label: 'Statut', width: '130px' },
  { key: 'actions', label: 'Actions', width: '220px' },
]

export default function DoctorTable({ doctors, onRefresh }) {
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleVerify = async (doctor) => {
    setLoadingId(doctor.id)
    try {
      const result = await api.verifyDoctor(doctor.id)
      setSelectedDoc({ doctor, result })
    } catch (e) {
      alert('Erreur lors de la vérification IA')
    } finally {
      setLoadingId(null)
    }
  }

  const handleViewOnly = (doctor) => {
    setSelectedDoc({ doctor, result: null })
  }

  const handleAction = async (doctorId, action, reason) => {
    setActionLoading(doctorId + action)
    try {
      await api.doctorAction(doctorId, action, reason)
      setSelectedDoc(null)
      onRefresh?.()
    } catch (e) {
      alert('Erreur lors de l\'action')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (doctor) => {
    if (!window.confirm(
      `⚠️ Supprimer définitivement Dr. ${doctor.name} ?\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera :\n` +
      `• Le médecin de la base de données\n` +
      `• Toutes ses analyses IA\n` +
      `• Tous ses documents uploadés\n` +
      `• Tous ses messages de chat\n\n` +
      `Voulez-vous vraiment continuer ?`
    )) {
      return
    }

    if (!window.confirm(`🗑️ DERNIÈRE CONFIRMATION : Supprimer ${doctor.name} ?`)) {
      return
    }

    setDeletingId(doctor.id)
    try {
      await api.deleteDoctor(doctor.id)
      setSelectedDoc(null)
      onRefresh?.()
    } catch (e) {
      alert('Erreur lors de la suppression : ' + e.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Style commun pour les boutons d'action
  const actionButtonStyle = (isDisabled, customBg, customColor, customBorder) => ({
    padding: '8px 12px',
    borderRadius: 8,
    border: customBorder || '1.5px solid transparent',
    background: isDisabled ? 'var(--dark-200)' : (customBg || 'var(--panel)'),
    color: isDisabled ? 'var(--text4)' : (customColor || 'var(--text2)'),
    fontWeight: 500,
    fontSize: 12,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    opacity: isDisabled ? 0.5 : 1,
  })

  if (!doctors.length) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{
        width: 72, height: 72, margin: '0 auto 20px',
        borderRadius: 18,
        background: 'var(--dark-50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--border)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)' }}>
        Aucun médecin dans cette catégorie
      </div>
      <div style={{ fontSize: 13, color: 'var(--text4)', marginTop: 6 }}>
        Les nouveaux dossiers apparaîtront ici
      </div>
    </div>
  )

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{
              background: 'var(--dark-50)',
              borderBottom: '2px solid var(--border)',
            }}>
              {headers.map(h => (
                <th key={h.key} style={{
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 11,
                  color: 'var(--text3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                  width: h.width,
                }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc, i) => (
              <tr key={doc.id} style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'var(--dark-50)',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--dark-50)'}
              >
                {/* Nom + Email */}
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--gradient-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#fff',
                      boxShadow: '0 3px 10px rgba(26,10,16,0.2)',
                      flexShrink: 0,
                    }}>
                      {doc.name
  .replace(/^Dr\.?\s*/i, '')
  .split(/\s+/)
  .filter(w => w.length > 0)
  .map(w => w[0].toUpperCase())
  .join('')
  .slice(0, 2) || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text1)' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text4)', marginTop: 1 }}>
                        {doc.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Spécialité */}
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontSize: 11.5,
                    background: 'var(--dark-50)',
                    color: 'var(--text2)',
                    fontWeight: 500,
                    border: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    {doc.specialty}
                  </span>
                </td>

                {/* Hôpital */}
                <td style={{ padding: '14px 18px', maxWidth: 180 }}>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--text2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {doc.hospital}
                  </div>
                </td>

                {/* CNOM */}
                <td style={{ padding: '14px 18px' }}>
                  <code style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '5px 12px',
                    background: 'rgba(225,29,72,0.03)',
                    color: 'var(--accent)',
                    borderRadius: 6,
                    border: '1px solid rgba(225,29,72,0.08)',
                    letterSpacing: '0.3px',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {doc.cnom}
                  </code>
                </td>

                {/* Score confiance */}
                <td style={{ padding: '14px 18px', minWidth: 150 }}>
                  <ConfidenceBar value={doc.confidence} />
                </td>

                {/* Statut */}
                <td style={{ padding: '14px 18px' }}>
                  <StatusBadge status={doc.status} />
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 18px', minWidth: 220, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', alignItems: 'center' }}>

                    {/* ─── PENDING ─── */}
                    {doc.status === 'pending' && (
                      <>
                        {/* Voir sans analyse */}
                        <button
                          onClick={() => handleViewOnly(doc)}
                          disabled={loadingId === doc.id || deletingId === doc.id}
                          style={actionButtonStyle(
                            loadingId === doc.id || deletingId === doc.id,
                            'var(--panel)',
                            'var(--text2)',
                            '1.5px solid var(--border2)'
                          )}
                          onMouseEnter={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.background = 'var(--dark-50)';
                              e.currentTarget.style.borderColor = 'var(--accent)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.background = 'var(--panel)';
                              e.currentTarget.style.borderColor = 'var(--border2)';
                            }
                          }}
                          title="Voir les informations sans analyser"
                        >
                          {ActionIcons.view}
                          Voir
                        </button>

                        {/* Analyser */}
                        <button
                          onClick={() => handleVerify(doc)}
                          disabled={loadingId === doc.id || deletingId === doc.id}
                          style={actionButtonStyle(
                            loadingId === doc.id || deletingId === doc.id,
                            'var(--gradient-dark)',
                            '#fff',
                            'none'
                          )}
                          onMouseEnter={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,10,16,0.3)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 3px 12px rgba(26,10,16,0.2)';
                            }
                          }}
                          title="Lancer l'analyse IA"
                        >
                          {loadingId === doc.id ? '⏳' : ActionIcons.analyze}
                          {loadingId === doc.id ? 'Analyse...' : 'Analyser'}
                        </button>

                        {/* Approuver */}
                        <button
                          onClick={() => handleAction(doc.id, 'approve')}
                          disabled={!!actionLoading || deletingId === doc.id}
                          style={actionButtonStyle(
                            !!actionLoading || deletingId === doc.id,
                            'var(--green-bg)',
                            'var(--green)',
                            '1.5px solid rgba(5,150,105,0.2)'
                          )}
                          onMouseEnter={e => {
                            if (!actionLoading && !deletingId) {
                              e.currentTarget.style.background = '#d1fae5';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!actionLoading && !deletingId) {
                              e.currentTarget.style.background = 'var(--green-bg)';
                            }
                          }}
                          title="Approuver rapidement"
                        >
                          {ActionIcons.approve}
                        </button>

                        {/* Rejeter */}
                        <button
                          onClick={() => handleAction(doc.id, 'reject', 'Rejeté manuellement')}
                          disabled={!!actionLoading || deletingId === doc.id}
                          style={actionButtonStyle(
                            !!actionLoading || deletingId === doc.id,
                            'var(--red-bg)',
                            'var(--red)',
                            '1.5px solid rgba(220,38,38,0.2)'
                          )}
                          onMouseEnter={e => {
                            if (!actionLoading && !deletingId) {
                              e.currentTarget.style.background = '#fee2e2';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!actionLoading && !deletingId) {
                              e.currentTarget.style.background = 'var(--red-bg)';
                            }
                          }}
                          title="Rejeter rapidement"
                        >
                          {ActionIcons.reject}
                        </button>
                      </>
                    )}

                    {/* ─── APPROVED / REJECTED ─── */}
                    {doc.status !== 'pending' && (
                      <>
                        {/* Voir */}
                        <button
                          onClick={() => handleViewOnly(doc)}
                          disabled={loadingId === doc.id || deletingId === doc.id}
                          style={actionButtonStyle(
                            loadingId === doc.id || deletingId === doc.id,
                            'var(--panel)',
                            'var(--text2)',
                            '1.5px solid var(--border2)'
                          )}
                          onMouseEnter={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.background = 'var(--dark-50)';
                              e.currentTarget.style.borderColor = 'var(--accent)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.background = 'var(--panel)';
                              e.currentTarget.style.borderColor = 'var(--border2)';
                            }
                          }}
                          title="Voir les informations"
                        >
                          {ActionIcons.view}
                          Voir
                        </button>

                        {/* Analyser */}
                        <button
                          onClick={() => handleVerify(doc)}
                          disabled={loadingId === doc.id || deletingId === doc.id}
                          style={actionButtonStyle(
                            loadingId === doc.id || deletingId === doc.id,
                            'var(--gradient-dark)',
                            '#fff',
                            'none'
                          )}
                          onMouseEnter={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,10,16,0.3)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!loadingId && !deletingId) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 3px 12px rgba(26,10,16,0.2)';
                            }
                          }}
                          title="Lancer l'analyse IA"
                        >
                          {loadingId === doc.id ? '⏳' : ActionIcons.analyze}
                          {loadingId === doc.id ? 'Analyse...' : 'Analyser'}
                        </button>
                      </>
                    )}

                    {/* ─── SUPPRIMER (tous les statuts) ─── */}
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id || loadingId === doc.id || !!actionLoading}
                      style={actionButtonStyle(
                        deletingId === doc.id || loadingId === doc.id || !!actionLoading,
                        'rgba(254,242,242,0.6)',
                        '#dc2626',
                        '1.5px solid rgba(220,38,38,0.2)'
                      )}
                      onMouseEnter={e => {
                        if (!deletingId && !loadingId && !actionLoading) {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.borderColor = '#dc2626';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!deletingId && !loadingId && !actionLoading) {
                          e.currentTarget.style.background = 'rgba(254,242,242,0.6)';
                          e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)';
                        }
                      }}
                      title="Supprimer définitivement ce médecin"
                    >
                      {deletingId === doc.id ? '⏳' : ActionIcons.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedDoc && createPortal(
  <VerificationModal
    doctor={selectedDoc.doctor}
    result={selectedDoc.result}
    onClose={() => setSelectedDoc(null)}
    onApprove={() => handleAction(selectedDoc.doctor.id, 'approve')}
    onReject={(reason) => handleAction(selectedDoc.doctor.id, 'reject', reason)}
  />,
  document.body   // ← téléporte hors du tableau, dans le body
)}
    </>
  )
}