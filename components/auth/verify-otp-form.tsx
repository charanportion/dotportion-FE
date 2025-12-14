"use client";

import React, { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import {
  setUser,
  setVerified,
  setAuthenticated,
} from "@/lib/redux/slices/authSlice";

const formSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits." }).max(6),
});

type FormValues = z.infer<typeof formSchema>;

function VerifyOtpForm() {
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeInput, setActiveInput] = useState(0);

  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const isReset = params.get("isreset") === "true";

  const dispatch = useAppDispatch();

  const inputRefs = Array(6)
    .fill(0)
    .map(() => React.createRef<HTMLInputElement>());

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  });

  const startTimer = useCallback(() => setTimer(30), []);

  useEffect(() => {
    startTimer();
    inputRefs[0]?.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    form.setValue("otp", newOtp.join(""));

    if (value && index < 5) {
      inputRefs[index + 1]?.current?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
      setActiveInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1]?.current?.focus();
      setActiveInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs[index + 1]?.current?.focus();
      setActiveInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.substring(0, 6).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });

    setOtp(newOtp);
    form.setValue("otp", newOtp.join(""));

    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs[focusIndex]?.current?.focus();
    setActiveInput(focusIndex);
  };

  async function onSubmit(data: FormValues) {
    if (!email) {
      toast.error("Email not found. Please try signing up again.");
      router.push("/auth/signup");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call verify OTP - API route sets auth cookies
      const result = await authApi.verifyOtp({
        email,
        otp: data.otp,
        context: isReset ? "FORGOT_PASSWORD" : "REGISTER",
      });

      toast.success("OTP verified successfully!");

      // Handle password reset flow
      if (isReset) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        return;
      }

      // For registration: Update Redux state
      if (result.user) {
        dispatch(setUser(result.user));
        dispatch(setVerified(true));
        dispatch(setAuthenticated(true));

        // Small delay to ensure cookies are set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect based on isNewUser
        // isNewUser: true = needs onboarding, false = go to dashboard
        if (result.user.isNewUser) {
          router.push("/onboarding?step=0");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Fetch user details if not in response
        try {
          const userDetails = await authApi.getUserDetails();
          dispatch(setUser(userDetails));
          dispatch(setVerified(true));
          dispatch(setAuthenticated(true));

          await new Promise((resolve) => setTimeout(resolve, 100));

          if (userDetails.isNewUser) {
            router.push("/onboarding?step=0");
          } else {
            router.push("/dashboard");
          }
        } catch {
          // Fallback
          dispatch(setVerified(true));
          dispatch(setAuthenticated(true));
          await new Promise((resolve) => setTimeout(resolve, 100));
          router.push("/onboarding?step=0");
        }
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "OTP verification failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOTP() {
    if (!email) return;

    setIsResending(true);
    try {
      await authApi.resendOtp({
        email,
        context: isReset ? "FORGOT_PASSWORD" : "REGISTER",
      });
      toast.success("OTP resent successfully!");
      startTimer();
      setOtp(["", "", "", "", "", ""]);
      form.setValue("otp", "");
      inputRefs[0]?.current?.focus();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  if (!email) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Error
          </CardTitle>
          <CardDescription>
            No email provided. Please start the signup process again.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => router.push("/auth/signup")}
            className="w-full"
          >
            Go to Signup
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md border-none shadow-none dark:bg-zinc-900 backdrop-blur dark:supports-[backdrop-filter]:bg-zinc-900">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Verify your account
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="font-medium">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={() => (
                <FormItem className="mx-auto">
                  <FormControl>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <div
                          key={index}
                          className={cn(
                            "relative h-12 w-full max-w-[50px] rounded-xl border border-input bg-background",
                            activeInput === index && "ring-2 ring-primary"
                          )}
                        >
                          <input
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="\d{1}"
                            maxLength={1}
                            className="absolute inset-0 w-full h-full bg-transparent text-center text-lg font-medium focus:outline-none focus:ring-0 border-0"
                            value={digit}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onFocus={() => setActiveInput(index)}
                            onPaste={index === 0 ? handlePaste : undefined}
                          />
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {timer > 0 && <p>{formatTime(timer)}</p>}
              </div>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto cursor-pointer text-destructive hover:underline"
                disabled={timer > 0 || isResending}
                onClick={handleResendOTP}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Please check your inbox for the verification code
        </p>
      </CardFooter>
    </Card>
  );
}

export default VerifyOtpForm;
