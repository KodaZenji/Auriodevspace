import { useState, useCallback } from 'react';

export function useLeaderboard() {
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [goatDays, setGoatDays] = useState('30');
  const [elsaPeriod, setElsaPeriod] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleSearch = useCallback(async (customGoatDays, customElsaPeriod) => {
    const daysToUse = customGoatDays || goatDays;
    const periodToUse = customElsaPeriod || elsaPeriod;

    if (!searchUser.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/leaderboards?days=${daysToUse}&elsaPeriod=${periodToUse}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }
      
      setLastUpdated(data.yappers.last_updated);
      
      const goatUser = data.yappers.data.find(
        user => user.username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      const duckUser = data.duelduck.data.find(
        user => user.x_username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      const adiUser = data.adichain.data.find(
        user => user.handle.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      const elsaUser = data.heyelsa.data.find(
        user => user.username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );

      const perceptronUser = data.mindoshare.data.find(
        user => user.username.toLowerCase() === searchUser.toLowerCase().replace('@', '')
      );
      
      if (!goatUser && !duckUser && !adiUser && !elsaUser && !perceptronUser) {
        alert(`User @${searchUser} not found on any leaderboard`);
        setResults(null);
        setLoading(false);
        return;
      }

      setResults({
        username: searchUser.replace('@', ''),
        foundOn: {
          goat: !!goatUser,
          duck: !!duckUser,
          adi: !!adiUser,
          elsa: !!elsaUser,
          perceptron: !!perceptronUser
        },
        goat: goatUser ? {
          rank: goatUser.rank,
          username: goatUser.username,
          mindshare: goatUser.mindshare * 100,
          tweets: goatUser.tweet_counts,
          likes: goatUser.total_likes,
          impressions: goatUser.total_impressions,
          score: goatUser.score
        } : null,
        duck: duckUser ? {
          rank: data.duelduck.data.indexOf(duckUser) + 1,
          x_username: duckUser.x_username,
          x_score: duckUser.x_score,
          dd_score: duckUser.dd_score,
          user_share: duckUser.user_share,
          usdc_reward: duckUser.usdc_reward,
          total_score: duckUser.total_score
        } : null,
        adi: adiUser ? {
          rank: adiUser.rank_total,
          handle: adiUser.handle,
          total_points: adiUser.total_points,
          signal_points: adiUser.signal_points,
          noise_points: adiUser.noise_points,
          rank_change: adiUser.rank_change
        } : null,
        elsa: elsaUser ? {
          rank: elsaUser.position,
          username: elsaUser.username,
          mindshare_percentage: elsaUser.mindshare_percentage,
          position_change: elsaUser.position_change,
          app_use_multiplier: elsaUser.app_use_multiplier,
          score: elsaUser.score
        } : null,
        perceptron: perceptronUser ? {
          rank: perceptronUser.rank,
          username: perceptronUser.username,
          mindometric: ((perceptronUser.mindometric / 1000) / 100).toFixed(2),
          rankdelta: perceptronUser.rankdelta || 0,
          kolscore: perceptronUser.kolscore || 0
        } : null
      });
    } catch (error) {
      console.error('Error searching:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchUser, goatDays, elsaPeriod]);

  const countFoundPlatforms = () => {
    if (!results) return 0;
    return Object.values(results.foundOn).filter(Boolean).length;
  };

  return {
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
  };
}
