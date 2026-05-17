// Analyze.jsx - PREMIUM UNIFIED
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, FlaskConical, AlertCircle, CheckCircle, Image, X, Save,
  Microscope, Zap, Shield, Clock, Activity, ChevronRight, Users, FileText
} from "lucide-react";
import { predict, listPatients } from "../utils/api";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Analyze() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    listPatients().then(r => setPatients(r.data.patients || [])).catch(() => {});
  }, []);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setSaved(false);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".tiff", ".bmp"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predict(file, patientId || null, notes);
      setResult(res.data);
      if (patientId) setSaved(true);
    } catch (e) {
      setError(e.response?.data?.detail || "Erreur lors de l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null); 
    setPreview(null); 
    setResult(null);
    setError(null); 
    setNotes(""); 
    setSaved(false);
  };

  const isMalin = result?.verdict?.includes("Malin");

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
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '10px 22px', borderRadius: 10, border: '1.5px solid var(--border2)',
            background: 'transparent', color: 'var(--text2)', fontWeight: 600, fontSize: 13.5,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            Dashboard
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
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 32px' }}>
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.15)',
            fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 24,
          }}>
            <Microscope size={14} />
            ANALYSE HISTOPATHOLOGIQUE
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 5vw, 52px)',
            color: 'var(--text1)', letterSpacing: '-1.5px',
            marginBottom: 16,
          }}>
            Classification{' '}
            <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              IDC Deep Learning
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text3)', maxWidth: 600, lineHeight: 1.6 }}>
            Détection du carcinome canalaire infiltrant par intelligence artificielle avec une précision clinique
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Dropzone Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
              }}
            >
              <div 
                {...getRootProps()} 
                style={{
                  padding: preview ? '24px' : '48px 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isDragActive ? 'rgba(225,29,72,0.03)' : 'transparent',
                  borderBottom: isDragActive ? '2px solid var(--accent)' : 'none',
                }}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={preview} 
                      alt="Aperçu" 
                      style={{
                        maxHeight: 280, maxWidth: '100%',
                        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); clearAll(); }}
                      style={{
                        position: 'absolute', top: -12, right: -12,
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'white', border: '2px solid var(--border2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#dc2626',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(225,29,72,0.08), rgba(219,39,119,0.08))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px', border: '2px dashed rgba(225,29,72,0.2)',
                    }}>
                      <Upload size={32} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text1)', marginBottom: 8 }}>
                      {isDragActive ? "Déposez l'image ici" : "Glissez-déposez votre image"}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text4)', marginBottom: 16 }}>
                      PNG, JPG, TIFF — Patch 50×50 ou coupe histologique complète
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '8px 20px', borderRadius: 99,
                      background: 'var(--gradient-dark)', color: '#fff',
                      fontSize: 13, fontWeight: 600,
                    }}>
                      <Zap size={14} />
                      Parcourir
                    </div>
                  </>
                )}
              </div>
              
              {file && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 20px', background: 'rgba(225,29,72,0.04)',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)' }}>
                    <Image size={14} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text4)' }}>
                    {(file.size / 1024).toFixed(0)} Ko
                  </span>
                </div>
              )}
            </motion.div>

            {/* Options Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Shield size={18} color="var(--accent)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>
                  Options d'analyse
                </h3>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
                  <Users size={14} />
                  Associer à un patient
                </label>
                <select 
                  value={patientId} 
                  onChange={e => setPatientId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                    fontSize: 14, fontFamily: 'inherit',
                  }}
                >
                  <option value="">— Analyse sans patient —</option>
                  {patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>
                  <FileText size={14} />
                  Notes cliniques
                </label>
                <textarea
                  rows={3}
                  placeholder="Observations, contexte clinique, antécédents…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: 'var(--bg)', border: '1px solid var(--border2)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                    fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>
            </motion.div>

            {/* Analyze Button */}
            <motion.button
              onClick={handleAnalyze}
              disabled={!file || loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                padding: '16px 32px', borderRadius: 'var(--radius-md)', border: 'none',
                background: 'var(--gradient-dark)', color: '#fff',
                fontWeight: 700, fontSize: 15, cursor: !file || loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                transition: 'all 0.2s', opacity: !file || loading ? 0.5 : 1,
                boxShadow: '0 8px 28px rgba(26,10,16,0.25)',
              }}
              onMouseEnter={e => { if (file && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(26,10,16,0.3)' } }}
              onMouseLeave={e => { if (file && !loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(26,10,16,0.25)' } }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <FlaskConical size={18} />
                  Lancer l'analyse IDC
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </div>

          {/* Right Column - Results */}
          <div>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: '#fff1f0', border: '1px solid #ffccc7',
                    borderRadius: 'var(--radius-lg)', padding: 28,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: '#fff2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertCircle size={28} color="#ff4d4f" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ff4d4f', marginBottom: 8 }}>Erreur d'analyse</h3>
                      <p style={{ fontSize: 14, color: '#cf1322' }}>{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: 'var(--panel)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 28,
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {/* Verdict Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 'var(--radius-md)',
                      background: isMalin ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isMalin ? <AlertCircle size={28} color="#ef4444" /> : <CheckCircle size={28} color="#22c55e" />}
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28,
                        background: isMalin ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      }}>
                        {result.verdict}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Activity size={14} color="var(--text4)" />
                        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Confiance : {result.confidence}</span>
                      </div>
                    </div>
                    {saved && (
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f6ffed', borderRadius: 99, color: '#52c41a', fontSize: 12, fontWeight: 600 }}>
                        <Save size={14} />
                        Sauvegardé
                      </div>
                    )}
                  </div>

                  {/* Probability Bar */}
                  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text2)' }}>Probabilité IDC (Malin)</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: isMalin ? '#ef4444' : '#22c55e' }}>
                        {((result.probability || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.probability || 0) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${isMalin ? '#ef4444' : '#22c55e'}, ${isMalin ? '#f97316' : '#34d399'})`,
                          borderRadius: 4,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[
                      { icon: Microscope, label: "Mode analyse", value: result.mode === "patch" ? "Patch 50×50" : "Grande image" },
                      { icon: Zap, label: "Appareil", value: result.device },
                      { icon: Image, label: "Taille image", value: result.image_size ? `${result.image_size.width}×${result.image_size.height}` : "—" },
                      { icon: Users, label: "Patient", value: result.patient_id || "Non associé" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', marginBottom: 6 }}>
                          <Icon size={12} />
                          {label}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text1)' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {result.warning && (
                    <div style={{ display: 'flex', gap: 10, padding: 12, background: '#fff7e6', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
                      <AlertCircle size={16} color="#fa8c16" />
                      <span style={{ fontSize: 13, color: '#d46b00' }}>{result.warning}</span>
                    </div>
                  )}

                  {/* Time */}
                  {result.elapsed_s && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text4)' }}>
                      <Clock size={14} />
                      Analyse effectuée en {result.elapsed_s}s
                    </div>
                  )}
                </motion.div>
              )}

              {!result && !error && !loading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'var(--panel)', border: '2px dashed var(--border2)',
                    borderRadius: 'var(--radius-lg)', padding: '60px 32px',
                    textAlign: 'center', boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'rgba(225,29,72,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    <Microscope size={48} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text1)', marginBottom: 12 }}>
                    Prêt pour l'analyse
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 400, margin: '0 auto 24px' }}>
                    Chargez une image histopathologique pour détecter la présence de carcinome canalaire infiltrant (IDC)
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    {["Classification binaire IDC", "Mode Patch 50×50", "Niveau de confiance"].map((feature, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: 13 }}>
                        <CheckCircle size={14} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}