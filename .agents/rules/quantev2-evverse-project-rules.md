---
trigger: always_on
---

# QuantEV2 → EVverse Project Rules

## Product Direction
Evolve the existing QuantEV2 application into EVverse.
Preserve useful functionality and improve the product incrementally.
Do not rebuild the application from scratch.

## Immediate Scope
- Introduce an EVverse entry page before the existing application.
- The entry page requires no login.
- Provide three choices: Investor, Government, and EV Users.
- Investor and Government are the immediate priorities.
- EV Users may initially lead to a clearly labelled placeholder.
- Keep the entry page focused on navigation and introducing each experience.

## Reuse Existing Functionality
- Reuse the existing map, map controls, buttons, charts, optimization workflow,
  reports, API clients, and other suitable components.
- Inspect the current routes and component structure before making changes.
- Connect the new experiences to existing application functionality wherever possible.
- Prefer thin role-specific layouts over duplicated dashboards and business logic.
- Do not remove quantum, QUBO, ML, optimization, or dataset components
  without an explicit, evidence-based decision.
- Do not rewrite the backend during the initial frontend milestone.

## Design Direction
- Use a polished, professional, predominantly light interface.
- Prioritize readability, spacing, typography, hierarchy, and clear navigation.
- Use restrained glassmorphism only where it improves the experience.
- Avoid generic AI-generated visuals, decorative gradients, excessive cards,
  unnecessary animation, excessive rounding, and visual clutter.
- Preserve the existing interface elements that already work well.
- Keep shared styling consistent and reusable.

## Data Integrity
- Do not introduce unsupported claims about live data, model accuracy,
  charging availability, investment returns, or predictions.
- Do not silently present hardcoded values as verified real-world information.
- Existing placeholder content may be used for visual development when appropriate.
- Do not change data, ML, or optimization logic during a frontend-only task
  unless that change has been explicitly approved.

## Code Organization
- Follow the existing framework and folder conventions after inspecting them.
- Keep role-specific UI separate where responsibilities differ.
- Share reusable components, layouts, and API clients.
- Avoid unnecessary dependencies and duplicated abstractions.
- Do not reorganize large portions of the repository just for cosmetic reasons.

## Security
- Never expose credentials or API keys in client-side code or committed files.
- Do not print .env contents.
- Preserve appropriate Git ignore rules.
- Avoid unnecessary new endpoints or changes to backend security configuration.
- Do not claim that security checks passed without performing them.

## Frontend Verification
For each meaningful frontend task:
1. Inspect the relevant existing implementation.
2. State the proposed change and files likely to be affected.
3. Implement only the agreed scope.
4. Review the Git diff.
5. Run available project-native checks.
6. Run the application locally.
7. Verify the changed behavior in the browser.
8. Check that existing map and optimization workflows remain functional.
9. Report the actual results and unresolved issues.

## First Milestone
Create the EVverse entry page and connect the Investor and Government choices
to the appropriate existing application routes or entry points.

Do not duplicate the map, optimization engine, or reports.
Do not implement authentication.
Do not build the complete EV Users experience in this milestone.
Do not make unrelated backend or dataset changes.