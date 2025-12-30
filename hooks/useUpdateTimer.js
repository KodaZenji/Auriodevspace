import { useState, useEffect } from 'react';

export function useUpdateTimer(lastUpdated) {
  const [nextUpdateIn, setNextUpdateIn] = useState('');

  useEffect(() => {
    if (lastUpdated) {
      const interval = setInterval(() => {
        const now = new Date();
        const lastUpdate = new Date(lastUpdated);
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        const hoursUntilNext = 24 - (hoursSinceUpdate % 24);
        const minutesUntilNext = Math.floor((hoursUntilNext % 1) * 60);
        setNextUpdateIn(`${Math.floor(hoursUntilNext)}h:${minutesUntilNext.toString().padStart(2, '0')}m`);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lastUpdated]);

  return nextUpdateIn;
}
