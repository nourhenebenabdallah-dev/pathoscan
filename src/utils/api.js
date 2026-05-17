// utils/api.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const api  = axios.create({ baseURL: BASE });

// ── Intercepteur JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("doctor_token"); // ← "doctor_token"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Health & Stats ────────────────────────────────────────────
export const healthCheck = () => api.get("/api/health");
export const getStats    = () => api.get("/api/stats");


// ── Patients ──────────────────────────────────────────────────
export const createPatient = (data)             => api.post("/api/patients", data);
export const listPatients  = (skip=0, limit=50) => api.get("/api/patients", { params: { skip, limit } });
export const getPatient    = (id)               => api.get(`/api/patients/${id}`);
export const deletePatient = (id)               => api.delete(`/api/patients/${id}`);

// ── Envoi rapport email ───────────────────────────────────────
export const sendReport = (patientId, email, reportHtml, patientName) =>
  api.post(`/api/patients/${patientId}/send-report`, {
    email,
    report_html: reportHtml,
    patient_name: patientName,
  });

// ── Prédiction IDC (histopathologie) ─────────────────────────
export const predict = (file, patientId, notes) => {
  const fd = new FormData();
  fd.append("file", file);
  if (patientId) fd.append("patient_id", patientId);
  if (notes)     fd.append("notes", notes);
  return api.post("/api/predict/image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Prédiction risque SEER ────────────────────────────────────
export const predictRisk = (data) => api.post("/api/predict/risk", data);

// ── Prédiction mammographie ───────────────────────────────────
export const predictMammo = (file, patientId, notes, breastSide = "left", view = "CC") => {
  const fd = new FormData();
  fd.append("file", file);
  if (patientId) fd.append("patient_id",  patientId);
  if (notes)     fd.append("notes",       notes);
  fd.append("breast_side", breastSide);
  fd.append("view",        view);
  return api.post("/api/predict/mammo", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const predictMammoBatch = (files, patientId, notes) => {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  if (patientId) fd.append("patient_id", patientId);
  if (notes)     fd.append("notes",      notes);
  return api.post("/api/predict/mammo/batch", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ── Historique IDC ────────────────────────────────────────────
export const listImagePredictions = (params = {}) => api.get("/api/predictions/image", { params });
export const getPrediction        = (id)          => api.get(`/api/predictions/image/${id}`);
export const deletePrediction     = (id)          => api.delete(`/api/predictions/image/${id}`);

// ── Historique Risque ─────────────────────────────────────────
export const listRiskPredictions  = (params = {}) => api.get("/api/predictions/risk", { params });
export const deleteRiskPrediction = (id)          => api.delete(`/api/predictions/risk/${id}`);

// ── Historique Mammographie ───────────────────────────────────
export const listMammoPredictions  = (params = {}) => api.get("/api/predictions/mammo", { params });
export const getMammoPrediction    = (id)           => api.get(`/api/predict/mammo/${id}`);
export const deleteMammoPrediction = (id)           => api.delete(`/api/predictions/mammo/${id}`);

// ─────────────────────────────────────────────────────────────
export default api;