"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });

// ─── HOOKS ────────────────────────────────────────────────────────────────
function useTypewriter(words, speed = 80, pause = 2000) {
  const [{ w, text, deleting }, setState] = useState({ w: 0, text: words[0], deleting: false });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const full = words[w];
    const atEnd = !deleting && text === full;
    const delay = atEnd ? pause : deleting ? speed / 2 : speed;
    const id = setTimeout(() => {
      if (atEnd) setState({ w, text, deleting: true });
      else if (deleting) {
        if (text.length <= 1) setState({ w: (w + 1) % words.length, text: "", deleting: false });
        else setState({ w, text: text.slice(0, -1), deleting: true });
      } else setState({ w, text: full.slice(0, text.length + 1), deleting: false });
    }, delay);
    return () => clearTimeout(id);
  }, [w, text, deleting, words, speed, pause]);
  return text;
}

// ─── DATA ─────────────────────────────────────────────────────────────────
const ROLES = [
  "Full-Stack Development",
  "Web3 & Blockchain",
  "Digital Campaign Platforms",
  "Tech Solutions",
  "Product Design & Strategy",
];

const ART_GALLERY = [
  {
    id: "art-placeholder-1",
    title: "Waifus Contest",
    twitterUrl: "https://x.com/i/status/1890824234592571657",
    imageUrl: "/Waifus.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-2",
    title: "Bosu Contest",
    twitterUrl: "https://x.com/i/status/1885665674627789302",
    imageUrl: "/Bosu Contest.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-3",
    title: "Mi Familia",
    twitterUrl: "https://x.com/i/status/1882577887330770953",
    imageUrl: "/primos.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-4",
    title: "I 'Canna' Like it",
    twitterUrl: "https://x.com/i/status/1873861411526631570",
    imageUrl: "/Canna.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-5",
    title: "The Chef Beak",
    twitterUrl: "https://x.com/i/status/2057071911398429063",
    imageUrl: "/Chef.jpg",
    placeholder: true,
  },
  {
    id: "art-placeholder-6",
    title: "Go Velin or Go Home",
    twitterUrl: "https://x.com/i/status/2063788421466771825",
    imageUrl: "/go_velin.png",
    placeholder: true,
  },
];

