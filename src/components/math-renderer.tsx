"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ✅ 1. Dynamic Import for React Latex (No SSR)
const Latex = dynamic(() => import("react-latex-next"), { 
  ssr: false,
  loading: () => <span className="opacity-50 text-sm">Loading Math...</span>
});

export const MathRenderer = React.memo(function MathRenderer({ text }: { text: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // ✅ 2. Lazy Load CSS (Fixes "Preloaded but not used" warning)
    import("katex/dist/katex.min.css");
    setIsMounted(true);
  }, []);

  if (!text) return null;

  // Prevent hydration mismatch by rendering only after mount
  if (!isMounted) return <span className="font-mono text-sm">{text}</span>;

  return (
    <span className="math-content">
      <Latex>{text}</Latex>
    </span>
  );
});