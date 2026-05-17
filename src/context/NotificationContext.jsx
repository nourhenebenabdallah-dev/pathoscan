// frontend/src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from "lucide-react";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const severityConfig = {
  danger: { icon: AlertCircle, bg: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#dc2626", label: "Urgent" },
  warning: { icon: AlertTriangle, bg: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#f59e0b", label: "Attention" },
  info: { icon: Info, bg: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#3b82f6", label: "Info" },
  success: { icon: CheckCircle, bg: "linear-gradient(135deg, #10b981, #059669)", color: "#10b981", label: "Succès" },
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [persistedNotifications, setPersistedNotifications] = useState([]);
  const eventSourceRef = useRef(null);

  // Ajouter une notification toast
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Garder max 10 toasts
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    return id;
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback(async (notifId) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: "PATCH" });
      setPersistedNotifications(prev =>
        prev.map(n => n._id === notifId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lors du marquage:", error);
    }
  }, []);

  // Tout marquer comme lu
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setPersistedNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      addNotification({
        title: "Notifications lues",
        description: "Toutes les notifications ont été marquées comme lues",
        severity: "success",
      });
    } catch (error) {
      console.error("Erreur:", error);
    }
  }, [addNotification]);

  // Charger les notifications persistées
  const loadPersistedNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications?limit=50");
      const data = await response.json();
      setPersistedNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  }, []);

  // Connexion SSE pour les notifications temps réel
  useEffect(() => {
    loadPersistedNotifications();

    const connectSSE = () => {
      const es = new EventSource("/api/notifications/stream");
      
      es.onopen = () => {
        console.log("[SSE] Connecté aux notifications temps réel");
      };
      
      es.addEventListener("notification", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE] Notification reçue:", data);
          
          // Ajouter la notification toast
          addNotification({
            title: data.title,
            description: data.description,
            severity: data.severity,
            patientId: data.patient_id,
          });
          
          // Recharger les notifications persistées
          loadPersistedNotifications();
        } catch (error) {
          console.error("Erreur parsing notification:", error);
        }
      });
      
      es.onerror = (error) => {
        console.error("[SSE] Erreur connexion, reconnexion dans 5s...", error);
        es.close();
        setTimeout(connectSSE, 5000);
      };
      
      eventSourceRef.current = es;
    };
    
    connectSSE();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [addNotification, loadPersistedNotifications]);

  const value = {
    notifications: persistedNotifications,
    toastNotifications: notifications,
    unreadCount,
    sidebarOpen,
    setSidebarOpen,
    markAsRead,
    markAllAsRead,
    addNotification,
    loadPersistedNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationToastContainer />
      <NotificationSidebar />
    </NotificationContext.Provider>
  );
}

// Composant Toast Notifications
function NotificationToastContainer() {
  const { toastNotifications } = useNotifications();
  
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toastNotifications.map((notif) => {
          const config = severityConfig[notif.severity] || severityConfig.info;
          const Icon = config.icon;
          
          return (
            <motion.div
              key={notif.id}
              className="toast-notification"
              initial={{ opacity: 0, x: 300, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{ borderLeftColor: config.color }}
            >
              <div className="toast-icon" style={{ background: config.bg }}>
                <Icon size={18} color="white" />
              </div>
              <div className="toast-content">
                <div className="toast-title">{notif.title}</div>
                <div className="toast-description">{notif.description}</div>
              </div>
              <button className="toast-close">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Composant Sidebar Notifications
function NotificationSidebar() {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const getSeverityConfig = (severity) => {
    return severityConfig[severity] || severityConfig.info;
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return date.toLocaleDateString("fr-FR");
  };
  
  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="notification-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="notification-sidebar"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="notification-sidebar-header">
              <div className="header-title">
                <Bell size={20} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button className="mark-all-read" onClick={markAllAsRead}>
                  Tout marquer comme lu
                </button>
              )}
              <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="notification-sidebar-list">
              {notifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={48} strokeWidth={1} />
                  <p>Aucune notification</p>
                  <span>Les notifications apparaîtront ici</span>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = getSeverityConfig(notif.severity);
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={notif._id}
                      className={`notification-item ${!notif.read ? "unread" : ""}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                    >
                      <div className="notification-icon" style={{ background: config.bg }}>
                        <Icon size={16} color="white" />
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-description">{notif.description}</div>
                        <div className="notification-time">{formatDate(notif.created_at)}</div>
                      </div>
                      {!notif.read && <div className="unread-dot" />}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}