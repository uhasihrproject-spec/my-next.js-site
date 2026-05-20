"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

/**
 * Full-screen sky overlay that plays when the theme flips.
 * Dark → Light is a sunrise: the sun rises from the horizon while a warm
 * dawn gradient sweeps the screen. Light → Dark is a sunset: the sun
 * sinks below and the gradient deepens to night.
 *
 * Total runtime is ~1.1s (TRANSITION_MS in ThemeProvider).
 */
export default function ThemeTransition() {
  const { transitioning } = useTheme();
  const toLight = transitioning === "to-light";

  return (
    <AnimatePresence>
      {transitioning && (
        <motion.div
          key={transitioning}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className={`sky-overlay is-active ${toLight ? "sky-to-light" : "sky-to-dark"}`}
        >
          {/* Soft horizon glow band */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: [0, 0.9, 0.55], scaleY: [0.4, 1, 1] }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-x-0"
            style={{
              top: "55%",
              height: "30%",
              background: toLight
                ? "radial-gradient(60% 100% at 50% 50%, rgba(255,210,140,0.7) 0%, transparent 70%)"
                : "radial-gradient(60% 100% at 50% 50%, rgba(255,150,90,0.6) 0%, transparent 70%)",
              filter: "blur(20px)",
              transformOrigin: "center",
            }}
          />

          {/* The sun/moon disc */}
          <motion.div
            className="sky-disc"
            initial={toLight ? { top: "85%", opacity: 0 } : { top: "30%", opacity: 0 }}
            animate={
              toLight
                ? { top: ["85%", "55%", "30%"], opacity: [0, 1, 1] }
                : { top: ["30%", "55%", "85%"], opacity: [1, 1, 0] }
            }
            transition={{ duration: 1.05, ease: [0.4, 0, 0.2, 1], times: [0, 0.5, 1] }}
          />

          {/* Subtle starfield twinkle only when going dark */}
          {!toLight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.8] }}
              transition={{ duration: 1.0, times: [0, 0.55, 1] }}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 75% 18%, rgba(255,255,255,0.55), transparent), radial-gradient(1.5px 1.5px at 60% 70%, rgba(255,255,255,0.65), transparent), radial-gradient(1px 1px at 35% 80%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.45), transparent)",
              }}
            />
          )}

          {/* Bird silhouettes / morning light particles when going light */}
          {toLight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0.3] }}
              transition={{ duration: 1.0, times: [0, 0.5, 1] }}
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(1.5px 1.5px at 18% 22%, rgba(255,240,200,0.7), transparent), radial-gradient(1px 1px at 70% 28%, rgba(255,240,200,0.6), transparent), radial-gradient(1px 1px at 42% 18%, rgba(255,240,200,0.5), transparent)",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
