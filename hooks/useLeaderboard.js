import { useState, useCallback } from 'react';

export function useLeaderboard() {
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [goatDays, setGoatDays] = useState('30');
  const [elsaPeriod, setElsaPeriod] = useState('7d');
  const [codexeroPeriod, setCodexeroPeriod] = useState('epoch-1');
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleSearch = useCallback(async (customGoatDays, customElsaPeriod, customCodexeroPeriod) => {
    const daysToUse = customGoatDays || goatDays;
    const elsaPeriodToUse = customElsaPeriod || elsaPeriod;
    const codexeroPeriodToUse = customCodexeroPeriod || codexeroPeriod;

    if (!searchUser.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/leaderboards?days=${daysToUse}&elsaPeriod=${elsaPeriodToUse}&codexeroPeriod=${codexeroPeriodToUse}`);
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }
      
      setLastUpdated(data.yappers.last_updated);
      
      const normalizedSearch = searchUser.toLowerCase().replace('@', '');
      
      // Search each leaderboard
      const goatUser = data.yappers.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );
      
      const duckUser = data.duelduck.data.find(
        user => user.x_username.toLowerCase() === normalizedSearch
      );
      
      const adiUser = data.adichain.data.find(
        user => user.handle.toLowerCase() === normalizedSearch
      );

      const datahavenUser = data.datahaven.data.find(
        user => user.handle.toLowerCase() === normalizedSearch
      );
      
      const elsaUser = data.heyelsa.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const perceptronUser = data.mindoshare.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const spaceUser = data.space.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const heliosUser = data.helios.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const c8ntinuumUser = data.c8ntinuum.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const deepnodeaiUser = data.deepnodeai.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const beyondUser = data.beyond.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const codexeroUser = data.codexero.data.find(
        user => user.username.toLowerCase() === normalizedSearch
      );

      const womfunUser = data.womfun?.data.find(
        user => user.twitter_username.toLowerCase() === normalizedSearch
      );
      
      // Check if user found on any platform
      const foundAnywhere = goatUser || duckUser || adiUser || datahavenUser || elsaUser || 
                           perceptronUser || spaceUser || heliosUser || 
                           c8ntinuumUser || deepnodeaiUser || beyondUser || codexeroUser || womfunUser;
      
      if (!foundAnywhere) {
        alert(`User @${searchUser} not found on any leaderboard`);
        setResults(null);
        setLoading(false);
        return;
      }

      const newResults = {
        username: searchUser.replace('@', ''),
        foundOn: {
          goat: !!goatUser,
          duck: !!duckUser,
          adi: !!adiUser,
          datahaven: !!datahavenUser,
          elsa: !!elsaUser,
          perceptron: !!perceptronUser,
          space: !!spaceUser,
          helios: !!heliosUser,
          c8ntinuum: !!c8ntinuumUser,
          deepnodeai: !!deepnodeaiUser,
          beyond: !!beyondUser,
          codexero: !!codexeroUser,
          womfun: !!womfunUser
        },
        everFoundOn: {
          goat: !!goatUser || (results?.everFoundOn?.goat),
          duck: !!duckUser || (results?.everFoundOn?.duck),
          adi: !!adiUser || (results?.everFoundOn?.adi),
          datahaven: !!datahavenUser || (results?.everFoundOn?.datahaven),
          elsa: !!elsaUser || (results?.everFoundOn?.elsa),
          perceptron: !!perceptronUser || (results?.everFoundOn?.perceptron),
          space: !!spaceUser || (results?.everFoundOn?.space),
          helios: !!heliosUser || (results?.everFoundOn?.helios),
          c8ntinuum: !!c8ntinuumUser || (results?.everFoundOn?.c8ntinuum),
          deepnodeai: !!deepnodeaiUser || (results?.everFoundOn?.deepnodeai),
          beyond: !!beyondUser || (results?.everFoundOn?.beyond),
          codexero: !!codexeroUser || (results?.everFoundOn?.codexero),
          womfun: !!womfunUser || (results?.everFoundOn?.womfun)
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
        datahaven: datahavenUser ? {
          rank: datahavenUser.rank_total,
          handle: datahavenUser.handle,
          total_points: datahavenUser.total_points,
          signal_points: datahavenUser.signal_points,
          noise_points: datahavenUser.noise_points,
          rank_change: datahavenUser.rank_change
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
        } : null,
        space: spaceUser ? {
          rank: spaceUser.rank,
          username: spaceUser.username,
          mindometric: ((spaceUser.mindometric / 1000) / 100).toFixed(2),
          rankdelta: spaceUser.rankdelta || 0,
          kolscore: spaceUser.kolscore || 0
        } : null,
        helios: heliosUser ? {
          rank: heliosUser.rank,
          username: heliosUser.username,
          mindometric: ((heliosUser.mindometric / 1000) / 100).toFixed(2),
          rankdelta: heliosUser.rankdelta || 0,
          kolscore: heliosUser.kolscore || 0
        } : null,
        c8ntinuum: c8ntinuumUser ? {
          rank: c8ntinuumUser.rank,
          username: c8ntinuumUser.username,
          mindometric: ((c8ntinuumUser.mindometric / 1000) / 100).toFixed(2),
          rankdelta: c8ntinuumUser.rankdelta || 0,
          kolscore: c8ntinuumUser.kolscore || 0
        } : null,
        deepnodeai: deepnodeaiUser ? {
          rank: deepnodeaiUser.rank,
          username: deepnodeaiUser.username,
          mindometric: ((deepnodeaiUser.mindometric / 1000) / 100).toFixed(2),
          rankdelta: deepnodeaiUser.rankdelta || 0,
          kolscore: deepnodeaiUser.kolscore || 0
        } : null,
        beyond: beyondUser ? {
          rank: beyondUser.position,
          username: beyondUser.username,
          mindshare_percentage: beyondUser.mindshare_percentage,
          position_change: beyondUser.position_change,
          app_use_multiplier: beyondUser.app_use_multiplier,
          score: beyondUser.score
        } : null,
        codexero: codexeroUser ? {
          rank: codexeroUser.position,
          username: codexeroUser.username,
          mindshare_percentage: codexeroUser.mindshare_percentage,
          position_change: codexeroUser.position_change,
          app_use_multiplier: codexeroUser.app_use_multiplier,
          score: codexeroUser.score
        } : null,
        womfun: womfunUser ? {
          rank: womfunUser.rank,
          username: womfunUser.twitter_username,
          mindshare_score: womfunUser.mindshare_score,
          poi_score: womfunUser.poi_score,
          reputation: womfunUser.reputation
        } : null
      };

      setResults(newResults);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchUser, goatDays, elsaPeriod, codexeroPeriod, results]);

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
    codexeroPeriod,
    setCodexeroPeriod,
    lastUpdated,
    handleSearch,
    countFoundPlatforms
  };
}
