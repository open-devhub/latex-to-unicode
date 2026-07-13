# Changelog

## `v2.0.0` - 2026-07-13

### Added

- Added and exported a new utility function `isLatex` to heuristically detect whether a string contains LaTeX/math notation
- Added a second `opts` argument to `latexToUnicode` to control its behavior.
  - `opts.checkLatex` (default: `true`) - When `true`, runs `isLatex(input)` first and immediately returns the input unmodified if no LaTeX patterns are detected. Set to `false` to force processing on all strings.
  - `opts.customMacros` (default: `{}`) - A dictionary mapping custom LaTeX macro names (without backslashes) to their desired Unicode equivalents. Overrides default maps.

### Changed

- Migrated the primary export of `latexToUnicode` from a default export to a **named export**

## `v1.0.0` - 2026-07-13

### Added

- Initial release of `latexToUnicode(input: string): string`
- Greek letter conversion for all lowercase and uppercase letters, including variant forms (`\varepsilon`, `\vartheta`, `\varphi`, `\varrho`, etc.)
- Symbol conversion for common math operators, relations, arrows, and set notation (`\infty`, `\partial`, `\nabla`, and many others)
- Brace-depth-aware parsing for `\frac{}{}`, `\tfrac{}{}`, `\dfrac{}{}`, and `\sqrt{}`, supporting nested expressions
- Subscript and superscript conversion for `_{...}` / `^{...}` and single-character `_x` / `^x` forms, using true Unicode subscript/superscript glyphs where available
- Graceful fallback to subscript/superscript parentheses (`₍…₎` / `⁽…⁾`) for characters with no Unicode subscript/superscript equivalent, most notably Greek letters like μ and ν which have no subscript form in the Unicode standard
- Unescaping of `\_` to `_` prior to parsing, to support input that has been pre-escaped to avoid Markdown italics (e.g. Discord bot output)
- Unwrapping of `\text{}`, `\mathrm{}`, `\mathbf{}`, `\boldsymbol{}`, and `\operatorname{}` to their plain content
- Cleanup pass removing `\left`, `\right`, sizing commands (`\big`, `\Big`, `\bigg`, `\Bigg`), spacing commands (`\,`, `\;`, `\!`, `\:`), math-mode delimiters (`$`, `$$`, `\(`, `\)`, `\[`, `\]`), and leftover braces, with whitespace normalization
