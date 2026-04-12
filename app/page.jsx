"use client";

import { useState, useEffect } from "react";

const LAUNCH_DATE = new Date("2026-06-17T00:00:00Z").getTime();

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
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
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
          setCIdx((c) => c + 1);
        }
      } else {
        setDisplay(word.slice(0, cIdx - 1));

        if (cIdx - 1 === 0) {
          setDeleting(false);
          setWIdx((i) => (i + 1) % words.length);
          setCIdx(0);
        } else {
          setCIdx((c) => c - 1);
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
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // SAFE: runs only in browser
  useEffect(() => {
    const move = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      setPos({ x: e.clientX, y: e.clientY });
      setParallax({ x, y });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050A05",
        color: "#fff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* MAIN GLOW (parallax fixed) */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,180,80,0.12) 0%, transparent 70%)",
            top: `calc(50% + ${parallax.y * 10}px - 300px)`,
            left: `calc(50% + ${parallax.x * 10}px - 300px)`,
            transition: "top 0.2s ease, left 0.2s ease",
          }}
        />

        {/* STATIC GLOWS */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,120,50,0.08) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,200,90,0.06) 0%, transparent 70%)",
          }}
        />

        {/* GRID */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
          }}
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#00C853"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* NAV */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 700 }}>
          KEMJEE<span style={{ color: "#00C853" }}>LABS</span>
        </div>
        <div style={{ color: "#00C853", fontSize: 12 }}>Est. 2026</div>
      </nav>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 60, fontWeight: 800 }}>
          We Build Things
          <br />
          <span style={{ color: "#00C853" }}>That Matter</span>
        </h1>

        <div style={{ marginTop: 10, opacity: 0.5 }}>
          {role} <span>|</span>
        </div>

        {/* COUNTDOWN */}
        <div style={{ display: "flex", gap: 30, marginTop: 40 }}>
          {[
            { v: days, l: "Days" },
            { v: hours, l: "Hours" },
            { v: mins, l: "Minutes" },
            { v: secs, l: "Seconds" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>
                {String(v).padStart(2, "0")}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* EMAIL */}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 40 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              style={{
                padding: 12,
                borderRadius: 6,
                border: "1px solid #333",
                marginRight: 10,
              }}
            />
            <button
              style={{
                padding: 12,
                background: "#00C853",
                border: "none",
                borderRadius: 6,
              }}
            >
              Notify Me
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 40, color: "#00C853" }}>
            ✓ You are on the list
          </div>
        )}
      </main>
    </div>
  );
}
