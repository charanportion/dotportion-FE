"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { authApi } from "@/lib/api/auth";

/* ------------------------------------------------------------------ */
/* ZOD SCHEMA — STEP AWARE (INLINE) */
/* ------------------------------------------------------------------ */
const resetPasswordSchema = z
  .object({
    step: z.enum(["otp", "password"]),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.step === "password") {
      if (!data.newPassword || data.newPassword.length < 6) {
        ctx.addIssue({
          path: ["newPassword"],
          message: "Password must be at least 6 characters",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      step: "otp",
      otp: "",
      newPassword: "",
    },
  });

  const step = form.watch("step");

  /* ------------------------------------------------------------------ */
  /* SUBMIT HANDLER */
  /* ------------------------------------------------------------------ */
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);

      // STEP 1 → VERIFY OTP
      if (data.step === "otp") {
        await authApi.verifyOtp({
          email,
          otp: data.otp,
          context: "FORGOT_PASSWORD",
        });

        toast.success("OTP verified successfully");
        form.setValue("step", "password");
        return;
      }

      // STEP 2 → RESET PASSWORD
      await authApi.resetPassword({
        email,
        new_password: data.newPassword!,
      });

      toast.success("Password reset successfully");
      router.push("/auth/signin");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
        <div className="mb-10">
          <h1 className="mt-8 mb-2 lg:text-3xl">Reset password</h1>
          <h2 className="text-sm text-muted-foreground">
            Enter the OTP sent to <b>{email}</b>
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* OTP FIELD */}
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={6}
                      disabled={step === "password"}
                      placeholder="Enter 6-digit OTP"
                      className="bg-input border-border h-[34px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PASSWORD FIELD (ONLY AFTER OTP VERIFIED) */}
            {step === "password" && (
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="bg-input border-border h-[34px]"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute text-muted-foreground right-1 top-1 h-6 w-6 bg-card hover:bg-muted border border-border"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-3.5" />
                          ) : (
                            <Eye className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
            >
              {step === "otp"
                ? loading
                  ? "Verifying OTP..."
                  : "Verify OTP"
                : loading
                ? "Resetting password..."
                : "Reset Password"}
            </Button>
          </form>
        </Form>

        <div className="self-center my-8 text-sm">
          <Link
            href="/auth/signin"
            className="underline text-foreground hover:text-foreground-light"
          >
            Back to Sign In
          </Link>
        </div>
      </div>

      <div className="sm:text-center">
        <p className="text-xs text-foreground-lighter sm:max-w-sm mx-auto">
          By continuing, you agree to Dotportion’s{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          &{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
