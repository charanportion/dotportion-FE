"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingCircleProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "green" | "purple" | "orange" | "gray";
  className?: string;
}

export default function LoadingCircle({
  size = "lg",
  className,
}: LoadingCircleProps = {}) {
  const sizeClasses = {
    sm: "w-56 h-56",
    md: "w-[32rem] h-[32rem]",
    lg: "w-[42rem] h-[42rem]",
    xl: "w-[50rem] h-[50rem]",
  };

  return (
    <div className="flex items-center justify-center  bg-black overflow-hidden">
      <div className="text-center space-y-4">
        <div
          className={cn(
            "rounded-full relative overflow-hidden",
            sizeClasses[size],
            className
          )}
        >
          {/* Orange segment moving behind glass - much shorter */}
          <motion.div
            className="absolute inset-0 rounded-full z-10 transform-gpu"
            style={{
              borderTop: "25px solid rgb(218,119,86,0.7)",
              borderRight: "20px solid transparent",
              borderBottom: "20px solid transparent",
              borderLeft: "20px solid transparent",
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />

          {/* Glass ring overlay on top - hollow center */}
          <div
            className="absolute inset-0 rounded-full z-20"
            style={{
              border: "30px solid rgba(255,255,255,0.05)",
              outline: "10px solid rgba(255,255,255,0.1)",
              outlineOffset: "-5px",
              backdropFilter: "blur(5px)",
              boxShadow:
                "inset 0 0 40px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.01)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
