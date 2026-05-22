"use client";

import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready?: (cb: () => void) => void;
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
          size?: "normal" | "compact";
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

export interface RecaptchaHandle {
  /** Current solved token, or "" if not yet ticked. */
  getToken: () => string;
  /** Reset the widget — call after a failed login so the user can re-tick. */
  reset: () => void;
}

interface Props {
  /** Fired when the user ticks "I'm not a robot" and is verified. */
  onChange?: (token: string) => void;
  /** "dark" matches the auth pages by default; falls back to "light". */
  theme?: "light" | "dark";
}

/**
 * Google reCAPTCHA v2 "I'm not a robot" checkbox.
 *
 * Renders nothing when NEXT_PUBLIC_RECAPTCHA_SITE_KEY isn't set so local
 * dev keeps working before the site key is registered with Google. When
 * the key is configured the widget loads on demand and its solved token
 * is exposed via `ref.current.getToken()`.
 */
const Recaptcha = forwardRef<RecaptchaHandle, Props>(function Recaptcha({ onChange, theme = "dark" }, ref) {
  const siteKey = (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "").trim().replace(/^['"]+|['"]+$/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [token, setToken] = useState("");

  useImperativeHandle(ref, () => ({
    getToken: () => token,
    reset: () => {
      setToken("");
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try { window.grecaptcha.reset(widgetIdRef.current); } catch { /* ignore */ }
      }
    },
  }), [token]);

  useEffect(() => {
    if (!siteKey || typeof window === "undefined") return;

    const SCRIPT_ID = "vx-recaptcha-script";
    let cancelled = false;

    function render() {
      if (cancelled || widgetIdRef.current !== null) return;
      if (!containerRef.current || !window.grecaptcha) return;
      try {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (t: string) => { setToken(t); onChange?.(t); },
          "expired-callback": () => { setToken(""); onChange?.(""); },
          "error-callback":   () => { setToken(""); onChange?.(""); },
        });
      } catch { /* widget already rendered in container; ignore */ }
    }

    function whenReady() {
      if (window.grecaptcha?.ready) window.grecaptcha.ready(render);
      else render();
    }

    if (window.grecaptcha) {
      whenReady();
      return () => { cancelled = true; };
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", whenReady);
    return () => {
      cancelled = true;
      script?.removeEventListener("load", whenReady);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, theme]);

  // No site key — invisible. Server still allows the request (verifyRecaptcha
  // skips when no secret is set), so dev keeps working.
  if (!siteKey) return null;

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="vx-recaptcha-host" style={{ minHeight: 78 }} />
    </div>
  );
});

export default Recaptcha;
