import { useLocation, useNavigate } from 'react-router-dom'

const titles = {
  '/': 'Tableau de bord',
  '/pending': 'Médecins en attente',
  '/verified': 'Médecins vérifiés',
  '/rejected': 'Médecins rejetés',
  '/agent': 'Agent IA',
  '/stats': 'Statistiques',
}

const subtitles = {
  '/': "Vue d'ensemble de la plateforme",
  '/pending': 'Dossiers nécessitant une vérification',
  '/verified': 'Médecins approuvés et actifs',
  '/rejected': 'Demandes refusées',
  '/agent': 'Assistant intelligent PathoScan',
  '/stats': 'Analyses et performances',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] || 'PathoScan'
  const subtitle = subtitles[pathname] || ''

  const user = JSON.parse(localStorage.getItem('mammoscan_user') || '{}')

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('mammoscan_token')
      localStorage.removeItem('mammoscan_user')
      navigate('/admin/login')
    }
  }

  return (
    <header style={{
      height: 68,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'var(--panel)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 8px rgba(26, 10, 16, 0.03)',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text1)',
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{
            fontSize: 12,
            color: 'var(--text4)',
            fontWeight: 400,
            marginTop: 1,
          }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px',
          background: 'var(--dark-50)',
          borderRadius: 99,
          border: '1px solid var(--border)',
        }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
            animation: 'pulse-soft 2s infinite',
          }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>
            Système actif
          </span>
        </div>

        {/* User + Logout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 6px 6px 16px',
          background: 'var(--panel)',
          borderRadius: 99,
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: '#fff', fontWeight: 600,
          }}>
            {user.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text2)' }}>
            {user.username || 'Admin'}
          </span>
          
          <button onClick={handleLogout} style={{
            padding: '8px 14px',
            borderRadius: 99,
            border: '1.5px solid rgba(220,38,38,0.2)',
            background: 'rgba(254,242,242,0.6)',
            color: '#dc2626',
            fontWeight: 500,
            fontSize: 11.5,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#dc2626';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(254,242,242,0.6)';
              e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Déconnexion
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </header>
  )
}