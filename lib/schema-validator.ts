import type { ErrorObject } from "ajv";

interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
}

interface ValidationErrorParams {
  missingProperty?: string;
  type?: string;
  limit?: number;
  pattern?: string;
  format?: string;
  allowedValues?: unknown[];
}

interface ExtendedErrorObject extends ErrorObject {
  instancePath: string;
}

export async function validateJsonSchema(
  schema: Record<string, unknown>,
  data: unknown
): Promise<ValidationResult> {
  try {
    // Use Ajv for validation
    const Ajv = (await import("ajv")).default;
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      return {
        valid: false,
        errors: validate.errors || [],
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("Schema validation error:", error);
    return {
      valid: false,
      errors: [
        {
          message:
            error instanceof Error ? error.message : "Unknown validation error",
        } as ErrorObject,
      ],
    };
  }
}

export function formatValidationErrors(errors: ErrorObject[]): string {
  if (!errors || errors.length === 0) return "Unknown validation error";

  return errors
    .map((err) => {
      const extendedErr = err as ExtendedErrorObject;
      const path = extendedErr.instancePath || "";
      const params = err.params as ValidationErrorParams;
      const property = params.missingProperty
        ? `/${params.missingProperty}`
        : "";
      const fullPath = `${path}${property}`;

      switch (err.keyword) {
        case "required":
          return `Missing required property: ${params.missingProperty}`;
        case "type":
          return `${fullPath}: should be ${params.type}`;
        case "minimum":
          return `${fullPath}: should be >= ${params.limit}`;
        case "maximum":
          return `${fullPath}: should be <= ${params.limit}`;
        case "minLength":
          return `${fullPath}: should have minimum length of ${params.limit}`;
        case "maxLength":
          return `${fullPath}: should have maximum length of ${params.limit}`;
        case "pattern":
          return `${fullPath}: does not match pattern "${params.pattern}"`;
        case "format":
          return `${fullPath}: should match format "${params.format}"`;
        case "enum":
          return `${fullPath}: should be one of [${params.allowedValues?.join(
            ", "
          )}]`;
        default:
          return err.message || "Unknown validation error";
      }
    })
    .join("\n");
}
