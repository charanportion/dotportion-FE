"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email");

  const submit = async () => {
    if (!username.trim()) {
      alert("Please choose a valid username.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/set-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, username }),
    });

    if (!res.ok) {
      toast.error("failed to set username");
      alert("Failed: " + (await res.text()));
      return;
    }

    router.push("/onboarding?step=0");
  };

  return (
    <div className="flex-1 flex flex-col justify-center w-[330px] sm:w-[384px]">
      <div className="mb-10">
        <h1 className="mt-8 mb-2 lg:text-3xl text-foreground">
          Choose a username
        </h1>
      </div>
      <Label className="transition-all duration-500 ease-in-out flex flex-row gap-2 justify-between mb-2">
        <p className=" text font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm transition-colors text-foreground flex gap-2 items-center break-all leading-normal">
          Username
        </p>
      </Label>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        className="flex w-full shadow-none bg-input rounded-md border border-border text-sm leading-4 px-3 py-2 my-2 h-[34px]"
      />
      <Button
        onClick={submit}
        disabled={loading}
        className="relative cursor-pointer space-x-2 text-center ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1  w-full flex items-center justify-center text-base px-4 py-2 h-[42px]"
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}
