// Profile.jsx — PathoScan · connecté à l'API réelle
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle,
  AlertCircle, Microscope, Shield, Award, Edit3, Camera,
  ChevronRight, Activity, Building2, GraduationCap, Hash, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Config API ────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("doctor_token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, icon: Icon, type = "text", value, onChange, placeholder, readOnly, rightSlot }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, fontWeight: 700, color: "var(--text4)",
      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
    }}>
      <Icon size={12} /> {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          width: "100%", padding: "11px 14px",
          paddingRight: rightSlot ? 46 : 14,
          background: readOnly ? "var(--bg)" : "var(--panel)",
          border: "1.5px solid var(--border2)",
          borderRadius: "var(--radius-md)",
          color: readOnly ? "var(--text3)" : "var(--text1)",
          fontSize: 14, fontFamily: "inherit",
          outline: "none", transition: "border 0.2s, box-shadow 0.2s",
          boxSizing: "border-box",
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={e => { if (!readOnly) { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,72,0.08)"; } }}
        onBlur={e => { e.target.style.borderColor = "var(--border2)"; e.target.style.boxShadow = "none"; }}
      />
      {rightSlot && (
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
          {rightSlot}
        </div>
      )}
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 16, scale: 0.95 }}
    style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 999,
      display: "flex", alignItems: "center", gap: 12,
      padding: "14px 22px", borderRadius: "var(--radius-md)",
      background: type === "success" ? "#f6ffed" : "#fff1f0",
      border: `1.5px solid ${type === "success" ? "#b7eb8f" : "#ffccc7"}`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      fontSize: 14, fontWeight: 600,
      color: type === "success" ? "#389e0d" : "#cf1322",
    }}
  >
    {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {message}
  </motion.div>
);

