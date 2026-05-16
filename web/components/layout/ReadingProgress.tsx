"use client";

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const scrolled = root.scrollTop;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[100] h-[2px] w-full">
      <div
        className="h-full bg-[color:var(--color-historical)] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
