"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Copy,
  Filter,
  RefreshCw,
  Clock,
  Calendar,
  Play,
  Pause,
  Wifi,
  WifiOff,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchWorkflowLogs,
  setStatusFilter,
} from "@/lib/redux/slices/logsSlice";
import { logsApi, type Log } from "@/lib/api/logs";
import { useLogsPolling } from "@/hooks/use-logs-polling";
import type { RootState, AppDispatch } from "@/lib/redux/store";

interface LogsDetailTableProps {
  workflowId: string;
  onLogClick: (log: Log) => void;
}

export function LogsDetailTable({
  workflowId,
  onLogClick,
}: LogsDetailTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { logs, isLoading, filters, error, lastUpdated } = useSelector(
    (state: RootState) => state.logs
  );

  const { isPolling, togglePolling } = useLogsPolling({
    enabled: false, // Start disabled, user can enable
    interval: 3000, // Poll every 3 seconds
    workflowId,
  });

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fetch logs on mount and when filters change
  React.useEffect(() => {
    dispatch(
      fetchWorkflowLogs({
        workflowId,
        limit: filters.limit,
        page: filters.page,
        status: filters.status === "all" ? undefined : filters.status,
      })
    );
  }, [dispatch, workflowId, filters]);

  const handleRefresh = () => {
    dispatch(
      fetchWorkflowLogs({
        workflowId,
        limit: filters.limit,
        page: 1,
        status: filters.status === "all" ? undefined : filters.status,
      })
    );
    toast.success("Logs refreshed");
  };

  const handleStatusFilter = (status: typeof filters.status) => {
    dispatch(setStatusFilter(status));
  };

  const handleCopyLogs = () => {
    const logsText = logs
      .map(
        (log) =>
          `[${log.status.toUpperCase()}] ${format(
            new Date(log.createdAt),
            "yyyy-MM-dd HH:mm:ss"
          )} - ${log.trigger.request.method} ${log.trigger.request.path} (${
            log.durationMs
          }ms)`
      )
      .join("\n");

    navigator.clipboard.writeText(logsText);
    toast.success("Logs copied to clipboard");
  };

  const handleTogglePolling = () => {
    togglePolling();
    toast.success(
      isPolling ? "Real-time updates disabled" : "Real-time updates enabled"
    );
  };

  const getStatusBadge = (status: Log["status"]) => {
    const colors = logsApi.getStatusColor(status);
    return (
      <div className="flex items-center justify-center">
        <Badge className={`${colors} `}>
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              status === "success"
                ? "bg-green-500"
                : status === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          ></div>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    );
  };

  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Status
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      sortingFn: (rowA, rowB) => {
        const statusOrder = { error: 0, running: 1, success: 2 };
        const a =
          statusOrder[rowA.getValue("status") as keyof typeof statusOrder];
        const b =
          statusOrder[rowB.getValue("status") as keyof typeof statusOrder];
        return a - b;
      },
    },
    {
      accessorKey: "trigger",
      header: "Request",
      cell: ({ row }) => {
        const trigger = row.getValue("trigger") as Log["trigger"];
        return (
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {trigger.request.method}
            </Badge>
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
              {trigger.request.path}
            </code>
          </div>
        );
      },
    },
    {
      accessorKey: "durationMs",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Duration
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {logsApi.formatDuration(row.getValue("durationMs"))}
        </div>
      ),
    },
    {
      accessorKey: "steps",
      header: "Steps",
      cell: ({ row }) => {
        const steps = row.getValue("steps") as Log["steps"];
        const errorSteps = steps.filter(
          (step) => step.status === "error"
        ).length;
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">{steps.length} total</span>
            {errorSteps > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorSteps} failed
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent "
          >
            Created
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {format(new Date(row.getValue("createdAt")), "MMM dd, HH:mm:ss")}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.getValue("createdAt") as string);
        const b = new Date(rowB.getValue("createdAt") as string);
        return a.getTime() - b.getTime();
      },
    },
  ];

  const table = useReactTable({
    data: logs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const filteredLogs = table.getFilteredRowModel().rows;
  const errorCount = logs.filter((log) => log.status === "error").length;
  const successCount = logs.filter((log) => log.status === "success").length;
  const runningCount = logs.filter((log) => log.status === "running").length;

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            Execution Logs
            {/* {isPolling && (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )} */}
            {lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                {/* {isPolling ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )} */}
                <span>
                  Last Updated{" "}
                  {(() => {
                    let text = formatDistanceToNow(new Date(lastUpdated), {
                      addSuffix: true,
                    });
                    return text
                      .replace("seconds", "secs")
                      .replace("second", "sec")
                      .replace("minutes", "mins")
                      .replace("minute", "min")
                      .replace("hours", "hrs")
                      .replace("hour", "hr");
                  })()}
                </span>
              </div>
            )}
          </CardTitle>
        </div>

        {/* Status Summary */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant={isPolling ? "default" : "outline"}
              size="sm"
              onClick={handleTogglePolling}
              className={`${
                isPolling ? "bg-green-600 hover:bg-green-700" : ""
              } shadow-none border-neutral-300`}
            >
              {isPolling ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Live
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Live
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="shadow-none border-neutral-300"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLogs}
              className="shadow-none border-neutral-300"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Logs
            </Button>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className=" text-green-500 font-semibold">
                {successCount} Success
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-500 font-semibold">
                {errorCount} Error
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-500 font-semibold">
                {runningCount} Running
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="shadow-none border-neutral-300"
                  variant="outline"
                  size="sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {/* Status: {filters.status === "all" ? "All" : filters.status} */}
                  {/* <ChevronDown className="ml-2 h-4 w-4" /> */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
                  All ({logs.length})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter("success")}>
                  Success ({successCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter("error")}>
                  Error ({errorCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilter("running")}>
                  Running ({runningCount})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 overflow-hidden">
        <div className="w-full">
          {/* Filters */}
          {/* <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter by request path..."
                value={
                  (table.getColumn("trigger")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("trigger")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto bg-transparent">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col flex-1 border rounded-md overflow-hidden">
            <div className="flex-1 overflow-auto">
              <Table className="h-full">
                <TableHeader className="[&_tr]:border-b-0">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border border-muted-foreground"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className={`px-4 font-semibold text-center`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="h-full">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onLogClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {isLoading ? "Loading logs..." : "No logs found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pr-0 pl-4 pb-1">
              <div className="text-xs text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-none shadow-none text-muted-foreground text-xs"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeftIcon /> Previous
                </Button>
                <p className="flex-1 text-xs text-muted-foreground">/</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-none shadow-none text-muted-foreground text-xs"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next <ChevronRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
