// PatientDetail.jsx - DESIGN UNIFIED (logique inchangée)
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FlaskConical, AlertCircle, CheckCircle,
  Trash2, Microscope, HeartPulse, ScanLine,
  Calendar, Clock, Activity, User, FileText,
  ChevronDown, ChevronUp, Shield, Target, Zap,
  Image as ImageIcon, BarChart3, Mail, Send,
  CheckCircle2, Loader2, X, Printer, Eye
} from "lucide-react";
import { getPatient, deletePrediction, deleteRiskPrediction, deleteMammoPrediction } from "../utils/api";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8000/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("doctor_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "—";

const InfoBox = ({ label, value, icon: Icon }) => (
  <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 6 }}>
      {Icon && <Icon size={12} />}
      {label}
    </div>
    <div style={{ fontSize: 14, color: 'var(--text1)', fontWeight: 600 }}>{value || "—"}</div>
  </div>
);

const buildReportHTML = (patient, imagePreds, riskPreds, mammoPreds, apiUrl) => {
  // ... (garder exactement la même fonction de génération HTML)
  const date = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  const badgeStyle = (type) => {
    if (type === "danger") return "background:#fee2e2;color:#dc2626;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;";
    if (type === "success") return "background:#dcfce7;color:#16a34a;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;";
    if (type === "warning") return "background:#fef3c7;color:#d97706;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;";
    return "background:#dbeafe;color:#2563eb;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px;";
  };
  const verdictBadge = (verdict, type) => {
    let kind = "success";
    if (type === "idc" && verdict?.includes("Malin")) kind = "danger";
    else if (type === "risk" && verdict === "High Risk") kind = "danger";
    else if (type === "mammo" && verdict === "MASSE") kind = "warning";
    return `<span style="${badgeStyle(kind)}">${verdict || "—"}</span>`;
  };
  const pct = (v) => ((v || 0) * 100).toFixed(1) + "%";
  const sectionStyle = "background:#fdf2f8;border-radius:12px;padding:20px;margin-bottom:18px;border:1px solid rgba(236,72,153,0.12);";
  const tableRowStyle = "border-bottom:1px solid rgba(236,72,153,0.1);";
  const labelCell = "padding:9px 12px;font-weight:700;color:#9d174d;font-size:13px;width:38%;";
  const valueCell = "padding:9px 12px;color:#4a0033;font-size:13px;";
  let idcSection = "";
  if (imagePreds.length > 0) {
    const rows = imagePreds.map((p, i) => `
      <div style="margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Analyse #${i + 1} ${p.filename ? `— ${p.filename}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="${tableRowStyle}"><td style="${labelCell}">Verdict</td><td style="${valueCell}">${verdictBadge(p.verdict, "idc")}</td></tr>
        <tr style="${tableRowStyle}"><td style="${labelCell}">Probabilité</td><td style="${valueCell}"><strong>${pct(p.probability)}</strong></td></tr>
        <tr style="${tableRowStyle}"><td style="${labelCell}">Confiance</td><td style="${valueCell}">${p.confidence || "—"}</td></tr>
        <tr style="${tableRowStyle}"><td style="${labelCell}">Mode</td><td style="${valueCell}">${p.mode === "patch" ? "Patch 50×50" : "Grande image"}</td></tr>
        ${p.image_size ? `<tr style="${tableRowStyle}"><td style="${labelCell}">Dimension</td><td style="${valueCell}">${p.image_size.width}×${p.image_size.height} px</td></tr>` : ""}
        <tr style="${tableRowStyle}"><td style="${labelCell}">Date</td><td style="${valueCell}">${fmt(p.created_at)}</td></tr>
      </table>
      ${p.notes ? `<div style="margin-top:10px;padding:10px 14px;background:white;border-radius:8px;border-left:3px solid #ec4899;font-size:12px;color:#4a0033;"><strong>Note :</strong> ${p.notes}</div>` : ""}
      ${p.image_b64 ? `<div style="margin-top:12px;"><img src="data:image/png;base64,${p.image_b64}" style="max-height:180px;max-width:100%;border-radius:8px;border:1px solid rgba(236,72,153,0.2);" /></div>` : ""}
      </div>
    `).join('<hr style="border:none;border-top:1px dashed rgba(236,72,153,0.2);margin:14px 0;" />');
    idcSection = `<div style="${sectionStyle}"><h3 style="margin:0 0 16px;color:#9d174d;font-size:15px;display:flex;align-items:center;gap:8px;">🔬 Analyses Histopathologiques — IDC<span style="margin-left:auto;background:rgba(236,72,153,0.1);color:#be185d;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${imagePreds.length} analyse(s)</span></h3>${rows}</div>`;
  }
  let riskSection = "";
  if (riskPreds.length > 0) {
    const rows = riskPreds.map((p, i) => {
      const inputRows = p.input_data ? Object.entries(p.input_data).map(([k, v]) => `<tr style="${tableRowStyle}"><td style="${labelCell}">${k.replace(/_/g, " ")}</td><td style="${valueCell}">${v}</td></tr>`).join("") : "";
      return `<div style="margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Analyse #${i + 1}</div><table style="width:100%;border-collapse:collapse;"><tr style="${tableRowStyle}"><td style="${labelCell}">Verdict</td><td style="${valueCell}">${verdictBadge(p.verdict, "risk")}</td></tr><tr style="${tableRowStyle}"><td style="${labelCell}">Probabilité</td><td style="${valueCell}"><strong>${pct(p.probability)}</strong></td></tr>${inputRows}<tr style="${tableRowStyle}"><td style="${labelCell}">Date</td><td style="${valueCell}">${fmt(p.created_at)}</td></tr></table>${p.notes ? `<div style="margin-top:10px;padding:10px 14px;background:white;border-radius:8px;border-left:3px solid #ef4444;font-size:12px;color:#4a0033;"><strong>Note :</strong> ${p.notes}</div>` : ""}</div>`;
    }).join('<hr style="border:none;border-top:1px dashed rgba(236,72,153,0.2);margin:14px 0;" />');
    riskSection = `<div style="${sectionStyle}"><h3 style="margin:0 0 16px;color:#9d174d;font-size:15px;display:flex;align-items:center;gap:8px;">📊 Analyses Risque SEER<span style="margin-left:auto;background:rgba(239,68,68,0.1);color:#dc2626;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${riskPreds.length} analyse(s)</span></h3>${rows}</div>`;
  }
  let mammoSection = "";
  if (mammoPreds.length > 0) {
    const rows = mammoPreds.map((p, i) => `
      <div style="margin-bottom:14px;"><div style="font-size:11px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Analyse #${i + 1} ${p.filename ? `— ${p.filename}` : ""} ${p.breast_side ? `· ${p.breast_side} · ${p.view}` : ""}</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="${tableRowStyle}"><td style="${labelCell}">Verdict</td><td style="${valueCell}">${verdictBadge(p.verdict, "mammo")}</td></tr>
        <tr style="${tableRowStyle}"><td style="${labelCell}">Probabilité</td><td style="${valueCell}"><strong>${pct(p.probability)}</strong></td></tr>
        <tr style="${tableRowStyle}"><td style="${labelCell}">Confiance</td><td style="${valueCell}">${p.confidence || "—"}</td></tr>
        ${p.confidence_score != null ? `<tr style="${tableRowStyle}"><td style="${labelCell}">Score confiance</td><td style="${valueCell}">${(p.confidence_score * 100).toFixed(1)}%</td></tr>` : ""}
        ${p.elapsed_s != null ? `<tr style="${tableRowStyle}"><td style="${labelCell}">Temps traitement</td><td style="${valueCell}">${p.elapsed_s}s</td></tr>` : ""}
        <tr style="${tableRowStyle}"><td style="${labelCell}">Date</td><td style="${valueCell}">${fmt(p.created_at)}</td></tr>
      </table>
      ${p.heatmap_url ? `<div style="margin-top:12px;"><div style="font-size:11px;font-weight:700;color:#9d174d;margin-bottom:6px;">Carte d'activation GradCAM++</div><img src="${apiUrl}${p.heatmap_url}" style="max-height:200px;max-width:100%;border-radius:8px;border:1px solid rgba(245,158,11,0.3);" /></div>` : ""}
      ${p.notes ? `<div style="margin-top:10px;padding:10px 14px;background:white;border-radius:8px;border-left:3px solid #f59e0b;font-size:12px;color:#4a0033;"><strong>Note :</strong> ${p.notes}</div>` : ""}
      </div>
    `).join('<hr style="border:none;border-top:1px dashed rgba(236,72,153,0.2);margin:14px 0;" />');
    mammoSection = `<div style="${sectionStyle}"><h3 style="margin:0 0 16px;color:#9d174d;font-size:15px;display:flex;align-items:center;gap:8px;">📷 Mammographies<span style="margin-left:auto;background:rgba(245,158,11,0.1);color:#d97706;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;">${mammoPreds.length} analyse(s)</span></h3>${rows}</div>`;
  }
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Rapport médical — ${patient.name}</title></head>
<body style="font-family:'Segoe UI',sans-serif;color:#333;background:#fff;margin:0;padding:0;">
  <div style="max-width:720px;margin:0 auto;padding:32px 24px;">
    <div style="background:linear-gradient(135deg,#ec4899,#db2777,#be185d);border-radius:16px;padding:32px;margin-bottom:24px;color:white;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
        <div style="width:54px;height:54px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;flex-shrink:0;">${patient.name.charAt(0).toUpperCase()}</div>
        <div><div style="font-size:22px;font-weight:800;margin-bottom:4px;">${patient.name}</div><div style="opacity:0.85;font-size:13px;">${patient.patient_id} · ${patient.age} ans · ${patient.gender || "—"}</div>${patient.doctor_name ? `<div style="margin-top:6px;display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">👨‍⚕️ Médecin traitant : ${patient.doctor_name}${patient.doctor_email ? `<span style="opacity:0.8;">— ${patient.doctor_email}</span>` : ""}</div>` : ""}</div>
        <div style="margin-left:auto;text-align:right;"><div style="font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:.08em;">Rapport médical</div><div style="font-size:12px;margin-top:4px;">${date}</div></div>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:10px;padding:12px 16px;display:flex;gap:24px;flex-wrap:wrap;">
        <div style="text-align:center;"><div style="font-size:22px;font-weight:800;">${imagePreds.length + riskPreds.length + mammoPreds.length}</div><div style="font-size:11px;opacity:0.85;">Total analyses</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:800;">${imagePreds.filter(p => p.verdict?.includes("Malin")).length}</div><div style="font-size:11px;opacity:0.85;">IDC Malins</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:800;">${riskPreds.filter(p => p.verdict === "High Risk").length}</div><div style="font-size:11px;opacity:0.85;">Hauts risques</div></div>
        <div style="text-align:center;"><div style="font-size:22px;font-weight:800;">${mammoPreds.filter(p => p.verdict === "MASSE").length}</div><div style="font-size:11px;opacity:0.85;">Masses détectées</div></div>
      </div>
    </div>
    ${patient.notes ? `<div style="${sectionStyle}"><h3 style="margin:0 0 10px;color:#9d174d;font-size:15px;">📝 Notes cliniques</h3><p style="margin:0;color:#4a0033;font-size:14px;line-height:1.6;">${patient.notes}</p></div>` : ""}
    ${idcSection}
    ${riskSection}
    ${mammoSection}
    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid rgba(236,72,153,0.15);"><div style="font-size:12px;color:#be185d;opacity:0.7;line-height:1.6;">Ce rapport est généré automatiquement par le système d'aide au diagnostic.<br/>Il ne remplace pas l'avis clinique du médecin traitant.<br/><strong>Confidentiel — usage médical uniquement</strong></div></div>
  </div>
</body>
</html>`;
};

export default function PatientDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("idc");
  const [selected, setSelected] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailStatus, setEmailStatus] = useState("idle");
  const [previewMode, setPreviewMode] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [reminderEmail, setReminderEmail] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderNotes, setReminderNotes] = useState("");
  const [reminderStatus, setReminderStatus] = useState("idle");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const load = () => {
    setLoading(true);
    getPatient(id).then((r) => { setData(r.data); setEmailAddress(r.data?.patient?.email || ""); }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleDelete = async (predId, type) => {
    if (!confirm("⚠️ Supprimer cette analyse définitivement ?")) return;
    try {
      if (type === "idc") await deletePrediction(predId);
      if (type === "risk") await deleteRiskPrediction(predId);
      if (type === "mammo") await deleteMammoPrediction(predId);
      setSelected(null);
      load();
    } catch (e) { console.error(e); }
  };

  const handleSendReport = async () => {
    if (!emailAddress) return;
    setEmailStatus("sending");
    try {
      const { patient, image_predictions = [], risk_predictions = [], mammo_predictions = [] } = data;
      const reportHtml = buildReportHTML(patient, image_predictions, risk_predictions, mammo_predictions, API_URL);
      await API.patch(`/patients/${id}`, { email: emailAddress });
      const response = await API.post(`/patients/${id}/send-report`, { email: emailAddress, report_html: reportHtml, patient_name: patient.name });
      if (response.data.success === false) { setEmailStatus("error"); return; }
      setEmailStatus("sent");
      setTimeout(() => { setEmailModal(false); setEmailStatus("idle"); setPreviewMode(false); }, 3000);
    } catch (e) { console.error(e); setEmailStatus("error"); }
  };

  const handleSendReminder = async () => {
    if (!reminderDate || !reminderTime || !reminderEmail) return;
    setReminderStatus("sending");
    try {
      const { patient } = data;
      await API.patch(`/patients/${id}`, { email: reminderEmail });
      const response = await API.post(`/patients/${id}/send-reminder`, { email: reminderEmail, patient_name: patient.name, doctor_name: patient.doctor_name || "Votre médecin", hospital: patient.hospital || "", consultation_date: reminderDate, consultation_time: reminderTime, notes: reminderNotes });
      if (response.data.success === false) { setReminderStatus("error"); return; }
      setReminderStatus("sent");
      setTimeout(() => { setReminderModal(false); setReminderStatus("idle"); setReminderDate(""); setReminderTime(""); setReminderNotes(""); setReminderEmail(""); }, 3000);
    } catch (e) { console.error(e); setReminderStatus("error"); }
  };

  const openPreview = () => {
    const { patient, image_predictions = [], risk_predictions = [], mammo_predictions = [] } = data;
    const html = buildReportHTML(patient, image_predictions, risk_predictions, mammo_predictions, API_URL);
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  };
  
  const handleDownloadPDF = async () => {
  try {
    const token = localStorage.getItem("doctor_token");
    const response = await fetch(
      `${API_URL}/api/patients/${patient.patient_id}/report-pdf`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error("Erreur génération PDF");
    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `rapport_${patient.patient_id}_${new Date().toISOString().slice(0,10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("Erreur lors du téléchargement du PDF");
  }
};
  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}><Activity size={48} color="var(--accent)" /></motion.div>
      <p style={{ color: 'var(--text3)' }}>Chargement du dossier patient...</p>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
      <AlertCircle size={48} color="var(--accent)" /><h3 style={{ color: 'var(--text1)' }}>Patient introuvable</h3>
      <button onClick={() => nav("/patients")} style={{ padding: '10px 24px', borderRadius: 99, border: 'none', background: 'var(--gradient-dark)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}><ArrowLeft size={16} style={{ marginRight: 8 }} />Retour à la liste</button>
    </div>
  );

  const { patient, image_predictions = [], risk_predictions = [], mammo_predictions = [] } = data;
  const malins = image_predictions.filter((p) => p.verdict?.includes("Malin")).length;
  const highRisk = risk_predictions.filter((p) => p.verdict === "High Risk").length;
  const masses = mammo_predictions.filter((p) => p.verdict === "MASSE").length;
  const totalAnalyses = image_predictions.length + risk_predictions.length + mammo_predictions.length;

  const statsCards = [
    { label: "Total analyses", value: totalAnalyses, icon: BarChart3, color: "#8b5cf6" },
    { label: "IDC Malins", value: malins, icon: AlertCircle, color: malins > 0 ? "#ef4444" : "#22c55e" },
    { label: "Hauts risques", value: highRisk, icon: Shield, color: highRisk > 0 ? "#ef4444" : "#22c55e" },
    { label: "Masses détectées", value: masses, icon: Target, color: masses > 0 ? "#f59e0b" : "#3b82f6" },
  ];

  const tabs = [
    { key: "idc", label: "Histopathologie", Icon: Microscope, count: image_predictions.length, color: "#ec4899" },
    { key: "risk", label: "Risque SEER", Icon: HeartPulse, count: risk_predictions.length, color: "#ef4444" },
    { key: "mammo", label: "Mammographie", Icon: ScanLine, count: mammo_predictions.length, color: "#f59e0b" },
  ];

  const renderIDC = (pred, i) => {
    const isMalin = pred.verdict?.includes("Malin");
    const isOpen = selected === pred._id;
    return (
      <motion.div key={pred._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 6 }} onClick={() => setSelected(isOpen ? null : pred._id)} style={{ background: 'var(--panel)', border: `1px solid ${isOpen ? (isMalin ? "#ef4444" : "#22c55e") : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-card)', transition: 'all 0.2s' }}>
        <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${isMalin ? "#ef4444" : "#22c55e"}, ${isMalin ? "#dc2626" : "#16a34a"})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isMalin ? <AlertCircle size={20} color="white" /> : <CheckCircle size={20} color="white" />}</div><div><div style={{ fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>{pred.filename || "Image histopathologie"}</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)' }}><Clock size={12} />{fmt(pred.created_at)}</div></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ textAlign: 'right' }}><div style={{ fontSize: 20, fontWeight: 800, color: isMalin ? "#ef4444" : "#22c55e" }}>{((pred.probability || 0) * 100).toFixed(1)}%</div><span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `rgba(${isMalin ? "239,68,68" : "34,197,94"},0.1)`, color: isMalin ? "#ef4444" : "#22c55e" }}>{pred.confidence}</span></div><button onClick={(e) => { e.stopPropagation(); handleDelete(pred._id, "idc"); }} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>{isOpen ? <ChevronUp size={18} color="var(--text4)" /> : <ChevronDown size={18} color="var(--text4)" />}</div>
        </div>
        <AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ borderTop: '1px solid var(--border)', padding: 18, background: 'var(--bg)' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}><InfoBox label="Verdict" value={pred.verdict} icon={Target} /><InfoBox label="Mode" value={pred.mode === "patch" ? "Patch 50×50" : "Grande image"} icon={ImageIcon} /><InfoBox label="Taille" value={pred.image_size ? `${pred.image_size.width}×${pred.image_size.height}` : "—"} icon={BarChart3} /></div>{pred.notes && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--panel)', borderRadius: 'var(--radius-md)', marginTop: 12 }}><FileText size={14} /><span style={{ fontSize: 13, color: 'var(--text2)' }}>{pred.notes}</span></div>}{pred.image_b64 && <div style={{ marginTop: 12 }}><img src={`data:image/png;base64,${pred.image_b64}`} alt="Histopathologie" style={{ maxHeight: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} /></div>}</motion.div>)}</AnimatePresence>
      </motion.div>
    );
  };

  const renderRisk = (pred, i) => {
    const isHigh = pred.verdict === "High Risk";
    const isOpen = selected === pred._id;
    return (
      <motion.div key={pred._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 6 }} onClick={() => setSelected(isOpen ? null : pred._id)} style={{ background: 'var(--panel)', border: `1px solid ${isOpen ? (isHigh ? "#ef4444" : "#22c55e") : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${isHigh ? "#ef4444" : "#22c55e"}, ${isHigh ? "#dc2626" : "#16a34a"})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><HeartPulse size={20} color="white" /></div><div><div style={{ fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>Analyse Risque SEER</div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)' }}><Clock size={12} />{fmt(pred.created_at)}</div></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ textAlign: 'right' }}><div style={{ fontSize: 20, fontWeight: 800, color: isHigh ? "#ef4444" : "#22c55e" }}>{((pred.probability || 0) * 100).toFixed(1)}%</div><span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `rgba(${isHigh ? "239,68,68" : "34,197,94"},0.1)`, color: isHigh ? "#ef4444" : "#22c55e" }}>{pred.verdict}</span></div><button onClick={(e) => { e.stopPropagation(); handleDelete(pred._id, "risk"); }} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>{isOpen ? <ChevronUp size={18} color="var(--text4)" /> : <ChevronDown size={18} color="var(--text4)" />}</div></div>
        <AnimatePresence>{isOpen && pred.input_data && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ borderTop: '1px solid var(--border)', padding: 18, background: 'var(--bg)' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>{Object.entries(pred.input_data).map(([k, v]) => (<InfoBox key={k} label={k.replace(/_/g, " ")} value={String(v)} />))}</div>{pred.notes && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--panel)', borderRadius: 'var(--radius-md)', marginTop: 12 }}><FileText size={14} /><span style={{ fontSize: 13, color: 'var(--text2)' }}>{pred.notes}</span></div>}</motion.div>)}</AnimatePresence>
      </motion.div>
    );
  };

  const renderMammo = (pred, i) => {
    const isMasse = pred.verdict === "MASSE";
    const isOpen = selected === pred._id;
    return (
      <motion.div key={pred._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ x: 6 }} onClick={() => setSelected(isOpen ? null : pred._id)} style={{ background: 'var(--panel)', border: `1px solid ${isOpen ? (isMasse ? "#f59e0b" : "#3b82f6") : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${isMasse ? "#f59e0b" : "#3b82f6"}, ${isMasse ? "#d97706" : "#2563eb"})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ScanLine size={20} color="white" /></div><div><div style={{ fontWeight: 700, color: 'var(--text1)', marginBottom: 4 }}>{pred.filename || "Mammogramme"}<span style={{ fontSize: 11, color: 'var(--text4)', marginLeft: 6 }}>· {pred.breast_side} · {pred.view}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text4)' }}><Clock size={12} />{fmt(pred.created_at)}</div></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ textAlign: 'right' }}><div style={{ fontSize: 20, fontWeight: 800, color: isMasse ? "#f59e0b" : "#3b82f6" }}>{((pred.probability || 0) * 100).toFixed(1)}%</div><span style={{ padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `rgba(${isMasse ? "245,158,11" : "59,130,246"},0.1)`, color: isMasse ? "#f59e0b" : "#3b82f6" }}>{pred.verdict}</span></div><button onClick={(e) => { e.stopPropagation(); handleDelete(pred._id, "mammo"); }} style={{ padding: 8, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>{isOpen ? <ChevronUp size={18} color="var(--text4)" /> : <ChevronDown size={18} color="var(--text4)" />}</div></div>
        <AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ borderTop: '1px solid var(--border)', padding: 18, background: 'var(--bg)' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}><InfoBox label="Confiance" value={pred.confidence} /><InfoBox label="Score" value={pred.confidence_score != null ? (pred.confidence_score * 100).toFixed(1) + "%" : "—"} /><InfoBox label="Temps" value={pred.elapsed_s != null ? `${pred.elapsed_s}s` : "—"} /></div>{pred.heatmap_url && <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text4)', marginBottom: 8 }}>Carte d'activation GradCAM++</div><img src={`${API_URL}${pred.heatmap_url}`} alt="GradCAM++" style={{ maxHeight: 200, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} /></div>}{pred.notes && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: 12, background: 'var(--panel)', borderRadius: 'var(--radius-md)', marginTop: 12 }}><FileText size={14} /><span style={{ fontSize: 13, color: 'var(--text2)' }}>{pred.notes}</span></div>}</motion.div>)}</AnimatePresence>
      </motion.div>
    );
  };

  const activeList = tab === "idc" ? image_predictions : tab === "risk" ? risk_predictions : mammo_predictions;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back Button */}
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: -5 }} onClick={() => nav("/patients")} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, background: 'var(--panel)', border: '1px solid var(--border2)', color: 'var(--text2)', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}><ArrowLeft size={16} />Retour aux patients</motion.button>

        {/* Patient Header Card */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white', boxShadow: '0 8px 20px rgba(236,72,153,0.3)' }}>{patient.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}><div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(251,113,133,0.1)', borderRadius: 99, fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>{patient.patient_id}</div><h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text1)', margin: 0 }}>{patient.name}</h1><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text3)' }}><User size={14} /> {patient.age} ans</span><span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text3)' }}>{patient.gender}</span>{patient.doctor_name && <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#15803d', background: '#f0fdf4', padding: '4px 10px', borderRadius: 99 }}>👨‍⚕️ {patient.doctor_name}</span>}</div></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={handleDownloadPDF}
  style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 20px', borderRadius: 'var(--radius-md)',
    background: 'linear-gradient(135deg, #059669, #047857)',
    border: 'none', color: '#fff', fontWeight: 700,
    fontSize: 14, cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(5,150,105,0.3)'
  }}
