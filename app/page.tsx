"use client";

import RocketBlast from "@/components/ascii/rocket-blast";
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

export default function Home() {
  const [currentAddr, setCurrentAddr] = useState("");
  const [mails, setMails] = useState<Mail[]>([]);
  const [activeMailId, setActiveMailId] = useState<number | null>(null);
  const [status, setStatus] = useState("ready");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApiUp, setIsApiUp] = useState(true);
  const [hasEnteredUsername, setHasEnteredUsername] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
  }, []);

  const loadEmails = useCallback(async () => {
    if (!currentAddr) return;
    try {
      const emails = await fetchEmails(currentAddr);
      setMails((prev) => {
        const prevIds = new Set(prev.map((m) => m.id));
        const newEmails = emails.map((e) => ({
          ...e,
          unread: !prevIds.has(e.id),
        }));
        return newEmails;
      });
      setIsApiUp(true);
    } catch {
      setIsApiUp(false);
    }
  }, [currentAddr]);

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
      } catch (err: any) {
        const errorMsg = err?.message || "";
        if (errorMsg.includes("already exists")) {
          addToast("Username is already taken", "error");
        } else if (errorMsg.includes("3-32 characters")) {
          addToast("Username must be 3-32 characters", "error");
        } else if (errorMsg.includes("alphanumeric")) {
          addToast(
            "Only letters, numbers, hyphens, and underscores allowed",
            "error",
          );
        } else {
          addToast("Failed to create address", "error");
        }
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
      setCurrentAddr("");
      localStorage.removeItem("xelio_addr");
      setMails([]);
      setActiveMailId(null);
      setHasEnteredUsername(false);
      setInputUsername("");
      setStatus("address deleted");
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    } catch {
      setStatus("failed to delete address");
    }
  }, [currentAddr]);

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
      document.title = "XELIO · offline";
    } else if (mails.length > 0) {
      if (unread > 0) {
        document.title = `XELIO · ${unread} new`;
      } else {
        document.title = `XELIO · ${mails.length}`;
      }
    } else if (currentAddr) {
      document.title = "XELIO · waiting";
    } else {
      document.title = "XELIO";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mails.length, isApiUp, currentAddr]);

  useEffect(() => {
    if (!currentAddr || isGenerating) return;

    loadEmails();
    setStatus("checking for messages");

    pollIntervalRef.current = setInterval(() => {
      loadEmails();
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [currentAddr, isGenerating, loadEmails]);

  useEffect(() => {
    const checkApi = async () => {
      const up = await checkHealth();
      setIsApiUp(up);
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
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

  // Landing Screen
  if (!hasEnteredUsername) {
    return (
      <div className="app">
        {renderToasts()}
        <div className="stipple-bg" />
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
            XELIO
          </div>
        </div>

        <div className="landing">
          <div className="landing-content">
            <h1 className="landing-title">Temporary email</h1>
            <p className="landing-subtitle">
              Receive emails instantly. No registration required.
            </p>

            <form onSubmit={handleUsernameSubmit} className="landing-form">
              <div className="input-group">
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => {
                    setInputUsername(e.target.value);
                  }}
                  placeholder="enter username"
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
                  "Get Started"
                )}
              </button>
            </form>

            <div className="landing-hint">
              <span>
                3-32 characters · letters, numbers, hyphens, underscores
              </span>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="status-left">
            <div className={`status-dot ${isApiUp ? "" : "offline"}`} />
            <span>{isApiUp ? "api ready" : "api offline"}</span>
          </div>
          <div className="status-msg">{status}</div>
        </div>
      </div>
    );
  }

  // Email Dashboard
  return (
    <div className="app">
      {renderToasts()}
      <div className="stipple-bg" />
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
          XELIO
        </div>
        <div className="header-right">
          <span>{mails.length} messages</span>
          <span style={{ color: "rgba(232,228,218,0.2)" }}>|</span>
          <span>{currentAddr ? currentAddr.split("@")[1] : "xelio.me"}</span>
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
            <div className="addr-actions">
              <button
                className="btn-ghost"
                onClick={copyAddr}
                disabled={!currentAddr}
              >
                copy
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  loadEmails();
                  addToast("Refreshed inbox", "success");
                }}
                disabled={!currentAddr || isGenerating}
              >
                refresh
              </button>
              <button
                className="btn-ghost"
                onClick={removeAddr}
                disabled={!currentAddr}
              >
                delete
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
                {activeMail.body.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
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
          <div className={`status-dot ${isApiUp ? "" : "offline"}`} />
          <span>live · auto-refresh</span>
        </div>
        <div className="status-msg">{status}</div>
      </div>
    </div>
  );
}
