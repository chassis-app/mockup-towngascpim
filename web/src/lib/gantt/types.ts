export type GanttTone = "default" | "accent" | "warn" | "danger" | "success";

export type GanttTaskMode = "auto" | "manual";

export type GanttTaskKind =
  | "summary"
  | "task"
  | "milestone"
  | "split-task"
  | "recurring";

export type GanttDependencyKind = "FS" | "SS" | "FF" | "SF";

export type GanttTaskSegment = {
  id: string;
  startDate: string;
  finishDate: string;
};

export type GanttTask = {
  id: string;
  parentId: string | null;
  order: number;
  wbs: string;
  name: string;
  kind: GanttTaskKind;
  mode: GanttTaskMode;
  startDate: string;
  finishDate: string;
  durationLabel: string;
  durationDays: number;
  progress: number;
  resourceNames: string;
  note: string;
  tone: GanttTone;
  expanded: boolean;
  onTimeline: boolean;
  isCritical: boolean;
  baselineStartDate?: string;
  baselineFinishDate?: string;
  segments: GanttTaskSegment[];
};

export type GanttDependency = {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  kind: GanttDependencyKind;
  isDriving: boolean;
};

export type GanttProject = {
  id: string;
  name: string;
  description: string;
  tasks: GanttTask[];
  dependencies: GanttDependency[];
  selectedTaskId: string | null;
};
