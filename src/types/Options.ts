export interface Options {
  /**
   * When true, runs `isLatex(input)` first and immediately returns the input unmodified if no LaTeX patterns are detected.
   * @default true
   */
  latexCheck?: boolean;
  /**
   * A map of custom LaTeX macros to their Unicode string replacements.
   * Overrides or extends the default math symbols and Greek letters.
   * * @example
   * ```ts
   * { customMacros: { "differential": "d", "R": "ℝ" } }
   * ```
   */
  customMacros?: Record<string, string>;
  /**
   * Controls what happens when a subscript or superscript character has no true Unicode equivalent.
   * - `"parentheses"`: Wraps the character inside true subscript/superscript parens, e.g., ₍μ₎.
   * - `"raw"`: Leaves the LaTeX script formatting block intact, e.g., _{\mu}.
   * - `"strip"`: Removes the formatting syntax, flattening the character to plain text, e.g., μ.
   * @default "parentheses"
   */
  fallbackBehaviour?: "parentheses" | "raw" | "strip";
}
