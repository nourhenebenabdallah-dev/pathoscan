// PredictionRisque.jsx - PREMIUM UNIFIED avec Landing Style
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Shield, Activity, ChevronRight, ChevronLeft,
  Check, AlertCircle, User, Search, X, FlaskConical,
  TrendingUp, Brain, Target, FileText, Zap, Users
} from "lucide-react";
import { listPatients, predictRisk } from "../utils/api";

const STEPS = [
  {
    title: "Informations personnelles",
    icon: User,
    fields: [
      { name: "Age", label: "Âge", type: "number", min: 18, max: 120, placeholder: "Ex: 52" },
      { name: "Race", label: "Race", type: "select", options: [{ value: 1, label: "Blanche" }, { value: 2, label: "Noire" }, { value: 3, label: "Autre" }] },
      { name: "Marital_Status", label: "Statut marital", type: "select", options: [{ value: 1, label: "Marié(e)" }, { value: 0, label: "Célibataire / Autre" }] },
    ],
  },
  {
    title: "Caractéristiques tumorales",
    icon: Target,
    fields: [
      { name: "Tumor_Size", label: "Taille de la tumeur (mm)", type: "number", min: 1, max: 200, placeholder: "Ex: 25" },
      { name: "T_Stage", label: "Stade T", type: "select", options: [{ value: 1, label: "T1" }, { value: 2, label: "T2" }, { value: 3, label: "T3" }, { value: 4, label: "T4" }] },
      { name: "N_Stage", label: "Stade N", type: "select", options: [{ value: 0, label: "N0" }, { value: 1, label: "N1" }, { value: 2, label: "N2" }, { value: 3, label: "N3" }] },
      { name: "6th_Stage", label: "Stade clinique (6e éd.)", type: "select", options: [{ value: 1, label: "Stade I" }, { value: 2, label: "Stade IIA" }, { value: 3, label: "Stade IIB" }, { value: 4, label: "Stade IIIA" }, { value: 5, label: "Stade IIIB" }, { value: 6, label: "Stade IIIC" }] },
      { name: "Grade", label: "Grade histologique", type: "select", options: [{ value: 1, label: "Grade 1 (bien différencié)" }, { value: 2, label: "Grade 2 (modérément différencié)" }, { value: 3, label: "Grade 3 (peu différencié)" }, { value: 4, label: "Grade 4 (indifférencié)" }] },
      { name: "A_Stage", label: "Stade anatomique", type: "select", options: [{ value: 1, label: "Localisé" }, { value: 2, label: "Régional" }] },
    ],
  },
  {
    title: "Statuts hormonaux & ganglions",
    icon: FlaskConical,
    fields: [
      { name: "Estrogen_Status", label: "Statut œstrogène (ER)", type: "select", options: [{ value: 1, label: "Positif" }, { value: 0, label: "Négatif" }] },
      { name: "Progesterone_Status", label: "Statut progestérone (PR)", type: "select", options: [{ value: 1, label: "Positif" }, { value: 0, label: "Négatif" }] },
      { name: "Regional_Node_Examined", label: "Ganglions examinés", type: "number", min: 0, max: 100, placeholder: "Ex: 20" },
      { name: "Reginol_Node_Positive", label: "Ganglions positifs", type: "number", min: 0, max: 100, placeholder: "Ex: 5" },
      { name: "notes", label: "Notes cliniques", type: "textarea", placeholder: "Ex: douleur mammaire, antécédents familiaux..." }
    ],
  },
];

const DEFAULT_FORM = {
  Age: "", Race: 1, Marital_Status: 1, Tumor_Size: "", T_Stage: 1,
  N_Stage: 0, "6th_Stage": 1, Grade: 1, A_Stage: 1, Estrogen_Status: 1,
  Progesterone_Status: 1, Regional_Node_Examined: "", Reginol_Node_Positive: "", notes: "",
};

