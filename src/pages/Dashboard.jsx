// Dashboard.jsx - PREMIUM UNIFIED avec Landing Style
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
  RadialBarChart, RadialBar
} from "recharts";
import {
  Activity, Users, AlertCircle, CheckCircle,
  Microscope, HeartPulse, ScanLine, RefreshCw,
  TrendingUp, TrendingDown, Clock, Award, Star,
  Calendar, Zap, Target
} from "lucide-react";
import { getStats } from "../utils/api";

/* ── Couleurs alignées Landing ── */
const COLORS = {
  accent: "#fb7185",
  accentDark: "#db2777",
  gradientStart: "#2d0a1a",
  gradientEnd: "#1a0a10",
  text1: "#1a0a10",
  text2: "#4a2a38",
  text3: "#7a5a68",
  text4: "#b89aab",
  border: "rgba(26,10,16,0.08)",
  border2: "rgba(26,10,16,0.12)",
  malin: "#ec4899",
  benin: "#10b981",
  masse: "#f59e0b",
  normal: "#3b82f6",
  hi: "#ef4444",
  lo: "#22c55e",
  haute: "#8b5cf6",
  moderee: "#f59e0b",
  faible: "#6b7280",
  purple: "#8b5cf6",
};

const GRADIENTS = {
  pink: ["#ec4899", "#db2777"],
  purple: ["#8b5cf6", "#7c3aed"],
  blue: ["#3b82f6", "#2563eb"],
  green: ["#10b981", "#059669"],
  orange: ["#f59e0b", "#d97706"],
};

/* ── Tooltip Premium ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(251,113,133,0.2)",
      borderRadius: 12,
      padding: "12px 16px",
      boxShadow: "0 8px 25px rgba(251,113,133,0.15)",
      fontSize: 13,
    }}>
      {label && (
        <p style={{ color: COLORS.accentDark, fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ color: COLORS.text2, margin: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: p.color || p.fill,
            display: "inline-block",
          }} />
          {p.name}: <strong>{p.value}{p.unit || ''}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Stat Card étoilée Landing ── */
