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
    datahaven: false, 
    elsa: false,
    perceptron: false,
    space: false,
    helios: false,
    c8ntinuum: false,
    deepnodeai: false,
    beyond: false,
    codexero: false,
    womfun: false
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
    codexeroPeriod, 
    setCodexeroPeriod, 
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
        handleSearch(value, elsaPeriod, codexeroPeriod);
      } else if (platform === 'elsa' || platform === 'beyond') {
        handleSearch(goatDays, value, codexeroPeriod);
      } else if (platform === 'codexero') {
        handleSearch(goatDays, elsaPeriod, value);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <NavigationMenu 
        menuOpen={menuOpen} 
        onToggle={() => setMenuOpen(!menuOpen)} 
      />

      <div className="max-w-6xl mx-auto pt-8">
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
              <div className="mb-4">
                <UserProfileCard username={results.username} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {results.space && (
                <LeaderboardCard 
                  platform="space" 
                  data={results.space} 
                  platformName="Space"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.space}
                  onToggle={() => toggleCard('space')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {results.helios && (
                <LeaderboardCard 
                  platform="helios" 
                  data={results.helios} 
                  platformName="Helios"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.helios}
                  onToggle={() => toggleCard('helios')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {results.c8ntinuum && (
                <LeaderboardCard 
                  platform="c8ntinuum" 
                  data={results.c8ntinuum} 
                  platformName="C8ntinuum"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.c8ntinuum}
                  onToggle={() => toggleCard('c8ntinuum')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {results.deepnodeai && (
                <LeaderboardCard 
                  platform="deepnodeai" 
                  data={results.deepnodeai} 
                  platformName="DeepnodeAI"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.deepnodeai}
                  onToggle={() => toggleCard('deepnodeai')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {results.womfun && (
                <LeaderboardCard 
                  platform="womfun" 
                  data={results.womfun} 
                  platformName="WomFun"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.womfun}
                  onToggle={() => toggleCard('womfun')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {(results.goat || results.everFoundOn?.goat) && (
                <LeaderboardCard 
                  platform="goat" 
                  data={results.goat || {}} 
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
                  notFoundInPeriod={!results.goat && results.everFoundOn?.goat}
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

              {results.datahaven && (
                <LeaderboardCard 
                  platform="datahaven" 
                  data={results.datahaven} 
                  platformName="DataHaven"
                  timeSwitch={false}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.datahaven}
                  onToggle={() => toggleCard('datahaven')}
                  onTimeChange={handleTimeChange}
                />
              )}

              {(results.elsa || results.everFoundOn?.elsa) && (
                <LeaderboardCard 
                  platform="elsa" 
                  data={results.elsa || {}} 
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
                  notFoundInPeriod={!results.elsa && results.everFoundOn?.elsa}
                />
              )}

              {(results.beyond || results.everFoundOn?.beyond) && (
                <LeaderboardCard 
                  platform="beyond" 
                  data={results.beyond || {}} 
                  platformName="Beyond"
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
                  isExpanded={expandedCards.beyond}
                  onToggle={() => toggleCard('beyond')}
                  onTimeChange={handleTimeChange}
                  notFoundInPeriod={!results.beyond && results.everFoundOn?.beyond}
                />
              )}

              {(results.codexero || results.everFoundOn?.codexero) && (
                <LeaderboardCard 
                  platform="codexero" 
                  data={results.codexero || {}} 
                  platformName="CodeXero-Cluster Protocol"
                  timeSwitch={true}
                  currentValue={codexeroPeriod}
                  onValueChange={setCodexeroPeriod}
                  options={[
                    { value: 'epoch-1', label: 'E1' },
                    { value: '7d', label: '7d' },
                    { value: '30d', label: '30d' }
                  ]}
                  showAvatar={countFoundPlatforms() === 1}
                  username={results.username}
                  isExpanded={expandedCards.codexero}
                  onToggle={() => toggleCard('codexero')}
                  onTimeChange={handleTimeChange}
                  notFoundInPeriod={!results.codexero && results.everFoundOn?.codexero}
                />
              )}
            </div>
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
