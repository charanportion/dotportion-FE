"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the page content
    const headings = document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main h5, main h6"
    );
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || "";
      let id = heading.id;

      // Generate ID if it doesn't exist
      if (!id) {
        id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        heading.id = id;
      }

      items.push({ id, text, level });
    });

    setTocItems(items);
  }, []);

  useEffect(() => {
    // Track active section based on scroll position
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -35% 0%",
        threshold: 0,
      }
    );

    tocItems.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-64 flex-col fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-background my-6",
        className
      )}
    >
      <div className="p-4">
        <h4 className="text-sm font-semibold text-foreground">On This Page</h4>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {tocItems.map(({ id, text, level }) => (
            <button
              key={id}
              onClick={() => scrollToHeading(id)}
              className={cn(
                "block w-full text-left text-sm py-1 px-2 rounded-md transition-colors hover:bg-muted",
                {
                  "pl-2": level === 1,
                  "pl-4": level === 2,
                  "pl-6": level === 3,
                  "pl-8": level === 4,
                  "pl-10": level === 5,
                  "pl-12": level === 6,
                },
                activeId === id
                  ? "text-accent-foreground bg-accent font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {text}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
