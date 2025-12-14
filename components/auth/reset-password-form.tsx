"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
// import { resetPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

const formSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const router = useRouter();

  const [timer, setTimer] = useState(30);
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const [activeInput, setActiveInput] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useMemo(
    () =>
      Array(6)
        .fill(0)
        .map(() => React.createRef<HTMLInputElement>()),
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "", newPassword: "" },
  });

  useEffect(() => {
    inputRefs[0]?.current?.focus();
    const interval = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [inputRefs]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.slice(-1);
    setOtpArray(newOtp);
    form.setValue("otp", newOtp.join(""));
    if (value && index < 5) inputRefs[index + 1]?.current?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
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

  const startTimer = useCallback(() => {
    setTimer(30);
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d+$/.test(pastedData)) return;
    const digits = pastedData.substring(0, 6).split("");
    const newOtp = [...otpArray];
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    setOtpArray(newOtp);
    form.setValue("otp", newOtp.join(""));
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs[focusIndex]?.current?.focus();
    setActiveInput(focusIndex);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      await authApi.resetPassword({
        email,
        otp: data.otp,
        new_password: data.newPassword,
      });
      toast.success("Password reset successfully!");
      router.push("/auth/signin");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  async function handleResendOTP() {
    try {
      setIsResending(true);
      await authApi.resendOtp({
        email: email ?? "",
      });
      toast.success("OTP resent successfully!");
      startTimer();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-none shadow-none dark:bg-zinc-900 backdrop-blur dark:supports-[backdrop-filter]:bg-zinc-900">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">{email}</span> and set
          your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={() => (
                <FormItem>
                  <label className="text-sm font-medium">
                    Verification Code
                  </label>
                  <FormControl>
                    <div className="flex justify-between gap-2">
                      {otpArray.map((digit, index) => (
                        <div
                          key={index}
                          className={cn(
                            "relative h-12 w-full max-w-[50px] rounded-xl border border-input bg-background",
                            activeInput === index && "ring-2 ring-ring"
                          )}
                        >
                          <input
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="absolute inset-0 w-full h-full bg-transparent text-center text-lg font-medium focus:outline-none focus:ring-0 border-0"
                            value={digit}
                            onChange={(e) => handleOtpChange(e, index)}
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

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm font-medium">New Password</label>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Remember your password?{" "}
              </span>
              <Link
                href="/auth/signin"
                className="underline hover:no-underline"
              >
                Sign In
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
