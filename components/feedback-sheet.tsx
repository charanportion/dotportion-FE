"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { submitFeedback } from "@/lib/redux/slices/feedbackSlice";
import { toast } from "sonner";

export default function FeedbackSheet() {
  const dispatch = useAppDispatch();

  const { loading } = useAppSelector((state) => state.feedback);
  const { user } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.projects);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [service, setService] = useState<
    | "none"
    | "db"
    | "auth"
    | "schemacanvas"
    | "logs"
    | "workflows"
    | "secrets"
    | "dashboard"
    | "apidocs"
    | "settings"
    | "account"
  >("none");
  const [issueType, setIssueType] = useState<
    | "none"
    | "db"
    | "auth"
    | "schemacanvas"
    | "logs"
    | "workflows"
    | "secrets"
    | "dashboard"
    | "apidocs"
    | "settings"
    | "account"
    | ""
  >("");
  const [subject, setSubject] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [severity, setSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSupportSubmit = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    if (!issueType) {
      toast.error("Please select the issue category");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!messageValue.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    dispatch(
      submitFeedback({
        type: "issue",
        message: messageValue.trim(),
        subject,
        severity,
        project: selectedProjectId,
        service,
      })
    )
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        setSubject("");
        setMessageValue("");
      })
      .catch((err) => toast.error(err || "Failed to submit"));
  };

  return (
    <div className="mx-auto my-16 max-w-2xl w-full px-4 lg:px-6">
      <div className="flex flex-col gap-y-8">
        {/* Card */}
        <div className="bg-card min-w-full w-full shadow-xs rounded-lg py-8 space-y-12 border border-neutral-100">
          <div className="flex flex-col gap-y-6">
            {/* Title */}
            <h2 className="text-xl font-semibold px-6">How can we help?</h2>

            {/* PROJECT SELECT */}
            <div className="px-6 flex flex-col gap-y-2">
              <Label className="text-sm font-medium">
                Which project is affected?
              </Label>

              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProjectId && (
                <div className="flex items-center gap-x-1 h-auto">
                  <p className="text-sm text-muted-foreground">
                    Project ID:
                    <code className="text-muted-foreground ml-1">
                      {selectedProjectId}
                    </code>
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(selectedProjectId)}
                    className="text-xs text-muted-foreground px-1 py-1 h-6.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* ISSUE TYPE + SEVERITY */}
              <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-4">
                {/* Issue Category */}
                <div>
                  <Label className="text-sm font-medium">
                    What are you having issues with?
                  </Label>

                  <Select
                    value={issueType}
                    onValueChange={(value) =>
                      setIssueType(
                        value as
                          | "none"
                          | "db"
                          | "auth"
                          | "schemacanvas"
                          | "logs"
                          | "workflows"
                          | "secrets"
                          | "dashboard"
                          | "apidocs"
                          | "settings"
                          | "account"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="db">Database</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="schemacanvas">SchemCanvas</SelectItem>
                      <SelectItem value="logs">Logs</SelectItem>
                      <SelectItem value="workflows">Workflows</SelectItem>
                      <SelectItem value="secrets">Secrets</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="apidocs">API Docs</SelectItem>
                      <SelectItem value="settings">Project Settings</SelectItem>
                      <SelectItem value="account">
                        Account Preferences
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity */}
                <div>
                  <Label className="text-sm font-medium">Severity</Label>

                  <Select
                    value={severity}
                    onValueChange={(value) =>
                      setSeverity(
                        value as "low" | "medium" | "high" | "critical"
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            <div className="px-6 flex flex-col gap-y-8">
              {/* Subject */}
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Input
                  placeholder="Summary of the problem you have"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Service */}
              <div>
                <Label className="text-sm font-medium">
                  Which services are affected?
                </Label>

                <Select
                  value={service}
                  onValueChange={(value) =>
                    setService(
                      value as
                        | "none"
                        | "db"
                        | "auth"
                        | "schemacanvas"
                        | "logs"
                        | "workflows"
                        | "secrets"
                        | "dashboard"
                        | "apidocs"
                        | "settings"
                        | "account"
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No particular service</SelectItem>
                    <SelectItem value="db">Database</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="schemacanvas">SchemCanvas</SelectItem>
                    <SelectItem value="logs">Logs</SelectItem>
                    <SelectItem value="workflows">Workflows</SelectItem>
                    <SelectItem value="secrets">Secrets</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="apidocs">API Docs</SelectItem>
                    <SelectItem value="settings">Project Settings</SelectItem>
                    <SelectItem value="account">Account Preferences</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium">
                  Message{" "}
                  <span className="text-muted-foreground text-xs">
                    (5000 character limit)
                  </span>
                </Label>
                <Textarea
                  className="h-36"
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  placeholder="Describe the issue you're facing..."
                />
              </div>
            </div>

            <Separator />

            {/* SUBMIT */}
            <div className="px-6 pt-2">
              <div className="flex flex-col items-end gap-3">
                <Button
                  onClick={handleSupportSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center h-10.5 bg-accent-foreground text-accent text-base px-4 py-2"
                >
                  <Mail className="mr-2" />{" "}
                  {loading ? "Sending..." : "Send support request"}
                </Button>

                {/* Email Info */}
                <div className="flex flex-col items-end gap-1">
                  <div className="space-x-1 text-xs">
                    <span className="text-muted-foreground">
                      We will contact you at
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {user?.email}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    Please ensure emails from dotportion.com are allowed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HELP SECTION */}
        <div className="block bg-card w-full rounded-lg border border-neutral-100 shadow-xs py-3">
          <div className="flex flex-col px-4">
            <h5 className="text-foreground">Having trouble submitting?</h5>

            <p className="flex items-center gap-x-1 text-sm mt-3">
              Email us directly at{" "}
              <a
                href="mailto:support@dotportion.com"
                className="underline font-mono"
              >
                support@dotportion.com
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy("support@dotportion.com")}
                className="text-xs text-muted-foreground px-1 py-1 h-6.5"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </p>

            <p className="text-sm text-muted-foreground mt-2">
              Please include your project ID and as much information as
              possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
