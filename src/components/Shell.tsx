import { Heart, Menu, Music2, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useProgress } from "../progress";
import { GlobalAudioDock, useAudio } from "../audio";

const links = [
  ["/journey", "Journey"],
  ["/timeline", "Timeline"],
  ["/gallery", "Gallery"],
  ["/places", "Places"],
  ["/cinema", "Cinema"],
  ["/films", "Films"],
  ["/music", "Music"],
  ["/treasures", "Treasures"],
  ["/letter", "Letter"],
  ["/reasons", "Reasons"],
  ["/finale", "Finale"],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack, playing, toggle } = useAudio();
  const { progressPercent } = useProgress();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const isLanding = location.pathname === "/";

  return (
    <div className="site-shell">
      <button className="skip-link" onClick={() => document.getElementById("main-content")?.focus()}>
        Skip to Main Content
      </button>
      {!isLanding && (
        <header className="site-header">
          <NavLink to="/" className="brand" title="Birthday journey home">
            <span className="brand__mark">W</span>
            <span className="brand__copy">
              <strong>For Wasiatus</strong>
              <small>with all my love</small>
            </span>
          </NavLink>

          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="journey-meter" role="progressbar" aria-label="Journey visited" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <button
              className="icon-button"
              onClick={() => currentTrack ? void toggle() : navigate("/music")}
              aria-label={currentTrack ? (playing ? "Pause music" : "Resume music") : "Choose music"}
              title={currentTrack ? currentTrack.title : "Choose a song from our soundtrack"}
            >
              {currentTrack ? (playing ? <Volume2 size={18} /> : <VolumeX size={18} />) : <Music2 size={18} />}
            </button>
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                id="mobile-navigation"
                className="mobile-nav"
                aria-label="Mobile navigation"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {links.map(([to, label]) => (
                  <NavLink key={to} to={to}>
                    {label}
                  </NavLink>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </header>
      )}

      <main id="main-content" tabIndex={-1}>{children}</main>

      {!isLanding && (
        <footer className="site-footer">
          <div>
            <Heart size={16} fill="currentColor" />
            <span>Made for Wasiatus Sadiyah</span>
          </div>
          <p>From Nahuel, with Rayden, and all our tomorrows.</p>
          <span className="footer-note"><Music2 size={14} /> Sound remains off until you choose it.</span>
        </footer>
      )}
      <GlobalAudioDock />
    </div>
  );
}
