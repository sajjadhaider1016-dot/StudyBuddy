"use client";

import "katex/dist/katex.min.css";
import katex from "katex";

type MathTextProps = {
  text: string;
  className?: string;
};

function renderMath(
  expression: string,
  displayMode: boolean,
  key: number,
) {
  try {
    const html = katex.renderToString(expression.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: false,
    });

    return (
      <span
        key={key}
        className={displayMode ? "my-4 block overflow-x-auto" : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return (
      <span key={key}>
        {displayMode ? `$$${expression}$$` : `$${expression}$`}
      </span>
    );
  }
}

function renderTextWithMath(text: string) {
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

  return parts.map((part, index) => {
    if (!part) {
      return null;
    }

    if (part.startsWith("$$") && part.endsWith("$$")) {
      const expression = part.slice(2, -2);

      return renderMath(expression, true, index);
    }

    if (part.startsWith("$") && part.endsWith("$")) {
      const expression = part.slice(1, -1);

      return renderMath(expression, false, index);
    }

    return <span key={index}>{part}</span>;
  });
}

export default function MathText({
  text,
  className = "",
}: MathTextProps) {
  return (
    <span className={className}>
      {renderTextWithMath(text)}
    </span>
  );
}