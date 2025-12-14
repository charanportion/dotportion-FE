"use client";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedQuote, setSelectedQuote] = useState<string>("");
  const pathname = usePathname();

  const quotes = [
    "Great things start with a single step. This is yours. 🚀",
    "Build smarter. Work faster. Create freely. ⚡",
    "Your ideas deserve a place to grow. 🌱",
    "The tools you need. The freedom you want. 🧰✨",
    "Start building the way you’ve always imagined. 🛠️💡",
    "Big visions start with small decisions. 🎯",
    "Turn your next idea into something real. 🔧➡️📈",
    "Momentum begins the moment you begin. ⚙️➡️🚀",
    "Create without limits. Start whenever you’re ready. ✨🌍",
    "You bring the vision. We’ll bring the possibilities. 🔭🤝",
  ];

  // Pick a random quote on mount; avoid repeating the same one in the same session
  useEffect(() => {
    try {
      const lastIndexStr = sessionStorage.getItem("signin_quote_index");
      const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;

      let newIndex = -1;
      if (quotes.length === 1) newIndex = 0;
      else {
        // try a few times to avoid repeating
        for (let i = 0; i < 10; i++) {
          const candidate = Math.floor(Math.random() * quotes.length);
          if (candidate !== lastIndex) {
            newIndex = candidate;
            break;
          }
        }
        // fallback - allow repeat if couldn't find different one (very unlikely)
        if (newIndex === -1)
          newIndex = Math.floor(Math.random() * quotes.length);
      }

      sessionStorage.setItem("signin_quote_index", String(newIndex));
      setSelectedQuote(quotes[newIndex]);
    } catch (e) {
      // if sessionStorage is unavailable, just pick a random quote
      console.log(e);
      const idx = Math.floor(Math.random() * quotes.length);
      setSelectedQuote(quotes[idx]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <div className="flex flex-col min-h-screen w-screen">
      <div className="flex flex-1 w-full overflow-y-hidden">
        <div className="flex-grow h-full overflow-y-auto">
          <div className="relative flex flex-col bg-alternative min-h-screen">
            {/* Header */}
            <div className="absolute top-0 w-full px-8 mx-auto sm:px-6 lg:px-8 mt-6">
              <nav className="relative flex items-center justify-between sm:h-10">
                <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <Link href={"/"}>
                      <Image
                        src={"/logo-dark.png"}
                        alt="Dotportion logo"
                        height={40}
                        width={100}
                        className="h-9 w-auto"
                      />
                    </Link>
                  </div>
                </div>
                <div className="items-center hidden space-x-3 md:ml-10 md:flex md:pr-4">
                  <Link
                    href={"/"}
                    className="cursor-pointer text-xs items-center gap-2 inline-flex px-2.5 py-1 h-[26px] border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-100 transition duration-150"
                  >
                    <BookOpen className="size-3.5" />
                    <span>Documentation</span>
                  </Link>
                </div>
              </nav>
            </div>
            {/* body */}
            <div className="flex flex-1 h-full">
              <main className="flex flex-col items-center flex-1 flex-shrink-0 px-5 pt-16 pb-8 border-r shadow-lg bg-studio border-default">
                {children}
              </main>
              <aside className="flex-col relative items-center justify-center flex-1 flex-shrink hidden basis-1/4 xl:flex">
                <div className="relative flex flex-col gap-6">
                  <div className="absolute select-none -top-14 -left-14">
                    <span className="text-[160px] leading-none text-neutral-300 font-inter">
                      “
                    </span>
                  </div>
                  <blockquote className="z-10 max-w-lg text-3xl">
                    {selectedQuote}
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <Image
                      src={"/founder.jpg"}
                      alt="founder photo"
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <cite className="not-italic font-medium text-foreground-light whitespace-nowrap">
                        @ sri charan
                      </cite>
                      <p className="text-xs text-neutral-500">Founder</p>
                    </div>
                  </div>
                </div>
                <div className="absolute">
                  <Image
                    src={"/logo/light.png"}
                    alt="logo"
                    width={400}
                    height={400}
                    className=" h-96 w-auto opacity-5"
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
