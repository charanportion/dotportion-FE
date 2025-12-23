"use client";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { login } from "@/lib/redux/slices/authSlice";
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
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    const result = await dispatch(login(data));

    if (login.fulfilled.match(result)) {
      toast.success("Login successful!");
      router.push("/projects");
    } else {
      toast.error((result.payload as string) || "Login failed");
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
      <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
        <div className="mb-10">
          <h1 className="mt-8 mb-2 lg:text-3xl text-foreground">
            Welcome back
          </h1>
          <h2 className="text-sm text-muted-foreground">
            Sign in to your account
          </h2>
        </div>
        <div className="flex flex-col gap-5">
          <div className="w-flex items-center relative">
            <div className="w-full">
              <Button
                variant={"outline"}
                onClick={handleGithubLogin}
                className="truncate px-4 py-2 h-11 flex items-center border border-border shadow-none rounded-lg w-full"
              >
                <div>
                  <FaGithub className="size-5" />
                </div>
                Continue with Github
              </Button>
            </div>
          </div>
          <div className="w-flex items-center relative">
            <div className="w-full">
              <Button
                variant={"outline"}
                onClick={handleGoogleLogin}
                className="truncate px-4 py-2 h-11 flex items-center border border-border shadow-none rounded-lg w-full"
              >
                <div>
                  <FaGoogle className="size-5" />
                </div>
                Continue with Google
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-strong"></div>
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
                name="email"
                render={({ field }) => (
                  <FormItem className="relative text-sm flex flex-col gap-2">
                    <FormLabel className="transition-all duration-500 ease-in-out flex flex-row gap-2 justify-between">
                      <p className="text font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm transition-colors text-foreground flex gap-2 items-center break-all leading-normal">
                        Email
                      </p>
                    </FormLabel>
                    <FormControl className="transition-all duration-500 ease-in-out order-1 col-span-12">
                      <Input
                        type="email"
                        className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 h-[34px]"
                        placeholder="m@example.com"
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
                    <FormLabel className="transition-all duration-500 ease-in-out flex flex-row gap-2 justify-between">
                      <p className="text font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm transition-colors text-foreground flex gap-2 items-center break-all leading-normal">
                        Password
                      </p>
                      <Link
                        href="/auth/forgot-password"
                        className="text-muted-foreground font-normal text-sm cursor-pointer hover:text-foreground transition-all duration-200"
                      >
                        Forgot Password?
                      </Link>
                    </FormLabel>
                    <FormControl>
                      <div className="transition-all duration-500 ease-in-out order-1 col-span-12 relative">
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

              <div className="flex items-center relative">
                <div className="w-full">
                  <Button
                    type="submit"
                    className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <p></p>
        </div>
        <div className="self-center my-8 text-sm">
          <div>
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              className="underline transition text-foreground hover:text-muted-foreground"
              href={"/auth/signup"}
            >
              Sign Up Now
            </Link>
          </div>
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
