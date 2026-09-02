import { useState } from "react";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
];

export default function Navbar() {
  const [active, setActive] = useState("#home");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(e, href) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setActive(href);
    setMenuOpen(false);
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl bg-gradient-to-b from-slate-900/20 to-transparent shadow-2xl shadow-blue-500/5">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
        <div className="text-xl font-bold font-headline text-on-surface tracking-tighter">
          NEERAJ<span className="text-primary">&nbsp;K R</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 ml-auto">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link ${active === link.href ? "active" : ""}`}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="md:hidden">
          <button id="menu-btn" className="flex items-center" onClick={() => setMenuOpen((v) => !v)}>
            <span className="material-symbols-outlined text-on-surface">menu</span>
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden absolute top-20 left-0 w-full bg-gradient-to-b from-blue-900/40 via-slate-900/95 to-slate-950 backdrop-blur-2xl border-t border-blue-500/20 shadow-2xl shadow-blue-500/20 transition-all duration-700 ease-out origin-top z-50 ${
            menuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-5 invisible"
          }`}
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="mobile-link text-base text-on-surface-variant font-label flex justify-center items-center py-5 text-lg font-medium text-slate-200 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
