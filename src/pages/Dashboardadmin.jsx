import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import VerificationModal from '../components/VerificationModal'

const StatCard = ({ icon, label, value, sub, accentColor, onClick }) => (
  <div onClick={onClick} style={{
    background: 'var(--panel)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px 28px',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-card)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-card)';
    }}
  >
    <div style={{
      position: 'absolute',
      top: -20, right: -20,
      width: 100, height: 100,
      borderRadius: '50%',
      background: accentColor || 'rgba(225,29,72,0.04)',
      pointerEvents: 'none',
    }} />
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.8 }}>{icon}</div>
      <div style={{
        fontSize: 34,
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        color: 'var(--text1)',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>{value ?? '—'}</div>
      <div style={{
        fontSize: 13.5,
        fontWeight: 600,
        color: 'var(--text2)',
        marginTop: 8,
        letterSpacing: '-0.2px',
      }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text4)', marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentDoctors, setRecentDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [analyzingId, setAnalyzingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, doctors] = await Promise.all([
        api.getStats(),
        api.getDoctors('pending'),
      ])
      setStats(statsData)
      setRecentDoctors(doctors.slice(0, 3))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async (doctor) => {
    setAnalyzingId(doctor.id)
    try {
      const result = await api.verifyDoctor(doctor.id)
      setSelectedDoctor({ doctor, result })
    } catch (e) {
      alert('Erreur lors de la vérification IA')
    } finally {
      setAnalyzingId(null)
    }
  }

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor({ doctor, result: null })
  }

  const handleApprove = async (doctorId) => {
    try {
      await api.doctorAction(doctorId, 'approve')
      setSelectedDoctor(null)
      loadData()
    } catch (e) {
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async (doctorId, reason) => {
    try {
      await api.doctorAction(doctorId, 'reject', reason || 'Rejeté par l\'administrateur')
      setSelectedDoctor(null)
      loadData()
    } catch (e) {
      alert('Erreur lors du rejet')
    }
  }

  return (
    <div style={{ padding: 32 }}>
      {/* Hero Banner */}
      <div style={{
        background: 'var(--gradient-dark)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 10s ease infinite',
        borderRadius: 'var(--radius-xl)',
        padding: '30px 36px',
        marginBottom: 28,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          position: 'absolute',
          top: -60, right: -40,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80, left: '30%',
          width: 160, height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 24,
            marginBottom: 6,
            letterSpacing: '-0.5px',
          }}>
            Bonjour, {JSON.parse(localStorage.getItem('mammoscan_user') || '{}').username || 'Administrateur'}
          </div>
          <div style={{
            fontSize: 13.5,
            opacity: 0.7,
            fontWeight: 400,
            maxWidth: 500,
            lineHeight: 1.6,
          }}>
            Plateforme PathoScan — Détection du cancer du sein par IA · Tunisie
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 18,
        marginBottom: 28,
      }}>
        <StatCard
          icon="⏳"
          label="En attente"
          value={stats?.pending ?? '—'}
          sub="Vérification requise"
          accentColor="rgba(217,119,6,0.06)"
          onClick={() => navigate('/admin/pending')}
        />
        <StatCard
          icon="✓"
          label="Médecins vérifiés"
          value={stats?.approved ?? '—'}
          sub="Total approuvés"
          accentColor="rgba(5,150,105,0.06)"
          onClick={() => navigate('/admin/verified')}
        />
        <StatCard
          icon="✗"
          label="Rejetés"
          value={stats?.rejected ?? '—'}
          sub="Dossiers refusés"
          accentColor="rgba(220,38,38,0.06)"
          onClick={() => navigate('/admin/rejected')}
        />
        <StatCard
          icon="📊"
          label="Analyses IA aujourd'hui"
          value={stats?.ai_analyses_today ?? '—'}
          sub="Via IA avancée"
          accentColor="rgba(139,92,246,0.06)"
        />
      </div>

      {/* Recent Pending */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 28,
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
        }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--text1)',
              letterSpacing: '-0.3px',
            }}>
              Demandes récentes en attente
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--text4)', marginTop: 2 }}>
              {recentDoctors.length} dossier{recentDoctors.length > 1 ? 's' : ''} à examiner
            </p>
          </div>
          <button onClick={() => navigate('/admin/pending')} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border2)',
            background: 'var(--panel)',
            color: 'var(--text2)', fontWeight: 500, fontSize: 13,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => { e.target.style.background = 'var(--dark-50)'; e.target.style.borderColor = 'var(--rose-300)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--panel)'; e.target.style.borderColor = 'var(--border2)'; }}
          >Voir tout →</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text4)' }}>
            <div style={{
              width: 36, height: 36, margin: '0 auto 16px',
              borderRadius: '50%',
              border: '2px solid var(--dark-200)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
            Chargement...
          </div>
        ) : recentDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text4)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Aucune demande en attente</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentDoctors.map((doc, i) => (
              <div key={doc.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--dark-50)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                transition: 'var(--transition)',
                animation: `fadeInUp 0.4s ${i * 0.1}s both`,
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--gradient-dark)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 13, color: '#fff',
                    boxShadow: '0 4px 12px rgba(26,10,16,0.2)',
                  }}>
                    {doc.name.split(' ').filter(w => w !== 'Dr.').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text1)' }}>{doc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text4)' }}>{doc.specialty} · {doc.hospital}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 99,
                    background: doc.confidence >= 70 ? 'var(--green-bg)' : doc.confidence >= 40 ? 'var(--yellow-bg)' : 'var(--red-bg)',
                    color: doc.confidence >= 70 ? 'var(--green)' : doc.confidence >= 40 ? 'var(--yellow)' : 'var(--red)',
                  }}>
                    {doc.confidence || 0}% confiance
                  </div>
                  <button onClick={() => handleViewDoctor(doc)} style={{
                    padding: '9px 16px', borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border2)',
                    background: 'var(--panel)',
                    color: 'var(--text2)', fontWeight: 500, fontSize: 13,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => { e.target.style.background = 'var(--dark-50)'; e.target.style.borderColor = 'var(--rose-300)'; }}
                    onMouseLeave={e => { e.target.style.background = 'var(--panel)'; e.target.style.borderColor = 'var(--border2)'; }}
                  >👁️ Voir</button>
                  <button onClick={() => handleAnalyze(doc)} disabled={analyzingId === doc.id} style={{
                    padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: analyzingId === doc.id ? 'var(--dark-200)' : 'var(--gradient-dark)',
                    color: '#fff', fontWeight: 600, fontSize: 13,
                    boxShadow: analyzingId === doc.id ? 'none' : '0 4px 16px rgba(26,10,16,0.2)',
                    cursor: analyzingId === doc.id ? 'default' : 'pointer',
                    transition: 'var(--transition)',
                  }}
                    onMouseEnter={e => !analyzingId && (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => !analyzingId && (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {analyzingId === doc.id ? '⏳' : '✧ Analyser'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <VerificationModal
          doctor={selectedDoctor.doctor}
          result={selectedDoctor.result}
          onClose={() => setSelectedDoctor(null)}
          onApprove={() => handleApprove(selectedDoctor.doctor.id)}
          onReject={(reason) => handleReject(selectedDoctor.doctor.id, reason)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}