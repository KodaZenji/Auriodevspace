"use client";
import { X } from "lucide-react";
import { Application, Status } from "@/types";
import { STATUS_STYLES, STATUSES } from "@/lib/data";

interface Props {
  onAdd: (app: Omit<Application, "id">) => void;
  onClose: () => void;
}

export default function AddModal({ onAdd, onClose }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onAdd({
      company: fd.get("company") as string,
      role: fd.get("role") as string,
      site: fd.get("site") as string,
      url: fd.get("url") as string,
      status: fd.get("status") as Status,
      notes: fd.get("notes") as string,
      date: fd.get("date") as string,
    });
  };

  const inputClass = "w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-green-600 placeholder-zinc-600 font-mono";
  const labelClass = "block text-xs text-zinc-400 uppercase tracking-widest mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-widest">Log Application</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company *</label>
              <input name="company" required placeholder="Coinbase" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Role *</label>
              <input name="role" required placeholder="Frontend Engineer" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Board</label>
              <input name="site" placeholder="Wellfound" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue="Applied" className={inputClass}>
                {STATUSES.filter(s => s !== "All").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Job URL</label>
            <input name="url" type="url" placeholder="https://..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date Applied</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} placeholder="Recruiter name, follow-up date..." className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg text-sm transition-colors">
              Log it
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
