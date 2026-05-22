"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

/**
 * Buttery-smooth iris reveal with a spinning VaultX logo at centre.
 *
 * Everything is transform / opacity only — no clip-path, no filter
 * animation, no per-frame layout — so the browser keeps every element
 * on its own GPU compositor layer.
 */
export default function ThemeTransition() {
  const { transitioning, origin } = useTheme();
  const toLight = transitioning === "to-light";
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    const update = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!transitioning) return null;

  const ox = origin?.x ?? vw - 60;
  const oy = origin?.y ?? 40;
  // Final disc diameter must cover the furthest viewport corner.
  const maxR = Math.hypot(Math.max(ox, vw - ox), Math.max(oy, vh - oy)) + 60;
  const startSize = 2;
  const finalScale = (maxR * 2) / startSize;

  const destBg  = toLight ? "#f5f5f7" : "#161618";
  const accent  = toLight ? "#3b82f6" : "#60a5fa";

  return (
    <AnimatePresence>
      <motion.div
        key="theme-iris"
        className="fixed inset-0 z-[9999] pointer-events-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ opacity: { duration: 0.18 } }}
      >
        {/* ── 1. Iris disc — solid colour of destination theme ── */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: finalScale }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: oy - startSize / 2,
            left: ox - startSize / 2,
            width: startSize,
            height: startSize,
            borderRadius: "50%",
            background: destBg,
            willChange: "transform",
            transformOrigin: "center",
          }}
        />

        {/* ── 2. Centred logo with halo + spin ── */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform, opacity",
          }}
        >
          {/* Soft brand-blue halo behind the logo */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.6, 2.4], opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.25, times: [0, 0.42, 1], ease: "easeOut" }}
            style={{
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)`,
              willChange: "transform, opacity",
            }}
          />

          {/* The logo tile — fades in, spins twice, scales out */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -120 }}
            animate={{
              scale:   [0.4, 1.15, 1.05, 1.0, 0.7, 0.2],
              opacity: [0,   1,    1,    1,   1,   0],
              rotate:  [-120, 60,  240,  420, 600, 780],
            }}
            transition={{
              duration: 1.4,
              times:    [0, 0.18, 0.38, 0.58, 0.82, 1],
              ease:     [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "relative",
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
              boxShadow: `0 18px 60px ${accent}99, 0 0 0 1px rgba(255,255,255,0.12) inset`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              willChange: "transform, opacity",
              transformOrigin: "center",
            }}
          >
            {/* The 4-square mark, identical to the navbar logo, scaled up */}
            <svg width="36" height="36" viewBox="0 0 12 12" fill="none">
              <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.7" fill="white" />
              <rect x="7"   y="0.5" width="4.5" height="4.5" rx="0.7" fill="white" opacity="0.55" />
              <rect x="0.5" y="7"   width="4.5" height="4.5" rx="0.7" fill="white" opacity="0.55" />
              <rect x="7"   y="7"   width="4.5" height="4.5" rx="0.7" fill="white" opacity="0.30" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
