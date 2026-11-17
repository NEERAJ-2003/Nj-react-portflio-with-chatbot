import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TechMarquee from "./components/TechMarquee";
import About from "./components/About";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import ApiPlayground from "./components/ApiPlayground";
import DeveloperMetrics from "./components/DeveloperMetrics";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import BackToTop from "./components/BackToTop";
import ToastHost from "./components/ToastHost";
import ResumeModal from "./components/ResumeModal";
import ProjectModal from "./components/ProjectModal";
import { triggerPixelTransition } from "./utils/pixelTransition";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState(() => localStorage.getItem("portfolio-mode") || "dark");
  const [theme, setTheme] = useState(() => localStorage.getItem("portfolio-theme") || "cobalt");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  function handleSplashDone() {
    setSplashDone(true);
  }

  function applyMode(newMode, originEvent = null) {
    const update = () => {
      setMode(newMode);
      localStorage.setItem("portfolio-mode", newMode);
      document.documentElement.setAttribute("data-mode", newMode);
    };

    if (originEvent === false) {
      update();
      return;
    }

    triggerPixelTransition({
      targetMode: newMode,
      currentTheme: theme,
      originEvent,
      onSwap: update,
      duration: 1600,
    });
  }

  function toggleMode(originEvent) {
    applyMode(mode === "dark" ? "light" : "dark", originEvent);
  }

  function applyTheme(newTheme) {
    setTheme(newTheme);
    localStorage.setItem("portfolio-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }

  useEffect(() => {
    applyMode(mode, false);
  }, []);

  useEffect(() => {
    applyTheme(theme, false);
  }, []);

  // Service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").catch(console.error);
      });
    }
  }, []);

  // Scroll Progress
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Global event listeners for modal triggers
  useEffect(() => {
    function handleOpenResume() {
      setResumeOpen(true);
    }
    function handleSetThemeCobalt() {
      applyTheme("cobalt");
    }
    function handleSetThemeEmerald() {
      applyTheme("emerald");
    }
    function handleSetThemeViolet() {
      applyTheme("violet");
    }
    function handleSetThemeAmber() {
      applyTheme("amber");
    }
    function handleToggleThemeMode() {
      toggleMode();
    }
    function handleSetModeDark() {
      applyMode("dark");
    }
    function handleSetModeLight() {
      applyMode("light");
    }

    window.addEventListener("open-resume-modal", handleOpenResume);
    window.addEventListener("set-theme-cobalt", handleSetThemeCobalt);
    window.addEventListener("set-theme-emerald", handleSetThemeEmerald);
    window.addEventListener("set-theme-violet", handleSetThemeViolet);
    window.addEventListener("set-theme-amber", handleSetThemeAmber);
    window.addEventListener("toggle-theme-mode", handleToggleThemeMode);
    window.addEventListener("set-mode-dark", handleSetModeDark);
    window.addEventListener("set-mode-light", handleSetModeLight);

    return () => {
      window.removeEventListener("open-resume-modal", handleOpenResume);
      window.removeEventListener("set-theme-cobalt", handleSetThemeCobalt);
      window.removeEventListener("set-theme-emerald", handleSetThemeEmerald);
      window.removeEventListener("set-theme-violet", handleSetThemeViolet);
      window.removeEventListener("set-theme-amber", handleSetThemeAmber);
      window.removeEventListener("toggle-theme-mode", handleToggleThemeMode);
      window.removeEventListener("set-mode-dark", handleSetModeDark);
      window.removeEventListener("set-mode-light", handleSetModeLight);
    };
  }, [mode]);

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <div className={[
        "transition-opacity duration-500",
        splashDone ? "opacity-100" : "opacity-0 pointer-events-none",
      ].join(" ")}>
        <div className="scroll-progress" style={{ width: `${progress}%` }} />
        <Navbar
          currentMode={mode}
          onToggleMode={toggleMode}
          currentTheme={theme}
          onSetTheme={applyTheme}
        />
        <Hero
          onOpenResume={() => setResumeOpen(true)}
        />
        <TechMarquee />
        <About />
        <Skills />
        <Projects onSelectProject={(p) => setSelectedProject(p)} />
        <ApiPlayground />
        <DeveloperMetrics />
        <Experience />
        <Contact />
        <Footer />

        {/* Interactive Overlays */}
        <Chatbot />
        <BackToTop />
        <ToastHost />

        {/* Modals */}
        <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </>
  );
}
