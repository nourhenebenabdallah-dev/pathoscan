// frontend/src/components/NotificationBell.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { unreadCount, sidebarOpen, setSidebarOpen } = useNotifications();
  
  return (
    <motion.button
      className="notification-bell"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {unreadCount > 0 ? (
        <>
          <BellRing size={20} />
          <motion.div
            className="bell-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        </>
      ) : (
        <Bell size={20} />
      )}
    </motion.button>
  );
}