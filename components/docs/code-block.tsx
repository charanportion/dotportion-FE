"use client";

import { SyntaxHighlighter } from "@/components/docs/syntax-highlighter";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  language = "typescript",
  title,
  className,
  showLineNumbers,
}: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      title={title}
      className={className}
      showLineNumbers={showLineNumbers}
    >
      {children}
    </SyntaxHighlighter>
  );
}
