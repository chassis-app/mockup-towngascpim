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
    <div className="min-h-screen bg-[#f4f5f3] text-foreground">
      <header className="border-b border-[#d7dde4] bg-white">
        <div className="mx-auto flex max-w-[1820px] flex-col gap-6 px-4 py-6 lg:px-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
            <Link href="/" className="flex min-w-fit items-center gap-5">
              <div className="flex h-16 w-44 items-center gap-3 bg-[#155b9a] px-4 text-white shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/12 text-3xl font-semibold">
                  P
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.28em]">
                  PMO
                </div>
              </div>
              <div className="text-[2.75rem] font-light leading-none tracking-tight text-[#4c4f54]">
                CPIMUAT
              </div>
            </Link>

            <ScrollArea className="w-full whitespace-nowrap xl:flex-1">
              <div className="flex min-w-max items-center gap-6 pb-1 text-[0.96rem] text-[#5b636c]">
                {quickLaunchItems.map((item) => {
                  const isActive = item.label === quickLaunchActive;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "border-b border-transparent pb-1 hover:text-[#1f5d96]",
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
                    "min-w-24 rounded-sm px-5",
                    index === 0 &&
                      "bg-[#1f5d96] text-white hover:bg-[#184f84]",
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
            <aside className="hidden xl:block">
              <div className="sticky top-6 space-y-4">
                <div className="px-2 text-[0.92rem] leading-6 text-[#606970]">
                  <div>{projectContext.title}</div>
                  <div>{projectContext.subtitle}</div>
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
