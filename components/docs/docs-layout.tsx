"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, Sun, Moon, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/docs/navigation";
import { SearchDialog } from "@/components/docs/search-dialog";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { DocsPagination } from "./docs-pagination";
import { usePathname } from "next/navigation";

interface DocsLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Configuration", href: "/docs/configuration" },
      { title: "Setup Guide", href: "/docs/setup" },
      { title: "First Steps", href: "/docs/first-steps" },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Button", href: "/docs/components/buttons" },
      { title: "Card", href: "/docs/components/card" },
      { title: "Input", href: "/docs/components/input" },
      { title: "Modal", href: "/docs/components/modal" },
      { title: "Table", href: "/docs/components/table" },
      { title: "Form", href: "/docs/components/form" },
      { title: "Dropdown", href: "/docs/components/dropdown" },
      { title: "Accordion", href: "/docs/components/accordion" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Authentication", href: "/docs/api/auth" },
      { title: "Database", href: "/docs/api/database" },
      { title: "Utilities", href: "/docs/api/utilities" },
      { title: "Hooks", href: "/docs/api/hooks" },
      { title: "Endpoints", href: "/docs/api/endpoints" },
      { title: "Webhooks", href: "/docs/api/webhooks" },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "Basic Usage", href: "/docs/examples/basic" },
      { title: "Advanced Patterns", href: "/docs/examples/advanced" },
      { title: "Integration", href: "/docs/examples/integration" },
      { title: "Best Practices", href: "/docs/examples/best-practices" },
      { title: "Real World", href: "/docs/examples/real-world" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "Theming", href: "/docs/guides/theming" },
      { title: "Deployment", href: "/docs/guides/deployment" },
      { title: "Testing", href: "/docs/guides/testing" },
      { title: "Performance", href: "/docs/guides/performance" },
      { title: "Troubleshooting", href: "/docs/guides/troubleshooting" },
      { title: "Migration", href: "/docs/guides/migration" },
    ],
  },
];

export function DocsLayout({ children }: DocsLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Navigation */}
      <ScrollArea className="h-full p-4">
        <Navigation items={navigationItems} searchQuery={searchQuery} />
      </ScrollArea>
    </div>
  );

  const pathName = usePathname();

  return (
    <div className="min-h-screen bg-background font-poppins">
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Sticky Glass Navbar - Matching Landing Page */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background via-background to-transparent">
        <div className="max-w-8xl mx-auto pl-10 pr-10 sm:pr-20">
          <div className="flex items-center justify-between h-20">
            {/* Left side - DotPortion Logo */}
            <div className="text-sm font-medium flex items-center space-x-2">
              <Image
                src={theme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
                alt="logo"
                width={150}
                height={150}
              />
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-12">
              <Link
                href="/"
                className="text-foreground hover:text-foreground/70 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/docs"
                className="text-foreground hover:text-foreground/70 transition-colors font-medium"
              >
                Docs
              </Link>
              <Link
                href="/docs/quick-start"
                className="text-foreground hover:text-foreground/70 transition-colors font-medium"
              >
                Quick Start
              </Link>
              <Link
                href="/docs/api/auth"
                className="text-foreground hover:text-foreground/70 transition-colors font-medium"
              >
                API Reference
              </Link>
            </div>

            {/* Right side - Search Bar, Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search Bar - Using existing component */}
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setSearchOpen(true)}
                  className="pl-10 bg-background border-border cursor-pointer h-9 w-64"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-foreground hover:text-foreground/70"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-foreground transition-colors p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slides down when open */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-background">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <Link
                href="/"
                className="block text-foreground hover:text-foreground/70 transition-colors font-medium"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/docs"
                className="block text-foreground hover:text-foreground/70 transition-colors font-medium"
                onClick={toggleMobileMenu}
              >
                Docs
              </Link>
              <Link
                href="/docs/quick-start"
                className="block text-foreground hover:text-foreground/70 transition-colors font-medium"
                onClick={toggleMobileMenu}
              >
                Quick Start
              </Link>
              <Link
                href="/docs/api/auth"
                className="block text-foreground hover:text-foreground/70 transition-colors font-medium"
                onClick={toggleMobileMenu}
              >
                API Reference
              </Link>

              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => {
                    setSearchOpen(true);
                    toggleMobileMenu();
                  }}
                  className="pl-10 bg-background border-border cursor-pointer h-9 w-full"
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 flex-col fixed left-0 top-20 h-[calc(100vh-5rem)] bg-background">
          <SidebarContent />
        </aside>
        {/* Main Content */}
        <main className="flex-1 md:ml-80 xl:mr-64">
          <div className="container max-w-4xl mx-auto px-6 py-8">
            {children}

            {/* Pagination */}
            <DocsPagination
              currentPath={pathName}
              navigationItems={navigationItems}
            />
          </div>
        </main>

        <aside className="hidden xl:flex ">
          <TableOfContents />
        </aside>
      </div>
    </div>
  );
}
