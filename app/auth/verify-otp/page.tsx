"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";

import { authApi } from "@/lib/api/auth";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  setUser,
  setVerified,
  setAuthenticated,
} from "@/lib/redux/slices/authSlice";
import { Input } from "@/components/ui/input";

/* ------------------------------------------------------------------ */
/* ZOD (INLINE) */
/* ------------------------------------------------------------------ */
const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const isReset = params.get("isreset") === "true";

  const dispatch = useAppDispatch();

  const [timer, setTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  /* ------------------------------------------------------------------ */
  /* TIMER */
  /* ------------------------------------------------------------------ */
  const startTimer = useCallback(() => setTimer(30), []);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  /* ------------------------------------------------------------------ */
  /* VERIFY OTP */
  /* ------------------------------------------------------------------ */
  const onSubmit = async (data: OTPFormData) => {
    if (!email) {
      toast.error("Email not found. Please try again.");
      router.push("/auth/signup");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await authApi.verifyOtp({
        email,
        otp: data.otp,
        context: isReset ? "FORGOT_PASSWORD" : "REGISTER",
      });

      toast.success("OTP verified successfully");

      if (isReset) {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        return;
      }

      if (result?.user) {
        dispatch(setUser(result.user));
        dispatch(setVerified(true));
        dispatch(setAuthenticated(true));

        await new Promise((r) => setTimeout(r, 100));

        router.push(
          result.user.isNewUser ? "/onboarding?step=0" : "/dashboard"
        );
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* RESEND OTP */
  /* ------------------------------------------------------------------ */
  const handleResendOTP = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await authApi.resendOtp({
        email,
        context: isReset ? "FORGOT_PASSWORD" : "REGISTER",
      });

      toast.success("OTP resent successfully");
      form.reset();
      startTimer();
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) return null;

  return (
    <>
      <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
        <div className="mb-10">
          <h1 className="mt-8 mb-2 lg:text-3xl text-foreground">
            Verify your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start gap-2">
                  <FormLabel>Verification Code</FormLabel>

                  <FormControl>
                    <Input
                      maxLength={6}
                      disabled={isSubmitting}
                      placeholder="Enter 6-digit OTP"
                      className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-muted-foreground">
                {timer > 0 && formatTime(timer)}
              </span>
              <Button
                type="button"
                variant="link"
                className="p-0 text-foreground disabled:text-muted-foreground"
                disabled={timer > 0 || isResending}
                onClick={handleResendOTP}
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
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

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Please check your inbox for the verification code
        </p>
      </div>
    </>
  );
}
