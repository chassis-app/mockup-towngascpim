import { getScreenByPath, type ScheduleBlock } from "@/lib/mockup-data";

import type {
  GanttDependency,
  GanttProject,
  GanttTask,
  GanttTaskKind,
  GanttTaskSegment,
  GanttTone,
} from "@/lib/gantt/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const monthByLabel: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function createDemoProject(): GanttProject {
  const screen = getScreenByPath("/projects/rp-20250059/schedule");

  if (!screen) {
    throw new Error("Seed schedule screen not found.");
  }

  const block = screen.blocks.find((item): item is ScheduleBlock => item.type === "schedule");

  if (!block) {
    throw new Error("Seed schedule block not found.");
  }

  const parentStack: Array<{ indent: number; id: string }> = [];
  const anchorDate = parseDisplayDate(block.rows[0]?.start ?? "02 Mar 2026");

  const tasks = block.rows.map<GanttTask>((row, index) => {
    const indent = row.indent ?? 0;

    while (parentStack.length > indent) {
      parentStack.pop();
    }

    const parentId = indent > 0 ? parentStack[indent - 1]?.id ?? null : null;
    const kind = getTaskKind(row);
    const startDate = parseDisplayDate(row.start);
    const finishDate = parseDisplayDate(row.finish);
    const durationDays = getDurationDays(row.duration, kind);
    const baselineFinishDate = row.baselineFinish ? parseDisplayDate(row.baselineFinish) : undefined;
    const baselineStartDate =
      row.bar?.baselineStart !== undefined
        ? addCalendarDays(anchorDate, Math.round(row.bar.baselineStart * 7))
        : baselineFinishDate
          ? addCalendarDays(
              baselineFinishDate,
              kind === "milestone" ? 0 : Math.max(-(durationDays - 1), 0),
            )
          : undefined;

    const task: GanttTask = {
      id: row.id,
      parentId,
      order: index,
      wbs: row.wbs,
      name: row.taskName,
      kind,
      mode: row.taskMode,
      startDate,
      finishDate,
      durationLabel: row.duration,
      durationDays,
      progress: row.progress,
      resourceNames: row.resources ?? "",
      note: row.note ?? "",
      tone: (row.status ?? "default") as GanttTone,
      expanded: true,
      onTimeline: Boolean(row.onTimeline),
      isCritical: Boolean(row.critical),
      baselineStartDate,
      baselineFinishDate,
      segments: buildSegments(row, startDate, finishDate),
    };

    if (row.kind === "summary") {
      parentStack[indent] = { indent, id: row.id };
    }

    return task;
  });

  const dependencies = block.dependencies.map<GanttDependency>((dependency, index) => ({
    id: `dep-${index + 1}`,
    fromTaskId: dependency.from,
    toTaskId: dependency.to,
    kind: dependency.kind,
    isDriving: Boolean(dependency.driving),
  }));
  const normalizedTasks = normalizeDemoSchedule(tasks, dependencies);

  return {
    id: "rp-20250059-demo",
    name: block.heading,
    description: block.description,
    tasks: normalizedTasks,
    dependencies,
    selectedTaskId: block.rows.find((row) => row.selected)?.id ?? block.rows[0]?.id ?? null,
  };
}

function getTaskKind(row: ScheduleBlock["rows"][number]): GanttTaskKind {
  if (row.kind === "summary") {
    return "summary";
  }

  if (row.kind === "milestone") {
    return "milestone";
  }

  if (row.kind === "recurring") {
    return "recurring";
  }

  if (row.bar?.segments && row.bar.segments.length > 1) {
    return "split-task";
  }

  return "task";
}

function buildSegments(
  row: ScheduleBlock["rows"][number],
  startDate: string,
  finishDate: string,
): GanttTaskSegment[] {
  if (row.kind === "recurring") {
    return buildRecurringSegments(startDate, finishDate, row.id);
  }

  if (row.bar?.segments && row.bar.segments.length > 1) {
    const segments: GanttTaskSegment[] = [];
    let cursor = startDate;
    let previousStart = row.bar.segments[0]?.start ?? 0;
    let previousLength = 0;

    row.bar.segments.forEach((segment, index) => {
      if (index > 0) {
        const gapUnits = segment.start - previousStart - previousLength;
        cursor = addCalendarDays(cursor, Math.max(Math.round(gapUnits * 7), 1));
      }

      const segmentDays = Math.max(Math.round((segment.length ?? 0.25) * 5), 1);
      const segmentFinishDate = addCalendarDays(cursor, segmentDays - 1);

      segments.push({
        id: `${row.id}-segment-${index + 1}`,
        startDate: cursor,
        finishDate: segmentFinishDate,
      });

      cursor = segmentFinishDate;
      previousStart = segment.start;
      previousLength = segment.length ?? 0;
    });

    return segments;
  }

  return [
    {
      id: `${row.id}-segment-1`,
      startDate,
      finishDate,
    },
  ];
}

