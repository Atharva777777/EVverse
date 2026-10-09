# EVverse Technical Handoff Document

**Project:** QuantEV2 → EVverse  
**Document purpose:** Practical, evidence-based handoff for frontend refinement and introduction of role-based entry experience  
**Audience:** Development team / teammate continuation  
**Status:** Initial research & planning (repository not yet inspected in this session)  
**Last updated:** 2026-10-09  

---

## Document conventions

| Label | Meaning |
|-------|---------|
| **Verified** | Confirmed from official/current documentation |
| **Recommendation** | Proposed approach based on product goals and constraints |
| **Assumption** | Reasonable inference pending verification |
| **Requires inspection** | Must be confirmed against the actual QuantEV2 repository before acting |

Do not treat any filename, route, component name, API shape, or data claim as factual until verified in the repo.

---

## A. Executive summary

### Recommended strategy

Evolve QuantEV2 into EVverse by **layering** a new entry experience and role-oriented views on top of the existing application, rather than rewriting it.

1. **Preserve first** — Keep the working map, optimization workflows, reports, charts, and backend services. Replace only what is broken, misleading, or structurally blocking navigation.
2. **Entry page first** — Introduce a polished, login-free EVverse landing page with three choices: Investor, Government, EV Users. Investor and Government are immediate priorities; EV Users can be a placeholder or deferred route.
3. **Thin experience layer** — Investor and Government experiences should primarily *route, filter, and present* existing capabilities (map, candidate sites, optimization results, briefings) with clearer information hierarchy and role-appropriate defaults. Avoid duplicating backend logic or building parallel dashboards that re-implement the same services.
4. **Honest data presentation** — Frontend must not claim live data, verified accuracy, guaranteed returns, or production-grade model performance where the underlying values are static, estimated, experimental, or unverified. Hardcoded content may remain temporarily for layout only if clearly labeled or scoped as provisional.
5. **Frontend-first milestone** — Prioritize visual polish, navigation, component consistency, and reusable structure. Backend integrity, Indian data sources, ML reliability, and optimization correctness are subsequent stages.
6. **AI-assisted workflow** — Use Antigravity (or equivalent agentic IDE) with strict project instructions, read-only audits first, bounded implementation tasks, Git checkpoints, human approval, and browser verification. Prefer short prompts that reference this document and a concise project context file.

**Out of scope for the immediate milestone:** Authentication, full EV-user product surface, major backend rewrite, new public APIs, speculative financial claims.

---

## B. Frontend architecture

### Target information architecture (conceptual)

```
EVverse Entry Page (no auth)
│
├── Investor
│   ├── Opportunity / demand overview
│   ├── Coverage gaps & demand indicators
│   ├── Candidate locations & site recommendations
│   ├── Cost / scenario views
│   └── Investment briefing / report
│
├── Government
│   ├── Infrastructure distribution
│   ├── Underserved regions
│   ├── Regional comparisons
│   ├── Planning scenarios
│   └── Planning reports
│
└── EV Users (future / placeholder)
    └── Education & charging discovery (deferred)
```

### Flow (simple)

```
[Entry Page]
    │ select role
    ▼
[Role shell: Investor | Government]
    │ reuses existing routes / views / API clients
    ▼
[Existing QuantEV2 surfaces]
    • Interactive map
    • Placement / optimization workflow
    • Location recommendations
    • Reports / briefings
    • Quantum / scalability UI (as applicable)
```

**Recommendation:** The role shell should be a thin navigation and layout wrapper (header, sidebar or tabs, role-specific defaults and labels). Deep links into existing map, optimization, and report views should be preferred over cloning those UIs.

**Requires inspection:** Current router structure, how the map and reports are mounted, whether the app is SPA (React/Vue/etc.), and how environment-specific datasets (India / US / China) are selected.

---

## C. Component reuse

Before creating replacements, investigate and preferentially reuse:

| Area | Action |
|------|--------|
| Interactive geographical map | Reuse; only wrap or filter by role if needed |
| Map controls, markers, layers | Reuse; avoid redesign unless usability is broken |
| Charts / visualizations already in use | Reuse styling tokens where possible |
| Optimization / placement workflow UI | Reuse entry points; clarify labels for Investor vs Government |
| Generated investment briefing / report views | Reuse; surface under Investor with honest labeling |
| Quantum scalability / verification interface | Reuse if still relevant; do not expand scope |
| Buttons, form controls, layout primitives | Prefer extracting shared components over one-off styles |
| Existing API client modules | Reuse; do not invent parallel fetch layers |

