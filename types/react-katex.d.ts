declare module "react-katex" {
  import type { ReactNode } from "react";

  export interface MathProps {
    math: string;
    children?: ReactNode;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
  }

  export function InlineMath(props: MathProps): ReactNode;

  export function BlockMath(props: MathProps): ReactNode;
}