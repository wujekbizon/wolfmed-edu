# Memory retrieval accuracy smoke test

Run manually after deploying the accuracy correction. No schema migration or
embedding backfill is needed. Existing Basic/Premium memory write policy is unchanged.

## Implementation

- Resolve explicit topics from user-scoped active fact metadata and retained episode
  artifacts. Labels come from existing content/category/title fields.
- Normalize Polish diacritics and allow conservative shared-prefix matching for
  inflections (minimum six shared letters, at least 75% of the longer word).
  This is a heuristic, not a Polish morphological analyzer.
- A resolved topic filters every search channel before ranking. Matching records
  are also read directly, so missing embeddings cannot hide known topic facts.
- Without a resolved topic, facts and episodes remain hybrid discoveries.
- Lexical search uses meaningful query words and PostgreSQL word_similarity.
  Candidate floor stays 0.1; normalization is restricted to lexical scores >=0.4.
  These initial floors require manual calibration; they are not measured confidence.
- Normalize eligible lexical scores against their batch maximum. Keep local cosine
  similarity (1-distance); do not copy Oracle's distance transform and thresholds
  onto a different embedding distribution. Fusion cannot lower the vector baseline.
- Shared assembly accepts the configured retrieval floor; it does not silently
  discard all low-tier results again. Literal fallback remains usable.
- Broad overview questions include up to 40 active facts. Both answer paths share
  a 4,800-character memory budget and 1,600-character per-record cap.
  When episodes exist, facts use at most 65% of the available budget.
- Overview/discovery episodes are capped at two per topic. Explicit topic history
  can include more attempts within retrieval and prompt limits.
- Prompt distinguishes stored aggregates, individual attempts and record dates.
  Reconstructed episode timestamps are not asserted to be actual event dates.

## Manual checks

Use a Premium account. Start a fresh conversation/cell for each independent test
so previous incorrect assistant answers do not obscure the result.

1. Ask: “Jakie mam wyniki z fizjologii?”
   For the supplied production fixture: answer the saved 65% aggregate from two
   attempts; distinguish the 30% and 100% individual attempts. No other subject
   should replace physiology. No corpus sources on this self-state path.
2. Ask: “Jak mi idzie z fizjologią i co powinienem powtórzyć?”
   Keep physiology as the subject. Do not invent specific mistakes or weak
   subtopics when only aggregate scores are available.
3. Ask: “Jak wypadłem w pomiarze i ocenie saturacji krwi?”
   Resolve the procedure and recall 57% despite NULL embeddings in the fixture.
4. Ask: “Jakie mam wyniki z biochemii?”
   Recall the active 40% aggregate; revoked 25%/30% aggregates must be absent.
5. Ask: “Jak ogólnie wygląda mój postęp?”
   Include several active topics; repeated suction episodes must not fill all
   available episode slots. Do not claim this bounded context is complete history.
6. Ask a curriculum question on a known memory topic.
   Keep medical claims grounded in curriculum sources. Memory may adjust teaching
   focus; it must not supply medical claims.

Inspect the matching memory_retrieval/rag_retrieval trace by user, runId and turnIndex:

- memoryRecall.topics: physiology should resolve to quiz:fizjologia.
- facts/episodes: actually assembled IDs, dates, topic keys and selectionReason.
- candidates: vectorScore, lexicalScore, normalizedLexicalScore, final score and
  decision (selected, below_threshold, limit, budget, diversity).
- Topic selections can bypass score thresholds; selectionReason is topic.
- modes describe available search channels, not a per-record confidence estimate.
- Channel failures are logged; unrelated data is never admitted to a topic filter.

Candidates are the bounded rows returned by search channels, not every database
row. Metadata scope filters and SQL candidate limits exclude rows before tracing.
Send the exact question, answer and matching retrieval trace for any failure.
