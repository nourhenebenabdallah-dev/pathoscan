// ══════════════════════════════════════════════════════════
// 1. src/components/ProtectedDoctorRoute.jsx
//    Remplace l'actuel ProtectedRoute pour les médecins
// ══════════════════════════════════════════════════════════
// import { Navigate } from 'react-router-dom'
//
// export default function ProtectedDoctorRoute({ children }) {
//   const token = localStorage.getItem('doctor_token')
//   const user  = JSON.parse(localStorage.getItem('doctor_user') || '{}')
//
//   if (!token) return <Navigate to="/login" replace />
//
//   // Si en attente ou rejeté → page pending
//   if (user.status && user.status !== 'approved') {
//     return <Navigate to="/pending" replace />
//   }
//
//   return children
// }

// ══════════════════════════════════════════════════════════
// 2. Nouvelles routes à ajouter dans App.jsx
//    Remplace la section Routes existante par ceci :
// ══════════════════════════════════════════════════════════

/*
import Landing        from "./pages/Landing"
import DoctorLogin    from "./pages/DoctorLogin"
import DoctorRegister from "./pages/DoctorRegister"
import DoctorPending  from "./pages/DoctorPending"
import ProtectedDoctorRoute from "./components/ProtectedDoctorRoute"

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>

          // ── Pages publiques médecin ──────────────────────────
          <Route path="/landing" element={<Landing />} />
          <Route path="/login"   element={<DoctorLogin />} />
          <Route path="/register" element={<DoctorRegister />} />
          <Route path="/pending"  element={<DoctorPending />} />

          // ── Routes Admin ─────────────────────────────────────
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
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
              </ProtectedRoute>
            }
          />

          // ── Routes Médecin protégées ─────────────────────────
          <Route
            path="/*"
            element={
              <ProtectedDoctorRoute>
                <DoctorLayout>
                  <Routes>
                    <Route path="/"                  element={<Dashboard />} />
                    <Route path="/analyze"           element={<Analyze />} />
                    <Route path="/patients"          element={<Patients />} />
                    <Route path="/patients/:id"      element={<PatientDetail />} />
                    <Route path="/history"           element={<History />} />
                    <Route path="/prediction_risque" element={<PredictionRisque />} />
                    <Route path="/mammographie"      element={<Mammographie />} />
                  </Routes>
                </DoctorLayout>
              </ProtectedDoctorRoute>
            }
          />

        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  )
}
*/

// ══════════════════════════════════════════════════════════
// 3. src/components/ProtectedDoctorRoute.jsx  (fichier final)
// ══════════════════════════════════════════════════════════
export default function ProtectedDoctorRouteREADME() {
  return null // Ce fichier est une référence — voir commentaires ci-dessus
}