# V4 Refresh Audit

## Coverage Snapshot

- Source captures in `client_material/`: 69
- Screen inventory in `web/src/lib/mockup-data.ts`: 69 after restoring `Add Edit Template`
- Shared v4 shell: active across all routed screens
- Remaining inferred connector pages kept intentionally small:
  - `Project Site`

## Route Mapping Corrections Applied

- `Add Edit Template` is now part of the formal captured screen inventory.
- `Alert Dashboard`, `BOM Maintenance`, `Knowledge Management`, and `Tenderer Group` are mapped as project-workspace routes instead of loose root routes.
- `ChangeRestartSkip Workflow` is normalized to `/change-restart-skip-workflow`.
- The PWA Settings `Resource Center` launcher now points to the existing project resource center screen instead of a dead route.

## Verified Source Filename Mismatches

These source files do not match the visible page title inside the screenshot. The mockup follows the visible screen context rather than the filename.

- `PMO Additional Server Settings.jpg` -> visible page: `Act as a Delegate`
- `PMO Administrative Time.jpg` -> visible page: `Active Directory Enterprise Resource Pool Synchronization`
- `PMO Contractor Master List.jpg` -> visible page: `BOM Maintenance`
- `PMO Custom Master List.jpg` -> visible page: `Connected SharePoint Sites`
- `PMO Manager User.jpg` -> visible page: `Manage Templates`

## Verification Standard

- Build from production output, not `next dev`
- Capture every mapped screen route into `output/playwright/`
- Review the resulting set for:
  - missing routes
  - broken sidebar or header states
  - overflow or clipped tables
  - empty shells caused by bad path mapping
