type QuickLaunchItem = {
  label: string;
  href: string;
};

type ProjectSidebarItem =
  | {
      type: "link";
      label: string;
      href: string;
    }
  | {
      type: "divider";
      label: string;
    };

export type FilterField = {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "select";
  options?: string[];
};

export type TableBlock = {
  type: "table";
  heading?: string;
  description?: string;
  toolbar?: string[];
  filters?: FilterField[];
  columns: string[];
  rows: string[][];
  highlightFirstRow?: boolean;
  plain?: boolean;
};

type FormField = {
  label: string;
  value: string;
  required?: boolean;
  wide?: boolean;
  control?: "input" | "textarea" | "select" | "readonly";
  options?: string[];
};

export type FormBlock = {
  type: "form";
  heading: string;
  description?: string;
  columns?: 1 | 2 | 3;
  fields: FormField[];
  plain?: boolean;
};

type PermissionRow = {
  name: string;
  states: boolean[];
};

export type PermissionsBlock = {
  type: "permissions";
  heading: string;
  description?: string;
  columns: string[];
  groups: {
    title: string;
    rows: PermissionRow[];
  }[];
  plain?: boolean;
};

export type DashboardCardsBlock = {
  type: "dashboard-cards";
  cards: {
    label: string;
    value: string;
    note?: string;
    tone?: "good" | "warn" | "bad";
  }[];
  table?: TableBlock;
};

export type CategoryGridBlock = {
  type: "category-grid";
  groups: {
    title: string;
    items: {
      label: string;
      href: string;
    }[];
  }[];
};

export type PromptTableBlock = {
  type: "prompt-table";
  heading: string;
  description: string;
  columns: string[];
  rows: string[][];
  highlightFirstRow?: boolean;
};

export type PromptFieldsBlock = {
  type: "prompt-fields";
  heading: string;
  description: string;
  fields: {
    label: string;
    value: string;
    type?: "text" | "date";
  }[];
};

export type PromptTextareaBlock = {
  type: "prompt-textarea";
  heading: string;
  description: string;
  label: string;
  value: string;
};

export type TabsBlock = {
  type: "tabs";
  tabs: {
    label: string;
    badges?: string[];
  }[];
};

export type ScheduleBlock = {
  type: "schedule";
  months: string[];
  prompt: string;
  columns: string[];
  rows: {
    progress?: string;
    taskName: string;
    id: string;
    emphasis?: boolean;
    indent?: 0 | 1 | 2 | 3;
  }[];
};

export type RoleAccessMatrixBlock = {
  type: "role-access-matrix";
  selectedRole: string;
  roles: string[];
  groups: {
    moduleName: string;
    rows: {
      functionName: string;
      access: boolean;
      readOnly: boolean;
      readOnlyLevel: string;
      readWrite: boolean;
      readWriteLevel: string;
    }[];
  }[];
};

export type MockupBlock =
  | CategoryGridBlock
  | TableBlock
  | FormBlock
  | PermissionsBlock
  | DashboardCardsBlock
  | PromptTableBlock
  | PromptFieldsBlock
  | PromptTextareaBlock
  | TabsBlock
  | ScheduleBlock
  | RoleAccessMatrixBlock;

export type MockupScreen = {
  title: string;
  href: string;
  quickLaunchActive?: string;
  actions?: string[];
  projectContext?: {
    title: string;
    subtitle: string;
    activeItem: string;
  };
  blocks: MockupBlock[];
};

export const quickLaunchItems: QuickLaunchItem[] = [
  { label: "Project Management", href: "/projects/rp-20250059/information" },
  { label: "Approvals", href: "/projects/rp-20250059/approvals" },
  { label: "Tasks", href: "/projects/rp-20250059/tasks" },
  { label: "Resources", href: "/projects/rp-20250059/resources" },
  { label: "CPIM Template", href: "/projects/rp-20250059/cpim-template" },
  { label: "CPIM Reports", href: "/projects/rp-20250059/cpim-reports" },
  { label: "Role Access", href: "/projects/rp-20250059/role-access" },
  { label: "Contractor Master", href: "/projects/rp-20250059/contractor-master" },
  { label: "BOM Maintenance", href: "/projects/rp-20250059/bom-maintenance" },
  { label: "Tenderer Group", href: "/projects/rp-20250059/tenderer-group" },
  { label: "Generic Report", href: "/projects/rp-20250059/generic-report" },
  { label: "Knowledge Management", href: "/projects/rp-20250059/knowledge-management" },
];

