const BARS = [
  { label: "Python (Django)", pct: 90, pctColor: "text-primary", barColor: "from-primary to-primary-dim" },
  { label: "Rest API", pct: 85, pctColor: "text-tertiary", barColor: "from-amber-400 to-amber-600" },
  { label: "SQL & PostgreSQL", pct: 85, pctColor: "text-tertiary", barColor: "from-tertiary to-tertiary-dim" },
  { label: "Frontend (HTML, CSS, JS)", pct: 80, pctColor: "text-secondary", barColor: "from-secondary to-on-secondary-container" },
];

const CARDS = [
  { icon: "database", title: "Backend", desc: "Robust systems with Python", color: "text-primary", hover: "hover:bg-primary/5" },
  { icon: "devices", title: "Frontend", desc: "Responsive pixel-perfect UIs", color: "text-tertiary", hover: "hover:bg-tertiary/5" },
  { icon: "cloud_done", title: "SQL", desc: "Datatypes, Joins, Complex Queries, Pseudo Columns", color: "text-secondary", hover: "hover:bg-secondary/5" },
  { icon: "psychology", title: "AI/ML", desc: "Data analysis & Insights", color: "text-primary-dim", hover: "hover:bg-primary-dim/5" },
];

export default function Skills() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-8">
              Technical <span className="text-primary">Arsenal</span>
            </h2>
            <p className="text-lg text-on-surface-variant font-label">Leveraging modern frameworks and languages to build production-grade software solutions.</p>
            <br />
            <div className="space-y-6">
              {BARS.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between mb-2">
                    <span className="font-label text-on-surface">{b.label}</span>
                    <span className={b.pctColor}>{b.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${b.barColor}`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {CARDS.map((c) => (
              <div key={c.title} className={`glass-card p-8 rounded-3xl group transition-colors ${c.hover}`}>
                <span className={`material-symbols-outlined ${c.color} text-5xl mb-4`}>{c.icon}</span>
                <h4 className="font-headline font-bold text-xl mb-2">{c.title}</h4>
                <p className="text-xs text-on-surface-variant font-label">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
