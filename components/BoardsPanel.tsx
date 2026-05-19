"use client";
import { ExternalLink, Zap } from "lucide-react";
import { JOB_BOARDS } from "@/lib/data";

interface Props { onToast: (msg: string) => void }

export default function BoardsPanel({ onToast }: Props) {
  const openAll = () => {
    JOB_BOARDS.forEach(cat => cat.sites.forEach(s => window.open(s.url, "_blank")));
    onToast(`Opening all ${JOB_BOARDS.reduce((a, c) => a + c.sites.length, 0)} job boards...`);
  };

  const openCategory = (sites: typeof JOB_BOARDS[0]["sites"], name: string) => {
    sites.forEach(s => window.open(s.url, "_blank"));
    onToast(`Opening ${sites.length} ${name} sites...`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-zinc-400 text-sm">Click a site to open it, or blast open an entire category at once.</p>
        <button
          onClick={openAll}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <Zap size={14} />
          Open All ({JOB_BOARDS.reduce((a, c) => a + c.sites.length, 0)} sites)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {JOB_BOARDS.map(cat => (
          <div key={cat.category} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">
                {cat.emoji} {cat.category}
              </h3>
              <button
                onClick={() => openCategory(cat.sites, cat.category)}
                className="text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 px-2 py-1 rounded transition-colors"
              >
                Open all
              </button>
            </div>
            <div className="space-y-2">
              {cat.sites.map(site => (
                <a
                  key={site.name}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-lg group transition-all"
                >
                  <span className="text-zinc-300 text-xs group-hover:text-white transition-colors">
                    {site.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {site.tag && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        site.tag === "HOT" ? "bg-orange-900 text-orange-400" :
                        "bg-indigo-900 text-indigo-400"
                      }`}>
                        {site.tag}
                      </span>
                    )}
                    <ExternalLink size={11} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
