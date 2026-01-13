"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, ChevronLeft, ChevronRight, LogOut, BadgeCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';

// ============================================
// OPTIMIZED AVATAR COMPONENT WITH IMAGE PROXY
// ============================================
const LazyAvatar = React.memo(({ handle, size = 40, borderColor = "border-[#5D4037]" }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Create Image object for background loading
    const img = new Image();
    
    // Use weserv.nl proxy to handle CORS and loading issues
    const avatarUrl = `https://unavatar.io/twitter/${handle}`;
    const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    
    img.src = proxiedUrl;
    
    img.onload = () => {
      setImgSrc(img.src);
      setLoading(false);
    };
    
    img.onerror = () => {
      // Fallback to generated avatar using proxy
      const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${handle}&size=${size * 2}&backgroundColor=1f2937`;
      const proxiedFallback = `https://images.weserv.nl/?url=${encodeURIComponent(fallbackUrl)}`;
      setImgSrc(proxiedFallback);
      setLoading(false);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [handle, size]);

  return (
    <div 
      className={`relative rounded-full overflow-hidden ${borderColor}`}
      style={{ 
        width: size, 
        height: size,
        border: '2px solid'
      }}
    >
      {loading ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
      ) : (
        <img 
          src={imgSrc} 
          alt={handle}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
});

LazyAvatar.displayName = 'LazyAvatar';

// ============================================
// ACCOUNT ROW COMPONENT (MEMOIZED)
// ============================================
const AccountRow = React.memo(({ account, onRemove, isAdmin }) => {
  return (
    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3">
        <LazyAvatar handle={account.handle} size={40} borderColor="border-purple-500" />
        <span>{account.handle}</span>
      </div>
      {isAdmin && (
        <button
          onClick={() => onRemove(account.handle)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg whitespace-nowrap transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
});

AccountRow.displayName = 'AccountRow';

// ============================================
// ACCOUNT CARD COMPONENT (MEMOIZED)
// ============================================
const AccountCard = React.memo(({ account }) => {
  return (
    <div
      className="
        bg-gray-900 border border-gray-800 rounded-lg p-2
        grid grid-cols-[auto_1fr_auto] gap-2 items-center
        transition-all duration-200
        hover:border-emerald-400 hover:bg-gray-800/50
        active:border-emerald-400 active:bg-gray-800/50 active:scale-[0.99]
      "
    >
      <LazyAvatar handle={account.handle} size={36} />

      <a
        href={`https://x.com/${account.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          text-gray-300 font-medium text-sm truncate
          hover:text-blue-400
          active:text-blue-500
          transition-colors duration-200
        "
      >
        {account.handle}
      </a>

      <a
        href={`https://x.com/${account.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
          px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md
          hover:bg-blue-600
          active:bg-blue-700 active:scale-[0.97]
          transition-all duration-200
          whitespace-nowrap
        "
      >
        Follow
      </a>
    </div>
  );
});

AccountCard.displayName = 'AccountCard';

// ============================================
// MAIN COMPONENT
// ============================================
export default function HollyCTDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchAccounts();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Session:', session); // DEBUG
      
      if (session?.user) {
        console.log('User email:', session.user.email); // DEBUG
        
        const res = await fetch("/api/admin/check-admin", {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const data = await res.json();
        
        console.log('Admin check response:', data); // DEBUG
        
        if (data.admin) {
          console.log('Setting isAdmin to true'); // DEBUG
          setIsAdmin(true);
          sessionStorage.setItem("isAdmin", "true");
        } else {
          console.log('User is not admin'); // DEBUG
        }
      } else {
        console.log('No session found'); // DEBUG
      }
    } catch (err) {
      console.error("Admin check failed:", err);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (!data.error) setAccounts(data);
    } catch (e) {
      console.error("Error fetching accounts", e);
    }
    setLoadingAccounts(false);
  };

  const handleLogin = () => {
    router.push("/admin");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
  };

  const addAccount = async () => {
    if (!newHandle.trim()) return;

    const handle = newHandle.replace("@", "").trim();

    const res = await fetch("/api/accounts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    const data = await res.json();

    if (data.error) return alert("Failed: " + data.error);

    await fetchAccounts();
    setNewHandle("");
    setCurrentPage(1);
    alert("Account added.");
  };

  const removeAccount = async (handle) => {
    if (!confirm(`Remove @${handle}?`)) return;

    const res = await fetch("/api/accounts/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    const data = await res.json();

    if (data.error) return alert("Delete failed: " + data.error);

    await fetchAccounts();
    alert("Account removed.");
  };

  const filtered = accounts.filter((a) =>
    a.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  if (loadingAccounts) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-10">
          <a
            href="https://x.com/holly_web3"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            <img
              src="/holly.png"
              alt="HollyWeb3 Logo"
              className="w-12 h-12 rounded-xl"
            />

            <p className="text-sm text-gray-400 flex items-center gap-1 group-hover:text-blue-400  
            active:scale-[0.95] active:shadow-lg active:text-blue-500/40
            transition-all duration-200">
              holly
              <BadgeCheck className="w-3 h-3 text-blue-500 group-hover:text-blue-400
              active:scale-[0.95] active:text-blue-500/40
              transition-all duration-200" />
              's
            </p>
          </a>
        </div>

        <div className="flex justify-center">
          <p
            className="
              text-3xl font-bold
              bg-gradient-to-r from-[#5D4037] via-[#7B5E57] to-[#A1887F]
              bg-clip-text text-transparent
              animate-[pulse_4s_ease-in-out_infinite]
            "
          >
            Inner CT Splash
          </p>
        </div>
        <p className="text-sm text-gray-400 mt-2 flex justify-center">
          {filtered.length} accounts found now
        </p>

        <div style={{ marginBottom: '0.2rem' }}>&nbsp;</div>

        {/* ADMIN BUTTON */}
        <div className="flex justify-end mb-4">
          {!isAdmin ? (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-gradient-to-r from-[#4E342E] via-[#5D4037] to-[#6D4C41] 
                hover:from-[#5D4037] hover:via-[#6D4C41] hover:to-[#4E342E] 
                rounded-lg text-white flex items-center gap-2 whitespace-nowrap transition-all"
            >
              🔒 Admin Login
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>

        {/* ADMIN PANEL */}
        {isAdmin && (
          <div className="bg-gray-900 bg-opacity-30 p-6 rounded-xl border border-white border-opacity-10 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <UserPlus className="w-6 h-6" /> Add New Account
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAccount()}
                placeholder="Twitter handle"
                className="flex-1 px-4 py-3 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-20 text-white"
              />
              <button
                onClick={addAccount}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg whitespace-nowrap transition-colors"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {accounts.map((acc) => (
                <AccountRow 
                  key={acc.id}
                  account={acc}
                  onRemove={removeAccount}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="bg-white bg-opacity-10 p-6 rounded-xl border border-white border-opacity-20 mb-6">
          <input
            type="text"
            placeholder="  Search  username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 rounded-lg bg-gray-400 bg-opacity-20 text-gray-600"
          />
        </div>

        {/* LIST WITH OPTIMIZED CARDS */}
        <div className="bg-gray-800 bg-opacity-70 rounded-xl border border-gray-700 p-2 space-y-1 mb-6">
          {pageItems.length > 0 ? (
            pageItems.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))
          ) : (
            <div className="text-center text-gray-400 py-6">
              No accounts found
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-6 py-2 bg-blue-600 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-blue-600"
                        : "bg-blue bg-opacity-10 hover:bg-opacity-20"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === 2 && currentPage > 3) {
                return <span key={`dots-start`} className="px-2 text-gray-400">...</span>;
              }
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return <span key={`dots-end`} className="px-2 text-gray-400">...</span>;
              }
              return null;
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 bg-blue-600 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronRight />
            </button>
          </div>
        )}

        <div className="text-center text-gray-400 text-sm">
          Showing {start + 1}-{Math.min(start + itemsPerPage, filtered.length)} of{" "}
          {filtered.length}
        </div>
      </div>
    </div>
  );
}
