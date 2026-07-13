import { GREEK } from "../unicode/greek.js";
import { SYMBOLS } from "../unicode/symbols.js";

/**
 * Extracts all unique LaTeX macro names (e.g., "\alpha", "\frac") from a given string.
 * Returns an array of macro names without the leading backslash.
 * @param input
 * @returns string[]
 */
export function extractMacros(input: string): string[] {
  const matches = input.matchAll(/\\([a-zA-Z]+)/g);
  const macros = new Set<string>();
  for (const match of matches) {
    if (match[1] !== undefined) {
      macros.add(match[1]);
    }
  }
  return Array.from(macros);
}

/**
 * Checks if a string contains a specific LaTeX macro.
 * Supports checking with or without the leading backslash.
 * @param input
 * @returns boolean
 */
export function hasMacro(input: string, macroName: string): boolean {
  // Strip leading backslash if the user provided it in the argument
  const cleanName = macroName.startsWith("\\") ? macroName.slice(1) : macroName;

  // Create a regex that matches the exact macro name, ensuring it doesn't match substrings
  const regex = new RegExp(`\\\\${cleanName}\\b`);
  return regex.test(input);
}

export function replaceMacros(
  input: string,
  customMacros?: Record<string, string>,
): string {
  return input.replace(
    /\\([a-zA-Z]+)/g,
    (full, name) =>
      customMacros?.[name] ?? GREEK[name] ?? SYMBOLS[name] ?? full,
  );
}
