import Link from "next/link";

import { AppShell } from "@/components/mockup/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  FormBlock,
  MockupBlock,
  MockupScreen,
  PermissionsBlock,
  PromptFieldsBlock,
  PromptTableBlock,
  PromptTextareaBlock,
  TableBlock,
  TabsBlock,
} from "@/lib/mockup-data";
import { cn } from "@/lib/utils";

export function ScreenRenderer({ screen }: { screen: MockupScreen }) {
  return (
    <AppShell
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
    default:
      return null;
  }
}

function CategoryGrid({ block }: { block: CategoryGridBlock }) {
  return (
    <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
      {block.groups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-[1.02rem] font-medium text-[#595f66]">
            {group.title}
          </h2>
          <div className="space-y-1 text-[1.02rem]">
            {group.items.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="mockup-link">
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DataTableBlock({ block }: { block: TableBlock }) {
  return (
    <section className="space-y-4">
      {block.heading ? (
        <div className="space-y-1">
          <h2 className="mockup-section-title">{block.heading}</h2>
          {block.description ? (
            <p className="text-sm text-[#6a737c]">{block.description}</p>
          ) : null}
        </div>
      ) : null}

      {block.filters && block.filters.length > 0 ? (
        <Card className="mockup-panel">
          <CardContent className="grid gap-4 p-4 md:grid-cols-3 xl:grid-cols-5">
            {block.filters.map((filter) => (
              <div key={filter.label} className="space-y-2">
                <Label className="mockup-field-label">{filter.label}</Label>
                {filter.type === "select" ? (
                  <Select defaultValue={filter.value}>
                    <SelectTrigger className="h-9 rounded-sm">
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
                    className="h-9 rounded-sm"
                    defaultValue={filter.value}
                    placeholder={filter.placeholder}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mockup-panel overflow-hidden">
        <CardContent className="p-0">
          {block.toolbar && block.toolbar.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 border-b border-[#e7ebef] bg-[#fafafa] px-3 py-2.5">
                {block.toolbar.map((action, index) => (
                  <Button
                    key={action}
                    variant="ghost"
                    className={cn(
                      "h-8 rounded-sm border border-[#d7dde4] px-3 text-[0.82rem] font-normal text-[#5a626a]",
                      index === 0 && "bg-[#f7fbff]",
                    )}
                  >
                    {action}
                  </Button>
                ))}
              </div>
              <Separator />
            </>
          ) : null}

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
                        cellIndex === 0 && "text-[#2d6eaa]",
                        rowIndex === 0 &&
                          block.highlightFirstRow &&
                          "bg-[#fff8cc] font-medium text-[#34414f]",
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function FormSection({ block }: { block: FormBlock }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2">
        <h2 className="text-[1.02rem] font-medium text-[#595f66]">
          {block.heading}
        </h2>
        {block.description ? (
          <p className="max-w-[230px] text-sm leading-6 text-[#747d86]">
            {block.description}
          </p>
        ) : null}
      </div>

      <Card className="mockup-panel">
        <CardContent className="p-5">
          <div
            className={cn(
              "grid gap-x-8 gap-y-5",
              block.columns === 1
                ? "grid-cols-1"
                : "md:grid-cols-2 xl:grid-cols-3",
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
                    {field.value}
                  </div>
                ) : field.control === "textarea" ? (
                  <Textarea
                    defaultValue={field.value}
                    className="mt-2 min-h-28 rounded-sm"
                  />
                ) : field.control === "select" ? (
                  <Select defaultValue={field.value}>
                    <SelectTrigger className="mt-2 h-10 rounded-sm">
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
                  <Input
                    defaultValue={field.value}
                    className="mt-2 h-10 rounded-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function PermissionsSection({ block }: { block: PermissionsBlock }) {
  return (
    <section className="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2">
        <h2 className="text-[1.02rem] font-medium text-[#595f66]">
          {block.heading}
        </h2>
        {block.description ? (
          <p className="max-w-[230px] text-sm leading-6 text-[#747d86]">
            {block.description}
          </p>
        ) : null}
      </div>

      <Card className="mockup-panel overflow-hidden">
        <CardContent className="p-0">
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
                <>
                  <TableRow key={group.title}>
                    <TableCell
                      colSpan={block.columns.length + 1}
                      className="bg-[#fafbfd] font-medium text-[#59626b]"
                    >
                      {group.title}
                    </TableCell>
                  </TableRow>
                  {group.rows.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell className="text-[#2d6eaa]">
                        {row.name}
                      </TableCell>
                      {row.states.map((checked, index) => (
                        <TableCell key={index} className="text-center">
                          <Checkbox checked={checked} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
      <div className="space-y-3">
        <h2 className="text-[1.02rem] font-medium text-[#595f66]">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-[#747d86]">
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
      <div className="space-y-3">
        <h2 className="text-[1.02rem] font-medium text-[#595f66]">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-[#747d86]">
          {block.description}
        </p>
      </div>
      <Card className="mockup-panel">
        <CardContent className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {block.fields.map((field) => (
            <div key={field.label}>
              <Label className="mockup-field-label">{field.label}</Label>
              <Input
                defaultValue={field.value}
                className={cn("mt-2 rounded-sm", field.type === "date" && "max-w-48")}
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
      <div className="space-y-3">
        <h2 className="text-[1.02rem] font-medium text-[#595f66]">
          {block.heading}
        </h2>
        <p className="max-w-[240px] text-sm leading-6 text-[#747d86]">
          {block.description}
        </p>
      </div>
      <Card className="mockup-panel">
        <CardContent className="p-5">
          <Label className="mockup-field-label">{block.label}</Label>
          <Textarea defaultValue={block.value} className="mt-2 min-h-36 rounded-sm" />
        </CardContent>
      </Card>
    </section>
  );
}

function TabsSection({ block }: { block: TabsBlock }) {
  return (
    <section className="space-y-4">
      <Tabs defaultValue={block.tabs[0]?.label}>
        <TabsList className="h-auto rounded-sm border border-[#d7dde4] bg-white p-1">
          {block.tabs.map((tab) => (
            <TabsTrigger
              key={tab.label}
              value={tab.label}
              className="rounded-sm px-4 py-2 data-[state=active]:bg-[#edf4fa] data-[state=active]:text-[#1f5d96]"
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
              className="rounded-sm bg-[#edf4fa] px-2.5 py-1 text-[#1f5d96]"
            >
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
  );
}
