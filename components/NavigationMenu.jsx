'use client';

import { useState } from 'react';
import { Menu, X, Coffee } from 'lucide-react';
import BuyMeCoffee from './BuyMeCoffee';

export default function NavigationMenu({ menuOpen, onToggle }) {
  const [showCoffee, setShowCoffee] = useState(false);

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
            Menu
          </h2>

          <nav className="space-y-2">

            {/* Kaito Inner CT Link */}
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
                  Influential Accounts 
                </div>
              </div>
            </a>
            {/* Buy Me Coffee Button */}
            <button
              onClick={() => {
                setShowCoffee(true);
                onToggle();
              }}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg transition-all group shadow-lg"
            >
              <Coffee className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-white font-medium">
                  Buy Me a Coffee ☕
                </div>
                <div className="text-emerald-100 text-xs">
                  Support the project
                </div>
              </div>
            </button>
          </nav>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-xs text-gray-400 text-center">
              Made with 💚 by Aurio
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Buy Me Coffee Modal */}
      <BuyMeCoffee isOpen={showCoffee} onClose={() => setShowCoffee(false)} />
    </>
  );
}
