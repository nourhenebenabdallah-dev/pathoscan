// App.jsx
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Users, Microscope, HeartPulse, ScanLine, LayoutDashboard, Sparkles, Brain, LogOut } from "lucide-react";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationBell from "./components/NotificationBell";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Analyze from "./pages/Analyze";
import History from "./pages/History";
import PredictionRisque from "./pages/PredictionRisque";
import Mammographie from "./pages/Mammographie";
import Landing        from "./pages/Landing";
import DoctorLogin    from "./pages/DoctorLogin";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorPending  from "./pages/DoctorPending";
import Sidebar        from './components/Sidebar'
import Topbar         from './components/Topbar'
import Dashboardadmin from './pages/Dashboardadmin'
import DoctorList     from './pages/DoctorList'
import AgentChat      from './pages/AgentChat'
import Stats          from './pages/Stats'
import Login          from './pages/Login'
import Profile        from "./pages/Profile";
import "./index.css";
import ChatBot from './components/ChatBot'

const NAV = [
  { to: "/dashboard",         icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/analyze",           icon: Microscope,      label: "Histopathologie" },
  { to: "/mammographie",      icon: ScanLine,        label: "Mammographie" },
  { to: "/prediction_risque", icon: HeartPulse,      label: "Prédiction risque" },
  { to: "/patients",          icon: Users,           label: "Patients" },
  { to: "/history",           icon: Activity,        label: "Historique" },
];

// Pages médecin — le chatbot n'apparaît que sur ces routes
const DOCTOR_ROUTES = [
  "/dashboard", "/analyze", "/patients", "/history",
  "/prediction_risque", "/mammographie", "/profile",
];

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text3)', fontSize: 14, fontWeight: 500 }}>Vérification en cours...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    const token = localStorage.getItem('mammoscan_token')
    const user  = JSON.parse(localStorage.getItem('mammoscan_user') || '{}')
    if (!token || user.role !== 'admin') { setStatus('fail'); return }
    fetch('http://localhost:8000/admin/verify-token', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.ok) setStatus('ok'); else { localStorage.removeItem('mammoscan_token'); localStorage.removeItem('mammoscan_user'); setStatus('fail') } })
      .catch(() => setStatus('ok'))
  }, [])
  if (status === 'checking') return <LoadingScreen />
  if (status === 'fail')     return <Navigate to="/admin/login" replace />
  return children
}

function ProtectedDoctorRoute({ children }) {
  const token = localStorage.getItem('doctor_token')
  const user  = JSON.parse(localStorage.getItem('doctor_user') || '{}')
  if (!token) return <Navigate to="/login" replace />
  if (user.status && user.status !== 'approved') return <Navigate to="/pending" replace />
  return children
}

function AdminLoginRoute() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    const token = localStorage.getItem('mammoscan_token')
    const user  = JSON.parse(localStorage.getItem('mammoscan_user') || '{}')
    if (!token || user.role !== 'admin') { setStatus('show'); return }
    fetch('http://localhost:8000/admin/verify-token', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (res.ok) setStatus('redirect'); else { localStorage.removeItem('mammoscan_token'); localStorage.removeItem('mammoscan_user'); setStatus('show') } })
      .catch(() => setStatus('redirect'))
  }, [])
  if (status === 'checking') return <LoadingScreen />
  if (status === 'redirect') return <Navigate to="/admin" replace />
  return <Login />
}

function DoctorLoginRoute() {
  const token = localStorage.getItem('doctor_token')
  const user  = JSON.parse(localStorage.getItem('doctor_user') || '{}')
  if (!token) return <DoctorLogin />
  if (user.status === 'approved') return <Navigate to="/dashboard" replace />
  return <Navigate to="/pending" replace />
}

// ── Chatbot affiché uniquement sur les pages médecin ─────────────────────────


