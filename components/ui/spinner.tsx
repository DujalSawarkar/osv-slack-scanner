import React from "react";

export function Spinner({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`animate-spin text-foreground ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
      />
    </svg>
  );
}
