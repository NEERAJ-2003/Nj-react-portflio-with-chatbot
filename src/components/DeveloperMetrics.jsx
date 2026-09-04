import { useEffect, useState } from "react";
import Reveal from "./Reveal";

const LEETCODE_METRICS = {
  total: 105,
  ranking: "Top 18%",
  categories: [
    { name: "Easy", count: 58, total: 800, color: "text-emerald-400", bg: "bg-emerald-400", pct: 70 },
    { name: "Medium", count: 41, total: 1700, color: "text-amber-400", bg: "bg-amber-400", pct: 50 },
    { name: "Hard", count: 6, total: 750, color: "text-rose-400", bg: "bg-rose-400", pct: 15 },
  ],
  topics: [
    { label: "Algorithms", level: "Advanced", icon: "memory" },
    { label: "Dynamic Programming", level: "Proficient", icon: "alt_route" },
    { label: "SQL & DB Queries", level: "Expert", icon: "database" },
    { label: "Trees & Graphs", level: "Proficient", icon: "account_tree" },
  ],
};

export default function DeveloperMetrics() {
  const [githubData, setGithubData] = useState({
    public_repos: 12,
    followers: 4,
    following: 6,
    avatar_url: "https://avatars.githubusercontent.com/u/148782490?v=4",
    bio: "Python Developer | FastAPI & Django | AI & ML Enthusiast",
    loading: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchGitHub() {
      try {
        const res = await fetch("https://api.github.com/users/NEERAJ-2003");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setGithubData({
              public_repos: data.public_repos ?? 12,
              followers: data.followers ?? 4,
              following: data.following ?? 6,
              avatar_url: data.avatar_url || "https://avatars.githubusercontent.com/u/148782490?v=4",
              bio: data.bio || "Python Developer | FastAPI & Django | AI & ML Enthusiast",
              loading: false,
            });
          }
        }
      } catch {
        // Fallback already preset in initial state
      }
    }
    fetchGitHub();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-surface relative overflow-hidden" id="metrics">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <span className="px-3 py-1 rounded-full text-xs font-label bg-tertiary/10 text-tertiary border border-tertiary/20 inline-block mb-3">
              Quantifiable Impact
            </span>
            <h2 className="text-3xl md:text-5xl font-bold font-headline">
              Engineering <span className="text-tertiary">Metrics</span>
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-base text-on-surface-variant font-label mt-2">
              Verifiable proof of algorithmic problem solving, active open-source activity, and backend systems delivery.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* GitHub Activity Card */}
          <Reveal delay={120}>
            <div className="glass-card p-8 rounded-3xl border border-primary/20 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={githubData.avatar_url}
                      alt="Neeraj KR GitHub"
                      className="w-12 h-12 rounded-2xl border-2 border-primary/30 object-cover"
                    />
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">NEERAJ-2003</h3>
                      <p className="text-xs text-on-surface-variant font-label">GitHub Activity & Repositories</p>
                    </div>
                  </div>
                  <a
                    href="https://github.com/NEERAJ-2003"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-primary/20 transition-all hover:scale-105"
                    aria-label="Visit GitHub Profile"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </a>
                </div>

                <p className="text-sm text-on-surface-variant font-body mb-6">
                  {githubData.bio}
                </p>

                {/* GitHub Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 text-center">
                    <span className="text-2xl font-bold font-headline text-primary block">
                      {githubData.public_repos}
                    </span>
                    <span className="text-[11px] font-label uppercase text-outline">Public Repos</span>
                  </div>
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 text-center">
                    <span className="text-2xl font-bold font-headline text-tertiary block">
                      {githubData.followers}
                    </span>
                    <span className="text-[11px] font-label uppercase text-outline">Followers</span>
                  </div>
                  <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30 text-center">
                    <span className="text-2xl font-bold font-headline text-secondary block">
                      {githubData.following}
                    </span>
                    <span className="text-[11px] font-label uppercase text-outline">Following</span>
                  </div>
                </div>

                {/* Simulated Commit Sparkline Heatmap */}
                <div>
                  <span className="text-[11px] font-label uppercase tracking-wider text-outline block mb-2">
                    Recent Contribution Cadence
                  </span>
                  <div className="grid grid-cols-12 gap-1.5 p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const level = (i * 7 + 3) % 5;
                      const opacities = ["opacity-20", "opacity-40", "opacity-60", "opacity-80", "opacity-100"];
                      return (
                        <div
                          key={i}
                          className={`h-4 rounded-sm bg-primary ${opacities[level]} transition-transform hover:scale-125`}
                          title={`Contributions logged`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-primary/10 flex items-center justify-between text-xs font-label">
                <span className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active open source contributions
                </span>
                <a
                  href="https://github.com/NEERAJ-2003?tab=repositories"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Browse Repositories →
                </a>
              </div>
            </div>
          </Reveal>

          {/* LeetCode Mastery Card */}
          <Reveal delay={200}>
            <div className="glass-card p-8 rounded-3xl border border-tertiary/20 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <span className="material-symbols-outlined text-2xl">code_blocks</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">LeetCode Mastery</h3>
                      <p className="text-xs text-on-surface-variant font-label">
                        100+ Problems Solved · {LEETCODE_METRICS.ranking}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-label bg-amber-500/15 text-amber-300 font-bold">
                    100+ Solved
                  </span>
                </div>

                {/* Difficulty Bars */}
                <div className="space-y-4 mb-6">
                  {LEETCODE_METRICS.categories.map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs font-label mb-1.5">
                        <span className="text-on-surface font-semibold">{c.name}</span>
                        <span className={c.color}>
                          {c.count} Solved
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className={`h-full ${c.bg} rounded-full transition-all duration-1000`}
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Topic Badges */}
                <div className="grid grid-cols-2 gap-2.5">
                  {LEETCODE_METRICS.topics.map((t) => (
                    <div
                      key={t.label}
                      className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center gap-2.5"
                    >
                      <span className="material-symbols-outlined text-tertiary text-lg">{t.icon}</span>
                      <div>
                        <span className="text-xs text-on-surface font-medium block leading-tight">
                          {t.label}
                        </span>
                        <span className="text-[10px] text-outline font-label uppercase">
                          {t.level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-tertiary/10 flex items-center justify-between text-xs font-label">
                <span className="text-on-surface-variant">Focus: Clean Time & Space Complexity</span>
                <span className="text-tertiary font-medium">O(log N) & O(1) Targets</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
