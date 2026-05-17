// Mammographie.jsx - PREMIUM UNIFIED avec Landing Style
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
  Upload, FlaskConical, AlertCircle, CheckCircle,
  ImageIcon, X, Download, Activity, Cpu, Clock,
  Crosshair, LayoutGrid, Info, Heart,
  Microscope, Shield, Users, FileText, Zap,
  ChevronRight, TrendingUp, Target
} from "lucide-react";
import { listPatients, predictMammo } from "../utils/api";

const API_BASE = "http://localhost:8000";

export default function Mammographie() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await listPatients(0, 200);
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error("Erreur chargement patients:", err);
        setPatients([]);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".dcm"] },
    maxFiles: 1,
  });

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setNotes("");
    setPatientId("");
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictMammo(file, patientId || null, notes);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (url, filename) => {
    try {
      const blob = await (await fetch(url)).blob();
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: filename || "gradcam_result.png"
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert("Erreur téléchargement : " + e.message);
    }
  };

  const isMasse = result?.verdict === "MASSE";
  const prob = result ? result.probability * 100 : 0;

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
            IDC Analyse
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
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 32px' }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 99,
            background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)',
            fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 20,
          }}>
            <Heart size={14} />
            ANALYSE MAMMOGRAPHIE
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 5vw, 52px)',
            color: 'var(--text1)', letterSpacing: '-1.5px',
            marginBottom: 16,
          }}>
            Détection de{' '}
            <span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Masse Mammaire
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text3)', maxWidth: 600, lineHeight: 1.6 }}>
            Classification par IA · EfficientNet-B5 · Visualisation multi-échelle GradCAM++
          </p>
        </motion.div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Dropzone Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
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
                  background: isDragActive ? 'rgba(251,113,133,0.03)' : 'transparent',
                  borderBottom: isDragActive ? '2px solid var(--accent)' : 'none',
                }}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={preview} 
                      alt="Aperçu mammographie" 
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
                      background: 'linear-gradient(135deg, rgba(251,113,133,0.08), rgba(219,39,119,0.08))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px', border: '2px dashed rgba(251,113,133,0.2)',
                    }}>
                      <Upload size={32} color="var(--accent)" />
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text1)', marginBottom: 8 }}>
                      {isDragActive ? "Déposez l'image ici" : "Glissez-déposez votre mammographie"}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text4)', marginBottom: 16 }}>
                      PNG · JPG · TIFF · DICOM
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
                  padding: '12px 20px', background: 'rgba(251,113,133,0.04)',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)' }}>
                    <ImageIcon size={14} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text4)' }}>
                    {(file.size / 1024).toFixed(0)} Ko
                  </span>
                </div>
              )}
            </motion.div>

            {/* Patient Options Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Users size={18} color="var(--accent)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>
                  Association patient
                </h3>
              </div>
              <select
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                disabled={loadingPatients}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              >
                <option value="">— Analyse sans patient —</option>
                {loadingPatients ? (
                  <option disabled>Chargement des patients...</option>
                ) : (
                  patients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.name} ({p.patient_id}) - {p.age} ans
                    </option>
                  ))
                )}
              </select>
              {!loadingPatients && patients.length === 0 && (
                <p style={{ fontSize: 12, color: '#d97706', marginTop: 8 }}>
                  Aucun patient trouvé. Créez-en un dans la page "Patients".
                </p>
              )}
            </motion.div>

            {/* Clinical Notes Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <FileText size={18} color="var(--accent)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>
                  Notes cliniques
                </h3>
              </div>
              <textarea
                rows={3}
                placeholder="Observations, contexte clinique, antécédents…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--bg)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text1)',
                  fontSize: 14, fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: 12 }}
            >
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 'var(--radius-md)', border: 'none',
                  background: 'var(--gradient-dark)', color: '#fff',
                  fontWeight: 700, fontSize: 15, cursor: !file || loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
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
                    Lancer l'analyse
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              {file && (
                <button
                  onClick={clearAll}
                  style={{
                    width: 52, height: 52, borderRadius: 'var(--radius-md)',
                    background: 'var(--panel)', border: '1px solid var(--border2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#dc2626',
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </motion.div>

            {/* How it works Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Info size={18} color="var(--accent)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>
                  Comment ça fonctionne
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: Upload, title: "Import", desc: "Chargez votre mammographie (PNG, DICOM…)", color: "#ec4899" },
                  { icon: FlaskConical, title: "Analyse", desc: "EfficientNet-B5 détecte les masses suspectes", color: "#8b5cf6" },
                  { icon: Activity, title: "GradCAM++", desc: "Visualisation multi-échelle des zones d'intérêt", color: "#f59e0b" },
                  { icon: Target, title: "Résultat", desc: "Score de probabilité + bounding box localisée", color: "#3b82f6" },
                ].map(({ icon: Icon, title, desc, color }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: color,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text1)', fontSize: 14 }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text4)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
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

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: 'var(--panel)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 60,
                    textAlign: 'center', boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: 48, height: 48, border: '3px solid rgba(251,113,133,0.15)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}
                    />
                    <p style={{ fontWeight: 600, color: 'var(--text2)' }}>Analyse en cours...</p>
                    <p style={{ fontSize: 12, color: 'var(--text4)' }}>Traitement du modèle EfficientNet-B5</p>
                  </div>
                </motion.div>
              )}

              {result && !error && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {/* Verdict Panel */}
                  <div style={{
                    background: 'var(--panel)', border: `1px solid ${isMasse ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                    borderRadius: 'var(--radius-lg)', padding: 24,
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                      <div style={{
                        width: 60, height: 60, borderRadius: 'var(--radius-md)',
                        background: isMasse ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isMasse ? <AlertCircle size={28} color="#ef4444" /> : <CheckCircle size={28} color="#22c55e" />}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Résultat de l'analyse</div>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28,
                          color: isMasse ? '#ef4444' : '#22c55e',
                        }}>
                          {result.verdict}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <Activity size={14} color="var(--text4)" />
                          <span style={{ fontSize: 13, color: 'var(--text3)' }}>Confiance : {result.confidence}</span>
                        </div>
                      </div>
                    </div>

                    {/* Probability Bar */}
                    <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text2)' }}>Probabilité de masse</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: isMasse ? '#ef4444' : '#22c55e' }}>
                          {prob.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prob}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          style={{
                            height: '100%',
                            background: `linear-gradient(90deg, ${isMasse ? '#ef4444' : '#22c55e'}, ${isMasse ? '#f97316' : '#34d399'})`,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { icon: Clock, label: "Durée", value: `${result.elapsed_s || 0}s` },
                        { icon: Cpu, label: "Mode", value: result.demo_mode ? "Démo" : "Réel" },
                        { icon: Target, label: "BBox", value: result.bbox ? `[${result.bbox.map(v => Math.round(v)).join(",")}]` : "—" },
                        { icon: Microscope, label: "Modèle", value: "EfficientNet-B5" },
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

                    {isMasse && (
                      <div style={{ display: 'flex', gap: 10, padding: 12, background: '#fff7e6', borderRadius: 'var(--radius-sm)' }}>
                        <Shield size={16} color="#fa8c16" />
                        <span style={{ fontSize: 12, color: '#d46b00' }}>
                          Résultat indicatif uniquement. Consultez un radiologue pour toute décision médicale.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* GradCAM++ Heatmap */}
                  {result.heatmap_url && (
                    <div style={{
                      background: 'var(--panel)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)', padding: 24,
                      boxShadow: 'var(--shadow-card)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <LayoutGrid size={18} color="var(--accent)" />
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>
                          Carte d'activation GradCAM++
                        </h3>
                      </div>
                      <div style={{
                        background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                        overflow: 'hidden', marginBottom: 16,
                      }}>
                        <img
                          src={`${API_BASE}${result.heatmap_url}`}
                          alt="GradCAM++ heatmap"
                          style={{ width: '100%', display: 'block' }}
                          onError={e => e.target.style.display = "none"}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444" }} />
                            Haute activation
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: "#3b82f6" }} />
                            Faible activation
                          </div>
                        </div>
                        <button
                          onClick={() => downloadImage(`${API_BASE}${result.heatmap_url}`, `gradcam_${result.job_id || Date.now()}.png`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 18px', borderRadius: 99, border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <Download size={14} />
                          Télécharger
                        </button>
                      </div>
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
                    background: 'rgba(251,113,133,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    <Microscope size={48} color="var(--accent)" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text1)', marginBottom: 12 }}>
                    Prêt pour l'analyse
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text3)', maxWidth: 400, margin: '0 auto 20px' }}>
                    Chargez une mammographie pour détecter la présence de masses suspectes
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {["PNG", "JPG", "DICOM", "TIFF"].map(format => (
                      <span key={format} style={{
                        padding: '4px 12px', background: 'rgba(251,113,133,0.08)',
                        borderRadius: 99, fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                      }}>
                        {format}
                      </span>
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