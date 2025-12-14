"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href?: string;
  items?: NavigationItem[];
}

interface NavigationProps {
  items: NavigationItem[];
  searchQuery?: string;
}

export function Navigation({ items, searchQuery = "" }: NavigationProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["Getting Started", "Components"])
  );

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const filterItems = (
    items: NavigationItem[],
    query: string
  ): NavigationItem[] => {
    if (!query) return items;

    return items
      .map((item) => {
        const matchesTitle = item.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const filteredSubItems = item.items
          ? filterItems(item.items, query)
          : [];

        if (matchesTitle || filteredSubItems.length > 0) {
          return {
            ...item,
            items: filteredSubItems.length > 0 ? filteredSubItems : item.items,
          };
        }
        return null;
      })
      .filter(Boolean) as NavigationItem[];
  };

  const filteredItems = filterItems(items, searchQuery);

  const renderNavigationItem = (
    item: NavigationItem,
    level = 0,
    parentPath = ""
  ) => {
    const isExpanded = expandedSections.has(item.title);
    const hasChildren = item.items && item.items.length > 0;
    const isActive = pathname === item.href;

    const uniqueKey = item.href
      ? `link-${item.href}`
      : `section-${parentPath}-${item.title
          .toLowerCase()
          .replace(/\s+/g, "-")}`;

    if (hasChildren) {
      return (
        <div key={uniqueKey}>
          <button
            onClick={() => toggleSection(item.title)}
            className={cn(
              "flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors",
              level > 0 && "ml-4"
            )}
          >
            <span className="uppercase tracking-wide text-xs">
              {item.title}
            </span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.items?.map((subItem) =>
                renderNavigationItem(
                  subItem,
                  level + 1,
                  `${parentPath}-${item.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`
                )
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={uniqueKey}
        href={item.href || "#"}
        className={cn(
          "block px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors",
          level > 0 && "ml-4",
          isActive &&
            "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
        )}
      >
        {item.title}
      </Link>
    );
  };

  return (
    <nav className="space-y-2">
      {filteredItems.map((item) => renderNavigationItem(item, 0, ""))}
      {searchQuery && filteredItems.length === 0 && (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No results found for &quot;{searchQuery}&quot;
        </div>
      )}
    </nav>
  );
}