export const projectSidebarItems: ProjectSidebarItem[] = [
  { type: "link", label: "Project Information (RP)", href: "/projects/rp-20250059/information" },
  { type: "link", label: "Schedule", href: "/projects/rp-20250059/schedule" },
  { type: "link", label: "Project Status", href: "/projects/rp-20250059/project-status" },
  { type: "link", label: "Project Site", href: "/projects/rp-20250059/project-site" },
  { type: "divider", label: "main" },
  { type: "link", label: "Project Management", href: "/projects/rp-20250059/project-management" },
  { type: "link", label: "Approvals", href: "/projects/rp-20250059/approvals" },
  { type: "link", label: "Tasks", href: "/projects/rp-20250059/tasks" },
  { type: "link", label: "Resources", href: "/projects/rp-20250059/resources" },
  { type: "link", label: "CPIM Template", href: "/projects/rp-20250059/cpim-template" },
  { type: "link", label: "CPIM Reports", href: "/projects/rp-20250059/cpim-reports" },
  { type: "link", label: "Role Access", href: "/projects/rp-20250059/role-access" },
  { type: "link", label: "Contractor Master", href: "/projects/rp-20250059/contractor-master" },
  { type: "link", label: "Customer Master", href: "/projects/rp-20250059/customer-master" },
  { type: "link", label: "Inspection Master", href: "/projects/rp-20250059/inspection-master" },
  { type: "link", label: "Alert Dashboard", href: "/projects/rp-20250059/alert-dashboard" },
  { type: "link", label: "BOM Maintenance", href: "/projects/rp-20250059/bom-maintenance" },
  { type: "link", label: "Tenderer Group", href: "/projects/rp-20250059/tenderer-group" },
  { type: "link", label: "Generic Report", href: "/projects/rp-20250059/generic-report" },
  { type: "link", label: "Knowledge Management", href: "/projects/rp-20250059/knowledge-management" },
  { type: "divider", label: "footer" },
  { type: "link", label: "EDIT LINKS", href: "/projects/rp-20250059/information" },
];

const settingsHome: MockupScreen = {
  title: "PWA Settings",
  href: "/",
  blocks: [
    {
      type: "category-grid",
      groups: [
        {
          title: "Personal Settings",
          items: [
            { label: "My Queued Jobs", href: "/my-queued-jobs" },
            { label: "Manage Delegates", href: "/manage-delegates" },
            { label: "Act as a Delegate", href: "/manage-delegate" },
          ],
        },
        {
          title: "Enterprise Data",
          items: [
            { label: "Enterprise Custom Fields and Lookup Tables", href: "/custom-field" },
            { label: "Enterprise Calendars", href: "/enterprise-calendar" },
            { label: "Resource Center", href: "/project-resource-center" },
            { label: "Reporting", href: "/report" },
          ],
        },
        {
          title: "Queue and Database Administration",
          items: [
            { label: "Manage Queue Jobs", href: "/manage-queue-jobs" },
            { label: "Delete Enterprise Objects", href: "/delete-enterprise-object" },
            { label: "Force Check-in Enterprise Objects", href: "/force-check-in-enterprise-object" },
          ],
        },
        {
          title: "Look and Feel",
          items: [
            { label: "Manage Views", href: "/manage-view" },
            { label: "Grouping Formats", href: "/grouping-format" },
            { label: "Gantt Chart Formats", href: "/gantt-chart-format" },
            { label: "Quick Launch", href: "/quick-launch" },
          ],
        },
        {
          title: "Time and Task Management",
          items: [
            { label: "Fiscal Periods", href: "/fiscal-periods" },
            { label: "Time Reporting Periods", href: "/time-report-period" },
            { label: "Line Classifications", href: "/line-classifications" },
            { label: "Timesheet Settings and Defaults", href: "/timesheet-settings-and-defaults-1" },
            { label: "Administrative Time", href: "/administrative-time" },
            { label: "Task Settings and Display", href: "/task-setting-and-display" },
            { label: "Manage Timesheets", href: "/manage-timesheet" },
            { label: "Timesheet Managers", href: "/timesheet-manager" },
          ],
        },
        {
          title: "Operational Policies",
          items: [
            { label: "Additional Server Settings", href: "/additional-server-settings" },
            { label: "Active Directory Resource Pool Synchronization", href: "/user-sync" },
            { label: "Connected SharePoint Sites", href: "/connect-sharepoint-site" },
          ],
        },
        {
          title: "Workflow and Project Detail Pages",
          items: [
            { label: "Enterprise Project Types", href: "/enterprise-project-type" },
            { label: "Workflow Phases", href: "/workflow-phase" },
            { label: "Workflow Stages", href: "/workflow-stage" },
            { label: "Change or Restart Workflows", href: "/change-restart-skip-workflow" },
            { label: "Project Detail Pages", href: "/projects/rp-20250059/information" },
          ],
        },
        {
          title: "Security",
          items: [
            { label: "Manage Users", href: "/manager-user" },
            { label: "Manage Groups", href: "/manage-groups" },
            { label: "Manage Categories", href: "/manage-category" },
            { label: "Manage Security Templates", href: "/manage-template" },
            { label: "Manage User Sync Settings", href: "/user-sync" },
            { label: "Manage Delegates", href: "/manage-delegates" },
          ],
        },
      ],
    },
  ],
};

