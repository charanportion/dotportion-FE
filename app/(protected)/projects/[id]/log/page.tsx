import { LogsPage } from "@/components/logs-page";
import { use } from "react";

interface LogsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: LogsPageProps) {
  const { id } = use(params);
  return (
    <div className="h-full max-w-7xl w-full  py-6 mx-auto">
      {/* <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs</h1>
        <p className="text-gray-600 mt-2">View and manage your API logs</p>
      </div> */}

      <LogsPage projectId={id} />
    </div>
  );
}
