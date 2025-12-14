"use client";

import { RootState, AppDispatch } from "@/lib/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { profileSchema } from "../validationSchemas";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { setAnswer, submitAnswer } from "@/lib/redux/slices/profileSlice";
import { useAppSelector } from "@/lib/redux/hooks";

export default function Screen1() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const answers = useSelector((state: RootState) => state.profile.answers);
  const status = useSelector((state: RootState) => state.profile.status);
  const errorMessage = useSelector((state: RootState) => state.profile.error);

  const [localError, setLocalError] = useState("");
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.full_name && !answers.name) {
      dispatch(setAnswer({ key: "name", value: user.full_name }));
    }
  }, [user, answers.name, dispatch]);

  const handleContinue = async () => {
    setLocalError("");

    try {
      // Validate the current step's fields
      profileSchema.pick({ name: true, contact_number: true }).parse({
        name: answers.name,
        contact_number: answers.contact_number,
      });

      // Submit using cookie-based auth (no token needed)
      await dispatch(submitAnswer(answers)).unwrap();
      router.push("/onboarding?step=2");
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
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-center">
        Profile Details
      </h2>
      <p className="text-sm text-gray-500 mb-16 text-center">
        Please let us know what we should address you as!
      </p>

      {/* User name */}
      <div className="flex flex-col space-y-1 w-full max-w-2xl mb-4">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Name..."
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          value={answers.name || ""}
          onChange={(e) => {
            dispatch(setAnswer({ key: "name", value: e.target.value }));
          }}
        />
      </div>

      {/* Contact Number */}
      <div className="flex flex-col space-y-1 w-full max-w-2xl mb-10">
        <Label htmlFor="phoneNo" className="text-sm font-medium text-gray-700">
          Contact Number
        </Label>
        <Input
          id="phoneNo"
          type="tel"
          placeholder="(91) 123-456-7890"
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          value={answers.contact_number || ""}
          onChange={(e) =>
            dispatch(
              setAnswer({ key: "contact_number", value: e.target.value })
            )
          }
        />
      </div>

      {(localError || errorMessage) && (
        <p className="text-red-500 mb-4">{localError || errorMessage}</p>
      )}

      {/* Continue button */}
      <Button
        className="bg-[#222] hover:bg-white hover:border border-black hover:text-black text-white text-sm sm:text-base font-normal px-5 h-11 rounded-md mt-4"
        onClick={handleContinue}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Saving..." : "Continue"}
      </Button>

      {/* Step Indicator */}
      <div className="flex space-x-1 mt-10 sm:mt-14 justify-center">
        <span className="h-2 w-2 rounded-md bg-black"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
        <span className="h-2 w-4 rounded-md bg-gray-400"></span>
      </div>
    </div>
  );
}
