"use client";

import { useEffect, useState } from "react";

interface LoadingSkeletonProps {
  className?: string;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({
  className = "",
  height = "h-6",
  width = "w-full",
}: LoadingSkeletonProps) {
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    // Add shimmer effect after a short delay
    const timer = setTimeout(() => {
      setShimmer(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`${height} ${width} rounded-md bg-muted/30 relative overflow-hidden ${className}`}
    >
      {shimmer && <div className="absolute inset-0 animate-shimmer" />}
    </div>
  );
}
