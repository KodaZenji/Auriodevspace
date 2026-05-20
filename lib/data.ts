import { JobCategory } from "@/types";

export const JOB_BOARDS: JobCategory[] = [
  {
    category: "Web3 / Crypto",
    emoji: "⛓️",
    sites: [
      { name: "Crypto Jobs List", url: "https://cryptojobslist.com/web3", tag: "HOT" },
      { name: "Web3.career", url: "https://web3.career/remote-jobs", tag: "HOT" },
      { name: "Cryptocurrency Jobs", url: "https://cryptocurrencyjobs.co/engineering/" },
      
      { name: "UseWeb3 Jobs", url: "https://www.useweb3.xyz/grants" },
      { name: "Superteam Earn", url: "https://earn.superteam.fun", tag: "BOUNTIES" },
      { name: "Gitcoin grants", url: "https://gitcoin.co/program", tag: "BOUNTIES" },
      { name: "Bankless Jobs", url: "https://bankless.com/jobs" },
    ],
  },
  {
    category: "Remote Dev",
    emoji: "🌍",
    sites: [
      { name: "Wellfound", url: "https://wellfound.com/jobs?remote=true&role=engineer", tag: "HOT" },
      { name: "Remote OK", url: "https://remoteok.com/remote-dev-jobs", tag: "HOT" },
      { name: "We Work Remotely", url: "https://weworkremotely.com/remote-jobs/search?term=react" },
      { name: "Himalayas", url: "https://himalayas.app/jobs/remote" },
      { name: "Otta", url: "https://otta.com" },
      { name: "Contra", url: "https://contra.com/jobs" },
      { name: "Remote.co", url: "https://remote.co/remote-jobs/developer/" },
      { name: "Toptal", url: "https://www.toptal.com/developers" },
    ],
  },
  {
    category: "African + International",
    emoji: "🌱",
    sites: [
      { name: "Andela Talent", url: "https://andela.com/", tag: "HOT" },
      { name: "Talent500", url: "https://talent500.co" },
      { name: "Jobberman Tech", url: "https://www.jobberman.com/it-software" },
     
    ],
  },
];

export const OUTREACH_SCRIPT = `Hi [Name],

I'm (Your Name), a Web3/frontend developer based in Nigeria. I built BaseMatch (basematch.app) — a Web3 dating protocol on Base L2 using Next.js, RainbowKit, Wagmi, OnchainKit, and Coinbase Paymaster, with a Farcaster Mini App integration. I also deployed a government document automation system currently in active institutional use at the Edo State House of Assembly.

I'm actively looking for remote opportunities — junior to mid-level frontend or Web3 roles. I ship real things, I work independently, and I'm deeply embedded in the Base ecosystem.

Would you be open to a quick chat, or know someone who might be hiring?

GitHub: github.com/KodaZenji
Portfolio: auriodevspace.vercel.app

Thanks,
Ben`;

export const ROBERT_SUN_SCRIPT = `Hey Robert, hope you're doing well. I've been building more in the Base ecosystem since our session and I'm actively looking for remote opportunities — frontend or Web3 roles. I know you're well connected there. Would you be open to pointing me toward anyone who might be hiring or worth talking to? Even one intro would mean a lot. Thanks.`;

export const STATUSES = ["All", "Saved", "Applied", "Interviewing", "Offer", "Rejected"] as const;

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Saved:       { bg: "bg-zinc-900",    text: "text-zinc-400",   border: "border-zinc-700",  dot: "bg-zinc-500" },
  Applied:     { bg: "bg-green-950",   text: "text-green-400",  border: "border-green-800", dot: "bg-green-400" },
  Interviewing:{ bg: "bg-indigo-950",  text: "text-indigo-400", border: "border-indigo-800",dot: "bg-indigo-400" },
  Offer:       { bg: "bg-orange-950",  text: "text-orange-400", border: "border-orange-800",dot: "bg-orange-400" },
  Rejected:    { bg: "bg-red-950",     text: "text-red-400",    border: "border-red-900",   dot: "bg-red-500" },
};
