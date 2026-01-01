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
  // ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  ListFilter,
  ChevronLeftIcon,
  ChevronRightIcon,
  Plus,
  // Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import {
  toggleWorkflowDeployment,
  deleteWorkflow,
} from "@/lib/redux/slices/workflowsSlice";
import type { Workflow } from "@/lib/api/workflows";
import { toast } from "sonner";
import { format } from "date-fns";
import type { AppDispatch } from "@/lib/redux/store";
import { CreateWorkflowDialog } from "./project-dialogs/create-workflow-dialog";

interface WorkflowsTableProps {
  workflows: Workflow[];
  projectId: string;
  isLoading?: boolean;
  onEditWorkflow: (workflow: Workflow) => void;
  onWorkflowClick: (workflow: Workflow) => void;
  selectedWorkflowId?: string;
  mode?: "workflows" | "logs";
  isCreating?: boolean;
}

function TableSkeletonRows({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-16 w-full rounded bg-muted animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function WorkflowsTable({
  workflows,
  projectId,
  isLoading = false,
  onEditWorkflow,
  onWorkflowClick,
  selectedWorkflowId,
  mode = "workflows",
  isCreating,
}: WorkflowsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const handleToggleDeployment = async (workflowId: string) => {
    try {
      dispatch(toggleWorkflowDeployment(workflowId));
      toast("Success", {
        description: "Deployment status updated",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const handleDeleteWorkflow = async (
    workflowId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    try {
      dispatch(deleteWorkflow({ projectId, workflowId }));
      toast("Success", {
        description: "Workflow deleted successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 border border-green-400 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "POST":
        return "bg-blue-100 border border-blue-400 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PUT":
        return "bg-orange-100 border border-orange-400 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "DELETE":
        return "bg-red-100 border border-red-400 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "PATCH":
        return "bg-purple-100 border border-purple-400 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 border border-gray-400 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDeploymentStatus = (isDeployed: boolean) => {
    return isDeployed ? (
      <div className="px-2 text-center">
        <Badge className="bg-green-100 border border-green-400 text-green-600 dark:bg-green-900 dark:text-green-300">
          {/* <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div> */}
          Deployed
        </Badge>
      </div>
    ) : (
      <div className="px-2 text-center">
        <Badge className="bg-neutral-100 border border-neutral-400 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
          {/* <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div> */}
          Not Deployed
        </Badge>
      </div>
    );
  };

  const baseColumns: ColumnDef<Workflow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="pl-2 py-2">
          <div className="font-semibold text-foreground text-sm">
            {row.getValue("name")}
          </div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "path",
      header: "Endpoint",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <Badge className={`${getMethodColor(row.original.method)} text-xs`}>
            {row.original.method}
          </Badge>
          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
            /{row.getValue("path")}
          </code>
        </div>
      ),
    },
    {
      accessorKey: "isDeployed",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-transparent text-center"
          >
            Status
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => getDeploymentStatus(row.getValue("isDeployed")),
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue("isDeployed") as boolean;
        const b = rowB.getValue("isDeployed") as boolean;
        return a === b ? 0 : a ? 1 : -1;
      },
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:bg-transparent"
          >
            Created
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm justify-center text-muted-foreground pl-2">
          <Calendar className="h-3 w-3" />
          {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.getValue("createdAt") as string);
        const b = new Date(rowB.getValue("createdAt") as string);
        return a.getTime() - b.getTime();
      },
    },
  ];

  const workflowOnlyColumns: ColumnDef<Workflow>[] = [
    {
      accessorKey: "deploy",
      header: "Deploy",
      cell: ({ row }) => (
        <div className="text-center pl-2">
          <Switch
            checked={row.original.isDeployed}
            onCheckedChange={() => handleToggleDeployment(row.original._id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const workflow = row.original;

        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="size-7 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-0 shadow-none">
                <DropdownMenuLabel className="text-xs font-normal px-2 py-1.5">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditWorkflow(workflow);
                  }}
                  className="text-xs px-2 py-1.5"
                >
                  <Edit className="mr-2 size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => handleDeleteWorkflow(workflow._id, e)}
                  className="text-destructive-foreground text-xs px-2 py-1.5"
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const columns =
    mode === "logs" ? baseColumns : [...baseColumns, ...workflowOnlyColumns];

  const table = useReactTable({
    data: workflows,
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

  return (
    <Card className="shadow-none border-none rounded-none pt-2 pb-0 w-full h-full bg-background gap-2 px-0">
      {mode === "logs" ? (
        <CardHeader>
          <div className="mb-12">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Workflow Logs
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center py-0 gap-2">
              <Input
                placeholder="Find a workflow..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-7 min-w-xs w-full border border-neutral-300 rounded-md bg-neutral-100 text-xs shadow-none"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border border-neutral-300 text-xs text-neutral-600 shadow-none size-7"
                  >
                    <ListFilter className="size-3.5" />
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
            </div>
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="mb-2">
          <div className="mb-12">
            <h1 className="text-xl font-medium tracking-tight text-foreground">
              Workflows
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your automated workflows
            </p>
          </div>
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center py-0 gap-2">
              <Input
                placeholder="Find a workflow..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="h-7 min-w-xs w-full border border-border rounded-md bg-input text-xs shadow-none"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 border border-border text-xs text-muted-foreground shadow-none size-7"
                  >
                    <ListFilter className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
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
            </div>
            <CreateWorkflowDialog projectId={projectId} isCreating={isCreating}>
              <Button className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 dark:border-neutral-300 bg-neutral-800 dark:bg-neutral-100 hover:bg-neutral-700 dark:hover:bg-neutral-300 text-background hover:text-muted cursor-pointer text-xs h-7 px-2.5 py-1">
                <Plus className="size-3.5 mr-1" />
                New Workflow
              </Button>
            </CreateWorkflowDialog>
          </div>
        </CardHeader>
      )}
      <CardContent className="flex flex-col flex-1 h-[calc(100vh-160px)]">
        <div className="flex flex-col flex-1 border rounded-md overflow-hidden">
          <div className=" flex-1 overflow-auto">
            <Table>
              <TableHeader className="[&_tr]:border-b border-border bg-card">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={`px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                            index === 0 ? "text-left" : "text-center"
                          }`}
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

              <TableBody className="bg-card">
                {isLoading ? (
                  <TableSkeletonRows columns={columns.length} rows={6} />
                ) : !isLoading && workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="flex flex-col items-center justify-center h-[260px] gap-2 text-center">
                        <div className="text-sm font-medium text-foreground">
                          No workflows found
                        </div>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Create your first workflow to start building APIs and
                          automations.
                        </p>

                        {mode === "workflows" && (
                          <CreateWorkflowDialog
                            projectId={projectId}
                            isCreating={isCreating}
                          >
                            <Button className="mt-3 justify-start gap-2 text-left font-normal border-2 border-neutral-950 dark:border-neutral-300 bg-neutral-800 dark:bg-neutral-100 hover:bg-neutral-700 dark:hover:bg-neutral-300 text-background hover:text-muted cursor-pointer text-xs h-7 px-2.5 py-1">
                              <Plus className="size-3.5 mr-1" />
                              New Workflow
                            </Button>
                          </CreateWorkflowDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedWorkflowId === row.original._id
                          ? "bg-muted dark:bg-muted border-border "
                          : ""
                      }`}
                      onClick={() => onWorkflowClick(row.original)}
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
                )}
              </TableBody>
            </Table>
          </div>
          <div className="bg-card border-t border-border flex items-center justify-between pr-0 pl-4 pb-1">
            <div className="text-xs text-muted-foreground">
              {table.getPaginationRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} workflows
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
      </CardContent>
    </Card>
  );
}
