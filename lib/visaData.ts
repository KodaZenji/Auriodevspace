export interface VisaRoute {
  id: string;
  name: string;
  tag: "BEST FOR DEVS" | "FAST TRACK" | "STUDENT" | "FAMILY" | "ELITE";
  tagColor: string;
  summary: string;
  whoIsItFor: string;
  requirements: string[];
  salaryThreshold?: string;
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

export interface VisaFAQ {
  q: string;
  a: string;
}

export const VISA_ROUTES: VisaRoute[] = [
  {
    id: "skilled-worker",
    name: "Skilled Worker Visa",
    tag: "BEST FOR DEVS",
    tagColor: "text-green-400 border-green-800 bg-green-950",
    summary: "The main route. Get a job offer from a UK-registered company and they sponsor you. This is the goal.",
    whoIsItFor: "Anyone with a confirmed job offer from a UK employer licensed to sponsor visas.",
    requirements: [
      "Job offer from a Home Office licensed sponsor",
      "Role must be on the eligible occupations list (software dev qualifies)",
      "Minimum salary of £41,700/year or the going rate for the role",
      "English language proof (IELTS B2 or equivalent)",
      "£1,270 in savings held for 28+ days (unless sponsor certifies maintenance)",
    ],
    salaryThreshold: "£41,700/year (~₦86M)",
    processingTime: "3 weeks standard · 5 days priority · Next day super priority",
    cost: "£769 (up to 3 years) or £1,520 (3–5 years) + £1,035/year Immigration Health Surcharge",
    leadsToPR: true,
    prTimeline: "5 years continuous residence → ILR → Citizenship after 1 more year",
    pros: [
      "Leads directly to permanent residency (ILR)",
      "Spouse can come as dependent and work freely",
      "No cap on number of extensions",
      "139,000+ licensed sponsors across the UK",
    ],
    cons: [
      "£41,700 salary threshold is very high — most junior roles won't qualify",
      "Tied to your employer — change jobs, reapply",
      "ND alone may not satisfy many employers without a very strong portfolio",
    ],
    realisticForND: true,
    realisticForBSc: true,
    realisticNote: "Possible with ND but you need a strong portfolio and a Web3/mid-level role to hit the salary floor. Most junior ND-level offers won't clear £41,700.",
    bscNote: "A BSc significantly opens doors. UK employers are far more willing to sponsor BSc holders, and you're more likely to land roles that clear the salary threshold. This is your strongest route with a degree.",
  },
  {
    id: "global-talent",
    name: "Global Talent Visa",
    tag: "ELITE",
    tagColor: "text-purple-400 border-purple-800 bg-purple-950",
    summary: "For exceptional talent in digital technology. No job offer needed. Most prestigious route but hardest to get.",
    whoIsItFor: "Developers, engineers, and tech founders who can prove exceptional talent or promise in digital tech.",
    requirements: [
      "Endorsement from Tech Nation (or equivalent approved body)",
      "Evidence of exceptional talent (senior roles, open source contributions, recognized projects)",
      "OR exceptional promise (emerging talent with strong portfolio)",
      "No minimum salary requirement",
      "No job offer required",
    ],
    processingTime: "8 weeks for endorsement + 3 weeks for visa",
    cost: "£716 endorsement + £167 visa",
    leadsToPR: true,
    prTimeline: "3 years (exceptional talent) or 5 years (exceptional promise) → ILR",
    pros: [
      "Not tied to any employer — work anywhere, freelance, start a company",
      "Faster route to ILR if endorsed as exceptional talent",
      "No salary threshold",
      "Most respected visa in the tech industry",
    ],
    cons: [
      "Extremely competitive — requires proven track record",
      "Endorsement process is rigorous and can take months",
      "Not realistic for most early-career developers regardless of degree",
    ],
    realisticForND: false,
    realisticForBSc: false,
    realisticNote: "Not realistic right now. Revisit in 3–5 years after significant shipped work, GitHub presence, and community recognition.",
    bscNote: "A BSc alone won't get you endorsed. This route looks at impact — open source contributions, published work, leadership in tech communities. Build that track record regardless of your degree level.",
  },
  {
    id: "student",
    name: "Student Visa",
    tag: "STUDENT",
    tagColor: "text-blue-400 border-blue-800 bg-blue-950",
    summary: "Come to study a UK degree. Stay 2 years after graduation on the Graduate Visa. Then convert to Skilled Worker. Slower but clean path.",
    whoIsItFor: "Anyone accepted into a UK university or college at degree level or above.",
    requirements: [
      "Unconditional offer (CAS) from a UK university",
      "Proof of funds: tuition fees + £1,334/month living costs (London) or £1,023/month (elsewhere)",
      "IELTS B2 level English",
      "Valid passport",
    ],
    processingTime: "3 weeks",
    cost: "£490 visa fee + tuition (£10,000–£20,000/year for CS degrees) + living costs",
    leadsToPR: true,
    prTimeline: "3 years BSc + 2 years Graduate Visa + Skilled Worker → ILR at 5 years employment",
    pros: [
      "Converts your ND into a full UK BSc — removes the credential ceiling permanently",
      "Graduate Visa gives 2 free years to job hunt after graduation",
      "Spouse can come as dependent (degree level+)",
      "UK network, alumni connections, and employer trust",
    ],
    cons: [
      "Expensive — tuition alone is £10K–£20K/year for international students",
      "Slow — minimum 5–6 years before ILR from arrival",
      "Requires significant upfront savings for visa application",
    ],
    realisticForND: true,
    realisticForBSc: false,
    realisticNote: "The smartest structured path if Skilled Worker direct doesn't come through. ND → UK BSc top-up (1–2 years) → Graduate Visa → Skilled Worker. Costs money but permanently solves the credential problem.",
    bscNote: "If you already have a BSc, the Student Visa is redundant for you — skip straight to Skilled Worker or Global Talent. No need to repeat a degree level you already have.",
  },
  {
    id: "graduate",
    name: "Graduate Visa",
    tag: "FAST TRACK",
    tagColor: "text-yellow-400 border-yellow-800 bg-yellow-950",
    summary: "Only available AFTER completing a UK degree. Gives you 2 years to work freely without sponsorship. Not a standalone entry route.",
    whoIsItFor: "Nigerians who have already studied in the UK and completed a degree.",
    requirements: [
      "Successfully completed a UK degree at bachelor's level or above",
      "Applied within UK on a valid Student Visa",
      "No minimum salary requirement",
    ],
    processingTime: "8 weeks",
    cost: "£715",
    leadsToPR: false,
    pros: [
      "Work in any job, any sector — no sponsorship needed",
      "2 years to find a sponsored role at your own pace",
      "Can switch to Skilled Worker from within the UK",
    ],
    cons: [
      "Not an entry route — you must already be in the UK on a Student Visa",
      "Does not lead to ILR directly — must convert to Skilled Worker",
    ],
    realisticForND: false,
    realisticForBSc: false,
    realisticNote: "Only relevant after completing a UK degree. Included here as context for the Student Visa pathway.",
    bscNote: "Your BSc must be from a UK institution — a Nigerian BSc does not qualify for the Graduate Visa. This only applies if you studied in the UK.",
  },
  {
    id: "spouse",
    name: "UK Spouse / Family Visa",
    tag: "FAMILY",
    tagColor: "text-pink-400 border-pink-800 bg-pink-950",
    summary: "Join a British citizen or settled person in the UK as their spouse. Your sponsor must earn £29,000/year minimum.",
    whoIsItFor: "Spouses of British citizens or people with ILR/settled status in the UK.",
    requirements: [
      "Married to or in a civil partnership with a British citizen or settled person",
      "UK sponsor earning at least £29,000/year",
      "IELTS A2 English (rising to B1 for extensions)",
      "Genuine relationship — photos, communication history, joint evidence",
      "£1,270 in savings",
    ],
    salaryThreshold: "Sponsor must earn £29,000/year (~₦60M)",
    processingTime: "6–8 months (outside UK)",
    cost: "£1,846 + £1,035/year Immigration Health Surcharge",
    leadsToPR: true,
    prTimeline: "5 years on family visa → ILR",
    pros: [
      "You can work freely in the UK with no employer restrictions",
      "Leads to ILR after 5 years",
      "Degree level doesn't matter for this route",
    ],
    cons: [
      "Expensive and slow — 6–8 months processing",
      "Sponsor income threshold is high (£29K)",
      "Not useful if your UK relatives aren't British citizens or ILR holders",
    ],
    realisticForND: false,
    realisticForBSc: false,
    realisticNote: "Only useful if you have a British citizen or settled partner. Cousins in the UK cannot sponsor this unless one is your spouse.",
    bscNote: "A BSc makes no difference here — this route is entirely based on your relationship to the sponsor, not your qualifications.",
  },
];

export const VISA_FAQS: VisaFAQ[] = [
  {
    q: "Does my ND degree qualify for the Skilled Worker visa?",
    a: "The UK doesn't require a specific degree for the Skilled Worker visa — what matters is that your role is on the eligible occupations list (software development qualifies) and that you meet the salary threshold. Your ND + portfolio can be enough if the employer is willing to sponsor you. However, many UK employers use a degree as a filtering criterion, so expect more rejections than a BSc holder would face.",
  },
  {
    q: "How much does having a BSc change things compared to an ND?",
    a: "Significantly. A BSc opens more employer doors for Skilled Worker sponsorship, qualifies you for more senior job titles that clear the £41,700 salary threshold, and strengthens a Global Talent endorsement application in the future. For the Student Visa, an ND can get you into a UK top-up BSc program (1–2 years instead of 3), which is the most efficient way to upgrade your credential while arriving in the UK.",
  },
  {
    q: "Can I bring my wife on my Skilled Worker visa?",
    a: "Yes. Once you have a Skilled Worker visa, your spouse qualifies as a dependent. She can join you in the UK and work freely — no restriction on what job she can take.",
  },
  {
    q: "My wife only has WAEC. What are her options?",
    a: "As your dependent on a Skilled Worker visa, her qualification level doesn't matter — she enters on the strength of your visa. Independently, WAEC alone won't qualify for most UK routes. The best independent path for her is a UK college course (foundation or vocational) that accepts WAEC as entry requirement.",
  },
  {
    q: "My cousins are in the UK. Can they sponsor me?",
    a: "Only if they own or run a UK-registered company that is on the Home Office's list of licensed sponsors. Simply living in the UK is not enough.",
  },
  {
    q: "What's the fastest realistic route for a Nigerian dev with an ND in 2026?",
    a: "Get a remote job with a UK or international company first. Build 12–18 months of verifiable international work history. Then request relocation and sponsorship, or apply directly for Skilled Worker roles. This is faster than starting cold with visa applications — and meanwhile you're earning internationally.",
  },
  {
    q: "Is the £41,700 salary threshold negotiable?",
    a: "No — it's a legal minimum. However, some roles on the Immigration Salary List have lower thresholds. Software development is often listed, which may reduce the requirement. Check gov.uk before applying.",
  },
  {
    q: "How long until I can get a UK passport?",
    a: "Skilled Worker route: 5 years → ILR → 1 more year → British citizenship. Total: 6 years minimum. Student (ND top-up) route: roughly 8–10 years depending on degree length and job timeline.",
  },
];
