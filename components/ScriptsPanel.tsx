"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { OUTREACH_SCRIPT, ROBERT_SUN_SCRIPT } from "@/lib/data";

interface Props { onToast: (msg: string) => void }

function ScriptCard({ title, subtitle, script, onToast }: {
  title: string; subtitle: string; script: string; onToast: (m: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    onToast("Copied to clipboard ✓");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 transition-colors"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono">
        {script}
      </pre>
    </div>
  );
}

export default function ScriptsPanel({ onToast }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-zinc-500 text-sm mb-5">
        Copy these and personalize before sending. Replace <span className="text-green-400 font-mono">[Name]</span> with the actual person.
      </p>
      <ScriptCard
        title="Cold Outreach — Hiring Managers / CTOs"
        subtitle="Use on LinkedIn, email, or Twitter/X DMs"
        script={OUTREACH_SCRIPT}
        onToast={onToast}
      />
      <ScriptCard
        title="CTO or contact Person Follow-up"
        subtitle="Send this after an established connection, highest ROI. Dont Spam aggressively!"
        script={ROBERT_SUN_SCRIPT}
        onToast={onToast}
      />
    </div>
  );
}
