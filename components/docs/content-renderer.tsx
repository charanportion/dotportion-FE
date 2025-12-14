import Image from "next/image";
import { CodeBlock } from "./code-block";
import Link from "next/link";
import type { JSX } from "react";

interface ContentItem {
  type: string;
  level?: number;
  text?: string;
  items?: ContentItem[]; // can contain child items like links
  title?: string;
  language?: string;
  code?: string;
  variant?: string;
  href?: string; // for links
  src?: string; // for images
  alt?: string; // for images
}

interface ContentRendererProps {
  content: ContentItem[];
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const renderContent = (item: ContentItem, index: number) => {
    switch (item.type) {
      case "heading": {
        const HeadingTag = `h${item.level}` as keyof JSX.IntrinsicElements;
        const headingId =
          item.text
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || "";

        return (
          <HeadingTag
            key={index}
            id={headingId}
            className={`scroll-mt-20 ${
              item.level === 1
                ? "text-4xl font-bold mb-6"
                : item.level === 2
                ? "text-3xl font-semibold mb-4 mt-8"
                : item.level === 3
                ? "text-2xl font-semibold mb-3 mt-6"
                : item.level === 4
                ? "text-xl font-semibold mb-2 mt-4"
                : "text-lg font-semibold mb-2 mt-3"
            }`}
          >
            {item.text}
          </HeadingTag>
        );
      }

      case "paragraph": {
        // --- Inline link parsing ---
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts: (string | { text: string; href: string })[] = [];
        let lastIndex = 0;
        let match;

        if (item.text) {
          while ((match = linkRegex.exec(item.text)) !== null) {
            if (match.index > lastIndex) {
              parts.push(item.text.slice(lastIndex, match.index));
            }
            parts.push({ text: match[1], href: match[2] });
            lastIndex = linkRegex.lastIndex;
          }
          if (lastIndex < item.text.length) {
            parts.push(item.text.slice(lastIndex));
          }
        }

        return (
          <p key={index} className="mb-4 leading-relaxed text-muted-foreground">
            {/* Render inline markdown links */}
            {parts.length > 0
              ? parts.map((part, i) =>
                  typeof part === "string" ? (
                    part
                  ) : (
                    <Link
                      key={i}
                      href={part.href}
                      className="text-blue-900 hover:underline"
                    >
                      {part.text}
                    </Link>
                  )
                )
              : item.text}

            {/* Render structured link items if present */}
            {item.items?.map((child, childIndex) =>
              child.type === "link" ? (
                <Link
                  key={childIndex}
                  href={child.href || "#"}
                  className="text-blue-900 hover:underline"
                >
                  {child.text}
                </Link>
              ) : null
            )}
          </p>
        );
      }

      case "list":
        return (
          <ul key={index} className="mb-4 ml-6 list-disc space-y-1">
            {item.items?.map((listItem, listIndex) => (
              <li key={listIndex} className="text-muted-foreground">
                {typeof listItem === "string"
                  ? listItem
                  : renderContent(listItem, listIndex)}
              </li>
            ))}
          </ul>
        );

      case "ordered-list":
        return (
          <ol key={index} className="mb-4 ml-6 list-decimal space-y-1">
            {item.items?.map((listItem, listIndex) => (
              <li key={listIndex} className="text-muted-foreground">
                {typeof listItem === "string"
                  ? listItem
                  : renderContent(listItem, listIndex)}
              </li>
            ))}
          </ol>
        );

      case "code":
        return (
          <div key={index} className="mb-6">
            <CodeBlock title={item.title} language={item.language || "text"}>
              {item.code || ""}
            </CodeBlock>
          </div>
        );

      case "image":
        if (!item.src) return null; // skip if no src
        return (
          <div key={index} className="my-6">
            <Image
              src={item.src} // <-- use src from JSON
              alt={item.alt || "Image"}
              width={800} // adjust as needed or pass via JSON
              height={500} // adjust as needed or pass via JSON
              className="rounded-lg shadow-md w-full h-auto"
            />
            {item.title && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {item.title}
              </p>
            )}
          </div>
        );

      case "callout": {
        const variantStyles = {
          info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
          warning:
            "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
          success:
            "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
          error:
            "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
        };

        return (
          <div
            key={index}
            className={`p-4 rounded-lg border mb-6 ${
              variantStyles[item.variant as keyof typeof variantStyles] ||
              variantStyles.info
            }`}
          >
            {item.title && (
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            )}
            <p className="text-sm">{item.text}</p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {content.map(renderContent)}
    </div>
  );
}
