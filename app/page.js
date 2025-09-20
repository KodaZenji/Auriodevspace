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

      {/* Main Body with triangular cards */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <main className="flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 lg:pt-48 pb-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-0">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  onClick={() => (window.location.href = module.route)}
                  className={`relative cursor-pointer bg-gradient-to-r ${module.color} ${module.hoverColor} 
                    transition-all transform hover:scale-105 shadow-xl group
                    w-full sm:w-1/2 h-[300px] sm:h-[400px] lg:h-[500px]
                    ${index === 0 ? 'clip-path-triangle-left' : 'clip-path-triangle-right'}
                    flex flex-col justify-center items-center p-8`}
                  style={{
                    clipPath: index === 0 
                      ? 'polygon(0 0, 90% 0, 80% 100%, 0% 100%)' 
                      : 'polygon(20% 0, 100% 0, 100% 100%, 10% 100%)'
                  }}
                >
                  {/* Logo and Chevron */}
                  <div className="relative z-10 flex items-center justify-between w-full mb-8">
                    <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors rounded-lg">
                      <img
                        src={module.logo}
                        alt={module.logoAlt}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      />
                    </div>
                    <ChevronRight
                      size={24}
                      className="sm:w-8 sm:h-8 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200"
                    />
                  </div>

                  {/* Content */}
                  <div className={`flex flex-col items-center text-center px-4 ${index === 0 ? 'pr-12' : 'pl-12'}`}>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 mb-4">
                      {module.title}
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xs">
                      {module.description}
                    </p>
                  </div>
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
