import Link from "next/link";
import { CANADA_ROUTES, CANADA_FAQS } from "@/lib/canadaData";

export const metadata = {
  title: "Canada Visa Routes for Nigerian Tech Workers | JapaDev",
  description: "Every realistic Canadian immigration route for Nigerian developers in 2026 — honestly assessed for ND and BSc holders.",
};

function Check() {
  return <span className="text-green-400 mr-2 flex-shrink-0">✓</span>;
}
function Cross() {
  return <span className="text-red-400 mr-2 flex-shrink-0">✗</span>;
}

export default function CanadaPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-zinc-200" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Nav */}
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080808]/95 backdrop-blur z-40">
        <Link href="/japa-dev" className="text-sm font-bold text-zinc-100 tracking-widest uppercase hover:text-green-400 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
          ← JapaDev
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/japa-dev/visa" className="text-xs text-zinc-500 hover:text-green-400 transition-colors">
            🇬🇧 UK Guide
          </Link>
          <span className="text-zinc-600 text-xs">Canada Visa Guide · 2026</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-block text-xs px-3 py-1 bg-red-950 text-red-400 border border-red-800 rounded-full mb-4 uppercase tracking-widest">
            🍁 Free · No agents · Updated 2026
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4 leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Canada Visa Routes for<br />Nigerian Tech Workers
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Canada is more accessible than the UK for Nigerian developers — especially with an ND.
            Here's every realistic route in 2026, honestly assessed for both{" "}
            <span className="text-zinc-200">ND holders</span> and <span className="text-zinc-200">BSc holders</span>.
          </p>
          <div className="mt-5 p-4 bg-zinc-900 border border-yellow-900 rounded-xl text-xs text-yellow-400 leading-relaxed">
            ⚠️ Not legal advice. Immigration rules change. Always verify at{" "}
            <a href="https://www.canada.ca/en/immigration-refugees-citizenship.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">
              canada.ca/immigration
            </a>{" "}
            before applying.
          </div>
        </div>

        {/* ND vs BSc callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">🎓 With an ND</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              WES assesses your ND as a 2-year college diploma, not a degree — this costs CRS points.
              Your best route is <span className="text-zinc-200">PNP via a Canadian job offer</span>, or
              Study Permit → PGWP → CEC. Express Entry direct is hard without boosters.
            </p>
          </div>
          <div className="bg-zinc-900 border border-red-900 rounded-xl p-4">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">🎓 With a BSc</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              WES assesses your BSc as a Canadian bachelor's degree — adds 30–50 CRS points.
              Express Entry FSW becomes competitive. More PNP streams open up.
              <span className="text-zinc-200"> Canada gets meaningfully easier with a degree.</span>
            </p>
          </div>
        </div>

        {/* UK vs Canada quick comparison */}
        <div className="mb-12 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Canada vs UK — At a Glance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 pr-4 text-zinc-500 font-normal">Factor</th>
                  <th className="text-left py-2 pr-4 text-zinc-400 font-normal">🇬🇧 UK</th>
                  <th className="text-left py-2 text-red-400 font-normal">🍁 Canada</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  ["ND friendliness", "Hard — £41,700 salary floor", "Better — points-based, PNP options"],
                  ["BSc advantage", "Opens more sponsored roles", "Adds 30–50 CRS points directly"],
                  ["Dependant's options", "Dependent only", "Open work permit, works freely"],
                  ["PR timeline", "5 years minimum", "2–3 years via PNP possible"],
                  ["Cost of living", "Very high (London)", "High but lower than London"],
                  ["Nigerian community", "Large", "Very large — Toronto especially"],
                  ["Political long game", "✓ More relevant", "Less relevant for Nigeria"],
                  ["Path to citizenship", "6 years min", "~4–5 years after PR"],
                ].map(([factor, uk, ca], i) => (
                  <tr key={i} className="border-b border-zinc-900">
                    <td className="py-2 pr-4 text-zinc-500">{factor}</td>
                    <td className="py-2 pr-4 text-zinc-300">{uk}</td>
                    <td className="py-2 text-zinc-300">{ca}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick comparison */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Quick Route Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Route</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Leads to PR?</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">ND realistic?</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">BSc realistic?</th>
                  <th className="text-left py-3 text-zinc-400 font-normal">Entry route?</th>
                </tr>
              </thead>
              <tbody>
                {CANADA_ROUTES.map((route) => (
                  <tr key={route.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 pr-4">
                      <a href={`#${route.id}`} className="text-zinc-200 hover:text-red-400 transition-colors">{route.name}</a>
                    </td>
                    <td className="py-3 pr-4">
                      {route.leadsToPR ? <span className="text-green-400">Yes</span> : <span className="text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {route.realisticForND ? <span className="text-green-400">Yes</span> : <span className="text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {route.realisticForBSc ? <span className="text-green-400">Yes</span> : <span className="text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 text-zinc-400">
                      {["pnp", "study-pgwp", "iec"].includes(route.id) ? <span className="text-green-400">Yes</span> : <span className="text-zinc-500">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route cards */}
        <div className="space-y-8 mb-16">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">All Routes — Detailed</h2>

          {CANADA_ROUTES.map((route) => (
            <div key={route.id} id={route.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 scroll-mt-20">

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100" style={{ fontFamily: "Syne, sans-serif" }}>{route.name}</h3>
                  <p className="text-zinc-400 text-xs mt-1 max-w-xl">{route.summary}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest flex-shrink-0 ${route.tagColor}`}>
                  {route.tag}
                </span>
              </div>

              {/* ND vs BSc badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className={`text-xs px-3 py-2 rounded-lg border ${route.realisticForND ? "bg-green-950 border-green-900 text-green-300" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    {route.realisticForND ? "✓ ND — Realistic" : "✗ ND — Not realistic"}
                  </span>
                  {route.realisticNote}
                </div>
                <div className={`text-xs px-3 py-2 rounded-lg border ${route.realisticForBSc ? "bg-blue-950 border-blue-900 text-blue-300" : "bg-zinc-950 border-zinc-800 text-zinc-500"}`}>
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    {route.realisticForBSc ? "✓ BSc — Realistic" : "✗ BSc — Not realistic"}
                  </span>
                  {route.bscNote}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Requirements</p>
                    <ul className="space-y-1.5">
                      {route.requirements.map((r, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-zinc-600 mt-0.5 flex-shrink-0">·</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Processing</p>
                      <p className="text-xs text-zinc-300">{route.processingTime}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Leads to PR?</p>
                      <p className={`text-xs font-bold ${route.leadsToPR ? "text-green-400" : "text-red-400"}`}>
                        {route.leadsToPR ? `Yes — ${route.prTimeline}` : "No — stepping stone only"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Cost</p>
                    <p className="text-xs text-zinc-300">{route.cost}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Pros</p>
                    <ul className="space-y-1.5">
                      {route.pros.map((p, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start"><Check />{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Cons</p>
                    <ul className="space-y-1.5">
                      {route.cons.map((c, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start"><Cross />{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-6">Common Questions</h2>
          <div className="space-y-4">
            {CANADA_FAQS.map((faq, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-bold text-zinc-100 mb-2">{faq.q}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link href="/japa-dev/visa" className="bg-zinc-900 border border-zinc-800 hover:border-green-900 rounded-xl p-5 transition-colors group">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Compare with</p>
            <p className="text-sm font-bold text-zinc-200 group-hover:text-green-300 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>🇬🇧 UK Visa Guide →</p>
            <p className="text-xs text-zinc-500 mt-1">Higher salary bar, stronger political long game.</p>
          </Link>
          <Link href="/japa-dev" className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors group">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Back to</p>
            <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>Job Tracker →</p>
            <p className="text-xs text-zinc-500 mt-1">Track remote and Web3 applications.</p>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-600">
          <span>JapaDev · Built by a Nigerian dev, for Nigerian devs</span>
          <a href="https://github.com/KodaZenji/Auriodevspace" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">GitHub →</a>
        </div>
      </main>
    </div>
  );
}
