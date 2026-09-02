import DinoGame from "./DinoGame";

export default function Contact() {
  return (
    <section className="py-24 bg-surface-container-low relative overflow-hidden" id="contact">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold font-headline mb-8">
              Let's <span className="text-primary">Connect</span>
            </h2>
            <p className="text-lg text-on-surface-variant font-label">Interested in collaborating or just want to say hi? My inbox is always open.</p>
            <br />
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-xs font-label text-outline uppercase tracking-widest">Email</p>
                  <p className="text-base text-on-surface-variant font-label">
                    <a href="mailto:devbyneeraj@gmail.com">devbyneeraj@gmail.com</a>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-xs font-label text-outline uppercase tracking-widest">Phone</p>
                  <p className="text-base text-on-surface-variant font-label">
                    <a href="tel:+919744733146">+91 9744733146</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DinoGame />
        </div>
      </div>
    </section>
  );
}
