"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RequestAccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestAccess = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/access/request", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // redirect to pending page
      router.push("/request-access/pending");
    } catch {
      setError("Failed to request access");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <h1 className="text-3xl font-semibold mb-2 text-foreground">
        Request Access
      </h1>

      <p className="text-muted-foreground max-w-md mb-4">
        You’ve completed onboarding. To start using DotPortion, you need to
        request access to your workspace. Our team will review and approve it.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <Button
        className="px-5 h-8 text-sm font-normal rounded-md"
        disabled={loading}
        onClick={handleRequestAccess}
      >
        {loading ? "Requesting..." : "Request Access"}
      </Button>
    </div>
  );
}
