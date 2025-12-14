"use client";

import { RootState, AppDispatch } from "@/lib/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { profileSchema } from "../validationSchemas";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { setAnswer, submitAnswer } from "@/lib/redux/slices/profileSlice";

const levels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "No experience", value: "no_experience" },
];

export default function Screen4() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const answers = useSelector((state: RootState) => state.profile.answers);
  const status = useSelector((state: RootState) => state.profile.status);
  const errorMessage = useSelector((state: RootState) => state.profile.error);

  const [localError, setLocalError] = useState("");

  const handleContinue = async () => {
    setLocalError("");

    try {
      // Validate experience level
      profileSchema
        .pick({ experience_level: true })
        .parse({ experience_level: answers.experience_level });

      // Submit using cookie-based auth
      await dispatch(submitAnswer(answers)).unwrap();
      router.push("/onboarding?step=5");
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
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-10 text-center">
        Your API experience level
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
        {levels.map((level) => (
          <div
            key={level.value}
            className={`flex items-center text-sm sm:text-base text-gray-700 border rounded-md pl-4 pr-32 py-3 gap-2 w-full cursor-pointer transition ${
              answers.experience_level === level.value
                ? "border-black bg-gray-100"
                : "border-gray-400 hover:border-black"
            }`}
            onClick={() => {
              dispatch(
                setAnswer({ key: "experience_level", value: level.value })
              );
            }}
          >
            <Checkbox
              className="w-5 h-5 border-gray-400"
              checked={answers.experience_level === level.value}
            />
            <Label>{level.label}</Label>
          </div>
        ))}
      </div>

      {(localError || errorMessage) && (
        <p className="text-red-500 mb-4">{localError || errorMessage}</p>
      )}

      {/* Continue button */}
      <Button
        className="bg-[#222] hover:bg-white hover:border border-black hover:text-black text-white text-sm sm:text-base font-normal px-4 h-11 rounded-md mt-6"
        onClick={handleContinue}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Saving..." : "Continue"}
      </Button>

      {/* Step Indicator */}
      <div className="flex space-x-1 mt-10 sm:mt-14 justify-center">
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-2 rounded-md bg-black"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
      </div>
    </div>
  );
}
