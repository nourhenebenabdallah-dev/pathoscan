// Patients.jsx - PREMIUM 3D EDITION
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight, 
  X, 
  Search,
  Heart,
  UserPlus,
  Calendar,
  Activity,
  FlaskConical,
  Sparkles,
  Shield,
  TrendingUp
} from "lucide-react";
import { listPatients, createPatient, deletePatient } from "../utils/api";

function NewPatientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ 
    patient_id: "", 
    name: "", 
    age: "", 
    gender: "Femme", 
    notes: "",
    doctor_name: "",
    doctor_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.patient_id || !form.name || !form.age) {
      setError("ID, nom et âge sont requis");
      return;
    }
    setLoading(true);
    try {
      await createPatient({ ...form, age: parseInt(form.age) });
      onCreated();
    } catch (e) {
      setError(e.response?.data?.detail || "Erreur création patient");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(26,10,16,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        style={{
          background: 'var(--panel)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 520,
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
            }}>
              <UserPlus size={20} color="white" />
            </div>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 22, fontWeight: 800,
              background: 'var(--gradient-rose)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              margin: 0,
            }}>
              Nouveau patient
            </h2>
          </div>
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(236,72,153,0.1)',
              border: '1px solid rgba(236,72,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#db2777',
            }}
          >
            <X size={18} />
          </motion.button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              margin: '16px 24px', padding: '10px 16px',
              background: '#fee2e2', borderRadius: 12,
              color: '#dc2626', fontSize: 13, fontWeight: 500,
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <Activity size={16} />
            <span>{error}</span>
          </motion.div>
        )}

        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                ID Patient *
              </label>
              <input 
                placeholder="PAT-001" 
                value={form.patient_id} 
                onChange={set("patient_id")}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                Âge *
              </label>
              <input 
                type="number" 
                placeholder="45" 
                value={form.age} 
                onChange={set("age")}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
              Nom complet *
            </label>
            <input 
              placeholder="Prénom Nom" 
              value={form.name} 
              onChange={set("name")}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                fontSize: 14, fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
              Genre
            </label>
            <select 
              value={form.gender} 
              onChange={set("gender")}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                fontSize: 14, fontFamily: 'inherit',
              }}
            >
              <option>Femme</option>
              <option>Homme</option>
              <option>Autre</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
              Notes médicales
            </label>
            <textarea 
              rows={3} 
              placeholder="Antécédents médicaux, contexte clinique…" 
              value={form.notes} 
              onChange={set("notes")}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'var(--bg)', border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          {/* Doctor Section */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            borderRadius: 12, padding: '12px 16px',
            marginBottom: 12,
            border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span>👨‍⚕️</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Médecin traitant
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#15803d', marginBottom: 4, display: 'block' }}>Nom du médecin</label>
                <input 
                  placeholder="Dr. Martin" 
                  value={form.doctor_name} 
                  onChange={set("doctor_name")}
                  style={{
                    width: '100%', padding: '8px 10px',
                    background: 'white', border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 8, fontSize: 13,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#15803d', marginBottom: 4, display: 'block' }}>Email du médecin</label>
                <input 
                  type="email"
                  placeholder="dr.martin@gmail.com" 
                  value={form.doctor_email} 
                  onChange={set("doctor_email")}
                  style={{
                    width: '100%', padding: '8px 10px',
                    background: 'white', border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 8, fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 12, justifyContent: 'flex-end',
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          background: 'rgba(251,113,133,0.02)',
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: 99,
              border: '1px solid var(--border2)', background: 'transparent',
              color: 'var(--text2)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Annuler
          </button>
          <button 
            onClick={submit} 
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 99,
              border: 'none', background: 'var(--gradient-dark)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Création...
              </>
            ) : (
              <>
                <Plus size={16} />
                Créer le patient
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    listPatients().then(r => {
      const patientsList = r.data.patients || [];
      setPatients(patientsList);
      setTotal(r.data.total || 0);
      
      const analysesTotal = patientsList.reduce((sum, p) =>
        sum + (p.total_analyses || 0) + (p.total_risk_analyses || 0) + (p.total_mammo_analyses || 0), 0
      );
      setTotalAnalyses(analysesTotal);
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("⚠️ Supprimer ce patient et toutes ses analyses ?")) return;
    await deletePatient(id);
    load();
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(search.toLowerCase())
  );

  const statsCards = [
    { label: "Total patients", value: total, icon: Users, gradient: "#ec4899" },
    { label: "Total analyses", value: totalAnalyses, icon: FlaskConical, gradient: "#8b5cf6" },
    { label: "Patients affichés", value: filtered.length, icon: Search, gradient: "#f59e0b" },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar identique aux autres pages */}
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
            cursor: 'pointer',
          }}>IDC Analyse</button>
          <button onClick={() => navigate('/mammographie')} style={{
            padding: '10px 22px', borderRadius: 10, border: '1.5px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer',
          }}>Mammographie</button>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,10,16,0.25)',
          }}>Dashboard</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)',
            fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 20,
          }}>
            <Calendar size={14} />
            GESTION DES PATIENTS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart size={36} color="var(--accent)" style={{ filter: 'drop-shadow(0 4px 8px rgba(236,72,153,0.3))' }} />
            </motion.div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(28px, 4vw, 44px)',
                color: 'var(--text1)', letterSpacing: '-1.5px',
                margin: 0,
              }}>
                Dossier{' '}
                <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Patients
                </span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginTop: 4 }}>
                {total} dossier{total > 1 ? "s" : ""} médical{total > 1 ? "aux" : ""} enregistré{total > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Mini Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 28,
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
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `linear-gradient(135deg, ${stat.gradient}20, ${stat.gradient}08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={22} color={stat.gradient} />
              </div>
              <div>
                <div style={{
                  fontSize: 28, fontWeight: 900,
                  background: `linear-gradient(135deg, ${stat.gradient}, ${stat.gradient}80)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 500, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--panel)', border: '1px solid var(--border2)',
            borderRadius: 99, padding: '8px 20px',
            flex: 1, maxWidth: 400,
          }}>
            <Search size={18} color="var(--text4)" />
            <input
              placeholder="Rechercher par nom ou ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text1)', fontSize: 14, width: '100%',
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                background: 'none', border: 'none', cursor: 'pointer',
              }}>
                <X size={14} color="var(--text4)" />
              </button>
            )}
          </div>
          
          <motion.button 
            onClick={() => setModal(true)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 99,
              background: 'var(--gradient-dark)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
            }}
          >
            <Plus size={18} />
            Nouveau patient
          </motion.button>
        </div>

        {/* Patients Table */}
        {loading ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px', gap: 16,
            background: 'var(--panel)', borderRadius: 'var(--radius-lg)',
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart size={48} color="var(--accent)" />
            </motion.div>
            <p style={{ color: 'var(--text3)', fontWeight: 500 }}>Chargement des patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center', padding: '60px 32px',
              background: 'var(--panel)', borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border2)',
            }}
          >
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(236,72,153,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Users size={48} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>
              {search ? "Aucun résultat trouvé" : "Aucun patient enregistré"}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text3)' }}>
              {search ? "Essayez de modifier votre recherche" : "Cliquez sur « Nouveau patient » pour commencer"}
            </p>
          </motion.div>
        ) : (
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'auto',
            boxShadow: 'var(--shadow-card)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead style={{
                background: 'rgba(236,72,153,0.03)',
                borderBottom: '1px solid var(--border)',
              }}>
                <tr>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>ID Patient</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Nom</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Âge</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Genre</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Analyses</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p, i) => {
                    const totalAnalysesCount = (p.total_analyses || 0) + (p.total_risk_analyses || 0) + (p.total_mammo_analyses || 0);
                    return (
                      <motion.tr 
                        key={p._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ backgroundColor: 'rgba(236,72,153,0.02)' }}
                        onClick={() => navigate(`/patients/${p.patient_id}`)}
                        style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            background: 'rgba(236,72,153,0.1)', color: '#db2777',
                            padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          }}>
                            {p.patient_id}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10,
                              background: 'var(--gradient-dark)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700,
                            }}>
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--text1)' }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--text2)' }}>{p.age} ans</td>
                        <td style={{ padding: '14px 20px', color: 'var(--text2)' }}>{p.gender}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <span style={{
                            background: totalAnalysesCount > 0 ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#e5e7eb',
                            color: totalAnalysesCount > 0 ? 'white' : '#9ca3af',
                            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                          }}>
                            {totalAnalysesCount}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text4)' }}>
                          {p.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                            <motion.button 
                              onClick={e => handleDelete(e, p.patient_id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 8, padding: '6px 10px',
                                color: '#ef4444', cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={14} />
                            </motion.button>
                            <ChevronRight size={16} color="var(--accent)" style={{ opacity: 0.5 }} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <NewPatientModal
            onClose={() => setModal(false)}
            onCreated={() => { setModal(false); load(); }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}