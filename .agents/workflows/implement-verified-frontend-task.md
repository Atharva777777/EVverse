---
description: Implement one clearly defined EVverse frontend task at a time. Inspect existing code, reuse working components, follow project rules, minimize unrelated changes, and verify the result through Git diff, relevant checks, and browser testing before repo
---

# Implement Verified Frontend Task

Follow the global coding standards, QuantEV2 EVverse project rules, and EVVERSE_TECHNICAL_HANDOFF.md.

## 1. Before Editing
1. Inspect the relevant project instructions and documentation.
2. Examine the actual routes, components, dependencies, and existing behavior involved.
3. Check Git status and preserve all existing changes.
4. Identify the smallest safe implementation that satisfies the task.
5. State the objective, expected files to change, constraints, and acceptance criteria.
6. Do not modify files until the task and its scope are clear.

## 2. Implementation Rules
1. Implement only the explicitly requested task.
2. Reuse existing maps, buttons, charts, layouts, API clients, optimization workflows, and reports wherever appropriate.
3. Follow the existing framework, component patterns, and styling conventions.
4. Avoid duplicated functionality, unnecessary dependencies, and unrelated refactoring.
5. Preserve existing application behavior unless a change is explicitly approved.
6. Keep the initial EVverse work frontend-focused; do not make unrelated backend, ML, dataset, or optimization changes.
7. Never expose credentials or present unverified data as verified facts.
8. Do not overwrite or discard existing user changes.

## 3. Verification
After implementing the task:

1. Review the complete Git diff.
2. Check for accidental or unrelated changes.
3. Run the relevant available lint, type-check, tests, and build commands.
4. Start or reuse the appropriate local development servers.
5. Open the application in the browser and verify the actual behavior.
6. For visual changes, capture a screenshot and inspect layout, spacing, typography, readability, and responsive behavior where relevant.
7. Check the browser console and application logs for relevant errors.
8. Confirm that existing map and optimization workflows remain functional when affected by the changes.

Do not claim a check passed unless it was actually executed successfully.

## 4. Git Safety
- Do not reset, force-push, rewrite history, or discard existing changes.
- Do not commit or push without explicit approval for that task.
- Report the current branch and working-tree status when relevant.
- Keep changes small and reviewable.

## 5. Completion Report
When finished, report:

- What changed.
- Which files changed and why.
- Which checks were executed and their actual results.
- What was verified in the browser.
- Any screenshots captured.
- Any unresolved issues or unverified assumptions.
- The next recommended task, if appropriate.

If blocked, stop and explain the blocker instead of inventing a workaround.

The human developer makes the final decision about accepting, committing, and pushing changes.