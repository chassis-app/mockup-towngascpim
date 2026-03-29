"use client";

import Link from "next/link";
import type { CSSProperties, ComponentType } from "react";

import {
  Buildings,
  CaretRight,
  ClipboardText,
  DotsThreeOutline,
  GearSix,
  House,
  SignOut,
  SquaresFour,
  UserCircle,
  Wrench,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  href: string;
  quickLaunchActive?: string;
  projectContext?: {
    title: string;
    subtitle: string;
    activeItem: string;
  };
};

type SectionItem = {
  label: string;
  href: string;
  active: boolean;
};

type NavSection = {
  title: string;
  icon: ComponentType<{ className?: string; weight?: "duotone" | "regular" }>;
  items: SectionItem[];
  defaultOpen: boolean;
};

type NavSectionConfig = {
  title: string;
  icon: ComponentType<{ className?: string; weight?: "duotone" | "regular" }>;
  items: Array<{
    label: string;
    href: string;
  }>;
};

const sidebarStyle = {
  "--sidebar": "rgb(14 18 24 / 0.82)",
  "--sidebar-foreground": "oklch(0.985 0 0)",
  "--sidebar-primary": "oklch(0.704 0.14 182.503)",
  "--sidebar-primary-foreground": "oklch(0.277 0.046 192.524)",
  "--sidebar-accent": "rgb(255 255 255 / 0.08)",
  "--sidebar-accent-foreground": "oklch(0.985 0 0)",
  "--sidebar-border": "rgb(255 255 255 / 0.12)",
  "--sidebar-ring": "oklch(0.704 0.14 182.503)",
} as CSSProperties;

const adminSectionConfigs: NavSectionConfig[] = [
  {
    title: "Workspace",
    icon: SquaresFour,
    items: [
      { label: "Project Center", href: "/project-center" },
      { label: "Project Information", href: "/projects/rp-20250059/information" },
      { label: "Project Management", href: "/projects/rp-20250059/project-management" },
      { label: "Approvals", href: "/projects/rp-20250059/approvals" },
      { label: "Tasks", href: "/projects/rp-20250059/tasks" },
      { label: "Resources", href: "/projects/rp-20250059/resources" },
      { label: "CPIM Template", href: "/projects/rp-20250059/cpim-template" },
      { label: "CPIM Reports", href: "/projects/rp-20250059/cpim-reports" },
      { label: "Role Access", href: "/projects/rp-20250059/role-access" },
      { label: "Contractor Master", href: "/projects/rp-20250059/contractor-master" },
      { label: "Customer Master", href: "/projects/rp-20250059/customer-master" },
      { label: "Inspection Master", href: "/projects/rp-20250059/inspection-master" },
      { label: "Alert Dashboard", href: "/projects/rp-20250059/alert-dashboard" },
      { label: "BOM Maintenance", href: "/projects/rp-20250059/bom-maintenance" },
      { label: "Tenderer Group", href: "/projects/rp-20250059/tenderer-group" },
      { label: "Generic Report", href: "/projects/rp-20250059/generic-report" },
      { label: "Knowledge Management", href: "/projects/rp-20250059/knowledge-management" },
    ],
  },
  {
    title: "Administration Home",
    icon: Buildings,
    items: [{ label: "PWA Settings", href: "/" }],
  },
  {
    title: "Personal Settings",
    icon: UserCircle,
    items: [
      { label: "My Queued Jobs", href: "/my-queued-job" },
      { label: "Manage Delegate", href: "/manage-delegate" },
      { label: "Manage Delegates", href: "/manage-delegates" },
    ],
  },
  {
    title: "Enterprise Data",
    icon: ClipboardText,
    items: [
      { label: "Custom Field", href: "/custom-field" },
      { label: "Custom Master List", href: "/custom-master-list" },
      { label: "Contractor Master List", href: "/contractor-master-list" },
      { label: "Inspector Master List", href: "/inspector-master-list" },
      { label: "Enterprise Calendar", href: "/enterprise-calendar" },
      { label: "Report", href: "/report" },
    ],
  },
  {
    title: "Queue And Database",
    icon: Wrench,
    items: [
      { label: "Manage Queue Jobs", href: "/manage-queue-jobs" },
      { label: "Delete Enterprise Object", href: "/delete-enterprise-object" },
      { label: "Force Check-in Enterprise Object", href: "/force-check-in-enterprise-object" },
    ],
  },
  {
    title: "Look And Feel",
    icon: GearSix,
    items: [
      { label: "Manage View", href: "/manage-view" },
      { label: "Add Edit Template", href: "/add-edit-template" },
      { label: "Grouping Format", href: "/grouping-format" },
      { label: "Gantt Chart Format", href: "/gantt-chart-format" },
      { label: "Quick Launch", href: "/quick-launch" },
    ],
  },
  {
    title: "Time And Task",
    icon: House,
    items: [
      { label: "Fiscal Periods", href: "/fiscal-periods" },
      { label: "Time Report Period", href: "/time-report-period" },
      { label: "Line Classifications", href: "/line-classifications" },
      { label: "Timesheet Settings and Defaults1", href: "/timesheet-settings-and-defaults-1" },
      { label: "Timesheet Settings and Defaults2", href: "/timesheet-settings-and-defaults-2" },
      { label: "Administrative Time", href: "/administrative-time" },
      { label: "Task Setting and Display", href: "/task-setting-and-display" },
      { label: "Manage Timesheet", href: "/manage-timesheet" },
      { label: "Timesheet Manager", href: "/timesheet-manager" },
    ],
  },
  {
    title: "Operational Policies",
    icon: Wrench,
    items: [
      { label: "Additional Server Settings", href: "/additional-server-settings" },
      { label: "User Sync", href: "/user-sync" },
      { label: "Connect SharePoint Site", href: "/connect-sharepoint-site" },
    ],
  },
  {
    title: "Workflow And PDP",
    icon: ClipboardText,
    items: [
      { label: "Enterprise Project Type", href: "/enterprise-project-type" },
      { label: "Workflow Phase", href: "/workflow-phase" },
      { label: "Workflow Stage", href: "/workflow-stage" },
      { label: "ChangeRestartSkip Workflow", href: "/change-restart-skip-workflow" },
    ],
  },
  {
    title: "Security",
    icon: Buildings,
    items: [
      { label: "Manager User", href: "/manager-user" },
      { label: "Manage Groups", href: "/manage-groups" },
      { label: "Manage Category", href: "/manage-category" },
      { label: "Manage Template", href: "/manage-template" },
    ],
  },
];

