// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)', letterSpacing: '-0.3px' }}>PathoScan</div>
            <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnostic IA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '10px 22px', borderRadius: 10, border: '1.5px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--dark-50)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          >Se connecter</button>
          <button onClick={() => navigate('/register')} style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(26,10,16,0.25)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >Rejoindre PathoScan</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 16px', borderRadius: 99,
          background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.15)',
          fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 28,
          animation: 'fadeInUp 0.5s both',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-soft 2s infinite' }} />
          Plateforme IA · Tunisie 2025
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 6vw, 64px)',
          color: 'var(--text1)', letterSpacing: '-2px', lineHeight: 1.1,
          marginBottom: 20, maxWidth: 800,
          animation: 'fadeInUp 0.6s 0.1s both',
        }}>
          Détection du cancer du sein{' '}
          <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            par Intelligence Artificielle
          </span>
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--text3)', maxWidth: 560, lineHeight: 1.7,
          marginBottom: 40, animation: 'fadeInUp 0.6s 0.2s both',
        }}>
          PathoScan assiste les médecins dans l'analyse histopathologique, mammographique et l'évaluation du risque clinique avec une précision de pointe.
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeInUp 0.6s 0.3s both' }}>
          <button onClick={() => navigate('/register')} style={{
            padding: '14px 32px', borderRadius: 12, border: 'none',
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 700, fontSize: 15,
            cursor: 'pointer', boxShadow: '0 8px 28px rgba(26,10,16,0.25)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(26,10,16,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,10,16,0.25)' }}
          >
            Créer mon compte médecin →
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '14px 32px', borderRadius: 12,
            border: '1.5px solid var(--border2)', background: 'var(--panel)',
            color: 'var(--text2)', fontWeight: 600, fontSize: 15,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--dark-50)'; e.currentTarget.style.borderColor = 'var(--rose-300)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--panel)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          >
            J'ai déjà un compte
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 72, maxWidth: 900, width: '100%', animation: 'fadeInUp 0.6s 0.4s both' }}>
          {[
            { icon: '🔬', title: 'Histopathologie', desc: 'Détection IDC sur coupes tissulaires avec précision clinique' },
            { icon: '📡', title: 'Mammographie', desc: 'Analyse GradCAM++ pour localiser les masses suspectes' },
            { icon: '📊', title: 'Risque clinique', desc: 'Modèle SEER pour évaluer le risque de récidive' },
          ].map((f, i) => (
            <div key={i} style={{
              background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '24px 22px',
              boxShadow: 'var(--shadow-card)', textAlign: 'left',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text1)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text4)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse-soft { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  )
}