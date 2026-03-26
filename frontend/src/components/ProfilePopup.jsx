import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePopup({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getInitial = (name, email) => {
    if (name && name.length > 0) return name[0].toUpperCase();
    if (email && email.length > 0) return email[0].toUpperCase();
    return "?";
  };

  return (
    <div className="profile-container" ref={popupRef}>
      <motion.button
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
      >
        {getInitial(user?.user_metadata?.username, user?.email)}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="profile-popup"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="profile-info">
              <div className="profile-name">
                {user?.user_metadata?.username || "Guest User"}
              </div>
              <div className="profile-email">{user?.email || "No email"}</div>
            </div>
            <motion.button
              className="btn-logout"
              onClick={handleLogout}
              whileTap={{ scale: 0.98 }}
            >
              Sign Out
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