const projectSectionConfigs: NavSectionConfig[] = [
  {
    title: "Overview",
    icon: House,
    items: [
      { label: "Project Information (RP)", href: "/projects/rp-20250059/information" },
      { label: "Schedule", href: "/projects/rp-20250059/schedule" },
      { label: "Gantt Demo", href: "/projects/rp-20250059/gantt-demo" },
      { label: "Project Schedule1", href: "/projects/rp-20250059/schedule-1" },
      { label: "Project Status", href: "/projects/rp-20250059/project-status" },
      { label: "Project Site", href: "/projects/rp-20250059/project-site" },
    ],
  },
  {
    title: "Workspace",
    icon: ClipboardText,
    items: [
      { label: "Project Management", href: "/projects/rp-20250059/project-management" },
      { label: "Approvals", href: "/projects/rp-20250059/approvals" },
      { label: "Tasks", href: "/projects/rp-20250059/tasks" },
      { label: "Resources", href: "/projects/rp-20250059/resources" },
      { label: "CPIM Template", href: "/projects/rp-20250059/cpim-template" },
      { label: "CPIM Reports", href: "/projects/rp-20250059/cpim-reports" },
      { label: "Role Access", href: "/projects/rp-20250059/role-access" },
      { label: "Contractor Master", href: "/projects/rp-20250059/contractor-master" },
      { label: "Customer Master", href: "/projects/rp-20250059/customer-master" },
      { label: "Inspection Master", href: "/projects/rp-20250059/inspection-master" },
      { label: "Alert Dashboard", href: "/projects/rp-20250059/alert-dashboard" },
      { label: "BOM Maintenance", href: "/projects/rp-20250059/bom-maintenance" },
      { label: "Tenderer Group", href: "/projects/rp-20250059/tenderer-group" },
      { label: "Generic Report", href: "/projects/rp-20250059/generic-report" },
      { label: "Knowledge Management", href: "/projects/rp-20250059/knowledge-management" },
    ],
  },
  {
    title: "Project Management",
    icon: GearSix,
    items: [
      { label: "Project Management Home", href: "/projects/rp-20250059/project-management" },
      { label: "Create Project", href: "/projects/rp-20250059/project-management/create-project" },
      {
        label: "Create Project Template",
        href: "/projects/rp-20250059/project-management/create-project-template",
      },
      { label: "Build Team", href: "/projects/rp-20250059/project-management/build-team" },
      {
        label: "Project Permissions",
        href: "/projects/rp-20250059/project-management/project-permissions",
      },
      { label: "Risk", href: "/projects/rp-20250059/project-management/risk" },
      { label: "Issue Management", href: "/projects/rp-20250059/project-management/issues" },
      { label: "Deliverables", href: "/projects/rp-20250059/project-management/deliverables" },
      {
        label: "Project Status Detail",
        href: "/projects/rp-20250059/project-management/project-status",
      },
      { label: "TaskBar", href: "/projects/rp-20250059/project-management/task-bar" },
      { label: "Task Bar Legacy", href: "/projects/rp-20250059/task-bar" },
    ],
  },
  {
    title: "Tasks",
    icon: ClipboardText,
    items: [
      { label: "Project Task", href: "/projects/rp-20250059/tasks" },
      { label: "Project New Task", href: "/projects/rp-20250059/tasks/new" },
      { label: "Project Task Reassign", href: "/project-task-reassign" },
    ],
  },
  {
    title: "Resources",
    icon: UserCircle,
    items: [
      { label: "Project Resource Center", href: "/projects/rp-20250059/resources" },
      { label: "Project New Resource1", href: "/projects/rp-20250059/resources/new-1" },
      { label: "Project New Resource2", href: "/projects/rp-20250059/resources/new-2" },
      { label: "Project New Resource3", href: "/projects/rp-20250059/resources/new-3" },
      { label: "Project New Resource4", href: "/projects/rp-20250059/resources/new-4" },
      { label: "Project New Resource5", href: "/projects/rp-20250059/resources/new-5" },
    ],
  },
  {
    title: "Role Access",
    icon: Buildings,
    items: [
      { label: "Role Access Home", href: "/projects/rp-20250059/role-access" },
      { label: "Role Access1", href: "/role-access/1" },
      { label: "Role Access2", href: "/role-access/2" },
      { label: "Role Access3", href: "/role-access/3" },
    ],
  },
  {
    title: "Utilities",
    icon: Wrench,
    items: [
      { label: "Project Center", href: "/project-center" },
      { label: "EDIT LINKS", href: "/projects/rp-20250059/information" },
    ],
  },
];

