import { useEffect, useState } from "react";

const LINKS = [
  { href: "#home", label: "Home", icon: "home", desc: "Overview & hero" },
  { href: "#about", label: "About", icon: "person", desc: "Background & philosophy" },
  { href: "#skills", label: "Skills", icon: "terminal", desc: "Tech stack & tools" },
  { href: "#projects", label: "Projects", icon: "code", desc: "Featured systems" },
  { href: "#api-playground", label: "API Sandbox", icon: "api", desc: "Live REST simulator" },
  { href: "#experience", label: "Experience", icon: "work_history", desc: "Career timeline" },
  { href: "#contact", label: "Contact", icon: "mail", desc: "Get in touch" },
];

const THEMES = [
  { id: "cobalt", name: "Cobalt", color: "#699cff" },
  { id: "emerald", name: "Emerald", color: "#00f5a0" },
  { id: "violet", name: "Violet", color: "#bf5af2" },
  { id: "amber", name: "Amber", color: "#ffb020" },
];

export default function Navbar({ currentMode = "dark", onToggleMode, currentTheme, onSetTheme }) {
  const [active, setActive] = useState("#home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", "about", "skills", "projects", "api-playground", "metrics", "experience", "contact"];
    let isClickScrolling = false;
    let scrollTimeout = null;

    function updateActiveSection() {
      if (isClickScrolling) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom of page -> contact (underscore vanishes on desktop nav links)
      if (scrollY + windowHeight >= docHeight - 100) {
        setActive("#contact");
        return;
      }

      // Top of page -> home
      if (scrollY < 120) {
        setActive("#home");
        return;
      }

      // Target reference line in viewport (35% from top)
      const targetPoint = windowHeight * 0.35;
      let current = null;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= targetPoint && rect.bottom > targetPoint) {
          current = `#${id}`;
          break;
        }
      }

      if (current) {
        setActive(current);
      }
    }

    function onPortfolioNavigate(e) {
      if (e.detail) {
        setActive(e.detail);
        isClickScrolling = true;
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isClickScrolling = false;
          updateActiveSection();
        }, 900);
      }
    }

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("portfolio-navigate", onPortfolioNavigate);
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("portfolio-navigate", onPortfolioNavigate);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close menu on Escape key press
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setThemeMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close menu if window is resized to tablet/desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handleNavClick(e, href) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setActive(href);
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("portfolio-navigate", { detail: href }));
  }

  return (
    <>
      <nav className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-20 min-w-0">
          <a
            href="#home"
            className="text-xl font-bold font-headline text-on-surface tracking-tighter flex items-center gap-2"
            onClick={(e) => handleNavClick(e, "#home")}
          >
            <span>NEERAJ</span>
            <span className="text-primary font-bold">K R</span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6 ml-auto">
            {LINKS.filter((link) => link.href !== "#contact" && link.href !== "#metrics").map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link text-xs uppercase tracking-wider ${active === link.href ? "active" : ""}`}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}

            {/* Dark / Light Mode Toggle Button with Butter-Smooth Morph */}
            {onToggleMode && (
              <button
                onClick={(e) => onToggleMode(e)}
                className="relative w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface overflow-hidden transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-sm hover:shadow"
                title={currentMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={currentMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span
                  className={`material-symbols-outlined text-base absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currentMode === "dark"
                      ? "rotate-0 scale-100 opacity-100 text-amber-300"
                      : "rotate-90 scale-0 opacity-0 text-amber-300"
                    }`}
                >
                  light_mode
                </span>
                <span
                  className={`material-symbols-outlined text-base absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currentMode === "light"
                      ? "rotate-0 scale-100 opacity-100 text-primary"
                      : "-rotate-90 scale-0 opacity-0 text-primary"
                    }`}
                >
                  dark_mode
                </span>
              </button>
            )}

            {/* Theme Picker Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                title="Change Color Theme"
                aria-label="Change Color Theme"
              >
                <span className="material-symbols-outlined text-base">palette</span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 py-2 bg-surface-container-high/95 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl z-50">
                  {/* Mode Selector Segment */}
                  {onToggleMode && (
                    <>
                      <div className="px-3 py-1 text-[10px] font-label font-bold uppercase tracking-wider text-outline flex items-center justify-between">
                        <span>Mode</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                          {currentMode}
                        </span>
                      </div>
                      <div className="px-2 py-1 flex gap-1 mb-1">
                        <button
                          type="button"
                          onClick={(e) => currentMode !== "dark" && onToggleMode(e)}
                          className={`flex-1 py-1 rounded-lg text-xs font-label flex items-center justify-center gap-1.5 transition-all cursor-pointer ${currentMode === "dark"
                              ? "bg-primary text-on-primary font-bold shadow-sm"
                              : "hover:bg-surface-container text-on-surface-variant"
                            }`}
                        >
                          <span className="material-symbols-outlined text-xs">dark_mode</span>
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => currentMode !== "light" && onToggleMode(e)}
                          className={`flex-1 py-1 rounded-lg text-xs font-label flex items-center justify-center gap-1.5 transition-all cursor-pointer ${currentMode === "light"
                              ? "bg-primary text-on-primary font-bold shadow-sm"
                              : "hover:bg-surface-container text-on-surface-variant"
                            }`}
                        >
                          <span className="material-symbols-outlined text-xs">light_mode</span>
                          <span>Light</span>
                        </button>
                      </div>
                      <div className="my-1 border-t border-outline-variant/20" />
                    </>
                  )}

                  <div className="px-3 py-1 text-[10px] font-label font-bold uppercase tracking-wider text-outline">
                    Accent Color
                  </div>
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onSetTheme(theme.id);
                        setThemeMenuOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-label flex items-center justify-between hover:bg-surface-container transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span className={currentTheme === theme.id ? "text-primary font-bold" : "text-on-surface"}>
                          {theme.name}
                        </span>
                      </div>
                      {currentTheme === theme.id && (
                        <span className="material-symbols-outlined text-xs text-primary">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              className={`nav-cta ${active === "#contact" ? "active" : ""}`}
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
            >
              Let's talk
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="lg:hidden flex items-center gap-2">
            {onToggleMode && (
              <button
                onClick={(e) => onToggleMode(e)}
                className="relative w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface overflow-hidden transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shadow-sm"
                title={currentMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={currentMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span
                  className={`material-symbols-outlined text-lg absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currentMode === "dark"
                      ? "rotate-0 scale-100 opacity-100 text-amber-300"
                      : "rotate-90 scale-0 opacity-0 text-amber-300"
                    }`}
                >
                  light_mode
                </span>
                <span
                  className={`material-symbols-outlined text-lg absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${currentMode === "light"
                      ? "rotate-0 scale-100 opacity-100 text-primary"
                      : "-rotate-90 scale-0 opacity-0 text-primary"
                    }`}
                >
                  dark_mode
                </span>
              </button>
            )}
            <button
              id="menu-btn"
              className={`hamburger-btn ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
            >
              <span className="hamburger-box">
                <span className="hamburger-line line-1" />
                <span className="hamburger-line line-2" />
                <span className="hamburger-line line-3" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      <div
        className={`mobile-backdrop lg:hidden ${menuOpen ? "is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <div
        id="mobile-menu"
        className={`mobile-menu-drawer lg:hidden ${menuOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="mobile-menu-content">
          <div className="mobile-menu-links">
            {LINKS.map((link, idx) => {
              const isActive = active === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`mobile-nav-item ${isActive ? "active" : ""}`}
                  style={{ "--item-index": idx }}
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  <div className="mobile-nav-icon-wrap">
                    <span className="material-symbols-outlined">{link.icon}</span>
                  </div>
                  <div className="mobile-nav-text">
                    <span className="mobile-nav-label">{link.label}</span>
                    <span className="mobile-nav-desc">{link.desc}</span>
                  </div>
                  <span className="material-symbols-outlined mobile-nav-arrow">
                    chevron_right
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mobile-menu-footer">
            {/* Mobile Mode Switcher Row */}
            {onToggleMode && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container mb-3 border border-outline-variant/20">
                <div>
                  <span className="text-xs font-label text-outline uppercase tracking-wider block font-bold">Appearance</span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {currentMode === "dark" ? "Matte Black" : "Matte White"}
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={(e) => currentMode !== "dark" && onToggleMode(e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all duration-300 cursor-pointer active:scale-95 ${currentMode === "dark"
                        ? "bg-surface-container-high text-on-surface shadow-sm border border-outline-variant/40"
                        : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm text-amber-300">dark_mode</span>
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => currentMode !== "light" && onToggleMode(e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-label font-bold transition-all duration-300 cursor-pointer active:scale-95 ${currentMode === "light"
                        ? "bg-surface text-on-surface shadow-sm border border-outline-variant/40"
                        : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    <span className="material-symbols-outlined text-sm text-primary">light_mode</span>
                    <span>Light</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Theme Switcher Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container mb-4">
              <span className="text-xs font-label text-outline uppercase tracking-wider">Accent Theme</span>
              <div className="flex gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onSetTheme(theme.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${currentTheme === theme.id ? "scale-110 border-primary shadow-sm shadow-primary/50" : "border-transparent opacity-70"
                      }`}
                    style={{ backgroundColor: theme.color }}
                    aria-label={`Switch to ${theme.name} theme`}
                  />
                ))}
              </div>
            </div>


            <a
              href="#contact"
              className="mobile-cta-btn"
              onClick={(e) => handleNavClick(e, "#contact")}
            >
              <span className="material-symbols-outlined">send</span>
              <span>Let's talk</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
