import { useRef, useState } from "react";
import Reveal from "./Reveal";

const ENDPOINTS = [
  {
    id: "profile",
    method: "GET",
    path: "/api/v1/profile",
    desc: "Fetch developer profile, current company, status & contact metadata",
    status: 200,
    statusText: "OK",
    latency: 24,
    headers: {
      "Content-Type": "application/json",
      "X-Powered-By": "FastAPI / Uvicorn",
      "Cache-Control": "public, max-age=3600",
    },
    response: {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        developer: "Neeraj K R",
        role: "Python & Backend Developer",
        current_role: "Software Engineer Trainee",
        company: "ZKTeco Biometrics India Pvt Ltd",
        location: "Bengaluru, India",
        education: {
          degree: "B.Tech in Computer Science and Engineering",
          institution: "APJ Abdul Kalam Technological University",
          cgpa: 9.15,
        },
        focus: ["FastAPI", "Django", "PostgreSQL", "REST Architecture", "PyTorch/ML"],
        available_for_hire: true,
      },
    },
  },
  {
    id: "skills",
    method: "GET",
    path: "/api/v1/skills?category=backend",
    desc: "Inspect backend arsenal, database proficiencies, and framework metrics",
    status: 200,
    statusText: "OK",
    latency: 18,
    headers: {
      "Content-Type": "application/json",
      "X-Powered-By": "FastAPI / Uvicorn",
      "X-Query-Time": "2.4ms",
    },
    response: {
      category: "backend",
      technologies: [
        { name: "Python", proficiency: "90%", frameworks: ["FastAPI", "Django", "Flask"] },
        { name: "RESTful APIs", proficiency: "85%", patterns: ["Async I/O", "JWT Auth", "Rate Limiting"] },
        { name: "PostgreSQL & SQL", proficiency: "85%", features: ["Indexing", "Complex Joins", "Window Functions"] },
        { name: "AI & ML", models: ["CNN", "Genetic Algorithms", "Feature Extraction"] },
      ],
      practices: ["Clean Architecture", "DRY", "PEP8", "API Documentation (OpenAPI/Swagger)"],
    },
  },
  {
    id: "projects",
    method: "GET",
    path: "/api/v1/projects?featured=true",
    desc: "Retrieve production-grade portfolio projects and architecture artifacts",
    status: 200,
    statusText: "OK",
    latency: 35,
    headers: {
      "Content-Type": "application/json",
      "X-Total-Count": "2",
    },
    response: {
      count: 2,
      items: [
        {
          title: "Brain Tumor Detection System",
          type: "Medical ML & Computer Vision",
          tech: ["Python", "CNN", "Genetic Algorithm", "OpenCV"],
          accuracy: "96.4%",
          status: "Completed",
        },
        {
          title: "Check Balance Web Application",
          type: "Fullstack Web App",
          tech: ["JavaScript", "HTML5", "CSS3", "REST APIs"],
          status: "Deployed",
        },
      ],
    },
  },
];

