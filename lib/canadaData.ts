export interface CanadaRoute {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  summary: string;
  requirements: string[];
  processingTime: string;
  cost: string;
  leadsToPR: boolean;
  prTimeline?: string;
  pros: string[];
  cons: string[];
  realisticForND: boolean;
  realisticForBSc: boolean;
  realisticNote: string;
  bscNote: string;
}

export interface CanadaFAQ {
  q: string;
  a: string;
}

export const CANADA_ROUTES: CanadaRoute[] = [
  {
    id: "express-entry-fsw",
    name: "Express Entry — Federal Skilled Worker (FSW)",
    tag: "POINTS-BASED",
    tagColor: "text-red-400 border-red-800 bg-red-950",
    summary: "Canada's main immigration system. Points-based (CRS score). No job offer required but a high score is needed. Software development is an eligible occupation.",
    requirements: [
      "At least 1 year of skilled work experience (NOC TEER 0, 1, 2, or 3)",
      "Educational credential assessed by WES or equivalent body",
      "IELTS CLB 7+ (roughly B2 level)",
      "Sufficient CRS points — current cut-off around 480–510",
      "Proof of funds: CAD $13,310 for a single applicant",
    ],
    processingTime: "6 months after Invitation to Apply (ITA)",
    cost: "CAD $1,365 application fee + WES assessment ~CAD $265",
    leadsToPR: true,
    prTimeline: "Direct PR — no intermediate status needed once invited",
    pros: [
      "No job offer required to apply",
      "Software dev (NOC 21232) is an eligible occupation",
      "Spouse's language scores and education add to your CRS score",
      "PR grants full work and study rights immediately",
    ],
    cons: [
      "ND assessed by WES as a 2-year college diploma — costs CRS points vs a degree",
      "Current CRS cut-off (~480–510) is hard to reach without Canadian experience or a job offer",
      "Younger age helps — every year past 29 loses points",
    ],
    realisticForND: false,
    realisticForBSc: true,
    realisticNote: "Hard with just an ND. WES will assess your ND as a 2-year diploma, which scores lower than a degree. Without Canadian work experience or a job offer, hitting 480+ CRS is very difficult. Use PNP instead.",
    bscNote: "A BSc assessed by WES as a Canadian bachelor's degree significantly boosts your CRS score — potentially 30–50 extra points. Combined with strong IELTS and your age, hitting the cut-off becomes realistic. FSW is your primary route with a degree.",
  },
  {
    id: "pnp",
    name: "Provincial Nominee Program (PNP) — Tech Streams",
    tag: "BEST FOR DEVS",
    tagColor: "text-green-400 border-green-800 bg-green-950",
    summary: "Individual provinces nominate workers based on local labour needs. A provincial nomination adds 600 CRS points — virtually guaranteeing PR. Several provinces have dedicated tech streams.",
    requirements: [
      "Job offer from a Canadian employer in the target province (most tech streams)",
      "OR Express Entry profile with qualifying CRS score (for enhanced streams)",
      "Work experience in an eligible tech occupation",
      "IELTS CLB 5–7 depending on province and stream",
      "Intention to live and work in the nominating province",
    ],
    processingTime: "3–6 months for nomination + 6 months federal PR processing",
    cost: "Varies by province — typically CAD $1,500–$2,000 total",
    leadsToPR: true,
    prTimeline: "Provincial nomination → Express Entry ITA within weeks → PR in ~6 months",
    pros: [
      "600 CRS bonus from nomination = guaranteed Express Entry invitation",
      "Lower credential bar than direct FSW — some provinces accept diplomas",
      "Multiple provinces to choose from — Ontario, BC, Alberta, Nova Scotia all active",
      "BC PNP Tech Pilot covers software developers specifically",
    ],
    cons: [
      "Most tech streams require a Canadian job offer first",
      "Must genuinely intend to settle in that province",
      "Each province has its own requirements — research each separately",
    ],
    realisticForND: true,
    realisticForBSc: true,
    realisticNote: "Most realistic Canadian route with an ND. Land a remote or in-person job with a Canadian company → employer supports your PNP application → nomination → PR. BC PNP and Ontario OINP are strongest for software devs.",
    bscNote: "With a BSc, more PNP streams open up — including some that don't require a provincial job offer. Your profile becomes competitive for enhanced PNP streams that draw directly from the Express Entry pool.",
  },
  {
    id: "study-pgwp",
    name: "Study Permit → PGWP → PR",
    tag: "STUDENT",
    tagColor: "text-blue-400 border-blue-800 bg-blue-950",
    summary: "Study at a Canadian college or university, graduate, get a Post-Graduation Work Permit (up to 3 years), build Canadian work experience, then apply for PR via Canadian Experience Class. Proven path.",
    requirements: [
      "Acceptance letter from a Designated Learning Institution (DLI)",
      "Proof of funds: tuition + CAD $10,000/year living costs",
      "IELTS or equivalent (level depends on institution)",
      "Valid passport and biometrics",
      "Intent to leave Canada after studies (but PGWP changes this in practice)",
    ],
    processingTime: "8–16 weeks for study permit",
    cost: "CAD $150 study permit + tuition CAD $15,000–$30,000/year + living costs",
    leadsToPR: true,
    prTimeline: "2–4 year program + up to 3 years PGWP + CEC PR application → PR in ~8–10 years total, or faster via PNP while on PGWP",
    pros: [
      "PGWP gives up to 3 years open work authorization after graduation",
      "Canadian work experience via PGWP qualifies for Canadian Experience Class (CEC)",
      "CEC draws have much lower CRS cut-offs (~450) than FSW",
      "Joyce can come as a dependent and work full-time during your studies",
      "Cheaper than UK — especially outside Toronto/Vancouver",
    ],
    cons: [
      "Slow — 4–7 years before PR realistically",
      "Expensive upfront — tuition + living costs",
      "Must maintain full-time student status",
    ],
    realisticForND: true,
    realisticForBSc: false,
    realisticNote: "Strong path with an ND. Your ND may qualify you for direct entry into a Canadian college diploma or bridging program. Graduate → PGWP → 1 year Canadian work experience → CEC PR. Cheaper than UK student route.",
    bscNote: "With a BSc, the Study Permit route is largely unnecessary — you already have the credential. Go directly to Express Entry FSW or PNP instead. Only consider studying in Canada if you want a Canadian master's degree specifically.",
  },
  {
    id: "cec",
    name: "Canadian Experience Class (CEC)",
    tag: "FAST TRACK",
    tagColor: "text-yellow-400 border-yellow-800 bg-yellow-950",
    summary: "For people already working in Canada on a valid work permit. Requires 1 year of Canadian skilled work experience. Lower CRS cut-offs than FSW — most practical once you're inside Canada.",
    requirements: [
      "At least 1 year of full-time skilled work experience in Canada within last 3 years",
      "Work must be in NOC TEER 0, 1, 2, or 3 (software dev qualifies)",
      "IELTS CLB 7 for NOC TEER 1 roles",
      "Currently in Canada or having worked in Canada",
    ],
    processingTime: "3–6 months after ITA",
    cost: "CAD $1,365",
    leadsToPR: true,
    prTimeline: "1 year Canadian work experience → CEC ITA → PR in ~6 months",
    pros: [
      "Lower CRS cut-off than FSW — typically 430–470",
      "Canadian work experience is weighted heavily in the CRS formula",
      "Fastest PR route once you have 1 year Canadian experience",
      "No educational minimum — experience matters more than credential",
    ],
    cons: [
      "Requires being inside Canada first — not an entry route",
      "Need 1 full year of eligible work experience",
    ],
    realisticForND: true,
    realisticForBSc: true,
    realisticNote: "Not an entry route — you need to get to Canada first via PGWP, IEC, or a work permit. But once there, this is your fastest PR path regardless of whether you have an ND or BSc.",
    bscNote: "Same as ND — what matters here is your Canadian work experience, not your degree. The degree helped you get in and get the job; the CEC cares about what you did after that.",
  },
  {
    id: "iec",
    name: "International Experience Canada (IEC) — Young Professionals",
    tag: "AGE-GATED",
    tagColor: "text-orange-400 border-orange-800 bg-orange-950",
    summary: "Work in Canada for up to 2 years if you're between 18–35. Not a direct PR route but gets you inside Canada to build experience. Nigeria is eligible.",
    requirements: [
      "Nigerian citizenship (Nigeria is an eligible country)",
      "Age 18–35 at time of application",
      "Valid passport",
      "CAD $2,500 in funds",
      "Apply during an open IEC pool round",
    ],
    processingTime: "8–12 weeks",
    cost: "CAD $161 + biometrics CAD $85",
    leadsToPR: false,
    pros: [
      "Get inside Canada legally and start building work experience",
      "Low bar — no job offer, no degree requirement",
      "Once in Canada, pursue PNP or CEC from within",
      "Nigerian passport eligible",
    ],
    cons: [
      "Not a PR route on its own — just a 2-year work permit",
      "Age cap: must be 35 or under",
      "Competitive pool — not guaranteed",
      "Spouse cannot automatically come as a dependent on IEC",
    ],
    realisticForND: true,
    realisticForBSc: true,
    realisticNote: "Useful as a foot-in-the-door strategy at your age. Get in, get Canadian work experience, then pivot to CEC or PNP for PR. The degree requirement is minimal — this is about getting inside Canada.",
    bscNote: "Same advice as ND — IEC doesn't care much about your degree. Use it to get in, then your BSc gives you a strong CEC or PNP profile once you're working.",
  },
];

