import Link from "next/link";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/mockup/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { projectSidebarItems } from "@/lib/mockup-data";

type AppShellProps = {
  href: string;
  title: string;
  actions?: string[];
  quickLaunchActive?: string;
  projectContext?: {
    title: string;
    subtitle: string;
    activeItem: string;
  };
  children: ReactNode;
};

export function AppShell({
  href,
  title,
  actions,
  quickLaunchActive,
  projectContext,
  children,
}: AppShellProps) {
  const isProjectPage = href.startsWith("/projects/");

  return (
    <SidebarProvider defaultOpen className="min-h-svh bg-transparent">
      <AppSidebar
        href={href}
        quickLaunchActive={quickLaunchActive}
        projectContext={projectContext}
      />

      <SidebarInset className="min-h-svh bg-transparent">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-background/72 px-4 backdrop-blur-2xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1 rounded-xl text-foreground/70 hover:bg-background/80" />
            <Separator
              orientation="vertical"
              className="hidden h-4 data-[orientation=vertical]:h-4 md:block"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link href="/" />}>
                    {isProjectPage ? "Project Workspace" : "Administration"}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {actions && actions.length > 0 ? (
            <div className="hidden flex-wrap gap-3 md:flex">
              {actions.map((action, index) => (
                <Button
                  key={action}
                  variant={index === 0 ? "default" : "outline"}
                  className={cn(
                    index === 0
                      ? "mockup-action-primary"
                      : "mockup-action-secondary",
                  )}
                >
                  {action}
                </Button>
              ))}
            </div>
          ) : null}
        </header>

        <main className="mx-auto flex w-full max-w-[1760px] flex-1 flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-border/70 bg-card/82 p-5 shadow-[0_24px_64px_rgba(15,23,42,0.1)] backdrop-blur-2xl md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <span className="mockup-status-chip">
                    {isProjectPage ? "Project Workspace" : "Administration"}
                  </span>
                  {quickLaunchActive && !isProjectPage ? (
                    <span>{quickLaunchActive}</span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <h1 className="mockup-page-title">{title}</h1>
                  {projectContext ? (
                    <div className="text-sm leading-6 text-muted-foreground">
                      <div>{projectContext.title}</div>
                      {projectContext.subtitle ? (
                        <div>{projectContext.subtitle}</div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              {actions && actions.length > 0 ? (
                <div className="flex flex-wrap gap-3 md:hidden">
                  {actions.map((action, index) => (
                    <Button
                      key={`mobile-${action}`}
                      variant={index === 0 ? "default" : "outline"}
                      className={cn(
                        index === 0
                          ? "mockup-action-primary"
                          : "mockup-action-secondary",
                      )}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>

            {projectContext ? (
              <ScrollArea className="mt-5 w-full whitespace-nowrap">
                <div className="flex min-w-max gap-2 pb-1">
                  {projectSidebarItems.map((item) => {
                    if (item.type === "divider") {
                      return null;
                    }

                    const isActive = item.label === projectContext.activeItem;

                    return (
                      <Link
                        key={`project-${item.label}`}
                        href={item.href}
                        className={cn(
                          "mockup-subnav-link",
                          isActive && "mockup-subnav-link-active",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : null}
          </section>

          <div className="min-w-0">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
