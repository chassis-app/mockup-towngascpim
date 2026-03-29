# Sidebar Reachability Audit

## Scope

This audit checks whether the intended screen inventory is reachable through the left sidebar menu tree, in hierarchy.

Source of truth used for the target inventory:

- `69` captured screens from `client_material/` and the module inventory in `docs/MOCKUP_RECONSTRUCTION_PLAN.md`
- `10` inferred connector/workspace screens from `docs/SCREEN_ROUTE_MAP.md`
- `3` captured Role Access variants defined in `web/src/lib/mockup-data.ts` but currently omitted from `docs/SCREEN_ROUTE_MAP.md`

Practical target total: `79` screens or screen states.

## Post-Fix Verification

Status after the sidebar hierarchy patch:

- Target screens or states in sidebar config: `79`
- Missing from sidebar config: `0`
- Role Access variants now included in both the app sidebar and `docs/SCREEN_ROUTE_MAP.md`
- Project-only detail routes such as `create-project`, `task reassignment`, and the Role Access variants now render in project workspace mode because they carry project context

The detailed matrix and findings below are preserved as the pre-fix audit baseline that motivated the implementation.

## Method

- Verified the current left sidebar structure in code:
  - `web/src/components/mockup/app-sidebar.tsx`
  - `web/src/lib/mockup-data.ts`
- Verified the rendered navigation with Playwright snapshots on:
  - `/`
  - `/projects/rp-20250059/information`
  - `/projects/rp-20250059/project-management`
  - `/projects/rp-20250059/tasks`
  - `/projects/rp-20250059/resources`
  - `/projects/rp-20250059/role-access`

`Reachable elsewhere` means there is a confirmed non-sidebar link visible in the current UI, such as:

- the PWA Settings category grid on `/`
- the project horizontal subnav on project pages

## Current Left Sidebar Tree

### Admin Mode

- `Workspace`
  - `Project Management` -> `/projects/rp-20250059/information`
  - `Approvals`
  - `Tasks`
  - `Resources`
  - `CPIM Template`
  - `CPIM Reports`
  - `Role Access`
  - `Contractor Master`
  - `BOM Maintenance`
  - `Tenderer Group`
  - `Generic Report`
  - `Knowledge Management`
- `Administration`
  - `PWA Settings`
  - `Manage Views`
  - `Quick Launch`
  - `Manage Templates`
  - `Manage Delegates`
  - `Time Reporting Periods`
  - `Reporting`

### Project Mode

- `Overview`
  - `Project Information (RP)`
  - `Schedule`
  - `Project Status`
  - `Project Site`
- `Workspace`
  - `Project Management`
  - `Approvals`
  - `Tasks`
  - `Resources`
  - `CPIM Template`
  - `CPIM Reports`
  - `Role Access`
  - `Contractor Master`
  - `Customer Master`
  - `Inspection Master`
  - `Alert Dashboard`
  - `BOM Maintenance`
  - `Tenderer Group`
  - `Generic Report`
  - `Knowledge Management`
- `Utilities`
  - `EDIT LINKS`

## Coverage Summary

- Target screens or states: `79`
- Reachable directly from the left sidebar tree: `26`
- Not in the left sidebar tree, but still reachable elsewhere in the UI: `26`
- No confirmed navigation entry in the current UI: `27`

## Findings

- The left sidebar tree does not mirror the richer admin hierarchy already present on the PWA Settings page body. The source hierarchy on `/` includes `Personal Settings`, `Enterprise Data`, `Queue and Database Administration`, `Look and Feel`, `Time and Task Management`, `Operational Policies`, `Workflow and Project Detail Pages`, and `Security`, but the actual left nav compresses this into a flat `Administration` bucket.
- `Project Information` is reachable from the admin sidebar under the label `Project Management`, because `quickLaunchItems` points that label to `/projects/rp-20250059/information`.
- `Role Access1`, `Role Access2`, and `Role Access3` exist as routed screens, but are not reachable from the left sidebar tree or from any confirmed in-page link.
- `Add Edit Template`, `Custom Master List`, `Contractor Master List`, `Inspector Master List`, `Timesheet Settings and Defaults2`, `Project Center`, `Project Schedule1`, all project creation/detail pages, `Project Task Reassign`, and the three Role Access variants are currently orphaned from visible navigation.

## Matrix

### Reachable From Left Sidebar Tree