export function AppSidebar({
  href,
  quickLaunchActive,
  projectContext,
}: AppSidebarProps) {
  const sections = projectContext
    ? getProjectSections(href, projectContext.activeItem)
    : getAdminSections(href, quickLaunchActive);

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      style={sidebarStyle}
      className={cn(
        "border-none",
        "[&_[data-sidebar=sidebar]]:backdrop-blur-2xl",
        "[&_[data-sidebar=sidebar]]:shadow-[0_24px_60px_rgba(15,23,42,0.28)]",
      )}
    >
      <SidebarHeader className="gap-4 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              className="h-auto rounded-3xl border border-white/10 bg-white/6 px-3 py-3 hover:bg-white/10"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_14px_32px_rgba(0,0,0,0.24)]">
                P
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-[0.68rem] uppercase tracking-[0.34em] text-sidebar-foreground/55">
                  PMO
                </span>
                <span className="mt-1 text-base font-medium tracking-[-0.04em] text-sidebar-foreground">
                  CPIMUAT
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-2 pb-3">
        {sections.map((section) => (
          <SidebarSection key={section.title} section={section} />
        ))}
      </SidebarContent>

      <SidebarFooter className="p-3 pt-0">
        <SidebarUser projectContext={projectContext} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function SidebarSection({ section }: { section: NavSection }) {
  const Icon = section.icon;

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarMenu>
        <SidebarMenuItem>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton
                tooltip={section.title}
                isActive={section.defaultOpen}
                className="rounded-2xl"
              />
            }
          >
            <Icon className="size-4" weight="duotone" />
            <span>{section.title}</span>
            <CaretRight className="ml-auto size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="mt-1 border-sidebar-border/70">
              {section.items.map((item) => (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton
                    render={<Link href={item.href} />}
                    isActive={item.active}
                    className="rounded-xl"
                  >
                    <span>{item.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </SidebarMenu>
    </Collapsible>
  );
}

function SidebarUser({
  projectContext,
}: {
  projectContext?: {
    title: string;
    subtitle: string;
    activeItem: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="rounded-3xl border border-white/10 bg-white/6 hover:bg-white/10"
              />
            }
          >
            <Avatar className="rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                TG
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium text-sidebar-foreground">
                {projectContext ? "Project Workspace" : "Administration"}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/60">
                {projectContext ? projectContext.title : "CPIM Navigation"}
              </span>
            </div>
            <DotsThreeOutline className="ml-auto size-4 group-data-[collapsible=icon]:hidden" weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-2xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuItem>
              <UserCircle className="size-4" weight="duotone" />
              <span>Workspace</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <GearSix className="size-4" weight="duotone" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut className="size-4" weight="duotone" />
              <span>Exit</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getAdminSections(href: string, quickLaunchActive?: string): NavSection[] {
  void quickLaunchActive;

  return adminSectionConfigs.map((section) => ({
    title: section.title,
    icon: section.icon,
    items: section.items.map((item) => ({
      ...item,
      active: href === item.href,
    })),
    defaultOpen:
      href === "/" ? section.title === "Administration Home" : section.items.some((item) => item.href === href),
  }));
}

function getProjectSections(href: string, activeItem: string): NavSection[] {
  void activeItem;

  return projectSectionConfigs.map((section) => ({
    title: section.title,
    icon: section.icon,
    items: section.items.map((item) => ({
      ...item,
      active: href === item.href,
    })),
    defaultOpen: section.items.some((item) => item.href === href),
  }));
}
