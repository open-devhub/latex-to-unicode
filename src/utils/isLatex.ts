const MATH_DELIMITERS =
  /\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)/;

const KNOWN_COMMANDS =
  /\\(alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|omicron|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega|frac|tfrac|dfrac|sqrt|sum|prod|coprod|int|oint|iint|iiint|lim|infty|partial|nabla|hbar|forall|exists|nexists|in|notin|ni|subset|subseteq|supset|supseteq|cup|cap|setminus|emptyset|varnothing|wedge|vee|neg|oplus|otimes|perp|parallel|angle|to|rightarrow|leftarrow|leftrightarrow|Rightarrow|Leftarrow|Leftrightarrow|mapsto|leq|le|geq|ge|neq|ne|approx|sim|simeq|cong|equiv|propto|times|div|cdot|pm|mp|text|mathrm|mathbf|boldsymbol|operatorname|left|right|big|Big|bigg|Bigg|quad|qquad|vec|hat|bar|dot|ddot|overline|underline|binom)\b/;

const ANY_COMMAND_WITH_ARG = /\\[a-zA-Z]+\{/;

const BRACED_SCRIPT = /[A-Za-z0-9)\]}][_^]\{[^{}]*\}/;

const BARE_SUPERSCRIPT = /[A-Za-z0-9][\^][A-Za-z0-9](?![A-Za-z0-9])/;

/**
 * Heuristically determines whether a given string is likely to contain LaTeX.
 * It scores the input based on the presence of math delimiters, known commands,
 * subscripts/superscripts, and brace arguments.
 *
 * @param input
 * @returns boolean
 */
export function isLatex(input: string): boolean {
  if (!input || typeof input !== "string") return false;

  let score = 0;

  if (MATH_DELIMITERS.test(input)) score += 3;
  if (KNOWN_COMMANDS.test(input)) score += 2;
  if (BRACED_SCRIPT.test(input)) score += 2;
  if (ANY_COMMAND_WITH_ARG.test(input)) score += 1;
  if (BARE_SUPERSCRIPT.test(input)) score += 1;

  return score >= 2;
}
