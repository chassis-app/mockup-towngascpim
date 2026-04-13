"use client";

import { Fragment, useEffect, useEffectEvent, useRef, useState } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ScheduleBlock } from "@/lib/mockup-data";
import { cn } from "@/lib/utils";

const unitWidth = 56;
const rowHeight = 48;
const splitRatioStorageKey = "mockup-gantt-split-ratio";

type ScheduleRow = ScheduleBlock["rows"][number];
type ScheduleBar = NonNullable<ScheduleRow["bar"]>;
type ScheduleSegment = NonNullable<ScheduleBar["segments"]>[number];
type DetailMode = "inspector" | "dependency" | "tracking";

type DragState =
  | {
      rowId: string;
      mode: "move";
      startClientX: number;
      bar: ScheduleBar;
    }
  | {
      rowId: string;
      mode: "resize-start" | "resize-end";
      startClientX: number;
      bar: ScheduleBar;
    };

type SplitterState = {
  startClientX: number;
  startRatio: number;
};

export function InteractiveScheduleSection({ block }: { block: ScheduleBlock }) {
  const [selectedTaskId, setSelectedTaskId] = useState(
    block.rows.find((row) => row.selected)?.id ?? block.rows[0]?.id ?? "",
  );
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState(block.activeView);
  const [activeDetailTab, setActiveDetailTab] = useState(block.activeDetailTab);
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showNonWorking, setShowNonWorking] = useState(true);
  const [barOverrides, setBarOverrides] = useState<Record<string, ScheduleBar>>({});
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>("inspector");
  const [contextTaskId, setContextTaskId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Prototype interactions enabled: drag the splitter, right-click chart tasks, and open task detail sheets.",
  );

  const layoutRef = useRef<HTMLDivElement | null>(null);
  const taskDragRef = useRef<DragState | null>(null);
  const splitterDragRef = useRef<SplitterState | null>(null);

  useEffect(() => {
    const storedRatio = window.localStorage.getItem(splitRatioStorageKey);

    if (!storedRatio) {
      return;
    }

    const parsed = Number(storedRatio);

    if (!Number.isNaN(parsed)) {
      setSplitRatio(clampSplitRatio(parsed));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(splitRatioStorageKey, String(splitRatio));
  }, [splitRatio]);

  const visibleRows = getVisibleRows(block.rows, collapsedIds, selectedTaskId, barOverrides);
  const selectedRow =
    visibleRows.find((row) => row.id === selectedTaskId) ??
    block.rows.find((row) => row.id === selectedTaskId) ??
    block.rows[0];
  const contextRow =
    (contextTaskId
      ? block.rows.find((row) => row.id === contextTaskId) ??
        visibleRows.find((row) => row.id === contextTaskId)
      : null) ?? selectedRow;
  const timelineWidth = block.units.length * unitWidth;
  const splitPercent = Math.round(splitRatio * 100);
  const rowIndexById = new Map(visibleRows.map((row, index) => [row.id, index]));
  const dependencyLines = block.dependencies.flatMap((dependency) => {
    const fromRow = visibleRows.find((row) => row.id === dependency.from);
    const toRow = visibleRows.find((row) => row.id === dependency.to);
    const fromIndex = rowIndexById.get(dependency.from);
    const toIndex = rowIndexById.get(dependency.to);

    if (!fromRow?.bar || !toRow?.bar || fromIndex === undefined || toIndex === undefined) {
      return [];
    }

    if (dependency.driving && !showCriticalPath) {
      return [];
    }

    const fromSegments = getScheduleSegments(fromRow.bar);
    const toSegments = getScheduleSegments(toRow.bar);
    const fromSegment = fromSegments[fromSegments.length - 1];
    const toSegment = toSegments[0];

    if (!fromSegment || !toSegment) {
      return [];
    }

    const fromX = (fromSegment.start + (fromSegment.length ?? 0)) * unitWidth;
    const toX = toSegment.start * unitWidth;
    const fromY = fromIndex * rowHeight + rowHeight / 2;
    const toY = toIndex * rowHeight + rowHeight / 2;
    const elbowX = Math.max(fromX + 18, toX - 18);

    return [
      {
        ...dependency,
        path: `M ${fromX} ${fromY} H ${elbowX} V ${toY} H ${toX}`,
        markerX: toX,
        markerY: toY,
      },
    ];
  });

  const onPointerMove = useEffectEvent((event: PointerEvent) => {
    if (updateSplitterRatio(event.clientX)) {
      return;
    }

    const dragState = taskDragRef.current;

    if (!dragState) {
      return;
    }

    const deltaUnits = (event.clientX - dragState.startClientX) / unitWidth;

    setBarOverrides((current) => ({
      ...current,
      [dragState.rowId]: applyDragDelta(dragState.bar, dragState.mode, deltaUnits),
    }));
  });

  const onPointerUp = useEffectEvent(() => {
    if (finishSplitterDrag()) {
      return;
    }

    const dragState = taskDragRef.current;

    if (!dragState) {
      return;
    }

    taskDragRef.current = null;
    setStatusMessage(
      dragState.mode === "move"
        ? "Task bar moved. In a production Gantt this would update dates and dependency recalculation."
        : "Task bar resized. In a production Gantt this would update duration and downstream variance.",
    );
  });

  const onMouseMove = useEffectEvent((event: MouseEvent) => {
    updateSplitterRatio(event.clientX);
  });

  const onMouseUp = useEffectEvent(() => {
    finishSplitterDrag();
  });

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!selectedRow) {
    return null;
  }

  const taskGridTemplate = block.columns.map((column) => column.width ?? "1fr").join(" ");
  const panelSections = getPanelSections(block, selectedRow);
  const sheetSections =
    detailMode === "inspector"
      ? panelSections
      : panelSections.filter((section) => section.mode === detailMode);
  const detailCards = getDetailCards(selectedRow, activeView, activeDetailTab, {
    showBaseline,
    showCriticalPath,
    showNonWorking,
    splitPercent,
  });

  return (
    <section className="space-y-5">
      <div className="mockup-section-shell overflow-hidden">
        <div className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(250,253,253,0.96),rgba(240,247,247,0.82))] px-5 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="mockup-section-kicker">Scheduling</div>
              <div className="space-y-2">
                <h2 className="text-[1.6rem] font-medium tracking-[-0.04em] text-[#26323a]">
                  {block.heading}
                </h2>
                <p className="max-w-[920px] text-[0.94rem] leading-6 text-[#5f6973]">
                  {block.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {block.featureBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em]",
                      scheduleToneBadgeClass(badge.tone),
                    )}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
              {block.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className={cn(
                    "rounded-[1.4rem] border bg-white/88 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
                    scheduleToneSurfaceClass(metric.tone),
                  )}
                >
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#7c8791]">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-[1.55rem] font-semibold tracking-[-0.05em] text-[#23313a]">
                    {metric.value}
                  </div>
                  {metric.note ? (
                    <div className="mt-1 text-[0.82rem] text-[#68737e]">{metric.note}</div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {block.views.map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => {
                  setActiveView(view);
                  setStatusMessage(`Switched mock view to ${view}.`);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                  view === activeView
                    ? "border-primary/20 bg-primary/12 text-primary"
                    : "border-border bg-white/86 text-[#59636d]",
                )}
              >
                {view}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {block.controls.map((control) => {
              const isCritical = control.label.includes("Critical Path");
              const isBaseline = control.label.includes("Baseline");
              const isNonWorking = control.label.includes("Nonworking");
              const isActive =
                (isCritical && showCriticalPath) ||
                (isBaseline && showBaseline) ||
                (isNonWorking && showNonWorking) ||
                (!isCritical && !isBaseline && !isNonWorking);

              return (
                <button
                  key={control.label}
                  type="button"
                  onClick={() => {
                    if (isCritical) {
                      setShowCriticalPath((current) => !current);
                    } else if (isBaseline) {
                      setShowBaseline((current) => !current);
                    } else if (isNonWorking) {
                      setShowNonWorking((current) => !current);
                    }
                  }}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-[0.8rem] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
                    isActive
                      ? scheduleToneBadgeClass(control.tone)
                      : "border-slate-200 bg-white text-slate-400",
                  )}
                >
                  {control.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => openDetailsForTask(selectedRow.id, "inspector")}
              className="rounded-2xl border border-primary/20 bg-white px-3 py-2 text-[0.8rem] font-medium text-primary"
            >
              Task Details Sheet
            </button>
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-primary/12 bg-white/72 px-4 py-3 text-[0.84rem] text-[#4f5c67]">
            {statusMessage}
          </div>
        </div>

        <div className="bg-white px-4 py-4 xl:px-5 xl:py-5">
          <div
            ref={layoutRef}
            className="grid gap-0 rounded-[1.6rem] border border-border/70 bg-[#fbfdfd] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] xl:h-[min(74vh,860px)]"
            style={{
              gridTemplateColumns: `${splitRatio}fr 18px ${1 - splitRatio}fr`,
            }}
          >
            <div className="min-w-0 overflow-auto rounded-l-[1.6rem] bg-white">
              <div className="min-w-[1200px]">
                <div
                  className="sticky top-0 z-20 grid border-b border-border/70 bg-[#f7fafb] text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7d8791]"
                  style={{ gridTemplateColumns: taskGridTemplate }}
                >
                  {block.columns.map((column) => (
                    <div
                      key={column.key}
                      className={cn(
                        "border-r border-border/60 px-3 py-3 last:border-r-0",
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                      )}
                    >
                      {column.label}
                    </div>
                  ))}
                </div>

                <div className="divide-y divide-border/60">
                  {visibleRows.map((row) => {
                    const isCollapsed = collapsedIds.includes(row.id);

                    return (
                      <div
                        key={`${row.taskName}-${row.id}`}
                        onClick={() => selectTask(row.id, `Selected ${row.taskName}.`)}
                        className={cn(
                          "grid w-full cursor-pointer items-center text-left text-[0.84rem]",
                          row.selected && "bg-primary/10",
                          row.emphasis && "bg-[#fbfcfd]",
                        )}
                        style={{
                          gridTemplateColumns: taskGridTemplate,
                          minHeight: `${rowHeight}px`,
                        }}
                        data-row-id={row.id}
                      >
                        <div className="flex items-center justify-center gap-1 border-r border-border/60 px-2">
                          {row.critical && showCriticalPath ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-700">
                              CP
                            </span>
                          ) : null}
                          {row.onTimeline ? (
                            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[0.65rem] font-semibold text-teal-700">
                              TL
                            </span>
                          ) : null}
                          {row.note ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                              !
                            </span>
                          ) : null}
                        </div>
                        <div className="border-r border-border/60 px-3 text-[#68727d]">{row.wbs}</div>
                        <div className="border-r border-border/60 px-3">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium",
                              row.taskMode === "manual"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {row.taskMode === "manual" ? "Manual" : "Auto"}
                          </span>
                        </div>
                        <div className="border-r border-border/60 px-3">
                          <div
                            className={cn(
                              "flex items-center gap-2 text-[#2f3d47]",
                              row.emphasis && "font-semibold",
                            )}
                            style={{ paddingLeft: `${(row.indent ?? 0) * 18}px` }}
                          >
                            {row.kind === "summary" ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setCollapsedIds((current) =>
                                    current.includes(row.id)
                                      ? current.filter((item) => item !== row.id)
                                      : [...current, row.id],
                                  );
                                  setStatusMessage(
                                    `${isCollapsed ? "Expanded" : "Collapsed"} ${row.taskName}.`,
                                  );
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-border bg-white text-[#8a959f]"
                              >
                                {isCollapsed ? ">" : "v"}
                              </button>
                            ) : (
                              <span className="w-5" />
                            )}
                            <span className="min-w-0 truncate">{row.taskName}</span>
                          </div>
                        </div>
                        <div className="border-r border-border/60 px-3 text-[#58636d]">{row.duration}</div>
                        <div className="border-r border-border/60 px-3 text-[#58636d]">{row.start}</div>
                        <div className="border-r border-border/60 px-3 text-[#58636d]">{row.finish}</div>
                        <div className="border-r border-border/60 px-3 text-[#58636d]">{row.predecessors || "-"}</div>
                        <div className="border-r border-border/60 px-3 text-[#58636d]">{row.resources || "-"}</div>
                        <div className="px-3 text-right text-[#2f3d47]">{row.progress}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative border-x border-border/70 bg-[linear-gradient(180deg,rgba(243,248,249,0.92),rgba(234,242,244,0.9))]">
              <button
                type="button"
                aria-label="Resize schedule panes"
                onPointerDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }

                  event.preventDefault();
                  splitterDragRef.current = {
                    startClientX: event.clientX,
                    startRatio: splitRatio,
                  };
                  setStatusMessage("Resizing workspace split. Either pane can expand up to 75% of the width.");
                }}
                className="absolute inset-0 z-10 cursor-col-resize"
              />
              <div className="pointer-events-none sticky top-4 z-20 mx-auto mt-4 flex w-[3.9rem] justify-center rounded-full border border-primary/12 bg-white/92 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#53616d] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
                {splitPercent}/{100 - splitPercent}
              </div>
              <div className="pointer-events-none absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-primary/25" />
              <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/45" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/45" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary/45" />
              </div>
            </div>

            <div className="min-w-0 overflow-auto rounded-r-[1.6rem] bg-[#fcfefe]">
              <ContextMenu>
                <ContextMenuTrigger className="block h-full">
                  <div className="min-w-[728px]">
                <div className="sticky top-0 z-20 border-b border-border/70 bg-[#f8fbfc]">
                  <div
                    className="grid border-b border-border/60 text-center text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-[#7d8791]"
                    style={{ gridTemplateColumns: `repeat(${block.units.length}, minmax(0, 1fr))` }}
                  >
                    {block.months.map((month) => (
                      <div
                        key={month.label}
                        className="border-r border-border/60 py-3 last:border-r-0"
                        style={{ gridColumn: `span ${month.span} / span ${month.span}` }}
                      >
                        {month.label}
                      </div>
                    ))}
                  </div>
                  <div
                    className="grid text-center text-[0.72rem] text-[#7d8791]"
                    style={{ gridTemplateColumns: `repeat(${block.units.length}, minmax(0, 1fr))` }}
                  >
                    {block.units.map((unit, index) => (
                      <div
                        key={`${unit}-${index}`}
                        className="border-r border-border/50 px-2 py-2 last:border-r-0"
                      >
                        {unit}
                      </div>
                    ))}
                  </div>
                  <div
                    className="absolute top-0 bottom-0 z-10 w-px bg-primary shadow-[0_0_0_1px_rgba(13,148,136,0.15)]"
                    style={{ left: `${block.todayUnit * unitWidth}px` }}
                  />
                  <div
                    className="absolute top-0 z-20 -translate-x-1/2 rounded-b-xl bg-primary px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground"
                    style={{ left: `${block.todayUnit * unitWidth}px` }}
                  >
                    Today
                  </div>
                </div>

                <div
                  className="relative"
                  style={{
                    width: `${timelineWidth}px`,
                    minHeight: `${visibleRows.length * rowHeight}px`,
                    backgroundImage:
                      "linear-gradient(to right, rgba(226,232,240,0.88) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,0.65) 1px, transparent 1px)",
                    backgroundSize: `${unitWidth}px 100%, 100% ${rowHeight}px`,
                  }}
                >
                  {showNonWorking
                    ? block.shadedRanges?.map((range) => (
                        <div
                          key={`${range.start}-${range.span}-${range.label}`}
                          className="absolute top-0 bottom-0 bg-slate-100/70"
                          style={{
                            left: `${range.start * unitWidth}px`,
                            width: `${range.span * unitWidth}px`,
                          }}
                        >
                          {range.label ? (
                            <div className="px-1 pt-1 text-center text-[0.64rem] uppercase tracking-[0.16em] text-slate-500">
                              {range.label}
                            </div>
                          ) : null}
                        </div>
                      ))
                    : null}

                  {visibleRows.map((row, index) => {
                    const top = index * rowHeight;
                    const bar = row.bar;
                    const segments = bar ? getScheduleSegments(bar) : [];

                    return (
                      <Fragment key={`timeline-${row.id}`}>
                        {row.selected ? (
                          <div
                            className="absolute left-0 right-0 bg-primary/10"
                            style={{ top, height: `${rowHeight}px` }}
                          />
                        ) : null}

                        {showBaseline && bar?.baselineStart !== undefined ? (
                          <div
                            className="absolute h-1 rounded-full bg-slate-300"
                            style={{
                              top: `${top + 11}px`,
                              left: `${bar.baselineStart * unitWidth}px`,
                              width: `${Math.max((bar.baselineLength ?? bar.length ?? 0.12) * unitWidth, 8)}px`,
                            }}
                          />
                        ) : null}

                        {row.kind === "milestone"
                          ? segments.map((segment, segmentIndex) => (
                              <div
                                key={`${row.id}-milestone-${segmentIndex}`}
                                onContextMenuCapture={() => {
                                  setContextTaskId(row.id);
                                  selectTask(row.id, `Opened context menu for ${row.taskName}.`);
                                }}
                                className="absolute"
                                style={{
                                  top: `${top + 14}px`,
                                  left: `${segment.start * unitWidth - 10}px`,
                                }}
                              >
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => selectTask(row.id, `Selected milestone ${row.taskName}.`)}
                                  className={cn(
                                    "h-4 w-4 rotate-45 rounded-[2px] border",
                                    scheduleTimelineBarClass(
                                      row.status,
                                      row.critical && showCriticalPath,
                                      row.kind,
                                    ),
                                  )}
                                />
                              </div>
                            ))
                          : null}

                        {row.kind !== "milestone"
                          ? segments.map((segment, segmentIndex) => {
                              const left = segment.start * unitWidth;
                              const width = Math.max(
                                (segment.length ?? 0.18) * unitWidth,
                                row.kind === "recurring" ? 12 : 14,
                              );
                              const completedWidth =
                                row.kind === "summary" || row.kind === "placeholder" || row.progress <= 0
                                  ? 0
                                  : Math.min(
                                      width,
                                      ((bar?.progress ?? 0) /
                                        Math.max(bar?.length ?? width / unitWidth, 0.1)) *
                                        width,
                                    );
                              const supportsResize =
                                !bar?.segments &&
                                row.kind !== "recurring" &&
                                row.kind !== "summary" &&
                                row.kind !== "milestone";

                              return (
                                <div
                                  key={`${row.id}-segment-${segmentIndex}`}
                                  onContextMenuCapture={() => {
                                    setContextTaskId(row.id);
                                    selectTask(row.id, `Opened context menu for ${row.taskName}.`);
                                  }}
                                  className="absolute"
                                  style={{
                                    top: `${top + (row.kind === "recurring" ? 18 : 16)}px`,
                                    left: `${left}px`,
                                  }}
                                >
                                  <div className="relative">
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => selectTask(row.id, `Selected ${row.taskName}.`)}
                                        onPointerDown={(event) => {
                                          if (event.button !== 0 || !bar) {
                                            return;
                                          }

                                          event.preventDefault();
                                          selectTask(row.id, `Dragging ${row.taskName}.`);
                                          taskDragRef.current = {
                                            rowId: row.id,
                                            mode: "move",
                                            startClientX: event.clientX,
                                            bar,
                                          };
                                        }}
                                        className={cn(
                                          "overflow-hidden border",
                                          row.kind === "summary"
                                            ? "h-4 rounded-sm"
                                            : row.kind === "placeholder"
                                              ? "h-4 rounded-full border-dashed bg-white"
                                              : row.kind === "recurring"
                                                ? "h-3 rounded-full"
                                                : "h-4 rounded-full",
                                          scheduleTimelineBarClass(
                                            row.status,
                                            row.critical && showCriticalPath,
                                            row.kind,
                                          ),
                                        )}
                                        style={{
                                          width: `${width}px`,
                                        }}
                                      >
                                        {completedWidth > 0 ? (
                                          <div
                                            className="h-full bg-black/18"
                                            style={{ width: `${completedWidth}px` }}
                                          />
                                        ) : null}
                                      </div>

                                      {supportsResize ? (
                                        <>
                                          <button
                                            type="button"
                                            aria-label={`Resize start ${row.taskName}`}
                                            onPointerDown={(event) => {
                                              if (event.button !== 0 || !bar) {
                                                return;
                                              }

                                              event.preventDefault();
                                              event.stopPropagation();
                                              selectTask(row.id, `Adjusting start for ${row.taskName}.`);
                                              taskDragRef.current = {
                                                rowId: row.id,
                                                mode: "resize-start",
                                                startClientX: event.clientX,
                                                bar,
                                              };
                                            }}
                                            className="absolute top-0 left-0 h-4 w-1.5 rounded-full bg-white/90 shadow"
                                          />
                                          <button
                                            type="button"
                                            aria-label={`Resize end ${row.taskName}`}
                                            onPointerDown={(event) => {
                                              if (event.button !== 0 || !bar) {
                                                return;
                                              }

                                              event.preventDefault();
                                              event.stopPropagation();
                                              selectTask(row.id, `Adjusting finish for ${row.taskName}.`);
                                              taskDragRef.current = {
                                                rowId: row.id,
                                                mode: "resize-end",
                                                startClientX: event.clientX,
                                                bar,
                                              };
                                            }}
                                            className="absolute top-0 right-0 h-4 w-1.5 rounded-full bg-white/90 shadow"
                                          />
                                        </>
                                      ) : null}
                                  </div>
                                </div>
                              );
                            })
                          : null}

                        {bar?.label ? (
                          <div
                            className="absolute text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#6c7680]"
                            style={{
                              top: `${top + 2}px`,
                              left: `${Math.min(
                                (segments[0]?.start ?? 0) * unitWidth,
                                Math.max(timelineWidth - 120, 0),
                              )}px`,
                            }}
                          >
                            {bar.label}
                          </div>
                        ) : null}
                      </Fragment>
                    );
                  })}

                  <svg
                    className="absolute inset-0"
                    width={timelineWidth}
                    height={visibleRows.length * rowHeight}
                    viewBox={`0 0 ${timelineWidth} ${visibleRows.length * rowHeight}`}
                    fill="none"
                  >
                    {dependencyLines.map((dependency) => (
                      <Fragment key={`${dependency.from}-${dependency.to}`}>
                        <path
                          d={dependency.path}
                          className={cn(
                            "fill-none stroke-[1.5]",
                            dependency.driving ? "stroke-rose-400" : "stroke-slate-400",
                          )}
                        />
                        <circle
                          cx={dependency.markerX}
                          cy={dependency.markerY}
                          r="3"
                          className={cn(
                            dependency.driving ? "fill-rose-400" : "fill-slate-400",
                          )}
                        />
                      </Fragment>
                    ))}
                  </svg>
                </div>
                  </div>
                </ContextMenuTrigger>
                <TaskContextMenuContent
                  row={contextRow}
                  onSelectTask={() => selectTask(contextRow.id, `Selected ${contextRow.taskName}.`)}
                  onOpenDetails={(mode) => openDetailsForTask(contextRow.id, mode)}
                  onHighlightPath={() => {
                    setShowCriticalPath(true);
                    selectTask(contextRow.id, `Highlighted path for ${contextRow.taskName}.`);
                  }}
                  onShowBaseline={() => {
                    setShowBaseline(true);
                    selectTask(contextRow.id, `Showing baseline context for ${contextRow.taskName}.`);
                  }}
                />
              </ContextMenu>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-[#fbfcfd] px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {block.detailTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveDetailTab(tab)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium",
                  tab === activeDetailTab
                    ? "border-primary/20 bg-primary/12 text-primary"
                    : "border-border bg-white text-[#5f6973]",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            {detailCards.map((card) => (
              <div
                key={card.title}
                className={cn(
                  "rounded-[1.4rem] border bg-white/94 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
                  scheduleToneSurfaceClass(card.tone),
                )}
              >
                <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                  {card.title}
                </div>
                <div className="mt-3 space-y-2 text-[0.87rem] leading-6 text-[#4c5863]">
                  {card.lines.map((line) => (
                    <div key={`${card.title}-${line}`}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent side="right" className="w-[min(640px,100vw)] sm:max-w-[640px]">
          <SheetHeader className="border-b border-border/70 px-5 py-5">
            <div className="flex flex-wrap gap-2">
              {(["inspector", "dependency", "tracking"] as DetailMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDetailMode(mode)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[0.78rem] font-medium capitalize",
                    mode === detailMode
                      ? "border-primary/20 bg-primary/12 text-primary"
                      : "border-border bg-white text-[#5f6973]",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <SheetTitle className="mt-3 text-[1.1rem] font-semibold text-[#2e3a44]">
              {selectedRow.taskName}
            </SheetTitle>
            <SheetDescription className="text-[0.9rem] leading-6 text-[#61707c]">
              Right-click on a chart task to open task inspector, dependency, or tracking details without sacrificing chart width.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 overflow-auto px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Task Mode", value: selectedRow.taskMode === "manual" ? "Manual" : "Auto scheduled" },
                { label: "Schedule Split", value: `${splitPercent}% table / ${100 - splitPercent}% chart` },
                { label: "Start", value: selectedRow.start },
                { label: "Finish", value: selectedRow.finish },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border border-border/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                >
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8a97a3]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-[0.96rem] font-medium text-[#34414b]">{item.value}</div>
                </div>
              ))}
            </div>

            {sheetSections.map((section) => (
              <div
                key={section.title}
                className="rounded-[1.35rem] border border-border/70 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="text-[0.76rem] font-semibold uppercase tracking-[0.16em] text-[#7c8791]">
                  {section.title}
                </div>
                {section.description ? (
                  <p className="mt-2 text-[0.88rem] leading-6 text-[#61707c]">{section.description}</p>
                ) : null}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={`${section.title}-${item.label}`} className="space-y-1">
                      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#90a0ae]">
                        {item.label}
                      </div>
                      <div
                        className={cn(
                          "text-[0.9rem] leading-6 text-[#33414b]",
                          item.tone === "danger" && "text-rose-700",
                          item.tone === "warn" && "text-amber-700",
                          item.tone === "success" && "text-emerald-700",
                          item.tone === "accent" && "text-primary",
                        )}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );

  function selectTask(taskId: string, message: string) {
    setSelectedTaskId(taskId);
    setStatusMessage(message);
  }

  function updateSplitterRatio(clientX: number) {
    const splitterState = splitterDragRef.current;

    if (!splitterState || !layoutRef.current) {
      return false;
    }

    const layoutWidth = layoutRef.current.getBoundingClientRect().width;

    if (layoutWidth <= 0) {
      return true;
    }

    const nextRatio = clampSplitRatio(
      splitterState.startRatio + (clientX - splitterState.startClientX) / layoutWidth,
    );
    setSplitRatio(nextRatio);
    return true;
  }

  function finishSplitterDrag() {
    const splitterState = splitterDragRef.current;

    if (!splitterState) {
      return false;
    }

    splitterDragRef.current = null;
    setStatusMessage(
      `Workspace resized to ${Math.round(splitRatio * 100)}% table and ${Math.round(
        (1 - splitRatio) * 100,
      )}% chart.`,
    );
    return true;
  }

  function openDetailsForTask(taskId: string, mode: DetailMode) {
    const detailLabel =
      mode === "inspector"
        ? "task inspector"
        : mode === "dependency"
          ? "dependency details"
          : "tracking details";
    const task = block.rows.find((row) => row.id === taskId);

    setSelectedTaskId(taskId);
    setDetailMode(mode);
    setDetailsOpen(true);
    setStatusMessage(`Opened ${detailLabel} for ${task?.taskName ?? "selected task"}.`);
  }
}

function TaskContextMenuContent({
  row,
  onSelectTask,
  onOpenDetails,
  onHighlightPath,
  onShowBaseline,
}: {
  row: ScheduleRow;
  onSelectTask: () => void;
  onOpenDetails: (mode: DetailMode) => void;
  onHighlightPath: () => void;
  onShowBaseline: () => void;
}) {
  return (
    <ContextMenuContent className="w-72">
      <ContextMenuLabel>{row.taskName}</ContextMenuLabel>
      <ContextMenuItem onClick={onSelectTask}>
        Select Task
        <ContextMenuShortcut>{row.id}</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => onOpenDetails("inspector")}>
        Open Task Inspector
        <ContextMenuShortcut>Info</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onOpenDetails("dependency")}>
        Dependency Details
        <ContextMenuShortcut>Path</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onOpenDetails("tracking")}>
        Tracking Details
        <ContextMenuShortcut>Track</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onHighlightPath}>
        Highlight Driving Path
        <ContextMenuShortcut>CP</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onShowBaseline}>
        Show Baseline Context
        <ContextMenuShortcut>BL</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

function getVisibleRows(
  rows: ScheduleBlock["rows"],
  collapsedIds: string[],
  selectedTaskId: string,
  barOverrides: Record<string, ScheduleBar>,
) {
  const collapsedState: { id: string; indent: number }[] = [];
  const visibleRows: ScheduleRow[] = [];

  for (const row of rows) {
    const indent = row.indent ?? 0;

    while (
      collapsedState.length > 0 &&
      collapsedState[collapsedState.length - 1]!.indent >= indent
    ) {
      collapsedState.pop();
    }

    const hidden = collapsedState.length > 0;

    if (!hidden) {
      visibleRows.push({
        ...row,
        selected: row.id === selectedTaskId,
        bar: barOverrides[row.id] ?? row.bar,
      });
    }

    if (row.kind === "summary" && collapsedIds.includes(row.id)) {
      collapsedState.push({ id: row.id, indent });
    }
  }

  return visibleRows;
}

function getScheduleSegments(bar: ScheduleBar): ScheduleSegment[] {
  if (bar.segments && bar.segments.length > 0) {
    return bar.segments;
  }

  return [
    {
      start: bar.start,
      length: bar.length,
    },
  ];
}

function applyDragDelta(bar: ScheduleBar, mode: DragState["mode"], deltaUnits: number): ScheduleBar {
  if (mode === "move") {
    return {
      ...bar,
      start: roundToQuarter(bar.start + deltaUnits),
      segments: bar.segments?.map((segment) => ({
        ...segment,
        start: roundToQuarter(segment.start + deltaUnits),
      })),
    };
  }

  if (bar.segments && bar.segments.length > 0) {
    return bar;
  }

  const originalLength = bar.length ?? 0.25;

  if (mode === "resize-start") {
    const nextStart = roundToQuarter(bar.start + deltaUnits);
    const nextLength = roundToQuarter(Math.max(0.25, originalLength - deltaUnits));

    return {
      ...bar,
      start: nextStart,
      length: nextLength,
    };
  }

  return {
    ...bar,
    length: roundToQuarter(Math.max(0.25, originalLength + deltaUnits)),
  };
}

function getPanelSections(block: ScheduleBlock, row: ScheduleRow) {
  const incomingDependencies = block.dependencies
    .filter((dependency) => dependency.to === row.id)
    .map((dependency) => `${dependency.from}${dependency.kind}${dependency.driving ? " driving" : ""}`);
  const outgoingDependencies = block.dependencies
    .filter((dependency) => dependency.from === row.id)
    .map((dependency) => `${dependency.to}${dependency.kind}${dependency.driving ? " driving" : ""}`);

  return [
    {
      mode: "inspector" as const,
      title: "Selected Task",
      description: "Inspector summary for the currently selected or right-clicked task.",
      items: [
        { label: "Mode", value: row.taskMode === "manual" ? "Manual" : "Auto scheduled" },
        { label: "Duration", value: row.duration },
        { label: "Critical", value: row.critical ? "Yes" : "No", tone: row.critical ? "danger" : "default" },
        { label: "Timeline", value: row.onTimeline ? "Pinned" : "Not pinned", tone: row.onTimeline ? "accent" : "default" },
        { label: "Resources", value: row.resources || "Unassigned" },
        { label: "Task Type", value: row.kind ? toTitleCase(row.kind) : "Task" },
      ],
    },
    {
      mode: "dependency" as const,
      title: "Dependency & Path",
      description: "Predecessor, successor, and driving-path context for the selected task.",
      items: [
        { label: "Predecessors", value: row.predecessors || "None" },
        { label: "Incoming Links", value: incomingDependencies.join(", ") || "None" },
        { label: "Outgoing Links", value: outgoingDependencies.join(", ") || "None" },
        { label: "Task Path", value: row.critical ? "Driving" : "Available slack", tone: row.critical ? "danger" : "success" },
        { label: "Calendar", value: row.taskMode === "manual" ? "Manual placeholder" : "Standard + Permit review" },
        { label: "Dependency Note", value: row.note || "No dependency exception note" },
      ],
    },
    {
      mode: "tracking" as const,
      title: "Tracking",
      description: "Progress, baseline, and variance context for the selected task.",
      items: [
        { label: "% Complete", value: `${row.progress}%` },
        { label: "Baseline Finish", value: row.baselineFinish || "Not set" },
        { label: "Current Finish", value: row.finish },
        { label: "Variance", value: getVarianceLabel(row), tone: getVarianceTone(row) },
        { label: "WBS", value: row.wbs },
        { label: "Note", value: row.note || "No tracking note" },
      ],
    },
  ];
}

function getDetailCards(
  row: ScheduleRow,
  activeView: string,
  activeDetailTab: string,
  toggles: {
    showBaseline: boolean;
    showCriticalPath: boolean;
    showNonWorking: boolean;
    splitPercent: number;
  },
) {
  return [
    {
      title: "Task Workspace",
      lines: [
        `Selected task: ${row.taskName}`,
        `Start / Finish: ${row.start} to ${row.finish}`,
        `Resources: ${row.resources || "Unassigned"}`,
        `Predecessors: ${row.predecessors || "None"}`,
      ],
      tone: "accent" as const,
    },
    {
      title: "Viewport Control",
      lines: [
        `View preset: ${activeView}`,
        `Detail tab: ${activeDetailTab}`,
        `Split ratio: ${toggles.splitPercent}% table / ${100 - toggles.splitPercent}% chart`,
        `Critical path: ${toggles.showCriticalPath ? "Visible" : "Hidden"}`,
      ],
      tone: "warn" as const,
    },
    {
      title: "Context Actions",
      lines: [
        `Baseline bars: ${toggles.showBaseline ? "Visible" : "Hidden"}`,
        `Nonworking time: ${toggles.showNonWorking ? "Shaded" : "Hidden"}`,
        "Right-click chart tasks to open task-specific sheet actions",
        "Use the center splitter to push either pane out to 75%",
      ],
      tone: "default" as const,
    },
  ];
}

function scheduleToneBadgeClass(
  tone: "default" | "accent" | "warn" | "danger" | "success" = "default",
) {
  switch (tone) {
    case "accent":
      return "border-primary/20 bg-primary/10 text-primary";
    case "warn":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "danger":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function scheduleToneSurfaceClass(
  tone: "default" | "accent" | "warn" | "danger" | "success" = "default",
) {
  switch (tone) {
    case "accent":
      return "border-primary/20";
    case "warn":
      return "border-amber-200/70";
    case "danger":
      return "border-rose-200/70";
    case "success":
      return "border-emerald-200/70";
    default:
      return "border-border/70";
  }
}

function scheduleTimelineBarClass(
  tone: "default" | "accent" | "warn" | "danger" | "success" | undefined,
  critical: boolean | undefined,
  kind: "summary" | "task" | "milestone" | "recurring" | "placeholder" | undefined,
) {
  if (kind === "placeholder") {
    return "border-slate-300 text-slate-500";
  }

  if (critical || tone === "danger") {
    return "border-rose-500 bg-rose-400/92";
  }

  if (tone === "warn") {
    return "border-amber-500 bg-amber-400/92";
  }

  if (tone === "success") {
    return "border-emerald-500 bg-emerald-400/92";
  }

  return "border-primary/70 bg-primary/72";
}

function getVarianceLabel(row: ScheduleRow) {
  if (!row.baselineFinish) {
    return "Not tracked";
  }

  if (row.critical || row.note) {
    return "+2d";
  }

  return "0d";
}

function getVarianceTone(row: ScheduleRow) {
  if (!row.baselineFinish) {
    return "default" as const;
  }

  if (row.critical || row.note) {
    return "warn" as const;
  }

  return "success" as const;
}

function clampSplitRatio(value: number) {
  return Math.max(0.25, Math.min(0.75, value));
}

function roundToQuarter(value: number) {
  return Math.round(value * 4) / 4;
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
