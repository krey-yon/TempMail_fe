import { useId, type SVGProps } from "react";
import { cn } from "@/lib/utils";

export function Postmark({ className, ...props }: SVGProps<SVGSVGElement>) {
  const ring = useId();
  return (
    <svg {...props} viewBox="0 0 220 120" className={cn("font-mono", className)} aria-hidden>
      <defs>
        <path id={ring} d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="60" cy="60" r="55" />
        <circle cx="60" cy="60" r="33" />
        {[34, 48, 62, 76].map((y) => (
          <path key={y} d={`M122 ${y} q 12 -7 24 0 t 24 0 t 24 0 t 24 0`} strokeLinecap="round" />
        ))}
      </g>
      <text fill="currentColor" fontSize="10.5" letterSpacing="2.6">
        <textPath href={`#${ring}`}>XELIO.ME · POSTE RESTANTE · HELD ·</textPath>
      </text>
      <text x="60" y="57" textAnchor="middle" fill="currentColor" fontSize="12" letterSpacing="1.5">
        HELD
      </text>
      <text x="60" y="72" textAnchor="middle" fill="currentColor" fontSize="9" letterSpacing="1.5">
        FOR YOU
      </text>
    </svg>
  );
}
