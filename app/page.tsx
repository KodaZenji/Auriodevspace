'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import RankFinder from './rankfinder/page';   
import sonicCalculator from './sonicCalculator';   

export default function HomePage() {
  const [active, setActive] = useState<'rankfinder' | 'calculator' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = [
    {
      id: 'rankfinder',
      title: 'Goat Network-Rank Checker',
      description: 'Discover your leaderboard position across different timeframes',
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      shadowColor: 'shadow-amber-500/20',
      hoverShadow: 'hover:shadow-amber-500/30',
      glowColor: 'shadow-amber-400/25',
    },
    {
      id: 'calculator',
      title: 'SonicLabs Rewards Calculator',
      description: 'Estimate your S token rewards based on leaderboard rankings for season1',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      shadowColor: 'shadow-orange-500/20',
      hoverShadow: 'hover:shadow-orange-500/30',
      glowColor: 'shadow-orange-400/25',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-amber-900/10"></div>
      
      <main className="relative min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
            }`}
          >
            <h1 
              className="text-5xl font-bold mb-4 animate-pulse-glow"
              style={{ 
                background: 'linear-gradient(135deg, #ffa500, #ff8c00, #ffd700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 165, 0, 0.3)'
              }}
            >
              Aurio Devspace and Tools
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive analytics and rewards estimation tool based on available data
            </p>
          </div>

          {/* Dashboard cards */}
          {!active && (
            <div className="grid gap-8 md:grid-cols-2 mb-12">
              {modules.map((mod, index) => {
                return (
                  <div
                    key={mod.id}
                    className={`card-entrance transition-all duration-500 ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                    }`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                    onClick={() => setActive(mod.id as 'rankfinder' | 'calculator')}
                  >
                    <div 
                      className="sonic-card group cursor-pointer relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                    >
                      {/* Gradient overlay on hover */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-glow-animation" />

                      <div className="relative text-center">
                        <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-300 transition-colors duration-300">
                          {mod.title}
                        </h2>
                        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300 mb-6">
                          {mod.description}
                        </p>
                        
                        <div className="flex items-center justify-center text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                          <span className="text-sm font-semibold">Launch Tool</span>
                          <div className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active tool container */}
          {active && (
            <div className="tool-container">
              {/* Close button */}
              <button
                onClick={() => setActive(null)}
                className="close-button absolute top-4 right-4 z-10 p-3 rounded-full text-white hover:text-orange-300 transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tool container */}
              <div className="sonic-tool-container rounded-2xl overflow-hidden">
                {active === 'rankfinder' && <RankFinder />}
                {active === 'calculator' && <Calculator />}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!active && (
            <div
              className={`text-center py-12 transition-all duration-700 ${
                mounted ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="empty-state inline-block p-8 rounded-2xl">
                <p className="text-gray-400 text-lg">
                  Select a tool above to get started with your Sonic ecosystem analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        /* CSS Animations and Styles */
        .sonic-card {
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid rgba(255, 165, 0, 0.4);
          box-shadow: 0 0 20px rgba(255, 165, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .sonic-card:hover {
          box-shadow: 0 10px 40px rgba(255, 165, 0, 0.25);
          border-color: rgba(255, 165, 0, 0.6);
        }

        .icon-container {
          background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.3));
          border: 1px solid rgba(255, 165, 0, 0.3);
        }

        .sonic-tool-container {
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 165, 0, 0.3);
          box-shadow: 0 0 30px rgba(255, 165, 0, 0.2);
          backdrop-filter: blur(20px);
        }

        .close-button {
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 165, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .close-button:hover {
          background: rgba(0, 0, 0, 0.9);
          border-color: rgba(255, 165, 0, 0.5);
        }

        .empty-state {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 165, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .tool-container {
          animation: slideInUp 0.4s ease-out;
          position: relative;
        }

        .border-glow-animation {
          background: linear-gradient(45deg, transparent, rgba(255, 165, 0, 0.1), transparent);
          animation: border-flow 3s linear infinite;
        }

        @keyframes border-flow {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 30px rgba(255, 165, 0, 0.3);
          }
          50% {
            text-shadow: 0 0 40px rgba(255, 165, 0, 0.5), 0 0 60px rgba(255, 165, 0, 0.2);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .text-5xl {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
}
