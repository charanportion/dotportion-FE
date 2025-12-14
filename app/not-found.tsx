"use client";

// import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  console.log(typeof window);
  console.log(window);
  console.log(window.history.length);

  const handleBack = () => {
    console.log("button clicked");
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <div className="relative mx-auto flex min-h-screen w-full flex-col items-center justify-center">
      <div className="absolute top-0 mx-auto w-full max-w-7xl px-8 pt-6 sm:px-6 lg:px-8">
        <nav className="relative flex items-center justify-between sm:h-10">
          <div className="flex flex-shrink-0 flex-grow items-center lg:flex-grow-0">
            <div className="flex w-full items-center justify-between md:w-auto">
              <Link href={"/dashboard"} className="flex items-center gap-2">
                <Image
                  src={"/logo-dark.png"}
                  alt="Dotportion Logo"
                  width={50}
                  height={50}
                  className="w-30 h-7.5"
                />
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="absolute select-none opacity-[5%] filter-transition duration-200 blur-sm pointer-events-none">
        <h1 style={{ fontSize: "28rem" }}>404</h1>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 transitionopacity-100">
        <div className="flex w-[380px] flex-col items-center justify-center space-y-3 text-center">
          <h3 className="text-xl">Looking for something? 🔍</h3>
          <p className="text-muted-foreground">
            We couldn&apos;t find the page that you&apos;re looking for!
          </p>
        </div>
        <div className="flex items-center space-y-4">
          <button
            onClick={handleBack}
            className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1 rounded-lg"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
