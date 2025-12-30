'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import NavigationMenu from '@/components/NavigationMenu';
import UserProfileCard from '@/components/UserProfileCard';
import LeaderboardCard from '@/components/LeaderboardCard';
import EmptyState from '@/components/EmptyState';
import Footer from '@/components/Footer';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useUpdateTimer } from '@/hooks/useUpdateTimer';

export default function RankNexus() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({ 
    goat: false, 
    duck: false, 
    adi: false, 
    elsa: false,
    perceptron: false 
  });

  const {
    searchUser,
    setSearchUser,
    loading,
    results,
    goatDays,
    setGoatDays,
    elsaPeriod,
    setElsaPeriod,
    lastUpdated,
    handleSearch,
    countFoundPlatforms
  } = useLeaderboard();

  const nextUpdateIn = useUpdateTimer(lastUpdated);

  const toggleCard = (platform) => {
    setExpandedCards(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleTimeChange = (platform, value) => {
    if (searchUser.trim()) {
      if (platform === 'goat') {
        handleSearch(value, elsaPeriod);
      } else if (platform === 'elsa') {
        handleSearch(goatDays, value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <NavigationMenu 
        menuOpen={menuOpen} 
        onToggle={() => setMenuOpen(!menuOpen)} 
      />

      <div className="max-w-2xl mx-auto pt-8">
        <Header />
        
        <SearchBar 
          searchUser={searchUser}
          onSearchChange={setSearchUser}
          onSearch={() => handleSearch()}
          loading={loading}
        />

        {results && (
          <div className="animate-fade-in">
            {countFoundPlatforms() >= 2 && (
              <UserProfileCard username={results.username} />
            )}

            {results.perceptron && (
              <LeaderboardCard 
                platform="perceptron" 
                data={results.perceptron} 
                platformName="PerceptronNTWK"
                timeSwitch={false}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
                isExpanded={expandedCards.perceptron}
                onToggle={() => toggleCard('perceptron')}
                onTimeChange={handleTimeChange}
              />
            )}

            {results.goat && (
              <LeaderboardCard 
                platform="goat" 
                data={results.goat} 
                platformName="Goat Network"
                timeSwitch={true}
                currentValue={goatDays}
                onValueChange={setGoatDays}
                options={[
                  { value: '7', label: '7d' },
                  { value: '30', label: '30d' }
                ]}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
                isExpanded={expandedCards.goat}
                onToggle={() => toggleCard('goat')}
                onTimeChange={handleTimeChange}
              />
            )}
            
            {results.duck && (
              <LeaderboardCard 
                platform="duck" 
                data={results.duck} 
                platformName="DuelDuck"
                timeSwitch={false}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
                isExpanded={expandedCards.duck}
                onToggle={() => toggleCard('duck')}
                onTimeChange={handleTimeChange}
              />
            )}

            {results.adi && (
              <LeaderboardCard 
                platform="adi" 
                data={results.adi} 
                platformName="Adichain"
                timeSwitch={false}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
                isExpanded={expandedCards.adi}
                onToggle={() => toggleCard('adi')}
                onTimeChange={handleTimeChange}
              />
            )}

            {results.elsa && (
              <LeaderboardCard 
                platform="elsa" 
                data={results.elsa} 
                platformName="HeyElsa"
                timeSwitch={true}
                currentValue={elsaPeriod}
                onValueChange={setElsaPeriod}
                options={[
                  { value: 'epoch-2', label: 'E2' },
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' }
                ]}
                showAvatar={countFoundPlatforms() === 1}
                username={results.username}
                isExpanded={expandedCards.elsa}
                onToggle={() => toggleCard('elsa')}
                onTimeChange={handleTimeChange}
              />
            )}
          </div>
        )}

        {!results && !loading && <EmptyState />}

        <Footer nextUpdateIn={nextUpdateIn} />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
