
import React, { useState, useEffect } from "react";


const Avatar = React.memo(({ username, size = 48 }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Create a new Image object (loads in background)
    const img = new Image();
    
    // Use weserv.nl proxy for better caching and speed
    const avatarUrl = `https://unavatar.io/twitter/${username}`;
    img.src = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    
    // When image loads successfully
    img.onload = () => {
      setImgSrc(img.src);
      setLoading(false);
    };
    
    // If image fails, use fallback (generated avatar)
    img.onerror = () => {
      setImgSrc(`https://api.dicebear.com/7.x/initials/svg?seed=${username}&size=${size * 2}&backgroundColor=1f2937`);
      setLoading(false);
    };
    
    // Cleanup function (prevents memory leaks)
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [username, size]);

  return (
    <div 
      className="relative rounded-full overflow-hidden border-2 border-yellow-400/30 bg-gray-800"
      style={{ width: size, height: size }}
    >
      {loading ? (
        // Skeleton loader - shows while image loads
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
      ) : (
        // Actual image once loaded
        <img 
          src={imgSrc} 
          alt={username}
          className="w-full h-full object-cover"
          loading="lazy" // Browser native lazy loading
        />
      )}
    </div>
  );
});

export default Avatar;
