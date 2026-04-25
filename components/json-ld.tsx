"use client";

import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    script.id = "json-ld-structured-data";
    document.head.appendChild(script);
    return () => {
      const existing = document.getElementById("json-ld-structured-data");
      if (existing) existing.remove();
    };
  }, [data]);

  return null;
}