const manageViews: MockupScreen = {
  title: "Manage Views",
  href: "/manage-view",
  actions: [],
  blocks: [
    {
      type: "table",
      plain: true,
      toolbar: ["New View", "Copy View", "Delete View"],
      columns: ["Name", "Description"],
      rows: [
        ["Project", ""],
        ["Assignments Cost", "Displays cost information"],
        ["Assignments Detail", "Displays assignment slippage"],
        ["Assignments Earned Value", "Displays earned value information"],
        ["Assignments Summary", "Displays basic assignment information"],
        ["Assignments Tracking", "Displays schedule vs. baseline dates"],
        ["Assignments Work", "Displays work information"],
        ["Close Tasks to Update", "Displays tasks that can be closed to status updates"],
        ["CPIM Schedule View", "CPIM Project Schedule View"],
        ["Resources Cost", "Displays cost information"],
        ["Resources Earned Value", "Displays earned value information"],
        ["Resources Summary", "Displays basic resource information"],
        ["Resources Work", "Displays work information"],
        ["Select Tasks For Timeline", "Displays project tasks which can be selected for the timeline in Project Center"],
        ["Tasks Cost", "Displays cost information"],
        ["Tasks Detail", "Displays task slippage"],
      ],
    },
  ],
};

const addEditTemplate: MockupScreen = {
  title: "Add or Edit Template",
  href: "/add-edit-template",
  actions: ["Save", "Cancel"],
  blocks: [
    {
      type: "form",
      plain: true,
      heading: "Name",
      description: "Enter a name and description for this Template.",
      columns: 1,
      fields: [
        {
          label: "Template Name",
          value: "CPIM Group IT Security Administrator",
          required: true,
        },
        {
          label: "Description",
          value: "CPIM Group template of IT Security Administrator",
          control: "textarea",
        },
        {
          label: "Copy Template",
          value: "Select a template...",
          control: "select",
          options: ["Select a template...", "Project Managers", "Schedulers"],
        },
      ],
    },
    {
      type: "permissions",
      plain: true,
      heading: "Category Permissions",
      description: "Select the Category Permissions you want to allow or deny using this template.",
      columns: ["Allow", "Deny"],
      groups: [
        {
          title: "Project",
          rows: [
            { name: "Accept Project Task Update Requests", states: [false, false] },
            { name: "Build Team On Project", states: [false, false] },
            { name: "Create Deliverable and Legacy Item Links", states: [false, false] },
            { name: "Create New Task or Assignment", states: [false, false] },
            { name: "Delete Project", states: [true, false] },
            { name: "Edit Project Summary Fields", states: [true, false] },
            { name: "Manage Basic Project Security", states: [true, false] },
            { name: "Manage Resource Plan", states: [true, false] },
            { name: "Open Project", states: [true, false] },
            { name: "Publish Project", states: [true, false] },
          ],
        },
      ],
    },
  ],
};

const projectInformation: MockupScreen = {
  title: "Project Information (RP)",
  href: "/projects/rp-20250059/information",
  quickLaunchActive: "Project Management",
  projectContext: {
    title: "victor test internal",
    subtitle: "generate invoice 002",
    activeItem: "Project Information (RP)",
  },
  blocks: [
    {
      type: "form",
      plain: true,
      heading: "Untitled",
      columns: 2,
      fields: [
        { label: "Project Category", value: "RP", control: "readonly" },
        { label: "Company Code", value: "NIIL", required: true, control: "readonly" },
        { label: "Project Type", value: "RSP", control: "readonly" },
        { label: "Project No.", value: "RP20250059", control: "readonly" },
        { label: "Project District", value: "New Territories", required: true, control: "readonly" },
        {
          label: "Name",
          value: "victor test internal generate invoice 002",
          required: true,
          control: "readonly",
        },
        { label: "CEA No.", value: "CA25021A", control: "readonly" },
        { label: "Project Address Line1", value: "test 2", control: "readonly" },
        { label: "Project Address Line2", value: "", control: "readonly" },
        { label: "Project Address Line3", value: "", control: "readonly" },
        { label: "Project Address Line4", value: "", control: "readonly" },
        { label: "Final Address Line1", value: "", control: "readonly" },
        { label: "Final Address Line2", value: "", control: "readonly" },
        { label: "Final Address Line3", value: "", control: "readonly" },
        { label: "Final Address Line4", value: "", control: "readonly" },
        { label: "Project Chinese Address Line1", value: "", control: "readonly" },
        { label: "Project Chinese Address Line2", value: "", control: "readonly" },
      ],
    },
  ],
};

const taskReassignment: MockupScreen = {
  title: "Task Reassignment",
  href: "/project-task-reassign",
  actions: ["Submit", "Cancel"],
  blocks: [
    {
      type: "prompt-table",
      heading: "Select New Resources",
      description:
        "Select a resource for each task on the right. Submit pending changes prior to reassignment. Unsubmitted task changes will be lost when the task is reassigned.",
      columns: ["Task Name", "Current Resource", "Reassign To"],
      rows: [
        ["victor 20260212 001", "", ""],
        ["TG Work Commencement", "Li Man Kin", "Select Resource"],
      ],
      highlightFirstRow: true,
    },
    {
      type: "prompt-fields",
      heading: "Start Date",
      description:
        "Specify the date you would like the new assignment resources to begin working on the task.",
      fields: [{ label: "Start", value: "10/06/2015", type: "date" }],
    },
    {
      type: "prompt-textarea",
      heading: "Comments",
      description: "Do you have any comments regarding this reassignments?",
      label: "Comments",
      value: "",
    },
  ],
};

