import Reveal from "./Reveal";

export default function Experience() {
  return (
    <section className="py-24 bg-surface" id="experience">
      <div className="max-w-7xl mx-auto px-8">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-16 text-center">
            Milestones &<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary"> Training</span>
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-12">
            <Reveal>
              <h3 className="text-2xl font-bold font-headline text-primary mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined">work</span>
                Career Milestones
              </h3>
            </Reveal>
            <div className="relative pl-8 border-l-2 border-primary/20">
              <div className="timeline-dot absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(105,156,255,0.8)]" />
              <Reveal delay={120}>
                <div className="glass-card p-6 rounded-2xl mb-6">
                  <span className="inline-block px-3 py-1 rounded bg-primary/10 text-primary font-label text-xs mb-3">2026 (Feb) - PRESENT</span>
                  <h4 className="text-lg font-bold font-headline mb-1">Software Engineer Trainee</h4>
                  <p className="text-primary-dim font-medium mb-3">ZKTeco Biometrics India Pvt Ltd, Banglore</p>
                  <p className="text-base text-on-surface-variant font-label">
                    Focused on building dynamic web applications using FastAPI and Django. Gained hands-on experience in RESTful APIs and database management.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
          <div className="space-y-12">
            <Reveal delay={80}>
              <h3 className="text-2xl font-bold font-headline text-tertiary mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined">history_edu</span>
                Education History
              </h3>
            </Reveal>
            <div className="relative pl-8 border-l-2 border-tertiary/20 space-y-12">
              <div className="relative">
                <div className="timeline-dot tertiary absolute -left-[41px] top-0 w-4 h-4 bg-tertiary rounded-full shadow-[0_0_15px_rgba(156,72,234,0.8)]" />
                <Reveal delay={160}>
                  <div className="glass-card p-6 rounded-2xl">
                    <span className="inline-block px-3 py-1 rounded bg-tertiary/10 text-tertiary font-label text-xs mb-3">2021 - 2025</span>
                    <h4 className="text-xl font-bold font-headline mb-1">Bachelor of Computer Science (B.Tech)</h4>
                    <p className="text-tertiary-dim font-medium mb-3">APJ Abdul Kalam Technological University</p>
                    <p className="text-base text-on-surface-variant font-label">Specialized in Computer Science Engineering.</p>
                    <div className="text-base text-on-surface-variant font-label">
                      Graduated with a cumulative CGPA of <span className="text-on-surface font-semibold">9.15</span>
                    </div>
                  </div>
                </Reveal>
              </div>
              <div className="relative">
                <div className="timeline-dot secondary absolute -left-[41px] top-0 w-4 h-4 bg-secondary rounded-full shadow-[0_0_15px_rgba(179,204,191,0.8)]" />
                <Reveal delay={240}>
                  <div className="glass-card p-6 rounded-2xl">
                    <span className="inline-block px-3 py-1 rounded bg-secondary/10 text-secondary font-label text-xs mb-3">2019 - 2021</span>
                    <h4 className="text-xl font-bold font-headline mb-1">Higher Secondary Education</h4>
                    <p className="text-secondary-dim font-medium mb-3">Computer Science</p>
                    <p className="text-base text-on-surface-variant font-label">
                      Secured <span className="text-on-surface font-semibold">98.3%</span> in core subjects. Developed a strong foundation in logical reasoning and physics.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
