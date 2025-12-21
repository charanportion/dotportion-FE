"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { signUp } from "@/lib/redux/slices/authSlice";
import { FaGithub, FaGoogle } from "react-icons/fa";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    const result = await dispatch(
      signUp({
        full_name: data.fullName,
        name: data.name,
        email: data.email,
        password: data.password,
      })
    );

    if (signUp.fulfilled.match(result)) {
      toast.success("Account created! Please verify your email.");
      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
    } else {
      toast.error((result.payload as string) || "Signup failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/google/login`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/github/login`;
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px] ">
        <div className="mb-10">
          <h1 className="mt-8 mb-2 lg:text-3xl">Get started</h1>
          <h2 className="text-sm text-foreground-light dark:text-neutral-400">
            Create a new account
          </h2>
        </div>
        <div className="flex flex-col gap-5">
          <Button
            variant="outline"
            onClick={handleGithubLogin}
            className="truncate px-4 py-2 h-11 flex items-center border border-border shadow-none rounded-lg w-full"
          >
            <FaGithub className="size-5 mr-2" />
            Continue with Github
          </Button>
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="truncate px-4 py-2 h-11 flex items-center border border-border shadow-none rounded-lg w-full"
          >
            <FaGoogle className="size-5 mr-2" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-strong" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-sm bg-studio text-foreground">or</span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="relative text-sm flex flex-col gap-2">
                    <FormLabel className="text-sm font-normal text-foreground">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                        placeholder="Sri Charan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="relative text-sm flex flex-col gap-2">
                    <FormLabel className="text-sm font-normal text-foreground">
                      Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                        placeholder="charan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative text-sm flex flex-col gap-2">
                    <FormLabel className="text-sm font-normal text-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          {...field}
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

              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </Form>
        </div>

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
        <p className="text-xs text-muted-foreground sm:mx-auto sm:max-w-sm">
          By continuing, you agree to Dotportion&apos;s{" "}
          <Link
            href={"https://www.dotportion.com/terms"}
            className="underline text-foreground hover:text-muted-foreground"
          >
            Terms of Service{" "}
          </Link>
          and
          <Link
            href={"https://www.dotportion.com/privacy"}
            className="underline text-foreground hover:text-muted-foreground"
          >
            {" "}
            Privacy Policy{" "}
          </Link>
          , and to receive periodic emails with updates.
        </p>
      </div>
    </>
  );
}
