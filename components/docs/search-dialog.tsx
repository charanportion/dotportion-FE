"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, Hash, Code } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchResult {
  title: string;
  href: string;
  type: "page" | "section" | "code";
  excerpt: string;
  category: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock search data - in a real app, this would come from an API or search index
const searchData: SearchResult[] = [
  {
    title: "Introduction",
    href: "/",
    type: "page",
    excerpt:
      "Welcome to the documentation portal. A comprehensive guide to get started.",
    category: "Getting Started",
  },
  {
    title: "Installation",
    href: "/docs/installation",
    type: "page",
    excerpt:
      "Get started by installing the documentation portal with npm or yarn.",
    category: "Getting Started",
  },
  {
    title: "Quick Start",
    href: "/docs/quick-start",
    type: "page",
    excerpt: "Get up and running with the documentation portal in minutes.",
    category: "Getting Started",
  },
  {
    title: "Button Component",
    href: "/docs/components/buttons",
    type: "page",
    excerpt: "A versatile button component with multiple variants and sizes.",
    category: "Components",
  },
  {
    title: "Authentication API",
    href: "/docs/api/auth",
    type: "page",
    excerpt:
      "Complete authentication API reference with login, register, and token management.",
    category: "API Reference",
  },
  {
    title: "Button Variants",
    href: "/docs/components/button#variants",
    type: "section",
    excerpt:
      "The Button component supports several visual variants: default, secondary, outline, ghost, and destructive.",
    category: "Components",
  },
  {
    title: "Login Endpoint",
    href: "/docs/api/auth#post-login",
    type: "section",
    excerpt: "POST /login - Authenticate a user with email and password.",
    category: "API Reference",
  },
  {
    title: "npm install",
    href: "/docs/installation#quick-installation",
    type: "code",
    excerpt: "npm install @radix-ui/react-accordion @radix-ui/react-dialog",
    category: "Getting Started",
  },
];

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Simple search implementation - in a real app, use a proper search engine
    const filtered = searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered.slice(0, 10)); // Limit to 10 results
  }, [query]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "page":
        return <FileText className="h-4 w-4" />;
      case "section":
        return <Hash className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleResultClick = () => {
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Search Documentation</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b border-border pb-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="What are you searching for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-96">
          {query && results.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={`${result.href}-${index}`}
                  href={result.href}
                  onClick={handleResultClick}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                    "focus:bg-muted focus:outline-none"
                  )}
                >
                  <div className="text-muted-foreground mt-1">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {result.title}
                      </h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {result.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <div className="py-6 text-center text-muted-foreground">
              {/* <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to search documentation...</p>*/}
              <div className="mt-4 text-xs">
                {/* <p>Try searching for:</p> */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  <button
                    onClick={() => setQuery("button")}
                    className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                  >
                    button
                  </button>
                  <button
                    onClick={() => setQuery("installation")}
                    className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                  >
                    installation
                  </button>
                  <button
                    onClick={() => setQuery("api")}
                    className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                  >
                    api
                  </button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
              <span>to select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
              <span>to navigate</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
