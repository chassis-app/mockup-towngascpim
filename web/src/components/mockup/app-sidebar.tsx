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

import { projectSidebarItems, quickLaunchItems } from "@/lib/mockup-data";
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

const adminSidebarItems = [
  { label: "PWA Settings", href: "/" },
  { label: "Manage Views", href: "/manage-view" },
  { label: "Quick Launch", href: "/quick-launch" },
  { label: "Manage Templates", href: "/manage-template" },
  { label: "Manage Delegates", href: "/manage-delegates" },
  { label: "Time Reporting Periods", href: "/time-report-period" },
  { label: "Reporting", href: "/report" },
];

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
    <Collapsible defaultOpen={section.defaultOpen} className="group/collapsible">
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
  const workspaceItems = quickLaunchItems.map((item) => ({
    label: item.label,
    href: item.href,
    active: item.label === quickLaunchActive || href === item.href,
  }));

  const administrationItems = adminSidebarItems.map((item) => ({
    ...item,
    active: href === item.href,
  }));

  return [
    {
      title: "Workspace",
      icon: SquaresFour,
      items: workspaceItems,
      defaultOpen: workspaceItems.some((item) => item.active),
    },
    {
      title: "Administration",
      icon: Buildings,
      items: administrationItems,
      defaultOpen:
        administrationItems.some((item) => item.active) || href === "/",
    },
  ];
}

function getProjectSections(href: string, activeItem: string): NavSection[] {
  const links = projectSidebarItems.filter((item) => item.type === "link");
  const overviewItems = links.slice(0, 4).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.label === activeItem || href === item.href,
  }));
  const workspaceItems = links.slice(4, links.length - 1).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.label === activeItem || href === item.href,
  }));
  const utilityItems = links.slice(-1).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.label === activeItem || href === item.href,
  }));

  return [
    {
      title: "Overview",
      icon: House,
      items: overviewItems,
      defaultOpen: overviewItems.some((item) => item.active),
    },
    {
      title: "Workspace",
      icon: ClipboardText,
      items: workspaceItems,
      defaultOpen: workspaceItems.some((item) => item.active),
    },
    {
      title: "Utilities",
      icon: Wrench,
      items: utilityItems,
      defaultOpen: utilityItems.some((item) => item.active),
    },
  ];
}
