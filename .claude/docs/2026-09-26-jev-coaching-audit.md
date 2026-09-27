# Jev coaching audit

2026-09-26 historical baseline audit. Greg approved the distinct-card streak case on 2026-09-27; that first case is now implemented in code. Other cases, confidence calibration and live quality evaluation below remain open. No live inference or tests were run by Codex.

## Conclusion

Jev does not grade answers. The implementation nevertheless falls short of Greg's intended coaching experience: it reacts to individual wrong answers/reveals and selects generic actions. Added observations have not become a distinct, evidence-based intervention policy. The earlier description of the remaining code as complete was too broad.

## Current execution

1. `src/helpers/transitionPractice.ts` reads the stored `answer.isCorrect`, grades, and applies retry/reveal rules. Wolfek's nod/shake also uses code, not Jev.
2. `src/server/learning/buildView.ts` marks support pending after a wrong attempt or reveal. `usePracticeSupport` requests a decision, including on a reload with pending support.
3. `prepareSupport.ts` sends the question/options, selected option, known wrong/revealed outcome, recent category practice counts, three category test results, sampled study activity, eligible plan/material context and dismissed actions. It does not send the stored correct-answer index.
4. `getPracticeDecisionCandidates.ts` offers retry, hint, compare, material, tutor, plan or continue when eligible. The client adds `none`.
5. `decisionClient.ts` submits one TypeSafe Choice. `saveSupport.ts` validates and stores its selected action; Wolfek displays a predefined message and button. Jev generates no explanation or animation.

Explicit hint, compare, reveal, next-card navigation and tutor requests execute their own code. A reveal can separately schedule a Jev recommendation afterward. `recordPracticeSuggestionAction` is interaction logging, not inference.

Local settings: active, 20 calls/day globally, 100/session, 45-second session cooldown, confidence minimum 0. Quotas are reserved before the request; failed/timed-out requests also consume the local reservation. Configured active does not prove live decision quality.

## Findings

- No educational significance gate: one ordinary mistake can qualify whenever multiple generic actions exist. The cooldown controls frequency, not relevance.
- Recent context contains six event summaries without card identities, first-attempt grouping or per-event time. Retries and help events cannot reliably establish consecutive errors across distinct cards. Thirty-day category counts are not the current learning run.
- No verified question/topic mapping; recurring-topic difficulty cannot be established. The reviewed hint/material catalog is empty, limiting useful alternatives.
- No intervention-outcome links: counts of help use do not show whether that help improved later independent responses.
- No explicit general coaching request or resume-coaching entry point. Merely focusing a previously incorrect card does not trigger a fresh decision.
- `continue` and `none` descriptions overlap. Choosing an ordinary next-card button can consume inference without meaningful personalization.
- Minimum confidence 0 admits every otherwise-valid winning option, even when the distribution is ambiguous.
- The TypeSafe transport/request shape is appropriate. The main missing work is scenario policy, evidence structure, distinct criteria and evaluation.

## Proposed UX cases

| Situation | Code supplies/does | Jev judgment | Wolfek experience |
|---|---|---|---|
| Isolated wrong answer | Grade and show retry/help controls | Usually no call; consider coaching only with relevant prior evidence or a general help request | Calm feedback without an automatic extra instruction |
| Several first-attempt mistakes across distinct cards | Compute streak and window size, excluding retries | Choose a useful change of approach among available help/resources/plan, or none | One short recommendation, no repeated popup per error |
| Repeated trouble with a verified topic | Match reviewed topic IDs and independent attempts | Select linked material or an eligible contextual RAG discussion | Specific resource/topic guidance; never invent a weakness or chapter |
| Hint/compare followed by another mistake | Link the help action to its subsequent attempt | Choose a different useful form of help | Avoid repeating the same hint/action |
| Many reveals or assisted completions | Report exposure separately from independent recall | Offer an available independent-review route or explanation, or none | Honest practice guidance without a mastery claim; review route needs implementation |
| Return to a previously incorrect card | Look up saved evidence; reuse an applicable cached recommendation | Re-evaluate only on materially changed evidence or explicit request | Relevant continuity; focus alone does not create paid calls |
| Learner asks 'Co dalej?' or 'Jak się tego nauczyć?' | Assemble current work, plan, allowed resources and prior help | Select the next useful learning activity | One suggestion the learner can accept or dismiss |
| Consistent progress / completed daily goal | Compute results and milestones deterministically | Only consider Jev if there are genuinely different next study activities to choose between | Quiet acknowledgement; no paid calculation or compulsory interruption |

