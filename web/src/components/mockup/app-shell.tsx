import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { projectSidebarItems, quickLaunchItems } from "@/lib/mockup-data";

const adminSidebarItems = [
  { label: "PWA Settings", href: "/" },
  { label: "Manage Views", href: "/manage-view" },
  { label: "Quick Launch", href: "/quick-launch" },
  { label: "Manage Templates", href: "/manage-template" },
  { label: "Manage Delegates", href: "/manage-delegates" },
  { label: "Time Reporting Periods", href: "/time-report-period" },
  { label: "Reporting", href: "/report" },
];

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f9fbfd_0%,#eef3f6_52%,#eef2f4_100%)] text-foreground lg:grid lg:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#dbe3ea] bg-[#fbfcfd] lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-[#e5ebf0] px-6 py-6">
          <Link href="/" className="block">
            <div className="rounded-2xl border border-[#dce5ed] bg-[linear-gradient(180deg,#1a5f9a_0%,#144f82_100%)] p-4 text-white shadow-[0_12px_28px_rgba(20,79,130,0.18)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/14 text-2xl font-semibold">
                  P
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em]">
                  PMO
                </div>
              </div>
              <div className="text-2xl font-light tracking-tight">CPIMUAT</div>
              <div className="mt-1 text-sm text-white/78">Client review prototype</div>
            </div>
          </Link>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-8 px-4 py-5">
            <section className="space-y-3">
              <div className="px-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#83909b]">
                Workspace
              </div>
              <div className="space-y-1">
                {quickLaunchItems.map((item) => {
                  const isActive = item.label === quickLaunchActive;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "mockup-sidebar-link",
                        isActive && "mockup-sidebar-link-active",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div className="px-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#83909b]">
                Administration
              </div>
              <div className="space-y-1">
                {adminSidebarItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "mockup-sidebar-link",
                      href === item.href && "mockup-sidebar-link-active",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </aside>

      <div className="min-h-screen">
        <header className="border-b border-[#dbe3ea] bg-white/88 px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a5f9a] text-xl font-semibold text-white">
              P
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f7b86]">PMO</div>
              <div className="text-2xl font-light tracking-tight text-[#47515a]">CPIMUAT</div>
            </div>
          </Link>
          <ScrollArea className="mt-4 w-full whitespace-nowrap">
            <div className="flex min-w-max gap-2 pb-1">
              {quickLaunchItems.map((item) => (
                <Link
                  key={`mobile-global-${item.label}`}
                  href={item.href}
                  className={cn(
                    "mockup-project-chip",
                    item.label === quickLaunchActive && "mockup-project-chip-active",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </header>

        <main className="mx-auto max-w-[1720px] px-4 py-5 lg:px-8 lg:py-8">
          <div className="mb-6 rounded-[1.25rem] border border-[#dbe3ea] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfd_100%)] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_14px_36px_rgba(15,23,42,0.05)] lg:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-[#7e8a96]">
                  <span className="mockup-status-chip">
                    {isProjectPage ? "Project Workspace" : "Administration"}
                  </span>
                  {quickLaunchActive ? <span>{quickLaunchActive}</span> : null}
                </div>
                <div>
                  <h1 className="mockup-page-title">{title}</h1>
                  {projectContext ? (
                    <div className="mt-2 space-y-1 text-sm text-[#6e7883]">
                      <div>{projectContext.title}</div>
                      {projectContext.subtitle ? <div>{projectContext.subtitle}</div> : null}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-[#6e7883]">
                      Reimagined client-facing workflow mockup
                    </div>
                  )}
                </div>
              </div>

              {actions && actions.length > 0 ? (
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  {actions.map((action, index) => (
                    <Button
                      key={action}
                      variant={index === 0 ? "default" : "outline"}
                      className={cn(
                        index === 0 ? "mockup-action-primary" : "mockup-action-secondary",
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
          </div>

          <div className="min-w-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
