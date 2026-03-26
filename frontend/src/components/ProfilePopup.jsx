import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

/**
 * ProfilePopup — avatar trigger with dropdown showing user info + logout
 */
export default function ProfilePopup({ user }) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Get initials for avatar
  const username = user?.user_metadata?.username || user?.email || "U";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div className="profile-container" ref={popupRef}>
      <button className="profile-trigger" onClick={() => setOpen(!open)}>
        {initials}
      </button>

      {open && (
        <div className="profile-popup">
          <div className="profile-info">
            <div className="profile-name">
              {user?.user_metadata?.username || "User"}
            </div>
            <div className="profile-email">{user?.email}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
