export default function RejectedAccessPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <h1 className="text-3xl font-semibold mb-4 text-red-600">
        Access Rejected
      </h1>

      <p className="text-neutral-600 max-w-md mb-6">
        Your access request was rejected. If you believe this is a mistake,
        please contact our support team to resolve the issue.
      </p>

      <a
        href="/support"
        className="px-6 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700"
      >
        Contact Support
      </a>
    </div>
  );
}
