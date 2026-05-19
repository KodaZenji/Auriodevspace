"use client";

import { useState, useEffect, useRef } from "react";

// ─── HOOKS ────────────────────────────────────────────────────────────────
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
        if (cIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause);
        else setCIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, cIdx - 1));
        if (cIdx - 1 === 0) { setDeleting(false); setWIdx(i => (i + 1) % words.length); setCIdx(0); }
        else setCIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [cIdx, deleting, wIdx, words, speed, pause]);
  return display;
}

// ─── DATA ─────────────────────────────────────────────────────────────────
const ROLES = [
  "Full-Stack Development",
  "Web3 & Blockchain",
  "Digital Campaign Platforms",
  "Tech Solutions",
  "Product Design & Strategy",
];

const CODESPACES = [
  {
    id: "basematch",
    title: "BaseMatch",
    desc: "Web3 dating protocol on Base L2 — onchain connections, real relationships",
    tags: ["Solidity", "Base L2", "RainbowKit"],
    icon: "◈",
    href: "https://basematch.app",
    status: "live",
    confidential: false,
  },
  {
    id: "nexus",
    title: "Rank Nexus",
    desc: "Cross-platform leaderboards hub for Web3 distribution",
    tags: ["Next.js", "Web3", "Leaderboards"],
    icon: "⬡",
    href: "/rank-nexus",
    status: "live",
    confidential: false,
  },
  {
    id: "kaito",
    title: "Kaito Inner CT",
    desc: "Smart accounts Curated— HollyWeb3's Inner CT splash dashboard",
    tags: ["Kaito", "CT KOLs"],
    icon: "◎",
    href: "/kaito-inner-ct",
    status: "live",
    confidential: false,
  },
  {
    id: "letters",
    title: "Letter Automation App",
    desc: "Government document automation system — NYSC & institutional letters",
    tags: ["Next.js", "Node.js", "Supabase"],
    icon: "▣",
    href: null,
    status: "confidential",
    confidential: true,
  },
  {
    id: "campaign",
    title: "Campaign Website",
    desc: "Full-stack political campaign platform with admin dashboard",
    tags: ["React", "Supabase", "Vercel"],
    icon: "◉",
    href: null,
    status: "confidential",
    confidential: true,
  },
];

// Art gallery items — Twitter links or manual uploads
// To add art: { id, title, twitterUrl } OR { id, title, imageUrl }
const ART_GALLERY = [
  {
    id: "art-placeholder-1",
    title: "Waifus Contest",
    twitterUrl:"https://x.com/i/status/1890824234592571657",
    imageUrl: "/Waifus.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-2",
    title: "Upload manually",
    twitterUrl: null,
    imageUrl: null,
    placeholder: true,
  },
  {
    id: "art-placeholder-3",
    title: "Coming soon",
    twitterUrl: null,
    imageUrl: null,
    placeholder: true,
  },
];

// ─── NAV LINKS ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Codespaces", href: "#codespaces" },
  { label: "Art Gallery", href: "#artgallery" },
  { label: "GitHub", href: "https://github.com/KodaZenji", external: true },
  { label: "X / Twitter", href: "https://x.com/0x_Aurio", external: true },
];