| Screen | Route | Expected Hierarchy | Current Sidebar Branch | Other Confirmed Entry |
| --- | --- | --- | --- | --- |
| PWA Settings | `/` | Admin | Admin > Administration | Root |
| Manage View | `/manage-view` | Admin > Look and Feel | Admin > Administration | PWA Settings grid |
| Quick Launch | `/quick-launch` | Admin > Look and Feel | Admin > Administration | PWA Settings grid |
| Manage Template | `/manage-template` | Admin > Security | Admin > Administration | PWA Settings grid |
| Manage Delegates | `/manage-delegates` | Admin > Personal Settings | Admin > Administration | PWA Settings grid |
| Time Report Period | `/time-report-period` | Admin > Time and Task Management | Admin > Administration | PWA Settings grid |
| Report | `/report` | Admin > Enterprise Data | Admin > Administration | PWA Settings grid |
| Project Information | `/projects/rp-20250059/information` | Project > Overview | Admin > Workspace and Project > Overview | Project subnav |
| Approvals | `/projects/rp-20250059/approvals` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Project Task | `/projects/rp-20250059/tasks` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Project Resource Center | `/projects/rp-20250059/resources` | Project > Workspace | Admin > Workspace and Project > Workspace | Root grid and project subnav |
| CPIM Template | `/projects/rp-20250059/cpim-template` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| CPIM Reports | `/projects/rp-20250059/cpim-reports` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Role Access | `/projects/rp-20250059/role-access` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Contractor Master | `/projects/rp-20250059/contractor-master` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| BOM Maintenance | `/projects/rp-20250059/bom-maintenance` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Tenderer Group | `/projects/rp-20250059/tenderer-group` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Generic Report | `/projects/rp-20250059/generic-report` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Knowledge Management | `/projects/rp-20250059/knowledge-management` | Project > Workspace | Admin > Workspace and Project > Workspace | Project subnav |
| Project Schedule | `/projects/rp-20250059/schedule` | Project > Overview | Project > Overview | Project subnav |
| Project Status | `/projects/rp-20250059/project-status` | Project > Overview | Project > Overview | Project subnav |
| Project Site | `/projects/rp-20250059/project-site` | Project > Overview | Project > Overview | Project subnav |
| Project Management | `/projects/rp-20250059/project-management` | Project > Workspace | Project > Workspace | Project subnav |
| Customer Master | `/projects/rp-20250059/customer-master` | Project > Workspace | Project > Workspace | Project subnav |
| Inspection Master | `/projects/rp-20250059/inspection-master` | Project > Workspace | Project > Workspace | Project subnav |
| Alert Dashboard | `/projects/rp-20250059/alert-dashboard` | Project > Workspace | Project > Workspace | Project subnav |

### Reachable Elsewhere, But Not In Left Sidebar Tree

| Screen | Route | Expected Hierarchy | Sidebar Tree Reachable | Other Confirmed Entry |
| --- | --- | --- | --- | --- |
| Grouping Format | `/grouping-format` | Admin > Look and Feel | No | PWA Settings grid |
| Gantt Chart Format | `/gantt-chart-format` | Admin > Look and Feel | No | PWA Settings grid |
| My Queued Job | `/my-queued-job` | Admin > Personal Settings | No | PWA Settings grid via `/my-queued-jobs` alias |
| Manage Delegate | `/manage-delegate` | Admin > Personal Settings | No | PWA Settings grid |
| Manage Groups | `/manage-groups` | Admin > Security | No | PWA Settings grid |
| Manage Category | `/manage-category` | Admin > Security | No | PWA Settings grid |
| Manage Queue Jobs | `/manage-queue-jobs` | Admin > Queue and Database Administration | No | PWA Settings grid |
| Manager User | `/manager-user` | Admin > Security | No | PWA Settings grid |
| User Sync | `/user-sync` | Admin > Operational Policies | No | PWA Settings grid |
| Custom Field | `/custom-field` | Admin > Enterprise Data | No | PWA Settings grid |
| Enterprise Calendar | `/enterprise-calendar` | Admin > Enterprise Data | No | PWA Settings grid |
| Enterprise Project Type | `/enterprise-project-type` | Admin > Workflow and Project Detail Pages | No | PWA Settings grid |
| Fiscal Periods | `/fiscal-periods` | Admin > Time and Task Management | No | PWA Settings grid |
| Line Classifications | `/line-classifications` | Admin > Time and Task Management | No | PWA Settings grid |
| Timesheet Settings and Defaults1 | `/timesheet-settings-and-defaults-1` | Admin > Time and Task Management | No | PWA Settings grid |
| Manage Timesheet | `/manage-timesheet` | Admin > Time and Task Management | No | PWA Settings grid |
| Timesheet Manager | `/timesheet-manager` | Admin > Time and Task Management | No | PWA Settings grid |
| Additional Server Settings | `/additional-server-settings` | Admin > Operational Policies | No | PWA Settings grid |
| Connect SharePoint Site | `/connect-sharepoint-site` | Admin > Operational Policies | No | PWA Settings grid |
| Delete Enterprise Object | `/delete-enterprise-object` | Admin > Queue and Database Administration | No | PWA Settings grid |
| Force Check-in Enterprise Object | `/force-check-in-enterprise-object` | Admin > Queue and Database Administration | No | PWA Settings grid |
| Administrative Time | `/administrative-time` | Admin > Time and Task Management | No | PWA Settings grid |
| Task Setting and Display | `/task-setting-and-display` | Admin > Time and Task Management | No | PWA Settings grid |
| Workflow Phase | `/workflow-phase` | Admin > Workflow and Project Detail Pages | No | PWA Settings grid |
| Workflow Stage | `/workflow-stage` | Admin > Workflow and Project Detail Pages | No | PWA Settings grid |
| ChangeRestartSkip Workflow | `/change-restart-skip-workflow` | Admin > Workflow and Project Detail Pages | No | PWA Settings grid |

