import fs from "fs";
import path from "path";

export interface ContentData {
  path: string;
  title: string;
  description: string;
  content: any[];
}

export async function getContentByPath(
  slug: string
): Promise<ContentData | null> {
  try {
    const contentPath =
      slug === "" ? "home" : slug.replace(/^\//, "").replace(/\//g, "-");
    const filePath = path.join(
      process.cwd(),
      "data",
      "content",
      `${contentPath}.json`
    );

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    const data: ContentData = JSON.parse(fileContent);

    return data;
  } catch (error) {
    console.error("Error loading content:", error);
    return null;
  }
}

export async function getAllContentPaths(): Promise<string[]> {
  try {
    const contentDir = path.join(process.cwd(), "data", "content");
    const files = fs.readdirSync(contentDir);

    return files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""))
      .filter((file) => file !== "home"); // Exclude home as it's handled by the root route
  } catch (error) {
    console.error("Error getting content paths:", error);
    return [];
  }
}
