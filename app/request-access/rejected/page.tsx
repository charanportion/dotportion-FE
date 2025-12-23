import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RejectedAccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <h1 className="text-3xl font-semibold mb-4 text-foreground">
        Access Rejected
      </h1>

      <p className="text-muted-foreground max-w-md mb-6">
        Your access request was rejected. If you believe this is a mistake,
        please contact our support team to resolve the issue.
      </p>

      <Link href="/support">
        <Button
          variant="secondary"
          className="text-sm font-normal px-5 h-8 rounded-md"
        >
          Contact Support
        </Button>
      </Link>
    </div>
  );
}
