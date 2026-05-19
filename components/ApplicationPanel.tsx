"use client";
import { useState } from "react";
import { Trash2, ExternalLink, ChevronDown } from "lucide-react";
import { Application, Status } from "@/types";
import { STATUSES, STATUS_STYLES } from "@/lib/data";

interface Props {
  applications: Application[];
  onUpdate: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

export default function ApplicationsPanel({ applications, onUpdate, onDelete }: Props) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = applications.filter(a => {
    const matchStatus = filter === "All" || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch = a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search company or role..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-green-600 placeholder-zinc-600 font-mono"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-mono ${
                filter === s
                  ? "bg-green-950 text-green-400 border-green-800"
                  : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-sm font-mono">No applications yet. Start applying!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(app => {
            const style = STATUS_STYLES[app.status];
            return (
              <div
                key={app.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-colors group"
              >
                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-200 text-sm font-bold truncate">{app.company}</span>
                    <span className="text-zinc-600 text-xs">·</span>
                    <span className="text-zinc-400 text-xs truncate">{app.role}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {app.site && <span className="text-zinc-600 text-xs">{app.site}</span>}
                    {app.date && <span className="text-zinc-700 text-xs">{app.date}</span>}
                    {app.notes && <span className="text-zinc-600 text-xs truncate max-w-xs">{app.notes}</span>}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={e => onUpdate(app.id, e.target.value as Status)}
                      className={`appearance-none text-xs px-2 py-1 pr-6 rounded border font-mono cursor-pointer focus:outline-none ${style.bg} ${style.text} ${style.border}`}
                    >
                      {STATUSES.filter(s => s !== "All").map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={10} className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${style.text}`} />
                  </div>

                  {app.url && (
                    <a href={app.url} target="_blank" rel="noopener noreferrer"
                      className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <ExternalLink size={13} />
                    </a>
                  )}

                  <button
                    onClick={() => onDelete(app.id)}
                    className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
