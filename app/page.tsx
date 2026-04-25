"use client";

import Link from "next/link";
import RocketBlast from "@/components/ascii/rocket-blast";
import { JsonLd } from "@/components/json-ld";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchEmails,
  deleteEmail,
  deleteEmailAddress,
  checkHealth,
  createEmailAddress,
  type ParsedMail,
} from "@/lib/api";

interface ToastMessage {
  id: number;
  message: string;
  type: "error" | "success";
}

interface Mail extends ParsedMail {
  unread: boolean;
}

const POLL_INTERVAL = 5000;

const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1); // D6

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};


const getIframeDoc = (html: string, currentTheme: string) => {
  const isDark = currentTheme === "dark";
  const fg = isDark ? "#e8e4da" : "#000000";
  const linkColor = isDark ? "#8cb4ff" : "#0000ff";
  
  // Inject base styles to match the TempMail theme, but use !important to override inline styles where needed.
  const style = `
    <style>
      body {
        background-color: transparent !important;
        color: ${fg} !important;
        font-family: 'Courier Prime', monospace, sans-serif !important;
        margin: 0;
        padding: 0;
        font-size: 14px;
        line-height: 1.6;
        font-weight: 500;
      }
      a { color: ${linkColor} !important; text-decoration: underline !important; }
      * { color: ${fg} !important; background-color: transparent !important; border-color: ${fg}22 !important; }
    </style>
  `;
  return style + html;
};

