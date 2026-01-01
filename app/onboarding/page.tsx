"use client";

// import { useSelector } from "react-redux";
// import { RootState } from "@/lib/redux/store";
import Screen1 from "@/components/onboarding/screens/screen1";
import Screen2 from "@/components/onboarding/screens/screen2";
import Screen3 from "@/components/onboarding/screens/screen3";
import Screen4 from "@/components/onboarding/screens/screen4";
import Screen5 from "@/components/onboarding/screens/screen5";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

const steps = [
  null, // step=0 → welcome
  Screen1,
  Screen2,
  Screen3,
  Screen4,
  Screen5,
];

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const stepParam = searchParams.get("step");
  const step = stepParam ? parseInt(stepParam, 10) : 0;

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        router.push("/onboarding?step=1");
      }, 1500); // 1.5s splash
      return () => clearTimeout(timer);
    }
  }, [step, router]);
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        {/* Splash screen logo & text */}
        <div className="flex flex-col items-center">
          <Image
            src={"/logo-dark.png"}
            alt="logo"
            width={256}
            height={256}
            className=" object-contain block dark:hidden mb-4 animate-fade-in"
          />
          <Image
            src={"/logo-light.png"}
            alt="logo"
            width={256}
            height={256}
            className=" object-contain hidden dark:block mb-4 animate-fade-in"
          />
          {/* <h1 className="text-2xl font-semibold">DotPortion</h1> */}
        </div>
      </div>
    );
  }

  // If step is valid, render the matching question
  if (step > 0 && step < steps.length) {
    const CurrentQuestion = steps[step] as React.FC;
    return <CurrentQuestion />;
  }

  router.push("/dashboard");
  return null;
}

export default function UpdateProfilePage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
