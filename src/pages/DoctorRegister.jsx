// src/pages/DoctorRegister.jsx
import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const API = 'http://localhost:8000'

const SPECIALTIES = [
  'Radiologie', 'Oncologie', 'Chirurgie générale', 'Gynécologie',
  'Anatomopathologie', 'Médecine interne', 'Imagerie médicale', 'Autre',
]

const DOC_TYPES = [
  { key: 'id', label: "Pièce d'identité", desc: 'CIN ou Passeport', icon: '🪪' },
  { key: 'diploma', label: 'Diplôme de médecine', desc: 'Doctorat en médecine', icon: '🎓' },
  { key: 'cnom', label: 'Attestation CNOM', desc: 'Ordre National des Médecins', icon: '📋' },
  { key: 'experience', label: 'Justificatif professionnel', desc: 'Contrat ou attestation', icon: '🏥' },
]

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < total - 1 ? 1 : 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
            background: i < current ? 'var(--green)' : i === current ? 'var(--gradient-dark)' : 'var(--dark-100)',
            color: i <= current ? '#fff' : 'var(--text4)',
            transition: 'all 0.3s',
            boxShadow: i === current ? '0 4px 12px rgba(26,10,16,0.2)' : 'none',
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{
              flex: 1, height: 2, margin: '0 6px',
              background: i < current ? 'var(--green)' : 'var(--dark-100)',
              transition: 'background 0.3s',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function DoctorRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [doctorId, setDoctorId] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState({})
  const fileRefs = { id: useRef(), diploma: useRef(), cnom: useRef(), experience: useRef() }

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    specialty: '', hospital: '', phone: '', city: '',
    years_experience: '', cnom_number: '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // ── Étape 1 : Infos personnelles ─────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.specialty || !form.hospital) {
      setError('Veuillez remplir tous les champs obligatoires'); return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas'); return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères'); return
    }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${API}/doctor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          specialty: form.specialty, hospital: form.hospital,
          phone: form.phone, city: form.city,
          years_experience: parseInt(form.years_experience) || 0,
          cnom_number: form.cnom_number,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Erreur lors de l\'inscription'); return }
      localStorage.setItem('doctor_token', data.token)
      localStorage.setItem('doctor_user', JSON.stringify({ id: data.doctor_id, name: form.name, status: 'pending' }))
      setDoctorId(data.doctor_id)
      setStep(1)
    } catch { setError('Impossible de contacter le serveur') }
    finally { setLoading(false) }
  }

  // ── Étape 2 : Upload documents ────────────────────────────────────────────
  const handleFileSelect = (key, file) => {
    if (!file) return
    setUploadedDocs(p => ({ ...p, [key]: file }))
  }

  const handleUpload = async () => {
    const uploaded = Object.keys(uploadedDocs)
    if (uploaded.length < 2) {
      setError('Veuillez uploader au moins la pièce d\'identité et le diplôme'); return
    }
    setError(''); setLoading(true)
    try {
      const formData = new FormData()
      Object.values(uploadedDocs).forEach(file => formData.append('files', file))
      const token = localStorage.getItem('doctor_token')
      const res = await fetch(`${API}/doctor/upload-documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) { setError('Erreur lors de l\'upload'); return }
      setStep(2)
    } catch { setError('Erreur réseau') }
    finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid var(--border2)', background: 'var(--dark-50)',
    color: 'var(--text1)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  }
  const labelStyle = {
    display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text2)',
    marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        width: '100%', maxWidth: step === 1 ? 560 : 440,
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)', animation: 'fadeInUp 0.5s both',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(26,10,16,0.2)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
              <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text1)', letterSpacing: '-0.4px' }}>
            {step === 0 ? 'Créer votre compte' : step === 1 ? 'Vos documents' : 'Inscription terminée'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text4)', marginTop: 4 }}>
            {step === 0 ? 'Informations professionnelles' : step === 1 ? 'Justifiez votre identité médicale' : 'En attente de validation'}
          </div>
        </div>

        <StepIndicator current={step} total={3} />

        {/* ── Step 0 : Formulaire ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input style={inputStyle} placeholder="Dr. Prénom Nom" value={form.name} onChange={e => set('name', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
              </div>
              <div>
                <label style={labelStyle}>N° CNOM</label>
                <input style={inputStyle} placeholder="TN-XXXX" value={form.cnom_number} onChange={e => set('cnom_number', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Email professionnel *</label>
              <input style={inputStyle} type="email" placeholder="dr.nom@etablissement.tn" value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
            </div>

            // APRÈS
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
  <div>
    <label style={labelStyle}>Mot de passe *</label>
    <div style={{ position: 'relative' }}>
      <input
        style={{ ...inputStyle, padding: '11px 40px 11px 14px' }}
        type={showPassword ? 'text' : 'password'}
        placeholder="Min. 8 caractères"
        value={form.password}
        onChange={e => set('password', e.target.value)}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text4)', display: 'flex', alignItems: 'center', padding: 4,
      }}>
        {showPassword
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  </div>
  <div>
    <label style={labelStyle}>Confirmer *</label>
    <div style={{ position: 'relative' }}>
      <input
        style={{ ...inputStyle, padding: '11px 40px 11px 14px' }}
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={e => set('confirmPassword', e.target.value)}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text4)', display: 'flex', alignItems: 'center', padding: 4,
      }}>
        {showPassword
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  </div>
</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Spécialité *</label>
                <select style={inputStyle} value={form.specialty} onChange={e => set('specialty', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'}>
                  <option value="">Choisir...</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Années d'expérience</label>
                <input style={inputStyle} type="number" min="0" max="50" placeholder="0" value={form.years_experience} onChange={e => set('years_experience', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Établissement *</label>
                <input style={inputStyle} placeholder="Hôpital / Clinique" value={form.hospital} onChange={e => set('hospital', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
              </div>
              <div>
                <label style={labelStyle}>Ville</label>
                <input style={inputStyle} placeholder="Tunis, Sfax..." value={form.city} onChange={e => set('city', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border2)'} />
              </div>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleRegister} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 11, border: 'none',
              background: loading ? 'var(--dark-200)' : 'var(--gradient-dark)',
              color: loading ? 'var(--text4)' : '#fff', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'default' : 'pointer', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(26,10,16,0.2)',
              fontFamily: 'var(--font-body)',
            }}>
              {loading ? 'Création...' : 'Continuer →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text4)' }}>
              Déjà inscrit ?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Se connecter</Link>
            </div>
          </div>
        )}

        {/* ── Step 1 : Documents ── */}
        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {DOC_TYPES.map(({ key, label, desc, icon }) => {
                const file = uploadedDocs[key]
                return (
                  <div key={key}>
                    <input ref={fileRefs[key]} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                      onChange={e => handleFileSelect(key, e.target.files[0])} />
                    <div onClick={() => fileRefs[key].current.click()} style={{
                      border: `1.5px dashed ${file ? 'var(--green)' : 'var(--border2)'}`,
                      borderRadius: 12, padding: '16px 12px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: file ? 'var(--green-bg)' : 'var(--dark-50)',
                    }}
                      onMouseEnter={e => !file && (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onMouseLeave={e => !file && (e.currentTarget.style.borderColor = 'var(--border2)')}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{file ? '✅' : icon}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: file ? 'var(--green)' : 'var(--text2)', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text4)' }}>
                        {file ? file.name.slice(0, 18) + '...' : desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--yellow-bg)', border: '1px solid rgba(217,119,6,0.2)', marginBottom: 16, fontSize: 12.5, color: 'var(--yellow)' }}>
              ℹ️ Formats acceptés : JPG, PNG, PDF. Taille max : 5 Mo par fichier.
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--red)', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleUpload} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 11, border: 'none',
              background: loading ? 'var(--dark-200)' : 'var(--gradient-dark)',
              color: loading ? 'var(--text4)' : '#fff', fontWeight: 700, fontSize: 15,
              cursor: loading ? 'default' : 'pointer', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(26,10,16,0.2)',
              fontFamily: 'var(--font-body)', marginBottom: 10,
            }}>
              {loading ? 'Envoi en cours...' : `Envoyer les documents (${Object.keys(uploadedDocs).length}/4) →`}
            </button>

            <button onClick={() => setStep(2)} style={{
              width: '100%', padding: '11px', borderRadius: 11,
              border: '1.5px solid var(--border2)', background: 'transparent',
              color: 'var(--text3)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              Passer cette étape (compléter plus tard)
            </button>
          </div>
        )}

        {/* ── Step 2 : Confirmation ── */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text1)', marginBottom: 10 }}>
              Inscription envoyée !
            </div>
            <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 24 }}>
              Votre dossier est en cours d'examen par notre équipe. Vous recevrez une réponse par email sous 24-48h.
            </p>
            <div style={{
              padding: '14px 18px', borderRadius: 12, marginBottom: 24,
              background: 'var(--yellow-bg)', border: '1px solid rgba(217,119,6,0.15)',
              fontSize: 13, color: 'var(--yellow)', fontWeight: 500,
            }}>
              ⏳ Statut actuel : <strong>En attente de validation</strong>
            </div>
            <button onClick={() => navigate('/pending')} style={{
              width: '100%', padding: '13px', borderRadius: 11, border: 'none',
              background: 'var(--gradient-dark)', color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', boxShadow: '0 6px 20px rgba(26,10,16,0.2)',
              fontFamily: 'var(--font-body)',
            }}>
              Suivre mon dossier
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}