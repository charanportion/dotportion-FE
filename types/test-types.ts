export interface TestData {
  body: Record<string, unknown>;
  query: Record<string, string>;
  headers: Record<string, string>;
  statusCode?: number;
  error?: string;
  method?: string;
  path?: string;
  parameters?: Record<string, string>;
  [key: string]: unknown;
}
