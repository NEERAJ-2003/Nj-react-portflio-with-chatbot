const STATS = [
  { icon: "code", value: "100+", label: "LeetCode", color: "text-primary" },
  { icon: "auto_awesome", value: "5+", label: "Projects", color: "text-tertiary" },
  { icon: "school", value: "9.15", label: "CGPA", color: "text-secondary" },
  { icon: "schedule", value: "24/7", label: "Round the Clock", color: "text-primary-dim" },
];

export default function About() {
  return (
    <section className="py-24 bg-surface-container-low" id="about">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3">
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-8 flex items-center gap-4">
              <span className="w-12 h-1 bg-primary rounded-full" />
              Architecting Logic
            </h2>
            <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
              <p className="text-xl text-on-surface-variant font-label">
                I'm a <span className="text-on-surface font-semibold">Python Developer</span> with a strong foundation in building scalable, real-world applications using{" "}
                <span className="text-primary-dim font-semibold">Django</span>. My work spans backend architecture,{" "}
                <span className="text-primary-dim font-semibold">REST APIs</span>, and{" "}
                <span className="text-primary-dim font-semibold">database design</span> - turning complex business logic into clean, maintainable systems.
              </p>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className={`material-symbols-outlined ${s.color} text-4xl mb-2`}>{s.icon}</span>
                <span className="text-2xl font-bold font-headline">{s.value}</span>
                <span className="text-xs font-label uppercase text-outline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
