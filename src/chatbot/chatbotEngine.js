// ══════════════════════════════════════════════════════════════════
// Freya chatbot engine — ported from the original vanilla-JS widget.
// Pure functions/data only; no DOM access here.
// ══════════════════════════════════════════════════════════════════

function hasWord(q, keyword) {
  const normalize = (s) => s.replace(/['\u2019]/g, "").trim();
  const nq = normalize(q);
  const nk = normalize(keyword);
  if (!nk) return false;
  const escaped = nk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("(^|[^a-z])" + escaped + "([^a-z]|$)", "i").test(nq);
}

function scoreKeywords(q, keywords) {
  let score = 0;
  for (const k of keywords) {
    if (hasWord(q, k)) score += k.trim().split(/\s+/).length;
  }
  return score;
}

// ══════════════════════════════════════════════════════════════════
// SKILLS ENGINE
// ══════════════════════════════════════════════════════════════════
const SKILL_KNOWN = [
  {
    name: "Python (Django)",
    percent: "90%",
    aliases: ["python", "django", "python django", "python developer", "python programming",
      "python language", "backend framework", "web framework", "django framework",
      "python backend", "python web dev", "python web development"],
    extra: "His primary backend skill — used to build dynamic, scalable web applications."
  },
  {
    name: "FastAPI",
    percent: "85%",
    aliases: ["fastapi", "fast api", "fast-api", "fastapi framework", "asgi", "async python", "async api"],
    extra: "High-performance async Python framework used for microservices, REST APIs, and automated OpenAPI documentation."
  },
  {
    name: "REST API",
    percent: "85%",
    aliases: ["restapi", "rest api", "restful", "rest apis", "api development", "api design",
      "api integration", "web api", "apis", "restful api", "restful apis", "building apis"],
    extra: "Used for designing and integrating APIs into Django and FastAPI applications."
  },
  {
    name: "SQL & PostgreSQL",
    percent: "85%",
    aliases: ["sql", "postgresql", "postgres", "database", "databases", "db",
      "database design", "database management", "query", "queries", "joins",
      "database skill", "db skill", "relational database", "data modeling", "schema design"],
    extra: "Covers datatypes, joins, complex queries, and pseudo columns."
  },
  {
    name: "Frontend (HTML, CSS, JS)",
    percent: "80%",
    aliases: ["frontend", "front-end", "front end", "html", "css", "javascript", "js",
      "html css js", "ui development", "web design", "client side", "webpage design",
      "responsive design", "ui skill", "web pages"],
    extra: "Focused on responsive, pixel-perfect UIs."
  },
  {
    name: "AI / ML",
    percent: null,
    aliases: ["ai", "ml", "ai/ml", "machine learning", "artificial intelligence",
      "data analysis", "data science", "cnn", "convolutional neural network",
      "neural network", "genetic algorithm", "model training", "deep learning basics",
      "predictive model", "image classification"],
    extra: "Applied hands-on in the Brain Tumor Detection project — CNNs for feature extraction and Genetic Algorithms for optimization — rather than as a rated bar on the page, but it's a skill he actively uses."
  },
  {
    name: "DSA / LeetCode",
    percent: null,
    aliases: ["dsa", "leetcode", "data structures", "algorithms", "coding practice",
      "problem solving", "competitive programming", "coding challenges"],
    extra: "100+ problems solved on LeetCode as part of sharpening data structures & algorithms."
  },
];

// Skills NOT on this portfolio, so Freya never invents a percentage.
const SKILL_UNKNOWN = [
  "java", "c++", "cpp", "c programming", "c language", "c#", "golang", "go lang",
  "react", "react.js", "reactjs", "angular", "vue", "vue.js", "next.js", "nextjs",
  "node", "node.js", "nodejs", "express.js", "expressjs",
  "aws", "amazon web services", "azure", "gcp", "google cloud", "cloud computing",
  "docker", "kubernetes", "k8s", "devops", "ci/cd", "jenkins", "terraform",
  "php", "laravel", "ruby", "ruby on rails", "rails",
  "swift", "kotlin", "flutter", "react native", "android development", "ios development",
  "mongodb", "nosql", "firebase", "redis", "kafka", "graphql", "microservices",
  "tensorflow", "pytorch", "deep learning", "nlp", "natural language processing",
  "blockchain", "solidity", "web3", "cybersecurity", "ethical hacking", "penetration testing",
  "selenium", "automation testing", "unit testing", "qa testing",
  "linux administration", "shell scripting", "bash scripting", "git", "github actions",
  "scrum", "agile methodology", "power bi", "tableau", "excel automation",
  "unity", "game development", "embedded systems", "iot"
];

function bestSkillMatch(q) {
  let best = null, bestScore = 0;
  for (const s of SKILL_KNOWN) {
    const sc = scoreKeywords(q, s.aliases);
    if (sc > bestScore) { best = s; bestScore = sc; }
  }
  return { entry: best, score: bestScore };
}
function bestUnknownSkillMatch(q) {
  let best = null, bestScore = 0;
  for (const kw of SKILL_UNKNOWN) {
    if (hasWord(q, kw)) {
      const sc = kw.split(/\s+/).length;
      if (sc > bestScore) { best = kw; bestScore = sc; }
    }
  }
  return { keyword: best, score: bestScore };
}

const SKILL_INTENT_WORDS = ["know", "skill", "skills", "experience", "worked with", "used",
  "familiar", "expert", "proficient", "good at", "does he", "do you", "can he",
  "can you", "have you", "has he"];

const SKILLS_LIST_KEYWORDS = ["skill", "skills", "skillset", "skill set", "tech stack",
  "technology", "technologies", "language", "languages", "framework", "frameworks",
  "proficient", "proficiency", "good at", "expertise", "strength", "strengths",
  "strong at", "what can he do", "what can you do", "abilities", "capable of",
  "arsenal", "technical arsenal", "tech arsenal", "what does he know", "what do you know",
  "his skills", "your skills", "skill level", "competencies", "toolset", "tools he uses",
  "what technologies does he use", "what languages does he know"];

function skillsAnswer(question) {
  const q = question.toLowerCase();

  const known = bestSkillMatch(q);
  const unknown = bestUnknownSkillMatch(q);
  const listScore = scoreKeywords(q, SKILLS_LIST_KEYWORDS);

  if (known.score > 0 && known.score >= unknown.score && known.score >= listScore) {
    const s = known.entry;
    const pct = s.percent ? ` He's rated at ${s.percent} proficiency.` : "";
    return `Yes, Neeraj knows ${s.name}.${pct} ${s.extra}`;
  }

  if (unknown.score > 0 && unknown.score >= listScore &&
      scoreKeywords(q, SKILL_INTENT_WORDS) > 0) {
    return `Neeraj hasn't listed ${unknown.keyword} as one of his skills — he hasn't worked with it, or it isn't part of his current stack.`;
  }

  if (listScore > 0) {
    return "Python (Django) – 90%, FastAPI – 85%, REST APIs – 85%, SQL & PostgreSQL – 85%, Frontend (HTML/CSS/JS) – 80%. He also applies AI/ML for medical data analysis (e.g. CNNs + Genetic Algorithms in his Brain Tumor Detection project) and has solved 100+ DSA problems on LeetCode. Ask me about any of these for more detail!";
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// CONTACT ENGINE
// ══════════════════════════════════════════════════════════════════
const EMAIL_ONLY_KEYWORDS = ["email", "e-mail", "mail", "gmail", "mail id", "mail address",
  "email address", "email id", "send a mail", "send an email", "drop a mail", "drop an email",
  "mail him", "email him", "write to him", "write him an email", "your email", "his email",
  "gmail id", "gmail address"];
const PHONE_ONLY_KEYWORDS = ["phone number", "mobile number", "contact number", "cell number",
  "whatsapp number", "call number", "phone no", "mobile no", "his number", "your number",
  "call him", "phone him", "ring him", "dial", "give me his number", "give me the number",
  "what's his number", "whats his number", "mobile", "cell phone"];
const GENERAL_CONTACT_KEYWORDS = ["contact", "connect", "reach", "reach out", "reach him",
  "get in touch", "touch base", "let's connect", "lets connect", "talk to him",
  "message him", "get hold of him", "how to contact", "how do i contact",
  "how can i contact", "how to reach", "contact info", "contact information",
  "contact details"];

function contactAnswer(question) {
  const q = question.toLowerCase();
  const emailScore = scoreKeywords(q, EMAIL_ONLY_KEYWORDS);
  const phoneScore = scoreKeywords(q, PHONE_ONLY_KEYWORDS);
  const generalScore = scoreKeywords(q, GENERAL_CONTACT_KEYWORDS);
  const best = Math.max(emailScore, phoneScore, generalScore);
  if (best === 0) return { text: null, score: 0 };

  if (emailScore === best) {
    return { text: "You can email Neeraj at devbyneeraj@gmail.com.", score: best };
  }
  if (phoneScore === best) {
    return { text: "You can call or WhatsApp Neeraj at +91 9744733146.", score: best };
  }
  return { text: "You can reach Neeraj by email at devbyneeraj@gmail.com or by phone/WhatsApp at +91 9744733146.", score: best };
}

// ══════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE
// ══════════════════════════════════════════════════════════════════
const KB = [
  {
    keywords: ["btech", "b.tech", "college", "university", "degree", "graduat", "bachelor",
      "computer science", "engineering college", "which college", "where did he study",
      "where did you study", "which university", "engineering degree", "what did he study",
      "what course did he do", "his degree", "your degree", "college name", "university name",
      "which engineering", "b tech", "undergrad", "undergraduate"],
    answer: "Neeraj completed his B.Tech in Computer Science Engineering at APJ Abdul Kalam Technological University (2021 – 2025), graduating with a CGPA of 9.15."
  },
  {
    keywords: ["12th", "plus two", "higher secondary", "school", "intermediate", "10th", "schooling",
      "high school", "senior secondary", "pre-degree", "class 12", "class 10", "hsc"],
    answer: "Neeraj completed his Higher Secondary Education (Computer Science stream) from 2019 to 2021, securing 98.3% in core subjects."
  },
  {
    keywords: ["education", "study", "qualification", "academic", "background", "education history",
      "educational qualification", "his qualifications", "academic background", "academic history",
      "educational background", "his education", "your education", "school and college"],
    answer: "Education: B.Tech in Computer Science Engineering, APJ Abdul Kalam Technological University (2021–2025, CGPA 9.15). Before that, Higher Secondary Education in Computer Science (2019–2021, 98.3%)."
  },
  {
    keywords: ["cgpa", "gpa", "what is his cgpa", "what was his cgpa", "final cgpa", "b.tech cgpa"],
    answer: "Neeraj graduated with a CGPA of 9.15 in his B.Tech (Computer Science Engineering, 2021–2025)."
  },
  {
    keywords: ["percentage", "12th marks", "12th percentage", "higher secondary marks", "plus two marks",
      "hsc percentage", "what percentage did he get", "school percentage"],
    answer: "Neeraj scored 98.3% in his Higher Secondary core subjects (Computer Science stream, 2019–2021)."
  },
  {
    keywords: ["marks", "grade", "score in", "how did he score", "academic performance", "academic scores"],
    answer: "Neeraj graduated with a CGPA of 9.15 in his B.Tech, and scored 98.3% in his Higher Secondary core subjects."
  },
  {
    keywords: ["current job", "current role", "current company", "where does he work", "where do you work",
      "working now", "present job", "currently doing", "career milestones", "milestones",
      "current position", "current employer", "which company does he work for", "present company",
      "what is he doing now", "what does he do currently", "current designation"],
    answer: "Neeraj is currently working as Software Engineer Trainee at ZKTeco Biometrics India Pvt Ltd, Bangalore, since February 2026."
  },
  {
    keywords: ["how long", "since when", "years of experience", "how many years", "experience duration",
      "started working", "when did he start working", "total experience", "work experience duration"],
    answer: "Neeraj has been working as a Software Engineer Trainee at ZKTeco Biometrics India Pvt Ltd since February 2026, building on the skills from his B.Tech (2021–2025)."
  },
  {
    keywords: ["work", "job", "experience", "company", "employ", "trainee", "career", "role",
      "designation", "profession", "internship", "his job", "your job", "professional experience",
      "job title", "what is his job", "what does he do for work", "occupation", "employment"],
    answer: "Neeraj is currently working as a Software Engineer Trainee at ZKTeco Biometrics India Pvt Ltd, Bangalore (Feb 2026 – Present), building dynamic web applications with Django and gaining hands-on experience in REST APIs and database management."
  },
  {
    keywords: [
      "brain tumor", "brain tumor project", "brain tumour", "tumor detection", "tumour detection",
      "mri project", "medical ai project", "medical imaging project", "tell me about brain tumor",
      "explain brain tumor", "how did you build brain tumor", "what is brain tumor project"
    ],
    answer: "Brain Tumor Detection System — a medical imaging solution that detects brain tumors from MRI scans using CNNs for deep spatial feature extraction and Genetic Algorithms for weight optimization. It reaches 96.4% test accuracy with 42ms inference time. You can explore the interactive 4-stage Architecture modal on this page!"
  },
  {
    keywords: [
      "architecture", "pipeline", "system design", "system architecture", "workflow",
      "mri pipeline", "how does brain tumor work", "tumor pipeline", "clahe", "cnn extraction",
      "genetic algorithm", "optimizer", "diagnostic output", "4 stages", "four stages"
    ],
    answer: "The Brain Tumor System features a 4-stage pipeline: 1) MRI Preprocessing (skull stripping, CLAHE contrast enhancement, 224x224 normalization), 2) Deep CNN Feature Extraction (multi-layer convolutions capturing deep morphological tumor signatures), 3) Genetic Algorithm Optimizer (metaheuristic feature selection reducing vector dimension by 38%), and 4) Diagnostic Output (tumor classification with 96.4% test accuracy and 42ms inference latency). Click 'Explore Architecture' to view the interactive diagram!"
  },
  {
    keywords: [
      "api playground", "rest api console", "swagger", "openapi", "api console",
      "mock api", "test api", "curl snippets"
    ],
    answer: "Neeraj's portfolio features an interactive REST API Console where you can test simulated backend endpoints, view status codes, response headers, latency metrics, and cURL snippets in real-time."
  },
  {
    keywords: [
      "check balance", "check balance project", "balance project", "balance app",
      "account balance project", "explain check balance", "tell me about check balance", "check balance live"
    ],
    answer: "Check Balance is an interactive financial ledger web app allowing users to audit balances with zero-latency optimistic UI updates. Deployed live on Vercel at check-balance-pi.vercel.app."
  },
  {
    keywords: [
      "projects", "project", "what projects", "what are your projects", "what projects has he done",
      "projects has he built", "list projects", "show projects", "tell me about your projects",
      "tell me about his projects", "featured projects", "main projects"
    ],
    answer: "Neeraj has worked on several projects. Featured projects include the Brain Tumor Detection System (medical imaging with CNNs & Genetic Algorithms, 96.4% accuracy) with an interactive Architecture pipeline modal, and Check Balance (real-time financial auditing app deployed on Vercel)."
  },
  {
    keywords: [
      "all projects", "more projects", "other projects", "github repo", "repositories",
      "full project list", "see all his work", "browse projects", "project portfolio"
    ],
    answer: "You can browse all of Neeraj's projects on GitHub: github.com/NEERAJ-2003?tab=repositories"
  },
  {
    keywords: ["hire", "hiring", "available for work", "open to work", "freelance", "opportunit",
      "looking for a job", "recruit", "collaborat", "is he open to opportunities",
      "is he looking for a job", "can we hire him", "interested in working with us",
      "job opening", "vacancy", "would he consider", "open to relocation", "willing to relocate",
      "open to remote work", "remote opportunities", "full time role", "part time role"],
    answer: "Neeraj is open to new opportunities and collaborations — the best way to reach out is via email at devbyneeraj@gmail.com or connect on LinkedIn: linkedin.com/in/neeraj-k-r-a1456b294"
  },
  {
    keywords: ["why should we hire", "why hire him", "why should i hire", "what makes him a good fit",
      "what makes him stand out", "unique strengths", "why is he a good candidate"],
    answer: "Neeraj combines strong Python/Django backend skills (90%) with REST API and database expertise (85% each), a 9.15 CGPA, 100+ LeetCode problems solved, and hands-on project experience spanning both classic web apps and applied AI/ML — a well-rounded profile for backend or full-stack roles."
  },
  {
    keywords: ["where is he based", "where is he located", "location", "based in", "live in", "city",
      "from where", "where does he live", "which city", "current location", "his address",
      "where is he from", "hometown"],
    answer: "Neeraj is based in Bangalore, India, where he currently works at ZKTeco Biometrics India Pvt Ltd."
  },
  {
    keywords: ["github", "linkedin", "instagram", "profile link", "social media", "social links",
      "his github", "his linkedin", "his instagram", "find him on linkedin", "find him on github",
      "social profiles", "online presence"],
    answer: "GitHub: github.com/NEERAJ-2003 | LinkedIn: linkedin.com/in/neeraj-k-r-a1456b294 | Instagram: @_neeraj.kr_"
  },
  {
    keywords: ["whatsapp"],
    answer: "You can message Neeraj on WhatsApp at +91 9744733146, or via wa.me/9744733146."
  },
  {
    keywords: ["who is", "about him", "introduce", "tell me about", "what does he do",
      "what does neeraj do", "architecting logic", "give me an intro", "brief about him",
      "tell me about neeraj", "describe him", "his profile", "his background story", "his intro",
      "elevator pitch", "summary about him"],
    answer: "This is Neeraj K R — a Python Developer specializing in Django, REST APIs, and database design, currently working as a Software Engineer Trainee at ZKTeco Biometrics India Pvt Ltd."
  },
  {
    keywords: ["name", "his name", "full name", "what is his name", "what's his name"],
    answer: "His name is Neeraj K R."
  },
  {
    keywords: ["leetcode", "problems solved", "coding practice", "competitive coding",
      "how many leetcode problems", "leetcode profile", "leetcode stats", "leetcode rank"],
    answer: "Neeraj has solved 100+ problems on LeetCode as part of sharpening his data structures and algorithms skills."
  },
  {
    keywords: ["achievement", "stats", "highlight", "accomplishment", "his stats", "quick stats",
      "key numbers", "at a glance", "his achievements", "notable achievements", "accolades",
      "awards", "recognition"],
    answer: "Quick stats: 100+ LeetCode problems solved, 5+ projects built, 9.15 CGPA in B.Tech."
  },
  {
    keywords: ["resume", "cv", "download resume", "download cv", "can i get his resume",
      "share his resume", "resume link", "cv link", "send resume", "view resume", "preview resume", "see his resume"],
    answer: "You can preview and download Neeraj's official resume right on this portfolio by clicking 'Preview Resume' in the hero or using the action button below! You can also reach him via email at devbyneeraj@gmail.com."
  },
  {
    keywords: ["dino game", "the game", "play the game", "survive game", "what is this game",
      "hidden game", "easter egg", "can you survive"],
    answer: "That's a little Chrome-dino-style mini game built right into the Contact section — tap or press Enter/Space to jump over obstacles and try to beat the high score!"
  },
  {
    keywords: ["who are you", "are you ai", "are you a bot", "are you human", "your name freya",
      "what is freya", "who is freya", "are you real"],
    answer: "I'm Freya, an AI assistant built into Neeraj's portfolio to answer questions about his education, experience, skills, and projects."
  },
  {
    keywords: ["salary", "expected salary", "ctc", "compensation", "pay expectations", "notice period"],
    answer: "That's best discussed directly with Neeraj — reach out via email at devbyneeraj@gmail.com or phone/WhatsApp at +91 9744733146 and he can go over specifics with you."
  },
];

function bestKBMatch(q) {
  let best = null, bestScore = 0;
  for (const entry of KB) {
    const sc = scoreKeywords(q, entry.keywords);
    if (sc > bestScore) { best = entry; bestScore = sc; }
  }
  return { entry: best, score: bestScore };
}

// ── Smalltalk ──
const SMALLTALK = [
  { keywords: ["rate neeraj", "rate your creator", "how super is neeraj", "is he super"],
    answer: "Now im not ready to rate my creator" },
  { keywords: ["your current build version", "your version", "version", "what is your version", "whats your version", "what version", "which version", "current version", "freya version", "app version", "build version", "model version", "v1.1.0", "v1.0"],
    answer: "v1.1.0" },
  { keywords: ["who made you", "who created you", "who is your creator", "worked on you"],
    answer: "Neeraj build me as his ai assistant..." },
  { keywords: ["when he builded you", "when builded you", "date you created", "created date", "your build date"],
    answer: "August 2026" },
  { keywords: ["hi", "hello", "hey", "yo", "hiya", "howdy"],
    answer: "Hey there! I'm Freya. Ask me anything about the portfolio." },
  { keywords: ["good morning"],
    answer: "Hey, good morning, I'm Freya. Have a nice day..." },
  { keywords: ["good afternoon"],
    answer: "Hey, good afternoon, I'm Freya." },
  { keywords: ["good evening"],
    answer: "Hey, good evening, I'm Freya." },
  { keywords: ["good night"],
    answer: "Hey, Good night sweet dreams..." },
  { keywords: ["thank", "thanks", "thx", "appreciate", "cheers", "much appreciated"],
    answer: "You're welcome! Let me know if you'd like to know anything else about Neeraj's work." },
  { keywords: ["bye", "goodbye", "see you", "cya", "take care", "catch you later"],
    answer: "Take care! Feel free to reach out to Neeraj directly at devbyneeraj@gmail.com if you'd like to connect further." },
  { keywords: ["how are you", "how's it going", "what's up", "how you doing", "hows it going"],
    answer: "Doing great, thanks for asking! I'm here to answer questions about Neeraj's portfolio — what would you like to know?" },
  { keywords: ["ok", "okay", "cool", "nice", "great", "alright", "got it", "sounds good"],
    answer: "Glad that helps! Anything else you'd like to know about Neeraj?" },
];

function smalltalkMatch(q) {
  for (const entry of SMALLTALK) {
    if (entry.keywords.some((k) => hasWord(q, k))) return entry;
  }
  return null;
}

// Narrow, specific in-scope signals — deliberately WITHOUT bare
// pronouns, since those appear in almost any sentence.
const PORTFOLIO_SCOPE = [
  "neeraj", "resume", "cv", "portfolio", "hire", "hiring", "available",
  "django", "python", "api", "sql", "database", "backend", "frontend",
  "fastapi", "docker", "machine learning", "skill", "skills",
  "project", "projects", "contact", "connect", "email", "mail",
  "phone", "number", "github", "linkedin", "college", "university",
  "cgpa", "work", "job", "company", "experience", "leetcode", "freya",
  "architecture", "pipeline", "clahe", "system", "console"
];

const FALLBACK = "I can only help with the portfolio. Try rephrasing, or ask about Neeraj's skills, experience, or projects.";
const OFF_TOPIC = "That's outside what I can help with — I stick to questions about Neeraj's portfolio.";

// Single scoring pass across every engine; highest score wins.
export function findAnswer(question) {
  const q = question.toLowerCase();

  const smalltalk = smalltalkMatch(q);
  if (smalltalk) return smalltalk.answer;

  const skillReply = skillsAnswer(question);
  const skillScore = skillReply ? 3 : 0;

  const contact = contactAnswer(question);
  const kb = bestKBMatch(q);

  const best = Math.max(skillScore, contact.score, kb.score);

  if (best === 0) {
    return PORTFOLIO_SCOPE.some((k) => hasWord(q, k)) ? FALLBACK : OFF_TOPIC;
  }
  if (skillScore === best && skillReply) return skillReply;
  if (contact.score === best && contact.text) return contact.text;
  if (kb.score === best && kb.entry) return kb.entry.answer;

  return PORTFOLIO_SCOPE.some((k) => hasWord(q, k)) ? FALLBACK : OFF_TOPIC;
}

export function isSmalltalk(question) {
  return !!smalltalkMatch(question.toLowerCase());
}

export const THINKING_PHRASES = [
  "Thinking...",
  "Let me check...",
  "Looking that up...",
  "Digging through Neeraj's info...",
  "One sec...",
  "Give me a moment...",
  "Searching my notes...",
  "Piecing that together..."
];

export function pickThinkingPhrase(exclude) {
  let phrase;
  do {
    phrase = THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];
  } while (phrase === exclude && THINKING_PHRASES.length > 1);
  return phrase;
}
