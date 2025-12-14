import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientTextProps {
  children: string | ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to bottom, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
    backgroundSize: "300% 100%",
  };

  // Convert children to string for splitting
  const text =
    typeof children === "string"
      ? children
      : React.Children.map(children, (child) =>
          typeof child === "string" ? child : ""
        )?.join(" ") || "";

  const words = text.split(" ");

  return (
    <div
      className={`relative mx-auto font-bold flex max-w-fit flex-row items-center justify-center backdrop-blur transition-shadow duration-500 cursor-pointer overflow-visible py-2 ${className}`}
    >
      {showBorder && (
        <div
          className="absolute inset-0 bg-cover z-0 pointer-events-none animate-gradient"
          style={{
            ...gradientStyle,
          }}
        >
          <div
            className="absolute inset-0 bg-black  z-[-1]"
            style={{
              width: "calc(100% - 2px)",
              height: "calc(100% - 2px)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        </div>
      )}
      <span className="relative z-2">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0, y: -50 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              delay: i * 0.13,
            }}
            style={gradientStyle}
            className="mr-2 inline-block align-middle"
          >
            {word}
          </motion.span>
        ))}
      </span>
    </div>
  );
}

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         gradient: {
//           '0%': { backgroundPosition: '0% 50%' },
//           '50%': { backgroundPosition: '100% 50%' },
//           '100%': { backgroundPosition: '0% 50%' },
//         },
//       },
//       animation: {
//         gradient: 'gradient 8s linear infinite'
//       },
//     },
//   },
//   plugins: [],
// };
