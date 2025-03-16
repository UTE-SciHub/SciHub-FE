import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  className,
  size = "md",
  showText = true,
}) => {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <div className="relative">
        {/* Main logo container with glow effect */}
        <div
          className={cn(
            "relative rounded-full",
            sizes[size],
            "animate-pulse-subtle"
          )}
        >
          {/* Logo image */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UTE-tY5ieaDp5iLnU1DAtL5UkdpwdSuBJO.png"
            alt="UTE Logo"
            className={cn("w-full h-full object-contain relative z-10")}
          />

          {/* Rotating atom overlay */}
          <div className="absolute inset-0 z-20">
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8">
              <div className="atom-orbit" />
              <div className="atom-orbit rotate-60" />
              <div className="atom-orbit -rotate-60" />
            </div>
          </div>

          {/* Circular progress */}
          <svg
            className="absolute inset-0 z-0 animate-spin-slow"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-blue-200 stroke-current"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              r="46"
              cx="50"
              cy="50"
            />
            <circle
              className="text-blue-500 stroke-current"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              r="46"
              cx="50"
              cy="50"
              strokeDasharray="289"
              strokeDashoffset="289"
              style={{
                animation: "progress 2s ease-out infinite",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Loading text */}
      {showText && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-semibold text-blue-600">UTE-SciHub</p>
          <p className="text-sm text-gray-500 animate-pulse">Đang tải...</p>
        </div>
      )}
    </div>
  );
};

export default Loading;
