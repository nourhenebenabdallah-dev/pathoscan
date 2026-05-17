// HistoryGlobal.jsx - PREMIUM UNIFIED avec Landing Style
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { 
  FileImage, 
  Heart, 
  Activity, 
  Clock, 
  ChevronRight,
  Calendar,
  Search,
  X,
  Users,
  Microscope,
  TrendingUp
} from "lucide-react";
import { listImagePredictions, listRiskPredictions, listMammoPredictions } from "../utils/api";

export default function HistoryGlobal() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [stats, setStats] = useState({ total: 0, idc: 0, risk: 0, mammo: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [img, risk, mammo] = await Promise.all([
          listImagePredictions(),
          listRiskPredictions(),
          listMammoPredictions(),
        ]);

        const merged = [
          ...img.data.predictions.map(p => ({ ...p, type: "IDC", icon: "🔬" })),
          ...risk.data.predictions.map(p => ({ ...p, type: "RISK", icon: "📊" })),
          ...mammo.data.predictions.map(p => ({ ...p, type: "MAMMO", icon: "📷" })),
        ];

        merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setData(merged);
        
        setStats({
          total: merged.length,
          idc: merged.filter(i => i.type === "IDC").length,
          risk: merged.filter(i => i.type === "RISK").length,
          mammo: merged.filter(i => i.type === "MAMMO").length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getVerdictColor = (verdict, type) => {
    if (type === "RISK") {
      return verdict === "High Risk" ? "danger" : "success";
    }
    if (type === "MAMMO") {
      return verdict === "MASSE" ? "danger" : "success";
    }
    return verdict === "IDC (Malin)" ? "danger" : "success";
  };

  const getConfidenceColor = (confidence) => {
    const conf = String(confidence).toUpperCase();
    if (conf.includes("HAUTE") || conf === "HIGH") return "confidence-high";
    if (conf.includes("MOYENNE") || conf === "MEDIUM") return "confidence-medium";
    return "confidence-low";
  };

  const filteredData = data.filter(item => {
    if (filter !== "all" && item.type !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        item.verdict?.toLowerCase().includes(search) ||
        item.type?.toLowerCase().includes(search) ||
        item.patient_id?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const statsCards = [
    { label: "Total analyses", value: stats.total, icon: Activity, gradientStart: "#ec4899", gradientEnd: "#db2777" },
    { label: "IDC", value: stats.idc, icon: FileImage, gradientStart: "#8b5cf6", gradientEnd: "#7c3aed" },
    { label: "Risque", value: stats.risk, icon: Heart, gradientStart: "#f59e0b", gradientEnd: "#d97706" },
    { label: "Mammo", value: stats.mammo, icon: TrendingUp, gradientStart: "#3b82f6", gradientEnd: "#2563eb" },
  ];

  if (loading) {
    return (
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
          <Heart size={48} color="var(--accent)" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: "var(--text3)", fontWeight: 500 }}
        >
          Chargement de l'historique...
        </motion.p>
      </div>
    );
  }

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
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 14px rgba(26,10,16,0.25)',
          }}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40, textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)',
            fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 20,
          }}>
            <Calendar size={14} />
            HISTORIQUE MÉDICAL
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 5vw, 52px)',
            color: 'var(--text1)', letterSpacing: '-1.5px',
            marginBottom: 16,
          }}>
            Historique des{' '}
            <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Analyses
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text3)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Suivez l'évolution de toutes vos analyses médicales en temps réel
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}>
          {statsCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: `linear-gradient(135deg, ${stat.gradientStart}, ${stat.gradientEnd})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                <stat.icon size={24} color="white" />
              </div>
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
                  style={{
                    fontSize: 32, fontWeight: 900,
                    background: `linear-gradient(135deg, ${stat.gradientStart}, ${stat.gradientEnd})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', marginTop: 6 }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 24,
            padding: '16px 20px',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { key: "all", label: "Tous", icon: "📋" },
              { key: "IDC", label: "IDC", icon: "🔬" },
              { key: "RISK", label: "Risque", icon: "📊" },
              { key: "MAMMO", label: "Mammo", icon: "📷" },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 99,
                  border: '1px solid var(--border2)',
                  background: filter === f.key ? 'var(--gradient-dark)' : 'transparent',
                  color: filter === f.key ? '#fff' : 'var(--text2)',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (filter !== f.key) {
                    e.currentTarget.style.background = 'rgba(251,113,133,0.05)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={e => {
                  if (filter !== f.key) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border2)';
                  }
                }}
              >
                <span style={{ marginRight: 6 }}>{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              background: 'var(--bg)',
              border: '1px solid var(--border2)',
              borderRadius: 99,
            }}>
              <Search size={16} color="var(--text4)" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text1)',
                  fontSize: 13,
                  width: 180,
                }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 0,
                }}>
                  <X size={14} color="var(--text4)" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text4)', fontWeight: 500 }}>
            {filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* History List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {filteredData.map((item, i) => {
              const verdictColor = getVerdictColor(item.verdict, item.type);
              const confidenceClass = getConfidenceColor(item.confidence);
              
              return (
                <motion.div
                  key={`${item.type}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  whileHover={{ x: 6, borderColor: 'rgba(251,113,133,0.3)' }}
                >
                  {/* Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{item.icon}</span>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 14,
                        background: 'var(--gradient-rose)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        {item.type}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px',
                      borderRadius: 99,
                      background: verdictColor === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: verdictColor === 'danger' ? '#ef4444' : '#22c55e',
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: verdictColor === 'danger' ? '#ef4444' : '#22c55e' }} />
                      {item.verdict}
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>Probabilité</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: verdictColor === 'danger' ? '#ef4444' : '#22c55e' }}>
                        {((item.probability || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.probability || 0) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.02 }}
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${verdictColor === 'danger' ? '#ef4444' : '#22c55e'}, ${verdictColor === 'danger' ? '#f97316' : '#34d399'})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    {item.patient_id && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text3)' }}>
                        <Users size={12} />
                        <span>{item.patient_id}</span>
                      </div>
                    )}
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                      background: confidenceClass === 'confidence-high' ? 'rgba(34,197,94,0.1)' :
                                   confidenceClass === 'confidence-medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: confidenceClass === 'confidence-high' ? '#22c55e' :
                             confidenceClass === 'confidence-medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {item.confidence || "N/A"}
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)' }}>
                      <Clock size={12} />
                      {new Date(item.created_at).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <ChevronRight size={16} color="var(--accent)" style={{ opacity: 0.6 }} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: 'center',
                padding: '60px 32px',
                background: 'var(--panel)',
                border: '2px dashed var(--border2)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(251,113,133,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Microscope size={40} color="var(--accent)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>
                Aucune analyse trouvée
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text3)' }}>
                Modifiez vos filtres ou effectuez une nouvelle analyse
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(26,10,16,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--panel)',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 500,
                width: '100%',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--panel)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{selectedItem.icon}</span>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 800,
                    background: 'var(--gradient-rose)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                  }}>
                    Détails de l'analyse
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: 'rgba(251,113,133,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <X size={18} color="var(--accent)" />
                </button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Type</span>
                    <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{selectedItem.icon} {selectedItem.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Verdict</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                      background: getVerdictColor(selectedItem.verdict, selectedItem.type) === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: getVerdictColor(selectedItem.verdict, selectedItem.type) === 'danger' ? '#ef4444' : '#22c55e',
                    }}>
                      {selectedItem.verdict}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Probabilité</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                      {((selectedItem.probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Confiance</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: getConfidenceColor(selectedItem.confidence) === 'confidence-high' ? 'rgba(34,197,94,0.1)' :
                                   getConfidenceColor(selectedItem.confidence) === 'confidence-medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: getConfidenceColor(selectedItem.confidence) === 'confidence-high' ? '#22c55e' :
                             getConfidenceColor(selectedItem.confidence) === 'confidence-medium' ? '#f59e0b' : '#ef4444',
                    }}>
                      {selectedItem.confidence || "N/A"}
                    </span>
                  </div>
                  {selectedItem.patient_id && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Patient</span>
                      <span style={{ fontWeight: 700, color: 'var(--text1)' }}>{selectedItem.patient_id}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text3)' }}>Date</span>
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>
                      {new Date(selectedItem.created_at).toLocaleString('fr-FR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}