const CODESPACES = [

  {
    id: "NotInked",
    title: "NøtInked",
    desc: "Check before you get Inked — Powered by Inkonchain",
    tags: ["Safety", "Ink ecosystem"],
    icon: "/notinked.png",
    href: "https://notinked.xyz",
    status: "live",
    confidential: false,
  },
  {
    id: "basematch",
    title: "BaseMatch",
    desc: "Web3 dating protocol on Base L2 — onchain connections, real relationships",
    tags: ["Solidity", "Base L2", "RainbowKit"],
    icon: "https://ipfs.filebase.io/ipfs/QmQ1A5FsxFhHUHkxQpH8uDvBrLQTDFPjT5XCDwhCFPW5ZZ",
    href: "https://basematch.app",
    status: "live",
    confidential: false,
  },
  {
    id: "nexus",
    title: "Rank Nexus",
    desc: "Cross-platform leaderboards hub for Web3 distribution",
    tags: ["Next.js", "Web3", "Leaderboards"],
    icon: "/nexus.png",
    href: "/rank-nexus",
    status: "live",
    confidential: false,
  },
  {
    id: "kaito",
    title: "Kaito Inner CT",
    desc: "Smart accounts Curated— HollyWeb3's Inner CT splash dashboard",
    tags: ["Kaito", "CT KOLs"],
    icon: "/kaito-Logo.png",
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

const NAV_LINKS = [
  { label: "Codespaces", href: "#codespaces" },
  { label: "Art Gallery", href: "#artgallery" },
  { label: "GitHub", href: "https://github.com/KodaZenji", external: true },
  { label: "X / Twitter", href: "https://x.com/0x_Aurio", external: true },
];


// ─── HELPERS ──────────────────────────────────────────────────────────────
function isImageSrc(icon) {
  return typeof icon === "string" && (icon.startsWith("http") || icon.startsWith("/"));
}

// ─── ART MODAL ─────────────────────────────────────────────────────────────
function ArtModal({ item, onClose }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
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
          maxHeight: "90dvh", overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          type="button"
          aria-label="Close"
          autoFocus
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

        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            width={1200}
            height={1200}
            sizes="(max-width: 600px) 90vw, 520px"
            style={{ width: "100%", height: "auto", maxHeight: "60dvh", objectFit: "contain", borderRadius: 10, marginBottom: item.twitterUrl ? 10 : 16 }}
          />
        )}

        {item.twitterUrl ? (
          <div style={{
            background: "rgba(0,200,83,0.05)",
            border: "1px solid rgba(0,200,83,0.15)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <span style={{ fontSize: 16 }}>𝕏</span>

  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
      See this art on X
    </span>

    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
      Press Esc or click outside to close
    </span>
  </div>
</div>
            <a
              href={item.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "#00C853", color: "#050A05",
                fontWeight: 700, fontSize: 12,
                padding: "6px 16px", borderRadius: 6,
                textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              Open →
            </a>
          </div>
        ) : !item.imageUrl ? (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 10, padding: 40,
            textAlign: "center", marginBottom: 16,
            color: "rgba(255,255,255,0.2)", fontSize: 13,
          }}>
            [ Artwork coming soon ]
          </div>
        ) : null}

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
  const glowRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState(null);
  const menuRef = useRef(null);
  const closeArt = useCallback(() => setSelectedArt(null), []);

  // Glow follows the cursor via a direct transform: no React state, no re-renders
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mq.matches) return;
    let raf = 0;
    const move = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (glowRef.current) glowRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#050A05",
      color: "#fff",
      fontFamily: `${inter.style.fontFamily}, 'Segoe UI', sans-serif`,
      position: "relative",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── animated mesh background ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div ref={glowRef} style={{
          position: "absolute", top: 0, left: 0, width: 600, height: 600,
          margin: "-300px 0 0 -300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,80,0.12) 0%, transparent 70%)",
          transform: "translate3d(50vw, 30vh, 0)",
          transition: "transform 0.8s ease", willChange: "transform",
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

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
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

        <div ref={menuRef} className="mobile-menu" style={{ position: "relative" }}>
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

        <div style={{
          fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.45)",
          marginBottom: 32, height: 28, letterSpacing: "0.02em",
        }}>
          {role}
          <span style={{ color: "#00C853", animation: "blink 1s infinite" }}>|</span>
        </div>

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
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 40,
          justifyContent: "center",
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <span style={{
            fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap",
          }}>
            Explore our work
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* ── FIX: both columns are now inside this grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 32,
          alignItems: "start",
        }}>

          {/* ── LEFT: ART GALLERY ── */}
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
                Hand-drawn
              </span>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              Our Senior Dev is an art connoisseur. He creates masterpieces. Click any to view.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 12,
            }}>
              {ART_GALLERY.map(item => (
                <ArtCard key={item.id} item={item} onClick={() => setSelectedArt(item)} />
              ))}
              {process.env.NODE_ENV === "development" && <AddArtCard />}
            </div>
          </div>

          {/* ── RIGHT: CODESPACES ── */}
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

        </div>{/* ── end grid ── */}
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
            // { label: "LinkedIn", href: "https://linkedin.com/in/your-handle" },
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

      {selectedArt && <ArtModal item={selectedArt} onClose={closeArt} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes menuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        .desktop-nav { display: flex; }
        .mobile-menu { display: none; }
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu { display: block; } }
        :focus-visible { outline: 2px solid #00C853; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </div>
  );
}

// ─── CODESPACE CARD ─────────────────────────────────────────────────────────
function CodespaceCard({ proj }) {
  const [hovered, setHovered] = useState(false);

  const locked = proj.confidential || !proj.href;
  const external = !locked && proj.href.startsWith("http");
  const Card = locked ? "div" : external ? "a" : Link;
  const linkProps = locked ? {} : external
    ? { href: proj.href, target: "_blank", rel: "noopener noreferrer" }
    : { href: proj.href };

  return (
    <Card
      {...linkProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "block", color: "inherit", textDecoration: "none",
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
        {/* ── FIX: render image or fallback text icon ── */}
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: "rgba(0,200,83,0.08)",
          border: "1px solid rgba(0,200,83,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {isImageSrc(proj.icon) ? (
            <Image
              src={proj.icon}
              alt=""
              width={36}
              height={36}
              unoptimized={proj.icon.startsWith("http")}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 7 }}
            />
          ) : (
            <span style={{ fontSize: 16, color: "#00C853" }}>{proj.icon}</span>
          )}
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
    </Card>
  );
}

// ─── ART CARD ───────────────────────────────────────────────────────────────
function ArtCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      aria-label={`View ${item.title}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", font: "inherit", color: "inherit",
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
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, 160px"
          style={{ objectFit: "cover", borderRadius: 10 }}
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
        <span style={{
          position: "absolute", inset: 0, borderRadius: 10,
          background: "rgba(0,200,83,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18 }}>👁</span>
        </span>
      )}
    </button>
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
    </div>
  );
}
