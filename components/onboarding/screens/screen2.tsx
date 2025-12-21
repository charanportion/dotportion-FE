"use client";

import { RootState, AppDispatch } from "@/lib/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { profileSchema } from "../validationSchemas";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { setAnswer, submitAnswer } from "@/lib/redux/slices/profileSlice";

const occupation = ["Developer", "Manager", "Designer", "Other"];

export default function Screen2() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const answers = useSelector((state: RootState) => state.profile.answers);
  const status = useSelector((state: RootState) => state.profile.status);
  const errorMessage = useSelector((state: RootState) => state.profile.error);

  const [localError, setLocalError] = useState("");

  const handleContinue = async () => {
    setLocalError("");

    try {
      // Validate occupation
      profileSchema
        .pick({ occupation: true })
        .parse({ occupation: answers.occupation });

      // Submit using cookie-based auth
      await dispatch(submitAnswer(answers)).unwrap();
      router.push("/onboarding?step=3");
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
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-foreground mb-10 text-center">
        What is your occupation?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
        {occupation.map((role) => (
          <div
            key={role}
            className={`flex items-center text-sm sm:text-base text-foreground border rounded-md pl-4 pr-32 py-3 gap-2 w-full cursor-pointer transition ${
              answers.occupation === role
                ? "border-border bg-muted"
                : "border-border hover:bg-muted"
            }`}
            onClick={() =>
              dispatch(setAnswer({ key: "occupation", value: role }))
            }
          >
            <Checkbox
              className="w-6 h-6 border-border"
              checked={answers.occupation === role}
            />
            <Label>{role}</Label>
          </div>
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
        <span className="h-2 w-2 rounded-md bg-primary"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
        <span className="h-2 w-4 rounded-md bg-muted-foreground"></span>
      </div>
    </div>
  );
}
