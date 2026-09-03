const STACK = [
  "Python",
  "Django",
  "REST APIs",
  "PostgreSQL",
  "SQL",
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Git",
  "Linux",
  "AI / ML",
];

export default function TechMarquee() {
  const loop = [...STACK, ...STACK];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-fade" />
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee-chip">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
