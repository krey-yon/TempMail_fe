"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function PrivacyPage() {
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
          <h1 className="page-title">Privacy Policy</h1>
          <p className="page-date">Last updated: April 2026</p>

          <div className="policy-section">
            <h2>Data Collection</h2>
            <p>
              Xelio is designed with privacy as its core principle. We collect minimal information necessary to provide the temporary email service.
            </p>
          </div>

          <div className="policy-section">
            <h2>Temporary Email Addresses</h2>
            <p>
              When you create a temporary email address, we store only the address itself. Email content is held temporarily on our servers and is automatically deleted when your session ends or after a set period of inactivity.
            </p>
          </div>

          <div className="policy-section">
            <h2>Cookies & Local Storage</h2>
            <p>
              We use local storage to remember your theme preference and maintain your active session. No tracking cookies or third-party analytics are used.
            </p>
          </div>

          <div className="policy-section">
            <h2>Data Retention</h2>
            <p>
              All temporary email data, including messages and addresses, is automatically purged after your session expires. We do not retain, sell, or share any personal information.
            </p>
          </div>

          <div className="policy-section">
            <h2>Third-Party Services</h2>
            <p>
              We do not share any data with third parties. All email processing occurs entirely within our own infrastructure.
            </p>
          </div>

          <div className="policy-section">
            <h2>Security</h2>
            <p>
              While no service can guarantee 100% security, we employ standard measures to protect our infrastructure. However, since emails are intentionally temporary and public, we recommend not using Xelio for sensitive communications.
            </p>
          </div>

          <div className="policy-section">
            <h2>Children&apos;s Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect information from minors.
            </p>
          </div>

          <div className="policy-section">
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy periodically. Any changes will be posted on this page with an updated revision date.
            </p>
          </div>

          <div className="policy-section">
            <h2>Contact</h2>
            <p>
              For questions regarding this privacy policy, please contact us through our <a href="https://github.com/krey-yon/TempMail_fe" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
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
        <div className="status-msg">privacy policy</div>
      </div>
    </div>
  );
}