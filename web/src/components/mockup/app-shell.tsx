import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { projectSidebarItems, quickLaunchItems } from "@/lib/mockup-data";

type AppShellProps = {
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
  title,
  actions,
  quickLaunchActive,
  projectContext,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f7f4_0%,#f1f4f6_100%)] text-foreground">
      <header className="border-b border-[#d7dde4] bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur">
        <div className="mx-auto flex max-w-[1820px] flex-col gap-5 px-4 py-5 lg:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
            <Link href="/" className="flex min-w-fit items-center gap-5">
              <div className="flex h-16 w-44 items-center gap-3 rounded-md bg-[#155b9a] px-4 text-white shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/12 text-3xl font-semibold">
                  P
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.28em]">
                  PMO
                </div>
              </div>
              <div className="text-[2.55rem] font-light leading-none tracking-tight text-[#4c4f54]">
                CPIMUAT
              </div>
            </Link>

            <ScrollArea className="w-full whitespace-nowrap xl:flex-1">
              <div className="flex min-w-max items-center gap-6 pb-1 pt-1 text-[0.95rem] text-[#5b636c]">
                {quickLaunchItems.map((item) => {
                  const isActive = item.label === quickLaunchActive;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "border-b border-transparent pb-1.5 hover:text-[#1f5d96]",
                        isActive && "border-[#1f5d96] text-[#1f5d96]",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <span className="pb-1 text-[0.94rem] text-[#4d535a]">
                  EDIT LINKS
                </span>
              </div>
            </ScrollArea>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1820px] flex-col px-4 py-7 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="mockup-page-title">{title}</h1>
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
          <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
            <div className="xl:hidden">
              <div className="mb-4 rounded-lg border border-[#d7dde4] bg-white px-4 py-3 text-[0.88rem] leading-6 text-[#606970] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div>{projectContext.title}</div>
                {projectContext.subtitle ? <div>{projectContext.subtitle}</div> : null}
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex min-w-max gap-2 pb-1">
                  {projectSidebarItems.map((item) => {
                    if (item.type === "divider") {
                      return null;
                    }

                    const isActive = item.label === projectContext.activeItem;

                    return (
                      <Link
                        key={`mobile-${item.label}`}
                        href={item.href}
                        className={cn(
                          "mockup-project-chip",
                          isActive && "mockup-project-chip-active",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <aside className="hidden xl:block">
              <div className="sticky top-6 space-y-4">
                <div className="rounded-lg border border-[#d7dde4] bg-white px-4 py-3 text-[0.92rem] leading-6 text-[#606970] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div>{projectContext.title}</div>
                  {projectContext.subtitle ? <div>{projectContext.subtitle}</div> : null}
                </div>

                <nav className="mockup-panel overflow-hidden">
                  <div className="divide-y divide-[#edf0f3]">
                    {projectSidebarItems.map((item) => {
                      if (item.type === "divider") {
                        return (
                          <div
                            key={`divider-${item.label}`}
                            className="mx-4 h-px bg-[#e7ebef]"
                          />
                        );
                      }

                      const isActive = item.label === projectContext.activeItem;

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={cn(
                            "block px-4 py-2.5 text-[0.92rem] text-[#59626b] hover:bg-[#f7fafc] hover:text-[#1f5d96]",
                            isActive && "bg-[#edf4fa] text-[#1f5d96]",
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </div>
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
