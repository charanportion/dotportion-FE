"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";

/* ---------------- Zod Schema ---------------- */
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      await authApi.forgotPassword({ email: values.email });
      toast.success("OTP sent to your email");

      router.push(
        `/auth/reset-password?email=${encodeURIComponent(values.email)}`
      );
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
        <div className="mb-10">
          <h1 className="mt-8 mb-2 lg:text-3xl">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a code to reset your
            password
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative text-sm flex flex-col gap-2">
                  <FormLabel className="text-sm font-normal text-foreground">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px] pr-10"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        </Form>

        <div className="self-center my-8 text-sm">
          <span className="text-muted-foreground">Have an account? </span>
          <Link
            className="underline transition text-foreground hover:text-muted-foreground"
            href="/auth/signin"
          >
            Sign In Now
          </Link>
        </div>
      </div>

      <div className="sm:text-center">
        <p className="text-xs text-foreground-lighter sm:mx-auto sm:max-w-sm">
          By continuing, you agree to Dotportion&apos;s{" "}
          <Link
            href="https://www.dotportion.com/terms"
            className="underline hover:text-foreground-light"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="https://www.dotportion.com/privacy"
            className="underline hover:text-foreground-light"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </>
  );
}
