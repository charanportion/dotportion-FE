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
  // ChevronDown,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  ChevronRightIcon,
  ChevronLeftIcon,
  ListFilter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { Secret } from "@/lib/api/secrets";
import { CreateSecretDialog } from "@/components/project-dialogs/create-secret-dialog";
import { EditSecretDialog } from "@/components/project-dialogs/edit-secret-dialog";
import { deleteSecret } from "@/lib/redux/slices/secretsSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "./ui/card";
import { format } from "date-fns";

interface SecretsTableProps {
  data: Secret[];
  projectId: string;
  isCreating: boolean;
}

export function SecretsTable({
  data,
  projectId,
  isCreating,
}: SecretsTableProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [editSecretDialogOpen, setEditSecretDialogOpen] = React.useState(false);
  const [secretToEdit, setSecretToEdit] = React.useState<Secret | null>(null);

  const handleDeleteSecret = async (secretId: string) => {
    try {
      await dispatch(deleteSecret({ projectId, secretId })).unwrap();
      toast("Success", {
        description: "Secret deleted successfully",
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

  const columns: ColumnDef<Secret>[] = [
    {
      accessorKey: "provider",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-xs font-medium uppercase tracking-wide text-neutral-600 text-center"
          >
            Provider
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2 pl-2 py-2">
          <span className="font-medium font-sm">
            {row.getValue("provider")?.toString().toUpperCase()}
          </span>
          {/* <Badge variant="outline">{row.getValue("provider")}</Badge> */}
        </div>
      ),
    },
    {
      accessorKey: "data",
      header: "Configuration",
      cell: ({ row }) => {
        const provider = row.getValue("provider") as string;
        return (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {provider === "mongodb"
              ? "Database connection"
              : "JWT configuration"}
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
            className="text-xs font-medium uppercase tracking-wide text-neutral-600 text-center"
          >
            Created
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="flex items-center justify-center gap-2 text-sm">
            {/* {date.toLocaleDateString()} */}
            {format(date, "MMM dd, yyyy")}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "updatedAt",
    //   header: ({ column }) => {
    //     return (
    //       <Button
    //         variant="ghost"
    //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //         className="text-xs font-medium uppercase tracking-wide text-neutral-600 text-center"
    //       >
    //         Updated
    //         {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
    //       </Button>
    //     );
    //   },
    //   cell: ({ row }) => {
    //     const date = new Date(row.getValue("updatedAt"));
    //     return (
    //       <div className="flex items-center justify-center gap-2 text-sm">
    //         {date.toLocaleDateString()}
    //       </div>
    //     );
    //   },
    // },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const secret = row.original;

        return (
          <div className="flex items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-7 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-0 shadow-none">
                <DropdownMenuLabel className="text-xs font-normal px-2 py-1.5">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(secret._id)}
                  className="text-xs px-2 py-1.5"
                >
                  <Copy className="mr-2 size-3.5" />
                  Copy secret ID
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => {
                    setSecretToEdit(secret);
                    setEditSecretDialogOpen(true);
                  }}
                  className="text-xs px-2 py-1.5"
                >
                  <Edit className="mr-2 size-3.5" />
                  Edit secret
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteSecret(secret._id)}
                  className="text-destructive-foreground text-xs px-2 py-1.5"
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete secret
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
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
    <Card className="rounded-none w-full h-full flex flex-col border-none shadow-none py-0 bg-background gap-2">
      <CardHeader className="px-0 mb-2">
        <div className="mb-12">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            Secrets
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your API secrets and credentials
          </p>
        </div>
        <div className="flex w-full items-center justify-between py-0">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search..."
              value={
                (table.getColumn("provider")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("provider")?.setFilterValue(event.target.value)
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
          <CreateSecretDialog projectId={projectId} isCreating={isCreating}>
            <Button className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1">
              <Plus className="size-3.5 mr-1" />
              New Secret
            </Button>
          </CreateSecretDialog>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0 flex-1 flex flex-col">
        <div className="flex flex-col flex-1 border rounded-md overflow-hidden">
          <div className=" flex-1 overflow-auto border-b border-border">
            <Table>
              <TableHeader className="[&_tr]:border-b border-border bg-card">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className="px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground text-center"
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
              <TableBody className="[&_tr]:border-b border-border bg-card">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      // className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border border-muted-foreground"
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                      No secrets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center bg-card boder-t border-border justify-between pr-0 pl-4 pb-1">
            <div className="text-xs text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
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

      {secretToEdit && (
        <EditSecretDialog
          secret={secretToEdit}
          projectId={projectId}
          open={editSecretDialogOpen}
          onOpenChange={(open) => {
            setEditSecretDialogOpen(open);
            if (!open) setSecretToEdit(null);
          }}
        />
      )}
    </Card>
  );
}
