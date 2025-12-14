"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Save,
  X,
  RefreshCcw,
  Inbox,
  Folder,
  Database as DatabaseIcon,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { databaseApi, type DatabaseDocument } from "@/lib/api/database";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PaginationData {
  documents: DatabaseDocument[];
  total?: number;
  page: number;
  limit: number;
}

export default function DatabasePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const secretId = params.secretId as string;
  const isPlatform = searchParams.get("type") === "platform";

  const { user } = useSelector((state: RootState) => state.auth);

  // Collections state
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionSearchTerm, setCollectionSearchTerm] = useState("");

  // Documents state
  const [data, setData] = useState<PaginationData>({
    documents: [],
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState<{
    row: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState<
    Record<string, unknown>
  >({});

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setCollectionsLoading(true);
        let data: string[];

        if (isPlatform) {
          if (!user?.name || !projectId) {
            throw new Error("Missing user or project information");
          }
          data = await databaseApi.getPlatformCollections(user.name, projectId);
        } else {
          data = await databaseApi.getCollections(secretId);
        }

        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch collections"
        );
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchCollections();
  }, [secretId, isPlatform, user, projectId]);

  // Fetch documents when collection is selected
  const fetchDocuments = async (
    page: number = data.page,
    limit: number = data.limit
  ) => {
    if (!selectedCollection) return;

    try {
      setIsLoading(true);
      let result;

      if (isPlatform) {
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        result = await databaseApi.getPlatformDocuments(
          user.name,
          projectId,
          selectedCollection,
          page,
          limit
        );
      } else {
        result = await databaseApi.getDocuments(
          secretId,
          selectedCollection,
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
      toast.error(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCollection) {
      setSearchTerm(""); // Clear search when switching collections
      fetchDocuments(1, 20);
    }
  }, [selectedCollection]);

  // Get all unique fields from documents
  const allFields = Array.from(
    new Set(data.documents.flatMap((doc) => Object.keys(doc)))
  ).filter((field) => field !== "_id");

  // Filter documents based on search term (client-side filtering)
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return data.documents;

    const lowerSearch = searchTerm.toLowerCase();

    return data.documents.filter((doc) => {
      // Search through all fields of the document
      return Object.entries(doc).some(([key, value]) => {
        // Convert value to string for searching
        const stringValue =
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value ?? "");

        return (
          stringValue.toLowerCase().includes(lowerSearch) ||
          key.toLowerCase().includes(lowerSearch)
        );
      });
    });
  }, [data.documents, searchTerm]);

  const filteredCollections = collections.filter((collection) =>
    collection.toLowerCase().includes(collectionSearchTerm.toLowerCase())
  );

  const handleCellEdit = (
    rowIndex: number,
    field: string,
    currentValue: unknown
  ) => {
    // Find the actual document from filtered results
    const doc = filteredDocuments[rowIndex];
    const actualIndex = data.documents.findIndex((d) => d._id === doc._id);

    setEditingCell({ row: actualIndex, field });
    setEditValue(
      typeof currentValue === "object"
        ? JSON.stringify(currentValue, null, 2)
        : String(currentValue ?? "")
    );
  };

  const handleSaveEdit = async () => {
    if (!editingCell || !selectedCollection) return;

    const document = data.documents[editingCell.row];
    const originalValue = document[editingCell.field];
    let parsedValue: unknown = editValue;

    if (typeof originalValue === "boolean") {
      parsedValue = editValue === "true";
    } else if (
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
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        await databaseApi.updatePlatformDocument(
          user.name,
          projectId,
          selectedCollection,
          document._id,
          { [editingCell.field]: parsedValue }
        );
      } else {
        await databaseApi.updateDocument(
          secretId,
          selectedCollection,
          document._id,
          { [editingCell.field]: parsedValue }
        );
      }

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
    if (
      !confirm("Are you sure you want to delete this document?") ||
      !selectedCollection
    )
      return;

    try {
      if (isPlatform) {
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        await databaseApi.deletePlatformDocument(
          user.name,
          projectId,
          selectedCollection,
          documentId
        );
      } else {
        await databaseApi.deleteDocument(
          secretId,
          selectedCollection,
          documentId
        );
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
    if (!selectedCollection) return;

    try {
      setIsCreating(true);
      let newDoc;

      if (isPlatform) {
        if (!user?.name || !projectId) {
          throw new Error("Missing user or project information");
        }
        newDoc = await databaseApi.createPlaformDocument(
          user.name,
          projectId,
          selectedCollection,
          newDocumentData
        );
      } else {
        newDoc = await databaseApi.createDocument(
          secretId,
          selectedCollection,
          newDocumentData
        );
      }

      setData((prev) => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
      }));
      setIsCreateDialogOpen(false);
      setNewDocumentData({});
      setIsCreating(false);
      toast.success("Document created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create document"
      );
      setIsCreating(false);
    }
  };

  const renderCellValue = (
    value: unknown,
    rowIndex: number,
    field: string,
    docId: string
  ) => {
    // Find actual index in data.documents for editing
    const actualIndex = data.documents.findIndex((d) => d._id === docId);
    const isEditing =
      editingCell?.row === actualIndex && editingCell?.field === field;

    if (isEditing) {
      if (field === "_id") {
        return (
          <span className="text-neutral-500 font-mono text-xs">
            {String(value)}
          </span>
        );
      }

      return (
        <div className="flex items-start gap-1.5 min-w-[180px]">
          {typeof value === "boolean" ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-7 flex-1 text-xs bg-white border-neutral-300 shadow-none focus:ring-1 focus:ring-neutral-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true" className="text-xs">
                  true
                </SelectItem>
                <SelectItem value="false" className="text-xs">
                  false
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-7 max-h-24 text-xs bg-neutral-50 border-neutral-300 shadow-none resize-y outline-0 focus-visible:ring-1 focus-visible:ring-neutral-400 py-1 px-2"
              autoFocus
              rows={1}
            />
          )}
          <div className="flex gap-0.5 shrink-0">
            <Button
              size="icon"
              className="h-7 w-7 bg-neutral-900 hover:bg-neutral-700 cursor-pointer shadow-none"
              onClick={handleSaveEdit}
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 bg-neutral-50 border-neutral-300 shadow-none cursor-pointer hover:bg-white"
              onClick={() => setEditingCell(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    if (field === "_id") {
      return (
        <span className="text-neutral-500 font-mono text-xs">
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
        className="cursor-pointer hover:bg-neutral-100 px-2 py-1 rounded text-xs min-h-[24px] transition-colors border border-transparent hover:border-neutral-200"
        onClick={() => handleCellEdit(rowIndex, field, value)}
      >
        {displayValue.length > 50
          ? `${displayValue.substring(0, 50)}...`
          : displayValue || (
              <span className="text-neutral-400 italic">empty</span>
            )}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full bg-background overflow-hidden">
      {/* Left Panel: Collections */}
      <div className="w-64 flex flex-col h-full border-r border-border bg-white shrink-0">
        <div className="border-b border-border flex min-h-12 items-center px-4">
          <h4 className="text-sm font-medium">Database Collections</h4>
        </div>

        <div className="flex-grow overflow-y-auto flex flex-col">
          <div className="flex gap-x-2 items-center sticky top-0 bg-neutral-50 backdrop-blur z-[1] px-4 py-3 border-b border-border">
            <div className="relative h-7 flex-1">
              <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
              <Input
                className="h-7 w-full pl-7 text-xs bg-neutral-100 border border-neutral-300 shadow-none text-neutral-600"
                placeholder="Search Collections"
                value={collectionSearchTerm}
                onChange={(e) => setCollectionSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="px-2 py-2 space-y-0.5">
            <div className="text-xs font-semibold text-muted-foreground px-2 py-2 mb-1 uppercase">
              Collections
            </div>
            {collectionsLoading ? (
              <div className="space-y-1.5 p-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2">
                    <Skeleton className="size-4 shrink-0 rounded-md" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredCollections.length === 0 && collectionSearchTerm ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-neutral-400 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No collections found
                </h3>
                <p className="text-xs max-w-sm">Try adjusting your search.</p>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <Inbox className="size-8 text-neutral-400 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  No collections
                </h3>
                <p className="text-xs max-w-sm">
                  No collections found in this database.
                </p>
              </div>
            ) : (
              filteredCollections.map((collection) => (
                <div
                  key={collection}
                  onClick={() => setSelectedCollection(collection)}
                  className={cn(
                    "h-7 px-4 py-2 cursor-pointer text-xs truncate rounded-md hover:bg-neutral-100 flex items-center gap-2 transition-colors",
                    selectedCollection === collection
                      ? "bg-neutral-100 text-black font-medium"
                      : "text-neutral-700"
                  )}
                >
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{collection}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Data View */}
      <div className="flex-1 h-full flex flex-col bg-white">
        {/* Top Bar */}
        <div className="relative flex w-full h-12 min-h-12 items-center justify-between border-b border-neutral-300 p-3 gap-4">
          <div className="flex flex-row items-center gap-x-2 flex-1 mr-2">
            <div className="relative h-7 min-w-[200px]">
              <Search className="absolute top-1.5 left-2 size-3.5 text-neutral-600" />
              <Input
                className="h-7 w-full pl-7 text-xs shadow-none bg-white border-neutral-300"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              size="icon"
              className="size-7 shadow-none bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-600 hover:text-black"
              onClick={() => fetchDocuments(1)}
              disabled={isLoading || !selectedCollection}
            >
              <RefreshCcw
                className={cn("size-3.5", isLoading && "animate-spin")}
              />
            </Button>
          </div>

          <Button
            size="sm"
            className="h-7 gap-2 text-xs"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!selectedCollection}
          >
            <Plus className="size-3.5" />
            Add Document
          </Button>

          {isLoading && (
            <div className="absolute bottom-[-1px] left-0 w-full h-[2px] overflow-hidden z-10">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0) 0%, #000 50%, rgba(0,0,0,0) 100%)",
                  animation: "border-trail 1.5s ease-in-out infinite",
                  transform: "scaleX(2)",
                  transformOrigin: "left",
                }}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {!selectedCollection ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <DatabaseIcon className="size-12 text-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                No collection selected
              </h3>
              <p className="text-sm text-center max-w-sm">
                Select a collection from the left to view and manage documents.
              </p>
            </div>
          ) : data.documents.length === 0 && !isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <Inbox className="size-12 text-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                No documents
              </h3>
              <p className="text-sm text-center max-w-sm">
                This collection is empty. Add your first document to get
                started.
              </p>
            </div>
          ) : filteredDocuments.length === 0 && searchTerm ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <div className="bg-neutral-100 rounded-full p-6 mb-4">
                <Search className="size-12 text-neutral-400" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-sm text-center max-w-sm">
                No documents match &quot;{searchTerm}&quot;. Try a different
                search term.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto bg-neutral-50">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white [&_tr]:border-b-0">
                    <TableRow className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border">
                      <TableHead className="w-48 text-left text-xs">
                        ID
                      </TableHead>
                      {allFields.map((field) => (
                        <TableHead
                          key={field}
                          className="min-w-32 text-center text-xs uppercase"
                        >
                          {field}
                        </TableHead>
                      ))}
                      <TableHead className="w-24 text-center text-xs uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr]:border-b-0">
                    {filteredDocuments.map((doc, index) => (
                      <TableRow
                        key={doc._id}
                        className="relative after:content-[''] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-px after:bg-border"
                      >
                        <TableCell className="font-mono text-xs">
                          {renderCellValue(doc._id, index, "_id", doc._id)}
                        </TableCell>
                        {allFields.map((field) => (
                          <TableCell key={field} className="text-center">
                            {renderCellValue(doc[field], index, field, doc._id)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={() => handleDelete(doc._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer Pagination */}
              <div className="h-9 border-t border-neutral-300 bg-white flex items-center justify-between px-4 py-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs border-neutral-300"
                    onClick={() => fetchDocuments(data.page - 1)}
                    disabled={data.page <= 1 || isLoading}
                  >
                    <ChevronLeft className="size-3.5" />
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    Page {data.page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs border-neutral-300"
                    onClick={() => fetchDocuments(data.page + 1)}
                    disabled={data.documents.length < data.limit || isLoading}
                  >
                    Next
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {searchTerm ? (
                    <>
                      Showing {filteredDocuments.length} of{" "}
                      {data.documents.length} loaded
                    </>
                  ) : (
                    <>Showing {data.total || 0} results</>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-neutral-300 p-4">
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium">
              Create New Document
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-neutral-500">
              Add a new document to the {selectedCollection} collection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto p-1">
            {allFields.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="text-sm font-inter">
                  {field}
                </Label>
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
                  className="px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="newField" className="text-sm font-inter">
                Add New Field
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Field name"
                  id="newFieldName"
                  className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                />
                <Input
                  placeholder="Field value"
                  id="newFieldValue"
                  className="h-8 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg font-inter text-neutral-800 text-xs"
                />
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
              className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-neutral-800 cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="justify-start gap-2 text-left font-normal border-2 border-neutral-950 bg-neutral-800 hover:bg-neutral-700 text-white hover:text-white cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              {isCreating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Create Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes border-trail {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
      `}</style>
    </div>
  );
}
