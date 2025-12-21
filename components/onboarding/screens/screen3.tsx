"use client";

import { RootState, AppDispatch } from "@/lib/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { profileSchema } from "../validationSchemas";
import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { setAnswer, submitAnswer } from "@/lib/redux/slices/profileSlice";

const tools = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React.js",
  "Angular",
  "Vue.js",
  "Svelte",
  "Next.js",
  "Nuxt.js",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Styled Components",
  "Vite",
  "Webpack",
  "Babel",
  "ESLint / Prettier",
  "Jest",
  "React Testing Library",
  "Cypress",
  "No code development",
  "Vibecoding",
  "Playwright",
];

export default function Screen3() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const answers = useSelector((state: RootState) => state.profile.answers);
  const status = useSelector((state: RootState) => state.profile.status);
  const errorMessage = useSelector((state: RootState) => state.profile.error);

  const [localError, setLocalError] = useState("");

  const toggleTool = (tool: string) => {
    const prev = answers.tools || [];
    const newTools = prev.includes(tool)
      ? prev.filter((t) => t !== tool)
      : [...prev, tool];
    dispatch(setAnswer({ key: "tools", value: newTools }));
  };

  const handleContinue = async () => {
    setLocalError("");

    try {
      // Validate tools
      profileSchema.pick({ tools: true }).parse({ tools: answers.tools });

      // Submit using cookie-based auth
      await dispatch(submitAnswer(answers)).unwrap();
      router.push("/onboarding?step=4");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setLocalError(err.errors[0].message);
      } else if (typeof err === "string") {
        setLocalError(err);
      } else {
        setLocalError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-10 text-center">
        Which technologies, or tools you use to build backend?
      </h2>

      {/* Tools */}
      <div className="flex flex-wrap gap-3 justify-center max-w-4xl mb-10">
        {tools.map((tool) => (
          <Button
            key={tool}
            onClick={() => toggleTool(tool)}
            className={`px-3 sm:px-4 py-2 text-sm rounded-full border whitespace-nowrap hover:bg-muted text-foreground transition ${
              answers.tools?.includes(tool)
                ? "bg-primary text-primary-foreground border-border"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {tool}
          </Button>
        ))}
      </div>

      {(localError || errorMessage) && (
        <p className="text-red-500 mb-4">{localError || errorMessage}</p>
      )}

      {/* Continue button */}
      <Button
        className="text-sm font-normal px-5 h-8 rounded-md mt-4"
        onClick={handleContinue}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Saving..." : "Continue"}
      </Button>

      {/* Step Indicator */}
      <div className="flex space-x-1 mt-10 sm:mt-14 justify-center">
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
        <span className="h-2 w-2 rounded-md bg-primary"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
      </div>
    </div>
  );
}