### No Confirmed Navigation Entry In Current UI

| Screen | Route | Expected Hierarchy | Sidebar Tree Reachable | Other Confirmed Entry |
| --- | --- | --- | --- | --- |
| Add Edit Template | `/add-edit-template` | Admin > Look and Feel | No | None confirmed |
| Custom Master List | `/custom-master-list` | Admin > Unmapped captured admin screen | No | None confirmed |
| Contractor Master List | `/contractor-master-list` | Admin > Unmapped captured admin screen | No | None confirmed |
| Inspector Master List | `/inspector-master-list` | Admin > Unmapped captured admin screen | No | None confirmed |
| Timesheet Settings and Defaults2 | `/timesheet-settings-and-defaults-2` | Admin > Time and Task Management | No | None confirmed |
| Project Center | `/project-center` | Project > Standalone landing | No | None confirmed |
| Project Schedule1 | `/projects/rp-20250059/schedule-1` | Project > Overview > Schedule variant | No | None confirmed |
| Project Management - create project | `/projects/rp-20250059/project-management/create-project` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - Create project template page 1 | `/projects/rp-20250059/project-management/create-project-template` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - build team | `/projects/rp-20250059/project-management/build-team` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - Project Permissions | `/projects/rp-20250059/project-management/project-permissions` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - Risk | `/projects/rp-20250059/project-management/risk` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - Issue Management | `/projects/rp-20250059/project-management/issues` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - Deliverables | `/projects/rp-20250059/project-management/deliverables` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - project status | `/projects/rp-20250059/project-management/project-status` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management - TaskBar | `/projects/rp-20250059/project-management/task-bar` | Project > Workspace > Project Management detail | No | None confirmed |
| Project Management -Task Bar | `/projects/rp-20250059/task-bar` | Project > Workspace > Task bar detail | No | None confirmed |
| Project New Task | `/projects/rp-20250059/tasks/new` | Project > Workspace > Tasks detail | No | None confirmed |
| Project New Resource1 | `/projects/rp-20250059/resources/new-1` | Project > Workspace > Resources detail | No | None confirmed |
| Project New Resource2 | `/projects/rp-20250059/resources/new-2` | Project > Workspace > Resources detail | No | None confirmed |
| Project New Resource3 | `/projects/rp-20250059/resources/new-3` | Project > Workspace > Resources detail | No | None confirmed |
| Project New Resource4 | `/projects/rp-20250059/resources/new-4` | Project > Workspace > Resources detail | No | None confirmed |
| Project New Resource5 | `/projects/rp-20250059/resources/new-5` | Project > Workspace > Resources detail | No | None confirmed |
| Project Task Reassign | `/project-task-reassign` | Project > Workspace > Tasks detail | No | None confirmed |
| Role Access1 | `/role-access/1` | Project > Workspace > Role Access detail | No | None confirmed |
| Role Access2 | `/role-access/2` | Project > Workspace > Role Access detail | No | None confirmed |
| Role Access3 | `/role-access/3` | Project > Workspace > Role Access detail | No | None confirmed |

## References

- `docs/MOCKUP_RECONSTRUCTION_PLAN.md`
- `docs/SCREEN_ROUTE_MAP.md`
- `docs/V4_REFRESH_AUDIT.md`
- `web/src/components/mockup/app-sidebar.tsx`
- `web/src/lib/mockup-data.ts`
