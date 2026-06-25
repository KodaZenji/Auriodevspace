import Link from "next/link";
import { VISA_ROUTES, VISA_FAQS } from "@/lib/visaData";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "UK Visa Routes for Nigerian Tech Workers | JapaDev",
  description: "A plain-English breakdown of every UK visa route relevant to Nigerian developers in 2026 — with honest assessments for ND and BSc holders.",
};

function Check() {
  return <span className="text-green-400 mr-2 flex-shrink-0">✓</span>;
}
function Cross() {
  return <span className="text-red-400 mr-2 flex-shrink-0">✗</span>;
}

export default function VisaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080808] text-zinc-800 dark:text-zinc-200" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>

      <header className="border-b border-zinc-200 dark:border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#080808]/95 backdrop-blur z-40">
        <Link href="/japa-dev" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-widest uppercase hover:text-green-400 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
          ← JapaDev
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/japa-dev/canada" className="text-xs text-zinc-600 dark:text-zinc-500 hover:text-red-400 transition-colors">
            🍁 Canada Guide
          </Link>
          <span className="text-zinc-500 dark:text-zinc-600 text-xs hidden sm:inline">UK Visa Guide · 2026</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        <div className="mb-10">
          <div className="inline-block text-xs px-3 py-1 bg-green-950 text-green-400 border border-green-800 rounded-full mb-4 uppercase tracking-widest">
            Free · No agents · Updated 2026
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            UK Visa Routes for<br />Nigerian Tech Workers
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Plain English. No fluff. Every realistic UK visa route for Nigerian developers in 2026 —
            with honest assessments for both <span className="text-zinc-800 dark:text-zinc-200">ND holders</span> and <span className="text-zinc-800 dark:text-zinc-200">BSc holders</span>.
          </p>
          <div className="mt-5 p-4 bg-zinc-100 dark:bg-zinc-900 border border-yellow-900 rounded-xl text-xs text-yellow-400 leading-relaxed">
            ⚠️ This is not legal advice. Immigration rules change frequently. Always verify at{" "}
            <a href="https://gov.uk/browse/visas-immigration" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">gov.uk</a> before applying.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4">
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2">🎓 With an ND</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your portfolio does more work than your certificate. The £41,700 salary floor is your biggest enemy —
              most junior ND-level offers won't clear it. Strongest route: remote job first, then sponsored relocation.
              Or: UK BSc top-up via Student Visa.
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-green-900 rounded-xl p-4">
            <p className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">🎓 With a BSc</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              More employer doors open. You're competitive for mid-level roles that clear the salary threshold.
              Skilled Worker becomes your primary route. Global Talent becomes a realistic 3–5 year target.
              Student Visa is no longer necessary.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-4">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 dark:border-zinc-800">
                  <th className="text-left py-3 pr-4 text-zinc-600 dark:text-zinc-400 font-normal">Route</th>
                  <th className="text-left py-3 pr-4 text-zinc-600 dark:text-zinc-400 font-normal">Leads to ILR?</th>
                  <th className="text-left py-3 pr-4 text-zinc-600 dark:text-zinc-400 font-normal">ND realistic?</th>
                  <th className="text-left py-3 pr-4 text-zinc-600 dark:text-zinc-400 font-normal">BSc realistic?</th>
                  <th className="text-left py-3 text-zinc-600 dark:text-zinc-400 font-normal">Cost (approx)</th>
                </tr>
              </thead>
              <tbody>
                {VISA_ROUTES.map((route) => (
                  <tr key={route.id} className="border-b border-zinc-200 dark:border-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 pr-4">
                      <a href={`#${route.id}`} className="text-zinc-800 dark:text-zinc-200 hover:text-green-400 transition-colors">{route.name}</a>
                    </td>
                    <td className="py-3 pr-4">
                      {route.leadsToPR ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {route.realisticForND ? <span className="text-green-400">Yes</span> : <span className="text-zinc-600 dark:text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {route.realisticForBSc ? <span className="text-green-400">Yes</span> : <span className="text-zinc-600 dark:text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">{route.cost.split("·")[0].split("+")[0].trim()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8 mb-16">
          <h2 className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500">All Routes — Detailed</h2>

          {VISA_ROUTES.map((route) => (
            <div key={route.id} id={route.id} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 scroll-mt-20">

              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100" style={{ fontFamily: "Syne, sans-serif" }}>{route.name}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1 max-w-xl">{route.summary}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest flex-shrink-0 ${route.tagColor}`}>
                  {route.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className={`text-xs px-3 py-2 rounded-lg border ${route.realisticForND ? "bg-green-950 border-green-900 text-green-300" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500"}`}>
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    {route.realisticForND ? "✓ ND — Realistic" : "✗ ND — Not realistic"}
                  </span>
                  {route.realisticNote}
                </div>
                <div className={`text-xs px-3 py-2 rounded-lg border ${route.realisticForBSc ? "bg-blue-950 border-blue-900 text-blue-300" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500"}`}>
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    {route.realisticForBSc ? "✓ BSc — Realistic" : "✗ BSc — Not realistic"}
                  </span>
                  {route.bscNote}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">Requirements</p>
                    <ul className="space-y-1.5">
                      {route.requirements.map((r, i) => (
                        <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                          <span className="text-zinc-500 dark:text-zinc-600 mt-0.5 flex-shrink-0">·</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {route.salaryThreshold && (
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-1">Salary Threshold</p>
                      <p className="text-sm font-bold text-orange-400">{route.salaryThreshold}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-1">Processing</p>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300">{route.processingTime}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-1">ILR?</p>
                      <p className={`text-xs font-bold ${route.leadsToPR ? "text-green-400" : "text-red-400"}`}>
                        {route.leadsToPR ? `Yes — ${route.prTimeline}` : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">Pros</p>
                    <ul className="space-y-1.5">
                      {route.pros.map((p, i) => (
                        <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start"><Check />{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">Cons</p>
                    <ul className="space-y-1.5">
                      {route.cons.map((c, i) => (
                        <li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start"><Cross />{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-1">Cost</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{route.cost}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-6">Common Questions</h2>
          <div className="space-y-4">
            {VISA_FAQS.map((faq, i) => (
              <div key={i} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">{faq.q}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-900 border border-red-900/50 rounded-2xl p-6 mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-500 mb-2">Also on JapaDev</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100" style={{ fontFamily: "Syne, sans-serif" }}>
                🍁 Canada Visa Guide
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">
                Canada is more achievable than the UK for ND holders. Compare routes side by side.
              </p>
            </div>
            <Link href="/japa-dev/canada" className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 px-4 py-2 rounded-lg transition-colors flex-shrink-0">
              View Canada Guide →
            </Link>
          </div>
        </div>

        <div className="bg-zinc-100 dark:bg-zinc-900 border border-green-900 rounded-2xl p-6 text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Ready to start applying?</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">Track applications, access curated job boards, and use ready-made outreach scripts.</p>
          <Link href="/japa-dev" className="inline-block bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-colors">
            Open Job Tracker →
          </Link>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-600">
          <span>JapaDev · Built by a Nigerian dev, for Nigerian devs</span>
          <a href="https://github.com/KodaZenji/Auriodevspace" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:text-zinc-400 transition-colors">GitHub →</a>
        </div>
      </main>
    </div>
  );
}
