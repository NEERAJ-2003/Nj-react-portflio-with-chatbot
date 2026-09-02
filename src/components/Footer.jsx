const SOCIALS = [
  { label: "GitHub", href: "https://github.com/NEERAJ-2003" },
  { label: "LinkedIn", href: "http://www.linkedin.com/in/neeraj-k-r-a1456b294" },
  // { label: "Instagram", href: "https://www.instagram.com/_neeraj.kr_?igsh=MnpzN2E1amRpcHhx" },
  { label: "Whatsapp", href: "https://wa.me/9744733146" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 w-full pt-20 pb-10 bg-slate-900/50">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 border-t border-slate-800/30 max-w-7xl mx-auto space-y-6 md:space-y-0 text-center md:text-left">
        <div className="text-lg font-black text-slate-200 font-headline">Neeraj K R</div>
        <div className="text-slate-500 font-body text-sm tracking-wide">
          &copy; 2026 Neeraj K R
          <br />
          Where Code Meets Creativity
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              className="text-slate-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 font-label"
              href={s.href}
              target="_blank"
              rel="noreferrer"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
