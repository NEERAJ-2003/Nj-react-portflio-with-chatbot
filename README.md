# Portfolio (React + Vite)

## Setup
```bash
npm install
npm run dev       # local dev server
npm run build      # production build -> dist/
```

## Assets you need to add to `public/`
These were referenced by filename in the original HTML but weren't part of
the uploaded file, so they're not included here. Drop your existing files
into `public/` with these exact names and everything will pick them up:

- `favicon.png`
- `icon-192.png`
- `project_img.png` (Brain Tumor Detection project image)
- `Neeraj_KR_Resume.pdf`

## What's included
- `src/components/` — one component per section (Navbar, Hero, About,
  Experience, Skills, Projects, Contact, Footer)
- `src/components/DinoGame.jsx` — the Chrome-dino-style easter egg, canvas
  logic preserved as-is inside a `useEffect`
- `src/components/Chatbot.jsx` + `src/chatbot/chatbotEngine.js` — the Freya
  chatbot widget, with all keyword-matching logic (skills engine, contact
  engine, knowledge base, smalltalk) ported over unchanged
- `src/index.css` — Tailwind v4 theme with your custom color tokens, fonts,
  glassmorphism, mesh-gradient, and chat-widget styles

## Notes on the port
- Tailwind v4 is used (`@tailwindcss/vite` plugin + `@theme` in `index.css`)
  instead of the old CDN `tailwind.config` script, since that only works in
  plain HTML.
- The magnetic-letter hover effect on "NEERAJ K R" was referencing an
  undefined `allChars`/`MAG`/`STR` in your original file (a leftover editing
  bug that silently broke it). I implemented it properly in `Hero.jsx` using
  a ref + `querySelectorAll` on `.name-char` / `.name-char-accent`.
- `localStorage` for the dino high score, the canvas game loop, magnetic
  hover math, and the typing effect are all functionally identical to your
  original code — just moved into `useEffect` hooks so they clean up
  properly on unmount.
