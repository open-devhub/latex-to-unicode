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
}
