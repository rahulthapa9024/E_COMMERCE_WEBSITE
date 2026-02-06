import React from "react";

/* ---------------- TYPES ---------------- */
type SpinnerSize = "sm" | "md" | "lg" | "xl";
type SpinnerColor = "white" | "zinc" | "black" | "gradient";

type ShimmerSpinnerProps = {
  size?: SpinnerSize;
  color?: SpinnerColor;
  center?: boolean;
  className?: string;
  imageScale?: number;
};

/* ---------------- COMPONENT ---------------- */
const ShimmerSpinner: React.FC<ShimmerSpinnerProps> = ({
  size = "md",
  color = "white",
  center = true,
  className = "",
  imageScale = 2.5,
}) => {
  /* ---------------- SIZE MAP ---------------- */
  const baseSize: Record<SpinnerSize, number> = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  /* ---------------- COLOR CLASSES ---------------- */
  const colorClasses: Record<SpinnerColor, string> = {
    white: "border-white border-t-transparent",
    zinc: "border-zinc-700 border-t-transparent",
    black: "border-black border-t-zinc-800",
    gradient: "border-transparent animate-gradient-spin",
  };

  /* ---------------- SVG FILL COLORS ---------------- */
  const svgFillColors: Record<SpinnerColor, string> = {
    white: "#ffffff",
    zinc: "#3f3f46",
    black: "#000000",
    gradient: "#ffffff",
  };

  /* ---------------- CALCULATIONS ---------------- */
  const spinnerSize = baseSize[size] * imageScale;
  const borderWidth = Math.max(3, imageScale * 2);
  const svgFillColor = svgFillColors[color];

  /* ---------------- GRADIENT STYLE ---------------- */
  const gradientStyle =
    color === "gradient"
      ? {
          background:
            "conic-gradient(transparent, #ffffff, #3f3f46, transparent)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0)",
        }
      : {};

  return (
    <>
      {/* ---------------- INLINE CSS ---------------- */}
      <style>
        {`
          @keyframes gradient-spin {
            to {
              transform: rotate(1turn);
            }
          }
          .animate-gradient-spin {
            animation: gradient-spin 1s linear infinite;
          }
        `}
      </style>

      <div
        className={`${center ? "min-h-screen flex items-center justify-center bg-black" : ""} ${className}`}
      >
        <div className="relative">
          {/* Spinner Ring */}
          <div
            className={`rounded-full animate-spin ${colorClasses[color]}`}
            style={{
              ...gradientStyle,
              width: `${spinnerSize}px`,
              height: `${spinnerSize}px`,
              borderWidth: `${borderWidth}px`,
            }}
          />

          {/* Dumbbell Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width={120}
              height={60}
              viewBox="0 0 120 60"
              aria-hidden="true"
              focusable="false"
            >
              <rect width="120" height="60" fill="transparent" />
              <rect x="16" y="20" width="2" height="20" rx="1" fill={svgFillColor} />
              <rect x="20" y="18" width="4" height="24" rx="1" fill={svgFillColor} />
              <rect x="26" y="15" width="6" height="30" rx="2" fill={svgFillColor} />
              <rect x="34" y="12" width="8" height="36" rx="2" fill={svgFillColor} />
              <rect x="44" y="25" width="32" height="10" rx="2" fill={svgFillColor} />
              <rect x="78" y="12" width="8" height="36" rx="2" fill={svgFillColor} />
              <rect x="88" y="15" width="6" height="30" rx="2" fill={svgFillColor} />
              <rect x="96" y="18" width="4" height="24" rx="1" fill={svgFillColor} />
              <rect x="102" y="20" width="2" height="20" rx="1" fill={svgFillColor} />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShimmerSpinner;
