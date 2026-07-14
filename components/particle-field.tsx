"use client";

import { useEffect, useRef } from "react";

const PARTICLE = "#ffffff";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "form" | "fall" | "rain";
  life: number;
  maxLife: number;
  size: number;
  anchorX: number;
  anchorY: number;
  trail: { x: number; y: number }[];
  kind: "outline" | "fill" | "fold";
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dimsRef = useRef({ width: 0, height: 0, dpr: 1 });
  const envRef = useRef({ cx: 0, cy: 0, w: 0, h: 0, r: 0 });
  const clockRef = useRef({ cx: 0, cy: 0, r: 0 });
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dimsRef.current = { width: rect.width, height: rect.height, dpr };
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const minDim = Math.min(rect.width, rect.height);
      const envW = Math.min(rect.width * 0.55, minDim * 0.75);
      const envH = Math.min(rect.height * 0.4, minDim * 0.5);
      envRef.current = {
        cx: rect.width * 0.5,
        cy: rect.height * 0.5,
        w: envW,
        h: envH,
        r: minDim * 0.035,
      };
      clockRef.current = {
        cx: rect.width * 0.5 + envW * 0.46,
        cy: rect.height * 0.5 - envH * 0.40,
        r: Math.min(envW, envH) * 0.14,
      };

      if (!initializedRef.current) {
        initParticles(rect.width, rect.height);
        initializedRef.current = true;
      }
    };

    const rectSDF = (x: number, y: number, cx: number, cy: number, w: number, h: number, r: number) => {
      const dx = Math.abs(x - cx) - w * 0.5 + r;
      const dy = Math.abs(y - cy) - h * 0.5 + r;
      const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
      const inside = Math.min(Math.max(dx, dy), 0);
      return outside + inside;
    };

    const envelopeGeometry = (time: number) => {
      const { cx, cy, w, h, r } = envRef.current;
      const breath = Math.sin(time * 0.0008) * 0.015;
      const W = w * (1 + breath);
      const H = h * (1 - breath * 0.6);
      const left = cx - W * 0.5;
      const right = cx + W * 0.5;
      const top = cy - H * 0.5;
      const bottom = cy + H * 0.5;
      const flapY = cy - H * 0.06;
      const foldY = cy + H * 0.08;

      return { cx, cy, W, H, left, right, top, bottom, flapY, foldY, r };
    };

    const sampleEnvelopePoint = (time: number, preferOutline: boolean): { x: number; y: number; kind: "outline" | "fill" | "fold" } | null => {
      const env = envelopeGeometry(time);
      const { cx, cy, W, H, left, right, top, bottom, flapY, foldY, r } = env;

      if (preferOutline || Math.random() < 0.45) {
        const edge = Math.random();
        if (edge < 0.45) {
          const perimeter = 2 * (W + H) - 8 * r + 2 * Math.PI * r;
          let t = Math.random() * perimeter;
          const segLens = [W - 2 * r, H - 2 * r, W - 2 * r, H - 2 * r];
          let acc = 0;
          for (let i = 0; i < 4; i++) {
            if (t <= acc + segLens[i]) {
              const local = (t - acc) / segLens[i];
              switch (i) {
                case 0: return { x: left + r + local * (W - 2 * r), y: top, kind: "outline" };
                case 1: return { x: right, y: top + r + local * (H - 2 * r), kind: "outline" };
                case 2: return { x: right - r - local * (W - 2 * r), y: bottom, kind: "outline" };
                default: return { x: left, y: bottom - r - local * (H - 2 * r), kind: "outline" };
              }
            }
            acc += segLens[i];
          }
          const angle = Math.random() * Math.PI * 2;
          const rx = Math.cos(angle) * r;
          const ry = Math.sin(angle) * r;
          return { x: cx + (rx > 0 ? rx + W * 0.5 - r : rx - W * 0.5 + r), y: cy + (ry > 0 ? ry + H * 0.5 - r : ry - H * 0.5 + r), kind: "outline" };
        } else if (edge < 0.72) {
          const t = Math.random();
          if (t < 0.5) {
            const local = t * 2;
            return { x: left + local * (cx - left), y: top + local * (flapY - top), kind: "outline" };
          } else {
            const local = (t - 0.5) * 2;
            return { x: cx + local * (right - cx), y: flapY + local * (top - flapY), kind: "outline" };
          }
        } else if (edge < 0.88) {
          const local = Math.random();
          if (local < 0.5) {
            const s = local * 2;
            return { x: cx - s * (cx - left) * 0.92, y: foldY + s * (bottom - foldY) * 0.92, kind: "fold" };
          } else {
            const s = (local - 0.5) * 2;
            return { x: cx + s * (right - cx) * 0.92, y: foldY + s * (bottom - foldY) * 0.92, kind: "fold" };
          }
        } else {
          const t = Math.random();
          if (t < 0.5) {
            const local = t * 2;
            return { x: left + local * (cx - left), y: bottom + local * (foldY - bottom), kind: "outline" };
          } else {
            const local = (t - 0.5) * 2;
            return { x: cx + local * (right - cx), y: foldY + local * (bottom - foldY), kind: "outline" };
          }
        }
      }

      for (let attempt = 0; attempt < 12; attempt++) {
        const x = rand(left + 4, right - 4);
        const y = rand(top + 4, bottom - 4);
        const sdf = rectSDF(x, y, cx, cy, W - 8, H - 8, r);
        if (sdf <= 0) return { x, y, kind: "fill" };
      }
      return null;
    };

    const clockGeometry = (time: number) => {
      const c = clockRef.current;
      const breath = Math.sin(time * 0.001 + 1) * 0.02;
      const r = c.r * (1 + breath);
      return { cx: c.cx, cy: c.cy, r };
    };

    const sampleClockPoint = (time: number, preferOutline: boolean): { x: number; y: number; kind: "outline" | "fill" | "fold" } | null => {
      const c = clockGeometry(time);
      const { cx, cy, r } = c;

      if (preferOutline || Math.random() < 0.65) {
        const part = Math.random();
        if (part < 0.55) {
          // Circle rim
          const angle = Math.random() * Math.PI * 2;
          return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, kind: "outline" };
        } else if (part < 0.78) {
          // Hour ticks
          const tick = Math.floor(Math.random() * 12);
          const angle = (tick / 12) * Math.PI * 2 - Math.PI * 0.5;
          const innerR = r * 0.78;
          const outerR = r * 0.92;
          const local = Math.random();
          return {
            x: cx + Math.cos(angle) * lerp(innerR, outerR, local),
            y: cy + Math.sin(angle) * lerp(innerR, outerR, local),
            kind: "outline",
          };
        } else if (part < 0.89) {
          // Hour hand
          const angle = -Math.PI * 0.5 + Math.sin(time * 0.0003) * 0.4;
          const local = Math.random();
          const len = r * 0.5;
          return { x: cx + Math.cos(angle) * len * local, y: cy + Math.sin(angle) * len * local, kind: "fold" };
        } else {
          // Minute hand
          const angle = -Math.PI * 0.5 + Math.cos(time * 0.0005) * 0.9;
          const local = Math.random();
          const len = r * 0.72;
          return { x: cx + Math.cos(angle) * len * local, y: cy + Math.sin(angle) * len * local, kind: "fold" };
        }
      }

      // Inner fill
      for (let attempt = 0; attempt < 10; attempt++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * r * 0.7;
        return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, kind: "fill" };
      }
      return null;
    };

    const initParticles = (width: number, height: number) => {
      const area = width * height;
      const count = Math.min(7000, Math.max(2600, Math.floor(area / 360)));
      const particles: Particle[] = [];
      const time = performance.now();

      const envCount = Math.floor(count * 0.62);
      for (let i = 0; i < envCount; i++) {
        const preferOutline = i < envCount * 0.4;
        const pt = sampleEnvelopePoint(time, preferOutline);
        if (!pt) continue;
        particles.push(makeParticle(pt));
      }

      const clockCount = Math.floor(count * 0.22);
      for (let i = 0; i < clockCount; i++) {
        const preferOutline = i < clockCount * 0.72;
        const pt = sampleClockPoint(time, preferOutline);
        if (!pt) continue;
        particles.push(makeParticle(pt));
      }

      const rainCount = count - particles.length;
      for (let i = 0; i < rainCount; i++) {
        particles.push({
          x: rand(0, width),
          y: rand(-height, 0),
          vx: rand(-0.3, 0.3),
          vy: rand(2.5, 6),
          state: "rain",
          life: rand(40, 120),
          maxLife: 120,
          size: rand(0.3, 0.8),
          anchorX: 0,
          anchorY: 0,
          trail: [],
          kind: "fill",
        });
      }

      particlesRef.current = particles;
    };

    const makeParticle = (pt: { x: number; y: number; kind: "outline" | "fill" | "fold" }): Particle => ({
      x: pt.x + rand(-1.2, 1.2),
      y: pt.y + rand(-1.2, 1.2),
      vx: 0,
      vy: 0,
      state: "form",
      life: rand(80, 320),
      maxLife: 320,
      size: pt.kind === "outline" ? rand(0.7, 1.5) : pt.kind === "fold" ? rand(0.6, 1.2) : rand(0.35, 0.9),
      anchorX: pt.x,
      anchorY: pt.y,
      trail: [],
      kind: pt.kind,
    });

    const respawnForm = (p: Particle, time: number, width: number, height: number) => {
      const isClock = Math.random() < 0.28;
      const pt = isClock
        ? sampleClockPoint(time, Math.random() < 0.65)
        : sampleEnvelopePoint(time, Math.random() < 0.35);
      if (pt) {
        Object.assign(p, makeParticle(pt));
      } else {
        p.state = "rain";
        p.x = rand(0, width);
        p.y = rand(-50, -10);
        p.vy = rand(2.5, 6);
        p.life = rand(40, 120);
      }
    };

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    resize();

    let isVisible = !document.hidden;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    let lastTime = performance.now();

    const render = (time: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!isVisible) {
        lastTime = time;
        return;
      }

      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      const { width, height } = dimsRef.current;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;

      // Subtle icon breathing
      envRef.current.cx = width * 0.5 + Math.sin(time * 0.00035) * width * 0.008;
      envRef.current.cy = height * 0.5 + Math.cos(time * 0.0004) * height * 0.008;
      const env = envelopeGeometry(time);
      clockRef.current.cx = env.cx + env.W * 0.42;
      clockRef.current.cy = env.cy - env.H * 0.42;

      // Trails
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.trail.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let t = 1; t < p.trail.length; t++) {
          ctx.lineTo(p.trail[t].x, p.trail[t].y);
        }
        const alpha = 0.05 + 0.12 * (p.life / p.maxLife);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life -= dt;

        if (p.state === "form") {
          const jitter = p.kind === "outline" ? 0.04 : 0.06;
          p.vx += rand(-jitter, jitter) * dt;
          p.vy += rand(-jitter, jitter) * dt;
          p.vx *= 0.88;
          p.vy *= 0.88;

          const pull = p.kind === "outline" ? 0.018 : p.kind === "fold" ? 0.015 : 0.006;
          p.vx += (p.anchorX - p.x) * pull * dt;
          p.vy += (p.anchorY - p.y) * pull * dt;

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          const detachChance = p.kind === "outline" ? 0.014 : p.kind === "fold" ? 0.01 : 0.0018;
          if (p.life <= 0 || Math.random() < detachChance * dt) {
            p.state = "fall";
            p.vx = rand(-1.2, 1.2);
            p.vy = rand(0.4, 2);
            p.life = rand(35, 110);
            p.maxLife = p.life;
            p.trail = [{ x: p.x, y: p.y }];
          }
        } else if (p.state === "fall") {
          p.vy += 0.16 * dt;
          p.vx += rand(-0.06, 0.06) * dt;
          p.vx *= 0.98;
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          p.trail.unshift({ x: p.x, y: p.y });
          if (p.trail.length > 10) p.trail.pop();

          if (p.life <= 0 || p.y > height + 20) {
            respawnForm(p, time, width, height);
          }
        } else if (p.state === "rain") {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.life <= 0 || p.y > height + 20) {
            p.x = rand(0, width);
            p.y = rand(-60, -10);
            p.vx = rand(-0.3, 0.3);
            p.vy = rand(2.5, 6);
            p.life = rand(40, 120);
            p.maxLife = p.life;
          }
        }

        const alpha = p.state === "form" ? 0.5 + 0.5 * (p.life / p.maxLife) : 0.25 + 0.45 * (p.life / p.maxLife);
        ctx.fillStyle = PARTICLE;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    rafRef.current = requestAnimationFrame(render);

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-field"
      aria-hidden="true"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
