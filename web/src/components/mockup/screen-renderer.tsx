import Link from "next/link";
import { Fragment } from "react";

import { AppShell } from "@/components/mockup/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type {
  CategoryGridBlock,
  DashboardCardsBlock,
  EmptyListBlock,
  FormBlock,
  ButtonRowBlock,
  MessageBlock,
  MockupBlock,
  MockupScreen,
  PermissionsBlock,
  ProjectCenterBlock,
  PromptFieldsBlock,
  PromptTableBlock,
  PromptTextareaBlock,
  QuickLaunchMatrixBlock,
  RoleAccessMatrixBlock,
  ScheduleBlock,
  TableBlock,
  TabsBlock,
  WorkflowTransferBlock,
} from "@/lib/mockup-data";
import { cn } from "@/lib/utils";

export function ScreenRenderer({ screen }: { screen: MockupScreen }) {
  return (
    <AppShell
      href={screen.href}
      title={screen.title}
      actions={screen.actions}
      quickLaunchActive={screen.quickLaunchActive}
      projectContext={screen.projectContext}
    >
      <div className="space-y-8">{screen.blocks.map(renderBlock)}</div>
    </AppShell>
  );
}

function renderBlock(block: MockupBlock, index: number) {
  switch (block.type) {
    case "category-grid":
      return <CategoryGrid key={index} block={block} />;
    case "table":
      return <DataTableBlock key={index} block={block} />;
    case "form":
      return <FormSection key={index} block={block} />;
    case "permissions":
      return <PermissionsSection key={index} block={block} />;
    case "dashboard-cards":
      return <DashboardCards key={index} block={block} />;
    case "prompt-table":
      return <PromptTable key={index} block={block} />;
    case "prompt-fields":
      return <PromptFields key={index} block={block} />;
    case "prompt-textarea":
      return <PromptTextarea key={index} block={block} />;
    case "tabs":
      return <TabsSection key={index} block={block} />;
    case "schedule":
      return <ScheduleSection key={index} block={block} />;
    case "role-access-matrix":
      return <RoleAccessMatrix key={index} block={block} />;
    case "quick-launch-matrix":
      return <QuickLaunchMatrix key={index} block={block} />;
    case "project-center":
      return <ProjectCenterSection key={index} block={block} />;
    case "empty-list":
      return <EmptyListSection key={index} block={block} />;
    case "message":
      return <MessageSection key={index} block={block} />;
    case "button-row":
      return <ButtonRowSection key={index} block={block} />;
    case "workflow-transfer":
      return <WorkflowTransferSection key={index} block={block} />;
    default:
      return null;
  }
}

