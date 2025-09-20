"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

const LandingPage = () => {
  const modules = [
    {
      id: "goatnetwork",
      title: "GoatNetwork Rank Checker",
      description: "Check your rank instantly on GoatNetwork",
      color: "from-stone-500 to-stone-700",
      hoverColor: "hover:from-stone-400 hover:to-stone-600",
      route: "/rankfinder",
      logo: "/download-removebg-preview.png", 
      logoAlt: "GoatNetwork Logo"
    },
    {
      id: "sonic",
      title: "Sonic Rewards Calculator",
      description: "Calculate your Estimated $S rewards from Sonic Labs",
      color: "from-blue-700 to-blue-900",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
      route: "/sonic-rewards-calculator",
      logo: "/sonic-labs-logo.png", 
      logoAlt: "Sonic Logo"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Avatar Logo - Left Side */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-white/20 bg-white/5 backdrop-blur-sm shadow-lg">
              <img
                src="/image.jpg"
                alt="Aurio Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if avatar fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg hidden"
                style={{ display: 'none' }}
              >
                A
              </div>
            </div>
          </div>

          {/* Title - Center */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center flex-1 px-4">
            Aurio Devspace and Tools
          </h1>

          {/* Spacer for balance - Right Side */}
          <div className="w-8 sm:w-10"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full max-w-5xl mx-auto">
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => (window.location.href = module.route)}
                className={`relative rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 cursor-pointer bg-gradient-to-r ${module.color} ${module.hoverColor} transition-all transform hover:scale-105 shadow-2xl group w-full`}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Card content */}
                <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px] sm:min-h-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-white/10 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                      <img
                        src={module.logo}
                        alt={module.logoAlt}
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/30 rounded-lg flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold hidden"
                        style={{ display: 'none' }}
                      >
                        {module.title.charAt(0)}
                      </div>
                    </div>
                    <ChevronRight
                      size={24}
                      className="sm:w-7 sm:h-7 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                    />
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                      {module.title}
                    </h3>
                    <p className="mt-2 text-white/90 text-sm sm:text-base lg:text-lg leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/5 backdrop-blur-md border-t border-white/20 text-center text-xs sm:text-sm text-white/70">
        © 2025 Auriosweb3. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;