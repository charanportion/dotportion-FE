import VerifyOtpForm from "@/components/auth/verify-otp-form";
import { Suspense } from "react";

function page() {
  return (
    <div className="w-full h-[100vh] flex flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}

export default page;
