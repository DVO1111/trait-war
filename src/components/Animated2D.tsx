import React from "react";
import { Coins } from "lucide-react";
import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

interface Animated2DProps {
  lottieJson?: object; // Pass imported JSON for Lottie
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Animated2D
 * - Uses Lottie when lottieJson is provided
 * - Falls back to an animated Lucide icon (Coins) with subtle motion
 */
const Animated2D: React.FC<Animated2DProps> = ({
  lottieJson,
  width = 160,
  height = 160,
  loop = true,
  autoplay = true,
  ariaLabel = "2D animation",
  className,
}) => {
  if (lottieJson) {
    return (
      <Lottie
        animationData={lottieJson}
        loop={loop}
        autoplay={autoplay}
        aria-label={ariaLabel}
        style={{ width, height }}
        className={cn("", className)}
      />
    );
  }

  // Fallback animated icon
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "shadow-sm",
        "animate-fade-in hover-scale",
        className
      )}
      style={{ width, height }}
      role="img"
    >
      <Coins className="w-3/4 h-3/4 text-primary" />
    </div>
  );
};

export default Animated2D;
