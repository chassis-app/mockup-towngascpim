"use client";

import { Fragment, useEffect, useEffectEvent, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type {
  GanttDependency,
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
const dependencyLaneInset = 6;
const dependencyLaneSpacing = 14;
const dependencyObstaclePadding = 4;
const dependencyLabelHeight = 11;
const dependencyChannelCount = 8;
const dependencyChannelMargin = 12;
const dependencyNearRowDistance = 3;
const dependencyNearTimeGapDays = 28;
const dependencyInnerGapThreshold = 18;

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

type RouteObstacle = {
  taskId: string;
  kind: "bar" | "label";
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type TaskGeometry = {
  taskId: string;
  rowIndex: number;
  rowTop: number;
  rowBottom: number;
  centerY: number;
  outerLeft: number;
  outerRight: number;
  obstacles: RouteObstacle[];
};

type OrthogonalSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DependencyTimeDirection = "forward" | "backward";

type DependencyRoutingCase =
  | "same-row"
  | "adjacent-row"
  | "near-forward"
  | "near-backward"
  | "far-forward"
  | "far-backward";

type DependencyClassification = {
  routeCase: DependencyRoutingCase;
  rowDistance: number;
  timeDirection: DependencyTimeDirection;
  timeGapDays: number;
  isSameRow: boolean;
  isAdjacentRow: boolean;
  involvesMilestone: boolean;
  involvesSplitTask: boolean;
  shouldUseSharedTrunk: boolean;
};

type ClassifiedDependency = {
  dependency: GanttDependency;
  fromTask: GanttTask;
  toTask: GanttTask;
  fromGeometry: TaskGeometry;
  toGeometry: TaskGeometry;
  fromSegment: GanttTaskSegment;
  toSegment: GanttTaskSegment;
  fromEdge: LinkEdge;
  toEdge: LinkEdge;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
  fromStubX: number;
  toStubX: number;
  classification: DependencyClassification;
};

type DependencyRouteFamily = "local" | "shared-left" | "shared-right";

type DependencyTrunkPools = {
  left: number[];
  right: number[];
};

type DependencyRouteSegments = {
  start: OrthogonalSegment[];
  middle: OrthogonalSegment[];
  end: OrthogonalSegment[];
};

type DependencyRouteCandidate = {
  family: DependencyRouteFamily;
  channelX: number;
  segments: DependencyRouteSegments;
  ignoreLabelObstacles: boolean;
};

type DependencyAnchorPoint = {
  x: number;
  y: number;
};

type RoutedDependency = {
  id: string;
  underlayPath: string;
  overlayPath: string;
  arrowPath: string;
  markerX: number;
  markerY: number;
  channelX: number;
  isDriving: boolean;
  isOnSelectedPath: boolean;
  classification: DependencyClassification;
};

type DependencyRouteResult = {
  routes: RoutedDependency[];
  channelMemory: Map<string, number>;
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
  const [isWorkbenchExpanded, setIsWorkbenchExpanded] = useState(false);
  const [didHydratePersistedState, setDidHydratePersistedState] = useState(false);
  const [pendingPredecessorTaskId, setPendingPredecessorTaskId] = useState("");
  const [pendingPredecessorKind, setPendingPredecessorKind] =
    useState<GanttDependencyKind>("FS");
  const [chartLinkDraft, setChartLinkDraft] = useState<ChartLinkDraft | null>(null);

  const dragStateRef = useRef<DragState | null>(null);
  const columnResizeRef = useRef<ColumnResizeState | null>(null);
  const paneResizeRef = useRef<PaneResizeState | null>(null);
  const dependencyRouteMemoryRef = useRef<Map<string, number>>(new Map());
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

  useEffect(() => {
    if (!isWorkbenchExpanded || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsWorkbenchExpanded(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isWorkbenchExpanded]);

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
  const dependencyRouteResult = buildDependencyRoutes({
    visibleTasks,
    dependencies: project.dependencies,
    rowIndexByTaskId,
    chartStartDate: chartRange.startDate,
    chartWidth: chartSurfaceWidth,
    pixelsPerDay,
    selectedTaskPath,
    previousChannels: dependencyRouteMemoryRef.current,
  });
  dependencyRouteMemoryRef.current = dependencyRouteResult.channelMemory;
  const dependencyRoutes = dependencyRouteResult.routes;

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
    <>
      {isWorkbenchExpanded ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/28 backdrop-blur-[2px]"
          onClick={() => setIsWorkbenchExpanded(false)}
        />
      ) : null}

      <section className="space-y-5">
        <div
          className={cn(
            "mockup-section-shell overflow-hidden",
            isWorkbenchExpanded &&
              "fixed inset-3 z-50 max-h-[calc(100vh-1.5rem)] overflow-auto rounded-[2rem] border border-border/80 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.22)] sm:inset-6 sm:max-h-[calc(100vh-3rem)]",
          )}
        >
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

            <button
              type="button"
              aria-pressed={isWorkbenchExpanded}
              onClick={() => setIsWorkbenchExpanded((current) => !current)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                isWorkbenchExpanded
                  ? "border-primary/20 bg-primary/12 text-primary"
                  : "border-border bg-white/86 text-[#59636d]",
              )}
            >
              {isWorkbenchExpanded ? "Exit Full Screen" : "Full Screen"}
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

              {isWorkbenchExpanded ? (
                <div className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
                  Press Esc to close
                </div>
              ) : null}
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

                    <svg
                      className="pointer-events-none absolute inset-0"
                      width={chartSurfaceWidth}
                      height={visibleTasks.length * rowHeight}
                      viewBox={`0 0 ${chartSurfaceWidth} ${visibleTasks.length * rowHeight}`}
                      fill="none"
                    >
                      {dependencyRoutes.map((route) => (
                        <path
                          key={`underlay-${route.id}`}
                          d={route.underlayPath}
                          className={cn(
                            "fill-none stroke-[2.5] opacity-65",
                            getDependencyRouteClass(
                              route.isDriving,
                              route.isOnSelectedPath,
                              showCriticalPath,
                            ),
                          )}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}
                    </svg>

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
                      {dependencyRoutes.map((route) => (
                        <g
                          key={route.id}
                          data-route-case={route.classification.routeCase}
                          data-time-direction={route.classification.timeDirection}
                        >
                          <path
                            d={route.overlayPath}
                            className={cn(
                              "fill-none stroke-[1.8]",
                              getDependencyRouteClass(
                                route.isDriving,
                                route.isOnSelectedPath,
                                showCriticalPath,
                              ),
                            )}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx={route.markerX}
                            cy={route.markerY}
                            r="4"
                            className="fill-white/95"
                          />
                          <path
                            d={route.arrowPath}
                            className={cn(
                              "stroke-[1.8] fill-none",
                              getDependencyRouteClass(
                                route.isDriving,
                                route.isOnSelectedPath,
                                showCriticalPath,
                              ),
                            )}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx={route.markerX}
                            cy={route.markerY}
                            r="2.5"
                            className={cn(
                              getDependencyRouteFillClass(
                                route.isDriving,
                                route.isOnSelectedPath,
                                showCriticalPath,
                              ),
                            )}
                          />
                        </g>
                      ))}
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
    </>
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

function getDependencyAnchorSegment(task: GanttTask, edge: LinkEdge) {
  const segments = task.segments.length > 0 ? task.segments : getSingleSegment(task);

  return edge === "finish" ? segments[segments.length - 1] : segments[0];
}

function getDependencyAnchorPoint({
  task,
  segment,
  rowTop,
  chartStartDate,
  pixelsPerDay,
  edge,
}: {
  task: GanttTask;
  segment: GanttTaskSegment;
  rowTop: number;
  chartStartDate: string;
  pixelsPerDay: number;
  edge: LinkEdge;
}) {
  const rect = getTaskVisualRect(task, segment, rowTop, chartStartDate, pixelsPerDay);

  if (task.kind === "milestone") {
    return {
      x: edge === "finish" ? rect.right : rect.left,
      y: (rect.top + rect.bottom) / 2,
    } satisfies DependencyAnchorPoint;
  }

  return {
    x: edge === "finish" ? rect.right : rect.left,
    y: (rect.top + rect.bottom) / 2,
  } satisfies DependencyAnchorPoint;
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

function classifyDependency({
  dependency,
  visibleTaskById,
  taskGeometryById,
  chartStartDate,
  pixelsPerDay,
}: {
  dependency: GanttDependency;
  visibleTaskById: Map<string, GanttTask>;
  taskGeometryById: Map<string, TaskGeometry>;
  chartStartDate: string;
  pixelsPerDay: number;
}) {
  const fromTask = visibleTaskById.get(dependency.fromTaskId);
  const toTask = visibleTaskById.get(dependency.toTaskId);
  const fromGeometry = taskGeometryById.get(dependency.fromTaskId);
  const toGeometry = taskGeometryById.get(dependency.toTaskId);

  if (!fromTask || !toTask || !fromGeometry || !toGeometry) {
    return null;
  }

  const fromEdge = getDependencyAnchorEdge(dependency.kind, "from");
  const toEdge = getDependencyAnchorEdge(dependency.kind, "to");
  const resolvedFromSegment = getDependencyAnchorSegment(fromTask, fromEdge);
  const resolvedToSegment = getDependencyAnchorSegment(toTask, toEdge);

  if (!resolvedFromSegment || !resolvedToSegment) {
    return null;
  }

  const fromAnchor = getDependencyAnchorPoint({
    task: fromTask,
    segment: resolvedFromSegment,
    rowTop: fromGeometry.rowTop,
    chartStartDate,
    pixelsPerDay,
    edge: fromEdge,
  });
  const toAnchor = getDependencyAnchorPoint({
    task: toTask,
    segment: resolvedToSegment,
    rowTop: toGeometry.rowTop,
    chartStartDate,
    pixelsPerDay,
    edge: toEdge,
  });
  const classification = getDependencyClassification({
    fromTask,
    toTask,
    fromGeometry,
    toGeometry,
    fromSegment: resolvedFromSegment,
    toSegment: resolvedToSegment,
    dependency,
    chartStartDate,
  });
  const fromStubLength = getDependencyStubLength(fromTask, classification);
  const toStubLength = getDependencyStubLength(toTask, classification);
  const fromX = fromAnchor.x;
  const toX = toAnchor.x;
  const fromY = fromAnchor.y;
  const toY = toAnchor.y;
  const fromStubX = fromX + (fromEdge === "finish" ? fromStubLength : -fromStubLength);
  const toStubX = toX + (toEdge === "finish" ? toStubLength : -toStubLength);

  return {
    dependency,
    fromTask,
    toTask,
    fromGeometry,
    toGeometry,
    fromSegment: resolvedFromSegment,
    toSegment: resolvedToSegment,
    fromEdge,
    toEdge,
    fromX,
    toX,
    fromY,
    toY,
    fromStubX,
    toStubX,
    classification,
  } satisfies ClassifiedDependency;
}

function getDependencyClassification({
  fromTask,
  toTask,
  fromGeometry,
  toGeometry,
  fromSegment,
  toSegment,
  dependency,
  chartStartDate,
}: {
  fromTask: GanttTask;
  toTask: GanttTask;
  fromGeometry: TaskGeometry;
  toGeometry: TaskGeometry;
  fromSegment: GanttTaskSegment;
  toSegment: GanttTaskSegment;
  dependency: GanttDependency;
  chartStartDate: string;
}) {
  const rowDistance = Math.abs(toGeometry.rowIndex - fromGeometry.rowIndex);
  const fromAnchorDay = getDependencyAnchorDay(chartStartDate, fromSegment, dependency.kind, "from");
  const toAnchorDay = getDependencyAnchorDay(chartStartDate, toSegment, dependency.kind, "to");
  const signedGapDays = toAnchorDay - fromAnchorDay;
  const timeDirection: DependencyTimeDirection = signedGapDays < 0 ? "backward" : "forward";
  const timeGapDays = Math.abs(signedGapDays);
  const routeCase = getDependencyRoutingCase({
    rowDistance,
    timeDirection,
    timeGapDays,
  });

  return {
    routeCase,
    rowDistance,
    timeDirection,
    timeGapDays,
    isSameRow: rowDistance === 0,
    isAdjacentRow: rowDistance === 1,
    involvesMilestone: fromTask.kind === "milestone" || toTask.kind === "milestone",
    involvesSplitTask: fromTask.segments.length > 1 || toTask.segments.length > 1,
    shouldUseSharedTrunk: routeCase === "far-forward" || routeCase === "far-backward",
  } satisfies DependencyClassification;
}

function getDependencyAnchorDay(
  chartStartDate: string,
  segment: GanttTaskSegment,
  kind: GanttDependencyKind,
  side: "from" | "to",
) {
  const edge = getDependencyAnchorEdge(kind, side);
  const anchorDate = edge === "finish" ? segment.finishDate : segment.startDate;
  const finishOffset = edge === "finish" ? 1 : 0;

  return getOffsetDays(chartStartDate, anchorDate) + finishOffset;
}

function getDependencyRoutingCase({
  rowDistance,
  timeDirection,
  timeGapDays,
}: {
  rowDistance: number;
  timeDirection: DependencyTimeDirection;
  timeGapDays: number;
}): DependencyRoutingCase {
  if (rowDistance === 0) {
    return "same-row";
  }

  if (rowDistance === 1) {
    return "adjacent-row";
  }

  if (rowDistance <= dependencyNearRowDistance && timeGapDays <= dependencyNearTimeGapDays) {
    return timeDirection === "backward" ? "near-backward" : "near-forward";
  }

  return timeDirection === "backward" ? "far-backward" : "far-forward";
}

function getDependencyRoutingCasePriority(routeCase: DependencyRoutingCase) {
  switch (routeCase) {
    case "far-forward":
    case "far-backward":
      return 3;
    case "near-forward":
    case "near-backward":
      return 2;
    case "adjacent-row":
      return 1;
    case "same-row":
      return 0;
  }
}

function getDependencyStubLength(task: GanttTask, classification: DependencyClassification) {
  let stubLength = classification.shouldUseSharedTrunk ? 14 : 10;

  if (classification.routeCase === "same-row") {
    stubLength = 8;
  }

  if (task.kind === "milestone") {
    stubLength -= 2;
  }

  if (task.segments.length > 1) {
    stubLength += 2;
  }

  return Math.max(6, stubLength);
}

function getDependencyRouteCandidates({
  entry,
  chartWidth,
  trunkPools,
  previousChannelX,
}: {
  entry: ClassifiedDependency;
  chartWidth: number;
  trunkPools: DependencyTrunkPools;
  previousChannelX?: number;
}) {
  if (entry.classification.routeCase === "same-row") {
    return getSameRowDependencyRouteCandidates(entry);
  }

  if (shouldForceDeterministicFinishStartRoute(entry)) {
    return getForwardLocalDoglegCandidates(entry);
  }

  if (!entry.classification.shouldUseSharedTrunk) {
    return getLocalDependencyRouteCandidates(entry, chartWidth);
  }

  return getSharedDependencyRouteCandidates(entry, chartWidth, trunkPools, previousChannelX);
}

function shouldForceDeterministicFinishStartRoute(entry: ClassifiedDependency) {
  return entry.dependency.kind === "FS" && entry.toGeometry.rowIndex > entry.fromGeometry.rowIndex;
}

function getSameRowDependencyRouteCandidates(entry: ClassifiedDependency) {
  const laneCandidates = getSameRowLaneCandidates(entry.fromGeometry.rowIndex);
  const channelX = Math.round((entry.fromStubX + entry.toStubX) / 2);

  return laneCandidates.map((laneY) => ({
    family: "local",
    channelX,
    ignoreLabelObstacles: true,
    segments: {
      start: [
        { x1: entry.fromX, y1: entry.fromY, x2: entry.fromStubX, y2: entry.fromY },
        { x1: entry.fromStubX, y1: entry.fromY, x2: entry.fromStubX, y2: laneY },
      ],
      middle: [{ x1: entry.fromStubX, y1: laneY, x2: entry.toStubX, y2: laneY }],
      end: [
        { x1: entry.toStubX, y1: laneY, x2: entry.toStubX, y2: entry.toY },
        { x1: entry.toStubX, y1: entry.toY, x2: entry.toX, y2: entry.toY },
      ],
    },
  })) satisfies DependencyRouteCandidate[];
}

function getLocalDependencyRouteCandidates(entry: ClassifiedDependency, chartWidth: number) {
  const preferredLanes = getPreferredRowLanes(entry.fromGeometry.rowIndex, entry.toGeometry.rowIndex);
  const fixedDoglegCandidates = getForwardLocalDoglegCandidates(entry);

  if (fixedDoglegCandidates.length > 0) {
    return fixedDoglegCandidates;
  }

  const spineCandidates = getLocalDependencySpineCandidates(entry.classification, entry, chartWidth);

  return spineCandidates.map((channelX) => ({
    family: "local",
    channelX,
    ignoreLabelObstacles: true,
    segments: getDependencyRouteSegments({
      fromX: entry.fromX,
      fromY: entry.fromY,
      toX: entry.toX,
      toY: entry.toY,
      fromStubX: entry.fromStubX,
      toStubX: entry.toStubX,
      sourceLaneY: preferredLanes.sourceLaneY,
      targetLaneY: preferredLanes.targetLaneY,
      spineX: channelX,
    }),
  })) satisfies DependencyRouteCandidate[];
}

function getForwardLocalDoglegCandidates(entry: ClassifiedDependency) {
  if (!shouldForceDeterministicFinishStartRoute(entry)) {
    return [];
  }

  const gapWidth = entry.toStubX - entry.fromStubX;

  if (gapWidth < 8) {
    return [];
  }

  const channelX = clamp(
    Math.round(entry.fromStubX + Math.min(10, Math.max(6, gapWidth * 0.18))),
    Math.round(entry.fromStubX + 2),
    Math.round(entry.toStubX - 4),
  );

  return [
    {
      family: "local",
      channelX,
      ignoreLabelObstacles: true,
      segments: getDependencyDirectDoglegSegments({
        fromX: entry.fromX,
        fromY: entry.fromY,
        toX: entry.toX,
        toY: entry.toY,
        fromStubX: entry.fromStubX,
        toStubX: entry.toStubX,
        spineX: channelX,
      }),
    },
  ] satisfies DependencyRouteCandidate[];
}

function getDependencyDirectDoglegSegments({
  fromX,
  fromY,
  toX,
  toY,
  fromStubX,
  toStubX,
  spineX,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromStubX: number;
  toStubX: number;
  spineX: number;
}) {
  return {
    start: [{ x1: fromX, y1: fromY, x2: fromStubX, y2: fromY }],
    middle: [
      { x1: fromStubX, y1: fromY, x2: spineX, y2: fromY },
      { x1: spineX, y1: fromY, x2: spineX, y2: toY },
      { x1: spineX, y1: toY, x2: toStubX, y2: toY },
    ],
    end: [{ x1: toStubX, y1: toY, x2: toX, y2: toY }],
  } satisfies DependencyRouteSegments;
}

function getLocalDependencySpineCandidates(
  classification: DependencyClassification,
  entry: ClassifiedDependency,
  chartWidth: number,
) {
  const innerGapCandidates = getLocalDependencyInnerGapCandidates(classification, entry);
  if (innerGapCandidates.length > 0) {
    return innerGapCandidates;
  }

  const direction = classification.timeDirection === "forward" ? 1 : -1;
  const outerEdge =
    direction > 0
      ? Math.max(entry.fromGeometry.outerRight, entry.toGeometry.outerRight)
      : Math.min(entry.fromGeometry.outerLeft, entry.toGeometry.outerLeft);
  const baseOffset = getLocalDependencySpineBaseOffset(classification);
  const maxX = Math.max(dependencyChannelMargin, chartWidth - dependencyChannelMargin);
  const outerCandidates = Array.from({ length: 3 }, (_, index) =>
    clamp(
      Math.round(outerEdge + direction * (baseOffset + index * dependencyLaneSpacing)),
      dependencyChannelMargin,
      maxX,
    ),
  );

  return Array.from(new Set(outerCandidates));
}

function getLocalDependencySpineBaseOffset(classification: DependencyClassification) {
  let offset = classification.isAdjacentRow ? 10 : 14 + Math.max(0, classification.rowDistance - 2) * 5;

  if (classification.involvesMilestone) {
    offset += 2;
  }

  if (classification.involvesSplitTask) {
    offset += 3;
  }

  return offset;
}

function getLocalDependencyInnerGapCandidates(
  classification: DependencyClassification,
  entry: ClassifiedDependency,
) {
  const gapLeft = Math.min(entry.fromStubX, entry.toStubX);
  const gapRight = Math.max(entry.fromStubX, entry.toStubX);
  const gapWidth = gapRight - gapLeft;

  if (gapWidth < dependencyInnerGapThreshold) {
    return [];
  }

  if (classification.timeDirection === "forward") {
    const candidates = [
      entry.fromStubX + 12,
      entry.fromStubX + 20,
      Math.round(entry.fromStubX + gapWidth * 0.5),
      entry.toStubX - 12,
    ];

    return candidates
      .map((candidate) => Math.round(candidate))
      .filter((candidate) => candidate > entry.fromStubX + 4 && candidate < entry.toStubX - 6);
  }

  const candidates = [
    entry.fromStubX - 12,
    entry.fromStubX - 20,
    Math.round(entry.toStubX + gapWidth * 0.5),
    entry.toStubX + 12,
  ];

  return candidates
    .map((candidate) => Math.round(candidate))
    .filter((candidate) => candidate < entry.fromStubX - 4 && candidate > entry.toStubX + 6);
}

function getSharedDependencyRouteCandidates(
  entry: ClassifiedDependency,
  chartWidth: number,
  trunkPools: DependencyTrunkPools,
  previousChannelX?: number,
) {
  const trunkFamily = getDependencySharedRouteFamily(entry.classification);
  const channelCandidates = getDependencyTrunkCandidates(
    trunkFamily,
    trunkPools,
    entry,
    chartWidth,
    previousChannelX,
  );
  const sourceLaneCandidates = getRowLaneCandidates(entry.fromGeometry.rowIndex);
  const targetLaneCandidates = getRowLaneCandidates(entry.toGeometry.rowIndex);
  const candidates: DependencyRouteCandidate[] = [];

  sourceLaneCandidates.forEach((sourceLaneY) => {
    targetLaneCandidates.forEach((targetLaneY) => {
      channelCandidates.forEach((channelX) => {
        candidates.push({
          family: trunkFamily,
          channelX,
          ignoreLabelObstacles: false,
          segments: getDependencyRouteSegments({
            fromX: entry.fromX,
            fromY: entry.fromY,
            toX: entry.toX,
            toY: entry.toY,
            fromStubX: entry.fromStubX,
            toStubX: entry.toStubX,
            sourceLaneY,
            targetLaneY,
            spineX: channelX,
          }),
        });
      });
    });
  });

  if (candidates.length > 0) {
    return candidates;
  }

  const preferredLanes = getPreferredRowLanes(entry.fromGeometry.rowIndex, entry.toGeometry.rowIndex);
  const fallbackChannelX = clamp(
    Math.round((entry.fromStubX + entry.toStubX) / 2),
    dependencyChannelMargin,
    Math.max(dependencyChannelMargin, chartWidth - dependencyChannelMargin),
  );

  return [
    {
      family: trunkFamily,
      channelX: fallbackChannelX,
      ignoreLabelObstacles: false,
      segments: getDependencyRouteSegments({
        fromX: entry.fromX,
        fromY: entry.fromY,
        toX: entry.toX,
        toY: entry.toY,
        fromStubX: entry.fromStubX,
        toStubX: entry.toStubX,
        sourceLaneY: preferredLanes.sourceLaneY,
        targetLaneY: preferredLanes.targetLaneY,
        spineX: fallbackChannelX,
      }),
    },
  ] satisfies DependencyRouteCandidate[];
}

function buildDependencyTrunkPools(
  taskGeometryById: Map<string, TaskGeometry>,
  chartWidth: number,
): DependencyTrunkPools {
  const taskGeometry = Array.from(taskGeometryById.values());
  const minOuterLeft = Math.min(...taskGeometry.map((geometry) => geometry.outerLeft), dependencyChannelMargin);
  const maxOuterRight = Math.max(
    ...taskGeometry.map((geometry) => geometry.outerRight),
    chartWidth - dependencyChannelMargin,
  );

  return {
    left: buildDependencyTrunkPool(
      Math.max(dependencyChannelMargin, Math.round(minOuterLeft - 28)),
      -1,
      chartWidth,
    ),
    right: buildDependencyTrunkPool(
      Math.min(chartWidth - dependencyChannelMargin, Math.round(maxOuterRight + 28)),
      1,
      chartWidth,
    ),
  };
}

function buildDependencyTrunkPool(anchorX: number, direction: -1 | 1, chartWidth: number) {
  const maxX = Math.max(dependencyChannelMargin, chartWidth - dependencyChannelMargin);

  return Array.from({ length: dependencyChannelCount }, (_, index) =>
    clamp(
      Math.round(anchorX + direction * index * dependencyLaneSpacing),
      dependencyChannelMargin,
      maxX,
    ),
  ).filter((channelX, index, values) => values.indexOf(channelX) === index);
}

function getDependencySharedRouteFamily(
  classification: DependencyClassification,
): Extract<DependencyRouteFamily, "shared-left" | "shared-right"> {
  return classification.timeDirection === "backward" ? "shared-left" : "shared-right";
}

function getDependencyTrunkCandidates(
  family: Extract<DependencyRouteFamily, "shared-left" | "shared-right">,
  trunkPools: DependencyTrunkPools,
  entry: ClassifiedDependency,
  chartWidth: number,
  previousChannelX?: number,
) {
  const pool = family === "shared-left" ? trunkPools.left : trunkPools.right;
  const localPool = getLocalDependencyTrunkCandidates(family, entry, chartWidth);
  const orderedPool = Array.from(new Set([...localPool, ...pool]));

  if (
    previousChannelX !== undefined &&
    orderedPool.some((channelX) => Math.abs(channelX - previousChannelX) <= dependencyLaneSpacing * 0.75)
  ) {
    return [
      previousChannelX,
      ...orderedPool.filter((channelX) => Math.abs(channelX - previousChannelX) > 0.5),
    ];
  }

  return orderedPool;
}

function getLocalDependencyTrunkCandidates(
  family: Extract<DependencyRouteFamily, "shared-left" | "shared-right">,
  entry: ClassifiedDependency,
  chartWidth: number,
) {
  const direction = family === "shared-right" ? 1 : -1;
  const pairEdge =
    direction > 0
      ? Math.max(entry.fromGeometry.outerRight, entry.toGeometry.outerRight)
      : Math.min(entry.fromGeometry.outerLeft, entry.toGeometry.outerLeft);
  const baseOffset = getSharedDependencyBaseOffset(entry.classification);

  return Array.from({ length: 4 }, (_, index) =>
    clamp(
      Math.round(pairEdge + direction * (baseOffset + index * dependencyLaneSpacing)),
      dependencyChannelMargin,
      Math.max(dependencyChannelMargin, chartWidth - dependencyChannelMargin),
    ),
  ).filter((channelX, index, values) => values.indexOf(channelX) === index);
}

function getSharedDependencyBaseOffset(classification: DependencyClassification) {
  let offset = 12 + Math.max(0, classification.rowDistance - dependencyNearRowDistance) * 3;

  if (classification.involvesMilestone) {
    offset -= 2;
  }

  if (classification.involvesSplitTask) {
    offset += 4;
  }

  return Math.max(16, offset);
}

function getForcedForwardGanttRoute(entry: ClassifiedDependency) {
  if (!shouldForceDeterministicFinishStartRoute(entry)) {
    return null;
  }

  const segments = getFinishStartForwardGanttSegments(entry);

  if (!segments) {
    return null;
  }

  return {
    family: "local" as const,
    channelX: segments.bendX,
    segments: segments.route,
  };
}

function getFinishStartForwardGanttSegments(entry: ClassifiedDependency) {
  if (!shouldForceDeterministicFinishStartRoute(entry)) {
    return null;
  }

  const sourceExitX = Math.round(entry.fromX + getDirectForwardSourceStubLength(entry.fromTask));
  const targetEntryX = Math.round(entry.toX - getDirectForwardTargetInset(entry.toTask));
  const minSourceRun = getDirectForwardSourceRun(entry.fromTask);
  const minTargetRun = getDirectForwardTargetRun(entry.toTask);
  const innerGapWidth = targetEntryX - sourceExitX;
  const hasTightInnerGap = innerGapWidth >= 0;
  const hasRoomyInnerGap = innerGapWidth >= minSourceRun + minTargetRun + 2;
  const bendX = hasRoomyInnerGap
    ? clamp(
        Math.round(targetEntryX - getDirectForwardPreferredTargetLead(entry.toTask)),
        Math.round(sourceExitX + minSourceRun),
        Math.round(targetEntryX - minTargetRun),
      )
    : hasTightInnerGap
      ? sourceExitX
      : Math.max(
          Math.round(sourceExitX + minSourceRun),
          Math.round(
            getDependencyHardRightEdge(entry.fromGeometry, entry.toGeometry) +
              getDirectForwardOverlapClearance(entry),
          ),
        );

  return {
    bendX,
    route: {
      start: [{ x1: entry.fromX, y1: entry.fromY, x2: sourceExitX, y2: entry.fromY }],
      middle: [
        { x1: sourceExitX, y1: entry.fromY, x2: bendX, y2: entry.fromY },
        { x1: bendX, y1: entry.fromY, x2: bendX, y2: entry.toY },
        { x1: bendX, y1: entry.toY, x2: targetEntryX, y2: entry.toY },
      ],
      end: [{ x1: targetEntryX, y1: entry.toY, x2: entry.toX, y2: entry.toY }],
    } satisfies DependencyRouteSegments,
  };
}

function getDirectForwardSourceStubLength(task: GanttTask) {
  if (task.kind === "milestone") {
    return 8;
  }

  if (task.segments.length > 1) {
    return 12;
  }

  return 10;
}

function getDirectForwardSourceRun(task: GanttTask) {
  if (task.kind === "milestone") {
    return 6;
  }

  if (task.segments.length > 1) {
    return 10;
  }

  return 8;
}

function getDirectForwardTargetInset(task: GanttTask) {
  if (task.kind === "milestone") {
    return 6;
  }

  if (task.segments.length > 1) {
    return 8;
  }

  return 6;
}

function getDirectForwardTargetRun(task: GanttTask) {
  if (task.kind === "milestone") {
    return 4;
  }

  if (task.segments.length > 1) {
    return 8;
  }

  return 6;
}

function getDirectForwardPreferredTargetLead(task: GanttTask) {
  if (task.kind === "milestone") {
    return 8;
  }

  if (task.segments.length > 1) {
    return 12;
  }

  return 10;
}

function getDirectForwardOverlapClearance(entry: ClassifiedDependency) {
  let clearance = 10;

  if (entry.fromTask.kind === "milestone" || entry.toTask.kind === "milestone") {
    clearance -= 2;
  }

  if (entry.fromTask.segments.length > 1 || entry.toTask.segments.length > 1) {
    clearance += 3;
  }

  return Math.max(8, clearance);
}

function getDependencyHardRightEdge(...geometryItems: TaskGeometry[]) {
  const hardRight = geometryItems.flatMap((geometry) =>
    geometry.obstacles
      .filter((obstacle) => obstacle.kind === "bar")
      .map((obstacle) => obstacle.right),
  );

  if (hardRight.length === 0) {
    return Math.max(...geometryItems.map((geometry) => geometry.outerRight));
  }

  return Math.max(...hardRight);
}

function buildDependencyRoutes({
  visibleTasks,
  dependencies,
  rowIndexByTaskId,
  chartStartDate,
  chartWidth,
  pixelsPerDay,
  selectedTaskPath,
  previousChannels,
}: {
  visibleTasks: Array<{ task: GanttTask; depth: number }>;
  dependencies: GanttProject["dependencies"];
  rowIndexByTaskId: Map<string, number>;
  chartStartDate: string;
  chartWidth: number;
  pixelsPerDay: number;
  selectedTaskPath: ReturnType<typeof getTaskPath>;
  previousChannels: Map<string, number>;
}) {
  const visibleTaskById = new Map(visibleTasks.map(({ task }) => [task.id, task]));
  const taskGeometryById = new Map(
    visibleTasks.map(({ task }, rowIndex) => [
      task.id,
      getTaskGeometry(task, rowIndex, chartStartDate, pixelsPerDay),
    ]),
  );
  const trunkPools = buildDependencyTrunkPools(taskGeometryById, chartWidth);
  const obstacles = Array.from(taskGeometryById.values()).flatMap((geometry) => geometry.obstacles);
  const usedSpines: Array<{ family: DependencyRouteFamily; spineX: number; minRow: number; maxRow: number }> = [];
  const routesById = new Map<string, RoutedDependency>();
  const channelMemory = new Map<string, number>();
  const classifiedDependencies = dependencies
    .filter(
      (dependency) =>
        rowIndexByTaskId.has(dependency.fromTaskId) &&
        rowIndexByTaskId.has(dependency.toTaskId),
    )
    .map((dependency) =>
      classifyDependency({
        dependency,
        visibleTaskById,
        taskGeometryById,
        chartStartDate,
        pixelsPerDay,
      }),
    )
    .filter((dependency): dependency is ClassifiedDependency => dependency !== null)
    .sort((left, right) => {
      return (
        right.classification.rowDistance - left.classification.rowDistance ||
        right.classification.timeGapDays - left.classification.timeGapDays ||
        getDependencyRoutingCasePriority(right.classification.routeCase) -
          getDependencyRoutingCasePriority(left.classification.routeCase)
      );
    });

  classifiedDependencies.forEach((entry) => {
    const {
      dependency,
      fromTask,
      toTask,
      fromGeometry,
      toGeometry,
      toEdge,
      toX,
      toY,
      classification,
    } = entry;
    const minRow = Math.min(fromGeometry.rowIndex, toGeometry.rowIndex);
    const maxRow = Math.max(fromGeometry.rowIndex, toGeometry.rowIndex);
    const preferredLanes = getPreferredRowLanes(fromGeometry.rowIndex, toGeometry.rowIndex);
    const previousChannelX = previousChannels.get(dependency.id);
    const forcedForwardRoute = getForcedForwardGanttRoute(entry);

    if (forcedForwardRoute) {
      usedSpines.push({
        family: forcedForwardRoute.family,
        spineX: forcedForwardRoute.channelX,
        minRow,
        maxRow,
      });
      channelMemory.set(dependency.id, forcedForwardRoute.channelX);
      routesById.set(dependency.id, {
        id: dependency.id,
        underlayPath: segmentsToPath(forcedForwardRoute.segments.middle),
        overlayPath: segmentsToPath([
          ...forcedForwardRoute.segments.start,
          ...forcedForwardRoute.segments.end,
        ]),
        arrowPath: getDependencyArrowPath(toX, toY, toEdge),
        markerX: toX,
        markerY: toY,
        channelX: forcedForwardRoute.channelX,
        isDriving: dependency.isDriving,
        isOnSelectedPath: selectedTaskPath.dependencyIds.has(dependency.id),
        classification,
      });
      return;
    }

    const routeCandidates = getDependencyRouteCandidates({
      entry,
      chartWidth,
      trunkPools,
      previousChannelX,
    });

    let bestRoute:
      | {
          score: number;
          family: DependencyRouteFamily;
          channelX: number;
          segments: DependencyRouteSegments;
        }
      | null = null;

    routeCandidates.forEach((candidate) => {
      const routeObstacles = candidate.ignoreLabelObstacles
        ? obstacles.filter((obstacle) => obstacle.kind === "bar")
        : obstacles;
      const sourceLaneY =
        candidate.segments.start[candidate.segments.start.length - 1]?.y2 ?? preferredLanes.sourceLaneY;
      const targetLaneY =
        candidate.segments.end[0]?.y1 ?? preferredLanes.targetLaneY;
      const score = scoreDependencyRoute(
        candidate.segments,
        routeObstacles,
        usedSpines,
        {
          sourceTaskId: fromTask.id,
          targetTaskId: toTask.id,
          minRow,
          maxRow,
          routeFamily: candidate.family,
          spineX: candidate.channelX,
          preferredSourceLaneY: preferredLanes.sourceLaneY,
          preferredTargetLaneY: preferredLanes.targetLaneY,
          sourceLaneY,
          targetLaneY,
          preferredDirection: getDependencyPreferredDirection(classification),
          previousChannelX,
          sameRow: classification.isSameRow,
        },
      );

      if (!bestRoute || score < bestRoute.score) {
        bestRoute = {
          score,
          family: candidate.family,
          channelX: candidate.channelX,
          segments: candidate.segments,
        };
      }
    });

    const chosenRoute = bestRoute ?? routeCandidates[0];

    if (!chosenRoute) {
      return;
    }

    usedSpines.push({
      family: chosenRoute.family,
      spineX: chosenRoute.channelX,
      minRow,
      maxRow,
    });
    channelMemory.set(dependency.id, chosenRoute.channelX);
    routesById.set(dependency.id, {
      id: dependency.id,
      underlayPath: segmentsToPath(chosenRoute.segments.middle),
      overlayPath: segmentsToPath([
        ...chosenRoute.segments.start,
        ...chosenRoute.segments.end,
      ]),
      arrowPath: getDependencyArrowPath(toX, toY, toEdge),
      markerX: toX,
      markerY: toY,
      channelX: chosenRoute.channelX,
      isDriving: dependency.isDriving,
      isOnSelectedPath: selectedTaskPath.dependencyIds.has(dependency.id),
      classification,
    });
  });

  return {
    routes: dependencies
      .filter((dependency) => routesById.has(dependency.id))
      .map((dependency) => routesById.get(dependency.id)!)
      .filter((route) => route.underlayPath || route.overlayPath),
    channelMemory,
  } satisfies DependencyRouteResult;
}

function getTaskGeometry(
  task: GanttTask,
  rowIndex: number,
  chartStartDate: string,
  pixelsPerDay: number,
) {
  const rowTop = rowIndex * rowHeight;
  const rowBottom = rowTop + rowHeight;
  const segments = task.segments.length > 0 ? task.segments : getSingleSegment(task);
  const obstacles: RouteObstacle[] = [];
  let outerLeft = Number.POSITIVE_INFINITY;
  let outerRight = Number.NEGATIVE_INFINITY;

  segments.forEach((segment, segmentIndex) => {
    const rect = getTaskVisualRect(task, segment, rowTop, chartStartDate, pixelsPerDay);
    obstacles.push({
      taskId: task.id,
      kind: "bar",
      ...rect,
    });
    outerLeft = Math.min(outerLeft, rect.left);
    outerRight = Math.max(outerRight, rect.right);

    if (segmentIndex === 0 && task.kind !== "milestone") {
      const labelRect = getTaskLabelRect(rect.left, rect.right, rowTop);
      obstacles.push({
        taskId: task.id,
        kind: "label",
        ...labelRect,
      });
      outerLeft = Math.min(outerLeft, labelRect.left);
      outerRight = Math.max(outerRight, labelRect.right);
    }
  });

  if (!Number.isFinite(outerLeft) || !Number.isFinite(outerRight)) {
    outerLeft = 0;
    outerRight = 0;
  }

  return {
    taskId: task.id,
    rowIndex,
    rowTop,
    rowBottom,
    centerY: rowTop + rowHeight / 2,
    outerLeft,
    outerRight,
    obstacles,
  } satisfies TaskGeometry;
}

function getTaskVisualRect(
  task: GanttTask,
  segment: GanttTaskSegment,
  rowTop: number,
  chartStartDate: string,
  pixelsPerDay: number,
) {
  if (task.kind === "milestone") {
    const left = getOffsetDays(chartStartDate, segment.startDate) * pixelsPerDay - 8;

    return {
      left,
      right: left + 16,
      top: rowTop + milestoneOffsetY,
      bottom: rowTop + milestoneOffsetY + 16,
    };
  }

  const width = Math.max(
    getInclusiveDays(segment.startDate, segment.finishDate) * pixelsPerDay,
    task.kind === "recurring" ? 12 : 14,
  );
  const top = rowTop + (task.kind === "recurring" ? recurringBarOffsetY : standardBarOffsetY);
  const height = task.kind === "recurring" ? 12 : 16;
  const left = getOffsetDays(chartStartDate, segment.startDate) * pixelsPerDay;

  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
  };
}

function getTaskLabelRect(left: number, right: number, rowTop: number) {
  return {
    left,
    right: left + Math.min(180, Math.max(right - left + 14, 92)),
    top: rowTop + standardBarOffsetY + taskLabelOffsetY,
    bottom: rowTop + standardBarOffsetY + taskLabelOffsetY + dependencyLabelHeight,
  };
}

function getDependencyAnchorEdge(kind: GanttDependencyKind, side: "from" | "to") {
  const useFinishEdge =
    (side === "from" && (kind === "FS" || kind === "FF")) ||
    (side === "to" && (kind === "FF" || kind === "SF"));

  return useFinishEdge ? "finish" : "start";
}

function getRowLaneCandidates(rowIndex: number) {
  const rowTop = rowIndex * rowHeight;

  return [rowTop + dependencyLaneInset, rowTop + rowHeight - dependencyLaneInset];
}

function getSameRowLaneCandidates(rowIndex: number) {
  const [topLaneY, bottomLaneY] = getRowLaneCandidates(rowIndex);

  return [bottomLaneY, topLaneY].filter((laneY): laneY is number => laneY !== undefined);
}

function getPreferredRowLanes(sourceRowIndex: number, targetRowIndex: number) {
  const sourceCandidates = getRowLaneCandidates(sourceRowIndex);
  const targetCandidates = getRowLaneCandidates(targetRowIndex);

  if (targetRowIndex > sourceRowIndex) {
    return {
      sourceLaneY: sourceCandidates[1] ?? sourceCandidates[0] ?? sourceRowIndex * rowHeight + rowHeight / 2,
      targetLaneY: targetCandidates[0] ?? targetCandidates[1] ?? targetRowIndex * rowHeight + rowHeight / 2,
    };
  }

  if (targetRowIndex < sourceRowIndex) {
    return {
      sourceLaneY: sourceCandidates[0] ?? sourceCandidates[1] ?? sourceRowIndex * rowHeight + rowHeight / 2,
      targetLaneY: targetCandidates[1] ?? targetCandidates[0] ?? targetRowIndex * rowHeight + rowHeight / 2,
    };
  }

  return {
    sourceLaneY: sourceCandidates[1] ?? sourceRowIndex * rowHeight + rowHeight - dependencyLaneInset,
    targetLaneY: targetCandidates[1] ?? targetRowIndex * rowHeight + rowHeight - dependencyLaneInset,
  };
}

function getDependencyPreferredDirection(classification: DependencyClassification) {
  return classification.timeDirection === "backward" ? -1 : 1;
}

function getDependencyRouteSegments({
  fromX,
  fromY,
  toX,
  toY,
  fromStubX,
  toStubX,
  sourceLaneY,
  targetLaneY,
  spineX,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromStubX: number;
  toStubX: number;
  sourceLaneY: number;
  targetLaneY: number;
  spineX: number;
}) {
  return {
    start: [
      { x1: fromX, y1: fromY, x2: fromStubX, y2: fromY },
      { x1: fromStubX, y1: fromY, x2: fromStubX, y2: sourceLaneY },
    ],
    middle: [
      { x1: fromStubX, y1: sourceLaneY, x2: spineX, y2: sourceLaneY },
      { x1: spineX, y1: sourceLaneY, x2: spineX, y2: targetLaneY },
      { x1: spineX, y1: targetLaneY, x2: toStubX, y2: targetLaneY },
    ],
    end: [
      { x1: toStubX, y1: targetLaneY, x2: toStubX, y2: toY },
      { x1: toStubX, y1: toY, x2: toX, y2: toY },
    ],
  };
}

function getDependencyArrowPath(x: number, y: number, edge: LinkEdge) {
  const direction = edge === "finish" ? 1 : -1;
  const wingX = x - direction * 7;

  return `M ${wingX} ${y - 4} L ${x} ${y} L ${wingX} ${y + 4}`;
}

function scoreDependencyRoute(
  segments: DependencyRouteSegments,
  obstacles: RouteObstacle[],
  usedSpines: Array<{ family: DependencyRouteFamily; spineX: number; minRow: number; maxRow: number }>,
  context: {
    sourceTaskId: string;
    targetTaskId: string;
    minRow: number;
    maxRow: number;
    routeFamily: DependencyRouteFamily;
    spineX: number;
    preferredSourceLaneY: number;
    preferredTargetLaneY: number;
    sourceLaneY: number;
    targetLaneY: number;
    preferredDirection: number;
    previousChannelX?: number;
    sameRow: boolean;
  },
) {
  const allSegments = [...segments.start, ...segments.middle, ...segments.end];
  const collisionPenalty = allSegments.reduce((sum, segment) => {
    return (
      sum +
      obstacles.reduce((obstacleSum, obstacle) => {
        if (
          obstacle.taskId === context.sourceTaskId &&
          obstacle.kind === "bar"
        ) {
          return obstacleSum;
        }

        if (
          obstacle.taskId === context.targetTaskId &&
          obstacle.kind === "bar"
        ) {
          return obstacleSum;
        }

        return obstacleSum + (segmentIntersectsObstacle(segment, obstacle) ? 1 : 0);
      }, 0)
    );
  }, 0);
  const spinePenalty = usedSpines.reduce((sum, usedSpine) => {
    if (usedSpine.family !== context.routeFamily) {
      return sum;
    }

    const overlapsRows =
      !(context.maxRow < usedSpine.minRow || context.minRow > usedSpine.maxRow);

    if (!overlapsRows) {
      return sum;
    }

    const delta = Math.abs(context.spineX - usedSpine.spineX);
    if (context.routeFamily === "local") {
      return sum + (delta < 6 ? 1 : 0);
    }

    return sum + (delta < dependencyLaneSpacing ? 6 : 0);
  }, 0);
  const travelPenalty = allSegments.reduce(
    (sum, segment) => sum + Math.abs(segment.x2 - segment.x1) + Math.abs(segment.y2 - segment.y1),
    0,
  );
  const lanePenalty =
    (Math.abs(context.sourceLaneY - context.preferredSourceLaneY) > 0.1 ? 2 : 0) +
    (Math.abs(context.targetLaneY - context.preferredTargetLaneY) > 0.1 ? 2 : 0);
  const firstMiddleSegment = segments.middle[0];
  const directionPenalty =
    firstMiddleSegment &&
    Math.sign(firstMiddleSegment.x2 - firstMiddleSegment.x1 || context.preferredDirection) !==
      context.preferredDirection
      ? 6
      : 0;
  const memoryPenalty =
    context.previousChannelX === undefined
      ? 0
      : Math.abs(context.spineX - context.previousChannelX) / dependencyLaneSpacing;
  const sameRowPenalty =
    context.sameRow && Math.abs(context.sourceLaneY - context.targetLaneY) > 0.1 ? 8 : 0;

  return (
    collisionPenalty * 1000 +
    spinePenalty * (context.routeFamily === "local" ? 25 : 150) +
    lanePenalty * 120 +
    directionPenalty * 180 +
    sameRowPenalty * 180 +
    memoryPenalty * 90 +
    travelPenalty / 40
  );
}

function segmentIntersectsObstacle(segment: OrthogonalSegment, obstacle: RouteObstacle) {
  const paddedObstacle = {
    left: obstacle.left - dependencyObstaclePadding,
    right: obstacle.right + dependencyObstaclePadding,
    top: obstacle.top - dependencyObstaclePadding,
    bottom: obstacle.bottom + dependencyObstaclePadding,
  };

  if (segment.x1 === segment.x2) {
    const x = segment.x1;
    const top = Math.min(segment.y1, segment.y2);
    const bottom = Math.max(segment.y1, segment.y2);

    return (
      x >= paddedObstacle.left &&
      x <= paddedObstacle.right &&
      bottom >= paddedObstacle.top &&
      top <= paddedObstacle.bottom
    );
  }

  const y = segment.y1;
  const left = Math.min(segment.x1, segment.x2);
  const right = Math.max(segment.x1, segment.x2);

  return (
    y >= paddedObstacle.top &&
    y <= paddedObstacle.bottom &&
    right >= paddedObstacle.left &&
    left <= paddedObstacle.right
  );
}

function segmentsToPath(segments: OrthogonalSegment[]) {
  return segments
    .filter(
      (segment) =>
        Math.abs(segment.x2 - segment.x1) > 0.01 || Math.abs(segment.y2 - segment.y1) > 0.01,
    )
    .map((segment) => `M ${segment.x1} ${segment.y1} L ${segment.x2} ${segment.y2}`)
    .join(" ");
}

function getDependencyRouteClass(
  isDriving: boolean,
  isOnSelectedPath: boolean,
  showCriticalPath: boolean,
) {
  if (isOnSelectedPath) {
    return "stroke-primary";
  }

  return isDriving && showCriticalPath ? "stroke-rose-400" : "stroke-slate-400";
}

function getDependencyRouteFillClass(
  isDriving: boolean,
  isOnSelectedPath: boolean,
  showCriticalPath: boolean,
) {
  if (isOnSelectedPath) {
    return "fill-primary";
  }

  return isDriving && showCriticalPath ? "fill-rose-400" : "fill-slate-400";
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
