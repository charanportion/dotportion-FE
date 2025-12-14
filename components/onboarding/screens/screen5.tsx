"use client";

import { RootState, AppDispatch } from "@/lib/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  setAnswer,
  submitAnswer,
  completeOnboarding,
} from "@/lib/redux/slices/profileSlice";
import { setIsNewUser } from "@/lib/redux/slices/authSlice";
import { useState } from "react";

export default function Screen5() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const answers = useSelector((state: RootState) => state.profile.answers);
  const status = useSelector((state: RootState) => state.profile.status);
  const errorMessage = useSelector((state: RootState) => state.profile.error);

  const [localError, setLocalError] = useState("");

  const handleContinue = async () => {
    setLocalError("");

    try {
      // Submit final profile data
      await dispatch(submitAnswer(answers)).unwrap();

      // Complete onboarding - this sets isNewUser to false in cookie and backend
      await dispatch(completeOnboarding()).unwrap();

      // Update Redux state
      dispatch(setIsNewUser(false));

      // Small delay to ensure cookies are updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      if (typeof err === "string") {
        setLocalError(err);
      } else {
        setLocalError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Subscribe for updates
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-10">
          DotPortion is constantly evolving, subscribe to learn about changes
        </p>

        {/* Subscription Options */}
        <div className="space-y-4 text-left">
          <div className="flex sm:items-center sm:justify-between gap-y-4 sm:gap-y-0 sm:gap-x-48 pt-8 pb-8 border-t border-b border-gray-300">
            <div className="flex-1 px-4 sm:px-6">
              <Label
                htmlFor="tutorials-switch"
                className="text-sm sm:text-base font-medium mb-2"
              >
                Subscribe to DotPortion tutorials
              </Label>
              <p className="text-xs text-gray-600">
                Follow how to use our features to build API&apos;s
              </p>
            </div>
            <div className="sm:px-6">
              <Switch
                id="tutorials-switch"
                checked={answers.subscription_tutorials || false}
                onCheckedChange={(isChecked) => {
                  dispatch(
                    setAnswer({
                      key: "subscription_tutorials",
                      value: isChecked,
                    })
                  );
                }}
              />
            </div>
          </div>

          <div className="flex sm:items-center sm:justify-between gap-y-4 sm:gap-y-0 sm:gap-x-48 pb-8 border-b border-gray-300">
            <div className="flex-1 px-4 sm:px-6">
              <Label
                htmlFor="newsletter-switch"
                className="text-sm sm:text-base font-medium mb-2"
              >
                Subscribe to DotPortion newsletter
              </Label>
              <p className="text-xs text-gray-600">
                Follow our newsletter to get tech updates
              </p>
            </div>
            <div className="sm:px-6">
              <Switch
                id="newsletter-switch"
                checked={answers.subscription_newsletter || false}
                onCheckedChange={(isChecked) => {
                  dispatch(
                    setAnswer({
                      key: "subscription_newsletter",
                      value: isChecked,
                    })
                  );
                }}
              />
            </div>
          </div>
        </div>

        {(localError || errorMessage) && (
          <p className="text-red-500 mt-4">{localError || errorMessage}</p>
        )}

        {/* Continue button */}
        <Button
          className="bg-[#222] hover:bg-white hover:border border-black hover:text-black text-white text-sm sm:text-base font-normal px-5 h-11 rounded-md mt-6"
          onClick={handleContinue}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Finishing..." : "Complete Setup"}
        </Button>

        {/* Step Indicator */}
        <div className="flex space-x-1 mt-10 sm:mt-14 justify-center">
          <span className="h-2 w-4 rounded-md bg-gray-400"></span>
          <span className="h-2 w-4 rounded-md bg-gray-400"></span>
          <span className="h-2 w-4 rounded-md bg-gray-400"></span>
          <span className="h-2 w-4 rounded-md bg-gray-400"></span>
          <span className="h-2 w-2 rounded-full bg-black"></span>
        </div>
      </div>
    </div>
  );
}
