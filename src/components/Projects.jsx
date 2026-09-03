import Reveal from "./Reveal";
import SpotlightCard from "./SpotlightCard";

export default function Projects() {
  return (
    <section className="py-24 bg-surface" id="projects">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">
                Featured <span className="text-tertiary">Work</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg text-on-surface-variant font-label">A selection of projects where code meets creativity to solve real-world problems.</p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <a
              className="text-primary font-label text-sm tracking-widest uppercase"
              style={{ textDecoration: "none" }}
              href="https://github.com/NEERAJ-2003?tab=repositories"
              target="_blank"
              rel="noreferrer"
            >
              View All Projects
            </a>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-12 gap-6">
          <Reveal className="md:col-span-8" delay={80}>
            <SpotlightCard className="group relative overflow-hidden rounded-3xl h-[400px] hover-lift">
              <img
                alt="Brain Tumor Detection System"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="/project_img.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 p-8 z-10">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-primary text-xs font-label">ML System</span>
                  <span className="px-3 py-1 bg-surface-variant/40 backdrop-blur-md rounded-full text-on-surface-variant text-xs font-label">Python</span>
                </div>
                <h3 className="text-3xl font-bold font-headline mb-2 text-on-surface">Brain Tumor Detection System</h3>
                <p className="text-lg text-on-surface-variant font-label">
                  An intelligent medical imaging solution that detects brain tumors from MRI scans using CNN for feature extraction and Genetic Algorithms for optimizing model performance.
                </p>
              </div>
            </SpotlightCard>
          </Reveal>
          <Reveal className="md:col-span-4" delay={180}>
            <SpotlightCard className="glass-card p-8 rounded-3xl flex flex-col justify-between group hover:border-primary/40 transition-all h-[400px] hover-lift">
              <div>
                <span className="material-symbols-outlined text-4xl text-tertiary mb-6 icon-bob">shopping_cart</span>
                <h3 className="text-xl font-bold font-headline mb-3">Check Balance</h3>
                <p className="text-base text-on-surface-variant font-label">
                  The Check Balance feature allows users to view their current account balance in the application. It provides real-time updates of available funds.
                </p>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-surface-variant/40 backdrop-blur-md rounded-full text-on-surface-variant text-xs font-label">HTML</span>
                <span className="px-3 py-1 bg-surface-variant/40 backdrop-blur-md rounded-full text-on-surface-variant text-xs font-label">CSS</span>
                <span className="px-3 py-1 bg-surface-variant/40 backdrop-blur-md rounded-full text-on-surface-variant text-xs font-label">JS</span>
              </div>
              <div className="mt-8 flex justify-between items-center">
                <span className="text-xs font-label text-tertiary">Web App</span>
                <a
                  href="https://check-balance-pi.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform"
                >
                  arrow_forward
                </a>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
