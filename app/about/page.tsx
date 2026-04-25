"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("xelio_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("xelio_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="app">
      <div className="stipple-bg" />
      <div className="dither-overlay" />
      <div className="grain" />

      <div className="header">
        <Link href="/" className="logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="7" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M3 9l13 10 13-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Xelio
        </Link>
        <div className="header-actions">
          <button className="icon-link" onClick={toggleTheme} title="Toggle Theme">
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="content-page">
        <div className="content-container">
          <h1 className="page-title">About Xelio</h1>
          <p className="page-date">Version 1.0 — April 2026</p>

          <div className="policy-section">
            <h2>What is Xelio?</h2>
            <p>
              Xelio is a free temporary email service that lets you create instant, disposable email addresses. Protect your real inbox from spam, trackers, and unwanted sign-ups without revealing your identity.
            </p>
          </div>

          <div className="policy-section">
            <h2>Key Features</h2>
            <p>
              <strong>Instant addresses</strong> — Generate a working email in seconds. No registration or personal information required.
            </p>
            <p>
              <strong>Automatic deletion</strong> — All emails and addresses are automatically purged after your session ends.
            </p>
            <p>
              <strong>Real-time inbox</strong> — Messages appear instantly with live polling. No manual refresh needed.
            </p>
            <p>
              <strong>Privacy first</strong> — No tracking, no logs, no data sharing. Your temporary communications stay temporary.
            </p>
          </div>

          <div className="policy-section">
            <h2>How It Works</h2>
            <p>
              Choose any username you like, and Xelio creates a unique email address at xelio.me. Any emails sent to that address appear in your inbox immediately. When you are done or close the browser, the address and all its messages are permanently deleted.
            </p>
          </div>

          <div className="policy-section">
            <h2>Use Cases</h2>
            <p>
              <strong>Sign up for services</strong> — Avoid spam in your real inbox when testing new platforms.
            </p>
            <p>
              <strong>Protect your identity</strong> — Communicate anonymously without revealing personal email.
            </p>
            <p>
              <strong>Quick verifications</strong> — Receive confirmation codes without long-term commitment.
            </p>
            <p>
              <strong>One-time communications</strong> — Perfect for classified submissions or temporary correspondence.
            </p>
          </div>

          <div className="policy-section">
            <h2>Open Source</h2>
            <p>
              Xelio is built and maintained by <a href="https://github.com/krey-yon" target="_blank" rel="noopener noreferrer">krey-yon</a>. The frontend code is publicly available on GitHub. We believe in transparency and community-driven development.
            </p>
          </div>

          <div className="policy-section">
            <h2>Technology</h2>
            <p>
              Built with Next.js 16, React 19, and Tailwind CSS. Optimized for performance with Turbopack, featuring real-time email polling, WebAudio notifications, and a retro-terminal aesthetic.
            </p>
          </div>

          <div className="policy-section">
            <h2>Contact</h2>
            <p>
              For questions, feedback, or contributions, visit our <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-left">
          <Link href="/" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            back
          </Link>
        </div>
        <div className="status-msg">about</div>
      </div>
    </div>
  );
}