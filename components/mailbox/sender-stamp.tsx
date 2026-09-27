import { senderLabel, type Sender } from "@/lib/mail";
import { cn } from "@/lib/utils";

const INKS = ["#d9482b", "#2d4fb8", "#1f7a5a", "#b8862a", "#7a3fa0", "#2f7f95", "#a8344f", "#4d6b2a"];

function inkFor(address: string): string {
  const domain = address.split("@")[1] ?? address;
  let hash = 0;
  for (const ch of domain) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return INKS[Math.abs(hash) % INKS.length];
}

export function SenderStamp({ sender, className }: { sender: Sender; className?: string }) {
  return (
    <span aria-hidden className={cn("perforated inline-block shrink-0 bg-paper", className)}>
      <span
        className="grid size-full place-items-center font-display text-[1.15em] leading-none text-white italic"
        style={{ backgroundColor: inkFor(sender.address) }}
      >
        {senderLabel(sender).charAt(0).toUpperCase()}
      </span>
    </span>
  );
}
