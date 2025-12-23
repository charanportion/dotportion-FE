import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { updateSecret } from "@/lib/redux/slices/secretsSlice";
import { toast } from "sonner";
import type { Secret } from "@/lib/api/secrets";
import { LoaderCircle } from "lucide-react";

interface EditSecretDialogProps {
  secret: Secret;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSecretDialog({
  secret,
  projectId,
  open,
  onOpenChange,
}: EditSecretDialogProps) {
  const [provider, setProvider] = useState<"mongodb" | "jwt">(secret.provider);
  const [uri, setUri] = useState(secret.data.uri || "");
  const [jwtSecret, setJwtSecret] = useState(secret.data.secret || "");
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(
        updateSecret({
          projectId,
          secretId: secret._id,
          data: {
            provider,
            data:
              provider === "mongodb"
                ? { uri: uri.trim() }
                : { secret: jwtSecret.trim() },
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Secret updated successfully",
        className: "bg-green-500 text-white",
      });
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-border p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] font-medium text-foreground">
              Edit Secret
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
              Update the secret configuration below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="provider" className="text-sm font-inter">
                Provider
              </Label>
              <Select
                value={provider}
                disabled
                onValueChange={(value: "mongodb" | "jwt") => setProvider(value)}
              >
                <SelectTrigger className="w-full px-3 py-2 bg-input border border-border shadow-none rounded-lg font-inter  text-xs h-7">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="jwt">JWT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {provider === "mongodb" && (
              <div className="grid gap-2">
                <Label htmlFor="uri" className="text-sm font-inter">
                  MongoDB URI
                </Label>
                <Input
                  id="uri"
                  type="text"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                  placeholder="mongodb+srv://..."
                  required
                  className="h-8 px-3 py-2 bg-input border border-border shadow-none rounded-lg font-inter  text-xs"
                />
              </div>
            )}
            {provider === "jwt" && (
              <div className="grid gap-2">
                <Label htmlFor="jwtSecret" className="text-sm font-inter">
                  JWT Secret
                </Label>
                <Input
                  id="jwtSecret"
                  type="text"
                  value={jwtSecret}
                  onChange={(e) => setJwtSecret(e.target.value)}
                  placeholder="Enter JWT secret"
                  required
                  className="h-8 px-3 py-2 bg-input border border-border shadow-none rounded-lg font-inter  text-xs"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-muted-foreground cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              {isSaving ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
