"use client";

import React from "react";
import Highlight, {
  defaultProps,
  Language,
  PrismTheme,
} from "prism-react-renderer";
import theme from "prism-react-renderer/themes/vsDark";

interface CodeBlockProps {
  code: string;
  language?: Language;
  className?: string;
}

interface TokenType {
  types: string[];
  content: string;
}

// const cleanedTheme: PrismTheme = {
//   ...theme,
//   plain: {
//     ...theme.plain,
//     backgroundColor: "transparent",
//   },
// };

export function CodeBlock({
  code,
  language = "javascript",
  className = "",
}: CodeBlockProps) {
  return (
    <Highlight
      {...defaultProps}
      code={code.trim()}
      language={language}
      theme={theme as PrismTheme}
    >
      {({
        className: internalClass,
        style,
        tokens,
        getLineProps,
        getTokenProps,
      }) => (
        <div className="w-full overflow-x-auto rounded-md bg-secondary border border-border">
          <pre
            className={`${internalClass} ${className} p-4 text-sm whitespace-pre min-w-max`}
            style={{
              ...style,
              background: "transparent",
            }}
          >
            {tokens.map((line: TokenType[], lineIndex: number) => {
              const lineProps = getLineProps({ line });

              return (
                <div key={lineIndex} {...lineProps}>
                  {line.map((token: TokenType, tokenIndex: number) => {
                    const tokenProps = getTokenProps({ token });

                    return <span key={tokenIndex} {...tokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </Highlight>
  );
}
