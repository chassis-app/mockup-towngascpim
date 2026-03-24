# TownGas CPIM Mockup Reconstruction Plan

## Objective

Build a frontend-only, high-fidelity mockup of the legacy CPIM/PMO system for client buy-in.

The mockup must preserve the original app's information architecture and sequencing as closely as possible while improving visual consistency and usability through cleaner spacing, stronger hierarchy, and a modern component foundation.

## Hard Constraints

- Preserve original sidebar menu entries where visible.
- Preserve original sidebar order where visible.
- Preserve page section and component sequence where visible.
- Do not place task IDs, confidence labels, source tags, notes, or internal references on-screen.
- Do not place instructional UI copy, walkthrough hints, or explanatory annotations on-screen.
- Store all planning, coverage notes, inferred-screen notes, and task tracking in Markdown files only.
- Use `shadcn/ui` components as the UI foundation.

## Delivery Target

- Reconstruct all 69 captured screens as frontend-only pages or states.
- Add inferred screens only where needed to avoid major navigation dead ends.
- Use mocked data only.
- Make the prototype clickable and navigable across major modules.

## Source Material

- Screen captures: `client_material/`
- Schema reference: `client_material/DB_table_schema.csv`

The schema is used for realistic naming, fields, and mock data only. The screenshots are the primary source for layout, navigation, labels, and sequencing.

## Reconstruction Rules

### Navigation

- Global navigation order follows the visible order found in screenshots.
- Project workspace navigation order follows the visible project sidebar order found in screenshots.
- Missing navigation entries may be inferred only when needed to connect visible modules logically.

### Page Anatomy

For each page, preserve the visible sequence of:

1. page title
2. top-level actions
3. filters or selectors
4. tabs
5. form sections
6. tables or matrix content
7. footer actions

### UX Modernization Limits

Allowed:

- better spacing
- better alignment
- stronger type scale
- more consistent form and table styling
- clearer button hierarchy
- clearer status chips and field states

Not allowed in the first pass:

- renaming major menu entries
- reordering visible modules
- reordering visible page sections
- merging separate pages into one
- adding explanatory content not present in the source system

## Module Inventory

### Project Screens

- Project Center
- Project Information
- Project Schedule
- Project Schedule1
- Project Task
- Project Task Reassign
- Project Resource Center
- Project New Task
- Project New Resource1
- Project New Resource2
- Project New Resource3
- Project New Resource4
- Project New Resource5
- Project Management -Task Bar

### Project Management

- Project Management - create project
- Project Management - Create project template page 1
- Project Management - build team
- Project Management - Project Permissions
- Project Management - Risk
- Project Management - Issue Management
- Project Management - Deliverables
- Project Management - project status
- Project Management - TaskBar

### Security And Admin

- Role Access
- Role Access1
- Role Access2
- Role Access3
- Manage Category
- Manage Delegate
- Manage Delegates
- Manage Groups
- Manage Queue Jobs
- Manage Template
- Manage View
- Manager User
- Tenderer Group
- User Sync
- Grouping Format

### Configuration

- Add Edit Template
- Additional Server Settings
- Connect SharePoint Site
- Contractor Master List
- Custom Field
- Custom Master List
- Delete Enterprise Object
- Enterprise Calendar
- Fiscal Periods
- Force Check-in Enterprise Object
- Inspector Master List
- My Queued Job
- PWA Setting
- Quick Launch
- Report
- Task Setting and Display

### Time And Timesheet

- Administrative Time
- Manage Timesheet
- Time Report Period
- Timesheet Manager
- Timesheet Settings and Defaults1
- Timesheet Settings and Defaults2

### Workflow

- ChangeRestartSkip Workflow
- Workflow Phase
- Workflow Stage

### Other

- Alert Dashboard
- BOM Maintenance
- Enterprise Project Type
- Gantt Chart Format
- Knowledge Management
- Line Classifications

## Screen Archetypes

Use a small set of reusable patterns to reconstruct the full system:

1. Management List
2. Detail Form
3. Project Workspace
4. Task Or Schedule Grid
5. Permission Matrix
6. Dashboard Or Report
7. Utility Or System Action

## Initial Build Order

1. Scaffold Next.js app in this repo.
2. Initialize `shadcn/ui`.
3. Implement the shared shell:
   - global header
   - left nav
   - content frame
   - page title bar
   - project subnav
4. Implement shared primitives:
   - data table
   - toolbar
   - form row
   - section panel
   - tabs
   - status badge
   - matrix row
5. Rebuild the highest-coverage screen groups first:
   - Project Screens
   - Project Management
   - Security And Admin
6. Add the remaining modules.
7. Add inferred connector screens only as needed.

## Working Documentation

Additional Markdown files should be maintained for:

- route-to-screen mapping
- navigation order inventory
- page sequence inventory
- inferred-screen decisions
- mock data notes

## First Implementation Goal

Stand up the frontend app with:

- a reusable enterprise shell
- sequence-preserving navigation
- initial representative pages across the main modules
- routing structure ready to absorb the rest of the captured screens