// ─── ART MODAL ─────────────────────────────────────────────────────────────
function ArtModal({ item, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0a150a",
          border: "1px solid rgba(0,200,83,0.3)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 560, width: "100%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 6, color: "rgba(255,255,255,0.6)",
            width: 30, height: 30, cursor: "pointer",
            fontSize: 14, fontFamily: "monospace",
          }}
        >✕</button>

        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: "100%", borderRadius: 10, marginBottom: 16 }}
          />
        ) : item.twitterUrl ? (
          <div style={{
            background: "rgba(0,200,83,0.05)",
            border: "1px solid rgba(0,200,83,0.15)",
            borderRadius: 10, padding: "20px 24px", marginBottom: 16,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>𝕏</div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 12 }}>
              View this artwork on X / Twitter
            </p>
            <a
              href={item.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#00C853", color: "#050A05",
                fontWeight: 700, fontSize: 13,
                padding: "8px 20px", borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Open on X →
            </a>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 10, padding: 40,
            textAlign: "center", marginBottom: 16,
            color: "rgba(255,255,255,0.2)", fontSize: 13,
          }}>
            [ Artwork coming soon ]
          </div>
        )}

        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff" }}>
          {item.title}
        </h3>
        {item.description && (
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function KemjeeLabsPage() {
  const role = useTypewriter(ROLES);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050A05",
      color: "#fff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── animated mesh background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,80,0.12) 0%, transparent 70%)",
          top: `calc(${pos.y}px - 300px)`, left: `calc(${pos.x}px - 300px)`,
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
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00C853" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 40px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(5,10,5,0.85)",
        backdropFilter: "blur(16px)",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#00C853" strokeWidth="1.5" fill="none" />
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00C853" opacity="0.2" />
            <circle cx="14" cy="14" r="3" fill="#00C853" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", color: "#fff" }}>
            KEMJEE<span style={{ color: "#00C853" }}>LABS</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{
          display: "flex", alignItems: "center", gap: 28,
          "@media (max-width: 640px)": { display: "none" },
        }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              style={{
                fontSize: 13, letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#00C853"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >
              {link.label}
            </a>
          ))}
          <div style={{
            fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#00C853", border: "1px solid rgba(0,200,83,0.3)",
            padding: "4px 10px", borderRadius: 4,
          }}>
            Est. 2026
          </div>
        </div>

        {/* Hamburger */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 10px",
              cursor: "pointer", display: "flex", flexDirection: "column",
              gap: 5, alignItems: "center", justifyContent: "center",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,200,83,0.5)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
          >
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "#00C853" : "rgba(255,255,255,0.7)",
              borderRadius: 2,
              transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              transition: "transform 0.25s, background 0.2s",
            }} />
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "transparent" : "rgba(255,255,255,0.7)",
              borderRadius: 2, transition: "background 0.2s",
            }} />
            <span style={{
              display: "block", width: 20, height: 1.5,
              background: menuOpen ? "#00C853" : "rgba(255,255,255,0.7)",
              borderRadius: 2,
              transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              transition: "transform 0.25s, background 0.2s",
            }} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "rgba(8,16,8,0.97)",
              border: "1px solid rgba(0,200,83,0.2)",
              borderRadius: 12, minWidth: 200,
              backdropFilter: "blur(20px)",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              animation: "menuIn 0.18s ease",
            }}>
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "13px 20px",
                    fontSize: 13, letterSpacing: "0.05em",
                    color: "rgba(255,255,255,0.65)",
                    textDecoration: "none",
                    borderBottom: i < NAV_LINKS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(0,200,83,0.07)";
                    e.currentTarget.style.color = "#00C853";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                  }}
                >
                  {link.label}
                  {link.external && (
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>↗</span>
                  )}
                </a>
              ))}
              <div style={{
                padding: "10px 20px",
                borderTop: "1px solid rgba(0,200,83,0.1)",
                fontSize: 10, letterSpacing: "0.15em",
                color: "rgba(0,200,83,0.5)", textTransform: "uppercase",
              }}>
                Est. 2026 · Kemjee Labs
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <main style={{
        flex: "none", position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 60px", textAlign: "center",
      }}>

        {/* status pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)",
          borderRadius: 100, padding: "6px 16px",
          fontSize: 12, letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#00C853",
          marginBottom: 40,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#00C853", boxShadow: "0 0 8px #00C853",
            animation: "pulse 2s infinite",
          }} />
          Something is being built
        </div>

        {/* headline */}
        <h1 style={{
          fontSize: "clamp(36px, 7vw, 80px)", fontWeight: 800,
          lineHeight: 1.05, letterSpacing: "-0.03em",
          margin: "0 0 8px", maxWidth: 800,
        }}>
          We Build Things
          <br />
          <span style={{
            background: "linear-gradient(135deg, #00C853, #69F0AE)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            That Matter.
          </span>
        </h1>

        {/* typewriter */}
        <div style={{
          fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.45)",
          marginBottom: 32, height: 28, letterSpacing: "0.02em",
        }}>
          {role}
          <span style={{ color: "#00C853", animation: "blink 1s infinite" }}>|</span>
        </div>

        {/* service tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 600 }}>
          {["Full-Stack Web Apps", "Web3 & DeFi", "Campaign Platforms", "Tech Solutions", "Product Strategy", "UX Design"].map(tag => (
            <span key={tag} style={{
              fontSize: 12, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "5px 14px",
            }}>{tag}</span>
          ))}
        </div>
      </main>

      {/* ── DIVIDER ── */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "20px 0 0" }}>
        <div style={{
          display: "inline-block",
          width: 1, height: 60,
          background: "linear-gradient(to bottom, transparent, rgba(0,200,83,0.3), transparent)",
        }} />
      </div>

      {/* ── TWO COLUMN SECTION ── */}
      <section
        id="codespaces"
        style={{
          position: "relative", zIndex: 10,
          padding: "60px clamp(16px, 5vw, 80px) 80px",
          maxWidth: 1280, margin: "0 auto", width: "100%",
        }}
      >
        {/* Section label */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 40,
          justifyContent: "center",
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <span style={{
            fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap",
          }}>
            Explore the work
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32,
          alignItems: "start",
        }}>

          {/* ── LEFT: CODESPACES ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 28, height: 28,
                background: "rgba(0,200,83,0.1)",
                border: "1px solid rgba(0,200,83,0.25)",
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#00C853",
              }}>⌥</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>
                Codespaces
              </h2>
              <span style={{
                marginLeft: "auto", fontSize: 10, letterSpacing: "0.15em",
                color: "rgba(0,200,83,0.6)", textTransform: "uppercase",
                border: "1px solid rgba(0,200,83,0.2)", borderRadius: 4, padding: "2px 7px",
              }}>
                {CODESPACES.length} projects
              </span>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              Products, tools, and experiments shipped by Kemjee Labs.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CODESPACES.map(proj => (
                <CodespaceCard key={proj.id} proj={proj} />
              ))}
            </div>
          </div>

          {/* ── RIGHT: ART GALLERY ── */}
          <div id="artgallery">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 28, height: 28,
                background: "rgba(0,200,83,0.1)",
                border: "1px solid rgba(0,200,83,0.25)",
                borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#00C853",
              }}>✦</div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>
                Art Gallery
              </h2>
              <span style={{
                marginLeft: "auto", fontSize: 10, letterSpacing: "0.15em",
                color: "rgba(0,200,83,0.6)", textTransform: "uppercase",
                border: "1px solid rgba(0,200,83,0.2)", borderRadius: 4, padding: "2px 7px",
              }}>
                Handrawn
              </span>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              Our lead Dev is also an art connoisseur. Cick any piece to view.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}>
              {ART_GALLERY.map(item => (
                <ArtCard key={item.id} item={item} onClick={() => setSelectedArt(item)} />
              ))}
              {/* Add art instructions card */}
              <AddArtCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 10,
        padding: "24px 40px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: "auto",
      }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
          © 2026 Kemjee Labs. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "X", href: "https://x.com/0x_Aurio" },
            { label: "GitHub", href: "https://github.com/KodaZenji" },
            { label: "LinkedIn", href: "#" },
          ].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, color: "rgba(255,255,255,0.3)",
              textDecoration: "none", letterSpacing: "0.05em", transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#00C853"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>

      {/* ── ART MODAL ── */}
      {selectedArt && <ArtModal item={selectedArt} onClose={() => setSelectedArt(null)} />}

      {/* ── KEYFRAMES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes menuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        .desktop-nav { display: flex; }
        @media (max-width: 640px) { .desktop-nav { display: none !important; } }
      `}</style>
    </div>
  );
}

// ─── CODESPACE CARD ─────────────────────────────────────────────────────────
function CodespaceCard({ proj }) {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (proj.confidential || !proj.href) return;
    window.open(proj.href, "_blank", "noopener noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered && !proj.confidential
          ? "rgba(0,200,83,0.05)"
          : "rgba(255,255,255,0.02)",
        border: hovered && !proj.confidential
          ? "1px solid rgba(0,200,83,0.25)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: "16px 18px",
        cursor: proj.confidential ? "default" : "pointer",
        transition: "all 0.2s",
        overflow: "hidden",
      }}
    >
      {/* confidential blur overlay */}
      {proj.confidential && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 5,
          backdropFilter: "blur(4px)",
          background: "rgba(5,10,5,0.5)",
          borderRadius: 12,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{
            fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}>Confidential</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: "rgba(0,200,83,0.08)",
          border: "1px solid rgba(0,200,83,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, color: "#00C853",
        }}>
          {proj.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{proj.title}</span>
            {proj.status === "live" && (
              <span style={{
                fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#00C853", border: "1px solid rgba(0,200,83,0.3)",
                borderRadius: 3, padding: "1px 5px",
              }}>live</span>
            )}
            {!proj.confidential && proj.href && (
              <span style={{
                marginLeft: "auto", fontSize: 12,
                color: hovered ? "#00C853" : "rgba(255,255,255,0.2)",
                transition: "color 0.2s",
              }}>↗</span>
            )}
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            {proj.desc}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {proj.tags.map(t => (
              <span key={t} style={{
                fontSize: 10, letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.3)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 3, padding: "2px 7px",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ART CARD ───────────────────────────────────────────────────────────────
function ArtCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1 / 1",
        background: hovered ? "rgba(0,200,83,0.06)" : "rgba(255,255,255,0.02)",
        border: hovered ? "1px solid rgba(0,200,83,0.3)" : "1px dashed rgba(255,255,255,0.08)",
        borderRadius: 10, cursor: "pointer",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", padding: 12, gap: 6,
        overflow: "hidden", position: "relative",
      }}
    >
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, borderRadius: 10 }}
        />
      ) : (
        <>
          <span style={{ fontSize: 24, opacity: 0.3 }}>✦</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center", letterSpacing: "0.04em" }}>
            {item.title}
          </span>
        </>
      )}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 10,
          background: "rgba(0,200,83,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18 }}>👁</span>
        </div>
      )}
    </div>
  );
}

// ─── ADD ART CARD ────────────────────────────────────────────────────────────
function AddArtCard() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Add twitterUrl or imageUrl to ART_GALLERY array in code"
      style={{
        aspectRatio: "1 / 1",
        background: "transparent",
        border: hovered ? "1px dashed rgba(0,200,83,0.35)" : "1px dashed rgba(255,255,255,0.05)",
        borderRadius: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 6, transition: "all 0.2s", cursor: "default", padding: 12,
      }}
    >
      <span style={{ fontSize: 20, color: hovered ? "rgba(0,200,83,0.5)" : "rgba(255,255,255,0.1)" }}>+</span>
      <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", textAlign: "center" }}>
      </span>
    </div>
  );
}
