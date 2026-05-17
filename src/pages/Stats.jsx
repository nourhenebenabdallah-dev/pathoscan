import { useEffect, useState } from 'react'
import { api } from '../api'

const BAR_COLORS = ['#1a0a10', '#2d0a18', '#4a0a20', '#881337', '#be123c', '#e11d48']

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px 28px',
      boxShadow: 'var(--shadow-card)',
      position: 'relative', overflow: 'hidden',
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <div style={{
        position: 'absolute', right: -16, top: -16, width: 100, height: 100,
        borderRadius: '50%', background: color || 'rgba(225,29,72,0.04)', opacity: 0.5,
      }} />
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 30, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text2)', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function DonutChart({ approved, rejected, pending, total }) {
  const r = 65, cx = 85, cy = 85, stroke = 18
  const circ = 2 * Math.PI * r
  const segments = [
    { pct: total ? approved / total : 0, color: '#059669', label: 'Approuvés', count: approved },
    { pct: total ? rejected / total : 0, color: '#dc2626', label: 'Rejetés', count: rejected },
    { pct: total ? pending / total : 0, color: '#d97706', label: 'En attente', count: pending },
  ]
  let offset = 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <svg width={170} height={170}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--dark-100)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const dash = s.pct * circ
          const gap  = circ - dash
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.8s ease' }}
            />
          )
          offset += s.pct
          return el
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={24} fontWeight={900} fill="var(--text1)" fontFamily="var(--font-display)">{total}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="var(--text4)" fontWeight={500}>médecins</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: 4, background: s.color }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>{s.count}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text4)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data = [], labelKey, valueKey, title }) {
  if (!data || data.length === 0) return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text2)', marginBottom: 14 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text4)', padding: '16px 0' }}>Aucune donnée</div>
    </div>
  )
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text2)', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ animation: `fadeInUp 0.4s ${i * 0.08}s both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text2)', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d[labelKey]}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text1)' }}>{d[valueKey]}</span>
            </div>
            <div style={{ height: 7, background: 'var(--dark-100)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[(i+1) % BAR_COLORS.length]}88)`,
                width: `${(d[valueKey] / max) * 100}%`,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GaugeBar({ value, label, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--dark-100)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          width: `${value}%`,
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  )
}

export default function Stats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/admin/stats/advanced')
      .then(r => r.json())
      .then(d => {
  setStats({
    ...d,
    by_specialty: d.by_specialty || [],
    by_hospital:  d.by_hospital  || [],
  })
  setLoading(false)
})
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 80, textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, margin: '0 auto 20px',
        borderRadius: '50%',
        border: '3px solid var(--dark-200)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'var(--text4)', fontSize: 14 }}>Chargement des statistiques...</div>
    </div>
  )

  if (!stats) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, margin: '0 auto 20px',
        borderRadius: '50%',
        background: 'var(--gradient-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
      }}>❌</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text2)' }}>Impossible de charger les stats</div>
    </div>
  )

  return (
    <div style={{ padding: 32 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total médecins" value={stats.total} color="rgba(26,10,16,0.04)" />
        <StatCard icon="✓" label="Taux d'approbation" value={`${stats.approval_rate}%`} sub={`${stats.approved} approuvés`} color="rgba(5,150,105,0.06)" />
        <StatCard icon="✗" label="Taux de rejet" value={`${stats.rejection_rate}%`} sub={`${stats.rejected} rejetés`} color="rgba(220,38,38,0.06)" />
        <StatCard icon="📊" label="Analyses IA totales" value={stats.total_analyses} sub={`${stats.ai_analyses_today} aujourd'hui`} color="rgba(139,92,246,0.06)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 28 }}>
        {/* Donut */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 22, color: 'var(--text1)' }}>Répartition</div>
          <DonutChart approved={stats.approved} rejected={stats.rejected} pending={stats.pending} total={stats.total} />
        </div>

        {/* Spécialités */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <BarChart data={stats.by_specialty} labelKey="specialty" valueKey="count" title="Par spécialité" />
        </div>

        {/* Hôpitaux */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
        }}>
          <BarChart data={stats.by_hospital} labelKey="hospital" valueKey="count" title="Par établissement" />
        </div>
      </div>

      {/* Performance */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 18, color: 'var(--text1)' }}>Indicateurs de performance</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
          <div>
            <GaugeBar value={stats.approval_rate} label="Taux d'approbation" color="var(--green)" />
            <GaugeBar value={stats.rejection_rate} label="Taux de rejet" color="var(--red)" />
            <GaugeBar value={stats.avg_confidence} label="Confiance IA moyenne" color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['⏳', 'En attente', stats.pending, '#d97706'],
              ['✓', 'Approuvés', stats.approved, '#059669'],
              ['✗', 'Rejetés', stats.rejected, '#dc2626'],
              ['📊', 'Analyses aujourd\'hui', stats.ai_analyses_today, '#7c3aed'],
              ['📈', 'Confiance moyenne', `${stats.avg_confidence}%`, 'var(--accent)'],
            ].map(([icon, label, value, color]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--dark-50)',
                border: '1px solid var(--border)',
                transition: 'var(--transition)',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <span style={{ fontSize: 13.5, color: 'var(--text2)', fontWeight: 500 }}>{icon} {label}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}