function CategoryGrid({ block }: { block: CategoryGridBlock }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {block.groups.map((group) => (
        <Card
          key={group.title}
          className="mockup-panel overflow-hidden border-border/80 bg-card/88"
        >
          <CardHeader className="border-b border-border/70 bg-muted/35 px-5 py-4">
            <CardTitle className="text-base font-medium tracking-[-0.03em] text-foreground/88">
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 px-5 py-4 text-[0.96rem]">
            {group.items.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="mockup-link">
                  {item.label}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DataTableBlock({ block }: { block: TableBlock }) {
  const tableContent = (
    <Table className="mockup-table">
      <TableHeader>
        <TableRow>
          {block.columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {block.rows.map((row, rowIndex) => (
          <TableRow key={`${row.join("-")}-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <TableCell
                key={`${cell}-${cellIndex}`}
                className={cn(
                  cellIndex === 0 && "text-primary",
                  rowIndex === 0 &&
                    block.highlightFirstRow &&
                    "bg-accent/60 font-medium text-foreground",
                )}
              >
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <section className="space-y-4">
      <div className={cn(block.plain ? "overflow-hidden border rounded-lg bg-white" : "mockup-section-shell overflow-hidden")}>
        {block.heading ? (
          <CardHeader className="gap-2 border-b border-[#edf1f4] bg-[#fcfdfd] px-5 py-4">
            <div className="mockup-section-kicker">Data View</div>
            <CardTitle className="mockup-section-heading">{block.heading}</CardTitle>
            {block.description ? (
              <CardDescription className="mockup-section-copy">
                {block.description}
              </CardDescription>
            ) : null}
          </CardHeader>
        ) : null}

        {block.filters && block.filters.length > 0 ? (
          <CardContent className="border-b border-[#edf1f4] px-5 py-4">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              {block.filters.map((filter) => (
                <div key={filter.label} className="space-y-2">
                  <Label className="mockup-field-label">{filter.label}</Label>
                  {filter.type === "select" ? (
                    <Select defaultValue={filter.value}>
                      <SelectTrigger className="mockup-input h-9">
                        <SelectValue placeholder={filter.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(filter.options ?? [filter.value]).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="mockup-input h-9"
                      defaultValue={filter.value}
                      placeholder={filter.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        ) : null}

        {block.toolbar && block.toolbar.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 border-b border-[#e7ebef] bg-[#fafafa] px-5 py-3">
              {block.toolbar.map((action, index) => (
                <Button
                  key={action}
                  variant="ghost"
                  className={cn(
                    "mockup-toolbar-button",
                    index === 0 && "bg-primary/10 text-primary",
                  )}
                >
                  {action}
                </Button>
              ))}
            </div>
            <Separator />
          </>
        ) : null}

        {block.plain ? tableContent : <CardContent className="p-0">{tableContent}</CardContent>}
      </div>
    </section>
  );
}

function FormSection({ block }: { block: FormBlock }) {
  const fields = (
    <div
      className={cn(
        "grid gap-x-8 gap-y-5",
        block.columns === 1 ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {block.fields.map((field) => (
        <div
          key={field.label}
          className={cn(field.wide && "md:col-span-2 xl:col-span-3")}
        >
          <Label className="mockup-field-label">
            {field.label}
            {field.required ? " *" : ""}
          </Label>
          {field.control === "readonly" ? (
            <div className="pt-2 text-[0.96rem] text-[#454d55]">
              {field.value || <span className="text-[#a0a8b0]">-</span>}
            </div>
          ) : field.control === "textarea" ? (
            <Textarea
              defaultValue={field.value}
              className="mockup-input mt-2 min-h-28 rounded-md"
            />
          ) : field.control === "select" ? (
            <Select defaultValue={field.value}>
              <SelectTrigger className="mockup-input mt-2 h-10 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(field.options ?? [field.value]).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input defaultValue={field.value} className="mockup-input mt-2 h-10 rounded-md" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section>
      <Card className={cn(block.plain ? "mockup-section-shell" : "mockup-panel")}>
        <CardHeader className="gap-2 border-b border-[#edf1f4] bg-[#fcfdfd] px-5 py-4">
          <div className="mockup-section-kicker">Form Section</div>
          <CardTitle className="mockup-section-heading">{block.heading}</CardTitle>
          {block.description ? (
            <CardDescription className="mockup-section-copy">
              {block.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="p-5">{fields}</CardContent>
      </Card>
    </section>
  );
}

function PermissionsSection({ block }: { block: PermissionsBlock }) {
  const table = (
    <Table className="mockup-table">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          {block.columns.map((column) => (
            <TableHead key={column} className="w-20 text-center">
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {block.groups.map((group) => (
          <Fragment key={group.title}>
            <TableRow key={group.title}>
              <TableCell
                colSpan={block.columns.length + 1}
                className="bg-muted/45 font-medium text-foreground/72"
              >
                {group.title}
              </TableCell>
            </TableRow>
            {group.rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="text-primary">{row.name}</TableCell>
                {row.states.map((checked, index) => (
                  <TableCell key={index} className="text-center">
                    <Checkbox checked={checked} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-card/72 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mockup-section-kicker">Permissions</div>
        <h2 className="text-[1.06rem] font-medium text-foreground/88">
          {block.heading}
        </h2>
        {block.description ? (
          <p className="max-w-[230px] text-sm leading-6 text-muted-foreground">
            {block.description}
          </p>
        ) : null}
      </div>

      {block.plain ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white">
          {table}
        </div>
      ) : (
        <Card className="mockup-section-shell overflow-hidden">
          <CardContent className="p-0">{table}</CardContent>
        </Card>
      )}
    </section>
  );
}

function DashboardCards({ block }: { block: DashboardCardsBlock }) {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {block.cards.map((card) => (
          <Card key={card.label} className="mockup-panel">
            <CardContent className="space-y-4 p-5">
              <div className="text-sm text-[#707983]">{card.label}</div>
              <div className="text-3xl font-light text-[#46515c]">
                {card.value}
              </div>
              {card.tone ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-sm px-2.5 py-1 text-[0.72rem] font-medium",
                    card.tone === "good" &&
                      "bg-[#edf8f1] text-[#34714a]",
                    card.tone === "warn" &&
                      "bg-[#fff6e0] text-[#9b6a12]",
                    card.tone === "bad" &&
                      "bg-[#feeceb] text-[#a94742]",
                  )}
                >
                  {card.note}
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {block.table ? <DataTableBlock block={block.table} /> : null}
    </section>
  );
}

function PromptTable({ block }: { block: PromptTableBlock }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-card/72 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mockup-section-kicker">Selection</div>
        <h2 className="text-[1.02rem] font-medium text-foreground/88">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-muted-foreground">
          {block.description}
        </p>
      </div>
      <DataTableBlock
        block={{
          type: "table",
          columns: block.columns,
          rows: block.rows,
          highlightFirstRow: block.highlightFirstRow,
        }}
      />
    </section>
  );
}

function PromptFields({ block }: { block: PromptFieldsBlock }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-card/72 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mockup-section-kicker">Setup</div>
        <h2 className="text-[1.02rem] font-medium text-foreground/88">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-muted-foreground">
          {block.description}
        </p>
      </div>
      <Card className="mockup-section-shell">
        <CardContent className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {block.fields.map((field) => (
            <div key={field.label}>
              <Label className="mockup-field-label">{field.label}</Label>
              <Input
                defaultValue={field.value}
                className={cn(
                  "mockup-input mt-2",
                  field.type === "date" && "max-w-48",
                )}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

function PromptTextarea({ block }: { block: PromptTextareaBlock }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-3 rounded-[1.75rem] border border-border/70 bg-card/72 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mockup-section-kicker">Comments</div>
        <h2 className="text-[1.02rem] font-medium text-foreground/88">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-muted-foreground">
          {block.description}
        </p>
      </div>
      <Card className="mockup-section-shell">
        <CardContent className="p-5">
          <Label className="mockup-field-label">{block.label}</Label>
          <Textarea
            defaultValue={block.value}
            className="mockup-input mt-2 min-h-36"
          />
        </CardContent>
      </Card>
    </section>
  );
}

function TabsSection({ block }: { block: TabsBlock }) {
  return (
    <section className="space-y-4">
      <Tabs defaultValue={block.tabs[0]?.label}>
        <TabsList className="h-auto rounded-[1.25rem] border border-border/80 bg-card/82 p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          {block.tabs.map((tab) => (
            <TabsTrigger
              key={tab.label}
              value={tab.label}
              className="rounded-[0.9rem] px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {block.tabs[0]?.badges ? (
        <div className="flex flex-wrap gap-2">
          {block.tabs[0].badges.map((badge) => (
            <Badge
              key={badge}
              variant="secondary"
              className="rounded-sm bg-primary/10 px-2.5 py-1 text-primary"
            >
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ScheduleSection({ block }: { block: ScheduleBlock }) {
  return (
    <section className="space-y-4">
      <div className="mockup-section-shell overflow-hidden">
        <div className="relative border-b border-border/70 bg-muted/30">
          <div className="absolute left-[32%] top-[-1px] z-10 rounded-b-xl bg-primary px-3 py-1 text-sm text-primary-foreground shadow-[0_10px_20px_rgba(13,148,136,0.22)]">
          Today
          </div>
          <div className="grid grid-cols-[30%_70%] border-b border-border/70 text-center text-[0.86rem] text-muted-foreground">
            <div className="border-r border-border/70 py-3">{block.months[0]}</div>
            <div className="py-3">{block.months.slice(1).join("          ")}</div>
          </div>
          <div className="py-2 text-center text-[0.95rem] text-muted-foreground">
            {block.prompt}
          </div>
        </div>

        <div className="grid min-h-[560px] overflow-hidden bg-white xl:grid-cols-[61%_39%]">
          <div className="border-r border-border/70">
          <Table className="mockup-table">
            <TableHeader>
              <TableRow>
                {block.columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row) => (
                <TableRow key={`${row.taskName}-${row.id}`}>
                  <TableCell className="w-12 text-center">
                    {row.progress ? (
                      <span className="inline-block h-5 w-5 rounded-full bg-[#ff7c7c] shadow-inner" />
                    ) : null}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-[#39444f]",
                      row.emphasis && "font-semibold",
                      row.indent === 1 && "pl-5",
                      row.indent === 2 && "pl-9",
                      row.indent === 3 && "pl-[3.25rem]",
                    )}
                  >
                    {row.taskName}
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="relative bg-[linear-gradient(to_right,rgba(226,232,240,0.9)_1px,transparent_1px)] bg-[length:82px_100%]">
            <div className="grid grid-cols-6 border-b border-border/70 text-center text-[0.82rem] text-muted-foreground">
              {["T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="border-r border-border/50 py-2 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.08),transparent_32%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleAccessMatrix({ block }: { block: RoleAccessMatrixBlock }) {
  return (
    <section className="space-y-8">
      <div className="space-y-4 rounded-[1.75rem] border border-border/70 bg-card/82 p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)]">
        <div className="mockup-section-kicker">Security</div>
        <h2 className="text-[2rem] font-light tracking-tight text-[#383d43]">
          Role Access
        </h2>
        <div className="flex max-w-[980px] items-center gap-5">
          <div className="min-w-24 text-[0.98rem] text-[#4d555e]">Select Role</div>
          <Select defaultValue={block.selectedRole}>
            <SelectTrigger className="mockup-input h-11 flex-1 rounded-md bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {block.roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="rounded-sm bg-white px-8 text-[#3f4b56] border border-[#cfd6dd] hover:bg-[#f5f7f9]">
            Save
          </Button>
        </div>
      </div>

      <div className="mockup-section-shell overflow-x-auto p-5">
        <div className="min-w-[1180px] space-y-6">
          <div className="grid grid-cols-[220px_220px_160px_190px_220px_170px_220px] gap-4 text-[0.92rem] font-medium text-[#515961]">
            <div>Module Name</div>
            <div>Function Name</div>
            <div>Access</div>
            <div>Read Only</div>
            <div>Read Only Levels</div>
            <div>Read Write</div>
            <div>Read Write Levels</div>
          </div>

          {block.groups.map((group) => (
            <div key={group.moduleName} className="space-y-4">
              <div className="text-[0.95rem] text-[#4a525b]">{group.moduleName}</div>
              {group.rows.map((row) => (
                <div
                  key={`${group.moduleName}-${row.functionName}`}
                  className="grid grid-cols-[220px_220px_160px_190px_220px_170px_220px] items-center gap-4"
                >
                  <div />
                  <div className="text-[0.95rem] text-[#4a525b]">{row.functionName}</div>
                  <div>
                    <Switch checked={row.access} />
                  </div>
                  <div>
                    <Switch checked={row.readOnly} />
                  </div>
                  <div>
                    <Select defaultValue={row.readOnlyLevel}>
                      <SelectTrigger className="h-10 w-[76px] rounded-sm bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["", "L1", "L2", "L3", "L4"].map((level) => (
                          <SelectItem key={level || "empty"} value={level}>
                            {level || "-"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Switch checked={row.readWrite} />
                  </div>
                  <div>
                    <Select defaultValue={row.readWriteLevel}>
                      <SelectTrigger className="h-10 w-[76px] rounded-sm bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["L1", "L2", "L3", "L4"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLaunchMatrix({ block }: { block: QuickLaunchMatrixBlock }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-border/70 bg-card/82 px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="mockup-section-kicker">Navigation</div>
        <div className="mt-2 text-[1.35rem] font-light text-[#50575f]">
          Modify Quick Launch Items
        </div>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <Table className="mockup-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Custom Name</TableHead>
              <TableHead>Custom URL</TableHead>
              <TableHead className="text-center">Display in Quick Launch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, index) => (
              <TableRow key={`${row.name}-${index}`}>
                <TableCell
                  className={cn(
                    "text-[#4f5962]",
                    row.emphasis && "font-semibold text-[#3e4953]",
                    row.indent === 1 && "pl-10",
                    row.indent === 2 && "pl-16",
                  )}
                >
                  {row.name}
                </TableCell>
                <TableCell>{row.customName ?? ""}</TableCell>
                <TableCell className="text-[#61707c]">{row.customUrl ?? ""}</TableCell>
                <TableCell className="text-center">
                  <Checkbox checked={row.display} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function ProjectCenterSection({ block }: { block: ProjectCenterBlock }) {
  return (
    <section className="space-y-4">
      <div className="mockup-section-shell overflow-hidden">
        <div className="relative border-b border-border/70 bg-muted/30">
          <div className="absolute left-[18%] top-[-1px] z-10 rounded-b-xl bg-primary px-3 py-1 text-sm text-primary-foreground shadow-[0_10px_20px_rgba(13,148,136,0.22)]">
          Today
          </div>
          <div className="grid grid-cols-6 border-b border-border/70 text-center text-[0.86rem] text-muted-foreground">
            {block.months.map((month) => (
              <div key={month} className="py-3">
                {month}
              </div>
            ))}
          </div>
          <div className="py-2 text-center text-[0.95rem] text-muted-foreground">
            {block.prompt}
          </div>
        </div>

        <div className="overflow-hidden bg-white">
          <Table className="mockup-table">
            <TableHeader>
              <TableRow>
                {block.columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, index) => (
                <TableRow key={`${row[1]}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell
                      key={`${cell}-${cellIndex}`}
                      className={cn(
                        cellIndex === 1 && "text-primary",
                        cellIndex === 0 && "w-14 text-center",
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function EmptyListSection({ block }: { block: EmptyListBlock }) {
  return (
    <section className="space-y-5">
      <div className="mockup-section-shell overflow-hidden">
        <div className="space-y-5 border-b border-border/70 bg-card/82 px-5 py-5">
          {block.toolbar && block.toolbar.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {block.toolbar.map((item, index) => (
                <Button
                  key={item}
                  variant={index === 0 ? "default" : "outline"}
                  className={cn(
                    index === 0 ? "mockup-action-primary" : "mockup-action-secondary",
                  )}
                >
                  {item}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-[0.94rem] text-[#5a6470]">
            <h2 className="mr-6 text-[1.8rem] font-light text-[#3e444a]">
              {block.heading}
            </h2>
            {block.filters?.map((filter) => (
              <span key={filter} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                {filter}
              </span>
            ))}
          </div>
        </div>

        <Table className="mockup-table">
          <TableHeader>
            <TableRow>
              {block.columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="h-20 w-20 rounded-[2rem] bg-[radial-gradient(circle_at_30%_30%,rgba(13,148,136,0.2),#ffffff_55%,rgba(217,234,235,0.9))]" />
          <div className="text-[1.55rem] font-medium text-[#27303a]">{block.message}</div>
          {block.note ? (
            <div className="max-w-[520px] text-[1rem] text-[#6c7580]">{block.note}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function MessageSection({ block }: { block: MessageBlock }) {
  return (
    <section>
      <Card className="mockup-section-shell border-primary/12 bg-[linear-gradient(135deg,rgba(13,148,136,0.08),rgba(255,255,255,0.92))]">
        <CardContent className="space-y-3 px-5 py-5">
          {block.heading ? (
            <h2 className="text-[1.08rem] font-medium text-[#535a61]">
              {block.heading}
            </h2>
          ) : null}
          <p className="max-w-[980px] text-[1rem] leading-7 text-[#4f5862]">
            {block.body}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function ButtonRowSection({ block }: { block: ButtonRowBlock }) {
  return (
    <section className="flex gap-3">
      {block.buttons.map((button, index) => (
        <Button
          key={button}
          variant={index === 0 ? "default" : "outline"}
          className={cn(
            index === 0 ? "mockup-action-primary" : "mockup-action-secondary",
          )}
        >
          {button}
        </Button>
      ))}
    </section>
  );
}

function WorkflowTransferSection({ block }: { block: WorkflowTransferBlock }) {
  return (
    <section className="space-y-6">
      <Card className="mockup-section-shell">
        <CardContent className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-4">
          {block.fields.map((field) => (
            <div key={field.label}>
              <Label className="mockup-field-label">{field.label}</Label>
              {field.type === "select" ? (
                <Select defaultValue={field.value}>
                  <SelectTrigger className="mockup-input mt-2 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? [field.value]).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input defaultValue={field.value} className="mockup-input mt-2 h-10" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)]">
        <TransferListCard title={block.availableTitle} items={block.availableItems} />

        <div className="flex flex-col items-center justify-center gap-3">
          {["Add >", "< Remove", "Move Up", "Move Down"].map((label) => (
            <Button
              key={label}
              variant="outline"
              className="w-full rounded-2xl border-border bg-white/92 px-3 text-[#53606d] hover:bg-accent/55"
            >
              {label}
            </Button>
          ))}
        </div>

        <TransferListCard title={block.selectedTitle} items={block.selectedItems} selected />
      </div>
    </section>
  );
}

function TransferListCard({
  title,
  items,
  selected = false,
}: {
  title: string;
  items: string[];
  selected?: boolean;
}) {
  return (
    <Card className="mockup-panel overflow-hidden">
      <div className="border-b border-[#e7ebef] bg-[#fafbfd] px-4 py-3 text-[0.92rem] font-medium text-[#59626b]">
        {title}
      </div>
      <CardContent className="p-0">
        <div className="divide-y divide-[#edf0f3]">
          {items.map((item, index) => (
            <div
              key={`${title}-${item}`}
              className={cn(
                "px-4 py-3 text-[0.94rem] text-[#4a545f]",
                selected && index === 0 && "bg-primary/10 text-primary",
              )}
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
