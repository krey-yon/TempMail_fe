import { useId } from "react";
import { Postmark } from "@/components/postmark";
import { DOMAIN } from "@/lib/username";
import { cn } from "@/lib/utils";

export function Envelope({ username, className }: { username: string; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 640 420" data-addressed={username ? "true" : undefined} className={cn("envelope-art mx-auto w-full overflow-visible", className)} aria-hidden="true">
      <defs>
        <pattern id={`${id}-airmail`} width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="12" height="48" fill="var(--stamp)" />
          <rect x="24" width="12" height="48" fill="var(--air)" />
        </pattern>
        <clipPath id={`${id}-body`}><rect x="24" y="92" width="584" height="300" rx="8" /></clipPath>
        <filter id={`${id}-ink`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -9" />
        </filter>
      </defs>
      <rect x="38" y="85" width="580" height="300" rx="8" fill="var(--raised)" stroke="var(--line)" transform="rotate(4 328 235)" />
      <g transform="rotate(-2 320 240)">
        <path className="envelope-flap" d="M24 100 Q24 92 32 92 L600 92 Q608 92 608 100 L316 245 Z" fill="var(--paper)" stroke="var(--line)" />
        <g className="envelope-letter">
          <rect x="65" y="104" width="500" height="240" rx="6" fill="var(--sheet)" stroke="var(--line)" />
          <path d="M100 132 H320 M100 150 H455 M100 168 H400" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" />
          <text x="485" y="162" fill="var(--stamp)" fontSize="36" fontFamily="var(--font-display)" fontStyle="italic">X</text>
        </g>
        <g data-morph-src="addr-card">
          <rect x="24" y="92" width="584" height="300" rx="8" fill="var(--paper)" />
          <g clipPath={`url(#${id}-body)`}>
            <rect x="24" y="92" width="584" height="12" fill={`url(#${id}-airmail)`} />
            <rect x="24" y="380" width="584" height="12" fill={`url(#${id}-airmail)`} />
            <path d="M24 108 L316 240 L608 108 M24 380 L235 260 M608 380 L395 260" fill="none" stroke="var(--paper-ink)" strokeOpacity="0.09" strokeWidth="1.5" />
          </g>
          <rect x="55" y="127" width="100" height="34" rx="3" fill="none" stroke="var(--air)" strokeWidth="1.5" />
          <text x="105" y="149" textAnchor="middle" fill="var(--air)" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="2">PAR AVION</text>
          <g transform="translate(510 170)">
            <g filter={`url(#${id}-ink)`} fill="var(--stamp)">
              <path className="ink-seal" d="M0 -40 C22 -40 40 -22 40 0 C40 22 22 40 0 40 C-22 40 -40 22 -40 0 C-40 -22 -22 -40 0 -40 Z" />
              <circle className="ink-drop ink-drop-one" cx="30" cy="-27" r="7" />
              <circle className="ink-drop ink-drop-two" cx="-29" cy="26" r="5" />
            </g>
            <circle r="29" fill="none" stroke="var(--stamp-ink)" strokeOpacity="0.25" />
            <text y="12" textAnchor="middle" fill="var(--stamp-ink)" fontFamily="var(--font-display)" fontSize="42" fontStyle="italic">X</text>
          </g>
          <Postmark x={283} y={119} width={235} height={128} className="envelope-postmark text-stamp opacity-70 mix-blend-multiply" />
          <text x="82" y="292" fill="var(--paper-ink)" fillOpacity="0.5" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2.5">DELIVER TO</text>
          <text data-morph-src="addr-text" x="82" y="330" fill="var(--paper-ink)" fontFamily="var(--font-mono)" fontSize={username.length > 16 ? 17 : 25}>
            {username || "you"}<tspan fillOpacity="0.45">@{DOMAIN}</tspan>
          </text>
          <path d="M82 344 H550" stroke="var(--paper-ink)" strokeOpacity="0.15" />
          <text x="82" y="365" fill="var(--paper-ink)" fillOpacity="0.55" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">24 HOURS. THEN A CLEAN SLATE.</text>
        </g>
      </g>
    </svg>
  );
}
