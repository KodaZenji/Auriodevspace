"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// This tells Next.js to render this page only on the client
export const dynamic = "force-dynamic";
export const runtime = "edge"; // Optional: use edge runtime

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Initialize Supabase only after component mounts
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    setMounted(true);
    try {
      const client = createClientComponentClient();
      setSupabase(client);
    } catch (err) {
      console.error("Failed to initialize Supabase:", err);
      setError("Failed to initialize authentication");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication not ready");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const checkRes = await fetch("/api/admin/check-admin");
      const checkData = await checkRes.json();

      if (!checkData.admin) {
        await supabase.auth.signOut();
        throw new Error("You are not an admin");
      }

      sessionStorage.setItem("isAdmin", "true");
      router.push("/kaito-inner-ct");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-purple-500">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading || !supabase}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          onClick={() => router.push("/kaito-inner-ct")}
          className="w-full mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}