const projectCards: DashboardCardsBlock = {
  type: "dashboard-cards",
  cards: [
    { label: "Open Items", value: "14", note: "Attention required", tone: "warn" },
    { label: "Pending Approvals", value: "6", note: "Awaiting action", tone: "warn" },
    { label: "Completed Tasks", value: "128", note: "On track", tone: "good" },
    { label: "Overdue Deliverables", value: "3", note: "Review now", tone: "bad" },
  ],
  table: {
    type: "table",
    heading: "Recent Activity",
    columns: ["Item", "Owner", "Status", "Updated"],
    rows: [
      ["Project status report", "Victor Chan", "Pending", "24 Mar 2026"],
      ["Material request", "Operations Team", "Approved", "23 Mar 2026"],
      ["Site inspection", "QC Team", "Open", "22 Mar 2026"],
      ["Tender review", "Procurement", "In Progress", "22 Mar 2026"],
    ],
  },
};

function projectScreen(
  href: string,
  title: string,
  activeItem: string,
  blocks: MockupBlock[],
  quickLaunchActive: string,
  actions?: string[],
): MockupScreen {
  return {
    title,
    href,
    actions,
    quickLaunchActive,
    projectContext: {
      title: "victor test internal",
      subtitle: "generate invoice 002",
      activeItem,
    },
    blocks,
  };
}

const managedListRows = [
  ["System Administrators", "Global administration access", "Active"],
  ["Project Controllers", "Operational workflow management", "Active"],
  ["Schedulers", "Schedule maintenance and reporting", "Active"],
  ["Contractor Users", "Contractor collaboration access", "Active"],
  ["Inspection Users", "Inspection updates and closure", "Active"],
];