function StatCard({ icon: Icon, label, value, sub, color, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      whileHover={{ y: -4 }}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-card)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <Icon size={20} color="white" />
        </div>
        <div style={{
          padding: "4px 8px",
          background: "rgba(251,113,133,0.08)",
          borderRadius: 8,
        }}>
          <TrendingUp size={14} color={gradient[0]} />
        </div>
      </div>
      <div style={{
        fontSize: 32, fontWeight: 900,
        background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontWeight: 700, color: "var(--text2)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: "var(--text4)" }}>
        {sub}
      </div>
    </motion.div>
  );
}

/* ── Section Title ── */
function SectionTitle({ icon: Icon, title, subtitle, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text1)", margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text4)", margin: "4px 0 0" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('doctor_user') || '{}');
    const name = user.name?.replace(/^Dr\.\s*/i, '') || 'Médecin';
    setUserName(name);
    
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Bonjour');
      setGreetingIcon('☀️');
    } else if (hour < 18) {
      setGreeting('Bon après-midi');
      setGreetingIcon('🌤️');
    } else {
      setGreeting('Bonsoir');
      setGreetingIcon('🌙');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getStats()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tick]);

  if (loading) return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 20,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Activity size={48} color="var(--accent)" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: "var(--text3)" }}
      >
        Chargement du tableau de bord...
      </motion.p>
    </div>
  );

  const img = stats?.histopathology || {};
  const risk = stats?.risk || {};
  const mammo = stats?.mammography || {};

  const idcPie = [
    { name: "IDC Malin", value: img.malins || 0, color: COLORS.malin },
    { name: "Non-IDC Bénin", value: img.benins || 0, color: COLORS.benin },
  ];
  const riskPie = [
    { name: "Haut risque", value: risk.high_risk || 0, color: COLORS.hi },
    { name: "Bas risque", value: risk.low_risk || 0, color: COLORS.lo },
  ];
  const mammoPie = [
    { name: "Masse détectée", value: mammo.masses || 0, color: COLORS.masse },
    { name: "Normal", value: mammo.normaux || 0, color: COLORS.normal },
  ];

  const confIDC = [
    { name: "Haute", count: img.confidence_stats?.Haute || 0, fill: COLORS.haute },
    { name: "Modérée", count: img.confidence_stats?.Modérée || img.confidence_stats?.Moderee || 0, fill: COLORS.moderee },
    { name: "Faible", count: img.confidence_stats?.Faible || 0, fill: COLORS.faible },
  ];
  const confRisk = [
    { name: "Haute", count: risk.confidence_stats?.Haute || 0, fill: COLORS.haute },
    { name: "Modérée", count: risk.confidence_stats?.Modérée || risk.confidence_stats?.Moderee || 0, fill: COLORS.moderee },
    { name: "Faible", count: risk.confidence_stats?.Faible || 0, fill: COLORS.faible },
  ];

  const performanceData = [
    { name: "IDC", value: img.taux_malignite || 0, fill: COLORS.malin },
    { name: "Risque", value: risk.taux_high_risk || 0, fill: COLORS.purple },
    { name: "Mammo", value: mammo.taux_detection || 0, fill: COLORS.masse },
  ];

  const trendData = [
    { date: "Lun", IDC: 12, Risque: 8, Mammo: 15 },
    { date: "Mar", IDC: 15, Risque: 10, Mammo: 18 },
    { date: "Mer", IDC: 10, Risque: 12, Mammo: 14 },
    { date: "Jeu", IDC: 18, Risque: 9, Mammo: 20 },
    { date: "Ven", IDC: 14, Risque: 11, Mammo: 16 },
    { date: "Sam", IDC: 8, Risque: 7, Mammo: 10 },
    { date: "Dim", IDC: 6, Risque: 5, Mammo: 8 },
  ];

  const volumeData = [
    { name: "IDC", value: img.total || 0, fill: COLORS.malin },
    { name: "Risque", value: risk.total || 0, fill: COLORS.purple },
    { name: "Mammo", value: mammo.total || 0, fill: COLORS.masse },
  ];

  const cards = [
    {
      label: "Total patients",
      value: stats?.total_patients ?? "—",
      sub: "Dossiers enregistrés",
      icon: Users,
      gradient: GRADIENTS.pink,
    },
    {
      label: "Histopathologie",
      value: img.total ?? "—",
      sub: `${img.taux_malignite ?? 0}% de malignité`,
      icon: Microscope,
      gradient: GRADIENTS.purple,
    },
    {
      label: "Risque SEER",
      value: risk.total ?? "—",
      sub: `${risk.high_risk ?? 0} hauts risques`,
      icon: HeartPulse,
      gradient: GRADIENTS.orange,
    },
    {
      label: "Mammographies",
      value: mammo.total ?? "—",
      sub: `${mammo.taux_detection ?? 0}% de détection`,
      icon: ScanLine,
      gradient: GRADIENTS.blue,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar - Identique à Landing */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--gradient-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(26,10,16,0.2)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>PathoScan</div>
            <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 500, textTransform: 'uppercase' }}>Diagnostic IA</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/analyze')} style={{
            padding: '10px 22px', borderRadius: 10, border: '1.5px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            Nouvelle Analyse
          </button>
          <button onClick={() => navigate('/profile')} style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(26,10,16,0.25)',
          }}>
            Mon Profil
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px' }}>
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 28px',
            marginBottom: 32,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 42 }}>{greetingIcon}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 800,
                background: 'var(--gradient-rose)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                {greeting}, Dr. {userName}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text4)', margin: '4px 0 0' }}>
                {new Date().getHours() < 12 ? '☀️ Commencez votre journée avec une vue d\'ensemble de vos analyses' : 
                 new Date().getHours() < 18 ? '🌤️ Poursuivez vos diagnostics avec PathoScan' : 
                 '🌙 Une dernière analyse avant la fin de journée ?'}
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              background: 'rgba(251,113,133,0.06)',
              borderRadius: 99,
              color: 'var(--accent)',
              fontSize: 13,
              fontWeight: 600,
            }}>
              <Clock size={14} />
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)',
              fontSize: 11, fontWeight: 700, color: 'var(--accent)',
              letterSpacing: '1px', marginBottom: 16,
            }}>
              <Zap size={12} />
              TABLEAU DE BORD
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 900,
              color: 'var(--text1)',
              letterSpacing: '-1px',
              margin: 0,
            }}>
              Vue d'ensemble{' '}
              <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Analytique
              </span>
            </h1>
          </div>
          <button
            onClick={() => setTick(n => n + 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'var(--panel)',
              border: '1px solid var(--border2)',
              borderRadius: 99,
              color: 'var(--text2)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.04)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--panel)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
          >
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          {cards.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i} />
          ))}
        </div>

        {/* Trend Chart */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-card)',
        }}>
          <SectionTitle icon={TrendingUp} title="Tendance hebdomadaire" subtitle="Évolution des analyses sur 7 jours" color={COLORS.accent} />
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradIDC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.malin} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.malin} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRisque" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradMammo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.masse} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.masse} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(251,113,133,0.1)" />
                <XAxis dataKey="date" tick={{ fill: COLORS.text4, fontSize: 11 }} />
                <YAxis tick={{ fill: COLORS.text4, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="IDC" stroke={COLORS.malin} fill="url(#gradIDC)" strokeWidth={2} />
                <Area type="monotone" dataKey="Risque" stroke={COLORS.purple} fill="url(#gradRisque)" strokeWidth={2} />
                <Area type="monotone" dataKey="Mammo" stroke={COLORS.masse} fill="url(#gradMammo)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 Columns Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}>
          {/* IDC Pie */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}>
            <SectionTitle icon={Microscope} title="Histopathologie IDC" subtitle={`${img.total || 0} analyses`} color={COLORS.malin} />
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={idcPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {idcPie.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
              {idcPie.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ color: 'var(--text3)' }}>{d.name}</span>
                  <strong style={{ color: 'var(--text1)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Pie */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}>
            <SectionTitle icon={HeartPulse} title="Risque Clinique SEER" subtitle={`${risk.total || 0} analyses`} color={COLORS.hi} />
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {riskPie.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
              {riskPie.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ color: 'var(--text3)' }}>{d.name}</span>
                  <strong style={{ color: 'var(--text1)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Mammo Pie */}
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}>
            <SectionTitle icon={ScanLine} title="Mammographie" subtitle={`${mammo.total || 0} analyses`} color={COLORS.masse} />
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mammoPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {mammoPie.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
              {mammoPie.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                  <span style={{ color: 'var(--text3)' }}>{d.name}</span>
                  <strong style={{ color: 'var(--text1)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Volume Bar Chart */}
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          boxShadow: 'var(--shadow-card)',
        }}>
          <SectionTitle icon={BarChart} title="Volume par modalité" subtitle="Nombre total d'analyses" color={COLORS.purple} />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(251,113,133,0.1)" />
                <XAxis dataKey="name" tick={{ fill: COLORS.text4, fontSize: 12 }} />
                <YAxis tick={{ fill: COLORS.text4, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Analyses" radius={[8, 8, 0, 0]}>
                  {volumeData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}