"use client";
import { ExternalLink, GitBranch, Users } from "lucide-react";
import { COMMUNITY_BOARDS, GITHUB_ISSUE_URL } from "@/lib/communityData";

interface Props { onToast: (msg: string) => void }

export default function CommunityPanel({ onToast }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Users size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-zinc-200">Community Job Boards</p>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              Submitted by Nigerian and African devs who've personally used these boards.
              Know one we're missing? Submit it via GitHub.
            </p>
          </div>
        </div>
        <a
          href={GITHUB_ISSUE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <GitBranch size={13} />
          Submit a Board
        </a>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { step: "01", text: "Click Submit a Board above" },
          { step: "02", text: "Fill in the GitHub issue form" },
          { step: "03", text: "We review and add it here" },
        ].map((s) => (
          <div key={s.step} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
            <span className="text-green-400 font-bold text-xs font-mono">{s.step}</span>
            <span className="text-zinc-400 text-xs">{s.text}</span>
          </div>
        ))}
      </div>

      {/* Board list */}
      {COMMUNITY_BOARDS.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-sm font-mono">No community boards yet.</p>
          <p className="text-xs mt-1">Be the first to submit one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">
            {COMMUNITY_BOARDS.length} board{COMMUNITY_BOARDS.length !== 1 ? "s" : ""} submitted
          </p>
          {COMMUNITY_BOARDS.map((board) => (
            <div
              key={board.name}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-200 text-sm font-bold">{board.name}</span>
                  <span className="text-zinc-600 text-xs">{board.category}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {board.remote && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-950 text-blue-400 border border-blue-900 rounded font-bold uppercase tracking-wider">
                      Remote
                    </span>
                  )}
                  {board.nigerianFriendly && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-green-950 text-green-400 border border-green-900 rounded font-bold uppercase tracking-wider">
                      🇳🇬 Friendly
                    </span>
                  )}
                  {board.note && (
                    <span className="text-zinc-500 text-xs">{board.note}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-zinc-600 text-xs hidden sm:block">
                  via {board.submittedBy}
                </span>
                <a
                  href={board.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Visit <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to action bottom */}
      <div className="mt-8 p-4 bg-zinc-950 border border-dashed border-zinc-700 rounded-xl text-center">
        <p className="text-xs text-zinc-500 mb-3">
          Know a job board that works for Nigerian devs? Help the community.
        </p>
        <a
          href={GITHUB_ISSUE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600 px-4 py-2 rounded-lg transition-colors"
        >
          <GitBranch size={12} />
          Submit via GitHub Issues
        </a>
      </div>
    </div>
  );
}