**Do not replace** working map, buttons, charts, or reports without a documented technical reason (broken behavior, accessibility failure, or clear UX conflict with the new entry model).

**Requires inspection:** Component inventory, styling approach (CSS modules / Tailwind / styled-components / etc.), shared design tokens (if any), and which views are currently reachable from the root.

---

## D. Antigravity setup

**Verified (official docs):** Google Antigravity is an agent-first development platform (IDE + Manager surfaces, CLI, SDK). Agents operate across editor, terminal, and browser. Browser subagent can open/actuate Chrome, capture screenshots and recordings as artifacts. Supports model optionality (Gemini family and others in preview). Public documentation: [antigravity.google/docs](https://antigravity.google/docs/home), browser overview, IDE overview.

### Recommended global instructions (Antigravity / agent rules)

Keep these short and durable:

- Prefer read-only inspection before any write.
- Never invent filenames, routes, APIs, or data claims; state “requires inspection” when unknown.
- Never commit secrets; never print secret values.
- Never present static/experimental data as verified live truth.
- Prefer small, reversible diffs; one logical change per task.
- After code changes: show diff summary, run relevant checks, verify app starts locally, use browser agent for UI confirmation when UI is affected.
- Human retains final approval before merge or broad acceptance.

### Recommended QuantEV2 / EVverse project instructions

- Product direction: entry page → Investor / Government priority; reuse existing map, optimization, reports.
- Preserve working features unless there is a clear technical reason to change them.
- Frontend milestone only for immediate work; no major backend rewrite.
- Data honesty rules (no false freshness, accuracy, or return claims).
- Point agents at this handoff doc + a short `PROJECT_CONTEXT.md` (to be created after first repo audit).

### Context files to maintain

| File | Purpose |
|------|---------|
| `EVVERSE_TECHNICAL_HANDOFF.md` (this doc) | Strategy, workflow, security, milestones |
| `PROJECT_CONTEXT.md` (create after audit) | Stack, entrypoints, key paths, how to run FE/BE, known data caveats |
| Optional: design notes | Light theme tokens, spacing, typography once decided |

### Task-management approach

1. **Read-only audit** (Claude / strong reasoning model in Antigravity) → inventory of frontend structure, map integration, reports, data sources, env handling.
2. **Agree tasks** with human (bounded, acceptance-criteria driven).
3. **Implement** only agreed tasks (Gemini or designated implementer agent).
4. **Do not** allow concurrent agents to edit the same files.
5. **Verify** with local run + browser screenshots/artifacts.
6. **Checkpoint** with Git before risky changes.

Short prompts should reference the above files rather than pasting full history.

---

## E. Extension and agent audit

Prioritized recommendations. Compatibility claims are based on current public documentation (2026); confirm against your installed Antigravity / IDE version.

| Priority | Tool | Purpose | Necessary? | Already covered? | Setup / notes | Limitations |
|----------|------|---------|------------|------------------|---------------|-------------|
| P0 | **Antigravity built-in agents + browser** | Plan, edit, terminal, browser UI verification, screenshots/recordings | Yes for this workflow | N/A (core platform) | Official install from antigravity.google; enable browser tools; isolated Chrome profile | Rate limits on free/preview; human approval still required |
| P0 | **Git + native diff / history** | Checkpoints, review, rollback | Yes | Usually present | Ensure `.gitignore` excludes secrets and local env | — |
| P1 | **CodeRabbit** (IDE + optional PR/CLI) | AI code review on uncommitted changes and PRs; security/style signals | Optional but valuable | User noted CodeRabbit may already be present | VS Code–compatible IDEs (incl. forks); PR integration on GitHub/GitLab etc. | Pro features for some tooling; tune noise |
| P1 | **Type-check / lint / format** (project-native: e.g. ESLint, TypeScript, Prettier, Ruff if Python) | Catch errors before runtime | Strongly recommended | Depends on repo | Use existing project config; do not add competing tools | — |
| P2 | **Get Shit Done (GSD) extension / workflow** | Spec-driven phases, atomic plans, verification rituals | Optional | Partially overlapped by Antigravity tasks + this handoff | Open VSX / community packs claim Antigravity compatibility; initialize only if team wants structured phase commands | Adds process surface area; can increase token use if over-applied |
| P2 | **Accessibility checks** (axe / Lighthouse / browser tools) | Baseline a11y on new entry UI | Recommended for polished UI | Partially via browser agent + Lighthouse | Run on entry + role shells | Not a substitute for manual keyboard/screen-reader checks |
| P3 | **Roo Code / other agent extensions** | Extra agent surfaces | Usually redundant | If already installed, keep if useful | Prefer one primary agent orchestrator to avoid conflicting edits | Complexity / token cost |
| — | **Docker / Python / Jupyter / Go / clangd / GCP tools** | Existing env capabilities | Use if already needed by QuantEV2 | User indicated present | Do not expand scope for pure frontend milestone | — |

**Do not install everything.** Prefer tools that map to: (1) inspection, (2) bounded implementation, (3) review, (4) local + browser verification.

**Security note:** Any extension with repo or network access should be treated as part of the trusted compute base; review permissions and avoid tools that require uploading private code to untrusted services without policy approval.

---

## F. Get Shit Done assessment

**What GSD is (from public sources):** A context-engineering / spec-driven workflow (phases, atomic plans, verification, specialized subagents). Community packs and extensions target VS Code, Cursor, Windsurf, and Antigravity (e.g. Mission Control–style extensions and Antigravity-oriented forks). Typical commands cover map → plan → execute → verify.

**Comparison with Antigravity built-ins:**

| Capability | Antigravity | GSD layer |
|------------|-------------|-----------|
| Multi-step agent execution | Native (Manager, parallel agents, artifacts) | Structured command vocabulary |
| Browser verification | Native browser subagent + artifacts | Relies on host agent |
| Context discipline | Rules, skills, hooks, artifacts | Explicit phase files and fresh-context practices |
| Human gating | Built-in review of artifacts/diffs | Explicit verify / acceptance steps |

**Recommendation for this project:**

- **Not required** for the first EVverse entry-page milestone if Antigravity is already the primary environment and this handoff + `PROJECT_CONTEXT.md` provide durable instructions.
- **Consider adopting** (lightweight) if the team wants a shared command vocabulary for multi-phase work (audit → plan → implement → verify) and consistent subagent roles, *provided* it does not fight Antigravity’s native task/artifact model or cause double planning.
- If adopted: initialize once, keep phase docs short, and forbid parallel GSD and free-form agents from editing the same files.

**Assumption:** Team can achieve the same outcomes with disciplined Antigravity prompts + this document without mandatory GSD dependency.

---

## G. Recommended implementation workflow

1. **Repository audit (read-only)**  
   Inventory: package manager, frontend framework, map library, routing, report generation, env vars, data loading paths, existing README/run instructions.

2. **Create `PROJECT_CONTEXT.md`**  
   One page: how to run FE/BE, key directories, known static vs live data caveats, “do not claim X”.

3. **Define first milestone** (see section I) with explicit acceptance criteria.

4. **Git checkpoint**  
   Clean working tree or named branch before structural UI changes.

5. **Implement in small tasks**  
   Example task shape: “Add EVverse entry route and three role cards; no auth; preserve existing default app route under Investor path.”  
   Acceptance: builds, navigates, does not break existing map entry.

6. **After each task**  
   - Diff inspection  
   - Relevant unit/lint/type checks if present  
   - Local FE (and BE if required) runtime  
   - Browser verification + screenshots/artifacts for UI tasks  

7. **Human review** before expanding scope.

8. **Update this handoff** when architecture or data honesty rules change.

**Agents:** Prefer one implementer agent per file set; separate reviewer only when it adds value; never concurrent writers on the same files.

---

## H. Security and reliability checklist

Perform before sharing with teammates or broader use. **Do not claim “secure” without evidence.**

| Check | Status guidance |
|-------|-----------------|
| Secrets not in frontend bundles or source | Inspect env usage; grep for key-like patterns carefully without printing values |
| `.gitignore` excludes `.env`, credentials, local data dumps | Verify |
| No secrets committed in Git history (spot-check) | Verify |
| CORS configuration reviewed for intended origins | Inspect backend |
| Input validation on API boundaries | Inspect |
| Auth/authorization (when introduced later) | Out of scope now; plan least privilege |
| Rate limiting / resource exhaustion protections | Inspect backend |
| Graceful handling when external APIs fail | No hard crash of UI; clear error states |
| Dependency risk (known vulnerable packages) | Use existing audit tooling if available |
| No unnecessary new public endpoints | Frontend milestone should not require them |
| Error messages do not leak internals | Review |
| Data honesty: UI does not overclaim freshness, accuracy, or financial outcomes | Review copy and labels |

**Frontend-specific:** Ensure any API keys required by map providers or third parties are loaded only from secure server-side or properly restricted client config, never hardcoded in committed source.

---

## I. Recommended first implementation milestone

**Goal:** Smallest useful change that establishes the EVverse entry experience while preserving the existing application.

### Scope

1. Add an **EVverse entry page** as the initial landing experience (no login).
2. Three clear choices: **Investor**, **Government**, **EV Users** (EV Users may be disabled or “Coming soon”).
3. Selecting Investor or Government routes into the **existing application** (or a thin role shell that immediately surfaces existing map / workflows), without removing previous functionality.
4. Apply a **restrained light theme** baseline: strong hierarchy, readable typography, consistent spacing, minimal decorative effects (no generic AI visual clutter).
5. Do **not** rewrite map, optimization, or report internals in this milestone.

### Acceptance criteria

- [ ] Entry page loads as the primary landing experience.
- [ ] Investor and Government paths reach working existing functionality.
- [ ] Existing map / optimization / reports still work from those paths.
- [ ] No new authentication dependency.
- [ ] No claims of live data, verified model accuracy, or guaranteed returns introduced by new copy.
- [ ] Visual style is professional, light, restrained; navigation is clear.
- [ ] App builds and runs locally; browser verification (screenshots) attached to the task record.
- [ ] Changes are on a branch with a clear commit message; human reviewed.

### Explicit non-goals

- EV Users full experience  
- Backend rewrite  
- New optimization algorithms  
- Auth system  
- Full design-system overhaul beyond entry + role shell consistency  

---

## J. Team handoff checklist

For another developer to continue:

- [ ] Access to repository and ability to run FE + BE locally (document exact commands in `PROJECT_CONTEXT.md`).
- [ ] This document (`EVVERSE_TECHNICAL_HANDOFF.md`) in the repo.
- [ ] `PROJECT_CONTEXT.md` after first audit (stack, entrypoints, data caveats, run instructions).
- [ ] Known branch / commit of the entry-page milestone.
- [ ] List of **requires inspection** items still open (data integrity, India sources, ML reliability, etc.).
- [ ] Env setup notes **without** secret values (variable names only).
- [ ] Agreed design constraints (light theme, reuse map, no fake claims).
- [ ] Preferred agent workflow (Antigravity instructions location, whether GSD is in use).
- [ ] Security checklist status (what was checked, what remains).
- [ ] Contact / decision owner for product direction (Investor vs Government prioritization).

---

## Appendix: Items requiring repository inspection

Before implementation claims:

1. Frontend framework and version; build tool; styling system.  
2. Router and current root route behavior.  
3. Map library and how datasets (India / US / China) are selected.  
4. Location of optimization workflow and report/briefing generators.  
5. Which values are live API vs static/hardcoded/experimental.  
6. Existing component library or shared UI primitives.  
7. Backend API base URL configuration and CORS.  
8. Presence of tests, lint, typecheck scripts.  
9. Current `.gitignore` and env handling.  
10. Any existing role or persona logic (unlikely, but check).

---

## Appendix: Sources (tooling)

- Google Antigravity product and docs: [antigravity.google](https://antigravity.google/), [docs home](https://antigravity.google/docs/home), [IDE overview](https://antigravity.google/docs/ide/overview/), [Browser overview](https://antigravity.google/docs/ide/browser/)  
- DeepMind announcement context: public Antigravity introduction materials  
- CodeRabbit: [docs.coderabbit.ai](https://docs.coderabbit.ai/), IDE/CLI review capabilities  
- Get Shit Done: community extensions (e.g. Open VSX “Get Shit Done” / GSD Mission Control packs claiming Antigravity compatibility); treat as optional process layer, not a platform requirement  

Compatibility and rate limits change; re-verify against the installed Antigravity version before relying on a specific model or browser feature.

---

*End of handoff document. Update in place as audits complete and milestones land.*
