# Gantt Dependency Routing Framework

Goal: keep the full dependency network always visible on the standalone Gantt page while making the connectors look like a scheduling tool rather than a generic box-diagram router.

## Current Problem

The current routing attempts improved collision avoidance, but it still fails visually:

- Lines take long artificial detours.
- Near-row links are over-routed and dominate the bars.
- Same-row and adjacent-row cases still look unnatural.
- Labels and obstacle scoring can push routes too far away from the actual tasks.
- The overall result is unstable and not demo quality.

## Framework

### Core Constraints

- Task bar x-position is fixed by time.
- Task row y-position is fixed by hierarchy and ordering.
- Dependencies should be orthogonal only.
- Bars and milestones are hard obstacles.
- Labels are soft obstacles at most; they should not drive major detours.
- Same-row and near-row links must stay local.
- Long links may use shared trunks.
- Routes should remain visually stable under small task changes.

### Routing Model

Use a classification-first, Gantt-specific heuristic router instead of a general-purpose obstacle router.

Each dependency is routed in two stages:

1. Classify the dependency into a routing case.
2. Apply a small number of allowed route templates for that case.

This avoids global “search everywhere” behavior and keeps the line language consistent.

### Routing Tiers

#### Local Links

Use compact handcrafted patterns only:

- same-row
- adjacent-row
- small row-distance and small time-gap links

These must never use large global detours.

#### Regional Links

Use one controlled outer elbow or one local trunk:

- 2 to 4 rows apart
- medium time-gap

These should still feel local to the involved tasks.

#### Long Links

Use shared trunks only when truly needed:

- large row distance
- or large time distance

These should route through left-side or right-side trunk families.

## Routing Cases

### Case 1: Same Row

- Route as a compact top arch or bottom arch.
- Keep the full route close to the two tasks.
- Never use a far shared trunk.

### Case 2: Adjacent Row

- Route with a short elbow just outside the two bars.
- Use the nearest local lane.
- Avoid large rectangular excursions.

### Case 3: Near Forward

- Source to target later in time.
- Route with a compact outer-right elbow.
- Stay local if the row distance is small.

### Case 4: Near Backward

- Source to target earlier in time.
- Route with a compact outer-left elbow.
- Stay local if the row distance is small.

### Case 5: Far Forward

- Route through a right-side trunk family.
- Use short source and target stubs, then a stable vertical trunk.

### Case 6: Far Backward

- Route through a left-side trunk family.
- Use the same stable trunk logic as forward links.

### Case 7: Milestone Involved

- Use adjusted endpoint offsets for diamond geometry.
- Keep stubs tight and avoid clipping the milestone body.

### Case 8: Split Task Involved

- Attach finish-based links to the last segment.
- Attach start-based links to the first segment.
- Do not treat split gaps as general routing corridors by default.

## Geometry Rules

### Hard Obstacles

- task bars
- milestone diamonds
- split-task segments

### Soft Obstacles

- task labels
- link handles

Soft obstacles may influence a local tie-break, but they must not force major detours.

### Lanes

- each row gets a top gutter and bottom gutter
- near-row local routes use row gutters
- far routes use shared trunks

### Shared Trunks

- maintain separate left and right trunk pools
- assign a trunk only for far links
- preserve previous trunk assignment whenever still valid

## Visual Rules

- Connectors must remain visually secondary to the task bars.
- Long trunk runs should be lighter than endpoint stubs.
- Arrowheads should be small, clear, and directional.
- Crossings are acceptable only in trunk corridors, not on top of bars.
- Selected path highlighting can remain, but non-selected links must still be readable.

## Stability Rules

- Small task moves should not cause major route changes.
- Preserve previous trunk or side choice whenever still legal.
- Only reroute aggressively when a route becomes materially worse or blocked.

## Recommended Technical Direction

Stop tuning the current generic channel-scoring approach.

Replace it with:

- classification-first routing
- local templates for local links
- shared trunks only for far links
- route memory for stability

This is the correct model for always-visible full-network rendering.

## Task-Level Plan

### Phase 1: Classification Layer

- Add a per-dependency classifier that computes:
  - row distance
  - time direction
  - time gap
  - milestone involvement
  - split-task involvement
  - selected routing case
- Keep this pure and testable.

Deliverable:
- a routing-case decision table in code
- debug output or temporary logging for classified cases during development

### Phase 2: Local Templates

- Implement route templates for:
  - same-row
  - adjacent-row
  - near forward
  - near backward
- Bars remain hard obstacles.
- Labels become soft or ignored for these cases.

Deliverable:
- local links stop using shared channels
- short links look compact and task-centric

### Phase 3: Far-Link Trunk System

- Add left and right trunk families.
- Only far links may use them.
- Assign trunks greedily with stability preference.
- Separate trunk underlay from endpoint overlay.

Deliverable:
- long links become organized instead of chaotic
- route switching is reduced

### Phase 4: Endpoint and Case Polish

- Tune milestone endpoint offsets.
- Tune split-task endpoint selection.
- Refine arrowheads and entry/exit stubs.
- Reduce crossings in local clusters.

Deliverable:
- endpoints look intentional and readable
- special cases stop looking broken

### Phase 5: Visual QA

- Verify with Playwright on the live standalone page.
- Capture dense-case screenshots:
  - same-row link
  - adjacent-row link
  - near forward cluster
  - backward link
  - long forward trunk
  - split-task and milestone cases
- Compare visually against earlier screenshots.

Deliverable:
- a final QA pass with saved evidence under `output/playwright/`

## Execution Notes

- Start with local cases first. They are currently the most visibly broken.
- Do not attempt another full free-form router.
- Keep the routing code inside the standalone Gantt module until the behavior is stable.
- Once the new model is proven, then consider extracting routing helpers into a dedicated Gantt routing module.

## Current Implementation Status

Completed in the standalone demo:

- classification-first dependency routing inside `project-gantt.tsx`
- dedicated deterministic `FS` rendering for downward task flows
- compact tight-gap templates so small positive gaps do not force outer elbows
- compact overlap routing that uses hard bar bounds instead of label width
- shared trunk families only for longer links
- Playwright visual QA artifacts under `output/playwright/`

Additional demo-data correction:

- the standalone Gantt seed now normalizes `FS` successor dates in `demo-project.ts`
- this keeps the frontend-only demo schedule dependency-consistent without adding a backend
- mockup source data remains unchanged; only the standalone demo projection is normalized

## Next Task-Level Passes

1. Extend deterministic templates beyond `FS` if `SS`, `FF`, or `SF` are introduced in the demo.
2. Add route-level visual regression checks for dense and mixed-link cases.
3. Consider extracting routing helpers into a dedicated Gantt routing module once the current behavior is stable.
