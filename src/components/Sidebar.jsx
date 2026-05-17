import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Tableau de bord', exact: true },
  { to: '/admin/pending', icon: 'pending', label: 'En attente' },
  { to: '/admin/verified', icon: 'approved', label: 'Vérifiés' },
  { to: '/admin/rejected', icon: 'rejected', label: 'Rejetés' },
  { to: '/admin/agent', icon: 'agent', label: 'Agent IA' },
  { to: '/admin/stats', icon: 'stats', label: 'Statistiques' },
]

// Icônes SVG
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  pending: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  approved: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  rejected: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  agent: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
      <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
      <circle cx="12" cy="8" r="1" fill="currentColor"/>
    </svg>
  ),
  stats: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
}

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('mammoscan_token')
      localStorage.removeItem('mammoscan_user')
      navigate('/admin/login') 
    }
  }

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--panel)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      boxShadow: '2px 0 40px rgba(26, 10, 16, 0.04)',
    }}>
      {/* Logo */}
      <div style={{ 
        padding: '28px 22px 22px', 
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 6px 20px rgba(26, 10, 16, 0.2)',
            position: 'relative',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 700, 
              fontSize: 16, 
              color: 'var(--text1)',
              letterSpacing: '-0.3px',
              lineHeight: 1.1,
            }}>
              PathoScan
            </div>
            <div style={{ 
              fontSize: 10.5, 
              color: 'var(--text4)', 
              fontWeight: 500, 
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ 
        flex: 1, 
        padding: '16px 14px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3 
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text4)',
          textTransform: 'uppercase', letterSpacing: '1.5px',
          padding: '4px 12px', marginBottom: 6,
        }}>
          Navigation
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 'var(--radius-sm)',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'rgba(225,29,72,0.04)' : 'transparent',
              border: isActive ? '1px solid rgba(225,29,72,0.1)' : '1px solid transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: 13,
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 22, borderRadius: '0 3px 3px 0',
                    background: 'var(--accent)',
                  }} />
                )}
                <span style={{ opacity: isActive ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                  {icons[item.icon]}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px' }}>
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--dark-50)',
          border: '1px solid var(--border)',
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>
            🇹🇳 Tunisie — 2025
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text4)', lineHeight: 1.5 }}>
            Détection cancer du sein
            <br />
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>IA · Precision · Care</span>
          </div>
        </div>
        
        <button onClick={handleLogout} style={{
          width: '100%',
          padding: '11px',
          borderRadius: 'var(--radius-sm)',
          border: '1.5px solid rgba(220,38,38,0.2)',
          background: 'rgba(254,242,242,0.6)',
          color: '#dc2626',
          fontWeight: 500,
          fontSize: 12.5,
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}