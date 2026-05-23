export type FounderCategory = "accelerator" | "grant" | "bounty" | "vc";
export type Stage = "Pre-idea" | "Idea" | "MVP" | "Traction" | "Growth";

export interface FounderProgram {
  id: string;
  name: string;
  category: FounderCategory;
  tag: string;
  tagColor: string;
  url: string;
  funding: string;
  equity: string;
  remote: boolean;
  nigerianFriendly: boolean;
  stage: Stage[];
  sectors: string[];
  summary: string;
  details: string[];
  deadline: string;
  verified: boolean;
  verifiedNote?: string;
}

export interface FounderFAQ {
  q: string;
  a: string;
}

export const FOUNDER_PROGRAMS: FounderProgram[] = [
  // ── BOUNTIES (fastest money, no equity) ──────────────────────────────────
  {
    id: "superteam-ng",
    name: "Superteam Nigeria",
    category: "bounty",
    tag: "FASTEST MONEY",
    tagColor: "bg-green-950 text-green-400 border-green-800",
    url: "https://earn.superteam.fun/regions/nigeria/",
    funding: "$100–$1,500 per bounty · $10k InstaGrants · $40k Solana Foundation grants",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["Pre-idea", "Idea", "MVP"],
    sectors: ["Web3", "Solana", "DeFi", "NFT", "Dev Tools"],
    summary: "Nigeria's most active Web3 earning platform. Complete bounties, win hackathons, apply for grants — all without leaving Nigeria.",
    details: [
      "Paid over $162,000 into the Nigerian economy in Q1 2026 alone",
      "Bounties pay $100–$1,500 in USDC for completed tasks",
      "InstaGrants fund pre-seed projects with $10k upfront",
      "Solana Foundation Grants add up to $40k for strong projects",
      "Nigeria is #1 in Africa and #6 globally for Solana developers",
      "Rust workshops and Demo Camps run regularly across Nigeria",
    ],
    deadline: "Rolling — new bounties weekly",
    verified: true,
    verifiedNote: "Q1 2026 Impact Report confirmed by TechCabal",
  },
  {
    id: "gitcoin",
    name: "Gitcoin Grants",
    category: "bounty",
    tag: "WEB3 GRANTS",
    tagColor: "bg-blue-950 text-blue-400 border-blue-800",
    url: "https://grants.gitcoin.co/",
    funding: "$500–$50,000+ per round depending on matching pool",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["Idea", "MVP"],
    sectors: ["Web3", "Open Source", "Public Goods", "Dev Tools"],
    summary: "Quadratic funding rounds for Web3 public goods and open source projects. Community matching means small contributions get amplified.",
    details: [
      "Quadratic funding — more donors = more matching funds",
      "Open to any global builder including Nigerians",
      "Runs quarterly rounds with different focus tracks",
      "No equity taken, no strings attached",
      "Strong for open source tools and ecosystem projects",
    ],
    deadline: "Quarterly rounds — check gitcoin.co for current round",
    verified: true,
  },

  // ── ACCELERATORS (equity, structured programs) ────────────────────────────
  {
    id: "outlier-basecamp",
    name: "Outlier Ventures Base Camp",
    category: "accelerator",
    tag: "FULLY REMOTE",
    tagColor: "bg-purple-950 text-purple-400 border-purple-800",
    url: "https://outlierventures.io/base-camp/",
    funding: "£150k–$200k depending on track",
    equity: "~6–8% (varies by cohort)",
    remote: true,
    nigerianFriendly: true,
    stage: ["Idea", "MVP"],
    sectors: ["DeAI", "DeFi", "RWA", "DePIN", "Web3"],
    summary: "Fully remote 12-week Web3 accelerator. Backed teams from 20+ countries. Currently accepting 2026 applications for DeAI, DeFi, RWA, and DePIN tracks.",
    details: [
      "100% remote — you build from Nigeria throughout",
      "Accepting early applications. Check now",
      "Tracks: DeAI, DeFi, RWA, DePIN",
      "Post Web Base Camp: £150k + £350k follow-on opportunity",
      "DePIN Base Camp: up to $200k",
      "Occasional in-person events but not mandatory",
    ],
    deadline: "Early applications open — check outlierventures.io",
    verified: true,
    verifiedNote: "Confirmed remote-first on official site",
  },
  {
    id: "accelerate-africa",
    name: "Accelerate Africa (Future Africa)",
    category: "accelerator",
    tag: "NIGERIAN-LED",
    tagColor: "bg-orange-950 text-orange-400 border-orange-800",
    url: "https://future.africa",
    funding: "$250,000–$500,000",
    equity: "Taken (SAFE-based)",
    remote: true,
    nigerianFriendly: true,
    stage: ["Idea", "MVP", "Traction"],
    sectors: ["Health", "Education", "Climate", "Fintech", "Tech"],
    summary: "Pan-African accelerator by Future Africa (Iyinoluwa Aboyeji). Backs early-stage founders building globally competitive businesses from Africa. Deadline July 25, 2026.",
    details: [
      "Investment of $250k–$500k depending on startup fit",
      "No application fee, no upfront equity to apply",
      "One-on-one mentorship from experienced African operators",
      "Direct access to Future Africa fund post-program",
      "Strongly encourages female co-founders",
      "Applications close July 25, 2026",
    ],
    deadline: "July 25, 2026",
    verified: true,
    verifiedNote: "Confirmed via menterprise.africa and globalsouthopportunities.com",
  },
  {
    id: "ventures-platform",
    name: "Ventures Platform",
    category: "vc",
    tag: "NIGERIA-FOCUSED",
    tagColor: "bg-yellow-950 text-yellow-400 border-yellow-800",
    url: "https://venturesplatform.com",
    funding: "$50k–$500k (pre-seed to Series A)",
    equity: "Standard VC equity",
    remote: true,
    nigerianFriendly: true,
    stage: ["MVP", "Traction"],
    sectors: ["Fintech", "AI", "Stablecoins", "Trade", "Regulated Tech"],
    summary: "One of Africa's most active early-stage investors. Backed Paystack, PiggyVest, Mono. Raised $64M Fund II. Nigerian government is an LP — strong signals for local founders.",
    details: [
      "Raised $64M Fund II with Nigerian govt (iDICE) as LP",
      "Backed Paystack, PiggyVest, Mono, Gradely",
      "Particularly strong for regulated or public-facing sectors",
      "Expanding into Francophone West Africa and North Africa",
      "Expects to make 30–40 investments from current fund",
      "Lagos-based with deep policy and government connections",
    ],
    deadline: "Rolling — apply via venturesplatform.com",
    verified: true,
    verifiedNote: "Confirmed via TechCrunch and TechPoint Africa",
  },
  {
    id: "cascador",
    name: "Cascador ScaleUp",
    category: "accelerator",
    tag: "GROWTH STAGE",
    tagColor: "bg-teal-950 text-teal-400 border-teal-800",
    url: "https://cascador.africa",
    funding: "Up to $5M (later-stage)",
    equity: "Taken",
    remote: false,
    nigerianFriendly: true,
    stage: ["Traction", "Growth"],
    sectors: ["Tech", "Fintech", "Impact"],
    summary: "Africa-focused growth accelerator targeting Nigeria and Sub-Saharan Africa. 12 startups selected for the 2026 ScaleUp Program running August–November.",
    details: [
      "12 founders selected per cohort",
      "2026 cohort runs August to November",
      "Targets growth-stage founders ready to raise significant capital",
      "Nigeria and Sub-Saharan Africa focus",
      "Some in-person elements required",
    ],
    deadline: "Applications open — Aug–Nov 2026 cohort",
    verified: true,
    verifiedNote: "Confirmed via MEXC/crypto.news April 2026",
  },

  // ── GRANTS (equity-free money) ─────────────────────────────────────────────
  {
    id: "google-startups-africa",
    name: "Google for Startups Accelerator: Africa",
    category: "grant",
    tag: "EQUITY-FREE",
    tagColor: "bg-red-950 text-red-400 border-red-800",
    url: "https://startup.google.com/programs/accelerator/africa/",
    funding: "Equity-free + Google Cloud credits + technical support",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["Traction", "Growth"],
    sectors: ["AI/ML", "Tech", "Fintech", "Health", "Edtech"],
    summary: "Google's equity-free accelerator for growth-stage African tech startups. Requires revenue traction and AI/ML integration. Current cohort ran April–June 2026.",
    details: [
      "Fully equity-free for all participants",
      "Requires existing revenue and product traction",
      "AI/ML focus strongly preferred",
      "Google Cloud credits, technical reviews, mentorship",
      "Cohort 10 ran April–June 2026",
      "Watch for Cohort 11 applications later in 2026",
    ],
    deadline: "Cohort 10 closed — watch for Cohort 11",
    verified: true,
    verifiedNote: "Confirmed via startup.google.com/programs/accelerator/africa",
  },
  {
    id: "google-black-founders",
    name: "Google Black Founders Fund: Africa",
    category: "grant",
    tag: "EQUITY-FREE CASH",
    tagColor: "bg-red-950 text-red-400 border-red-800",
    url: "https://startup.google.com/programs/black-founders-fund/",
    funding: "Equity-free cash award + Google Cloud credits",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["MVP", "Traction"],
    sectors: ["Tech", "All sectors"],
    summary: "Equity-free cash awards and Google Cloud credits for Black-owned tech startups in Africa. One of the few programs offering direct cash with no strings.",
    details: [
      "No equity taken — pure grant",
      "Includes mentorship and technical support",
      "Open to Black-owned startups across Africa including Nigeria",
      "Google Cloud credits can significantly reduce infrastructure costs",
      "Rolling applications — check startup.google.com for open windows",
    ],
    deadline: "Rolling — check startup.google.com",
    verified: true,
    verifiedNote: "Confirmed via opportunitiesforyouth.org January 2026",
  },
  {
    id: "lisk-grants",
    name: "Lisk Africa Grants",
    category: "grant",
    tag: "WEB3 GRANTS",
    tagColor: "bg-indigo-950 text-indigo-400 border-indigo-800",
    url: "https://lisk.com/africa",
    funding: "Up to $20,000 per startup",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["Idea", "MVP"],
    sectors: ["Web3", "DeFi", "Real-World Utility", "Layer 2"],
    summary: "Lisk's Africa grant program via CV Labs and Aya HQ. Has trained 30+ startups with 12 graduates receiving up to $20k each. Strong in Nigeria, Kenya, Ghana.",
    details: [
      "Up to $20,000 equity-free grant per startup",
      "Run via incubator partnerships with CV Labs and Aya HQ",
      "Selects based on traction, real-world utility, founder strength",
      "Active in Nigeria, Kenya, Ghana, South Africa",
      "Education and bootcamp support alongside grants",
      "Ethereum-compatible Layer 2 ecosystem focus",
    ],
    deadline: "Rolling cohorts — check lisk.com/africa",
    verified: true,
    verifiedNote: "Confirmed via TechCabal August 2025",
  },
  {
    id: "usadf",
    name: "USADF (US African Development Foundation)",
    category: "grant",
    tag: "GRASSROOTS GRANT",
    tagColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    url: "https://www.usadf.gov",
    funding: "Varies — targets underserved communities",
    equity: "None",
    remote: true,
    nigerianFriendly: true,
    stage: ["Idea", "MVP"],
    sectors: ["Social Enterprise", "Community", "Agriculture", "Health"],
    summary: "US government agency providing direct grants to grassroots organizations and small enterprises in Africa. Reaches founders outside Lagos and Abuja.",
    details: [
      "One of few major funders that reaches beyond Big 4 startup hubs",
      "Targets rural areas, youth-led ventures, social enterprises",
      "Ongoing applications — no fixed deadline",
      "Particularly useful for founders in smaller Nigerian cities",
      "No equity, no complex reporting requirements",
    ],
    deadline: "Ongoing — usadf.gov",
    verified: true,
    verifiedNote: "Confirmed via MOHAC Africa April 2026",
  },
];

