import Link from "next/link";

interface DocsPaginationProps {
  currentPath: string;
  navigationItems: {
    title: string;
    items: { title: string; href: string }[];
  }[];
}

export function DocsPagination({
  currentPath,
  navigationItems,
}: DocsPaginationProps) {
  // Flatten all items
  const flatItems = navigationItems.flatMap((section) => section.items);

  // Find index of current page
  const currentIndex = flatItems.findIndex((item) => item.href === currentPath);

  const prev = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const next =
    currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="flex justify-between mt-12 mb-6">
      {prev ? (
        <Link
          href={prev.href}
          className="flex items-center gap-2 text-accent-foreground hover:underline"
        >
          ← {prev.title}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="flex items-center gap-2 text-accent-foreground hover:underline ml-auto"
        >
          {next.title} →
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