function buildRecurringSegments(startDate: string, finishDate: string, taskId: string) {
  const segments: GanttTaskSegment[] = [];
  let cursor = startDate;
  let index = 0;

  while (compareIsoDates(cursor, finishDate) <= 0) {
    segments.push({
      id: `${taskId}-segment-${index + 1}`,
      startDate: cursor,
      finishDate: cursor,
    });
    cursor = addCalendarDays(cursor, 7);
    index += 1;
  }

  return segments;
}

function getDurationDays(duration: string, kind: GanttTaskKind) {
  if (kind === "milestone") {
    return 0;
  }

  const match = duration.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function parseDisplayDate(value: string) {
  const [dayLabel, monthLabel, yearLabel] = value.split(" ");
  const day = Number(dayLabel);
  const month = monthByLabel[monthLabel];
  const year = Number(yearLabel);

  return toIsoDate(new Date(Date.UTC(year, month, day)));
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addCalendarDays(isoDate: string, amount: number) {
  const next = new Date(`${isoDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return toIsoDate(next);
}

function compareIsoDates(left: string, right: string) {
  return toTimestamp(left) - toTimestamp(right);
}

function toTimestamp(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).getTime() / MS_PER_DAY;
}

function normalizeDemoSchedule(tasks: GanttTask[], dependencies: GanttDependency[]) {
  const normalizedTasks = tasks.map((task) => ({
    ...task,
    segments: task.segments.map((segment) => ({ ...segment })),
  }));
  const taskById = new Map(normalizedTasks.map((task) => [task.id, task]));

  for (let pass = 0; pass < dependencies.length; pass += 1) {
    let didShift = false;

    dependencies.forEach((dependency) => {
      if (dependency.kind !== "FS") {
        return;
      }

      const fromTask = taskById.get(dependency.fromTaskId);
      const toTask = taskById.get(dependency.toTaskId);

      if (!fromTask || !toTask || toTask.kind === "summary") {
        return;
      }

      const requiredStartDate = addCalendarDays(fromTask.finishDate, 2);
      const shiftDays = compareIsoDates(requiredStartDate, toTask.startDate);

      if (shiftDays <= 0) {
        return;
      }

      shiftTaskDates(toTask, shiftDays);
      didShift = true;
    });

    if (!didShift) {
      break;
    }
  }

  rollupSummaryTasks(normalizedTasks);
  return normalizedTasks;
}

function shiftTaskDates(task: GanttTask, shiftDays: number) {
  task.startDate = addCalendarDays(task.startDate, shiftDays);
  task.finishDate = addCalendarDays(task.finishDate, shiftDays);
  task.segments = task.segments.map((segment) => ({
    ...segment,
    startDate: addCalendarDays(segment.startDate, shiftDays),
    finishDate: addCalendarDays(segment.finishDate, shiftDays),
  }));
}

function rollupSummaryTasks(tasks: GanttTask[]) {
  const childrenByParentId = new Map<string, GanttTask[]>();

  tasks.forEach((task) => {
    if (!task.parentId) {
      return;
    }

    const siblings = childrenByParentId.get(task.parentId) ?? [];
    siblings.push(task);
    childrenByParentId.set(task.parentId, siblings);
  });

  [...tasks]
    .reverse()
    .filter((task) => task.kind === "summary")
    .forEach((task) => {
      const children = childrenByParentId.get(task.id) ?? [];

      if (children.length === 0) {
        return;
      }

      const startDate = children.reduce(
        (earliest, child) => (compareIsoDates(child.startDate, earliest) < 0 ? child.startDate : earliest),
        children[0].startDate,
      );
      const finishDate = children.reduce(
        (latest, child) => (compareIsoDates(child.finishDate, latest) > 0 ? child.finishDate : latest),
        children[0].finishDate,
      );

      task.startDate = startDate;
      task.finishDate = finishDate;
      task.segments = [
        {
          id: `${task.id}-segment-1`,
          startDate,
          finishDate,
        },
      ];
    });
}
