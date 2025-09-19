'use client';

import React, { useState, useEffect } from 'react';
import RankFinder from './RankFinder';   
import Calculator from './Calculator';   

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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 
              className="text-5xl font-bold mb-4"
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
          </motion.div>

          {/* Dashboard cards */}
          {!active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid gap-8 md:grid-cols-2 mb-12"
            >
              {modules.map((mod, index) => {
                const Icon = mod.icon;
                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      y: -5,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(mod.id as 'rankfinder' | 'calculator')}
                    className="group cursor-pointer"
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl p-8 transition-all duration-300"
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '2px solid rgba(255, 165, 0, 0.4)',
                        boxShadow: '0 0 20px rgba(255, 165, 0, 0.15)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {/* Gradient overlay on hover */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${mod.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{
                             background: 'linear-gradient(45deg, transparent, rgba(255, 165, 0, 0.1), transparent)',
                             animation: 'border-flow 3s linear infinite'
                           }} />

                      <div className="relative flex items-start space-x-6">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className="p-4 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 140, 0, 0.3))',
                            border: '1px solid rgba(255, 165, 0, 0.3)'
                          }}
                        >
                          <Icon className="w-10 h-10 text-orange-300" />
                        </motion.div>
                        
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                            {mod.title}
                          </h2>
                          <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                            {mod.description}
                          </p>
                          
                          <div className="flex items-center mt-4 text-orange-400 group-hover:text-orange-300 transition-colors">
                            <span className="text-sm font-semibold">Launch Tool</span>
                            <motion.div
                              className="ml-2"
                              whileHover={{ x: 5 }}
                            >
                              →
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Active tool container */}
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setActive(null)}
                  className="absolute top-4 right-4 z-10 p-3 rounded-full text-white hover:text-orange-300 transition-colors"
                  style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 165, 0, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Tool container */}
                <div 
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '2px solid rgba(255, 165, 0, 0.3)',
                    boxShadow: '0 0 30px rgba(255, 165, 0, 0.2)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  {active === 'rankfinder' && <RankFinder />}
                  {active === 'calculator' && <Calculator />}
                </div>
              </motion.div>
            )}
        </div>
      </main>

      {/* Add custom CSS for border animation */}
      <style jsx>{`
        @keyframes border-flow {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}
