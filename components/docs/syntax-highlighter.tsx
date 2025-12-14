"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyntaxHighlighterProps {
  children: string
  language?: string
  title?: string
  className?: string
  showLineNumbers?: boolean
}

// Simple syntax highlighting patterns
const syntaxPatterns = {
  typescript: [
    {
      pattern:
        /\b(const|let|var|function|class|interface|type|enum|import|export|from|default|async|await|return|if|else|for|while|try|catch|finally|throw|new|this|super|extends|implements|public|private|protected|static|readonly)\b/g,
      className: "text-blue-400",
    },
    {
      pattern: /\b(string|number|boolean|object|undefined|null|void|any|unknown|never)\b/g,
      className: "text-green-400",
    },
    { pattern: /"([^"\\]|\\.)*"/g, className: "text-yellow-300" },
    { pattern: /'([^'\\]|\\.)*'/g, className: "text-yellow-300" },
    { pattern: /`([^`\\]|\\.)*`/g, className: "text-yellow-300" },
    { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
    { pattern: /\b\d+\.?\d*\b/g, className: "text-orange-400" },
    { pattern: /[{}[\]()]/g, className: "text-purple-400" },
  ],
  javascript: [
    {
      pattern:
        /\b(const|let|var|function|class|import|export|from|default|async|await|return|if|else|for|while|try|catch|finally|throw|new|this|super|extends)\b/g,
      className: "text-blue-400",
    },
    { pattern: /"([^"\\]|\\.)*"/g, className: "text-yellow-300" },
    { pattern: /'([^'\\]|\\.)*'/g, className: "text-yellow-300" },
    { pattern: /`([^`\\]|\\.)*`/g, className: "text-yellow-300" },
    { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
    { pattern: /\b\d+\.?\d*\b/g, className: "text-orange-400" },
    { pattern: /[{}[\]()]/g, className: "text-purple-400" },
  ],
  css: [
    { pattern: /([a-zA-Z-]+)(?=\s*:)/g, className: "text-blue-400" },
    { pattern: /:\s*([^;]+)/g, className: "text-yellow-300" },
    { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
    { pattern: /#[a-fA-F0-9]{3,6}\b/g, className: "text-green-400" },
    { pattern: /\b\d+\.?\d*(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax|fr)\b/g, className: "text-orange-400" },
  ],
  json: [
    { pattern: /"([^"\\]|\\.)*"(?=\s*:)/g, className: "text-blue-400" },
    { pattern: /"([^"\\]|\\.)*"(?!\s*:)/g, className: "text-yellow-300" },
    { pattern: /\b(true|false|null)\b/g, className: "text-purple-400" },
    { pattern: /\b\d+\.?\d*\b/g, className: "text-orange-400" },
  ],
  bash: [
    { pattern: /^#.*$/gm, className: "text-gray-500 italic" },
    {
      pattern: /\b(cd|ls|mkdir|rm|cp|mv|cat|grep|find|chmod|chown|sudo|npm|yarn|git|docker)\b/g,
      className: "text-blue-400",
    },
    { pattern: /"([^"\\]|\\.)*"/g, className: "text-yellow-300" },
    { pattern: /'([^'\\]|\\.)*'/g, className: "text-yellow-300" },
    { pattern: /--?[a-zA-Z-]+/g, className: "text-green-400" },
  ],
}

export function SyntaxHighlighter({
  children,
  language = "typescript",
  title,
  className,
  showLineNumbers = false,
}: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const highlightCode = (code: string, lang: string) => {
    const patterns = syntaxPatterns[lang as keyof typeof syntaxPatterns] || []
    let highlightedCode = code

    // Apply syntax highlighting patterns
    patterns.forEach(({ pattern, className }) => {
      highlightedCode = highlightedCode.replace(pattern, (match) => {
        return `<span class="${className}">${match}</span>`
      })
    })

    return highlightedCode
  }

  const lines = children.split("\n")
  const highlightedCode = highlightCode(children, language)
  const highlightedLines = highlightedCode.split("\n")

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg border-b-0">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre
          className={cn(
            "bg-card border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono",
            title && "rounded-t-none",
          )}
        >
          <code className="text-card-foreground">
            {showLineNumbers ? (
              <div className="flex">
                <div className="select-none text-muted-foreground pr-4 border-r border-border mr-4">
                  {lines.map((_, index) => (
                    <div key={index} className="text-right">
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  {highlightedLines.map((line, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: line || " " }} />
                  ))}
                </div>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </code>
        </pre>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