const screenOverrides: Record<string, MockupScreen> = {
  "/": settingsHome,
  "/manage-view": manageViews,
  "/add-edit-template": addEditTemplate,
  "/projects/rp-20250059/information": projectInformation,
  "/project-task-reassign": taskReassignment,
  "/projects/rp-20250059/project-status": projectScreen(
    "/projects/rp-20250059/project-status",
    "Project Status",
    "Project Status",
    [projectCards],
    "Project Management",
  ),
  "/projects/rp-20250059/schedule": projectScreen(
    "/projects/rp-20250059/schedule",
    "Schedule",
    "Schedule",
    [
      {
        type: "schedule",
        months: ["March 2026", "April 2026", "May 2026"],
        prompt: "Add tasks with dates to the timeline",
        columns: ["", "Task Name", "ID"],
        rows: [
          { taskName: "Events", id: "1", emphasis: true, indent: 1 },
          { taskName: "Project Event", id: "2", emphasis: true, indent: 2 },
          { taskName: "SPRJSIE - Project SIE", id: "3", emphasis: true, indent: 3 },
          { taskName: "TG Work Commencement", id: "4", progress: "red", indent: 3 },
          { taskName: "Scaffolding Dismantle", id: "5", progress: "red", indent: 3 },
          { taskName: "Water Work Inspect Application", id: "6", progress: "red", indent: 3 },
          { taskName: "Occupation Permit Application", id: "7", progress: "red", indent: 3 },
          { taskName: "UGO Commissioning", id: "8", progress: "red", indent: 3 },
          { taskName: "Riser Commissioning", id: "9", progress: "red", indent: 3 },
          { taskName: "Project Completion", id: "10", progress: "red", indent: 3 },
          { taskName: "Project Inspection", id: "11", emphasis: true, indent: 1 },
          { taskName: "Project Type", id: "12", emphasis: true, indent: 2 },
          { taskName: "RGI Inspection (RGI)", id: "13", emphasis: true, indent: 3 },
        ],
      },
    ],
    "Project Management",
  ),
  "/projects/rp-20250059/tasks": projectScreen(
    "/projects/rp-20250059/tasks",
    "Project Task",
    "Tasks",
    [
      {
        type: "table",
        plain: true,
        toolbar: ["New Task", "Reassign Task", "Delete Task"],
        columns: ["Task Name", "Task Owner", "Task Status", "Start", "Finish", "% Complete"],
        rows: [
          ["TG Work Commencement", "Victor Chan", "Completed", "12 Jun 2015", "12 Jun 2015", "100%"],
          ["Scaffolding Dismantle", "Site Team", "Open", "15 Jun 2015", "17 Jun 2015", "0%"],
          ["Water Work Inspect Application", "Engineering", "Open", "18 Jun 2015", "18 Jun 2015", "0%"],
          ["Occupation Permit Application", "Engineering", "Open", "22 Jun 2015", "22 Jun 2015", "0%"],
          ["UGO Commissioning", "Operations Team", "Open", "24 Jun 2015", "24 Jun 2015", "0%"],
          ["Project Completion", "Victor Chan", "Open", "29 Jun 2015", "29 Jun 2015", "0%"],
        ],
      },
    ],
    "Tasks",
  ),
  "/projects/rp-20250059/resources": projectScreen(
    "/projects/rp-20250059/resources",
    "Project Resource Center",
    "Resources",
    [
      {
        type: "form",
        plain: true,
        heading: "Resource Custom Fields",
        columns: 2,
        fields: [
          { label: "Product Status", value: "" },
          { label: "Product Sub-Type", value: "" },
          { label: "Product Type", value: "" },
          { label: "Resource Title", value: "", required: true },
          { label: "Section", value: "NA", required: true },
          { label: "Service Point Type", value: "" },
          { label: "Sources Type", value: "" },
          { label: "Track As Asset", value: "" },
          { label: "UserType", value: "" },
          { label: "Vendor", value: "" },
          { label: "Vendor Code", value: "" },
          {
            label: "Resource formula custom fields are only updated in Project Professional.",
            value:
              "Changes made in Project Web App or external systems will not cause formulas for resource custom fields to be recalculated.",
            control: "readonly",
            wide: true,
          },
        ],
      },
      {
        type: "form",
        plain: true,
        heading: "Group Fields",
        columns: 2,
        fields: [
          { label: "Group", value: "" },
          { label: "Code", value: "" },
          { label: "Cost Center", value: "" },
          { label: "Cost Type", value: "" },
          { label: "Team Assignment Pool", value: "", control: "readonly" },
          { label: "Team Name", value: "" },
          { label: "GUID", value: "989e3377-181d-f111-a8d1-00155da86801", control: "readonly" },
          { label: "External ID", value: "" },
          { label: "Date Created", value: "-", control: "readonly" },
          {
            label: "Checked out by",
            value: "fimebershipli.mk@towngas.com",
            control: "readonly",
          },
          { label: "Checkout date", value: "11/03/2026 15:04", control: "readonly" },
        ],
      },
    ],
    "Resources",
  ),
  "/projects/rp-20250059/project-management": projectScreen(
    "/projects/rp-20250059/project-management",
    "Project Management",
    "Project Management",
    [projectCards],
    "Project Management",
  ),
  "/projects/rp-20250059/approvals": projectScreen(
    "/projects/rp-20250059/approvals",
    "Approvals",
    "Approvals",
    [
      {
        type: "table",
        columns: ["Approval", "Requested By", "Stage", "Due Date", "Status"],
        rows: [
          ["Project budget adjustment", "Victor Chan", "Department Review", "27 Mar 2026", "Pending"],
          ["Material substitution", "Site Team", "Technical Review", "29 Mar 2026", "In Progress"],
          ["Inspection close-out", "QC Team", "Final Approval", "31 Mar 2026", "Pending"],
        ],
      },
    ],
    "Approvals",
  ),
  "/projects/rp-20250059/cpim-template": projectScreen(
    "/projects/rp-20250059/cpim-template",
    "CPIM Template",
    "CPIM Template",
    [
      {
        type: "table",
        toolbar: ["Create Template", "Copy Template"],
        columns: ["Template Name", "Description", "Updated By", "Updated"],
        rows: [
          ["RP Residential Multi-block", "Residential project setup", "PMO Team", "21 Mar 2026"],
          ["Inspection Standard", "Inspection starter template", "QC Team", "18 Mar 2026"],
          ["Tender Package Default", "Default tender package layout", "Procurement", "15 Mar 2026"],
        ],
      },
    ],
    "CPIM Template",
  ),
  "/projects/rp-20250059/cpim-reports": projectScreen(
    "/projects/rp-20250059/cpim-reports",
    "CPIM Reports",
    "CPIM Reports",
    [
      {
        type: "table",
        columns: ["Report Name", "Period", "Prepared By", "Status"],
        rows: [
          ["Progress Summary", "Mar 2026", "Victor Chan", "Generated"],
          ["Cost Tracking", "Mar 2026", "Finance Team", "Generated"],
          ["Task Completion", "Mar 2026", "PMO Team", "Generated"],
        ],
      },
    ],
    "CPIM Reports",
  ),
  "/projects/rp-20250059/role-access": projectScreen(
    "/projects/rp-20250059/role-access",
    "Role Access",
    "Role Access",
    [
      {
        type: "role-access-matrix",
        selectedRole: "Administrators",
        roles: ["Administrators", "Project Managers", "Schedulers", "Contractors"],
        groups: [
          {
            moduleName: "Project Information",
            rows: [
              {
                functionName: "Project Information",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
              {
                functionName: "AG/UGI",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
              {
                functionName: "Customer Contact",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
              {
                functionName: "Contractor Contact",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
            ],
          },
          {
            moduleName: "Flat Schedule",
            rows: [
              {
                functionName: "Flat Schedule",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
              {
                functionName: "Labeling",
                access: true,
                readOnly: false,
                readOnlyLevel: "",
                readWrite: true,
                readWriteLevel: "L4",
              },
            ],
          },
        ],
      },
    ],
    "Role Access",
  ),
  "/projects/rp-20250059/contractor-master": projectScreen(
    "/projects/rp-20250059/contractor-master",
    "Contractor Master",
    "Contractor Master",
    [
      {
        type: "table",
        columns: ["Contractor", "Contact", "Phone", "Category", "Status"],
        rows: [
          ["Alpha Engineering", "Ken Wong", "2868 1314", "Civil", "Active"],
          ["Delta Utility Works", "Ada Lee", "2577 4420", "Gas", "Active"],
          ["Harbour Inspection", "Cherry Lam", "2981 2201", "Inspection", "Active"],
        ],
      },
    ],
    "Contractor Master",
  ),
  "/projects/rp-20250059/customer-master": projectScreen(
    "/projects/rp-20250059/customer-master",
    "Customer Master",
    "Customer Master",
    [
      {
        type: "table",
        columns: ["Customer", "District", "Address", "Contact"],
        rows: [
          ["TownGas Residential", "New Territories", "test 2", "victor test internal"],
          ["Village Housing Group", "Kowloon", "18 Nathan Road", "Project Team"],
        ],
      },
    ],
    "Project Management",
  ),
  "/projects/rp-20250059/inspection-master": projectScreen(
    "/projects/rp-20250059/inspection-master",
    "Inspection Master",
    "Inspection Master",
    [
      {
        type: "table",
        columns: ["Inspection Form", "Stage", "Owner", "Status"],
        rows: [
          ["Gas Pipe Installation Check", "Construction", "QC Team", "Open"],
          ["Safety Verification", "Inspection", "QC Team", "Pending"],
          ["Final Handover Checklist", "Close-out", "Operations Team", "Draft"],
        ],
      },
    ],
    "Project Management",
  ),
  "/projects/rp-20250059/alert-dashboard": projectScreen(
    "/projects/rp-20250059/alert-dashboard",
    "Alert Dashboard",
    "Alert Dashboard",
    [projectCards],
    "Project Management",
  ),
  "/projects/rp-20250059/bom-maintenance": projectScreen(
    "/projects/rp-20250059/bom-maintenance",
    "BOM Maintenance",
    "BOM Maintenance",
    [
      {
        type: "table",
        toolbar: ["Add Item", "Import", "Remove"],
        columns: ["Item Code", "Description", "Unit", "Required", "Reserved"],
        rows: [
          ["PIPE-100", "Steel Gas Pipe", "m", "180", "120"],
          ["VALVE-32", "Isolation Valve", "ea", "12", "10"],
          ["FITTING-04", "Coupling Set", "ea", "36", "18"],
        ],
      },
    ],
    "BOM Maintenance",
  ),
  "/projects/rp-20250059/tenderer-group": projectScreen(
    "/projects/rp-20250059/tenderer-group",
    "Tenderer Group",
    "Tenderer Group",
    [
      {
        type: "table",
        columns: ["Group", "Tenderers", "Closing Date", "Status"],
        rows: [
          ["Pipeline Works", "4", "28 Mar 2026", "Open"],
          ["Inspection Support", "3", "30 Mar 2026", "Open"],
        ],
      },
    ],
    "Tenderer Group",
  ),
  "/projects/rp-20250059/generic-report": projectScreen(
    "/projects/rp-20250059/generic-report",
    "Generic Report",
    "Generic Report",
    [
      {
        type: "table",
        columns: ["Report", "Prepared By", "Output", "Last Run"],
        rows: [
          ["Project Information", "PMO Team", "PDF", "24 Mar 2026"],
          ["Task Summary", "PMO Team", "Excel", "24 Mar 2026"],
          ["Contractor Contact List", "Procurement", "PDF", "23 Mar 2026"],
        ],
      },
    ],
    "Generic Report",
  ),
  "/projects/rp-20250059/knowledge-management": projectScreen(
    "/projects/rp-20250059/knowledge-management",
    "Knowledge Management",
    "Knowledge Management",
    [
      {
        type: "table",
        columns: ["Document", "Category", "Owner", "Updated"],
        rows: [
          ["Installation Guideline", "Procedure", "Operations Team", "20 Mar 2026"],
          ["Inspection Photo Pack", "Reference", "QC Team", "18 Mar 2026"],
          ["Tender Clarification Log", "Tender", "Procurement", "17 Mar 2026"],
        ],
      },
    ],
    "Knowledge Management",
  ),
};

const capturedTitles = [
  "Additional Server Settings",
  "Administrative Time",
  "Alert Dashboard",
  "BOM Maintenance",
  "ChangeRestartSkip Workflow",
  "Connect SharePoint Site",
  "Contractor Master List",
  "Custom Field",
  "Custom Master List",
  "Delete Enterprise Object",
  "Enterprise Calendar",
  "Enterprise Project Type",
  "Fiscal Periods",
  "Force Check-in Enterprise Object",
  "Gantt Chart Format",
  "Grouping Format",
  "Inspector Master List",
  "Knowledge Management",
  "Line Classifications",
  "Manage Category",
  "Manage Delegate",
  "Manage Delegates",
  "Manage Groups",
  "Manage Queue Jobs",
  "Manage Template",
  "Manage Timesheet",
  "Manage View",
  "Manager User",
  "My Queued Job",
  "PWA Setting",
  "Project Center",
  "Project Information",
  "Project Management - Create project template page 1",
  "Project Management - Deliverables",
  "Project Management - Issue Management",
  "Project Management - Project Permissions",
  "Project Management - Risk",
  "Project Management - TaskBar",
  "Project Management - build team",
  "Project Management - create project",
  "Project Management - project status",
  "Project Management -Task Bar",
  "Project New Resource1",
  "Project New Resource2",
  "Project New Resource3",
  "Project New Resource4",
  "Project New Resource5",
  "Project New Task",
  "Project Resource Center",
  "Project Schedule",
  "Project Schedule1",
  "Project Task",
  "Project Task Reassign",
  "Quick Launch",
  "Report",
  "Role Access",
  "Role Access1",
  "Role Access2",
  "Role Access3",
  "Task Setting and Display",
  "Tenderer Group",
  "Time Report Period",
  "Timesheet Manager",
  "Timesheet Settings and Defaults1",
  "Timesheet Settings and Defaults2",
  "User Sync",
  "Workflow Phase",
  "Workflow Stage",
];

function titleToHref(title: string) {
  const overrideMap: Record<string, string> = {
    "PWA Setting": "/",
    "Manage View": "/manage-view",
    "Project Information": "/projects/rp-20250059/information",
    "Project Task Reassign": "/project-task-reassign",
    "Project Management - create project": "/projects/rp-20250059/project-management/create-project",
    "Project Management - Create project template page 1":
      "/projects/rp-20250059/project-management/create-project-template",
    "Project Management - build team": "/projects/rp-20250059/project-management/build-team",
    "Project Management - Deliverables": "/projects/rp-20250059/project-management/deliverables",
    "Project Management - Issue Management": "/projects/rp-20250059/project-management/issues",
    "Project Management - Project Permissions": "/projects/rp-20250059/project-management/project-permissions",
    "Project Management - Risk": "/projects/rp-20250059/project-management/risk",
    "Project Management - project status": "/projects/rp-20250059/project-management/project-status",
    "Project Management - TaskBar": "/projects/rp-20250059/project-management/task-bar",
    "Project Management -Task Bar": "/projects/rp-20250059/task-bar",
    "Project New Task": "/projects/rp-20250059/tasks/new",
    "Project New Resource1": "/projects/rp-20250059/resources/new-1",
    "Project New Resource2": "/projects/rp-20250059/resources/new-2",
    "Project New Resource3": "/projects/rp-20250059/resources/new-3",
    "Project New Resource4": "/projects/rp-20250059/resources/new-4",
    "Project New Resource5": "/projects/rp-20250059/resources/new-5",
    "Project Resource Center": "/projects/rp-20250059/resources",
    "Project Schedule": "/projects/rp-20250059/schedule",
    "Project Schedule1": "/projects/rp-20250059/schedule-1",
    "Project Task": "/projects/rp-20250059/tasks",
    "Role Access": "/projects/rp-20250059/role-access",
    "Role Access1": "/role-access/1",
    "Role Access2": "/role-access/2",
    "Role Access3": "/role-access/3",
    "Quick Launch": "/quick-launch",
    "Report": "/report",
    "Time Report Period": "/time-report-period",
    "Timesheet Manager": "/timesheet-manager",
    "Timesheet Settings and Defaults1": "/timesheet-settings-and-defaults-1",
    "Timesheet Settings and Defaults2": "/timesheet-settings-and-defaults-2",
    "Workflow Phase": "/workflow-phase",
    "Workflow Stage": "/workflow-stage",
  };

  if (overrideMap[title]) {
    return overrideMap[title];
  }

  return `/${slugify(title)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildGenericScreen(title: string, href: string): MockupScreen {
  if (href.startsWith("/projects/rp-20250059/")) {
    if (href.includes("/project-management/")) {
      return projectScreen(
        href,
        title.replace("Project Management - ", ""),
        "Project Management",
        [
          {
            type: href.includes("risk") || href.includes("deliverables") || href.includes("issues")
              ? "table"
              : "form",
            ...(href.includes("risk")
              ? {
                  toolbar: ["New Risk", "Edit", "Delete"],
                  columns: ["Risk", "Owner", "Impact", "Probability", "Status"],
                  rows: [
                    ["Permit delay", "Victor Chan", "High", "Medium", "Open"],
                    ["Material shortage", "Operations Team", "Medium", "High", "Open"],
                    ["Weather impact", "Site Team", "Medium", "Medium", "Monitoring"],
                  ],
                }
              : href.includes("issues")
                ? {
                    toolbar: ["New Issue", "Assign", "Close"],
                    columns: ["Issue", "Owner", "Priority", "Status", "Updated"],
                    rows: [
                      ["Site access coordination", "Operations Team", "High", "Open", "24 Mar 2026"],
                      ["Inspection slot confirmation", "QC Team", "Medium", "Pending", "23 Mar 2026"],
                    ],
                  }
                : href.includes("deliverables")
                  ? {
                      toolbar: ["New Deliverable", "Edit", "Delete"],
                      columns: ["Deliverable", "Owner", "Due Date", "Status"],
                      rows: [
                        ["Project Charter", "Victor Chan", "24 Mar 2026", "Submitted"],
                        ["Resource Deployment Plan", "Operations Team", "26 Mar 2026", "In Progress"],
                        ["Inspection Checklist", "QC Team", "31 Mar 2026", "Draft"],
                      ],
                    }
                  : href.includes("task-bar")
                    ? {
                        heading: "Task Bar",
                        description: "Task-oriented project management view.",
                        columns: 2,
                        fields: [
                          { label: "Project Name", value: "victor test internal generate invoice 002" },
                          { label: "Project No.", value: "RP20250059" },
                          { label: "Stage", value: "Execution" },
                          { label: "Owner", value: "Victor Chan" },
                          { label: "Current Status", value: "In Progress", control: "readonly" },
                          { label: "Remarks", value: "", control: "textarea", wide: true },
                        ],
                      }
                    : href.includes("build-team")
                      ? {
                          heading: "Build Team",
                          description: "Assign resources to the current project team.",
                          columns: 2,
                          fields: [
                            { label: "Search Resource", value: "" },
                            { label: "Role", value: "Engineer", control: "select", options: ["Engineer", "Supervisor", "QC"] },
                            { label: "Start Date", value: "24 Mar 2026" },
                            { label: "Finish Date", value: "29 Apr 2026" },
                            { label: "Booking Notes", value: "", control: "textarea", wide: true },
                          ],
                        }
                      : {
                          heading: title.replace("Project Management - ", ""),
                          columns: 2,
                          fields: [
                            { label: "Project Category", value: "RP" },
                            { label: "Company Code", value: "NIIL" },
                            { label: "Project No.", value: "RP20250059" },
                            { label: "Project District", value: "New Territories" },
                            { label: "Name", value: "victor test internal generate invoice 002", wide: true },
                            { label: "Remarks", value: "", control: "textarea", wide: true },
                          ],
                        }),
          } as MockupBlock,
        ],
        "Project Management",
        href.includes("create-project") || href.includes("template")
          ? ["Save", "Cancel"]
          : undefined,
      );
    }

    return projectScreen(
      href,
      title,
      "Project Management",
      [
        {
          type: "table",
          columns: ["Name", "Description", "Status", "Updated"],
          rows: [
            ["CPIM Item 01", "Project-linked data row", "Active", "24 Mar 2026"],
            ["CPIM Item 02", "Project-linked data row", "Open", "23 Mar 2026"],
            ["CPIM Item 03", "Project-linked data row", "Pending", "22 Mar 2026"],
          ],
        },
      ],
      "Project Management",
    );
  }

  if (title.includes("Role Access")) {
    return {
      title: "Role Access",
      href,
      blocks: [
        {
          type: "permissions",
          heading: "Category Permissions",
          columns: ["Allow", "Deny"],
          groups: [
            {
              title: "Project",
              rows: [
                { name: "Open Project", states: [true, false] },
                { name: "Save Project to Project Server", states: [true, false] },
                { name: "Manage Resource Plan", states: [true, false] },
                { name: "Delete Project", states: [false, false] },
              ],
            },
          ],
        },
      ],
    };
  }

  const lowerTitle = title.toLowerCase();
  const isForm =
    lowerTitle.includes("settings") ||
    lowerTitle.includes("setting") ||
    lowerTitle.includes("server") ||
    lowerTitle.includes("sync") ||
    lowerTitle.includes("connect") ||
    lowerTitle.includes("phase") ||
    lowerTitle.includes("stage") ||
    lowerTitle.includes("project type") ||
    lowerTitle.includes("manager user") ||
    lowerTitle.includes("delegate") ||
    lowerTitle.includes("template");

  if (isForm) {
    return {
      title: title === "PWA Setting" ? "PWA Settings" : title,
      href,
      actions: lowerTitle.includes("delegate") ? ["Save", "Cancel"] : undefined,
      blocks: [
        {
          type: "form",
          heading: title,
          columns: 2,
          fields: [
            { label: "Name", value: title },
            { label: "Status", value: "Active", control: "select", options: ["Active", "Inactive"] },
            { label: "Description", value: `${title} configuration`, control: "textarea", wide: true },
            { label: "Updated By", value: "System Administrator", control: "readonly" },
            { label: "Updated", value: "24 Mar 2026", control: "readonly" },
          ],
        },
      ],
    };
  }

  const filters: FilterField[] = [
    { label: "Search", value: "", placeholder: "Search" },
    { label: "Status", value: "All", type: "select", options: ["All", "Active", "Inactive"] },
  ];

  return {
    title,
    href,
    blocks: [
      {
        type: "table",
        filters,
        toolbar: ["New", "Edit", "Delete"],
        columns: ["Name", "Description", "Status"],
        rows:
          title.includes("Manage Groups") || title.includes("Manager User")
            ? managedListRows
            : [
                [title, `${title} configuration and setup`, "Active"],
                [`${title} Default`, "Default system entry", "Active"],
                [`${title} Archive`, "Historical entry", "Inactive"],
              ],
      },
    ],
  };
}

const generatedScreens = capturedTitles.reduce<Record<string, MockupScreen>>(
  (accumulator, title) => {
    const href = titleToHref(title);
    accumulator[href] = screenOverrides[href] ?? buildGenericScreen(title, href);
    return accumulator;
  },
  {},
);

const screens = {
  ...generatedScreens,
  ...screenOverrides,
};

export function getScreenByPath(path: string) {
  const normalized = normalizePath(path);
  return screens[normalized] ?? null;
}

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.endsWith("/") ? path.slice(0, -1) : path;
}
