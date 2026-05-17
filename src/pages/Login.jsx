import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'

// ─── Icônes SVG ────────────────────────────────────────────
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

// ─── Logo ──────────────────────────────────────────────────
const AppLogo = () => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <div style={{
      width: 90, height: 90, borderRadius: '50%',
      background: 'conic-gradient(from 0deg, #e11d48, #f43f5e, #fb7185, #f43f5e, #e11d48)',
      padding: 3,
      animation: 'rotate 8s linear infinite',
      boxShadow: '0 0 30px rgba(225,29,72,0.3)',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: '#1a0a10',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48"/>
              <stop offset="100%" stopColor="#fb7185"/>
            </linearGradient>
          </defs>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>
    </div>
    <div style={{
      position: 'absolute', top: -4, right: -4,
      width: 10, height: 10, borderRadius: '50%',
      background: '#fb7185', boxShadow: '0 0 12px rgba(251,113,133,0.6)',
    }} />
    <div style={{
      position: 'absolute', bottom: 2, left: -8,
      width: 6, height: 6, borderRadius: '50%',
      background: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,0.5)',
    }} />
  </div>
)

// ─── Background Pattern ────────────────────────────────────
const BackgroundPattern = () => (
  <svg style={{
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    opacity: 0.03, pointerEvents: 'none',
  }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </pattern>
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="currentColor"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect width="100%" height="100%" fill="url(#dots)"/>
  </svg>
)

// ─── Feature Card ──────────────────────────────────────────
const FeatureCard = ({ icon, title, description }) => (
  <div style={{
    display: 'flex', alignItems: 'flex-start', gap: 16,
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.3s',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: 'linear-gradient(135deg, rgba(225,29,72,0.3), rgba(244,63,94,0.15))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      border: '1px solid rgba(251,113,133,0.2)',
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{description}</div>
    </div>
  </div>
)

// ─── Composant principal ───────────────────────────────────
export default function Login() {
  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const navigate = useNavigate()

  // ── Redirection si déjà connecté ──────────────────────────
  const token = localStorage.getItem('mammoscan_token')
  const user  = JSON.parse(localStorage.getItem('mammoscan_user') || '{}')
  if (token && user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // ── Horloge ───────────────────────────────────────────────
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Soumission ────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Identifiants incorrects')
        setPassword('')
        return
      }

      localStorage.setItem('mammoscan_token', data.token)
      localStorage.setItem('mammoscan_user', JSON.stringify(data.user))
      navigate('/admin', { replace: true })

    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  // ── Styles dynamiques ─────────────────────────────────────
  const inputStyle = (isFocused) => ({
    width: '100%',
    padding: '14px 16px 14px 50px',
    borderRadius: 12,
    border: isFocused ? '1.5px solid #e11d48' : '1.5px solid #e8d5db',
    background: isFocused ? '#ffffff' : '#faf8f7',
    color: '#1a0a10',
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: isFocused
      ? '0 0 0 4px rgba(225,29,72,0.06), 0 2px 8px rgba(0,0,0,0.04)'
      : '0 1px 3px rgba(0,0,0,0.02)',
  })

  const iconContainerStyle = (isFocused) => ({
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: isFocused ? '#e11d48' : '#c4879a',
    transition: 'all 0.3s',
    display: 'flex', alignItems: 'center',
  })

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#f8f6f4', position: 'relative', overflow: 'hidden',
    }}>

      {/* ── GAUCHE : Branding ─────────────────────────────── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #0d0508 0%, #1a0a10 30%, #250d18 60%, #0d0508 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '60px 50px', position: 'relative', overflow: 'hidden',
      }}>
        <BackgroundPattern />

        {/* Cercles décoratifs */}
        {[
          { top: -100, right: -100, size: 350, opacity: 0.04 },
          { top: '15%', right: -60,  size: 250, opacity: 0.05 },
          { bottom: -80, left: -60,  size: 300, opacity: 0.03 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: c.top, right: c.right, bottom: c.bottom, left: c.left,
            width: c.size, height: c.size, borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${c.opacity})`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Lignes décoratives */}
        {['35%', '68%'].map((top, i) => (
          <div key={i} style={{
            position: 'absolute', top,
            left: i === 0 ? '10%' : '5%',
            right: i === 0 ? '10%' : '5%',
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,${i === 0 ? 0.04 : 0.03}), transparent)`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 460, width: '100%' }}>
          <div style={{ marginBottom: 32 }}><AppLogo /></div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700, fontSize: 34, color: '#ffffff',
            letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.2,
          }}>
            PathoScan
          </h1>

          <p style={{
            fontSize: 15, color: 'rgba(255,255,255,0.6)',
            fontWeight: 400, marginBottom: 48, lineHeight: 1.6,
          }}>
            Plateforme intelligente de détection<br />du cancer du sein par IA
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 48 }}>
            <FeatureCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              title="Analyse IA avancée"
              description="Vérification intelligente des documents médicaux par vision artificielle"
            />
            <FeatureCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              title="Sécurité garantie"
              description="Protection des données médicales et vérification CNOM des praticiens"
            />
            <FeatureCard
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
              title="Statistiques en temps réel"
              description="Tableaux de bord dynamiques pour le suivi des performances"
            />
          </div>

          <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 400, letterSpacing: '0.5px' }}>
              © 2025 PathoScan · Tunisie
            </p>
          </div>
        </div>
      </div>

      {/* ── DROITE : Formulaire ───────────────────────────── */}
      <div style={{
        flex: '0 0 55%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 60px', background: '#f8f6f4',
      }}>
        <div style={{ width: '100%', maxWidth: 440, animation: 'fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}>

          {/* En-tête */}
          <div style={{ marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 99,
              background: 'rgba(225,29,72,0.05)', color: '#e11d48',
              fontSize: 11.5, fontWeight: 600, letterSpacing: '0.8px',
              textTransform: 'uppercase', marginBottom: 20,
              border: '1px solid rgba(225,29,72,0.1)',
            }}>
              <ShieldIcon />
              Accès sécurisé
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700, fontSize: 30, color: '#1a0a10',
              letterSpacing: '-0.5px', marginBottom: 10,
            }}>
              Bienvenue
            </h2>
            <p style={{ fontSize: 14, color: '#9b5e72', fontWeight: 400, lineHeight: 1.7 }}>
              Connectez-vous pour accéder au tableau de bord d'administration et gérer les praticiens.
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a1a28', marginBottom: 10 }}>
                Nom d'utilisateur
              </label>
              <div style={{ position: 'relative' }}>
                <div style={iconContainerStyle(focusedField === 'username')}><UserIcon /></div>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Entrez votre identifiant"
                  required
                  autoFocus
                  style={inputStyle(focusedField === 'username')}
                />
                {username && (
                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }}>
                    <CheckIcon />
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#4a1a28' }}>
                  Mot de passe
                </label>
                <span
                  style={{ fontSize: 11.5, color: '#c4879a', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#e11d48'}
                  onMouseLeave={e => e.target.style.color = '#c4879a'}
                  title="Contactez l'administrateur système"
                >
                  Mot de passe oublié ?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={iconContainerStyle(focusedField === 'password')}><LockIcon /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Entrez votre mot de passe"
                  required
                  style={inputStyle(focusedField === 'password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: focusedField === 'password' ? '#e11d48' : '#c4879a',
                    padding: '8px', borderRadius: 8, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,29,72,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 12,
                animation: 'shake 0.5s ease',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: loading || !username || !password
                  ? '#e8d5db'
                  : 'linear-gradient(135deg, #1a0a10 0%, #2d0a18 50%, #4a0a20 100%)',
                color: loading || !username || !password ? '#9b5e72' : '#ffffff',
                fontWeight: 600, fontSize: 15,
                cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading || !username || !password
                  ? 'none'
                  : '0 4px 20px rgba(26,10,16,0.25), 0 1px 3px rgba(26,10,16,0.1)',
                letterSpacing: '-0.2px', marginTop: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!loading && username && password) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,10,16,0.35), 0 1px 3px rgba(26,10,16,0.15)'
                }
              }}
              onMouseLeave={e => {
                if (!loading && username && password) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,10,16,0.25), 0 1px 3px rgba(26,10,16,0.1)'
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2.5px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#ffffff',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Authentification en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    <circle cx="12" cy="16" r="1"/>
                  </svg>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Info sécurité */}
          <div style={{
            marginTop: 28, padding: '16px 20px', borderRadius: 14,
            background: 'rgba(225,29,72,0.03)',
            border: '1px solid rgba(225,29,72,0.08)',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(225,29,72,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShieldIcon />
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4a1a28', marginBottom: 4 }}>
                Connexion sécurisée SSL/TLS
              </div>
              <div style={{ fontSize: 12, color: '#9b5e72', lineHeight: 1.6 }}>
                Cette zone est réservée aux administrateurs autorisés. Toute tentative d'accès non autorisé est enregistrée et surveillée.
              </div>
            </div>
          </div>

          {/* Date/Heure */}
          {currentTime && (
            <div style={{
              textAlign: 'center', marginTop: 24, fontSize: 12, color: '#c4879a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {currentTime}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}