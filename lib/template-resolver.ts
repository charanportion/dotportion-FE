/**
 * Resolves template strings in the format ${variable.path}
 * @param template The template string containing variables to resolve
 * @param data The data object containing values to substitute
 * @returns The resolved string with variables replaced by their values
 */
export function resolveTemplateString(
  template: string,
  data: Record<string, unknown> | unknown
): string {
  if (!template) return template;

  // Regular expression to match ${variable.path} patterns
  const regex = /\${([^}]+)}/g;

  return template.replace(regex, (match, path) => {
    try {
      // Split the path by dots to navigate the object
      const parts = path.trim().split(".");
      let value = data;

      // Navigate through the object following the path
      for (const part of parts) {
        if (value === undefined || value === null) {
          return match; // Keep original if path doesn't exist
        }
        if (typeof value === "object" && value !== null) {
          value = (value as Record<string, unknown>)[part];
        } else {
          return match;
        }
      }

      // Return the value or the original match if undefined
      if (value === undefined) return match;
      if (value === null) return "null";

      // Handle different types appropriately
      if (typeof value === "object") {
        return JSON.stringify(value);
      } else {
        return String(value);
      }
    } catch (error) {
      console.error("Error resolving template:", error);
      return match; // Keep original on error
    }
  });
}