export const CANADA_FAQS: CanadaFAQ[] = [
  {
    q: "How does Canada assess my Nigerian ND?",
    a: "Through WES (World Education Services) or another Designated Organization. A 2-year Nigerian ND is typically assessed as equivalent to a 2-year Canadian college diploma — not a degree. This costs you CRS points compared to someone with a bachelor's degree. However, it still qualifies your occupation for Express Entry, and PNP streams often care more about your job offer than your exact credential level.",
  },
  {
    q: "How does a BSc change my chances in Canada?",
    a: "Significantly. A BSc assessed by WES as a Canadian bachelor's degree adds roughly 30–50 CRS points compared to a diploma. It opens more PNP streams, makes your Express Entry profile competitive, and some employer-facing roles have degree requirements. If you're planning to pursue Canada seriously and still have time, finishing a BSc first makes the Canadian process materially easier.",
  },
  {
    q: "Can my spouse come with me to Canada?",
    a: "Yes, and Canada is actually better than the UK for this. As your spouse on a PR or work permit application, your spouse qualifies for an open spousal work permit — they can work any job anywhere in Canada while your application processes. WAEC alone won't qualify them for independent immigration, but as your dependent she's fully covered. So Bsc improves the bar",
  },
  {
    q: "Canada vs UK — which is better for my profile right now?",
    a: "Canada is more achievable with an ND but a Bsc improves your chances drastically. The PNP tech stream path (land a Canadian remote job → employer-supported nomination → PR) has a lower bar than the UK's £41,700 salary threshold. Canada PR also comes faster — 2–3 years via PNP versus 5 years minimum for UK ILR. ",
  },
  {
    q: "What's the fastest realistic path from Nigeria to Canadian PR?",
    a: "Get a remote job with a Canadian company. After 6–12 months of demonstrated work, ask them to support a PNP application. Provincial nomination adds 600 CRS points → Express Entry ITA → PR. Alternatively: IEC work permit to get inside Canada → 1 year work experience → CEC PR application. Both paths are 2–4 years realistically.",
  },
  {
    q: "Is Canadian French required?",
    a: "Not for most tech roles or immigration streams. English IELTS is sufficient for all routes listed here. However, French language proficiency does add significant CRS points and opens Francophone minority community streams — worth considering if you're open to Quebec or Franco-Ontario regions.",
  },
  {
    q: "How long until I can get a Canadian passport?",
    a: "PR → 3 years of physical presence in Canada within a 5-year period → citizenship application → Canadian passport. Total from arrival: roughly 4–5 years after getting PR. Faster than the UK's 6-year minimum to citizenship.",
  },
];
