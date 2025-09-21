"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

const LandingPage = () => {
  const modules = [
    {
      id: "goatnetwork",
      title: "GoatNetwork Rank Checker",
      description: "Check your rank instantly on GoatNetwork",
      color: "from-stone-700 to-stone-820",
      hoverColor: "hover:from-stone-500 hover:to-stone-600",
      route: "/rankfinder",
      logo: "/download-removebg-preview.png",
      logoAlt: "GoatNetwork Logo",
    },
    {
      id: "sonic",
      title: "Sonic Rewards Calculator",
      description: "Calculate your Estimated $S rewards from Sonic Labs",
      color: "from-blue-700 to-blue-900",
      hoverColor: "hover:from-blue-600 hover:to-blue-800",
      route: "/sonic-rewards-calculator",
      logo: "/sonic-labs-logo.png",
      logoAlt: "Sonic Logo",
    },
  ];

  return (
    <>
      {/* Separate Header */}
      <header className="w-full px-2 sm:px-6 lg:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 z-50 text-white">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Avatar Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border-2 border-white/20 bg-white/5 backdrop-blur-sm shadow-lg">
              <img
                src="/image.jpg"
                alt="Aurio Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-base sm:text-xl md:text-2xl font-bold text-center flex-1 px-4 sm:px-4 truncate">
            Aurio Devspace & Tools
          </h1>

          {/* Spacer */}
          <div className="w-13 sm:w-15"></div>
        </div>
      </header>

      {/* Main Body with clean rounded cards */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Adjustable blank space for all screen types */}
        <div className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48 pt-16 sm:pt-20"></div>
        
        <main className="flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  onClick={() => (window.location.href = module.route)}
                  className={`relative cursor-pointer bg-gradient-to-br ${module.color} ${module.hoverColor} 
                    transition-all transform hover:scale-105 shadow-2xl group
                    w-full sm:w-1/2 h-[200px] sm:h-[220px] lg:h-[250px]
                    rounded-2xl lg:rounded-3xl overflow-hidden
                    flex flex-col justify-center items-center p-4 sm:p-6`}
                >
                  {/* Top section: Logo and Chevron */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm border border-white/30 group-hover:bg-white/25 transition-all duration-300 rounded-xl shadow-lg">
                      <img
                        src={module.logo}
                        alt={module.logoAlt}
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                      />
                    </div>
                    <ChevronRight
                      size={16}
                      className="sm:w-5 sm:h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                    />
                  </div>

                  {/* Center section: Content */}
                  <div className="flex flex-col text-center justify-center">
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide text-white mb-2 lg:mb-3 leading-tight font-serif">
                      {module.title}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed font-light tracking-wide text-justify px-2">
                      {module.description}
                    </p>
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl lg:rounded-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6 bg-white/5 backdrop-blur-md border-t border-white/20 text-center text-xs sm:text-sm text-white/70">
          © 2025 Auriosweb3. All rights reserved.
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