// ── Section Card ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{
      background: "var(--panel)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: 28,
      boxShadow: "var(--shadow-card)", marginBottom: 24,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "rgba(225,29,72,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color="var(--accent)" />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "var(--text1)" }}>
        {title}
      </h3>
    </div>
    {children}
  </motion.div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function Profile() {
  const navigate = useNavigate();

  // — Doctor data
  const [doctor, setDoctor]           = useState(null);
  const [loadingProfile, setLoading]  = useState(true);

  // — Edit info
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm]       = useState({});
  const [savingInfo, setSavingInfo]   = useState(false);

  // — Password
  const [pwForm, setPwForm]   = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw]   = useState({ current: false, next: false, confirm: false });
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // — Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);

  // — Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Charger le profil ───────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("doctor_token");
    if (!token) { navigate("/login"); return; }

    fetch(`${API_BASE}/doctor/me`, { headers: authHeaders() })
      .then(async r => {
        if (r.status === 401) { navigate("/login"); return; }
        if (!r.ok) throw new Error("Erreur chargement profil");
        const data = await r.json();

        // "name" → firstName + lastName
        const parts     = (data.name || "").trim().split(" ");
        const firstName = parts[0] || "";
        const lastName  = parts.slice(1).join(" ") || "";

        const normalized = {
          ...data, firstName, lastName,
          specialty:        data.specialty        || "",
          hospital:         data.hospital         || "",
          phone:            data.phone            || "",
          cnom_number:      data.cnom_number      || "",
          years_experience: data.years_experience || 0,
          city:             data.city             || "",
        };
        setDoctor(normalized);
        setInfoForm(normalized);
      })
      .catch(() => showToast("Impossible de charger le profil", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ── Sauvegarder les infos ───────────────────────────────────────────────────
  const handleSaveInfo = async () => {
  setSavingInfo(true);
  try {
    const payload = {
      name:             `${infoForm.firstName} ${infoForm.lastName}`.trim(),
      email:            infoForm.email,
      phone:            infoForm.phone,
      specialty:        infoForm.specialty,
      hospital:         infoForm.hospital,
      city:             infoForm.city,
      years_experience: infoForm.years_experience,
      cnom_number:      infoForm.cnom_number,
    };
    const res = await fetch(`${API_BASE}/doctor/me`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur lors de la sauvegarde");
    }
    const updated = await res.json();
    const parts = (updated.name || "").trim().split(" ");
    const norm  = { ...updated, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
    setDoctor(norm);
    setInfoForm(norm);

    // ✅ Mettre à jour localStorage → DoctorLayout se synchronise
    const stored = JSON.parse(localStorage.getItem("doctor_user") || "{}");
    localStorage.setItem("doctor_user", JSON.stringify({
      ...stored,
      name:      updated.name,
      specialty: updated.specialty,
      hospital:  updated.hospital,
    }));

    // ✅ Forcer le re-render du DoctorLayout en émettant un event
    window.dispatchEvent(new Event("doctor_profile_updated"));

    setEditingInfo(false);
    showToast("Profil mis à jour avec succès");
  } catch (e) {
    showToast(e.message || "Erreur lors de la sauvegarde", "error");
  } finally {
    setSavingInfo(false);
  }
};
  // ── Changer le mot de passe ─────────────────────────────────────────────────
  const handleSavePassword = async () => {
    setPwError("");
    if (!pwForm.current)          { setPwError("Veuillez saisir votre mot de passe actuel"); return; }
    if (pwForm.next.length < 8)   { setPwError("Le nouveau mot de passe doit contenir au moins 8 caractères"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Les mots de passe ne correspondent pas"); return; }

    setSavingPw(true);
    try {
      const res = await fetch(`${API_BASE}/doctor/password`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.next }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur lors du changement de mot de passe");
      }
      setPwForm({ current: "", next: "", confirm: "" });
      showToast("Mot de passe modifié avec succès");
    } catch (e) {
      setPwError(e.message || "Erreur serveur");
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  // ── Indicateur de force ─────────────────────────────────────────────────────
  const pwStrength = (() => {
    const len = pwForm.next.length;
    if (len === 0) return null;
    if (len < 8)   return { level: 0, label: "Trop court", color: "#ef4444" };
    if (len < 12)  return { level: 1, label: "Faible",     color: "#f97316" };
    if (len < 16)  return { level: 2, label: "Moyen",      color: "#eab308" };
    return           { level: 3, label: "Fort",       color: "#22c55e" };
  })();

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "var(--text3)" }}>
          <Loader2 size={40} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Chargement du profil…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!doctor) return null;

  const initials = `${(doctor.firstName || "?")[0]}${(doctor.lastName || "?")[0]}`.toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Navbar ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "var(--gradient-dark)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(26,10,16,0.2)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text1)" }}>PathoScan</div>
            <div style={{ fontSize: 10, color: "var(--text4)", fontWeight: 500, textTransform: "uppercase" }}>Diagnostic IA</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/analyze")} style={{
            padding: "10px 22px", borderRadius: 10, border: "1.5px solid var(--border2)",
            background: "transparent", color: "var(--text2)", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
          }}>Analyser</button>
          <button onClick={() => navigate("/dashboard")} style={{
            padding: "10px 22px", borderRadius: 10, border: "none",
            background: "var(--gradient-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(26,10,16,0.25)",
          }}>Dashboard</button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 99,
            background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.15)",
            fontSize: 12.5, fontWeight: 600, color: "var(--accent)", marginBottom: 20,
          }}>
            <User size={14} /> MON PROFIL
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            fontSize: "clamp(30px,4vw,44px)", color: "var(--text1)",
            letterSpacing: "-1px", marginBottom: 10,
          }}>
            Paramètres du{" "}
            <span style={{ background: "var(--gradient-rose)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              compte médecin
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text3)" }}>
            Gérez vos informations personnelles, professionnelles et la sécurité de votre compte.
          </p>
        </motion.div>

        {/* ── Hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: "var(--panel)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: 28,
            boxShadow: "var(--shadow-card)", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: avatarPreview ? "transparent" : "var(--gradient-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, fontWeight: 800, color: "#fb7185",
              fontFamily: "var(--font-display)", overflow: "hidden",
              boxShadow: "0 8px 24px rgba(26,10,16,0.2)",
              border: "3px solid var(--border2)",
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>
            <label htmlFor="avatar-upload" style={{
              position: "absolute", bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: "50%",
              background: "var(--gradient-dark)", border: "2.5px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              <Camera size={13} color="#fb7185" />
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          </div>

          {/* Identité */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: "var(--text1)" }}>
              Dr. {doctor.firstName} {doctor.lastName}
            </div>
            <div style={{ fontSize: 14, color: "var(--text3)", marginTop: 4, marginBottom: 12 }}>
              {doctor.specialty || "—"} · {doctor.hospital || "—"}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: Award,    label: doctor.status === "approved" ? "Compte approuvé" : doctor.status },
                { icon: Hash,     label: doctor.cnom_number ? `CNOM ${doctor.cnom_number}` : "CNOM non renseigné" },
                { icon: Activity, label: "Compte actif" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 10px", borderRadius: 99,
                  background: "rgba(225,29,72,0.06)", border: "1px solid rgba(225,29,72,0.12)",
                  fontSize: 12, fontWeight: 600, color: "var(--text2)",
                }}>
                  <Icon size={11} color="var(--accent)" /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bouton Modifier */}
          <button
            onClick={() => { setEditingInfo(!editingInfo); setInfoForm({ ...doctor }); }}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: "var(--radius-md)",
              border: editingInfo ? "1.5px solid var(--border2)" : "none",
              background: editingInfo ? "transparent" : "var(--gradient-dark)",
              color: editingInfo ? "var(--text2)" : "#fff",
              fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              boxShadow: editingInfo ? "none" : "0 4px 14px rgba(26,10,16,0.2)",
            }}
          >
            <Edit3 size={15} />
            {editingInfo ? "Annuler" : "Modifier"}
          </button>
        </motion.div>

        {/* ── Infos personnelles ── */}
        <SectionCard title="Informations personnelles" icon={User} delay={0.2}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <Field label="Prénom" icon={User}
              value={editingInfo ? infoForm.firstName : doctor.firstName}
              onChange={e => setInfoForm(f => ({ ...f, firstName: e.target.value }))}
              placeholder="Votre prénom" readOnly={!editingInfo} />
            <Field label="Nom" icon={User}
              value={editingInfo ? infoForm.lastName : doctor.lastName}
              onChange={e => setInfoForm(f => ({ ...f, lastName: e.target.value }))}
              placeholder="Votre nom" readOnly={!editingInfo} />
            <Field label="Adresse e-mail" icon={Mail} type="email"
              value={editingInfo ? infoForm.email : doctor.email}
              onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@hopital.dz" readOnly={!editingInfo} />
            <Field label="Téléphone" icon={Phone}
              value={editingInfo ? (infoForm.phone || "") : (doctor.phone || "")}
              onChange={e => setInfoForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+213 6 00 00 00 00" readOnly={!editingInfo} />
          </div>

          <AnimatePresence>
            {editingInfo && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                onClick={handleSaveInfo} disabled={savingInfo}
                style={{
                  marginTop: 8, width: "100%", padding: "13px",
                  borderRadius: "var(--radius-md)", border: "none",
                  background: "var(--gradient-dark)", color: "#fff",
                  fontWeight: 700, fontSize: 14.5,
                  cursor: savingInfo ? "not-allowed" : "pointer",
                  opacity: savingInfo ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 6px 20px rgba(26,10,16,0.22)",
                }}
              >
                {savingInfo
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enregistrement…</>
                  : <><Save size={16} /> Enregistrer les modifications <ChevronRight size={16} /></>}
              </motion.button>
            )}
          </AnimatePresence>
        </SectionCard>

        {/* ── Infos professionnelles ── */}
        <SectionCard title="Informations professionnelles" icon={GraduationCap} delay={0.25}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <Field label="Spécialité" icon={Microscope}
              value={editingInfo ? (infoForm.specialty || "") : (doctor.specialty || "")}
              onChange={e => setInfoForm(f => ({ ...f, specialty: e.target.value }))}
              placeholder="Anatomopathologie" readOnly={!editingInfo} />
            <Field label="Établissement" icon={Building2}
              value={editingInfo ? (infoForm.hospital || "") : (doctor.hospital || "")}
              onChange={e => setInfoForm(f => ({ ...f, hospital: e.target.value }))}
              placeholder="CHU / Clinique" readOnly={!editingInfo} />
            <Field label="Numéro CNOM" icon={Hash}
              value={editingInfo ? (infoForm.cnom_number || "") : (doctor.cnom_number || "")}
              onChange={e => setInfoForm(f => ({ ...f, cnom_number: e.target.value }))}
              placeholder="Numéro d'ordre" readOnly={!editingInfo} />
            <Field label="Ville" icon={Building2}
              value={editingInfo ? (infoForm.city || "") : (doctor.city || "")}
              onChange={e => setInfoForm(f => ({ ...f, city: e.target.value }))}
              placeholder="Alger, Oran, Constantine…" readOnly={!editingInfo} />
          </div>
        </SectionCard>

        {/* ── Sécurité ── */}
        <SectionCard title="Sécurité du compte" icon={Shield} delay={0.3}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px" }}>
            <Field label="Mot de passe actuel" icon={Lock}
              type={showPw.current ? "text" : "password"}
              value={pwForm.current}
              onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              placeholder="••••••••"
              rightSlot={
                <span onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}>
                  {showPw.current ? <EyeOff size={16} color="var(--text4)" /> : <Eye size={16} color="var(--text4)" />}
                </span>
              }
            />
            <Field label="Nouveau mot de passe" icon={Lock}
              type={showPw.next ? "text" : "password"}
              value={pwForm.next}
              onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              placeholder="Min. 8 caractères"
              rightSlot={
                <span onClick={() => setShowPw(s => ({ ...s, next: !s.next }))}>
                  {showPw.next ? <EyeOff size={16} color="var(--text4)" /> : <Eye size={16} color="var(--text4)" />}
                </span>
              }
            />
            <Field label="Confirmer" icon={Lock}
              type={showPw.confirm ? "text" : "password"}
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Répétez le nouveau"
              rightSlot={
                <span onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                  {showPw.confirm ? <EyeOff size={16} color="var(--text4)" /> : <Eye size={16} color="var(--text4)" />}
                </span>
              }
            />
          </div>

          {/* Force */}
          <AnimatePresence>
            {pwStrength && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i <= pwStrength.level ? pwStrength.color : "var(--border2)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: pwStrength.color, fontWeight: 600 }}>
                  Force : {pwStrength.label}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Erreur */}
          <AnimatePresence>
            {pwError && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  background: "#fff1f0", border: "1px solid #ffccc7",
                  borderRadius: "var(--radius-sm)", fontSize: 13, color: "#cf1322", marginBottom: 16,
                }}
              >
                <AlertCircle size={14} /> {pwError}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSavePassword} disabled={savingPw}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "var(--radius-md)", border: "none",
              background: "var(--gradient-dark)", color: "#fff",
              fontWeight: 700, fontSize: 14.5,
              cursor: savingPw ? "not-allowed" : "pointer",
              opacity: savingPw ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 6px 20px rgba(26,10,16,0.22)",
            }}
          >
            {savingPw
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Mise à jour…</>
              : <><Shield size={16} /> Mettre à jour le mot de passe</>}
          </button>
        </SectionCard>

        {/* ── Zone de danger ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ border: "1.5px solid #ffccc7", borderRadius: "var(--radius-lg)", padding: 24, background: "#fff8f8" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#cf1322", marginBottom: 4 }}>Zone de danger</div>
              <div style={{ fontSize: 13, color: "#8c1a1a" }}>
                La suppression du compte est irréversible. Toutes vos analyses seront perdues.
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                  // TODO: DELETE /doctor/me + logout
                  localStorage.removeItem("doctor_token");
                  localStorage.removeItem("doctor_user");
                  navigate("/");
                }
              }}
              style={{
                padding: "10px 22px", borderRadius: "var(--radius-md)",
                border: "1.5px solid #ffccc7", background: "white", color: "#cf1322",
                fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              }}
            >
              Supprimer le compte
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key="toast" message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}