"use client";

import type { Node } from "@xyflow/react";
import { useState, useEffect } from "react";
import type { NodeData } from "@/types/node-types";
import { type NodeConfig, nodeConfigSchema } from "@/schemas/nodeConfigSchema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JwtGenerateForm } from "./config-forms/JwtGenerateForm";
import { Form } from "./ui/form";
import { Button } from "./ui/button";
import { JwtVerifyForm } from "./config-forms/JwtVerifyForm";
import { LogicForm } from "./config-forms/LogicForm";
import { ApiStartForm } from "./config-forms/ApiStartForm";
import { ResponseForm } from "./config-forms/ResponseForm";
import { ParameterForm } from "./config-forms/ParameterForm";
import { DatabaseForm } from "./config-forms/DatabaseForm";
import { ConditionForm } from "./config-forms/ConditionForm";
import { LoopForm } from "./config-forms/LoopForm";
import { MongoDbForm } from "./config-forms/MongoDbForm";
import { X } from "lucide-react";

interface NodeConfigPanelProps {
  node: Node<NodeData> | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
}

export function NodeConfigPanelNew({
  node,
  onClose,
  onUpdate,
}: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<Partial<NodeData>>(node?.data || {});
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<NodeConfig>({
    resolver: zodResolver(nodeConfigSchema),
  });

  useEffect(() => {
    if (node) {
      if (node.type) {
        methods.setValue(
          "type",
          node.type as
            | "apiStart"
            | "logic"
            | "jwtGenerate"
            | "jwtVerify"
            | "response"
            | "parameters"
            | "database"
            | "mongodb"
            | "condition"
            | "loop"
        );
      }
      if (node.type === "jwtGenerate") {
        const jwtData = node.data;
        methods.setValue("secretType", jwtData.type || "");
        methods.setValue("payload", JSON.stringify(jwtData.payload || {}));
        methods.setValue("expiresIn", jwtData.expiresIn || "");
      } else if (node.type === "jwtVerify") {
        const jwtData = node.data;
        methods.setValue("secretType", jwtData.type || "");
      } else if (node.type === "logic") {
        const logicData = node.data;
        if (logicData) {
          methods.setValue("code", logicData.code || "");
        }
      } else if (node.type === "response") {
        const jwtData = node?.data;
        if (jwtData) {
          methods.setValue("status", (jwtData.status || "").toString());
        }
      } else if (node.type === "parameters") {
        const paramData = node.data;
        if (paramData) {
          methods.setValue("sources", paramData.sources || []);
        }
      } else if (node.type === "apiStart") {
        methods.setValue(
          "method",
          (node.data.method || "GET") as "GET" | "POST" | "PUT" | "DELETE"
        );
        methods.setValue("path", node.data.path || "");
      } else if (node.type === "database") {
        const dbData = node.data;
        if (dbData) {
          methods.setValue("provider", dbData.provider || "");
          methods.setValue("collection", dbData.collection || "");
          methods.setValue(
            "operation",
            (dbData.operation as "findOne" | "updateOne" | "insertOne") || ""
          );
          const cleanQuery = Object.fromEntries(
            Object.entries(dbData.query || {}).filter(
              ([, v]) => v !== undefined
            )
          ) as Record<string, string | number | boolean>;
          const cleanData = Object.fromEntries(
            Object.entries(dbData.data || {}).filter(([, v]) => v !== undefined)
          ) as Record<string, string | number | boolean>;
          methods.setValue("query", cleanQuery);
          methods.setValue("data", cleanData);
        }
      } else if (node.type === "mongodb") {
        const dbData = node.data;
        if (dbData) {
          methods.setValue("provider", dbData.provider || "");
          methods.setValue("collection", dbData.collection || "");
          methods.setValue(
            "operation",
            (dbData.operation as "findOne" | "updateOne" | "insertOne") || ""
          );
          const cleanQuery = Object.fromEntries(
            Object.entries(dbData.query || {}).filter(
              ([, v]) => v !== undefined
            )
          ) as Record<string, string | number | boolean>;
          const cleanData = Object.fromEntries(
            Object.entries(dbData.data || {}).filter(([, v]) => v !== undefined)
          ) as Record<string, string | number | boolean>;
          methods.setValue("query", cleanQuery);
          methods.setValue("data", cleanData);
        }
      } else if (node.type === "condition") {
        methods.setValue("condition", node.data.condition || "");
      } else if (node.type === "loop") {
        methods.setValue("items", node.data.items || "");
      }
    }
  }, [node, methods]);

  const type = methods.watch("type");

  const renderFormFields = () => {
    switch (type) {
      case "apiStart":
        return <ApiStartForm />;
      case "logic":
        return <LogicForm nodeId={node?.id} />;
      case "jwtGenerate":
        return <JwtGenerateForm />;
      case "jwtVerify":
        return <JwtVerifyForm />;
      case "response":
        return <ResponseForm />;
      case "parameters":
        return <ParameterForm />;
      case "database":
        return <DatabaseForm nodeId={node?.id} />;
      case "mongodb":
        return <MongoDbForm nodeId={node?.id} />;
      case "condition":
        return <ConditionForm nodeId={node?.id} />;
      case "loop":
        return <LoopForm nodeId={node?.id} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  const handleSubmit = async (e: NodeConfig) => {
    if (isSaving || !node) return;

    try {
      setIsSaving(true);
      if (e.type === "jwtGenerate") {
        const payload = JSON.parse(e.payload);
        const secretType = e.secretType;
        const expiresIn = e.expiresIn;

        const updatedData: Partial<NodeData> = {
          ...formData,
          type: secretType,
          expiresIn,
          payload,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "jwtVerify") {
        const secretType = e.secretType;
        const updatedData: Partial<NodeData> = {
          ...formData,
          type: secretType,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "logic") {
        const code = e.code;
        const updatedData: Partial<NodeData> = {
          ...formData,
          code,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "apiStart") {
        const method = e.method;
        const path = e.path;
        const updatedData: Partial<NodeData> = {
          ...formData,
          method: method,
          path: path,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "response") {
        const status = e.status;
        const updatedData: Partial<NodeData> = {
          ...formData,
          status: Number.parseInt(status),
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "parameters") {
        const sources = e.sources;

        const updatedData: Partial<NodeData> = {
          ...formData,
          sources,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "database") {
        const provider = e.provider;
        const collection = e.collection;
        const operation =
          typeof e.operation === "string"
            ? (e.operation as "findOne" | "updateOne" | "insertOne")
            : e.operation;
        const query = Object.fromEntries(
          Object.entries(e.query || {}).filter(
            ([, value]) => value !== undefined
          )
        ) as Record<string, string | string | number | boolean>;
        const data = Object.fromEntries(
          Object.entries(e.data || {}).filter(
            ([, value]) => value !== undefined
          )
        ) as Record<string, string | string | number | boolean>;
        const updatedData: Partial<NodeData> = {
          ...formData,
          provider,
          collection,
          operation,
          query,
          data,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "mongodb") {
        const provider = e.provider;
        const collection = e.collection;
        const operation =
          typeof e.operation === "string"
            ? (e.operation as "findOne" | "updateOne" | "insertOne")
            : e.operation;
        const query = Object.fromEntries(
          Object.entries(e.query || {}).filter(
            ([, value]) => value !== undefined
          )
        ) as Record<string, string | string | number | boolean>;
        const data = Object.fromEntries(
          Object.entries(e.data || {}).filter(
            ([, value]) => value !== undefined
          )
        ) as Record<string, string | string | number | boolean>;
        const updatedData: Partial<NodeData> = {
          ...formData,
          provider,
          collection,
          operation,
          query,
          data,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "loop") {
        const items = e.items;
        const updatedData: Partial<NodeData> = {
          ...formData,
          items: items,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      } else if (e.type === "condition") {
        const condition = e.condition;
        const updatedData: Partial<NodeData> = {
          ...formData,
          condition,
        };
        setFormData(updatedData);
        onUpdate(node.id, updatedData);
      }
      // Simulate saving for UX feedback
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to save node config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!node) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-12 border-b border-neutral-300 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            Configure Node
          </h2>
          <span className="px-2 py-0.5 text-[10px] rounded bg-neutral-100 border border-neutral-300 text-neutral-600">
            {node.data.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <Form {...methods}>
          <FormProvider {...methods}>
            <form
              id="node-config-form"
              onSubmit={methods.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {renderFormFields()}
            </form>
          </FormProvider>
        </Form>
      </div>

      <div className="flex items-center justify-end gap-2 px-4 h-14 border-t border-neutral-300 bg-neutral-50 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8 px-3 text-xs border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-600 hover:text-black shadow-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="node-config-form"
          size="sm"
          disabled={isSaving}
          className="h-8 px-3 text-xs shadow-none"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
