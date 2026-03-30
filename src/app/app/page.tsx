"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/us/app/tremap/id1669477980";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.twiggers.tremap";
const ANDROID_INTENT_URI = `intent://open#Intent;scheme=tremap;package=com.twiggers.tremap;S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;

type PageState = "detecting" | "fallback" | "desktop";

// ─── Tree SVG shapes ──────────────────────────────────────────────────────────

function PineTree() {
  return (
    <svg viewBox="0 0 80 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,2 8,68 26,68 4,118 22,118 0,170 80,170 58,118 76,118 54,68 72,68" />
      <rect x="34" y="170" width="12" height="28" />
    </svg>
  );
}

function RoundTree() {
  return (
    <svg viewBox="0 0 100 190" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="82" rx="46" ry="72" />
      <rect x="44" y="145" width="12" height="45" />
    </svg>
  );
}

function SlimTree() {
  return (
    <svg viewBox="0 0 60 220" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,2 4,72 18,72 0,138 16,138 2,198 58,198 44,138 60,138 42,72 56,72" />
    </svg>
  );
}

// ─── Tree decorator ───────────────────────────────────────────────────────────

interface TreeDecorProps {
  variant: "pine" | "round" | "slim";
  width: number;
  bottom?: string | number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  delay: string;
  duration: string;
  opacity?: number;
}

function TreeDecor({
  variant,
  width,
  bottom,
  top,
  left,
  right,
  delay,
  duration,
  opacity = 0.09,
}: TreeDecorProps) {
  const Shape = variant === "pine" ? PineTree : variant === "round" ? RoundTree : SlimTree;
  return (
    <div
      style={{
        position: "absolute",
        width,
        color: "#2a5a1a",
        opacity,
        transformOrigin: "bottom center",
        animation: `treeSway ${duration} ease-in-out ${delay} infinite alternate`,
        bottom,
        top,
        left,
        right,
        pointerEvents: "none",
      }}
    >
      <Shape />
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{ position: "relative", width: 40, height: 40 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(61,107,53,0.12)",
          borderTopColor: "#3d6b35",
          animation: "spinArc 0.85s linear infinite",
        }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

// ─── Store buttons ────────────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppRedirectPage() {
  const [state, setState] = useState<PageState>("detecting");

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroid = /Android/.test(ua);

    if (!isIOS && !isAndroid) {
      setState("desktop");
      return;
    }

    if (isAndroid) {
      window.location.href = ANDROID_INTENT_URI;
      const timer = setTimeout(() => setState("fallback"), 2000);
      return () => clearTimeout(timer);
    }

    if (isIOS) {
      window.location.href = "tremap://";
      let appOpened = false;
      const onVisibilityChange = () => {
        if (document.hidden) appOpened = true;
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      const timer = setTimeout(() => {
        if (!appOpened) window.location.href = APP_STORE_URL;
      }, 2000);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    }
  }, []);

  const isDetecting = state === "detecting";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }

        @keyframes treeSway {
          from { transform: rotate(-2deg); }
          to   { transform: rotate(2deg);  }
        }

        @keyframes spinArc {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        @keyframes treeReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .store-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #1b1b1b;
          color: #fff;
          border-radius: 14px;
          padding: 14px 28px;
          text-decoration: none;
          font-family: Lora, Georgia, serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.015em;
          width: 100%;
          transition:
            transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s ease,
            background  0.15s ease;
        }

        .store-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
          background: #2c2c2c;
        }

        .store-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
      `}</style>

      {/* Outer shell */}
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 60%, #f0f6ec 0%, #e8f2e3 55%, #dcebd5 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Soft vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(44,78,30,0.08) 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Tree layer — fills the full container */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            animation: "treeReveal 2s ease both",
          }}
        >
          {/* Bottom-left — large round */}
          <TreeDecor variant="round" width={230} bottom={-50} left={-65} delay="-1.2s" duration="7.5s" opacity={0.11} />
          {/* Bottom-right — pine */}
          <TreeDecor variant="pine"  width={175} bottom={-25} right={-45} delay="-3.1s" duration="8s"   opacity={0.1}  />
          {/* Top-left — slim */}
          <TreeDecor variant="slim"  width={115} top={-55}    left={25}   delay="-5.4s" duration="9s"   opacity={0.08} />
          {/* Top-right — round */}
          <TreeDecor variant="round" width={145} top={-70}    right={5}   delay="-2.3s" duration="6.5s" opacity={0.09} />
          {/* Left mid — pine */}
          <TreeDecor variant="pine"  width={100} top="32%"    left={-28}  delay="-4.0s" duration="7s"   opacity={0.065}/>
          {/* Right mid — slim */}
          <TreeDecor variant="slim"  width={88}  top="38%"    right={-22} delay="-6.2s" duration="8.5s" opacity={0.07} />
          {/* Bottom centre-left — small round */}
          <TreeDecor variant="round" width={92}  bottom={-35} left="18%"  delay="-2.8s" duration="6s"   opacity={0.055}/>
          {/* Bottom centre-right — small pine */}
          <TreeDecor variant="pine"  width={78}  bottom={-15} right="20%" delay="-4.7s" duration="7s"   opacity={0.05} />
        </div>

        {/* Main card */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
            padding: "48px 32px",
            textAlign: "center",
            animation: "fadeInUp 0.85s cubic-bezier(0.22,1,0.36,1) 0.1s both",
          }}
        >
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Tremap — Know every tree"
            width={260}
            height={130}
            priority
            style={{ objectFit: "contain", filter: "drop-shadow(0 4px 16px rgba(44,78,30,0.1))" }}
          />

          {/* Divider */}
          <div
            style={{
              width: 36,
              height: 1.5,
              borderRadius: 2,
              background: "linear-gradient(90deg, transparent, rgba(61,107,53,0.35), transparent)",
            }}
          />

          {/* Status */}
          {isDetecting ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <Spinner />
              <p
                style={{
                  margin: 0,
                  fontFamily: "Lora, Georgia, serif",
                  fontStyle: "italic",
                  color: "#4a6840",
                  fontSize: "15px",
                  letterSpacing: "0.01em",
                }}
              >
                Opening the app&hellip;
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                width: "100%",
                maxWidth: "268px",
                animation: "fadeInUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "Lora, Georgia, serif",
                  color: "#4a6840",
                  fontSize: "13.5px",
                  letterSpacing: "0.03em",
                  opacity: 0.75,
                }}
              >
                {state === "desktop" ? "Available on iOS & Android" : "Get the app"}
              </p>
              <a href={APP_STORE_URL} className="store-btn">
                <AppleIcon />
                App Store
              </a>
              <a href={PLAY_STORE_URL} className="store-btn">
                <PlayIcon />
                Google Play
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