A voluntary pause may become an eligible action if Greg wants that control. Never infer fatigue, anxiety or motivation from errors, speed or inactivity. Animation, cursor tracking, correct-answer feedback, explicit button routing and planner arithmetic remain deterministic.

## Proposed decision contract

- Code computes ordered distinct-card outcomes, current-run streaks, assistance/exposure, reviewed topic evidence, known outcomes after prior interventions, and elapsed intervals. Unknown evidence is represented explicitly.
- Code gates significant changes or general coaching requests, filters unavailable/dismissed actions, handles one obvious action without inference, and supplies all eligible meaningful alternatives plus `none`.
- Use descriptive `state` fields and explicit `instructions`/`criteria`. Choice IDs are app action IDs; trusted app code binds those IDs to targets and short Polish templates. Do not send arbitrary URLs, identity, full history or private notes.
- Start with one Choice for the coaching action. Additional Noul/Choice questions require a distinct UI decision; same-request questions are independent, so one cannot consume another's answer.
- Scope requests to the user/feature/card revision/evidence event on the server. Recheck freshness and eligibility before showing results. Ordinary controls remain immediate.
- Evaluate action suitability and abstention on Polish scenarios; set confidence rules from those results. Jev confidence is distribution concentration, not a measured probability that the learner will improve.

### Illustrative JSON — synthetic facts, proposed schema

This demonstrates the documented HTTP shape. It is not the current payload or a drop-in implementation. Three consecutive incorrect first attempts is an example, not an approved trigger threshold.

```json
{
  "model": "jev-1.13.0",
  "state": {
    "trigger": "repeated_difficulty_after_help",
    "current_card": {
      "server_result": "incorrect",
      "attempt_count": 2,
      "answer_visible": true,
      "verified_topic": null,
      "help_used": ["compare"]
    },
    "learning_window": {
      "scope": "current_run_last_4_distinct_cards",
      "first_attempt_results_oldest_first": ["correct", "incorrect", "incorrect", "incorrect"],
      "consecutive_first_attempt_errors": 3,
      "independent_success_after_recent_help": null
    },
    "available_support": {
      "contextual_rag": true,
      "verified_material": false,
      "existing_plan_review": true
    },
    "dismissed_actions": []
  },
  "questions": {
    "next_learning_action": {
      "type": "choice",
      "instructions": {
        "question": "Which available action most usefully helps this learner now?",
        "constraints": [
          "Treat server results and computed counts as facts; do not grade or recalculate them.",
          "Consider the sequence of distinct-card results and whether earlier help worked.",
          "Do not infer a topic weakness without verified topic evidence.",
          "Choose none when no available action provides useful guidance."
        ]
      },
      "criteria": {
        "tutor": {
          "use_when": "The learner would benefit from discussing the attached resolved card after comparison did not help.",
          "effect": "Offer an explicit RAG conversation; do not call it automatically."
        },
        "plan": {
          "use_when": "Returning to the existing planned review is more useful than another local attempt.",
          "effect": "Offer the existing plan activity; do not edit the plan."
        },
        "none": "No distinct useful intervention is supported; keep ordinary learning controls available."
      }
    }
  }
}
```

## Implementation sequence after scenario review

1. Agree on the UX cases and exclusions above; keep grading/reactions unchanged.
2. Build deterministic evidence windows and intervention-outcome links, then scenario gates.
3. Version the new JSON schema and criteria; wire only implemented, accessible actions.
4. Review representative Polish cases, ambiguous histories, missing resources and abstention before declaring the coaching policy useful. Greg's manual-test preference remains in force.

## Sources checked

- [TypeSafe API](https://docs.typesafe.ai/api): `model`, `state`, typed `questions`, structured `answers`.
- [State](https://docs.typesafe.ai/concepts/state): descriptive JSON facts; separate content from judgments; questions evaluated independently.
- [Choice](https://docs.typesafe.ai/primitives/choice): fixed alternatives, explicit criteria, optional structured descriptions and `none`.
- [Confidence](https://docs.typesafe.ai/confidence): distribution-derived confidence and domain-dependent thresholds.
- [Skill suggestion](https://docs.typesafe.ai/cookbooks/skill_suggestion): meaningful context and abstention; its two-stage large-catalog design is not automatically needed for Wolfek's small action set.

Unresolved questions:
- Which UX cases first?
- Include a voluntary pause action?
- Who supplies verified topic/resource links?
