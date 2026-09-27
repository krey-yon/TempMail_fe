export const DOMAIN = "xelio.me";

export function usernameProblem(username: string): string | null {
  if (username.length === 0) return null;
  if (!/^[a-z0-9_-]+$/.test(username)) return "Use a–z, 0–9, hyphen or underscore";
  if (username.length < 3) return "At least 3 characters";
  if (username.length > 32) return "At most 32 characters";
  return null;
}

const ADJECTIVES = ["quiet", "amber", "paper", "brisk", "lunar", "velvet", "rustic", "stray", "tidal", "ember", "hollow", "sable"];
const NOUNS = ["otter", "heron", "parcel", "comet", "lantern", "sparrow", "harbor", "quill", "fox", "atlas", "moth", "pilot"];

export function randomUsername(): string {
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${Math.floor(10 + Math.random() * 90)}`;
}