function DoctorLayout({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  // ✅ Ajouter ce state
  const [doctorInfo, setDoctorInfo] = useState(
    JSON.parse(localStorage.getItem("doctor_user") || "{}")
  );


  useEffect(() => {
    const handler = () => {
      setDoctorInfo(JSON.parse(localStorage.getItem("doctor_user") || "{}"));
    };
    window.addEventListener("doctor_profile_updated", handler);
    return () => window.removeEventListener("doctor_profile_updated", handler);
  }, []);

  // Remplacer toutes les occurrences de `doctor.` par `doctorInfo.`
  const doctor = doctorInfo;  

  const handleLogout = () => {
    localStorage.removeItem('doctor_token')
    localStorage.removeItem('doctor_user')
    window.location.href = '/login'
  }


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50, transition: 'width 0.25s ease',
        boxShadow: '2px 0 12px rgba(26,10,16,0.04)',
      }}>
        {/* Brand */}
        <div style={{ padding: collapsed ? '20px 16px' : '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(26,10,16,0.2)', cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text1)', whiteSpace: 'nowrap' }}>PathoScan</div>
              <div style={{ fontSize: 10, color: 'var(--text4)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1px' }}>Diagnostic IA</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === "/dashboard"} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px',
              borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 13.5,
              color: isActive ? 'var(--accent)' : 'var(--text3)',
              background: isActive ? 'rgba(225,29,72,0.07)' : 'transparent',
              border: isActive ? '1px solid rgba(225,29,72,0.12)' : '1px solid transparent',
              transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
              onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) { e.currentTarget.style.background = 'var(--dark-50)'; e.currentTarget.style.color = 'var(--text1)' } }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '' }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Doctor info */}
        {!collapsed && doctor.name && (
          <div style={{ margin: '0 10px 8px', padding: '10px 12px', background: 'rgba(225,29,72,0.04)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>{doctor.name?.charAt(0).toUpperCase()}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {doctor.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doctor.specialty || 'Médecin'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Status dot */}
        <div style={{ padding: collapsed ? '8px 0' : '8px 20px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, borderTop: '1px solid var(--border)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 11, color: 'var(--text4)', fontWeight: 500 }}>Système actif</span>}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          margin: collapsed ? '8px auto' : '8px 10px 16px',
          width: collapsed ? 44 : 'calc(100% - 20px)',
          padding: '10px', borderRadius: 10,
          border: '1.5px solid rgba(220,38,38,0.2)',
          background: 'rgba(254,242,242,0.6)', color: '#dc2626',
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: collapsed ? 0 : 8, transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(254,242,242,0.6)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)' }}
        >
          <LogOut size={14} />
          {!collapsed && 'Déconnexion'}
        </button>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: collapsed ? 72 : 240, flex: 1, transition: 'margin-left 0.25s ease', minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--text1)', margin: 0, letterSpacing: '-0.3px' }}>PathoScan</h1>
            <p style={{ fontSize: 12, color: 'var(--text4)', margin: '2px 0 0', fontWeight: 500 }}>Système d'aide au diagnostic du cancer du sein</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotificationBell />
            {doctor.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'var(--panel)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gradient-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{doctor.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text1)' }}>Dr. {doctor.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text4)' }}>{doctor.specialty || 'Médecin'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '28px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 'var(--sidebar-width)', flex: 1, position: 'relative', zIndex: 1 }}>
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  // ── État isOpen GLOBAL — survit aux navigations ───────────────────────────
  const [setChatOpen] = useState(false);
    console.log("🔑 Clé Groq:", import.meta.env.VITE_GROQ_API_KEY)


  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<DoctorLoginRoute />} />
          <Route path="/register" element={<DoctorRegister />} />
          <Route path="/pending"  element={<DoctorPending />} />

          <Route path="/admin/login" element={<AdminLoginRoute />} />
          <Route path="/admin/*" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/"        element={<Dashboardadmin />} />
                  <Route path="pending"  element={<DoctorList status="pending" />} />
                  <Route path="verified" element={<DoctorList status="approved" />} />
                  <Route path="rejected" element={<DoctorList status="rejected" />} />
                  <Route path="agent"    element={<AgentChat />} />
                  <Route path="stats"    element={<Stats />} />
                  <Route path="*"        element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedAdminRoute>
          } />

          <Route path="/dashboard" element={<ProtectedDoctorRoute><DoctorLayout><Dashboard /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/analyze" element={<ProtectedDoctorRoute><DoctorLayout><Analyze /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/patients" element={<ProtectedDoctorRoute><DoctorLayout><Patients /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/patients/:id" element={<ProtectedDoctorRoute><DoctorLayout><PatientDetail /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/history" element={<ProtectedDoctorRoute><DoctorLayout><History /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/prediction_risque" element={<ProtectedDoctorRoute><DoctorLayout><PredictionRisque /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/mammographie" element={<ProtectedDoctorRoute><DoctorLayout><Mammographie /></DoctorLayout></ProtectedDoctorRoute>} />
          <Route path="/profile" element={<ProtectedDoctorRoute><DoctorLayout><Profile /></DoctorLayout></ProtectedDoctorRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
                 <ChatBot groqApiKey={import.meta.env.VITE_GROQ_API_KEY} />


      </NotificationProvider>
    </BrowserRouter>
  )
}