import NotificationSidebar from "../components/NotificationSidebar";

export default function MainLayout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Sidebar de navigation (si tu en as une) */}
      <nav className="nav-sidebar">
        {/* tes liens de navigation */}
      </nav>

      {/* Contenu principal — toutes tes pages */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>

      {/* Notifications — toujours visible à droite */}
      <NotificationSidebar />

    </div>
  );
}