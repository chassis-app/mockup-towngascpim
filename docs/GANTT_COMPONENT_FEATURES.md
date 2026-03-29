# Gantt Component Features

Target: an interactive mockup that behaves like the Microsoft Project schedule surface rather than a simple timeline.

## P0

- Split task table + time-scaled Gantt chart with synchronized row selection.
- Hierarchical summary tasks with expand/collapse-ready outline structure.
- Finish-to-start dependency links and selected task-path highlighting.
- Milestones rendered distinctly from normal tasks.
- Critical-path highlighting.
- Baseline bars alongside current schedule bars.
- Percent-complete visualization inside task bars.
- Manual vs auto-scheduled task state.
- Placeholder/manual tasks that can exist before full dates are known.
- Recurring tasks.
- Split tasks.
- Timeline strip / pin-to-timeline support.
- Nonworking time / calendar shading.
- Task Inspector panel for scheduling factors.

## P1

- Configurable bar styles and text labels.
- Multiple saved views such as Gantt Chart vs Tracking Gantt.
- Lower detail pane for task form, notes, bar styles, and change context.
- Multiple baselines / interim-plan awareness.
- Task-specific calendars and working-time exceptions.
- Drag, resize, dependency-link, and timeline-pin interactions in the prototype.

## P2

- Printing / presentation variants with legend and title controls.
- Alternative views such as task usage, calendar, and network diagram.
- Advanced formatting for marked or special task categories.

## Source Notes

- Task path and predecessor/successor highlighting:
  https://support.microsoft.com/en-us/office/highlight-how-tasks-link-to-other-tasks-afad334a-6051-4b18-acdb-73b63a651b4d
- Critical path:
  https://support.microsoft.com/en-us/office/show-the-critical-path-of-your-project-in-project-ad6e3b08-7748-4231-afc4-a2046207fd86
- Milestones and milestone field behavior:
  https://support.microsoft.com/en-au/office/add-a-milestone-583be27b-1659-4a7a-a047-e9b9cb6a4834
  https://support.microsoft.com/en-us/office/milestone-task-field-b3bf8a34-4453-4cb4-9fc8-0ae5ef0b4c25
- Baselines:
  https://support.microsoft.com/en-us/office/manage-a-project-in-project-desktop-e49dbe0f-a635-49a8-8737-5feb96f57831
  https://support.microsoft.com/en-us/office/create-or-update-a-baseline-or-an-interim-plan-in-project-desktop-7e775482-ac84-4f4a-bbd0-592f9ac91953
- Recurring tasks:
  https://support.microsoft.com/en-gb/office/create-recurring-tasks-88a4d903-38c3-4665-870e-4810b752f2c4
- Split tasks:
  https://support.microsoft.com/en-us/office/split-a-task-20c8581b-6266-45e3-af54-cc7c3b10deca
- Timeline support:
  https://support.microsoft.com/en-us/office/create-a-timeline-in-project-628257da-4355-45d4-8605-0f21974a9fcb
- Percent complete / complete-through bar rendering:
  https://support.microsoft.com/en-gb/office/track-percent-complete-for-tasks-f01486c0-9aa7-4add-8e95-828fd911ce98
  https://support.microsoft.com/en-us/office/complete-through-task-field-2fae6922-def0-4fa9-9256-d2fc9f79e761
- Manual scheduling, placeholders, and scheduling logic:
  https://support.microsoft.com/en-gb/office/task-mode-task-field-3b185518-0e9a-4774-ba51-7b8d191bb84a
  https://support.microsoft.com/en-us/office/placeholder-task-field-51bad9bb-37e3-4ac1-884e-6b2c967cc88b
  https://support.microsoft.com/en-au/office/how-project-schedules-tasks-behind-the-scenes-df3431ab-8d8a-4047-afc6-a87b547dbac0
- Working time, calendars, and task inspectors:
  https://support.microsoft.com/en-us/office/set-the-general-working-days-and-times-for-a-project-c4587751-2b88-449d-87e5-d3312d16771d
  https://support.microsoft.com/en-us/office/create-a-calendar-for-a-task-within-project-3efc5d70-92b1-485a-ad99-2f4648b4c94f
  https://support.microsoft.com/en-gb/office/view-and-track-scheduling-factors-647becca-89da-4f58-a790-ba0ee8765683
- Bar formatting and labels:
  https://support.microsoft.com/en-gb/office/format-the-bar-chart-of-a-gantt-chart-view-2eb880e8-2a72-44e7-a861-5902cce6ae06
  https://support.microsoft.com/en-gb/office/show-task-names-next-to-gantt-chart-bars-in-project-desktop-46cf45ad-cfd9-4427-9aa0-b4586e22ead8
