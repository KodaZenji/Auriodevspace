import Link from "next/link";
import {
  FOUNDER_PROGRAMS,
  FOUNDER_FAQS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  FounderCategory,
} from "@/lib/foundersData";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Funding for Nigerian & African Founders | JapaDev",
  description:
    "Verified grants, accelerators, bounties, and investors available to Nigerian and African founders in 2026 — no relocation required.",
};

const CATEGORY_ORDER: FounderCategory[] = ["bounty", "grant", "accelerator", "vc"];

const CATEGORY_EMOJI: Record<FounderCategory, string> = {
  bounty: "⚡",
  grant: "🎁",
  accelerator: "🚀",
  vc: "💰",
};

function Check() {
  return <span className="text-green-400 mr-2 flex-shrink-0">✓</span>;
}

function StagePill({ stage }: { stage: string }) {
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 font-mono uppercase tracking-wider">
      {stage}
    </span>
  );
}

export default function FoundersPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    programs: FOUNDER_PROGRAMS.filter((p) => p.category === cat),
  }));

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#080808] text-zinc-800 dark:text-zinc-200"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>

      <header className="border-b border-zinc-200 dark:border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#080808]/95 backdrop-blur z-40">
        <Link
          href="/japa-dev"
          className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-widest uppercase hover:text-green-400 transition-colors"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          ← JapaDev
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/japa-dev/visa" className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            UK Visa Guide
          </Link>
          <span className="text-zinc-500 dark:text-zinc-600 text-xs hidden sm:inline">Founders · 2026</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-12">
          <div className="inline-block text-xs px-3 py-1 bg-orange-950 text-orange-400 border border-orange-800 rounded-full mb-4 uppercase tracking-widest">
            Verified · No Relocation Required · Updated 2026
          </div>
          <h1
            className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Funding for Nigerian &amp;<br />African Founders
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Verified grants, accelerators, bounties, and investors available to Nigerian and
            African founders in 2026 — without requiring you to relocate. Organized by speed
            of capital: bounties first, then grants, then accelerators, then VC.
          </p>
          <div className="mt-5 p-4 bg-zinc-100 dark:bg-zinc-900 border border-yellow-900 rounded-xl text-xs text-yellow-400 leading-relaxed">
            ⚠️ Terms change frequently. Always verify current eligibility and deadlines on
            each program's official website before applying. Information here was last
            verified in May 2026.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {CATEGORY_ORDER.map((cat) => {
            const count = FOUNDER_PROGRAMS.filter((p) => p.category === cat).length;
            return (
              <a
                key={cat}
                href={`#${cat}`}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-4 transition-colors group"
              >
                <div className="text-2xl mb-2">{CATEGORY_EMOJI[cat]}</div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {CATEGORY_LABELS[cat]}
                </div>
                <div className="text-zinc-500 dark:text-zinc-600 text-xs mt-1">{count} programs</div>
              </a>
            );
          })}
        </div>

        <div className="space-y-14 mb-16">
          {grouped.map(({ cat, programs }) => (
            <section key={cat} id={cat} className="scroll-mt-20">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{CATEGORY_EMOJI[cat]}</span>
                <div>
                  <h2
                    className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-0.5 max-w-xl">
                    {CATEGORY_DESCRIPTIONS[cat]}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {programs.map((p) => (
                  <div
                    key={p.id}
                    className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            className="text-base font-bold text-zinc-900 dark:text-zinc-100"
                            style={{ fontFamily: "Syne, sans-serif" }}
                          >
                            {p.name}
                          </h3>
                          {p.verified && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-green-950 text-green-400 border border-green-900 rounded font-bold uppercase tracking-wider">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs max-w-xl leading-relaxed">
                          {p.summary}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest flex-shrink-0 ${p.tagColor}`}
                      >
                        {p.tag}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-1">
                          Funding
                        </p>
                        <p className="text-xs text-green-400 font-bold leading-tight">
                          {p.funding}
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-1">
                          Equity
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            p.equity === "None"
                              ? "text-green-400"
                              : "text-orange-400"
                          }`}
                        >
                          {p.equity}
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-1">
                          Remote
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            p.remote ? "text-green-400" : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {p.remote ? "✓ Yes" : "Partial"}
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-1">
                          Deadline
                        </p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-tight">{p.deadline}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-2">
                          What you get
                        </p>
                        <ul className="space-y-1.5">
                          {p.details.map((d, i) => (
                            <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start">
                              <Check />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-2">
                            Best stage
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.stage.map((s) => (
                              <StagePill key={s} stage={s} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-600 mb-2">
                            Sectors
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.sectors.map((s) => (
                              <span
                                key={s}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        {p.verifiedNote && (
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-600 italic leading-relaxed">
                            Source: {p.verifiedNote}
                          </p>
                        )}
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 border border-green-900 hover:border-green-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Apply / Learn more →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mb-16">
          <h2
            className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-6"
          >
            Common Questions
          </h2>
          <div className="space-y-4">
            {FOUNDER_FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl p-5"
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{faq.q}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/japa-dev/visa"
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-5 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">
              Also on JapaDev
            </p>
            <p
              className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:hover:text-white transition-colors"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              UK Visa Guide →
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
              Every UK visa route for Nigerian tech workers, honestly assessed.
            </p>
          </Link>
          <Link
            href="/japa-dev"
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl p-5 transition-colors group"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">
              Also on JapaDev
            </p>
            <p
              className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:hover:text-white transition-colors"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Job Tracker →
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
              Track remote and Web3 job applications with curated boards and outreach scripts.
            </p>
          </Link>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-600">
          <span>JapaDev · Built by a Nigerian dev, for Nigerian devs</span>
          <a
            href="https://github.com/KodaZenji"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            GitHub →
          </a>
        </div>
      </main>
    </div>
  );
}
