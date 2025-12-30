import { Menu, X } from 'lucide-react';

export default function NavigationMenu({ menuOpen, onToggle }) {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="p-3 bg-slate-800 rounded-lg border border-emerald-500/50 hover:bg-slate-700 transition-all"
        >
          {menuOpen ? (
            <X className="w-6 h-6 text-emerald-400" />
          ) : (
            <Menu className="w-6 h-6 text-emerald-400" />
          )}
        </button>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-slate-900 border-l border-slate-700 z-40 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 pt-20">
          <h2 className="text-2xl font-bold mb-6" style={{
            background: 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            
          </h2>

          <nav className="space-y-2">
            <a
              href="/kaito-inner-ct"
              className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group"
            >
              <img 
                src="/kaito-Logo.png" 
                alt="Kaito" 
                className="w-8 h-8 rounded-lg group-hover:scale-110 transition-transform"
              />
              <div>
                <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                  Inner CT
                </div>
              </div>
            </a>
          </nav>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}
