"use client";
import { Application } from "@/types";

interface Props { applications: Application[] }

export default function StatsBar({ applications }: Props) {
  const stats = [
    { label: "Total", value: applications.length, color: "text-zinc-300" },
    { label: "Applied", value: applications.filter(a => a.status === "Applied").length, color: "text-green-400" },
    { label: "Interviewing", value: applications.filter(a => a.status === "Interviewing").length, color: "text-indigo-400" },
    { label: "Offers", value: applications.filter(a => a.status === "Offer").length, color: "text-orange-400" },
    { label: "Rejected", value: applications.filter(a => a.status === "Rejected").length, color: "text-red-400" },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
          <div className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
