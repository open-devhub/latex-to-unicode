# @devhub-io/latex-to-unicode

Convert LaTeX-style math notation into readable Unicode text. Built for rendering math in places that can't render LaTeX, like Discord messages, Slack, plain-text logs, or terminal output.

Unlike general-purpose LaTeX-to-Unicode converters, this package is explicit about the cases where a faithful conversion is **not possible** (Unicode does not define subscript/superscript glyphs for every letter) and degrades gracefully instead of silently dropping content or producing inconsistent output.

## Why

Most `latex-to-unicode` style packages are regex-based and break on:

- Nested braces (`\frac{8\pi G}{c^{4}}`)
- Escaped underscores (`\_{\mu\nu}`) — common when the source text was already made "Discord-safe" by escaping underscores to avoid triggering italics
- Subscripted Greek letters that have no Unicode subscript form at all (there is no subscript `μ` or `ν` in Unicode — only β, γ, ρ, φ, χ have true subscript glyphs)

This package handles all three deliberately, rather than as an afterthought.

## Install

```sh
# npm or any package manager of your choice
npm install @devhub-io/latex-to-unicode
```

## Usage

```ts
import { latexToUnicode, isLatex } from "@devhub-io/latex-to-unicode";

const input = String.raw`$$ R_{\mu\nu} - \tfrac{1}{2} R\,g_{\mu\nu} + \Lambda\,g_{\mu\nu} = \frac{8\pi G}{c^{4}}\,T_{\mu\nu} $$`;

console.log(latexToUnicode(input));
// R₍μν₎ - 1/2 R g₍μν₎ + Λ g₍μν₎ = (8πG)/(c⁴) T₍μν₎
```

## API

### `latexToUnicode(input: string): string`

Converts a string containing LaTeX macros, subscripts, superscripts, fractions, and roots into a Unicode-rendered equivalent. Unrecognized commands are left as-is rather than stripped, so partial input degrades predictably instead of losing information silently.

### `isLatex(input: string): boolean`

Heuristically detects whether a string contains LaTeX/math notation, so you can decide whether it's worth running through `latexToUnicode` at all. This is not a parser — it scores several independent signals and returns `true` once enough of them accumulate:

| Signal                                                              | Points |
| ------------------------------------------------------------------- | ------ |
| Math-mode delimiters (`$...$`, `$$...$$`, `\(...\)`, `\[...\]`)     | +3     |
| Known LaTeX command (Greek letters, `\frac`, `\sqrt`, `\sum`, etc.) | +2     |
| Braced subscript/superscript (`x_{...}`, `x^{...}`)                 | +2     |
| Any backslash command taking a brace argument                       | +1     |
| Bare superscript (`x^2`)                                            | +1     |

A string needs a total score of `2` or higher to return `true`. This keeps ordinary text — snake_case identifiers, filenames, casual `x^2`-style prose — from being flagged as math, while still catching real LaTeX with a single strong signal like `$$...$$` or `\frac{}{}`.

```ts
isLatex("R_{\\mu\\nu} = 8\\pi G T_{\\mu\\nu}"); // true
isLatex("check out my_variable_name in the code"); // false
isLatex("the area is x^2 + y^2"); // false — a single bare superscript isn't enough on its own
```

## What it converts

### Greek letters

All lowercase and uppercase Greek letters are supported, e.g. `\mu` → `μ`, `\Lambda` → `Λ`, `\varepsilon` → `ε`.

### Symbols

Common math symbols, e.g. `\infty` → `∞`, `\partial` → `∂`, `\nabla` → `∇`, `\leq` → `≤`, `\to` → `→`, `\sum` → `∑`, `\int` → `∫`. See `src/index.ts` for the full symbol table.

### Fractions and roots

- `\frac{a}{b}`, `\tfrac{a}{b}`, `\dfrac{a}{b}` → `a/b` (parenthesized when either side is more than a single token)
- `\sqrt{x}` → `√(x)`

Both are handled with proper brace-depth parsing, so nested expressions like `\frac{8\pi G}{c^{4}}` resolve correctly instead of breaking on the first `}`.

### Subscripts and superscripts

`_{...}` and `^{...}` (as well as single-character `_x` / `^x`) are converted per-character using real Unicode subscript/superscript glyphs where they exist — digits, most Latin letters, and the five Greek letters with true subscript/superscript forms (β, γ, ρ, φ, χ).

**When a character has no Unicode subscript/superscript equivalent** (this includes most Greek letters — notably μ and ν, which have no subscript form in the Unicode standard at all), the entire group is wrapped in Unicode subscript/superscript parentheses instead of silently dropping it:

```
R_{\mu\nu}  →  R₍μν₎
c^{4}       →  c⁴
```

This is a Unicode limitation, not a bug in this package — there is no subscript μ or ν glyph to fall back to.

### Wrapper commands

`\text{}`, `\mathrm{}`, `\mathbf{}`, `\boldsymbol{}`, and `\operatorname{}` are unwrapped to their plain content.

### Escaped underscores

Input is pre-processed to unescape `\_` → `_` before parsing, since some sources (e.g. bots generating Discord-safe markdown) escape underscores to prevent italics, which would otherwise break subscript detection entirely.

### Cleanup

`\left`, `\right`, `\big`/`\Big`/`\bigg`/`\Bigg`, `\,`/`\;`/`\!`/`\:` spacing commands, math-mode delimiters (`$`, `$$`, `\(`, `\)`, `\[`, `\]`), and any leftover braces are stripped in a final pass, along with whitespace normalization.

## Limitations

- Unicode does not provide subscript or superscript forms for every character. Where no glyph exists, output falls back to subscript/superscript parentheses (`₍…₎` / `⁽…⁾`) around plain characters rather than a true subscript/superscript rendering. This is a hard limitation of the Unicode standard, not something any converter can work around.
- This is not a full LaTeX parser — it targets the common subset used in short math snippets (single equations, tensor/index notation, basic symbols), not full documents, matrices, alignment environments, or custom macros.
- If the source text has already been rendered and re-copied through a client that interprets markdown (e.g. copying displayed Discord text rather than reading raw message content), underscores may already be lost before this package ever sees the string. Always pass the raw source string, not rendered/displayed text.

## Contributing

We welcome contributions!

Feel free to open [issues](https://github.com/open-devhub/issues) or submit [pull requests](https://github.com/pulls) to improve the project.

## License

Released under the **MIT** License. See [LICENSE](./LICENSE) file for more details.
