export default function VoiceVisualizer({ isHearing }) {
  const bars = 22;

  return (
    <div className={`voice-visualizer-container ${isHearing ? "is-hearing" : "is-idle"}`}>
      <div className="voice-eq" aria-hidden="true">
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className="voice-eq-bar"
            style={{
              animationDelay: `${(i % 8) * 0.07}s`,
              animationDuration: `${0.55 + (i % 5) * 0.08}s`,
            }}
          />
        ))}
      </div>
      <div className="voice-mic-core" aria-hidden="true">
        <span className="material-symbols-outlined">mic</span>
      </div>
    </div>
  );
}