function getRiskStyle(prob) {
  if (prob >= 0.7) return { bg: "#fee2e2", text: "#991b1b", bar: "#ef4444", emoji: "🔴", label: "Risque élevé", gradient: "linear-gradient(135deg, #ef4444, #dc2626)", icon: AlertCircle };
  if (prob >= 0.4) return { bg: "#fef3c7", text: "#92400e", bar: "#f59e0b", emoji: "🟡", label: "Risque modéré", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", icon: Activity };
  return { bg: "#dcfce7", text: "#14532d", bar: "#22c55e", emoji: "🟢", label: "Risque faible", gradient: "linear-gradient(135deg, #22c55e, #16a34a)", icon: Check };
}

export default function PredictionRisque() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    listPatients(0, 200).then(r => setPatients(r.data.patients || [])).catch(() => {});
  }, []);

  const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || p.patient_id?.toLowerCase().includes(patientSearch.toLowerCase()));

  const selectPatient = (p) => {
    setSelectedPatient({ patient_id: p.patient_id, name: p.name });
    setPatientSearch(`${p.name} (${p.patient_id})`);
    setShowDropdown(false);
    if (p.age) setForm(prev => ({ ...prev, Age: p.age }));
  };

  const clearPatient = () => { setSelectedPatient(null); setPatientSearch(""); };
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "number" ? (value === "" ? "" : Number(value)) : value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true); setError(null);
    try {
      const payload = {
        Age: form.Age, Race: form.Race, Marital_Status: form.Marital_Status, Unnamed__3: 0,
        T_Stage: form.T_Stage, N_Stage: form.N_Stage, "6th_Stage": form["6th_Stage"],
        Grade: form.Grade, A_Stage: form.A_Stage, Tumor_Size: form.Tumor_Size,
        Estrogen_Status: form.Estrogen_Status, Progesterone_Status: form.Progesterone_Status,
        Regional_Node_Examined: form.Regional_Node_Examined, Reginol_Node_Positive: form.Reginol_Node_Positive,
        notes: form.notes, sixth_Stage: form["6th_Stage"], ...(selectedPatient ? { patient_id: selectedPatient.patient_id } : {}),
      };
      const res = await predictRisk(payload);
      setResult(res.data);
    } catch (err) { setError(err.message || "Impossible de contacter le serveur."); }
    setLoading(false);
  };

  const reset = () => { setForm(DEFAULT_FORM); setResult(null); setError(null); setStep(0); setSelectedPatient(null); setPatientSearch(""); };
  const riskStyle = result ? getRiskStyle(result.probability) : null;
  const RiskIcon = riskStyle?.icon || Activity;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar - Identique Landing */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,10,16,0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>PathoScan</div><div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 500, textTransform: 'uppercase' }}>Diagnostic IA</div></div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/patients')} style={{ padding: '10px 22px', borderRadius: 10, border: '1.5px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}><Users size={14} style={{ marginRight: 6 }} />Patients</button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,10,16,0.25)' }}>Dashboard</button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 99, background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)', fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 20 }}>
            <Brain size={14} /> PRÉDICTION DE RISQUE · XGBoost
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)', color: 'var(--text1)', letterSpacing: '-1.5px', marginBottom: 16 }}>
            Évaluation du{' '}<span style={{ background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Risque Cancer</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text3)', maxWidth: 550, margin: '0 auto', lineHeight: 1.6 }}>Renseignez les données cliniques en 3 étapes pour une estimation personnalisée</p>
        </motion.div>

        {/* Patient Selector Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <User size={18} color="var(--accent)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text1)', flex: 1 }}>Patient associé</h3>
            {selectedPatient && <button onClick={clearPatient} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--accent)', background: 'rgba(251,113,133,0.1)', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}><X size={12} /> Retirer</button>}
          </div>
          {selectedPatient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>{selectedPatient.name?.charAt(0).toUpperCase()}</div>
              <div><div style={{ fontWeight: 600, color: 'var(--text1)' }}>{selectedPatient.name}</div><div style={{ fontSize: 11, color: 'var(--text4)' }}>{selectedPatient.patient_id}</div></div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-md)' }}>
                <Search size={16} color="var(--text4)" />
                <input type="text" placeholder="Rechercher par nom ou ID patient…" value={patientSearch} onChange={e => { setPatientSearch(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onBlur={() => setTimeout(() => setShowDropdown(false), 150)} style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: 'var(--text1)' }} />
              </div>
              <AnimatePresence>{showDropdown && filteredPatients.length > 0 && (<motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: 4, zIndex: 50, maxHeight: 200, overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>{filteredPatients.map(p => (<div key={p.patient_id} onMouseDown={() => selectPatient(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}><div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'white' }}>{p.name?.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text1)' }}>{p.name}</div><div style={{ fontSize: 11, color: 'var(--text4)' }}>{p.patient_id} · {p.age} ans</div></div></div>))}</motion.div>)}</AnimatePresence>
            </div>
          )}
        </motion.div>

        {!result ? (
          <>
            {/* Steps Indicator */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 32 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, background: i < step ? 'linear-gradient(135deg, #ec4899, #db2777)' : i === step ? 'var(--gradient-dark)' : 'var(--border)', color: i <= step ? '#fff' : 'var(--text4)', border: i < step ? 'none' : `1px solid ${i === step ? 'transparent' : 'var(--border2)'}`, boxShadow: i === step ? '0 0 0 3px rgba(236,72,153,0.2)' : 'none' }}>{i < step ? <Check size={16} /> : i + 1}</div>
                    <span style={{ fontSize: 10, marginTop: 8, textAlign: 'center', color: i === step ? 'var(--accent)' : 'var(--text4)', fontWeight: i === step ? 600 : 400 }}>{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'linear-gradient(135deg, #ec4899, #db2777)' : 'var(--border)', margin: '0 8px', marginBottom: 30 }} />}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gradient-rose)' }} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text1)', margin: 0 }}>Étape {step + 1} sur {STEPS.length} — {STEPS[step].title}</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {STEPS[step].fields.map(field => (
                    <div key={field.name}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text4)', textTransform: 'uppercase', marginBottom: 6 }}>{field.label}</label>
                      {field.type === "select" ? (
                        <select name={field.name} value={form[field.name]} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-md)', color: 'var(--text1)', fontSize: 14, fontFamily: 'inherit' }}>
                          {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} rows={3} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-md)', color: 'var(--text1)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
                      ) : (
                        <input type="number" name={field.name} value={form[field.name]} onChange={handleChange} min={field.min} max={field.max} placeholder={field.placeholder} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-md)', color: 'var(--text1)', fontSize: 14 }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 28 }}>
                  <button onClick={prevStep} disabled={step === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 99, background: 'transparent', border: '1px solid var(--border2)', color: step === 0 ? 'var(--text4)' : 'var(--text2)', fontWeight: 600, fontSize: 14, cursor: step === 0 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /> Précédent</button>
                  {step < STEPS.length - 1 ? (
                    <button onClick={nextStep} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 28px', borderRadius: 99, background: 'var(--gradient-dark)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}>Suivant <ChevronRight size={16} /></button>
                  ) : (
                    <button onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 99, background: 'var(--gradient-dark)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 12px rgba(236,72,153,0.3)' }}>
                      {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Analyse...</> : <><Zap size={16} /> Lancer la prédiction</>}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {error && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20, padding: 14, background: '#fee2e2', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}><AlertCircle size={16} />{error}</motion.div>)}
          </>
        ) : (
          /* Result Card */
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: riskStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><RiskIcon size={36} color={riskStyle.text} /></div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>Résultat de la prédiction</h2>
              <span style={{ padding: '6px 18px', borderRadius: 99, fontSize: 13, fontWeight: 700, background: riskStyle.bg, color: riskStyle.text }}>{riskStyle.label}</span>
            </div>
            {selectedPatient && (<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: 24 }}><div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>{selectedPatient.name?.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 600, color: 'var(--text1)' }}>{selectedPatient.name}</div><div style={{ fontSize: 11, color: 'var(--text4)' }}>{selectedPatient.patient_id}</div></div><span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: 99 }}><Check size={12} /> Enregistré</span></div>)}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text3)' }}><span>Probabilité estimée</span><span style={{ fontWeight: 700, color: riskStyle.text }}>{(result.probability * 100).toFixed(1)}%</span></div>
              <div style={{ height: 10, background: 'var(--bg)', borderRadius: 5, overflow: 'hidden' }}><motion.div initial={{ width: 0 }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: '100%', background: riskStyle.gradient, borderRadius: 5 }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text4)' }}><span>0%</span><span>40%</span><span>70%+</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[{ label: "Verdict", value: result.verdict, icon: Target }, { label: "Confiance", value: result.confidence_label, icon: Shield }, { label: "Probabilité", value: (result.probability * 100).toFixed(2) + "%", icon: TrendingUp }, { label: "Modèle", value: "XGBoost · SEER", icon: Brain }].map(({ label, value, icon: Icon }) => (<div key={label} style={{ padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text4)', marginBottom: 4 }}><Icon size={12} />{label}</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text1)' }}>{value ?? "—"}</div></div>))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: '#fef3c7', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 12, color: '#92400e' }}><Shield size={14} /> Ce résultat est fourni à titre indicatif uniquement et ne remplace pas un diagnostic médical professionnel.</div>
            <button onClick={reset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: 'var(--gradient-dark)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 20px rgba(236,72,153,0.25)' }}>Nouvelle prédiction <ChevronRight size={18} /></button>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}