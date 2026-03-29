import { AppShell } from "@/components/mockup/app-shell";
import { ProjectGantt } from "@/components/gantt/project-gantt";
import { createDemoProject } from "@/lib/gantt/demo-project";

export default function GanttDemoPage() {
  const project = createDemoProject();

  return (
    <AppShell
      href="/projects/rp-20250059/gantt-demo"
      title="Gantt Demo"
      projectContext={{
        title: "",
        subtitle: "",
        activeItem: "Gantt Demo",
      }}
    >
      <ProjectGantt initialProject={project} />
    </AppShell>
  );
}