export const FOUNDER_FAQS: FounderFAQ[] = [
  {
    q: "Do I need to relocate to join any of these programs?",
    a: "Not for the programs marked as remote. Outlier Ventures Base Camp explicitly states it's fully remote and has backed founders from 20+ countries. Superteam Nigeria, Gitcoin, and the grant programs are entirely online. Cascador and Ventures Platform may have in-person elements but are Lagos-based.",
  },
  {
    q: "What stage should I be at before applying?",
    a: "It depends on the program. Superteam bounties accept anyone with a skill to contribute right now — no startup needed. Accelerators like Outlier Ventures want at least an idea and some technical credibility. Google for Startups Africa requires existing revenue. Check the Stage column on each program.",
  },
  {
    q: "Which is best for a Web3 / Base L2 project specifically?",
    a: "Start with Superteam Nigeria for immediate bounty income and ecosystem presence. Then Outlier Ventures Base Camp for structured acceleration. Gitcoin Grants for open-source Web3 tooling. Your existing Base L2 work (like BaseMatch) is a direct advantage in all three.",
  },
  {
    q: "Are any of these truly equity-free?",
    a: "Yes. Superteam bounties and grants, Gitcoin Grants, Google for Startups Accelerator Africa, Google Black Founders Fund, Lisk Africa Grants, and USADF all take zero equity. You keep 100% of your company.",
  },
  {
    q: "Can I apply to multiple programs at once?",
    a: "Generally yes. Most programs are fine with parallel applications. Where an accelerator requests disclosure, be honest — accelerators talk to each other. Applying to 2–3 that genuinely fit your stage is smart. Don't spray everywhere.",
  },
  {
    q: "I'm a solo founder. Does that hurt my chances?",
    a: "It depends. Accelerators generally prefer founding teams over solo founders, as it signals execution capacity and resilience. Bounty platforms and grants don't care. If you're solo, think about who you can bring on — even a part-time technical co-founder or operator changes the story.",
  },
];

export const CATEGORY_LABELS: Record<FounderCategory, string> = {
  bounty: "Bounties & Grants",
  grant: "Equity-Free Grants",
  accelerator: "Accelerators",
  vc: "VC / Investors",
};

export const CATEGORY_DESCRIPTIONS: Record<FounderCategory, string> = {
  bounty: "Earn money now by completing tasks. No equity, no strings. Best for early-stage builders needing immediate income.",
  grant: "Free money with no equity taken. Competitive but worth it — these are the cleanest funding you can get.",
  accelerator: "Structured programs trading equity for capital, mentorship, and networks. Bigger bets, bigger outcomes.",
  vc: "Direct investment from funds. Best for founders with traction who want significant capital and investor relationships.",
};