export default function ApiPlayground() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [loading, setLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState(null); // Null by default; executes only when clicked!
  const [simulatedLatency, setSimulatedLatency] = useState(null);
  const timerRef = useRef(null);

  function handleSelectEndpoint(ep) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedEndpoint(ep);
    setLoading(false);
    setResponseOutput(null);
    setSimulatedLatency(null);
  }

  function handleSendRequest() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(() => {
      setSimulatedLatency(selectedEndpoint.latency + Math.floor(Math.random() * 10 - 5));
      setResponseOutput({
        ...selectedEndpoint.response,
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
      window.dispatchEvent(
        new CustomEvent("portfolio-toast", {
          detail: `${selectedEndpoint.method} ${selectedEndpoint.path} -> ${selectedEndpoint.status} ${selectedEndpoint.statusText}`,
        })
      );
    }, 300);
  }

  function handleCancel() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLoading(false);
    setResponseOutput(null);
    setSimulatedLatency(null);
    window.dispatchEvent(new CustomEvent("portfolio-toast", { detail: "Request cancelled / cleared" }));
  }

  return (
    <section className="py-24 bg-surface-container-low/80 relative overflow-hidden" id="api-playground">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Reveal>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-label bg-primary/10 text-primary border border-primary/20">
                  Backend Developer Sandbox
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-headline">
                Live REST API <span className="text-primary">Console</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-base text-on-surface-variant font-label mt-2 max-w-2xl">
                Test live simulated REST API endpoints, inspect real JSON response payloads, headers, latency benchmarks, and status codes.
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={160}>
          <div className="glass-card rounded-3xl border border-primary/20 overflow-hidden shadow-2xl">
            {/* Top Bar: Endpoints & Method Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-primary/15 bg-surface-container-high/40">
              <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-primary/15">
                <span className="text-[11px] font-label font-bold uppercase tracking-wider text-outline block mb-3">
                  Available Endpoints
                </span>
                <div className="space-y-2">
                  {ENDPOINTS.map((ep) => {
                    const isSelected = selectedEndpoint.id === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => handleSelectEndpoint(ep)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-mono transition-all ${isSelected
                          ? "bg-primary/15 border border-primary/40 text-on-surface"
                          : "hover:bg-surface-container text-on-surface-variant"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ep.method === "GET" ? "api-badge-get" : "api-badge-post"
                              }`}
                          >
                            {ep.method}
                          </span>
                          <span className="truncate font-medium">{ep.path.split("?")[0]}</span>
                        </div>
                        <span className="material-symbols-outlined text-sm opacity-50">
                          {isSelected ? "radio_button_checked" : "chevron_right"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Request Runner Area */}
              <div className="lg:col-span-8 p-5 flex flex-col justify-between">
                <div>
                  {/* URL Bar */}
                  <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/30 mb-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${selectedEndpoint.method === "GET" ? "api-badge-get" : "api-badge-post"
                        }`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <span className="text-xs font-mono text-on-surface flex-1 truncate">
                      https://neerajkr.dev{selectedEndpoint.path}
                    </span>

                    {(responseOutput || loading) && (
                      <button
                        onClick={handleCancel}
                        title="Cancel request / Clear response"
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-label font-semibold flex items-center gap-1 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        <span>Cancel</span>
                      </button>
                    )}

                    <button
                      onClick={handleSendRequest}
                      disabled={loading}
                      className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-label font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {loading ? "sync" : "send"}
                      </span>
                      <span>{loading ? "Sending..." : "Execute"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-on-surface-variant font-label mb-3">
                    {selectedEndpoint.desc}
                  </p>

                  {/* Request Body if POST */}
                  {selectedEndpoint.requestBody && (
                    <div className="mb-4">
                      <span className="text-[10px] font-label font-bold uppercase tracking-wider text-outline block mb-1">
                        Request Body (JSON)
                      </span>
                      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 font-mono text-xs text-on-surface-variant overflow-x-auto">
                        <pre>{JSON.stringify(selectedEndpoint.requestBody, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Meta Header */}
                <div className="flex items-center justify-between pt-3 border-t border-primary/10 text-xs font-label">
                  {responseOutput ? (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {selectedEndpoint.status} {selectedEndpoint.statusText}
                      </span>
                      <span className="text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">speed</span>
                        {simulatedLatency} ms
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-outline">
                      <span className="w-2 h-2 rounded-full bg-outline/40" />
                      <span>Status: Awaiting execution</span>
                    </div>
                  )}
                  <span className="text-outline text-[11px]">FastAPI 0.115 / Python 3.12</span>
                </div>
              </div>
            </div>

            {/* JSON Output Viewer */}
            <div className="p-5 bg-[#0a0d14] font-mono text-xs overflow-x-auto border-t border-primary/15 relative min-h-[220px]">
              <div className="flex items-center justify-between text-[11px] text-outline mb-2 pb-2 border-b border-white/5 font-label">
                <span>RESPONSE PAYLOAD (application/json)</span>
                {responseOutput ? (
                  <div className="flex items-center gap-3">
                    <span>SIZE: {JSON.stringify(responseOutput).length} B</span>
                    <button
                      onClick={handleCancel}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                      <span>Cancel / Clear</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-outline text-[10px]">READY</span>
                )}
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-14 text-primary gap-2">
                  <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                  <span className="text-xs font-label">Processing backend request...</span>
                </div>
              ) : responseOutput ? (
                <pre className="json-pretty leading-relaxed">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-4xl mb-2 text-outline/30">terminal</span>
                  <p className="text-xs font-label text-on-surface-variant font-medium">No active response</p>
                  <p className="text-[11px] text-outline font-label mt-1 max-w-sm">
                    Click <span className="text-primary font-semibold">Execute</span> above to run this simulated FastAPI endpoint and inspect the live response.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
