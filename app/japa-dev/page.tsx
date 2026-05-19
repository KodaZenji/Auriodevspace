"use client";
import { useState, useCallback } from "react";
import { Plus, LayoutGrid, Briefcase, MessageSquare, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Application, Status } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import StatsBar from "@/components/StatsBar";
import BoardsPanel from "@/components/BoardsPanel";
import ApplicationsPanel from "@/components/ApplicationsPanel";
import ScriptsPanel from "@/components/ScriptsPanel";
import CommunityPanel from "@/components/CommunityPanel";
import AddModal from "@/components/AddModal";

type Tab = "boards" | "applications" | "scripts" | "community";

export default function Home() {
  const [applications, setApplications] = useLocalStorage<Application[]>("ben-job-apps", []);
  const [activeTab, setActiveTab] = useState<Tab>("boards");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const addApplication = (app: Omit<Application, "id">) => {
    const newApp: Application = { ...app, id: Date.now().toString() };
    setApplications(prev => [newApp, ...prev]);
    setShowAdd(false);
    showToast("Application logged ✓");
  };

  const updateStatus = (id: string, status: Status) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteApp = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    showToast("Removed");
  };

  const tabs = [
    { id: "boards" as Tab, label: "Job Boards", icon: LayoutGrid },
    { id: "applications" as Tab, label: `Applications (${applications.length})`, icon: Briefcase },
    { id: "scripts" as Tab, label: "Outreach Scripts", icon: MessageSquare },
    { id: "community" as Tab, label: "Community", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-200" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@700;800&display=swap');`}</style>

      <header className="border-b border-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080808]/95 backdrop-blur z-40">
        <div>
          <h1 className="text-sm font-bold text-zinc-100 tracking-widest uppercase" style={{ fontFamily: "Syne, sans-serif" }}>
            JapaDev
          </h1>
          <p className="text-zinc-600 text-xs mt-0.5">Job tracker for Nigerian devs going global · 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/japa-dev/visa"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-green-400 border border-zinc-800 hover:border-green-800 px-3 py-2 rounded-lg transition-colors"
          >
            <FileText size={12} />
            UK Visa Guide
          </Link>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Log Application
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <StatsBar applications={applications} />

        <div className="bg-zinc-900 border border-green-900 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-green-400 mt-0.5 flex-shrink-0 text-base">✓</span>
          <div>
            <p className="text-xs text-green-400 font-bold uppercase tracking-widest mb-1">Daily Targets</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <span className="text-zinc-200">Morning:</span> Apply to 5–10 roles ·{" "}
              <span className="text-zinc-200">Afternoon:</span> Send 3–5 LinkedIn connection requests ·{" "}
              <span className="text-zinc-200">Evening:</span> Post a build update on X or Farcaster
            </p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-fit overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "boards" && <BoardsPanel onToast={showToast} />}
        {activeTab === "applications" && (
          <ApplicationsPanel
            applications={applications}
            onUpdate={updateStatus}
            onDelete={deleteApp}
          />
        )}
        {activeTab === "scripts" && <ScriptsPanel onToast={showToast} />}
        {activeTab === "community" && <CommunityPanel onToast={showToast} />}
      </main>

      {showAdd && <AddModal onAdd={addApplication} onClose={() => setShowAdd(false)} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-4 py-2 rounded-full font-mono shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
