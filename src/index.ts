import type { CharMap } from "./types/CharMap.js";
import type { Options } from "./types/Options.js";
import { SUB } from "./unicode/sub.js";
import { SUPER } from "./unicode/super.js";
import { isLatex } from "./utils/isLatex.js";
import { replaceMacros } from "./utils/macros.js";

const WRAPPER_COMMANDS = [
  "text",
  "mathrm",
  "mathbf",
  "boldsymbol",
  "operatorname",
];

function extractBraceGroup(
  str: string,
  openIdx: number,
): { content: string; endIdx: number } | null {
  if (str[openIdx] !== "{") return null;
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) return { content: str.slice(openIdx + 1, i), endIdx: i };
    }
  }
  return null;
}

function unwrapCommands(input: string): string {
  let out = "";
  let i = 0;
  while (i < input.length) {
    const rest = input.slice(i);
    const match = new RegExp(`^\\\\(${WRAPPER_COMMANDS.join("|")})`).exec(rest);
    if (match && input[i + match[0].length] === "{") {
      const group = extractBraceGroup(input, i + match[0].length);
      if (group) {
        out += unwrapCommands(group.content);
        i = group.endIdx + 1;
        continue;
      }
    }
    out += input[i];
    i++;
  }
  return out;
}

function wrapIfNeeded(s: string): string {
  return /^[\w²³¹⁰⁴-⁹πμνΛλ]+$/u.test(s) && s.length <= 3 ? s : `(${s})`;
}

function processFracAndSqrt(input: string): string {
  let out = "";
  let i = 0;
  while (i < input.length) {
    const rest = input.slice(i);
    const fracMatch = /^\\(t|d)?frac/.exec(rest);
    const sqrtMatch = /^\\sqrt/.exec(rest);

    if (fracMatch) {
      const afterCmd = i + fracMatch[0].length;
      const num = extractBraceGroup(input, afterCmd);
      if (num) {
        const denStart = num.endIdx + 1;
        const den = extractBraceGroup(input, denStart);
        if (den) {
          const n = processFracAndSqrt(num.content);
          const d = processFracAndSqrt(den.content);
          out += `${wrapIfNeeded(n)}/${wrapIfNeeded(d)}`;
          i = den.endIdx + 1;
          continue;
        }
      }
    }

    if (sqrtMatch) {
      const argStart = i + sqrtMatch[0].length;
      const arg = extractBraceGroup(input, argStart);
      if (arg) {
        out += `√(${processFracAndSqrt(arg.content)})`;
        i = arg.endIdx + 1;
        continue;
      }
    }

    out += input[i];
    i++;
  }
  return out;
}

function convertScript(
  content: string,
  map: CharMap,
  open: string,
  close: string,
  fallback: "parentheses" | "raw" | "strip",
  isSup: boolean,
  isBraced: boolean,
): string {
  const chars = Array.from(content);
  const allMapped = chars.every((ch) => map[ch] !== undefined);
  if (allMapped) return chars.map((ch) => map[ch]).join("");

  if (fallback === "raw") {
    const prefix = isSup ? "^" : "_";
    return isBraced ? `${prefix}{${content}}` : `${prefix}${content}`;
  }
  if (fallback === "strip") {
    return content;
  }
  return `${open}${content}${close}`;
}

function processScripts(
  input: string,
  fallback: "parentheses" | "raw" | "strip" = "parentheses",
): string {
  let out = "";
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if ((ch === "_" || ch === "^") && i + 1 < input.length) {
      const isSup = ch === "^";
      const map = isSup ? SUPER : SUB;
      const open = isSup ? "⁽" : "₍";
      const close = isSup ? "⁾" : "₎";

      if (input[i + 1] === "{") {
        const group = extractBraceGroup(input, i + 1);
        if (group) {
          out += convertScript(
            group.content,
            map,
            open,
            close,
            fallback,
            isSup,
            true,
          );
          i = group.endIdx + 1;
          continue;
        }
      } else {
        out += convertScript(
          input[i + 1]!,
          map,
          open,
          close,
          fallback,
          isSup,
          false,
        );
        i += 2;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

function cleanup(input: string): string {
  return input
    .replace(/\\(left|right|big|Big|bigg|Bigg|middle)\b/g, "")
    .replace(/\\[,;!:]/g, " ")
    .replace(/\$\$?|\\\[|\\\]|\\\(|\\\)/g, "")
    .replace(/[{}]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

const defaultOptions: Options = {
  latexCheck: true,
  customMacros: {},
  fallbackBehaviour: "parentheses",
};

/**
 * Converts a string containing LaTeX macros, subscripts, superscripts, fractions,
 * and roots into a Unicode-rendered equivalent.
 * Unrecognized commands are left as-is rather than stripped, allowing partial or
 * invalid input to degrade predictably without silently losing information.
 *
 * @param input - The LaTeX-formatted string to convert.
 * @param opts - Optional configuration settings.
 * @param opts.latexCheck - If `true`, runs `isLatex` on the input and returns it unmodified if no LaTeX is detected. Default is `true`.
 * @param opts.customMacros - A record of custom LaTeX macro names mapped to their Unicode equivalents. Custom macros take precedence over default mappings.
 * @returns string
 * @example
 * ```ts
 * // Basic conversion
 * latexToUnicode("\\alpha + \\beta"); // "α + β"
 * // Using custom macros
 * latexToUnicode("\\R + \\mathbb{Q}", {
 * customMacros: { R: "ℝ", mathbb: "" }
 * }); // "ℝ + Q"
 * ```
 */
export function latexToUnicode(input: string, opts?: Options): string {
  const resolvedOpts = { ...defaultOptions, ...opts };

  if (resolvedOpts.latexCheck && !isLatex(input)) return input;

  let s = input;
  s = s.replace(/\\_/g, "_");
  s = replaceMacros(s, resolvedOpts.customMacros);
  s = unwrapCommands(s);
  s = processFracAndSqrt(s);
  s = processScripts(s, resolvedOpts.fallbackBehaviour);
  s = cleanup(s);
  return s;
}

export { type Options } from "./types/Options.js";
export { isLatex } from "./utils/isLatex.js";
export { extractMacros, hasMacro } from "./utils/macros.js";
