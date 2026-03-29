"use client";

import { Fragment, useEffect, useEffectEvent, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  GanttDependencyKind,
  GanttProject,
  GanttTask,
  GanttTaskSegment,
} from "@/lib/gantt/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const rowHeight = 44;
const storageVersion = 1;
const storageKeyPrefix = "gantt-demo-state";
const baselineOffsetY = 9;
const milestoneOffsetY = 14;
const standardBarOffsetY = 14;
const recurringBarOffsetY = 15;
const taskLabelOffsetY = -12;
const defaultLeftPaneWidth = 960;
const minLeftPaneWidth = 760;
const maxLeftPaneWidth = 1480;

type TaskColumnKey = "wbs" | "name" | "mode" | "start" | "finish" | "duration" | "pred" | "progress";

const taskTableColumns: Array<{
  key: TaskColumnKey;
  label: string;
  defaultWidth: number;
  minWidth: number;
}> = [
  { key: "wbs", label: "WBS", defaultWidth: 72, minWidth: 56 },
  { key: "name", label: "Task Name", defaultWidth: 304, minWidth: 200 },
  { key: "mode", label: "Mode", defaultWidth: 84, minWidth: 72 },
  { key: "start", label: "Start", defaultWidth: 98, minWidth: 92 },
  { key: "finish", label: "Finish", defaultWidth: 98, minWidth: 92 },
  { key: "duration", label: "Duration", defaultWidth: 86, minWidth: 80 },
  { key: "pred", label: "Pred", defaultWidth: 86, minWidth: 76 },
  { key: "progress", label: "%", defaultWidth: 132, minWidth: 72 },
];

type ZoomLevel = "day" | "week" | "month";

type DragState =
  | {
      taskId: string;
      mode: "move";
      startClientX: number;
      pixelsPerDay: number;
      snapshot: GanttTask;
    }
  | {
      taskId: string;
      mode: "resize-start" | "resize-end";
      startClientX: number;
      pixelsPerDay: number;
      snapshot: GanttTask;
    };

type PersistedGanttState = {
  version: number;
  project: GanttProject;
  collapsedIds: string[];
  zoom: ZoomLevel;
  showBaseline: boolean;
  showCriticalPath: boolean;
  showNonWorking: boolean;
  columnWidths?: Record<TaskColumnKey, number>;
  leftPaneWidth?: number;
};

type ColumnResizeState = {
  key: TaskColumnKey;
  startClientX: number;
  startWidth: number;
};

type PaneResizeState = {
  startClientX: number;
  startWidth: number;
};

type LinkEdge = "start" | "finish";

type ChartLinkDraft = {
  fromTaskId: string;
  fromEdge: LinkEdge;
};

