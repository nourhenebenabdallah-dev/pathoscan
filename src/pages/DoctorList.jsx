import { useEffect, useState } from 'react'
import { api } from '../api'
import DoctorTable from '../components/DoctorTable'

const statusMeta = {
  pending: { 
    title: 'Médecins en attente', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: '#d97706', 
    bg: 'rgba(217,119,6,0.06)',
    border: 'rgba(217,119,6,0.15)',
  },
  approved: { 
    title: 'Médecins vérifiés', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    color: '#059669', 
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.15)',
  },
  rejected: { 
    title: 'Médecins rejetés', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    color: '#dc2626', 
    bg: 'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.15)',
  },
}

export default function DoctorList({ status }) {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)
  const meta = statusMeta[status] || statusMeta.pending

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getDoctors(status)
      setDoctors(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [status])

  const handleBatchVerify = async () => {
    if (!window.confirm('Lancer l\'analyse IA sur tous les médecins en attente ?')) return
    setBatchLoading(true)
    try {
      await api.batchVerify()
      await load()
    } catch (e) {
      alert('Erreur lors de l\'analyse batch')
    } finally {
      setBatchLoading(false)
    }
  }

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28,
        animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: meta.bg,
            border: `1.5px solid ${meta.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: meta.color,
          }}>
            {meta.icon}
          </div>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 20,
              color: 'var(--text1)',
              letterSpacing: '-0.3px',
            }}>
              {meta.title}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text4)', marginTop: 2 }}>
              {loading ? 'Chargement...' : `${filtered.length} médecin${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text4)', pointerEvents: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 16px 10px 42px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border2)',
                background: 'var(--panel)',
                color: 'var(--text1)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                outline: 'none',
                width: 240,
                transition: 'var(--transition)',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(225,29,72,0.04)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {status === 'pending' && (
            <button onClick={handleBatchVerify} disabled={batchLoading || loading} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: batchLoading ? 'var(--dark-200)' : 'var(--gradient-dark)',
              color: batchLoading ? 'var(--text3)' : '#fff',
              fontWeight: 600, fontSize: 13,
              boxShadow: batchLoading ? 'none' : '0 4px 16px rgba(26,10,16,0.2)',
              cursor: batchLoading ? 'default' : 'pointer',
              transition: 'var(--transition)',
              letterSpacing: '-0.2px',
            }}
              onMouseEnter={e => !batchLoading && (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={e => !batchLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {batchLoading ? '⏳ Analyse en cours...' : '✧ Analyser tout'}
            </button>
          )}

          <button onClick={load} style={{
            padding: '10px 16px', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border2)',
            background: 'var(--panel)',
            color: 'var(--text2)', fontWeight: 500, fontSize: 13,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--dark-50)'; e.target.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--panel)'; e.target.style.borderColor = 'var(--border2)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}>
        {loading ? (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, margin: '0 auto 20px',
              borderRadius: '50%',
              border: '3px solid var(--dark-200)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ color: 'var(--text4)', fontSize: 14 }}>Chargement des données...</div>
          </div>
        ) : (
          <DoctorTable doctors={filtered} onRefresh={load} />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}