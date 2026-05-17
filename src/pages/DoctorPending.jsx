// src/pages/DoctorPending.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function DoctorPending() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    const token = localStorage.getItem('doctor_token')
    if (!token) { navigate('/login'); return }
    try {
      const res = await fetch(`${API}/doctor/status`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { navigate('/login'); return }
      const data = await res.json()
      setStatus(data)
      if (data.status === 'approved') {
  localStorage.setItem('doctor_user', JSON.stringify({ 
    ...JSON.parse(localStorage.getItem('doctor_user') || '{}'), 
    status: 'approved' 
  }))
  setTimeout(() => navigate('/dashboard'), 2000)
}
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Poll toutes les 30s
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('doctor_token')
    localStorage.removeItem('doctor_user')
    navigate('/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--dark-200)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  const configs = {
    pending: {
      emoji: '⏳', title: 'Dossier en cours d\'examen',
      color: 'var(--yellow)', bg: 'var(--yellow-bg)', border: 'rgba(217,119,6,0.2)',
      message: 'Notre équipe examine votre dossier. Vous serez notifié par email.',
    },
    approved: {
      emoji: '✅', title: 'Compte approuvé !',
      color: 'var(--green)', bg: 'var(--green-bg)', border: 'rgba(5,150,105,0.2)',
      message: 'Félicitations ! Redirection en cours...',
    },
    rejected: {
      emoji: '❌', title: 'Dossier refusé',
      color: 'var(--red)', bg: 'var(--red-bg)', border: 'rgba(220,38,38,0.2)',
      message: status?.rejection_reason || 'Votre dossier n\'a pas été approuvé.',
    },
  }

  const cfg = configs[status?.status] || configs.pending

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '48px 40px',
        boxShadow: 'var(--shadow-lg)', textAlign: 'center',
        animation: 'fadeInUp 0.5s both',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(26,10,16,0.2)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text1)' }}>PathoScan</span>
        </div>

        <div style={{ fontSize: 64, marginBottom: 20 }}>{cfg.emoji}</div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text1)', marginBottom: 12, letterSpacing: '-0.4px' }}>
          {cfg.title}
        </h2>

        {status && (
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text3)', marginBottom: 16 }}>
            Bonjour, {status.name}
          </div>
        )}

        <div style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 24,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          fontSize: 13.5, color: cfg.color, fontWeight: 500, lineHeight: 1.6,
        }}>
          {cfg.message}
        </div>

        {/* Infos dossier */}
        {status && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {[
              ['📄', 'Documents uploadés', `${status.documents_count || 0} fichier(s)`],
              ['🤖', 'Score IA', status.confidence ? `${status.confidence}%` : 'En attente d\'analyse'],
              ['📅', 'Délai moyen', '24 à 48 heures'],
            ].map(([icon, label, value]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--dark-50)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>{icon} {label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {status?.status === 'rejected' && (
          <button onClick={() => navigate('/register')} style={{
            width: '100%', padding: '13px', borderRadius: 11, border: 'none', marginBottom: 10,
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,10,16,0.2)',
            fontFamily: 'var(--font-body)',
          }}>
            Soumettre un nouveau dossier
          </button>
        )}

        <button onClick={handleLogout} style={{
          width: '100%', padding: '11px', borderRadius: 11,
          border: '1.5px solid rgba(220,38,38,0.2)',
          background: 'rgba(254,242,242,0.6)', color: '#dc2626',
          fontWeight: 500, fontSize: 13, cursor: 'pointer',
          fontFamily: 'var(--font-body)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(254,242,242,0.6)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)' }}
        >
          Se déconnecter
        </button>
      </div>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}