"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createSecret } from "@/lib/redux/slices/secretsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface CreateSecretDialogProps {
  projectId: string;
  isCreating?: boolean;
  children: React.ReactNode;
}

export function CreateSecretDialog({
  projectId,
  isCreating = false,
  children,
}: CreateSecretDialogProps) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"mongodb" | "jwt">("mongodb");
  const [uri, setUri] = useState("");
  const [secret, setSecret] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (provider === "mongodb" && !uri.trim()) {
      toast("Error", {
        description: "MongoDB URI is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    if (provider === "jwt" && !secret.trim()) {
      toast("Error", {
        description: "JWT secret is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await dispatch(
        createSecret({
          projectId,
          data: {
            provider,
            data:
              provider === "mongodb"
                ? { uri: uri.trim() }
                : { secret: secret.trim() },
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Secret created successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      setUri("");
      setSecret("");
      setProvider("mongodb");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast("Error", {
        description: errorMessage,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-border p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 font-inter text-[16px] text-foreground font-medium">
              Create New Secret
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 font-inter text-xs text-muted-foreground">
              Add a new secret configuration to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="provider" className="text-sm font-inter">
                Provider
              </Label>
              <Select
                value={provider}
                onValueChange={(value: "mongodb" | "jwt") => setProvider(value)}
              >
                <SelectTrigger className="w-full px-3 py-2 bg-input border border-border shadow-none rounded-lg font-inter text-xs h-7">
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
                  // type="password"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                  placeholder="mongodb+srv://..."
                  className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter text-xs"
                  required
                />
              </div>
            )}
            {provider === "jwt" && (
              <div className="grid gap-2">
                <Label htmlFor="secret" className="text-sm font-inter">
                  JWT Secret
                </Label>
                <Input
                  id="secret"
                  // type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter JWT secret"
                  className="h-8 px-3 py-2 bg-input border border-border rounded-lg font-inter text-xs"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="justify-start shadow-none gap-2 text-left font-normal border-2 border-neutral-300 bg-white hover:bg-neutral-100 text-muted-foreground cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="justify-start gap-2 text-left font-normal  cursor-pointer text-xs h-7 px-2.5 py-1"
            >
              {isCreating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
