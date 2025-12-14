"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const breadcrumbs = [
    { title: "Home", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const title = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      return { title, href }
    }),
  ]

  if (pathname === "/") return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          <Link
            href={breadcrumb.href}
            className={cn(
              "hover:text-foreground transition-colors",
              index === breadcrumbs.length - 1 && "text-foreground font-medium",
            )}
          >
            {breadcrumb.title}
          </Link>
        </div>
      ))}
    </nav>
  )
}
