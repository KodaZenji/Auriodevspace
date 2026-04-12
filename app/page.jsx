"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2026-05-17T00:00:00Z").getTime();

function useCountdown(target) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
  setTime({ days: 0, hours: 0, mins: 0, secs: 0 });
  return;
      }
      setTime({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

function useTypewriter(words, speed = 80, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, cIdx + 1));
        if (cIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), pause);
        } else {
          setCIdx(c => c + 1);
        }
      } else {
        setDisplay(word.slice(0, cIdx - 1));
        if (cIdx - 1 === 0) {
          setDeleting(false);
          setWIdx(i => (i + 1) % words.length);
          setCIdx(0);
        } else {
          setCIdx(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [cIdx, deleting, wIdx, words, speed, pause]);

  return display;
}

const ROLES = [
  "Full-Stack Development",
  "Web3 & Blockchain",
  "Digital Campaign Platforms",
  "Tech Solutions",
  "Product Design & Strategy",
];

export default function Page() {
  const { days, hours, mins, secs } = useCountdown(LAUNCH_DATE);
  const role = useTypewriter(ROLES);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }


  return (
    <div style={{
      minHeight: "100vh",
      background: "#050A05",
      color: "#fff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── animated mesh background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,80,0.12) 0%, transparent 70%)",
          top: `calc(${pos.y}px - 300px)`,
          left: `calc(${pos.x}px - 300px)`,
          transition: "top 0.8s ease, left 0.8s ease",
        }} />
        <div style={{
          position: "absolute", top: "10%", right: "5%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,120,50,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,200,90,0.06) 0%, transparent 70%)",
        }} />
        {/* grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00C853" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── nav ── */}
      <nav style={{
        position: "relative", zIndex: 10,
        padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* logo mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00C853" strokeWidth="1.5" fill="none" />
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00C853" opacity="0.2" />
            <circle cx="14" cy="14" r="3" fill="#00C853" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.08em", color: "#fff" }}>
            KEMJEE<span style={{ color: "#00C853" }}>LABS</span>
          </span>
        </div>
        <div style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#00C853", border: "1px solid rgba(0,200,83,0.3)",
          padding: "5px 12px", borderRadius: 4,
        }}>
          Est. 2026
        </div>
      </nav>

      {/* ── main content ── */}
      <main style={{
        flex: 1, position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px", textAlign: "center",
      }}>

        {/* status pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(0,200,83,0.08)",
          border: "1px solid rgba(0,200,83,0.2)",
          borderRadius: 100, padding: "6px 16px",
          fontSize: 12, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#00C853",
          marginBottom: 40,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#00C853",
            boxShadow: "0 0 8px #00C853",
            animation: "pulse 2s infinite",
          }} />
          Something is being built
        </div>

        {/* headline */}
        <h1 style={{
          fontSize: "clamp(36px, 7vw, 80px)",
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: "-0.03em",
          margin: "0 0 8px",
          maxWidth: 800,
        }}>
          We Build Things
          <br />
          <span style={{
            background: "linear-gradient(135deg, #00C853, #69F0AE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            That Matter.
          </span>
        </h1>

        {/* typewriter */}
        <div style={{
          fontSize: "clamp(14px, 2vw, 18px)",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 60, height: 28,
          letterSpacing: "0.02em",
        }}>
          {role}
          <span style={{ color: "#00C853", animation: "blink 1s infinite" }}>|</span>
        </div>

        {/* countdown */}
        <div style={{
          display: "flex", gap: "clamp(12px, 3vw, 32px)",
          marginBottom: 64,
        }}>
          {[
            { v: days,  l: "Days" },
            { v: hours, l: "Hours" },
            { v: mins,  l: "Minutes" },
            { v: secs,  l: "Seconds" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "clamp(12px,2vw,20px) clamp(14px,3vw,28px)",
                marginBottom: 8,
                backdropFilter: "blur(10px)",
              }}>
                <span style={{
                  fontSize: "clamp(24px, 5vw, 52px)",
                  fontWeight: 800, lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  background: "linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {String(v).padStart(2, "0")}
                </span>
              </div>
              <span style={{
                fontSize: 10, letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
              }}>{l}</span>
            </div>
          ))}
        </div>

        {/* email form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{
            display: "flex", gap: 10, flexWrap: "wrap",
            justifyContent: "center", marginBottom: 48,
            width: "100%", maxWidth: 480,
          }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for early bird acess"
              style={{
                flex: 1, minWidth: 220,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "13px 18px",
                color: "#fff", fontSize: 14,
                outline: "none",
              }}
            />
            <button type="submit" style={{
              background: "#00C853",
              color: "#050A05",
              border: "none", borderRadius: 8,
              padding: "13px 24px",
              fontWeight: 700, fontSize: 14,
              cursor: "pointer", whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}>
              Notify Me
            </button>
          </form>
        ) : (
          <div style={{
            marginBottom: 48,
            background: "rgba(0,200,83,0.08)",
            border: "1px solid rgba(0,200,83,0.3)",
            borderRadius: 8, padding: "14px 28px",
            color: "#00C853", fontSize: 14,
            letterSpacing: "0.02em",
          }}>
            ✓ You are on the list. We will reach out.
          </div>
        )}

        {/* services */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          gap: 10, justifyContent: "center",
          maxWidth: 600,
        }}>
          {[
            "Full-Stack Web Apps",
            "Web3 & DeFi",
            "Campaign Platforms",
            "Tech Solutions",
            "Product Strategy",
            "UX Design",
          ].map(tag => (
            <span key={tag} style={{
              fontSize: 12, letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 100, padding: "5px 14px",
            }}>
              {tag}
            </span>
          ))}
        </div>

      </main>

      {/* ── footer ── */}
      <footer style={{
        position: "relative", zIndex: 10,
        padding: "24px 40px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
          © 2026 Kemjee Labs. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "X",        href: "https://x.com/kodazenji" },
            { label: "GitHub",   href: "https://github.com/KodaZenji" },
            { label: "LinkedIn", href: "#" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: "rgba(255,255,255,0.3)",
              textDecoration: "none", letterSpacing: "0.05em",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#00C853"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>

      {/* ── keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

    </div>
  );
}