>
  <Printer size={16} />PDF
</motion.button>
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setEmailModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-dark)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}><Mail size={16} />Rapport</motion.button>
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setReminderModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}><Calendar size={16} />Rappel</motion.button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>{statsCards.map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }} style={{ textAlign: 'center', padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}><div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}><stat.icon size={18} color={stat.color} /></div><div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div><div style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 600 }}>{stat.label}</div></motion.div>))}</div>
        </motion.div>

        {/* Notes Section */}
        {(patient.notes || image_predictions.some(p => p.notes) || risk_predictions.some(p => p.notes) || mammo_predictions.some(p => p.notes)) && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, boxShadow: 'var(--shadow-card)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}><FileText size={18} color="var(--accent)" /><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text1)' }}>Notes cliniques</h3></div>{patient.notes && (<div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 12, borderLeft: `3px solid var(--accent)` }}><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>Dossier patient</div><p style={{ fontSize: 14, color: 'var(--text2)', margin: 0 }}>{patient.notes}</p></div>)}</motion.div>)}

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>{tabs.map(({ key, label, Icon, count, color }) => (<motion.button key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTab(key); setSelected(null); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 99, background: tab === key ? color : 'var(--panel)', border: tab === key ? 'none' : '1px solid var(--border2)', color: tab === key ? '#fff' : 'var(--text2)', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: tab === key ? `0 4px 15px ${color}40` : 'none' }}><Icon size={16} />{label}<span style={{ background: tab === key ? 'rgba(255,255,255,0.2)' : 'rgba(236,72,153,0.1)', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{count}</span></motion.button>))}</motion.div>

        {/* Analyses List */}
        {activeList.length === 0 ? (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--panel)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border2)' }}><div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(236,72,153,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><FlaskConical size={40} color="var(--accent)" /></div><h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>Aucune analyse</h3><p style={{ fontSize: 14, color: 'var(--text3)' }}>Effectuez une analyse pour cette modalité</p></motion.div>) : (<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{activeList.map((pred, i) => { if (tab === "idc") return renderIDC(pred, i); if (tab === "risk") return renderRisk(pred, i); return renderMammo(pred, i); })}</div>)}
      </div>

      {/* Email Modal - garder la même structure mais avec styles inline */}
      <AnimatePresence>{emailModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => emailStatus !== "sending" && (setEmailModal(false), setEmailStatus("idle"))} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,10,16,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}><motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel)', borderRadius: 'var(--radius-lg)', width: 500, maxWidth: '100%', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>{emailStatus === "sent" ? (<div style={{ padding: '40px 32px', textAlign: 'center' }}><div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle2 size={48} color="#16a34a" /></div><h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>Rapport envoyé !</h3><p style={{ fontSize: 14, color: 'var(--text3)' }}>Le rapport a été envoyé à <strong>{emailAddress}</strong></p></div>) : (<><div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} color="white" /></div><div><h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text1)', margin: 0 }}>Envoyer le rapport</h2><p style={{ fontSize: 12, color: 'var(--text4)', margin: '2px 0 0' }}>Rapport médical complet par email</p></div></div><button onClick={() => setEmailModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(251,113,133,0.1)', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}><X size={16} /></button></div><div style={{ padding: 24 }}><div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>{patient.name.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 700, color: 'var(--text1)' }}>{patient.name}</div><div style={{ fontSize: 12, color: 'var(--text4)' }}>{patient.patient_id} · {patient.age} ans</div></div><div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, background: 'var(--gradient-rose)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totalAnalyses}</div><div style={{ fontSize: 10, color: 'var(--text4)' }}>analyses</div></div></div><div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Email du patient</label><input type="email" placeholder="patient@email.com" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border2)', fontSize: 14, color: 'var(--text1)' }} /></div>{emailStatus === "error" && (<div style={{ padding: 12, background: '#fee2e2', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>Échec de l'envoi. Vérifiez l'adresse email.</div>)}</div><div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}><button onClick={openPreview} style={{ padding: '10px 20px', borderRadius: 99, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer' }}><Eye size={14} style={{ marginRight: 6 }} />Aperçu</button>
      <button
    onClick={handleDownloadPDF}
    style={{
      padding: '10px 20px', borderRadius: 99,
      border: '1px solid var(--border2)', background: 'transparent',
      color: 'var(--text2)', fontWeight: 600, cursor: 'pointer'
    }}
  >
    <Printer size={14} style={{ marginRight: 6 }} />Télécharger PDF
  </button>
      <button onClick={handleSendReport} disabled={!emailAddress || emailStatus === "sending"} style={{ padding: '10px 24px', borderRadius: 99, border: 'none', background: 'var(--gradient-dark)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: !emailAddress || emailStatus === "sending" ? 0.6 : 1 }}>{emailStatus === "sending" ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Send size={14} style={{ marginRight: 6 }} />Envoyer</>}</button></div></>)}</motion.div></motion.div>)}</AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>{reminderModal && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => reminderStatus !== "sending" && setReminderModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,10,16,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}><motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel)', borderRadius: 'var(--radius-lg)', width: 500, maxWidth: '100%', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>{reminderStatus === "sent" ? (<div style={{ padding: '40px 32px', textAlign: 'center' }}><div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}><CheckCircle2 size={48} color="#16a34a" /></div><h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text1)', marginBottom: 8 }}>Rappel envoyé !</h3><p style={{ fontSize: 14, color: 'var(--text3)' }}>Rappel envoyé à <strong>{reminderEmail}</strong><br/>Consultation le <strong>{reminderDate}</strong> à <strong>{reminderTime}</strong></p></div>) : (<><div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} color="white" /></div><div><h2 style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Rappel consultation</h2><p style={{ fontSize: 12, color: 'var(--text4)', margin: '2px 0 0' }}>Envoyer un rappel par email</p></div></div><button onClick={() => setReminderModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: 'none', cursor: 'pointer', color: '#8b5cf6' }}><X size={16} /></button></div><div style={{ padding: 24 }}><div style={{ marginBottom: 20, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>{patient.name.charAt(0).toUpperCase()}</div><div><div style={{ fontWeight: 700, color: 'var(--text1)' }}>{patient.name}</div><div style={{ fontSize: 12, color: 'var(--text4)' }}>{patient.patient_id} · {patient.age} ans</div></div></div><div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, display: 'block' }}>Email du patient *</label><input type="email" placeholder="patient@email.com" value={reminderEmail} onChange={(e) => setReminderEmail(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border2)', fontSize: 14, color: 'var(--text1)' }} /></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}><div><label style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, display: 'block' }}>Date *</label><input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border2)', fontSize: 14, color: 'var(--text1)' }} /></div><div><label style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, display: 'block' }}>Heure *</label><input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border2)', fontSize: 14, color: 'var(--text1)' }} /></div></div><div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 6, display: 'block' }}>Note (optionnel)</label><textarea rows={3} placeholder="Instructions supplémentaires..." value={reminderNotes} onChange={(e) => setReminderNotes(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border2)', fontSize: 14, color: 'var(--text1)', fontFamily: 'inherit', resize: 'vertical' }} /></div>{reminderStatus === "error" && (<div style={{ padding: 12, background: '#fee2e2', borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 13 }}>Échec de l'envoi. Vérifiez l'email.</div>)}</div><div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}><button onClick={() => setReminderModal(false)} style={{ padding: '10px 20px', borderRadius: 99, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontWeight: 600, cursor: 'pointer' }}>Annuler</button><button onClick={handleSendReminder} disabled={!reminderDate || !reminderTime || !reminderEmail || reminderStatus === "sending"} style={{ padding: '10px 24px', borderRadius: 99, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: !reminderDate || !reminderTime || !reminderEmail || reminderStatus === "sending" ? 0.6 : 1 }}>{reminderStatus === "sending" ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Send size={14} style={{ marginRight: 6 }} />Envoyer le rappel</>}</button></div></>)}</motion.div></motion.div>)}</AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}