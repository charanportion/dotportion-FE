"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Trash2,
  Save,
  X,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { toast } from "sonner";
import { databaseApi } from "@/lib/api/database";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";

interface Document {
  _id: string;
  [key: string]: unknown;
}

interface PaginationData {
  documents: Document[];
  total?: number;
  page: number;
  limit: number;
}

export default function CollectionDataPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const secretId = params.secretId as string;
  const collectionName = params.collectionName as string;
  const isPlatform = searchParams.get("type") === "platform";

  const { user } = useSelector((state: RootState) => state.auth);

  const [data, setData] = useState<PaginationData>({
    documents: [],
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<{
    row: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState<
    Record<string, unknown>
  >({});

  // Get all unique fields from documents
  const allFields = Array.from(
    new Set(data.documents.flatMap((doc) => Object.keys(doc)))
  ).filter((field) => field !== "_id");

  const fetchData = async (
    page: number = data.page,
    limit: number = data.limit
  ) => {
    try {
      setIsLoading(true);
      let result;

      if (isPlatform) {
        // Call platform API
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        result = await databaseApi.getPlatformDocuments(
          user.name,
          projectId,
          collectionName,
          page,
          limit
        );
      } else {
        // Call external database API
        result = await databaseApi.getDocuments(
          secretId,
          collectionName,
          page,
          limit
        );
      }

      setData({
        documents: result.documents || [],
        total: result.pagination.totalDocuments,
        page,
        limit,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [secretId, collectionName, isPlatform, user, projectId]);

  const handleCellEdit = (
    rowIndex: number,
    field: string,
    currentValue: unknown
  ) => {
    setEditingCell({ row: rowIndex, field });
    setEditValue(
      typeof currentValue === "object"
        ? JSON.stringify(currentValue, null, 2)
        : String(currentValue ?? "")
    );
  };

  const getValueType = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "object") return "object";
    return "string";
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const document = data.documents[editingCell.row];
    const originalValue = document[editingCell.field];
    let parsedValue: unknown = editValue;

    // Convert back to boolean if original value was boolean
    if (typeof originalValue === "boolean") {
      parsedValue = editValue === "true";
    }
    // Try to parse JSON for objects/arrays
    else if (
      editValue.trim().startsWith("{") ||
      editValue.trim().startsWith("[")
    ) {
      try {
        parsedValue = JSON.parse(editValue);
      } catch {
        // Keep as string if JSON parsing fails
      }
    }

    try {
      if (isPlatform) {
        // Call platform API
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        await databaseApi.updatePlatformDocument(
          user.name,
          projectId,
          collectionName,
          document._id,
          { [editingCell.field]: parsedValue }
        );
      } else {
        // Call external database API
        await databaseApi.updateDocument(
          secretId,
          collectionName,
          document._id,
          {
            [editingCell.field]: parsedValue,
          }
        );
      }

      // Update local state
      const updatedDocuments = [...data.documents];
      updatedDocuments[editingCell.row] = {
        ...updatedDocuments[editingCell.row],
        [editingCell.field]: parsedValue,
      };
      setData((prev) => ({ ...prev, documents: updatedDocuments }));

      setEditingCell(null);
      toast.success("Document updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update document"
      );
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      if (isPlatform) {
        // Call platform API
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        await databaseApi.deletePlatformDocument(
          user.name,
          projectId,
          collectionName,
          documentId
        );
      } else {
        // Call external database API
        await databaseApi.deleteDocument(secretId, collectionName, documentId);
      }

      setData((prev) => ({
        ...prev,
        documents: prev.documents.filter((doc) => doc._id !== documentId),
      }));
      toast.success("Document deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete document"
      );
    }
  };

  const handleCreate = async () => {
    try {
      let newDoc;

      if (isPlatform) {
        // Call platform API
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        newDoc = await databaseApi.createPlaformDocument(
          user.name,
          projectId,
          collectionName,
          newDocumentData
        );
      } else {
        // Call external database API
        newDoc = await databaseApi.createDocument(
          secretId,
          collectionName,
          newDocumentData
        );
      }

      setData((prev) => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
      }));
      setIsCreateDialogOpen(false);
      setNewDocumentData({});
      toast.success("Document created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create document"
      );
    }
  };

  const filteredDocuments = data.documents.filter((doc) =>
    Object.values(doc).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const renderCellValue = (value: unknown, rowIndex: number, field: string) => {
    const isEditing =
      editingCell?.row === rowIndex && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {field === "_id" ? (
            <span className="text-gray-500 font-mono text-sm">
              {String(value)}
            </span>
          ) : getValueType(value) === "boolean" ? (
            <>
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCell(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCell(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }

    if (field === "_id") {
      return (
        <span className="text-gray-500 font-mono text-sm flex items-center justify-center">
          {String(value)}
        </span>
      );
    }

    const displayValue =
      typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : String(value ?? "");

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[24px] flex items-center justify-center"
        onClick={() => handleCellEdit(rowIndex, field, value)}
      >
        {displayValue.length > 50
          ? `${displayValue.substring(0, 50)}...`
          : displayValue}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600 text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 pt-2 pb-0 bg-background overflow-hidden">
      {/* Back Button */}
      {/* <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/projects/${projectId}/database/${secretId}${isPlatform ? "?type=platform" : ""}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
      </div> */}

      {/* Header */}
      <div className="flex items-center justify-between py-2 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            {collectionName}
          </h2>
          {/* <p className="text-gray-600 mt-1">
            {data.documents.length} document
            {data.documents.length !== 1 ? "s" : ""}
          </p> */}
        </div>
        {/* Search and Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={String(data.limit)}
            onValueChange={(value) => {
              const newLimit = Number.parseInt(value);
              setData((prev) => ({ ...prev, limit: newLimit }));
              fetchData(1, newLimit);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Add a new document to the {collectionName} collection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                {allFields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field}</Label>
                    <Textarea
                      id={field}
                      placeholder={`Enter ${field}...`}
                      value={String(newDocumentData[field] || "")}
                      onChange={(e) =>
                        setNewDocumentData((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="newField">Add New Field</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Field name" id="newFieldName" />
                    <Input placeholder="Field value" id="newFieldValue" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const nameInput = document.getElementById(
                          "newFieldName"
                        ) as HTMLInputElement;
                        const valueInput = document.getElementById(
                          "newFieldValue"
                        ) as HTMLInputElement;
                        if (nameInput.value && valueInput.value) {
                          setNewDocumentData((prev) => ({
                            ...prev,
                            [nameInput.value]: valueInput.value,
                          }));
                          nameInput.value = "";
                          valueInput.value = "";
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Data Table */}
      <Card className="w-full flex-1 min-h-0 flex flex-col shadow-none py-0 mt-2 bg-background gap-2">
        <CardContent className="p-0 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600">No documents found</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className=" sticky top-0 z-10 [&_tr]:border-b-0">
                    <TableRow className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border border-muted-foreground">
                      <TableHead className="w-48 text-left">ID</TableHead>
                      {allFields.map((field) => (
                        <TableHead key={field} className="min-w-32 text-center">
                          {field}
                        </TableHead>
                      ))}
                      <TableHead className="w-24 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr]:border-b-0">
                    {filteredDocuments.map((doc, index) => (
                      <TableRow
                        key={doc._id}
                        className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border border-muted-foreground"
                      >
                        <TableCell className="font-mono text-sm">
                          {renderCellValue(doc._id, index, "_id")}
                        </TableCell>
                        {allFields.map((field) => (
                          <TableCell key={field}>
                            {renderCellValue(doc[field], index, field)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(doc._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-between pr-0 pl-4 py-2 shrink-0">
                <div className="text-xs text-muted-foreground">
                  {/* Showing {(data.page - 1) * data.limit + 1} to{" "}
                  {Math.min(data.page * data.limit, filteredDocuments.length)}{" "}
                  of {filteredDocuments.length} results */}
                  Showing {(data.page - 1) * data.limit + 1} to{" "}
                  {(data.page - 1) * data.limit + data.documents.length} of{" "}
                  {data.total} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none shadow-none text-muted-foreground text-xs"
                    onClick={() => fetchData(data.page - 1)}
                    disabled={data.page <= 1}
                  >
                    <ChevronLeftIcon /> Previous
                  </Button>
                  <p className="flex-1 text-xs text-muted-foreground">/</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none shadow-none text-muted-foreground text-xs"
                    onClick={() => fetchData(data.page + 1)}
                    disabled={filteredDocuments.length < data.limit}
                  >
                    Next <ChevronRightIcon />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {(data.page - 1) * data.limit + 1} to{" "}
          {Math.min(data.page * data.limit, filteredDocuments.length)} of{" "}
          {filteredDocuments.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(data.page - 1)}
            disabled={data.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Badge variant="outline">{data.page}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(data.page + 1)}
            disabled={filteredDocuments.length < data.limit}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div> */}
    </div>
  );
}