export default function Home() {
  const [currentAddr, setCurrentAddr] = useState("");
  const [mails, setMails] = useState<Mail[]>([]);
  const [activeMailId, setActiveMailId] = useState<number | null>(null);
  const [status, setStatus] = useState("ready");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiUp, setIsApiUp] = useState(true);
  const [hasEnteredUsername, setHasEnteredUsername] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [nextRefreshIn, setNextRefreshIn] = useState(10);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenEmailIds = useRef<Set<number>>(new Set());

  const clearLocalSession = useCallback(() => {
    setCurrentAddr("");
    localStorage.removeItem("xelio_addr");
    setMails([]);
    seenEmailIds.current.clear();
    setActiveMailId(null);
    setHasEnteredUsername(false);
    setInputUsername("");
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: "error" | "success" = "error") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    [],
  );

  
  useEffect(() => {
    const savedAddr = localStorage.getItem("xelio_addr");
    if (savedAddr) {
      setCurrentAddr(savedAddr);
      setHasEnteredUsername(true);
    }
    const savedTheme = localStorage.getItem("xelio_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    setIsInitializing(false);
  }, []);


  
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("xelio_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      return newTheme;
    });
  }, []);

  const loadEmails = useCallback(async () => {
    if (!currentAddr) return;
    try {
      const emails = await fetchEmails(currentAddr);
      
      const isInitialLoad = seenEmailIds.current.size === 0;
      let hasNew = false;

      emails.forEach((e) => {
        if (!seenEmailIds.current.has(e.id)) {
          if (!isInitialLoad) hasNew = true;
          seenEmailIds.current.add(e.id);
        }
      });

      if (hasNew) {
        playNotificationSound();
      }

      setMails((prev) => {
        const prevMap = new Map(prev.map((m) => [m.id, m]));
        return emails.map((e) => {
          const existing = prevMap.get(e.id);
          return {
            ...e,
            unread: existing ? existing.unread : true,
          };
        });
      });
      setIsApiUp(true);
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("not found") || msg.includes("invalid") || msg.includes("expire")) {
        clearLocalSession();
        addToast("Session expired", "error");
      } else {
        setIsApiUp(false);
      }
    }
  }, [currentAddr, clearLocalSession, addToast]);

  const createAddr = useCallback(
    async (username: string) => {
      if (isGenerating) return;
      setIsGenerating(true);
      setStatus("creating address");

      try {
        const result = await createEmailAddress(username);
        setCurrentAddr(result.address);
        localStorage.setItem("xelio_addr", result.address);
        setHasEnteredUsername(true);
        setStatus("ready");
        setMails([]);
    seenEmailIds.current.clear();
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to create address";
        // Show the exact error message from the API
        addToast(errorMsg, "error");
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, addToast],
  );

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const username = inputUsername.trim().toLowerCase();
    if (!username) {
      addToast("Please enter a username", "error");
      return;
    }
    if (username.length < 3 || username.length > 32) {
      addToast("Username must be 3-32 characters", "error");
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      addToast("Only letters, numbers, hyphens, and underscores", "error");
      return;
    }
    createAddr(username);
  };

  const removeAddr = useCallback(async () => {
    if (!currentAddr) return;
    try {
      await deleteEmailAddress(currentAddr);
      clearLocalSession();
      setStatus("address deleted");
    } catch {
      setStatus("failed to delete address");
    }
  }, [currentAddr, clearLocalSession]);

  const copyAddr = useCallback(() => {
    if (currentAddr) {
      navigator.clipboard.writeText(currentAddr).catch(() => {});
      addToast("Copied to clipboard", "success");
      setStatus("ready");
    }
  }, [currentAddr, addToast]);

  const openMail = useCallback((id: number) => {
    setMails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m)),
    );
    setActiveMailId(id);
  }, []);

  const removeMail = useCallback(
    async (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentAddr) return;
      try {
        await deleteEmail(currentAddr, id);
        setMails((prev) => prev.filter((m) => m.id !== id));
        if (activeMailId === id) setActiveMailId(null);
        setStatus("message deleted");
        setTimeout(() => setStatus("ready"), 2000);
      } catch {
        setStatus("failed to delete");
      }
    },
    [currentAddr, activeMailId],
  );

  // Dynamic page title
  useEffect(() => {
    const unread = mails.filter((m) => m.unread).length;
    if (!isApiUp) {
      document.title = "Xelio · offline";
    } else if (mails.length > 0) {
      if (unread > 0) {
        document.title = `Xelio · ${unread} new`;
      } else {
        document.title = `Xelio · ${mails.length}`;
      }
    } else if (currentAddr) {
      document.title = "Xelio · waiting";
    } else {
      document.title = "Xelio";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mails.length, isApiUp, currentAddr]);

  useEffect(() => {
    if (!currentAddr || isGenerating) return;

    let isVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        loadEmails();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    loadEmails();
    setStatus("checking for messages");

    pollIntervalRef.current = setInterval(() => {
      if (isVisible) {
        loadEmails();
      }
    }, 10000); // Reduced polling frequency to every 10 seconds

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [currentAddr, isGenerating, loadEmails]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!currentAddr) return;

    const countdown = setInterval(() => {
      setNextRefreshIn(prev => prev <= 1 ? 10 : prev - 1);
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentAddr]);

  useEffect(() => {
    let isVisible = !document.hidden;
    
    const checkApi = async () => {
      if (!isVisible) return;
      const up = await checkHealth();
      setIsApiUp(up);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    checkApi();
    const interval = setInterval(checkApi, 60000); // Check API health only every 60s
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const unreadCount = mails.filter((m) => m.unread).length;

  useEffect(() => {
    if (mails.length > 0) {
      setStatus("ready");
    } else if (isApiUp) {
      setStatus("awaiting signal");
    } else {
      setStatus("api offline");
    }
  }, [mails.length, isApiUp]);

  const activeMail = mails.find((m) => m.id === activeMailId);
  const addrParts = currentAddr.split("@");

  const renderToasts = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );

    if (isInitializing) {
    return (
      <div className="app">
        <div className="stipple-bg" />
        <div className="dither-overlay" />
        <div className="grain" />
      </div>
    );
  }

  // Landing Screen
  if (!hasEnteredUsername) {
    return (
      <div className="app">
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Xelio",
          description: "Free temporary disposable email service. Create instant email addresses to protect your inbox from spam.",
          url: "https://xelio.me",
          applicationCategory: "UtilityApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          creator: { "@type": "Person", name: "krey-yon", url: "https://github.com/krey-yon" },
          featureList: ["Temporary email", "Disposable addresses", "Auto-delete", "No registration", "Free"],
          breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://xelio.me" }] }
        }} />
        {renderToasts()}
        <div className="stipple-bg" />
        <div className="dither-overlay" />
        <div className="grain" />

        <div className="header">
          <div className="logo">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M3 9l13 10 13-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Xelio
          </div>
          <div className="header-actions">
            <button className="icon-link" onClick={toggleTheme} title="Toggle Theme">
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <Link href="/privacy" className="icon-link" title="Privacy Policy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </Link>
            <Link href="/about" className="icon-link" title="About">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </Link>
            <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer" className="icon-link" title="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
        </div>

        <div className="landing">
          <div className="landing-content">
            <h1 className="landing-title">Temporary email</h1>
            <p className="landing-subtitle">
              Instant. Private. Ephemeral.
            </p>

            <form onSubmit={handleUsernameSubmit} className="landing-form">
              <div className="input-group">
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => {
                    setInputUsername(e.target.value);
                  }}
                  placeholder="username"
                  className="username-input"
                  disabled={isGenerating}
                  autoFocus
                />
                <span className="input-domain">@xelio.me</span>
              </div>
              <button
                type="submit"
                className="btn-solid get-started-btn"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="loading-dots">
                    <span className="ldot" />
                    <span className="ldot" />
                    <span className="ldot" />
                  </span>
                ) : (
                  "Create Address"
                )}
              </button>
            </form>

            <div className="landing-hint">
              <span>
                3-32 characters · a-z, 0-9, -, _
              </span>
            </div>
            
            <div className="author-credit">
              <div><a href="https://github.com/krey-yon" target="_blank" rel="noopener noreferrer">krey-yon</a></div>
              <div className="os-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                OPEN SOURCE
              </div>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-left">
            <div className={`status-dot ${isApiUp ? "active" : "offline"}`} />
            <span>{isApiUp ? "api active" : "api offline"}</span>
          </div>
          <div className="status-msg">{status}</div>
        </div>
      </div>
    );
  }

  // Email Dashboard
  return (
    <div className="app">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Xelio",
        description: "Free temporary disposable email service. Create instant email addresses to protect your inbox from spam.",
        url: "https://xelio.me",
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        creator: { "@type": "Person", name: "krey-yon", url: "https://github.com/krey-yon" },
        featureList: ["Temporary email", "Disposable addresses", "Auto-delete", "No registration", "Free"],
        screenshot: "https://xelio.me/screenshot.png",
        breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://xelio.me" }] }
      }} />
      {renderToasts()}
      <div className="stipple-bg" />
      <div className="dither-overlay" />
      <div className="grain" />

      <div className="header">
        <div className="logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="7"
              width="26"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M3 9l13 10 13-10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Xelio
        </div>
        <div className="header-actions">
            <button className="icon-link" onClick={toggleTheme} title="Toggle Theme">
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <Link href="/privacy" className="icon-link" title="Privacy Policy">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </Link>
            <Link href="/about" className="icon-link" title="About">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </Link>
            <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer" className="icon-link" title="GitHub">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          </div>
      </div>

      <div className="main">
        <div className="sidebar">
          <div className="addr-box">
            <div className="addr-label">your address</div>
            <div className="addr-value">
              {currentAddr ? (
                <>
                  <span>{addrParts[0]}</span>
                  <span className="domain">@{addrParts[1]}</span>
                </>
              ) : (
                <span className="generating">waiting...</span>
              )}
            </div>
            <div className="addr-actions" style={{ display: 'flex', gap: '8px' }}>
              <button
                className="icon-link"
                onClick={copyAddr}
                disabled={!currentAddr}
                title="Copy Address"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button
                className="icon-link"
                onClick={() => {
                  loadEmails();
                  addToast("Refreshed inbox", "success");
                }}
                disabled={!currentAddr || isGenerating}
                title="Refresh Inbox"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </button>
              <button
                className="icon-link"
                onClick={removeAddr}
                disabled={!currentAddr}
                title="Delete Address"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>

          <div className="inbox-header">
            inbox · <span>{unreadCount}</span> unread
          </div>

          <div className="inbox-list">
            {mails.length === 0 ? (
              <div className="empty-state">
                <div className="empty-dots">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className={`edot${i === 0 ? " lit" : ""}`} />
                  ))}
                </div>
                <div className="empty-text">
                  {isApiUp ? "awaiting signal" : "api offline"}
                </div>
              </div>
            ) : (
              mails.map((mail) => (
                <div
                  key={mail.id}
                  className={`mail-item${mail.unread ? " unread" : ""}${
                    mail.id === activeMailId ? " active" : ""
                  }`}
                  onClick={() => openMail(mail.id)}
                >
                  <div className="mail-from">{mail.from.split("@")[0]}</div>
                  <div className="mail-subject-small">{mail.subject}</div>
                  <div className="mail-time">{mail.time}</div>
                  <button
                    className="mail-delete"
                    onClick={(e) => removeMail(mail.id, e)}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="content">
          <div className="content-bar">
            <div className="content-bar-label">message</div>
            <div className="badge">
              {activeMail ? activeMail.from : "none selected"}
            </div>
          </div>

          {activeMail ? (
            <div className="mail-view">
              <div className="mv-from">{activeMail.from}</div>
              <div className="mv-subject">{activeMail.subject}</div>
              <div className="mv-meta">
                <div className="mv-meta-item">
                  to <span>{addrParts[0]}...</span>
                </div>
                <div className="mv-meta-item">
                  received <span>{activeMail.time}</span>
                </div>
              </div>
              <div className="mv-body">
                {activeMail.isHtml ? (
                  <iframe 
                    srcDoc={getIframeDoc(activeMail.body, theme)} 
                    style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px', background: 'transparent', borderRadius: '4px' }} 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  />
                ) : (
                  activeMail.body.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="no-mail">
              <div className="rocket-container"><RocketBlast /></div>
              <div className="empty-text">select a message</div>
            </div>
          )}
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <div className={`status-dot ${isApiUp ? "active" : "offline"}`} />
          <span>{isApiUp ? "api active" : "api offline"}</span>
          <span className="separator">|</span>
          <span>refresh in {nextRefreshIn}s</span>
        </div>
        <div className="status-msg">{status}</div>
      </div>
    </div>
  );
}
