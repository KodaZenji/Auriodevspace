import Link from "next/link";
import { VISA_ROUTES, VISA_FAQS } from "@/lib/visaData";

export const metadata = {
  title: "UK Visa Routes for Nigerian Tech Workers | JapaDev",
  description:
    "A plain-English breakdown of every UK visa route relevant to Nigerian developers in 2026. No fluff, no agents — just the facts.",
};

function Check() {
  return <span className="text-green-400 mr-2">✓</span>;
}
function Cross() {
  return <span className="text-red-400 mr-2">✗</span>;
}

export default function VisaPage() {
  return (
    <div
      className="min-h-screen bg-[#080808] text-zinc-200"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Nav */}
      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080808]/95 backdrop-blur z-40">
        <Link href="/japa-dev" className="text-sm font-bold text-zinc-100 tracking-widest uppercase hover:text-green-400 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
          ← JapaDev
        </Link>
        <span className="text-zinc-600 text-xs">UK Visa Guide · 2026</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-block text-xs px-3 py-1 bg-green-950 text-green-400 border border-green-800 rounded-full mb-4 uppercase tracking-widest">
            Free · No agents · Updated 2026
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4 leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            UK Visa Routes for<br />Nigerian Tech Workers
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Plain English. No fluff. This page covers every realistic UK visa route for Nigerian developers, 
            designers, and tech workers in 2026 — with honest assessments of what actually works for 
            someone with an ND or HND and a solid portfolio.
          </p>
          <div className="mt-6 p-4 bg-zinc-900 border border-yellow-900 rounded-xl text-xs text-yellow-400 leading-relaxed">
            ⚠️ This is not legal advice. Immigration rules change frequently. Always verify current requirements 
            at <a href="https://gov.uk/browse/visas-immigration" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">gov.uk</a> before applying. When in doubt, consult a licensed immigration adviser.
          </div>
        </div>

        {/* Quick comparison */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Route</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Job offer needed?</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Leads to ILR?</th>
                  <th className="text-left py-3 pr-4 text-zinc-400 font-normal">Realistic for ND?</th>
                  <th className="text-left py-3 text-zinc-400 font-normal">Cost (approx)</th>
                </tr>
              </thead>
              <tbody>
                {VISA_ROUTES.map((route) => (
                  <tr key={route.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 pr-4">
                      <a href={`#${route.id}`} className="text-zinc-200 hover:text-green-400 transition-colors">
                        {route.name}
                      </a>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {["skilled-worker", "student"].includes(route.id) ? "Yes" :
                       route.id === "global-talent" ? "No" :
                       route.id === "graduate" ? "N/A" : "No"}
                    </td>
                    <td className="py-3 pr-4">
                      {route.leadsToPR
                        ? <span className="text-green-400">Yes</span>
                        : <span className="text-red-400">No</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {route.realisticForND
                        ? <span className="text-green-400">Yes</span>
                        : <span className="text-zinc-500">No</span>}
                    </td>
                    <td className="py-3 text-zinc-400">{route.cost.split("·")[0].split("+")[0].trim()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Route cards */}
        <div className="space-y-8 mb-16">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500">All Routes — Detailed</h2>

          {VISA_ROUTES.map((route) => (
            <div
              key={route.id}
              id={route.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 scroll-mt-20"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100" style={{ fontFamily: "Syne, sans-serif" }}>
                    {route.name}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 max-w-xl">{route.summary}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest flex-shrink-0 ${route.tagColor}`}>
                  {route.tag}
                </span>
              </div>

              {/* Realistic badge */}
              <div className={`text-xs px-3 py-2 rounded-lg mb-5 border ${
                route.realisticForND
                  ? "bg-green-950 border-green-900 text-green-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}>
                <span className="font-bold uppercase tracking-wider mr-2">
                  {route.realisticForND ? "✓ Realistic for ND holders" : "✗ Not realistic yet"}
                </span>
                — {route.realisticNote}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Requirements</p>
                    <ul className="space-y-1.5">
                      {route.requirements.map((r, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-zinc-600 mt-0.5 flex-shrink-0">·</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {route.salaryThreshold && (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Salary Threshold</p>
                      <p className="text-sm font-bold text-orange-400">{route.salaryThreshold}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Processing</p>
                      <p className="text-xs text-zinc-300">{route.processingTime}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Leads to ILR?</p>
                      <p className={`text-xs font-bold ${route.leadsToPR ? "text-green-400" : "text-red-400"}`}>
                        {route.leadsToPR ? `Yes — ${route.prTimeline}` : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Pros</p>
                    <ul className="space-y-1.5">
                      {route.pros.map((p, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start">
                          <Check />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Cons</p>
                    <ul className="space-y-1.5">
                      {route.cons.map((c, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start">
                          <Cross />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Cost</p>
                    <p className="text-xs text-zinc-300">{route.cost}</p>
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
            {VISA_FAQS.map((faq, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-bold text-zinc-100 mb-2">{faq.q}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-zinc-900 border border-green-900 rounded-2xl p-6 text-center">
          <p className="text-sm font-bold text-zinc-100 mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
            Ready to start applying?
          </p>
          <p className="text-xs text-zinc-400 mb-4">
            Track your applications, access curated job boards, and use ready-made outreach scripts.
          </p>
          <Link
            href="/jobs"
            className="inline-block bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Open Job Tracker →
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-600">
          <span>JapaDev · Built by a Nigerian dev, for Nigerian devs</span>
          <a
            href="https://github.com/KodaZenji"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            GitHub →
          </a>
        </div>
      </main>
    </div>
  );
}
