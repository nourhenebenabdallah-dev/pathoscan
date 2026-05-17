// src/pages/DoctorLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = 'http://localhost:8000'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Erreur de connexion'); return }

      localStorage.setItem('doctor_token', data.token)
      localStorage.setItem('doctor_user', JSON.stringify(data.doctor))

      if (data.doctor.status === 'approved') {
        navigate('/dashboard')
      } else {
        navigate('/pending')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)',
        animation: 'fadeInUp 0.5s both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(26,10,16,0.2)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text1)', letterSpacing: '-0.5px' }}>
            Connexion médecin
          </div>
          <div style={{ fontSize: 13, color: 'var(--text4)', marginTop: 4 }}>PathoScan — Diagnostic IA</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email professionnel
            </label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="dr.nom@etablissement.tn"
              style={{
                width: '100%', padding: '11px 14px', borderRadius: 10,
                border: '1.5px solid var(--border2)', background: 'var(--dark-50)',
                color: 'var(--text1)', fontSize: 14, outline: 'none',
                fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <div style={{ marginBottom: 24, position: 'relative' }}>
  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
    Mot de passe
  </label>
  <div style={{ position: 'relative' }}>
    <input
      type={showPassword ? 'text' : 'password'} required
      value={form.password}
      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
      placeholder="••••••••"
      style={{
        width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10,
        border: '1.5px solid var(--border2)', background: 'var(--dark-50)',
        color: 'var(--text1)', fontSize: 14, outline: 'none',
        fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
    />
    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--text4)', display: 'flex', alignItems: 'center', padding: 4,
    }}>
      {showPassword
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  </div>
</div>

          {error && (
            <div style={{
              padding: '11px 14px', borderRadius: 10, marginBottom: 16,
              background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.2)',
              color: 'var(--red)', fontSize: 13, fontWeight: 500,
            }}>⚠️ {error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 11, border: 'none',
            background: loading ? 'var(--dark-200)' : 'var(--gradient-dark)',
            color: loading ? 'var(--text4)' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(26,10,16,0.2)',
            transition: 'all 0.2s', fontFamily: 'var(--font-body)',
          }}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: 'var(--text4)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            S'inscrire
          </Link>
        </div>
      </div>

      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}