export function ProjectGantt({ initialProject }: { initialProject: GanttProject }) {
  const seededProject = hydrateProject(initialProject);
  const storageKey = `${storageKeyPrefix}:${initialProject.id}`;

  const [project, setProject] = useState(seededProject);
  const [collapsedIds, setCollapsedIds] = useState<string[]>(() =>
    seededProject.tasks
      .filter((task) => task.kind === "summary" && task.expanded === false)
      .map((task) => task.id),
  );
  const [zoom, setZoom] = useState<ZoomLevel>("week");
  const [showBaseline, setShowBaseline] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showNonWorking, setShowNonWorking] = useState(true);
  const [columnWidths, setColumnWidths] = useState<Record<TaskColumnKey, number>>(
    getDefaultColumnWidths(),
  );
  const [leftPaneWidth, setLeftPaneWidth] = useState(defaultLeftPaneWidth);
  const [didHydratePersistedState, setDidHydratePersistedState] = useState(false);
  const [pendingPredecessorTaskId, setPendingPredecessorTaskId] = useState("");
  const [pendingPredecessorKind, setPendingPredecessorKind] =
    useState<GanttDependencyKind>("FS");
  const [chartLinkDraft, setChartLinkDraft] = useState<ChartLinkDraft | null>(null);

  const dragStateRef = useRef<DragState | null>(null);
  const columnResizeRef = useRef<ColumnResizeState | null>(null);
  const paneResizeRef = useRef<PaneResizeState | null>(null);
  const setStatusMessage = () => {};

  const selectedTaskId = project.selectedTaskId ?? project.tasks[0]?.id ?? "";
  const visibleTasks = getVisibleTasks(project.tasks, collapsedIds);
  const selectedTask =
    project.tasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0]?.task ?? null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey);

      if (!raw) {
        setDidHydratePersistedState(true);
        return;
      }

      const parsed = JSON.parse(raw) as PersistedGanttState;

      if (parsed.version !== storageVersion) {
        window.localStorage.removeItem(storageKey);
        setDidHydratePersistedState(true);
        return;
      }

      setProject(hydrateProject(parsed.project));
      setCollapsedIds(parsed.collapsedIds);
      setZoom(parsed.zoom);
      setShowBaseline(parsed.showBaseline);
      setShowCriticalPath(parsed.showCriticalPath);
      setShowNonWorking(parsed.showNonWorking);
      setColumnWidths(getNormalizedColumnWidths(parsed.columnWidths));
      setLeftPaneWidth(getNormalizedLeftPaneWidth(parsed.leftPaneWidth));
      setStatusMessage();
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setDidHydratePersistedState(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!didHydratePersistedState || typeof window === "undefined") {
      return;
    }

    const payload: PersistedGanttState = {
      version: storageVersion,
      project,
      collapsedIds,
      zoom,
      showBaseline,
      showCriticalPath,
      showNonWorking,
      columnWidths,
      leftPaneWidth,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    collapsedIds,
    didHydratePersistedState,
    project,
    showBaseline,
    showCriticalPath,
    showNonWorking,
    columnWidths,
    leftPaneWidth,
    storageKey,
    zoom,
  ]);

  useEffect(() => {
    if (!selectedTaskId || !selectedTask) {
      return;
    }

    const visibleIds = new Set(visibleTasks.map((entry) => entry.task.id));

    if (visibleIds.has(selectedTaskId)) {
      return;
    }

    const fallbackTaskId =
      findNearestVisibleAncestor(project.tasks, collapsedIds, selectedTaskId) ??
      visibleTasks[0]?.task.id ??
      project.tasks[0]?.id ??
      null;

    if (!fallbackTaskId || fallbackTaskId === selectedTaskId) {
      return;
    }

    setProject((current) => ({
      ...current,
      selectedTaskId: fallbackTaskId,
    }));
  }, [collapsedIds, project.tasks, selectedTask, selectedTaskId, visibleTasks]);

  useEffect(() => {
    if (!chartLinkDraft) {
      return;
    }

    const sourceTaskStillExists = project.tasks.some((task) => task.id === chartLinkDraft.fromTaskId);

    if (!sourceTaskStillExists) {
      setChartLinkDraft(null);
    }
  }, [chartLinkDraft, project.tasks]);

  useEffect(() => {
    if (!chartLinkDraft) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setChartLinkDraft(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [chartLinkDraft]);

  const onPointerMove = useEffectEvent((event: PointerEvent) => {
    const paneResizeState = paneResizeRef.current;

    if (paneResizeState) {
      const delta = event.clientX - paneResizeState.startClientX;
      setLeftPaneWidth(
        getNormalizedLeftPaneWidth(Math.round(paneResizeState.startWidth + delta)),
      );
      return;
    }

    const columnResizeState = columnResizeRef.current;

    if (columnResizeState) {
      const config = taskTableColumns.find((column) => column.key === columnResizeState.key);

      if (!config) {
        return;
      }

      const delta = event.clientX - columnResizeState.startClientX;
      const nextWidth = Math.max(
        config.minWidth,
        Math.round(columnResizeState.startWidth + delta),
      );

      setColumnWidths((current) => ({
        ...current,
        [columnResizeState.key]: nextWidth,
      }));
      return;
    }

    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    const deltaDays = Math.round((event.clientX - dragState.startClientX) / dragState.pixelsPerDay);

    setProject((current) => ({
      ...current,
      tasks: applyTaskMutation(current.tasks, current.dependencies, dragState.taskId, () =>
        applyTaskDrag(dragState.snapshot, dragState.mode, deltaDays),
      ),
      selectedTaskId: dragState.taskId,
    }));
  });

  const onPointerUp = useEffectEvent(() => {
    if (paneResizeRef.current) {
      paneResizeRef.current = null;
      setStatusMessage();
      return;
    }

    if (columnResizeRef.current) {
      columnResizeRef.current = null;
      setStatusMessage();
      return;
    }

    const dragState = dragStateRef.current;

    if (!dragState) {
      return;
    }

    dragStateRef.current = null;
    setStatusMessage();
  });

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const pixelsPerDay = zoom === "day" ? 32 : zoom === "week" ? 18 : 8;
  const chartRange = getChartRange(project.tasks);
  const timelineWidth = (chartRange.totalDays + 1) * pixelsPerDay;
  const chartSurfaceWidth = Math.max(timelineWidth, 920);
  const taskTableWidth = taskTableColumns.reduce(
    (sum, column) => sum + columnWidths[column.key],
    0,
  );
  const rowIndexByTaskId = new Map(visibleTasks.map((entry, index) => [entry.task.id, index]));
  const monthBands = getMonthBands(chartRange.startDate, chartRange.endDate);
  const tickDates = getTickDates(chartRange.startDate, chartRange.endDate, zoom);
  const selectedVarianceDays = selectedTask ? getVarianceDays(selectedTask) : 0;
  const criticalCount = project.tasks.filter((task) => task.isCritical).length;
  const milestoneCount = project.tasks.filter((task) => task.kind === "milestone").length;
  const selectedPredecessors = project.dependencies.filter(
    (dependency) => dependency.toTaskId === selectedTask?.id,
  );
  const predecessorCandidates = project.tasks.filter(
    (task) =>
      task.id !== selectedTask?.id &&
      (!selectedTask || !isDescendantTask(project.tasks, selectedTask.id, task.id)),
  );
  const predecessorLabels = new Map(
    project.tasks.map((task) => [task.id, getDependencyLabel(project.tasks, project.dependencies, task.id, "pre")]),
  );
  const successorLabels = new Map(
    project.tasks.map((task) => [task.id, getDependencyLabel(project.tasks, project.dependencies, task.id, "post")]),
  );
  const selectedTaskPath = getTaskPath(project.dependencies, selectedTask.id);

  useEffect(() => {
    if (
      pendingPredecessorTaskId &&
      predecessorCandidates.some((task) => task.id === pendingPredecessorTaskId)
    ) {
      return;
    }

    const availableCandidate = predecessorCandidates.find(
      (task) =>
        !selectedPredecessors.some((dependency) => dependency.fromTaskId === task.id),
    );

    setPendingPredecessorTaskId(availableCandidate?.id ?? "");
  }, [pendingPredecessorTaskId, predecessorCandidates, selectedPredecessors]);

  if (!selectedTask) {
    return null;
  }

  function selectTask(taskId: string, message?: string) {
    setProject((current) => ({
      ...current,
      selectedTaskId: taskId,
    }));

    if (message) {
      setStatusMessage();
    }
  }

  function updateTask(taskId: string, updater: (task: GanttTask) => GanttTask, message?: string) {
    setProject((current) => ({
      ...current,
      tasks: applyTaskMutation(current.tasks, current.dependencies, taskId, updater),
      selectedTaskId: taskId,
    }));

    if (message) {
      setStatusMessage();
    }
  }

  function toggleSummary(taskId: string) {
    const willCollapse = !collapsedIds.includes(taskId);

    setCollapsedIds((current) =>
      current.includes(taskId) ? current.filter((item) => item !== taskId) : [...current, taskId],
    );

    if (willCollapse && isDescendantTask(project.tasks, taskId, selectedTaskId)) {
      setProject((current) => ({
        ...current,
        selectedTaskId: taskId,
      }));
    }

    setStatusMessage();
  }

  function resetDemo() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }

    dragStateRef.current = null;
    columnResizeRef.current = null;
    paneResizeRef.current = null;
    setProject(seededProject);
    setCollapsedIds(
      seededProject.tasks
        .filter((task) => task.kind === "summary" && task.expanded === false)
        .map((task) => task.id),
    );
    setZoom("week");
    setShowBaseline(true);
    setShowCriticalPath(true);
    setShowNonWorking(true);
    setColumnWidths(getDefaultColumnWidths());
    setLeftPaneWidth(defaultLeftPaneWidth);
    setStatusMessage();
  }

  function createTask(kind: "task" | "milestone") {
    const outcome = createTaskFromSelection(
      project.tasks,
      project.dependencies,
      selectedTask.id,
      kind,
    );

    setProject((current) => ({
      ...current,
      tasks: outcome.tasks,
      selectedTaskId: outcome.createdTaskId,
    }));

    if (selectedTask.kind === "summary" && collapsedIds.includes(selectedTask.id)) {
      setCollapsedIds((current) => current.filter((item) => item !== selectedTask.id));
    }

    setStatusMessage();
  }

  function deleteTask() {
    const outcome = deleteTaskBranch(project.tasks, project.dependencies, selectedTask.id);

    if (!outcome) {
      setStatusMessage();
      return;
    }

    setProject((current) => ({
      ...current,
      tasks: outcome.tasks,
      dependencies: outcome.dependencies,
      selectedTaskId: outcome.nextSelectedTaskId,
    }));
    setCollapsedIds((current) =>
      current.filter((item) => !outcome.deletedTaskIds.includes(item)),
    );
    setStatusMessage();
  }

  function addPredecessor() {
    if (!pendingPredecessorTaskId) {
      setStatusMessage();
      return;
    }

    if (
      selectedPredecessors.some(
        (dependency) => dependency.fromTaskId === pendingPredecessorTaskId,
      )
    ) {
      setStatusMessage();
      return;
    }

    if (
      wouldCreateDependencyCycle(
        project.dependencies,
        pendingPredecessorTaskId,
        selectedTask.id,
      )
    ) {
      setStatusMessage();
      return;
    }

    setProject((current) => ({
      ...current,
      ...applyDependencyMutation(current.tasks, current.dependencies, (dependencies) => [
        ...dependencies,
        {
          id: createDependencyId(dependencies),
          fromTaskId: pendingPredecessorTaskId,
          toTaskId: selectedTask.id,
          kind: pendingPredecessorKind,
          isDriving: pendingPredecessorKind === "FS",
        },
      ]),
    }));
    setStatusMessage();
  }

  function updatePredecessorKind(dependencyId: string, kind: GanttDependencyKind) {
    setProject((current) => ({
      ...current,
      ...applyDependencyMutation(current.tasks, current.dependencies, (dependencies) =>
        dependencies.map((dependency) =>
          dependency.id === dependencyId
            ? { ...dependency, kind, isDriving: kind === "FS" }
            : dependency,
        ),
      ),
    }));
    setStatusMessage();
  }

  function removePredecessor(dependencyId: string) {
    setProject((current) => ({
      ...current,
      ...applyDependencyMutation(current.tasks, current.dependencies, (dependencies) =>
        dependencies.filter((dependency) => dependency.id !== dependencyId),
      ),
    }));
    setStatusMessage();
  }

  function startChartLink(taskId: string, fromEdge: LinkEdge) {
    setProject((current) => ({
      ...current,
      selectedTaskId: taskId,
    }));
    setChartLinkDraft({ fromTaskId: taskId, fromEdge });
  }

  function completeChartLink(toTaskId: string, toEdge: LinkEdge) {
    if (!chartLinkDraft) {
      return;
    }

    if (chartLinkDraft.fromTaskId === toTaskId) {
      setChartLinkDraft(null);
      return;
    }

    if (
      project.dependencies.some(
        (dependency) =>
          dependency.fromTaskId === chartLinkDraft.fromTaskId &&
          dependency.toTaskId === toTaskId,
      )
    ) {
      setChartLinkDraft(null);
      return;
    }

    if (
      wouldCreateDependencyCycle(
        project.dependencies,
        chartLinkDraft.fromTaskId,
        toTaskId,
      )
    ) {
      setChartLinkDraft(null);
      return;
    }

    const kind = getDependencyKindFromEdges(chartLinkDraft.fromEdge, toEdge);

    setProject((current) => ({
      ...current,
      selectedTaskId: toTaskId,
      ...applyDependencyMutation(current.tasks, current.dependencies, (dependencies) => [
        ...dependencies,
        {
          id: createDependencyId(dependencies),
          fromTaskId: chartLinkDraft.fromTaskId,
          toTaskId,
          kind,
          isDriving: kind === "FS",
        },
      ]),
    }));
    setChartLinkDraft(null);
    setStatusMessage();
  }

  const selectedTaskJson = JSON.stringify(selectedTask, null, 2);

  return (
    <section className="space-y-5">
      <div className="mockup-section-shell overflow-hidden">
        <div className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(250,253,253,0.96),rgba(240,247,247,0.82))] px-5 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="space-y-2">
                <h2 className="text-[1.6rem] font-medium tracking-[-0.04em] text-[#26323a]">
                  {project.name}
                </h2>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[920px] xl:grid-cols-4">
              {[
                {
                  label: "Tasks",
                  value: String(project.tasks.length),
                  note: `${milestoneCount} milestones in demo data`,
                },
                {
                  label: "Critical Tasks",
                  value: String(criticalCount),
                  note: showCriticalPath
                    ? "Critical highlighting enabled"
                    : "Critical highlighting hidden",
                },
                {
                  label: "Timeline Range",
                  value: `${chartRange.totalDays + 1}d`,
                  note: `${formatDate(chartRange.startDate)} to ${formatDate(chartRange.endDate)}`,
                },
                {
                  label: "Selected Variance",
                  value: `${selectedVarianceDays > 0 ? "+" : ""}${selectedVarianceDays}d`,
                  note: selectedTask.baselineFinishDate
                    ? `Against baseline finish ${formatDate(selectedTask.baselineFinishDate)}`
                    : "No baseline stored for this task",
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.4rem] border border-border/70 bg-white/88 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                >
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7c8791]">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-[1.55rem] font-semibold tracking-[-0.05em] text-[#23313a]">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[0.82rem] text-[#68737e]">{metric.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(["day", "week", "month"] as const).map((viewZoom) => (
              <button
                key={viewZoom}
                type="button"
                onClick={() => {
                  setZoom(viewZoom);
                  setStatusMessage();
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium capitalize",
                  viewZoom === zoom
                    ? "border-primary/20 bg-primary/12 text-primary"
                    : "border-border bg-white/86 text-[#59636d]",
                )}
              >
                {viewZoom} View
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setShowBaseline((current) => !current);
                setStatusMessage();
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                showBaseline
                  ? "border-slate-200 bg-slate-100 text-slate-700"
                  : "border-border bg-white/86 text-[#59636d]",
              )}
            >
              Baseline {showBaseline ? "On" : "Off"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowCriticalPath((current) => !current);
                setStatusMessage();
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                showCriticalPath
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-border bg-white/86 text-[#59636d]",
              )}
            >
              Critical Path {showCriticalPath ? "On" : "Off"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowNonWorking((current) => !current);
                setStatusMessage();
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                showNonWorking
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-border bg-white/86 text-[#59636d]",
              )}
            >
              Non-working {showNonWorking ? "On" : "Off"}
            </button>

            <button
              type="button"
              onClick={resetDemo}
              className="rounded-full border border-border bg-white/86 px-3 py-1.5 text-[0.78rem] font-medium text-[#59636d]"
            >
              Reset Demo
            </button>
          </div>
        </div>

        <div className="bg-white">
          <div className="border-b border-border/70 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7c8791]">
                  Gantt Workbench
                </div>
              </div>
            </div>
          </div>

          <div
            className="xl:grid xl:gap-0"
            style={{
              gridTemplateColumns: `${leftPaneWidth}px 12px minmax(0, 1fr)`,
            }}
          >
            <div className="bg-[#fbfcfd] xl:border-r-0">
              <div className="border-b border-border/70 px-4 py-3">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7c8791]">
                  Task Table
                </div>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="table-fixed border-collapse text-[0.82rem]"
                  style={{ width: `${taskTableWidth}px` }}
                >
                  <colgroup>
                    {taskTableColumns.map((column) => (
                      <col
                        key={column.key}
                        style={{ width: `${columnWidths[column.key]}px` }}
                      />
                    ))}
                  </colgroup>
                  <thead>
                    <tr className="bg-[#f3f7f9] text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#7d8791]">
                      {taskTableColumns.map((column) => (
                          <th
                            key={column.key}
                            className="relative border-b border-r border-border/60 px-3 py-3 text-left last:border-r-0"
                          >
                            {column.label}
                            <button
                              type="button"
                              aria-label={`Resize ${column.label} column`}
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                columnResizeRef.current = {
                                  key: column.key,
                                  startClientX: event.clientX,
                                  startWidth: columnWidths[column.key],
                                };
                                setStatusMessage();
                              }}
                              className="absolute top-0 right-[-6px] z-10 h-full w-3 cursor-col-resize touch-none"
                            >
                              <span className="absolute top-1/2 right-[5px] h-5 w-px -translate-y-1/2 bg-border/80" />
                            </button>
                          </th>
                        ))}
                    </tr>
                    <tr className="bg-[#f8fbfc] text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#94a0aa]">
                      <th
                        colSpan={2}
                        className="border-b border-r border-border/60 px-3 py-3 text-left"
                      >
                        Structure
                      </th>
                      <th
                        colSpan={4}
                        className="border-b border-r border-border/60 px-3 py-3 text-left"
                      >
                        Schedule
                      </th>
                      <th className="border-b border-r border-border/60 px-3 py-3 text-left">
                        Dependency
                      </th>
                      <th className="border-b border-border/60 px-3 py-3 text-left">
                        Tracking
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTasks.map(({ task, depth }, index) => {
                      const isCollapsed = collapsedIds.includes(task.id);
                      const isSelected = task.id === selectedTask.id;

                      return (
                        <tr
                          key={task.id}
                          onClick={() => selectTask(task.id, `Selected ${task.name}.`)}
                          className={cn(
                            "cursor-pointer border-b border-border/60 align-middle text-[#42505b]",
                            index % 2 === 0 && "bg-white",
                            index % 2 === 1 && "bg-[#fbfcfd]",
                            !isSelected &&
                              selectedTaskPath.taskIds.has(task.id) &&
                              "bg-primary/[0.07] text-[#24414a]",
                            isSelected && "bg-primary/10",
                          )}
                          style={{ height: `${rowHeight}px` }}
                        >
                          <td className="border-r border-border/60 px-3 text-[#6d7780]">{task.wbs}</td>
                          <td className="border-r border-border/60 px-3">
                            <div
                              className={cn(
                                "flex items-center gap-2 overflow-hidden",
                                task.kind === "summary" && "font-semibold text-[#26323a]",
                              )}
                              style={{ paddingLeft: `${depth * 18}px` }}
                            >
                              {task.kind === "summary" ? (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleSummary(task.id);
                                  }}
                                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-white text-[#8a959f]"
                                >
                                  {isCollapsed ? ">" : "v"}
                                </button>
                              ) : (
                                <span className="w-5 shrink-0" />
                              )}
                              <span className="truncate">{task.name}</span>
                            </div>
                          </td>
                          <td className="border-r border-border/60 px-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-medium",
                                task.mode === "manual"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-primary/10 text-primary",
                              )}
                            >
                              {task.mode === "manual" ? "Manual" : "Auto"}
                            </span>
                          </td>
                          <td className="border-r border-border/60 px-3 text-[#5d6872]">
                            {formatDate(task.startDate)}
                          </td>
                          <td className="border-r border-border/60 px-3 text-[#5d6872]">
                            {formatDate(task.finishDate)}
                          </td>
                          <td className="border-r border-border/60 px-3 text-[#5d6872]">
                            {task.durationLabel}
                          </td>
                          <td className="border-r border-border/60 px-3 text-[#5d6872]">
                            <span className="block truncate">
                              {predecessorLabels.get(task.id) || "-"}
                            </span>
                          </td>
                          <td className="px-3 text-right font-medium text-[#2f3d47]">
                            {task.progress}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="hidden xl:flex bg-[#f5f8fa]">
              <button
                type="button"
                aria-label="Resize workbench split"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  paneResizeRef.current = {
                    startClientX: event.clientX,
                    startWidth: leftPaneWidth,
                  };
                  setStatusMessage();
                }}
                className="group relative flex h-full w-full cursor-col-resize touch-none items-center justify-center border-x border-border/70 bg-[linear-gradient(180deg,rgba(250,252,253,0.98),rgba(239,245,247,0.92))]"
              >
                <span className="h-16 w-[2px] rounded-full bg-border/80 transition-colors group-hover:bg-primary" />
              </button>
            </div>

            <div className="min-w-0 bg-[#fcfefe]">
              <div className="border-b border-border/70 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7c8791]">
                    Timeline Chart
                  </div>
                  {chartLinkDraft ? (
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
                        Linking from {chartLinkDraft.fromEdge}
                      </div>
                      <button
                        type="button"
                        onClick={() => setChartLinkDraft(null)}
                        className="rounded-full border border-border bg-white/90 px-3 py-1 text-[0.68rem] font-medium text-[#59636d]"
                      >
                        Cancel Link
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div style={{ width: `${chartSurfaceWidth}px` }}>
                  <div className="relative border-b border-border/70 bg-[#f8fbfc]">
                    <div
                      className="grid border-b border-border/60 text-center text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7d8791]"
                      style={{
                        gridTemplateColumns: monthBands
                          .map((band) => `${band.spanDays * pixelsPerDay}px`)
                          .join(" "),
                      }}
                    >
                      {monthBands.map((band) => (
                        <div
                          key={band.label}
                          className="border-r border-border/60 px-2 py-3 whitespace-nowrap last:border-r-0"
                        >
                          {band.label}
                        </div>
                      ))}
                    </div>
                    <div className="relative h-10" style={{ width: `${chartSurfaceWidth}px` }}>
                      {tickDates.map((tickDate) => (
                        <div
                          key={tickDate}
                          className="absolute top-0 bottom-0 border-r border-border/50 px-2 py-2 text-[0.72rem] text-[#7d8791]"
                          style={{
                            left: `${getOffsetDays(chartRange.startDate, tickDate) * pixelsPerDay}px`,
                          }}
                        >
                          {formatTick(tickDate, zoom)}
                        </div>
                      ))}
                      <div
                        className="absolute top-0 bottom-0 z-10 w-px bg-primary shadow-[0_0_0_1px_rgba(13,148,136,0.15)]"
                        style={{
                          left: `${getOffsetDays(chartRange.startDate, getTodayIso()) * pixelsPerDay}px`,
                        }}
                      />
                      <div
                        className="absolute top-0 z-20 -translate-x-1/2 rounded-b-xl bg-primary px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
                        style={{
                          left: `${getOffsetDays(chartRange.startDate, getTodayIso()) * pixelsPerDay}px`,
                        }}
                      >
                        Today
                      </div>
                    </div>
                  </div>

                  <div
                    className="relative"
                    style={{
                      width: `${chartSurfaceWidth}px`,
                      minHeight: `${visibleTasks.length * rowHeight}px`,
                      backgroundImage:
                        "linear-gradient(to right, rgba(226,232,240,0.88) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,0.65) 1px, transparent 1px)",
                      backgroundSize: `${pixelsPerDay}px 100%, 100% ${rowHeight}px`,
                    }}
                  >
                    {showNonWorking
                      ? getWeekendBands(chartRange.startDate, chartRange.endDate).map((weekend) => (
                          <div
                            key={weekend.startDate}
                            className="absolute top-0 bottom-0 bg-slate-100/70"
                            style={{
                              left: `${getOffsetDays(chartRange.startDate, weekend.startDate) * pixelsPerDay}px`,
                              width: `${weekend.spanDays * pixelsPerDay}px`,
                            }}
                          />
                        ))
                      : null}

                    {visibleTasks.map(({ task }, index) => {
                      const top = index * rowHeight;
                      const segments = task.segments.length > 0 ? task.segments : getSingleSegment(task);
                      const segmentCount = segments.length;
                      const barClass = getBarClass(task, showCriticalPath);
                      const supportsResize = isTaskResizable(task);
                      const supportsMove = task.kind !== "summary";
                      const isOnSelectedPath = selectedTaskPath.taskIds.has(task.id);
                      const showSourceLinkHandles =
                        task.id === selectedTask.id && task.kind !== "summary" && !chartLinkDraft;
                      const showTargetLinkHandles =
                        chartLinkDraft !== null &&
                        task.kind !== "summary" &&
                        task.id !== chartLinkDraft.fromTaskId;

                      return (
                        <Fragment key={`bar-${task.id}`}>
                          {task.id === selectedTask.id ? (
                            <div
                              className="absolute left-0 right-0 bg-primary/10"
                              style={{ top, height: `${rowHeight}px` }}
                            />
                          ) : null}

                          {showBaseline && task.baselineStartDate && task.baselineFinishDate ? (
                            <div
                              className="absolute h-1 rounded-full bg-slate-300"
                              style={{
                                top: `${top + baselineOffsetY}px`,
                                left: `${getOffsetDays(chartRange.startDate, task.baselineStartDate) * pixelsPerDay}px`,
                                width: `${Math.max(
                                  getInclusiveDays(task.baselineStartDate, task.baselineFinishDate) *
                                    pixelsPerDay,
                                  10,
                                )}px`,
                              }}
                            />
                          ) : null}

                          {task.kind === "milestone"
                            ? segments.map((segment) => (
                                <div
                                  key={segment.id}
                                  className="absolute"
                                  style={{
                                    top: `${top + milestoneOffsetY}px`,
                                    left: `${getOffsetDays(chartRange.startDate, segment.startDate) * pixelsPerDay - 8}px`,
                                    width: "16px",
                                    height: "16px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    aria-label={`Milestone ${task.name}`}
                                    onClick={() => selectTask(task.id, `Selected ${task.name}.`)}
                                    onPointerDown={(event) => {
                                      if (!supportsMove) {
                                        return;
                                      }

                                      event.preventDefault();
                                      selectTask(task.id);
                                      dragStateRef.current = {
                                        taskId: task.id,
                                        mode: "move",
                                        startClientX: event.clientX,
                                        pixelsPerDay,
                                        snapshot: task,
                                      };
                                      setStatusMessage();
                                    }}
                                    className={cn(
                                      "absolute h-4 w-4 rotate-45 rounded-[2px] border shadow-sm",
                                      barClass,
                                      isOnSelectedPath && task.id !== selectedTask.id && "ring-2 ring-primary/30",
                                    )}
                                  />
                                  {showSourceLinkHandles ? (
                                    <>
                                      <button
                                        type="button"
                                        aria-label={`Start link handle for ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          startChartLink(task.id, "start");
                                        }}
                                        className="absolute top-1/2 left-[-12px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-primary bg-white shadow-sm"
                                      />
                                      <button
                                        type="button"
                                        aria-label={`Finish link handle for ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          startChartLink(task.id, "finish");
                                        }}
                                        className="absolute top-1/2 right-[-12px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-primary bg-white shadow-sm"
                                      />
                                    </>
                                  ) : null}
                                  {showTargetLinkHandles ? (
                                    <>
                                      <button
                                        type="button"
                                        aria-label={`Link to start of ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          completeChartLink(task.id, "start");
                                        }}
                                        className="absolute top-1/2 left-[-12px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-amber-400 bg-amber-50 shadow-sm"
                                      />
                                      <button
                                        type="button"
                                        aria-label={`Link to finish of ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          completeChartLink(task.id, "finish");
                                        }}
                                        className="absolute top-1/2 right-[-12px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-amber-400 bg-amber-50 shadow-sm"
                                      />
                                    </>
                                  ) : null}
                                </div>
                              ))
                            : null}

                          {task.kind !== "milestone"
                            ? segments.map((segment, segmentIndex) => {
                                const width = Math.max(
                                  getInclusiveDays(segment.startDate, segment.finishDate) * pixelsPerDay,
                                  task.kind === "recurring" ? 12 : 14,
                                );
                                const progressWidth =
                                  task.kind === "summary" || task.kind === "recurring" || task.progress <= 0
                                    ? 0
                                    : Math.round((width * task.progress) / 100);

                                return (
                                  <div
                                    key={segment.id}
                                    className="absolute"
                                    style={{
                                      top: `${top + (task.kind === "recurring" ? recurringBarOffsetY : standardBarOffsetY)}px`,
                                      left: `${getOffsetDays(chartRange.startDate, segment.startDate) * pixelsPerDay}px`,
                                      width: `${width}px`,
                                      height: `${task.kind === "recurring" ? 12 : 16}px`,
                                    }}
                                  >
                                    <button
                                      type="button"
                                      aria-label={`Task ${task.name}`}
                                      onClick={() => selectTask(task.id, `Selected ${task.name}.`)}
                                      onPointerDown={(event) => {
                                        if (!supportsMove) {
                                          return;
                                        }

                                        event.preventDefault();
                                        selectTask(task.id);
                                        dragStateRef.current = {
                                          taskId: task.id,
                                          mode: "move",
                                          startClientX: event.clientX,
                                          pixelsPerDay,
                                          snapshot: task,
                                        };
                                        setStatusMessage();
                                      }}
                                      className={cn(
                                        "absolute overflow-hidden border shadow-[0_3px_10px_rgba(15,23,42,0.08)] touch-none",
                                        task.kind === "summary"
                                          ? "h-4 rounded-sm"
                                          : task.kind === "recurring"
                                            ? "h-3 rounded-full"
                                            : task.mode === "manual"
                                            ? "h-4 rounded-full border-dashed bg-white"
                                            : "h-4 rounded-full",
                                        barClass,
                                        isOnSelectedPath &&
                                          task.id !== selectedTask.id &&
                                          "ring-2 ring-primary/25",
                                      )}
                                      style={{ width: `${width}px` }}
                                    >
                                      {progressWidth > 0 ? (
                                        <div className="h-full bg-black/18" style={{ width: `${progressWidth}px` }} />
                                      ) : null}
                                    </button>

                                    {supportsResize && segmentIndex === 0 ? (
                                      <>
                                        <button
                                          type="button"
                                          aria-label={`Resize start ${task.name}`}
                                          onPointerDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            selectTask(task.id);
                                            dragStateRef.current = {
                                              taskId: task.id,
                                              mode: "resize-start",
                                              startClientX: event.clientX,
                                              pixelsPerDay,
                                              snapshot: task,
                                            };
                                            setStatusMessage();
                                          }}
                                          className="absolute top-0 left-0 h-4 w-1.5 rounded-full bg-white/90 shadow cursor-ew-resize"
                                        />
                                        <button
                                          type="button"
                                          aria-label={`Resize end ${task.name}`}
                                          onPointerDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            selectTask(task.id);
                                            dragStateRef.current = {
                                              taskId: task.id,
                                              mode: "resize-end",
                                              startClientX: event.clientX,
                                              pixelsPerDay,
                                              snapshot: task,
                                            };
                                            setStatusMessage();
                                          }}
                                          className="absolute top-0 right-0 h-4 w-1.5 rounded-full bg-white/90 shadow cursor-ew-resize"
                                        />
                                      </>
                                    ) : null}

                                    {showSourceLinkHandles && segmentIndex === 0 ? (
                                      <button
                                        type="button"
                                        aria-label={`Start link handle for ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          startChartLink(task.id, "start");
                                        }}
                                        className="absolute top-1/2 left-[-10px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-primary bg-white shadow-sm"
                                      />
                                    ) : null}

                                    {showSourceLinkHandles && segmentIndex === segmentCount - 1 ? (
                                      <button
                                        type="button"
                                        aria-label={`Finish link handle for ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          startChartLink(task.id, "finish");
                                        }}
                                        className="absolute top-1/2 right-[-10px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-primary bg-white shadow-sm"
                                      />
                                    ) : null}

                                    {showTargetLinkHandles && segmentIndex === 0 ? (
                                      <button
                                        type="button"
                                        aria-label={`Link to start of ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          completeChartLink(task.id, "start");
                                        }}
                                        className="absolute top-1/2 left-[-10px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-amber-400 bg-amber-50 shadow-sm"
                                      />
                                    ) : null}

                                    {showTargetLinkHandles && segmentIndex === segmentCount - 1 ? (
                                      <button
                                        type="button"
                                        aria-label={`Link to finish of ${task.name}`}
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          completeChartLink(task.id, "finish");
                                        }}
                                        className="absolute top-1/2 right-[-10px] z-20 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-amber-400 bg-amber-50 shadow-sm"
                                      />
                                    ) : null}

                                    {segmentIndex === 0 ? (
                                      <div
                                        className="pointer-events-none absolute left-0 max-w-[180px] truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#6a7680]"
                                        style={{ top: `${taskLabelOffsetY}px` }}
                                      >
                                        {task.name}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })
                            : null}
                        </Fragment>
                      );
                    })}

                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={chartSurfaceWidth}
                      height={visibleTasks.length * rowHeight}
                      viewBox={`0 0 ${chartSurfaceWidth} ${visibleTasks.length * rowHeight}`}
                      fill="none"
                    >
                      {project.dependencies
                        .filter(
                          (dependency) =>
                            rowIndexByTaskId.has(dependency.fromTaskId) &&
                            rowIndexByTaskId.has(dependency.toTaskId),
                        )
                        .map((dependency) => {
                          const fromTask = project.tasks.find((task) => task.id === dependency.fromTaskId);
                          const toTask = project.tasks.find((task) => task.id === dependency.toTaskId);
                          const fromIndex = rowIndexByTaskId.get(dependency.fromTaskId);
                          const toIndex = rowIndexByTaskId.get(dependency.toTaskId);

                          if (!fromTask || !toTask || fromIndex === undefined || toIndex === undefined) {
                            return null;
                          }

                          const fromSegments =
                            fromTask.segments.length > 0 ? fromTask.segments : getSingleSegment(fromTask);
                          const toSegments =
                            toTask.segments.length > 0 ? toTask.segments : getSingleSegment(toTask);
                          const fromSegment = fromSegments[fromSegments.length - 1];
                          const toSegment = toSegments[0];

                          if (!fromSegment || !toSegment) {
                            return null;
                          }

                          const fromX = getDependencyAnchorX(
                            chartRange.startDate,
                            fromSegment,
                            dependency.kind,
                            "from",
                            pixelsPerDay,
                          );
                          const toX = getDependencyAnchorX(
                            chartRange.startDate,
                            toSegment,
                            dependency.kind,
                            "to",
                            pixelsPerDay,
                          );
                          const fromY = fromIndex * rowHeight + rowHeight / 2;
                          const toY = toIndex * rowHeight + rowHeight / 2;
                          const routeOffset = fromX <= toX ? 18 : 24;
                          const elbowX =
                            fromX <= toX ? Math.max(fromX + routeOffset, toX - 18) : fromX + routeOffset;
                          const isOnSelectedPath = selectedTaskPath.dependencyIds.has(dependency.id);

                          return (
                            <g key={dependency.id}>
                              <path
                                d={`M ${fromX} ${fromY} H ${elbowX} V ${toY} H ${toX}`}
                                className={cn(
                                  "fill-none stroke-[1.5]",
                                  isOnSelectedPath && "stroke-primary",
                                  dependency.isDriving && showCriticalPath
                                    ? "stroke-rose-400"
                                    : "stroke-slate-400",
                                )}
                              />
                              <circle
                                cx={toX}
                                cy={toY}
                                r="3"
                                className={cn(
                                  isOnSelectedPath && "fill-primary",
                                  dependency.isDriving && showCriticalPath
                                    ? "fill-rose-400"
                                    : "fill-slate-400",
                                )}
                              />
                            </g>
                          );
                        })}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(251,253,253,0.95),rgba(244,248,249,0.92))] px-5 py-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
              <div className="rounded-[1.35rem] border border-border/70 bg-white/94 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                      Task Inspector
                    </div>
                  </div>
                  <div className="rounded-full border border-border/70 bg-[#f8fbfc] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#66727d]">
                    {selectedTask.kind === "summary" ? "Rollup task" : "Editable task"}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => createTask("task")}
                    className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1.5 text-[0.78rem] font-medium text-primary"
                  >
                    New Task
                  </button>
                  <button
                    type="button"
                    onClick={() => createTask("milestone")}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[0.78rem] font-medium text-emerald-700"
                  >
                    New Milestone
                  </button>
                  <button
                    type="button"
                    onClick={deleteTask}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[0.78rem] font-medium text-rose-700"
                  >
                    Delete {selectedTask.kind === "summary" ? "Branch" : "Task"}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Task Name
                    </div>
                    <input
                      value={selectedTask.name}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => ({ ...task, name: event.target.value }),
                          `Updated task name for ${selectedTask.wbs}.`,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0"
                    />
                  </label>

                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Mode
                    </div>
                    <select
                      value={selectedTask.mode}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => ({
                            ...task,
                            mode: event.target.value as GanttTask["mode"],
                          }),
                          `Updated scheduling mode for ${selectedTask.name}.`,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0"
                    >
                      <option value="auto">Auto scheduled</option>
                      <option value="manual">Manual</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Start
                    </div>
                    <input
                      type="date"
                      value={selectedTask.startDate}
                      disabled={selectedTask.kind === "summary"}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => applyTaskDateInput(task, "start", event.target.value),
                          `Updated start date for ${selectedTask.name}.`,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </label>

                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Finish
                    </div>
                    <input
                      type="date"
                      value={selectedTask.finishDate}
                      disabled={selectedTask.kind === "summary"}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => applyTaskDateInput(task, "finish", event.target.value),
                          `Updated finish date for ${selectedTask.name}.`,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </label>

                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Progress
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedTask.progress}
                        onChange={(event) =>
                          updateTask(
                            selectedTask.id,
                            (task) => ({
                              ...task,
                              progress: Number(event.target.value),
                            }),
                            `Updated progress for ${selectedTask.name}.`,
                          )
                        }
                        className="flex-1"
                      />
                      <span className="w-12 text-right text-[0.84rem] font-medium text-[#33414b]">
                        {selectedTask.progress}%
                      </span>
                    </div>
                  </label>

                  <label className="space-y-2">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                      Resources
                    </div>
                    <input
                      value={selectedTask.resourceNames}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => ({ ...task, resourceNames: event.target.value }),
                          `Updated resource assignment for ${selectedTask.name}.`,
                        )
                      }
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0"
                    />
                  </label>
                </div>

                <label className="mt-4 block space-y-2">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                    Note
                  </div>
                  <textarea
                    value={selectedTask.note}
                    onChange={(event) =>
                      updateTask(
                        selectedTask.id,
                        (task) => ({ ...task, note: event.target.value }),
                        `Updated task note for ${selectedTask.name}.`,
                      )
                    }
                    rows={3}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.88rem] text-[#33414b] outline-none ring-0"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-[0.82rem] text-[#44515c]">
                    <input
                      type="checkbox"
                      checked={selectedTask.isCritical}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => ({ ...task, isCritical: event.target.checked }),
                          `Updated critical-path flag for ${selectedTask.name}.`,
                        )
                      }
                    />
                    Critical
                  </label>

                  <label className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-[0.82rem] text-[#44515c]">
                    <input
                      type="checkbox"
                      checked={selectedTask.onTimeline}
                      onChange={(event) =>
                        updateTask(
                          selectedTask.id,
                          (task) => ({ ...task, onTimeline: event.target.checked }),
                          `Updated timeline pin for ${selectedTask.name}.`,
                        )
                      }
                    />
                    Pinned To Timeline
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.35rem] border border-border/70 bg-white/94 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                    Dependency & Tracking
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      ["WBS", selectedTask.wbs],
                      ["Kind", toTitleCase(selectedTask.kind)],
                      ["Duration", selectedTask.durationLabel],
                      ["Baseline", selectedTask.baselineFinishDate ? formatDate(selectedTask.baselineFinishDate) : "Not set"],
                      ["Predecessors", predecessorLabels.get(selectedTask.id) || "None"],
                      ["Successors", successorLabels.get(selectedTask.id) || "None"],
                      ["Variance", `${selectedVarianceDays > 0 ? "+" : ""}${selectedVarianceDays}d`],
                      ["Resources", selectedTask.resourceNames || "Unassigned"],
                    ].map(([label, value]) => (
                      <div key={label} className="space-y-1">
                        <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                          {label}
                        </div>
                        <div className="text-[0.88rem] leading-5 text-[#33414b]">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-border/70 bg-white/94 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                      Predecessors
                    </div>
                  </div>
                    <div className="rounded-full border border-border/70 bg-[#f8fbfc] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#66727d]">
                      {selectedPredecessors.length} linked
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedPredecessors.length > 0 ? (
                      selectedPredecessors.map((dependency) => {
                        const predecessorTask = project.tasks.find(
                          (task) => task.id === dependency.fromTaskId,
                        );

                        if (!predecessorTask) {
                          return null;
                        }

                        return (
                          <div
                            key={dependency.id}
                            className="flex flex-wrap items-center gap-3 rounded-[1rem] border border-border/70 bg-[#fbfcfd] px-3 py-3"
                          >
                            <div className="min-w-[170px] flex-1">
                              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                                Predecessor Task
                              </div>
                              <div className="mt-1 text-[0.88rem] text-[#33414b]">
                                {predecessorTask.wbs} {predecessorTask.name}
                              </div>
                            </div>
                            <label className="space-y-1">
                              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                                Link Type
                              </div>
                              <select
                                value={dependency.kind}
                                onChange={(event) =>
                                  updatePredecessorKind(
                                    dependency.id,
                                    event.target.value as GanttDependencyKind,
                                  )
                                }
                                className="rounded-xl border border-border bg-white px-3 py-2 text-[0.84rem] text-[#33414b] outline-none ring-0"
                              >
                                <option value="FS">Finish to Start</option>
                                <option value="SS">Start to Start</option>
                                <option value="FF">Finish to Finish</option>
                                <option value="SF">Start to Finish</option>
                              </select>
                            </label>
                            <button
                              type="button"
                              onClick={() => removePredecessor(dependency.id)}
                              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[0.78rem] font-medium text-rose-700"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-[1rem] border border-dashed border-border/80 bg-[#fbfcfd] px-3 py-4 text-[0.84rem] text-[#61707c]">
                        No predecessors linked to this task.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_auto]">
                    <label className="space-y-1">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                        Add Predecessor
                      </div>
                      <select
                        value={pendingPredecessorTaskId}
                        onChange={(event) => setPendingPredecessorTaskId(event.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.84rem] text-[#33414b] outline-none ring-0"
                      >
                        {predecessorCandidates
                          .filter(
                            (task) =>
                              !selectedPredecessors.some(
                                (dependency) => dependency.fromTaskId === task.id,
                              ),
                          )
                          .map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.wbs} {task.name}
                            </option>
                          ))}
                        {predecessorCandidates.filter(
                          (task) =>
                            !selectedPredecessors.some(
                              (dependency) => dependency.fromTaskId === task.id,
                            ),
                        ).length === 0 ? <option value="">No available tasks</option> : null}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                        Type
                      </div>
                      <select
                        value={pendingPredecessorKind}
                        onChange={(event) =>
                          setPendingPredecessorKind(event.target.value as GanttDependencyKind)
                        }
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 text-[0.84rem] text-[#33414b] outline-none ring-0"
                      >
                        <option value="FS">FS</option>
                        <option value="SS">SS</option>
                        <option value="FF">FF</option>
                        <option value="SF">SF</option>
                      </select>
                    </label>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={addPredecessor}
                        disabled={!pendingPredecessorTaskId}
                        className="rounded-full border border-primary/20 bg-primary/12 px-3 py-2 text-[0.78rem] font-medium text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-border/70 bg-white/94 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                    Selected Task JSON
                  </div>
                  <div className="mt-3 rounded-[1rem] bg-[#0f172a] p-4">
                    <pre className="overflow-x-auto text-[0.74rem] leading-6 text-slate-100">
                      {selectedTaskJson}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function hydrateProject(project: GanttProject): GanttProject {
  const tasks = prepareTaskCollection(project.tasks, project.dependencies);

  return {
    ...project,
    tasks,
    selectedTaskId: project.selectedTaskId ?? tasks[0]?.id ?? null,
  };
}

function applyTaskMutation(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
  taskId: string,
  updater: (task: GanttTask) => GanttTask,
) {
  return prepareTaskCollection(
    tasks.map((task) => (task.id === taskId ? normalizeTask(updater(task)) : task)),
    dependencies,
  );
}

function applyDependencyMutation(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
  updater: (dependencies: GanttProject["dependencies"]) => GanttProject["dependencies"],
) {
  const nextDependencies = updater(dependencies);

  return {
    tasks: prepareTaskCollection(tasks, nextDependencies),
    dependencies: nextDependencies,
  };
}

function createTaskFromSelection(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
  selectedTaskId: string,
  kind: "task" | "milestone",
) {
  const orderedTasks = [...tasks].sort((left, right) => left.order - right.order);
  const selectedTask = orderedTasks.find((task) => task.id === selectedTaskId) ?? orderedTasks[0];

  if (!selectedTask) {
    throw new Error("No task available for insertion.");
  }

  const insertionParentId =
    selectedTask.kind === "summary" ? selectedTask.id : selectedTask.parentId;
  const anchorTaskId =
    selectedTask.kind === "summary"
      ? getLastDescendantTaskId(orderedTasks, selectedTask.id)
      : getLastDescendantTaskId(orderedTasks, selectedTask.id);
  const anchorTask = orderedTasks.find((task) => task.id === anchorTaskId) ?? selectedTask;
  const anchorIndex = orderedTasks.findIndex((task) => task.id === anchorTask.id);
  const nextWorkingDate =
    selectedTask.kind === "summary"
      ? selectedTask.startDate
      : addWorkingDays(selectedTask.finishDate, 1);
  const finishDate =
    kind === "milestone" ? nextWorkingDate : addWorkingDays(nextWorkingDate, 4);
  const newTaskId = createTaskId(orderedTasks);
  const newTask = normalizeTask({
    id: newTaskId,
    parentId: insertionParentId,
    order: anchorTask.order + 0.5,
    wbs: "",
    name: kind === "milestone" ? "New Milestone" : "New Task",
    kind,
    mode: "auto",
    startDate: nextWorkingDate,
    finishDate,
    durationLabel: kind === "milestone" ? "0d" : "5d",
    durationDays: kind === "milestone" ? 0 : 5,
    progress: 0,
    resourceNames: "",
    note: "",
    tone: kind === "milestone" ? "success" : "default",
    expanded: true,
    onTimeline: true,
    isCritical: false,
    baselineStartDate: nextWorkingDate,
    baselineFinishDate: finishDate,
    segments: [
      {
        id: `${newTaskId}-segment-1`,
        startDate: nextWorkingDate,
        finishDate: kind === "milestone" ? nextWorkingDate : finishDate,
      },
    ],
  });

  const nextTasks = [...orderedTasks];
  nextTasks.splice(anchorIndex + 1, 0, newTask);

  return {
    tasks: prepareTaskCollection(nextTasks, dependencies),
    createdTaskId: newTaskId,
  };
}

function deleteTaskBranch(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
  selectedTaskId: string,
) {
  if (tasks.length <= 1) {
    return null;
  }

  const orderedTasks = [...tasks].sort((left, right) => left.order - right.order);
  const deletedTaskIds = getTaskBranchIds(orderedTasks, selectedTaskId);
  const remainingTasks = orderedTasks.filter((task) => !deletedTaskIds.includes(task.id));

  if (remainingTasks.length === 0) {
    return null;
  }

  const nextSelectedTaskId =
    orderedTasks
      .slice(0, orderedTasks.findIndex((task) => task.id === selectedTaskId))
      .filter((task) => !deletedTaskIds.includes(task.id))
      .at(-1)?.id ??
    remainingTasks[0]?.id ??
    null;

  return {
    tasks: prepareTaskCollection(remainingTasks, dependencies.filter(
      (dependency) =>
        !deletedTaskIds.includes(dependency.fromTaskId) &&
        !deletedTaskIds.includes(dependency.toTaskId),
    )),
    dependencies: dependencies.filter(
      (dependency) =>
        !deletedTaskIds.includes(dependency.fromTaskId) &&
        !deletedTaskIds.includes(dependency.toTaskId),
    ),
    deletedTaskIds,
    nextSelectedTaskId,
  };
}

function rollupSummaryTasks(tasks: GanttTask[]) {
  const nextTasks = tasks
    .map((task) => ({
      ...task,
      segments: task.segments.map((segment) => ({ ...segment })),
    }))
    .sort((left, right) => left.order - right.order);
  const childrenByParentId = new Map<string, GanttTask[]>();

  nextTasks.forEach((task) => {
    if (!task.parentId) {
      return;
    }

    const children = childrenByParentId.get(task.parentId) ?? [];
    children.push(task);
    childrenByParentId.set(task.parentId, children);
  });

  const summaryTasks = nextTasks
    .filter((task) => task.kind === "summary")
    .sort((left, right) => getTaskDepth(nextTasks, right.id) - getTaskDepth(nextTasks, left.id));

  summaryTasks.forEach((summaryTask) => {
    const children = childrenByParentId.get(summaryTask.id) ?? [];

    if (children.length === 0) {
      return;
    }

    const startDate = children
      .map((child) => child.startDate)
      .sort(compareIsoDates)[0];
    const finishDate = children
      .map((child) => child.finishDate)
      .sort(compareIsoDates)
      .at(-1);

    if (!startDate || !finishDate) {
      return;
    }

    const baselineDates = children.flatMap((child) => [
      child.baselineStartDate,
      child.baselineFinishDate,
    ]);
    const filteredBaselineDates = baselineDates.filter(Boolean) as string[];
    const progressWeight = children.reduce(
      (sum, child) => sum + Math.max(child.durationDays, child.kind === "milestone" ? 1 : 1),
      0,
    );
    const progress =
      progressWeight > 0
        ? Math.round(
            children.reduce(
              (sum, child) =>
                sum + child.progress * Math.max(child.durationDays, child.kind === "milestone" ? 1 : 1),
              0,
            ) / progressWeight,
          )
        : 0;
    const resources = Array.from(
      new Set(
        children.flatMap((child) =>
          child.resourceNames
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean),
        ),
      ),
    );

    summaryTask.startDate = startDate;
    summaryTask.finishDate = finishDate;
    summaryTask.durationDays = getWorkingDaysInclusive(startDate, finishDate);
    summaryTask.durationLabel = `${summaryTask.durationDays}d`;
    summaryTask.progress = progress;
    summaryTask.resourceNames = resources.join(", ");
    summaryTask.isCritical = children.some((child) => child.isCritical);
    summaryTask.onTimeline = children.some((child) => child.onTimeline);
    summaryTask.baselineStartDate = filteredBaselineDates
      .filter((date) => date <= finishDate)
      .sort(compareIsoDates)[0];
    summaryTask.baselineFinishDate = filteredBaselineDates.sort(compareIsoDates).at(-1);
    summaryTask.segments = [
      {
        id: `${summaryTask.id}-rollup`,
        startDate,
        finishDate,
      },
    ];
  });

  return nextTasks;
}

function recalculateAutoSchedule(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
) {
  const scheduledTasks = tasks
    .map((task) => ({
      ...task,
      segments: task.segments.map((segment) => ({ ...segment })),
    }))
    .sort((left, right) => left.order - right.order);
  const incomingByTaskId = new Map<string, GanttProject["dependencies"]>();

  dependencies.forEach((dependency) => {
    const items = incomingByTaskId.get(dependency.toTaskId) ?? [];
    items.push(dependency);
    incomingByTaskId.set(dependency.toTaskId, items);
  });

  for (let pass = 0; pass < scheduledTasks.length * 2; pass += 1) {
    let changed = false;
    const taskById = new Map(scheduledTasks.map((task) => [task.id, task]));

    scheduledTasks.forEach((task, index) => {
      if (task.kind === "summary" || task.mode === "manual") {
        return;
      }

      const incomingDependencies = incomingByTaskId.get(task.id) ?? [];

      if (incomingDependencies.length === 0) {
        return;
      }

      let nextTask = task;
      let constrainedStartDate = task.startDate;
      let constrainedFinishDate = task.finishDate;

      incomingDependencies.forEach((dependency) => {
        const predecessorTask = taskById.get(dependency.fromTaskId);

        if (!predecessorTask) {
          return;
        }

        switch (dependency.kind) {
          case "FS":
            constrainedStartDate = maxIsoDate(
              constrainedStartDate,
              getNextWorkingDate(predecessorTask.finishDate),
            );
            break;
          case "SS":
            constrainedStartDate = maxIsoDate(
              constrainedStartDate,
              predecessorTask.startDate,
            );
            break;
          case "FF":
            constrainedFinishDate = maxIsoDate(
              constrainedFinishDate,
              predecessorTask.finishDate,
            );
            break;
          case "SF":
            constrainedFinishDate = maxIsoDate(
              constrainedFinishDate,
              predecessorTask.startDate,
            );
            break;
        }
      });

      if (compareIsoDates(constrainedStartDate, nextTask.startDate) > 0) {
        nextTask = scheduleTaskToStart(nextTask, constrainedStartDate);
      }

      if (compareIsoDates(constrainedFinishDate, nextTask.finishDate) > 0) {
        nextTask = scheduleTaskToFinish(nextTask, constrainedFinishDate);
      }

      if (
        nextTask.startDate !== task.startDate ||
        nextTask.finishDate !== task.finishDate
      ) {
        scheduledTasks[index] = nextTask;
        changed = true;
      }
    });

    if (!changed) {
      break;
    }
  }

  return scheduledTasks;
}

function normalizeTask(task: GanttTask) {
  if (task.kind === "summary") {
    return {
      ...task,
      segments:
        task.segments.length > 0
          ? task.segments
          : [
              {
                id: `${task.id}-rollup`,
                startDate: task.startDate,
                finishDate: task.finishDate,
              },
            ],
    };
  }

  if (task.kind === "milestone") {
    return {
      ...task,
      finishDate: task.startDate,
      durationDays: 0,
      durationLabel: "0d",
      segments: [
        {
          id: `${task.id}-segment-1`,
          startDate: task.startDate,
          finishDate: task.startDate,
        },
      ],
    };
  }

  const normalizedSegments =
    task.segments.length > 0
      ? task.segments.map((segment) => ({ ...segment }))
      : [
          {
            id: `${task.id}-segment-1`,
            startDate: task.startDate,
            finishDate: task.finishDate,
          },
        ];

  const normalizedTask = {
    ...task,
    segments: normalizedSegments,
  };

  return syncTaskTiming(
    normalizedTask,
    normalizedSegments[0]?.startDate ?? task.startDate,
    normalizedSegments.at(-1)?.finishDate ?? task.finishDate,
  );
}

function getVisibleTasks(tasks: GanttProject["tasks"], collapsedIds: string[]) {
  const collapsedStack: Array<{ id: string; depth: number }> = [];

  return tasks.flatMap((task) => {
    const depth = getTaskDepth(tasks, task.id);

    while (collapsedStack.length > 0 && collapsedStack[collapsedStack.length - 1]!.depth >= depth) {
      collapsedStack.pop();
    }

    const hidden = collapsedStack.length > 0;

    if (task.kind === "summary" && collapsedIds.includes(task.id)) {
      collapsedStack.push({ id: task.id, depth });
    }

    return hidden ? [] : [{ task, depth }];
  });
}

function getTaskDepth(tasks: GanttProject["tasks"], taskId: string) {
  let depth = 0;
  let current = tasks.find((task) => task.id === taskId);

  while (current?.parentId) {
    depth += 1;
    current = tasks.find((task) => task.id === current?.parentId);
  }

  return depth;
}

function prepareTaskCollection(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
) {
  const normalizedTasks = reindexTasks(tasks).map((task) => normalizeTask(task));
  const scheduledTasks = recalculateAutoSchedule(normalizedTasks, dependencies);

  return rollupSummaryTasks(rebuildWbs(scheduledTasks));
}

function reindexTasks(tasks: GanttProject["tasks"]) {
  return [...tasks]
    .sort((left, right) => left.order - right.order)
    .map((task, index) => ({
      ...task,
      order: index,
    }));
}

function rebuildWbs(tasks: GanttProject["tasks"]) {
  const nextTasks = [...tasks].sort((left, right) => left.order - right.order);
  const counters = new Map<string | null, number>();
  const queue: Array<{ taskId: string | null; prefix: string }> = [{ taskId: null, prefix: "" }];
  const wbsByTaskId = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    const children = nextTasks.filter((task) => task.parentId === current.taskId);

    children.forEach((child) => {
      const nextCount = (counters.get(current.taskId) ?? 0) + 1;
      counters.set(current.taskId, nextCount);
      const wbs = current.prefix ? `${current.prefix}.${nextCount}` : String(nextCount);
      wbsByTaskId.set(child.id, wbs);
      queue.push({ taskId: child.id, prefix: wbs });
    });
  }

  return nextTasks.map((task) => ({
    ...task,
    wbs: wbsByTaskId.get(task.id) ?? task.wbs,
  }));
}

function findNearestVisibleAncestor(
  tasks: GanttProject["tasks"],
  collapsedIds: string[],
  taskId: string,
) {
  let current = tasks.find((task) => task.id === taskId);

  while (current?.parentId) {
    if (collapsedIds.includes(current.parentId)) {
      return current.parentId;
    }

    current = tasks.find((task) => task.id === current?.parentId);
  }

  return null;
}

function isDescendantTask(tasks: GanttProject["tasks"], parentId: string, taskId: string) {
  let current = tasks.find((task) => task.id === taskId);

  while (current?.parentId) {
    if (current.parentId === parentId) {
      return true;
    }

    current = tasks.find((task) => task.id === current?.parentId);
  }

  return false;
}

function getTaskBranchIds(tasks: GanttProject["tasks"], taskId: string) {
  const branchIds = [taskId];

  for (let index = 0; index < branchIds.length; index += 1) {
    const currentId = branchIds[index];
    const children = tasks.filter((task) => task.parentId === currentId).map((task) => task.id);
    branchIds.push(...children);
  }

  return branchIds;
}

function getLastDescendantTaskId(tasks: GanttProject["tasks"], taskId: string) {
  const branchIds = new Set(getTaskBranchIds(tasks, taskId));
  const branchTasks = tasks.filter((task) => branchIds.has(task.id));
  return branchTasks.at(-1)?.id ?? taskId;
}

function getChartRange(tasks: GanttProject["tasks"]) {
  const allDates = tasks.flatMap((task) => [
    task.startDate,
    task.finishDate,
    task.baselineStartDate,
    task.baselineFinishDate,
    ...task.segments.flatMap((segment) => [segment.startDate, segment.finishDate]),
  ]);
  const filteredDates = allDates.filter(Boolean) as string[];
  const sorted = filteredDates.sort(compareIsoDates);
  const startDate = sorted[0] ?? getTodayIso();
  const endDate = sorted.at(-1) ?? getTodayIso();

  return {
    startDate,
    endDate,
    totalDays: getOffsetDays(startDate, endDate),
  };
}

function getWeekendBands(startDate: string, endDate: string) {
  const weekends: Array<{ startDate: string; spanDays: number }> = [];
  let cursor = startDate;

  while (compareIsoDates(cursor, endDate) <= 0) {
    const day = getUtcDay(cursor);

    if (day === 6) {
      weekends.push({
        startDate: cursor,
        spanDays: compareIsoDates(addDays(cursor, 1), endDate) <= 0 ? 2 : 1,
      });
      cursor = addDays(cursor, 2);
      continue;
    }

    if (day === 0) {
      weekends.push({ startDate: cursor, spanDays: 1 });
    }

    cursor = addDays(cursor, 1);
  }

  return weekends;
}

function getMonthBands(startDate: string, endDate: string) {
  const bands: Array<{ label: string; spanDays: number }> = [];
  let cursor = startDate;

  while (compareIsoDates(cursor, endDate) <= 0) {
    const currentDate = toDate(cursor);
    const label = currentDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    let spanDays = 0;
    let bandCursor = cursor;

    while (compareIsoDates(bandCursor, endDate) <= 0) {
      const bandDate = toDate(bandCursor);

      if (
        bandDate.getUTCMonth() !== currentDate.getUTCMonth() ||
        bandDate.getUTCFullYear() !== currentDate.getUTCFullYear()
      ) {
        break;
      }

      spanDays += 1;
      bandCursor = addDays(bandCursor, 1);
    }

    bands.push({ label, spanDays });
    cursor = bandCursor;
  }

  return bands;
}

function getTickDates(startDate: string, endDate: string, zoom: ZoomLevel) {
  const dates: string[] = [];
  let cursor = startDate;
  let index = 0;

  while (compareIsoDates(cursor, endDate) <= 0) {
    if (zoom === "day" || index === 0) {
      dates.push(cursor);
    } else if (zoom === "week" && getUtcDay(cursor) === 1) {
      dates.push(cursor);
    } else if (zoom === "month" && toDate(cursor).getUTCDate() === 1) {
      dates.push(cursor);
    }

    cursor = addDays(cursor, 1);
    index += 1;
  }

  return dates;
}

function getSingleSegment(task: GanttTask) {
  return [
    {
      id: `${task.id}-segment-fallback`,
      startDate: task.startDate,
      finishDate: task.finishDate,
    },
  ];
}

function getDependencyAnchorX(
  chartStartDate: string,
  segment: GanttTaskSegment,
  kind: GanttDependencyKind,
  side: "from" | "to",
  pixelsPerDay: number,
) {
  const useFinishEdge =
    (side === "from" && (kind === "FS" || kind === "FF")) ||
    (side === "to" && (kind === "FF" || kind === "SF"));
  const anchorDate = useFinishEdge ? segment.finishDate : segment.startDate;
  const anchorX = getOffsetDays(chartStartDate, anchorDate) * pixelsPerDay;

  return useFinishEdge ? anchorX + pixelsPerDay : anchorX;
}

function getDependencyKindFromEdges(fromEdge: LinkEdge, toEdge: LinkEdge): GanttDependencyKind {
  if (fromEdge === "start" && toEdge === "start") {
    return "SS";
  }

  if (fromEdge === "start" && toEdge === "finish") {
    return "SF";
  }

  if (fromEdge === "finish" && toEdge === "finish") {
    return "FF";
  }

  return "FS";
}

function getBarClass(task: GanttTask, showCriticalPath: boolean) {
  if (task.isCritical && showCriticalPath) {
    return "border-rose-500 bg-rose-400/92";
  }

  switch (task.tone) {
    case "warn":
      return "border-amber-500 bg-amber-400/92";
    case "success":
      return "border-emerald-500 bg-emerald-400/92";
    case "accent":
      return "border-primary/70 bg-primary/72";
    default:
      return "border-slate-300 bg-slate-300/88";
  }
}

function getVarianceDays(task: GanttTask) {
  if (!task.baselineFinishDate) {
    return 0;
  }

  return getOffsetDays(task.baselineFinishDate, task.finishDate);
}

function getDependencyLabel(
  tasks: GanttProject["tasks"],
  dependencies: GanttProject["dependencies"],
  taskId: string,
  direction: "pre" | "post",
) {
  const relevant = dependencies.filter((dependency) =>
    direction === "pre" ? dependency.toTaskId === taskId : dependency.fromTaskId === taskId,
  );

  return relevant
    .map((dependency) => {
      const linkedTaskId = direction === "pre" ? dependency.fromTaskId : dependency.toTaskId;
      const linkedTask = tasks.find((task) => task.id === linkedTaskId);
      return linkedTask ? `${linkedTask.wbs} ${dependency.kind}` : null;
    })
    .filter(Boolean)
    .join(", ");
}

function getTaskPath(
  dependencies: GanttProject["dependencies"],
  selectedTaskId: string,
) {
  const taskIds = new Set<string>([selectedTaskId]);
  const dependencyIds = new Set<string>();
  const queue = [selectedTaskId];

  while (queue.length > 0) {
    const currentTaskId = queue.shift();

    if (!currentTaskId) {
      continue;
    }

    dependencies.forEach((dependency) => {
      if (dependency.fromTaskId === currentTaskId || dependency.toTaskId === currentTaskId) {
        dependencyIds.add(dependency.id);
      }

      if (dependency.toTaskId === currentTaskId && !taskIds.has(dependency.fromTaskId)) {
        taskIds.add(dependency.fromTaskId);
        queue.push(dependency.fromTaskId);
      }

      if (dependency.fromTaskId === currentTaskId && !taskIds.has(dependency.toTaskId)) {
        taskIds.add(dependency.toTaskId);
        queue.push(dependency.toTaskId);
      }
    });
  }

  return { taskIds, dependencyIds };
}

function wouldCreateDependencyCycle(
  dependencies: GanttProject["dependencies"],
  fromTaskId: string,
  toTaskId: string,
) {
  if (fromTaskId === toTaskId) {
    return true;
  }

  const outgoingByTaskId = new Map<string, string[]>();

  dependencies.forEach((dependency) => {
    const items = outgoingByTaskId.get(dependency.fromTaskId) ?? [];
    items.push(dependency.toTaskId);
    outgoingByTaskId.set(dependency.fromTaskId, items);
  });

  const queue = [toTaskId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentTaskId = queue.shift();

    if (!currentTaskId || visited.has(currentTaskId)) {
      continue;
    }

    if (currentTaskId === fromTaskId) {
      return true;
    }

    visited.add(currentTaskId);
    queue.push(...(outgoingByTaskId.get(currentTaskId) ?? []));
  }

  return false;
}

function createTaskId(tasks: GanttProject["tasks"]) {
  const numericIds = tasks
    .map((task) => Number(task.id))
    .filter((value) => Number.isFinite(value));

  return String((Math.max(0, ...numericIds) || 0) + 1);
}

function createDependencyId(dependencies: GanttProject["dependencies"]) {
  const numericIds = dependencies
    .map((dependency) => Number(dependency.id.replace("dep-", "")))
    .filter((value) => Number.isFinite(value));

  return `dep-${(Math.max(0, ...numericIds) || 0) + 1}`;
}

function getDefaultColumnWidths(): Record<TaskColumnKey, number> {
  return Object.fromEntries(
    taskTableColumns.map((column) => [column.key, column.defaultWidth]),
  ) as Record<TaskColumnKey, number>;
}

function getNormalizedColumnWidths(
  columnWidths: Partial<Record<TaskColumnKey, number>> | undefined,
) {
  const defaults = getDefaultColumnWidths();

  taskTableColumns.forEach((column) => {
    const nextWidth = columnWidths?.[column.key];

    defaults[column.key] =
      typeof nextWidth === "number" && Number.isFinite(nextWidth)
        ? Math.max(column.minWidth, Math.round(nextWidth))
        : column.defaultWidth;
  });

  return defaults;
}

function getNormalizedLeftPaneWidth(width: number | undefined) {
  if (typeof width !== "number" || !Number.isFinite(width)) {
    return defaultLeftPaneWidth;
  }

  return Math.min(maxLeftPaneWidth, Math.max(minLeftPaneWidth, Math.round(width)));
}

function isTaskResizable(task: GanttTask) {
  return (
    task.kind !== "summary" &&
    task.kind !== "milestone" &&
    task.kind !== "recurring" &&
    task.segments.length <= 1
  );
}

function applyTaskDrag(task: GanttTask, mode: DragState["mode"], deltaDays: number) {
  if (deltaDays === 0) {
    return task;
  }

  if (mode === "move") {
    return shiftTask(task, deltaDays);
  }

  if (mode === "resize-start") {
    return resizeTaskStart(task, deltaDays);
  }

  return resizeTaskFinish(task, deltaDays);
}

function shiftTask(task: GanttTask, deltaDays: number) {
  if (task.kind === "summary") {
    return task;
  }

  const shiftedSegments = task.segments.map((segment) => ({
    ...segment,
    startDate: addDays(segment.startDate, deltaDays),
    finishDate: addDays(segment.finishDate, deltaDays),
  }));

  return syncTaskTiming(
    {
      ...task,
      segments: shiftedSegments,
    },
    addDays(task.startDate, deltaDays),
    addDays(task.finishDate, deltaDays),
  );
}

function moveTaskToStart(task: GanttTask, targetStartDate: string) {
  return shiftTask(task, getOffsetDays(task.startDate, targetStartDate));
}

function moveTaskToFinish(task: GanttTask, targetFinishDate: string) {
  return shiftTask(task, getOffsetDays(task.finishDate, targetFinishDate));
}

function scheduleTaskToStart(task: GanttTask, targetStartDate: string) {
  if (task.kind === "milestone") {
    return normalizeTask({
      ...task,
      startDate: getNearestWorkingDate(targetStartDate, "forward"),
      finishDate: getNearestWorkingDate(targetStartDate, "forward"),
      segments: [
        {
          id: task.segments[0]?.id ?? `${task.id}-segment-1`,
          startDate: getNearestWorkingDate(targetStartDate, "forward"),
          finishDate: getNearestWorkingDate(targetStartDate, "forward"),
        },
      ],
    });
  }

  if (task.kind === "task" && task.segments.length <= 1) {
    const startDate = getNearestWorkingDate(targetStartDate, "forward");
    const finishDate =
      task.durationDays <= 1 ? startDate : addWorkingDays(startDate, task.durationDays - 1);

    return normalizeTask({
      ...task,
      startDate,
      finishDate,
      segments: [
        {
          id: task.segments[0]?.id ?? `${task.id}-segment-1`,
          startDate,
          finishDate,
        },
      ],
    });
  }

  return moveTaskToStart(task, targetStartDate);
}

function scheduleTaskToFinish(task: GanttTask, targetFinishDate: string) {
  if (task.kind === "milestone") {
    return normalizeTask({
      ...task,
      startDate: getNearestWorkingDate(targetFinishDate, "backward"),
      finishDate: getNearestWorkingDate(targetFinishDate, "backward"),
      segments: [
        {
          id: task.segments[0]?.id ?? `${task.id}-segment-1`,
          startDate: getNearestWorkingDate(targetFinishDate, "backward"),
          finishDate: getNearestWorkingDate(targetFinishDate, "backward"),
        },
      ],
    });
  }

  if (task.kind === "task" && task.segments.length <= 1) {
    const finishDate = getNearestWorkingDate(targetFinishDate, "backward");
    const startDate =
      task.durationDays <= 1 ? finishDate : addWorkingDays(finishDate, -(task.durationDays - 1));

    return normalizeTask({
      ...task,
      startDate,
      finishDate,
      segments: [
        {
          id: task.segments[0]?.id ?? `${task.id}-segment-1`,
          startDate,
          finishDate,
        },
      ],
    });
  }

  return moveTaskToFinish(task, targetFinishDate);
}

function resizeTaskStart(task: GanttTask, deltaDays: number) {
  if (!isTaskResizable(task)) {
    return task;
  }

  const nextStartDate = clampDateRange(
    addDays(task.startDate, deltaDays),
    task.finishDate,
    "start",
  );

  return syncTaskTiming(
    {
      ...task,
      segments: [
        {
          ...(task.segments[0] ?? {
            id: `${task.id}-segment-1`,
            finishDate: task.finishDate,
          }),
          startDate: nextStartDate,
          finishDate: task.finishDate,
        },
      ],
    },
    nextStartDate,
    task.finishDate,
  );
}

function resizeTaskFinish(task: GanttTask, deltaDays: number) {
  if (!isTaskResizable(task)) {
    return task;
  }

  const nextFinishDate = clampDateRange(
    addDays(task.finishDate, deltaDays),
    task.startDate,
    "finish",
  );

  return syncTaskTiming(
    {
      ...task,
      segments: [
        {
          ...(task.segments[0] ?? {
            id: `${task.id}-segment-1`,
            startDate: task.startDate,
          }),
          startDate: task.startDate,
          finishDate: nextFinishDate,
        },
      ],
    },
    task.startDate,
    nextFinishDate,
  );
}

function applyTaskDateInput(task: GanttTask, field: "start" | "finish", value: string) {
  if (!value || task.kind === "summary") {
    return task;
  }

  if (task.kind === "milestone") {
    return normalizeTask({
      ...task,
      startDate: value,
      finishDate: value,
      segments: [
        {
          id: `${task.id}-segment-1`,
          startDate: value,
          finishDate: value,
        },
      ],
    });
  }

  if (task.kind === "recurring") {
    if (field === "start") {
      const deltaDays = getOffsetDays(task.startDate, value);
      return shiftTask(task, deltaDays);
    }

    const nextFinishDate = clampDateRange(value, task.startDate, "finish");
    return normalizeTask({
      ...task,
      finishDate: nextFinishDate,
      segments: buildRecurringSegments(task.startDate, nextFinishDate, task.id),
    });
  }

  if (task.segments.length > 1) {
    if (field === "start") {
      return shiftTask(task, getOffsetDays(task.startDate, value));
    }

    const lastSegment = task.segments.at(-1);

    if (!lastSegment) {
      return task;
    }

    const nextFinishDate = clampDateRange(value, lastSegment.startDate, "finish");
    const nextSegments = task.segments.map((segment, index) =>
      index === task.segments.length - 1 ? { ...segment, finishDate: nextFinishDate } : segment,
    );

    return normalizeTask({
      ...task,
      segments: nextSegments,
      finishDate: nextFinishDate,
    });
  }

  if (field === "start") {
    return resizeTaskStart(task, getOffsetDays(task.startDate, value));
  }

  return resizeTaskFinish(task, getOffsetDays(task.finishDate, value));
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
    cursor = addDays(cursor, 7);
    index += 1;
  }

  return segments;
}

function syncTaskTiming(task: GanttTask, startDate: string, finishDate: string) {
  if (task.kind === "milestone") {
    return {
      ...task,
      startDate,
      finishDate: startDate,
      durationDays: 0,
      durationLabel: "0d",
      segments: [
        {
          id: task.segments[0]?.id ?? `${task.id}-segment-1`,
          startDate,
          finishDate: startDate,
        },
      ],
    };
  }

  const clampedStart = compareIsoDates(startDate, finishDate) <= 0 ? startDate : finishDate;
  const clampedFinish = compareIsoDates(finishDate, clampedStart) >= 0 ? finishDate : clampedStart;
  const durationDays =
    task.kind === "recurring" ? 1 : Math.max(getWorkingDaysInclusive(clampedStart, clampedFinish), 1);

  return {
    ...task,
    startDate: clampedStart,
    finishDate: clampedFinish,
    durationDays,
    durationLabel: task.kind === "recurring" ? "1d recurring" : `${durationDays}d`,
  };
}

function clampDateRange(date: string, anchorDate: string, edge: "start" | "finish") {
  if (edge === "start" && compareIsoDates(date, anchorDate) > 0) {
    return anchorDate;
  }

  if (edge === "finish" && compareIsoDates(date, anchorDate) < 0) {
    return anchorDate;
  }

  return date;
}

function getWorkingDaysInclusive(startDate: string, finishDate: string) {
  let cursor = startDate;
  let total = 0;

  while (compareIsoDates(cursor, finishDate) <= 0) {
    const day = getUtcDay(cursor);

    if (day !== 0 && day !== 6) {
      total += 1;
    }

    cursor = addDays(cursor, 1);
  }

  return Math.max(total, 1);
}

function getOffsetDays(startDate: string, endDate: string) {
  return Math.round((toDate(endDate).getTime() - toDate(startDate).getTime()) / DAY_MS);
}

function getInclusiveDays(startDate: string, endDate: string) {
  return getOffsetDays(startDate, endDate) + 1;
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate: string, amount: number) {
  const next = toDate(isoDate);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

function addWorkingDays(isoDate: string, amount: number) {
  let cursor = isoDate;
  let remaining = Math.abs(amount);
  const direction = amount >= 0 ? 1 : -1;

  while (remaining > 0) {
    cursor = addDays(cursor, direction);
    const day = getUtcDay(cursor);

    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return cursor;
}

function getNearestWorkingDate(isoDate: string, direction: "forward" | "backward") {
  let cursor = isoDate;

  while (getUtcDay(cursor) === 0 || getUtcDay(cursor) === 6) {
    cursor = addDays(cursor, direction === "forward" ? 1 : -1);
  }

  return cursor;
}

function getNextWorkingDate(isoDate: string) {
  return addWorkingDays(isoDate, 1);
}

function maxIsoDate(...dates: string[]) {
  return [...dates].sort(compareIsoDates).at(-1) ?? dates[0] ?? getTodayIso();
}

function compareIsoDates(left: string, right: string) {
  return left.localeCompare(right);
}

function getUtcDay(isoDate: string) {
  return toDate(isoDate).getUTCDay();
}

function toDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`);
}

function formatDate(isoDate: string) {
  return toDate(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTick(isoDate: string, zoom: ZoomLevel) {
  if (zoom === "month") {
    return toDate(isoDate).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  }

  return toDate(isoDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}
