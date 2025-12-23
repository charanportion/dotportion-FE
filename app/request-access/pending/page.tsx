"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendingAccessPage() {
  const router = useRouter();

  useEffect(() => {
    async function syncStatus() {
      const res = await fetch("/api/access/request-pending", {
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.access?.status === "approved") {
        router.push("/dashboard");
      }

      if (data.access?.status === "rejected") {
        router.push("/request-access/rejected");
      }
    }

    syncStatus();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <h1 className="text-3xl font-semibold mb-4 text-foreground">
        Access Requested
      </h1>

      <p className="text-muted-foreground max-w-md">
        Your access request has been received. Once approved, you will be
        notified and automatically gain access to your workspace.
      </p>
    </div>
  );
}
