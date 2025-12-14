"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { completeOAuthLogin } from "@/lib/redux/slices/authSlice";
// import { Spinner } from "@/components/ui/spinner";
import DotLoader from "@/components/loader";

function AuthSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const token = searchParams.get("token");
  const isNewUserParam = searchParams.get("new_user") === "true";
  const email = searchParams.get("email");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        // No token → bounce to signin
        router.push("/auth/signin?error=oauth_no_token");
        return;
      }

      if (!email) {
        router.push("/auth/signin?error=no_email_from_oauth");
        return;
      }

      const result = await dispatch(
        completeOAuthLogin({ token, isNewUser: isNewUserParam })
      );

      if (completeOAuthLogin.fulfilled.match(result)) {
        const user = result.payload.user;
        const isNew = user.isNewUser ?? isNewUserParam;

        if (isNew) {
          router.push(`/auth/username?email=${email}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        console.error("OAuth login failed:", result.payload);
        router.push("/auth/signin?error=oauth_failed");
      }
    };

    run();
  }, [token, email, isNewUserParam, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center flex flex-col items-center justify-center gap-2">
        <DotLoader />
        <p className="text-xl text-black dark:text-white font-semibold">
          Signing you in...
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#18181b]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <AuthSuccessInner />
    </Suspense>
  );
}
