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
  // Some model responses contain LaTeX backslashes that JSON.parse interprets
  // as control escapes (for example, \frac becomes form-feed + "rac"). Restore
  // the common commands so older saved cards remain readable too.
  const readableText = text
    .replace(/\f(?=rac\b)/g, "\\f")
    .replace(/\u0008(?=(?:ig|egin|old|inom|iggl)\b)/g, "\\b")
    .replace(/\t(?=(?:ext|an|imes|heta|au|o|ilde|riangle)\b)/g, "\\t")
    .replace(/\n(?=(?:eq|u|ot|abla|abla|exists|infty|subset|times|rightarrow|leftarrow)\b)/g, "\\n")
    .replace(/\r(?=(?:angle|ho|ef|ight|ho|m)\b)/g, "\\r");

  const parts = readableText.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

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
