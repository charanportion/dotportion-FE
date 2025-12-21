"use client";

import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { fetchDashboardData } from "@/lib/redux/slices/dashboardSlice";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiCallsOverTimeChart } from "@/components/charts/dashboard/ApiCallsOverTimeChart";
import { TopWorkflowsChart } from "@/components/charts/dashboard/TopWorkflowsChart";
import { SuccessFailPieChart } from "@/components/charts/dashboard/SuccessFailPieChart";
import { TopProjectsChart } from "@/components/charts/dashboard/TopProjectsChart";
// import { SecretsByProviderPieChart } from "@/components/charts/dashboard/SecretsByProviderPieChart";
// import { RequestsByMethodChart } from "@/components/charts/dashboard/RequestsByMethodChart";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data } = useAppSelector((state) => state.dashboard);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Safety check: redirect unverified users
  useEffect(() => {
    if (isAuthenticated && user && !user.isVerified) {
      router.push("/auth/verify-otp");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardData());
    }
  }, [isAuthenticated, dispatch]);

  if (!data) return null;

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Analytics
            </h1>
          </div>
          {/* Metric Cards */}
          {/* <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white/80 max-w-[234px] h-48 w-full shadow-none transition rounded-xl border border-neutral-300">
              <CardContent className="flex flex-col items-center justify-center gap-1.5 h-full">
                <BarChart2 className="h-8 w-8 text-indigo-500" />
                <p className="text-2xl font-bold text-gray-800">
                  {data.counts.totalProjects}
                </p>
                <p className="text-sm text-gray-500">Total Projects</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 max-w-[234px] h-48 w-full shadow-none transition rounded-xl border border-neutral-300">
              <CardContent className="flex flex-col items-center justify-center gap-1.5 h-full">
                <Workflow className="h-8 w-8 text-green-500" />
                <p className="text-2xl font-bold text-gray-800">
                  {data.counts.totalWorkflows}
                </p>
                <p className="text-sm text-gray-500">Total Workflows</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 max-w-[234px] h-48 w-full shadow-none transition rounded-xl border border-neutral-300">
              <CardContent className="flex flex-col items-center justify-center gap-1.5 h-full">
                <Server className="h-8 w-8 text-blue-500" />
                <p className="text-2xl font-bold text-gray-800">
                  {data.counts.totalApiCalls}
                </p>
                <p className="text-sm text-gray-500">Total API Calls</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 max-w-[234px] h-48 w-full shadow-none transition rounded-xl border border-neutral-300">
              <CardContent className="flex flex-col items-center justify-center gap-1.5 h-full">
                <PercentCircle className="h-8 w-8 text-yellow-500" />
                <p className="text-2xl font-bold text-gray-800">
                  {data.counts.successRate}%
                </p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 max-w-[234px] h-48 w-full shadow-none transition rounded-xl border border-neutral-300">
              <CardContent className="flex flex-col items-center justify-center gap-1.5 h-full">
                <Key className="h-8 w-8 text-yellow-500" />
                <p className="text-2xl font-bold text-gray-800">
                  {data.counts.totalSecrets}
                </p>
                <p className="text-sm text-gray-500">Total Secrets</p>
              </CardContent>
            </Card>
          </div> */}

          {/* Charts Section */}
          <div className="flex flex-col lg:flex-row gap-6 mt-8">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="">
                <ApiCallsOverTimeChart data={data.callsOverTime} />
              </div>
              <div className="">
                <TopProjectsChart data={data.topProjects} />
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full lg:w-1/3 min-w-0">
              <div className="">
                <SuccessFailPieChart data={data.successVsFailed} />
              </div>
              <div>
                <TopWorkflowsChart data={data.topWorkflows} />
              </div>
              {/* <div className="bg-white/80 rounded-xl shadow-md p-4">
                <SecretsByProviderPieChart data={data.secretsByProvider} />
              </div>
              <div className="bg-white/80 rounded-xl shadow-md p-4">
                <RequestsByMethodChart data={data.requestsByMethod} />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      Redirecting...
    </div>
  );
}
