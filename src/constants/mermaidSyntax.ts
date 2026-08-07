/**
 * A Mermaid identifier, as a source fragment for building regexes.
 *
 * Unicode-aware on purpose. The template asks the model for ASCII ids, but it
 * does not always comply, and an ASCII-only pattern does not reject a Polish id
 * — it matches the ASCII *prefix* of one. "Połączenie" was read as the id "Po",
 * which then got substituted inside every word starting with those letters and
 * corrupted the diagram into something Mermaid could not parse.
 */
export const MERMAID_ID = String.raw`[\p{L}_][\p{L}\p{N}_]*`

/** Same, for the comma-separated id list a `class` statement takes. */
export const MERMAID_ID_LIST = String.raw`[\p{L}\p{N}_,\s]`
