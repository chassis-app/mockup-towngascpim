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

export type QuickLaunchMatrixBlock = {
  type: "quick-launch-matrix";
  rows: {
    name: string;
    customName?: string;
    customUrl?: string;
    display: boolean;
    indent?: 0 | 1 | 2;
    emphasis?: boolean;
  }[];
};

export type ProjectCenterBlock = {
  type: "project-center";
  months: string[];
  prompt: string;
  columns: string[];
  rows: string[][];
};

export type EmptyListBlock = {
  type: "empty-list";
  heading: string;
  toolbar?: string[];
  filters?: string[];
  columns: string[];
  message: string;
  note?: string;
};

export type MessageBlock = {
  type: "message";
  heading?: string;
  body: string;
};

export type ButtonRowBlock = {
  type: "button-row";
  buttons: string[];
};

export type WorkflowTransferBlock = {
  type: "workflow-transfer";
  fields: {
    label: string;
    value: string;
    type?: "text" | "select";
    options?: string[];
  }[];
  availableTitle: string;
  selectedTitle: string;
  availableItems: string[];
  selectedItems: string[];
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
  | RoleAccessMatrixBlock
  | QuickLaunchMatrixBlock
  | ProjectCenterBlock
  | EmptyListBlock
  | MessageBlock
  | ButtonRowBlock
  | WorkflowTransferBlock;

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
  "/my-queued-jobs": {
    title: "My Queued Jobs",
    href: "/my-queued-jobs",
    blocks: [
      {
        type: "table",
        plain: true,
        columns: [
          "Entry Time",
          "Completed Time",
          "Project Name",
          "Job Type",
          "Job State",
          "% Complete",
          "Position",
          "Error",
        ],
        rows: [],
      },
    ],
  },
  "/manage-delegates": {
    title: "Manage Delegates",
    href: "/manage-delegates",
    blocks: [
      {
        type: "table",
        filters: [
          { label: "Acting For", value: "", placeholder: "User name" },
          { label: "Delegate Name", value: "", placeholder: "Delegate name" },
          {
            label: "Status",
            value: "Active",
            type: "select",
            options: ["Active", "Inactive", "All"],
          },
        ],
        toolbar: ["New Delegate", "Delete"],
        columns: ["Delegate Name", "Acting For", "Start Date", "Finish Date", "Status"],
        rows: [
          [
            "andy.lam@ajpcorp.com",
            "victorcheng@ajpcorp.com",
            "24 Mar 2026",
            "31 Mar 2026",
            "Active",
          ],
          [
            "project.support@ajpcorp.com",
            "susan.chan@ajpcorp.com",
            "18 Mar 2026",
            "28 Mar 2026",
            "Active",
          ],
          [
            "inspection.team@ajpcorp.com",
            "kenny.wong@ajpcorp.com",
            "01 Mar 2026",
            "15 Mar 2026",
            "Inactive",
          ],
        ],
      },
    ],
  },
  "/manage-timesheet": {
    title: "Manage Timesheets",
    href: "/manage-timesheet",
    blocks: [
      {
        type: "message",
        body: "We can't display the selected time period. It might be closed or your administrator hasn't created it yet. Please try a different date.",
      },
    ],
  },
  "/manage-delegate": {
    title: "Act as a Delegate",
    href: "/manage-delegate",
    blocks: [
      {
        type: "empty-list",
        heading: "Act as a Delegate",
        columns: ["Acting For", "Start Date"],
        message: "You are not currently acting as anyone's delegate",
      },
    ],
  },
  "/manage-queue-jobs": {
    title: "Manage Queue Jobs",
    href: "/manage-queue-jobs",
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "Filter Type",
        columns: 3,
        fields: [
          {
            label: "Queue Filter",
            value: "By Status",
            control: "select",
            options: ["By Status", "My Jobs", "By Project", "By Failed Jobs"],
          },
          {
            label: "State",
            value: "Blocked",
            control: "select",
            options: ["All", "Processing", "Success", "Blocked"],
          },
          { label: "Job History", value: "Job Completion Time" },
        ],
      },
      {
        type: "table",
        heading: "Jobs Grid",
        description:
          "This grid lists all the queue jobs that meet the criteria specified above. A subset of jobs can be selected and cancelled or retried.",
        toolbar: ["Retry Job", "Cancel Job"],
        columns: ["", "Date", "Type", "State", "Description", "% Complete", "User"],
        rows: [
          ["O", "05/01/2026 13:21:39", "Project Publish", "Blocked", "Due To A Failed Job", "0%", "victorcheng"],
          ["O", "03/01/2026 11:08:10", "Workflow", "Blocked", "Due To A Failed Job", "0%", "victorcheng"],
          ["O", "27/06/2025 14:33:07", "Project Check-in", "Blocked", "Due To A Failed Job", "0%", "victorcheng"],
          ["O", "26/06/2025 16:41:20", "Status Workflow", "Blocked", "Due To A Failed Job", "0%", "victorcheng"],
          ["O", "24/06/2025 13:45:50", "Project Publish", "Success", "Completed", "100%", "victorcheng"],
        ],
      },
    ],
  },
  "/manage-category": {
    title: "Manage Categories",
    href: "/manage-category",
    blocks: [
      {
        type: "table",
        toolbar: ["New Category", "Edit", "Delete"],
        columns: ["Category Name", "Type", "Description"],
        rows: [
          ["Workspaces", "Project Server default", "My Direct Report category"],
          ["Projects", "Project Server default", "My Projects category"],
          ["Resources", "Project Server default", "My Resources category"],
          ["Tasks", "Project Server default", "My Tasks category"],
        ],
      },
    ],
  },
  "/custom-field": {
    title: "Enterprise Custom Fields and Lookup Tables",
    href: "/custom-field",
    blocks: [
      {
        type: "table",
        heading: "Enterprise Custom Fields",
        toolbar: ["New Field", "Edit", "Delete"],
        columns: ["Name", "Entity", "Type", "Formula", "Required", "Workflow Controlled", "Lookup Table"],
        rows: [
          ["companycode", "Task", "Lookup", "companySharepointTasks", "No", "No", "companycodeList"],
          ["contractor", "Project", "Lookup", "", "No", "No", "contractorMaster"],
          ["commissioneddate", "Task", "Date", "", "No", "No", ""],
          ["leave", "Resource", "Text", "", "No", "No", ""],
          ["bookprogress", "Task", "Member", "", "No", "No", ""],
        ],
      },
    ],
  },
  "/time-report-period": {
    title: "Time Reporting Periods",
    href: "/time-report-period",
    actions: ["Create Periods"],
    blocks: [
      {
        type: "message",
        heading: "Define Bulk Period Parameters",
        body: "You can simultaneously create multiple periods by using the bulk period creation option. Before you use the option, specify the parameters in this section and the naming convention in Section 2.",
      },
      {
        type: "prompt-fields",
        heading: "Bulk Creation",
        description: "Set the start date, number of periods, and the standard period length.",
        fields: [
          { label: "Number of periods to be created", value: "12" },
          { label: "Date the first period starts", value: "11/03/2026", type: "date" },
          { label: "Length of the standard period (days)", value: "7" },
        ],
      },
      {
        type: "message",
        heading: "Define Batch Naming Convention",
        body: "When you create multiple time reporting periods, it is recommended to use a unique name format composed of prefix, sequence number, and suffix.",
      },
      {
        type: "prompt-fields",
        heading: "Naming Convention",
        description: "Configure the period label format before creating the batch.",
        fields: [
          { label: "Prefix", value: "TP-" },
          { label: "Sequence Number", value: "001" },
          { label: "Suffix", value: "" },
          { label: "Sample", value: "TP-001" },
        ],
      },
      {
        type: "table",
        columns: ["Period Label", "Start Date", "End Date", "Status"],
        rows: [
          ["TP-001", "11/03/2026", "17/03/2026", "Open"],
          ["TP-002", "18/03/2026", "24/03/2026", "Open"],
          ["TP-003", "25/03/2026", "31/03/2026", "Planned"],
        ],
      },
    ],
  },
  "/fiscal-periods": {
    title: "Fiscal Periods",
    href: "/fiscal-periods",
    blocks: [
      {
        type: "message",
        heading: "Manage Fiscal Period",
        body:
          "Adjust fiscal months. The fiscal year shown in the previous section has not been defined.",
      },
      {
        type: "prompt-fields",
        heading: "Calendar Setup",
        description: "Define the fiscal year and month structure used across reporting.",
        fields: [
          { label: "Fiscal Year", value: "2026" },
          { label: "Start Month", value: "January" },
          { label: "Months in Year", value: "12" },
          { label: "Status", value: "Not Defined" },
        ],
      },
    ],
  },
  "/delete-enterprise-object": {
    title: "Delete Enterprise Objects",
    href: "/delete-enterprise-object",
    actions: ["Delete Selected"],
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "What do you want to delete from Project Web App?",
        columns: 2,
        fields: [
          {
            label: "Delete From",
            value: "Projects",
            control: "select",
            options: ["Projects", "Resources and Users", "Status Report Responses", "Timesheets", "User Delegates"],
          },
          {
            label: "Delete Scope",
            value: "Delete draft and published projects",
            control: "select",
            options: [
              "Delete draft and published projects",
              "Delete only published projects",
              "Delete archived projects",
            ],
          },
          {
            label: "Connected SharePoint Sites",
            value: "Delete the connected SharePoint sites",
            control: "readonly",
            wide: true,
          },
        ],
      },
      {
        type: "table",
        columns: ["", "Project Name", "Owner", "State", "Type", "Modified", "Site"],
        rows: [
          ["O", "11-15 Matheson St, Causeway Bay Proposed Commercial Bldg", "CMCreator", "Published", "Project", "20/02/2024 18:26:02", "No"],
          ["O", "115 Boundary Street", "RPCreator", "Published", "Project", "20/02/2024 18:32:06", "Yes"],
          ["O", "1-15 Ki Lung Street", "RPCreator", "Published", "Project", "20/02/2024 18:37:40", "No"],
          ["O", "12 Moonbeam Road", "RPCreator", "Published", "Project", "20/02/2024 18:44:26", "No"],
        ],
      },
    ],
  },
  "/grouping-format": {
    title: "Grouping Formats",
    href: "/grouping-format",
    blocks: [
      {
        type: "table",
        heading: "Grouping format",
        description:
          "You can select a grouping format for the Tasks section and up to 10 grouping formats for views.",
        columns: ["Group", "Level", "Background", "Text", "Style"],
        rows: [
          ["Timesheet", "Level 1", "Light yellow", "Black", "Bold"],
          ["Timesheet", "Level 2", "Sky blue", "Black", "Bold"],
          ["Views", "Level 1", "Light yellow", "Black", "Bold"],
          ["Views", "Level 2", "Sky blue", "Black", "Bold"],
          ["Grouping 1", "Level 3", "Light green", "Black", "Bold"],
          ["Grouping 1", "Level 4", "Lavender", "Black", "Bold"],
        ],
      },
    ],
  },
  "/gantt-chart-format": {
    title: "Gantt Chart Formats",
    href: "/gantt-chart-format",
    blocks: [
      {
        type: "table",
        heading: "Personal Gantt (Tasks)",
        description:
          "Project Web App can display a Personal Gantt Chart on the Tasks page and can display multiple Gantt Chart views in the Views section.",
        columns: ["Element", "Bar Shape", "Color", "Middle", "Start", "Finish"],
        rows: [
          ["Task", "Bar", "Orange", "", "Black", "Black"],
          ["Milestone", "Diamond", "Black", "", "Black", "Black"],
          ["Task Progress", "Bar", "Dark Blue", "", "Black", "Black"],
          ["Summary", "Bracket", "Black", "", "", ""],
          ["Group By Summary", "Bracket", "Black", "", "Black", ""],
          ["Manual Task", "Bar", "Aqua", "", "Aqua", ""],
          ["Manual Milestone", "Diamond", "Aqua", "", "Aqua", ""],
          ["Manual Progress", "Bar", "Aqua", "", "", ""],
        ],
      },
    ],
  },
  "/connect-sharepoint-site": {
    title: "Connected SharePoint Sites",
    href: "/connect-sharepoint-site",
    blocks: [
      {
        type: "table",
        toolbar: [
          "Create Site",
          "Edit Site Address",
          "Synchronize",
          "Delete Site",
          "Go to Project Site Settings",
        ],
        columns: ["", "Site Address", "Project / Site Name"],
        rows: [
          [
            "Edit",
            "https://towngas.sharepoint.com/sites/CPIMUAT2-sc-mig/1-and-3-south-bay-close",
            "1 and 3 South Bay Close Hong Kong",
          ],
          [
            "Edit",
            "https://towngas.sharepoint.com/sites/CPIMUAT2-sc-mig/10-10a-wang-fung-terrace",
            "10, 10A Wang Fung Terrace",
          ],
          [
            "Edit",
            "https://towngas.sharepoint.com/sites/CPIMUAT2-sc-mig/11-15-matheson-st",
            "11-15 Matheson St, Causeway Bay",
          ],
          [
            "Edit",
            "https://towngas.sharepoint.com/sites/CPIMUAT2-sc-mig/121-boundary-street",
            "121 Boundary Street",
          ],
        ],
      },
    ],
  },
  "/enterprise-project-type": {
    title: "Enterprise Project Types",
    href: "/enterprise-project-type",
    blocks: [
      {
        type: "table",
        toolbar: ["New Type", "Edit", "Delete"],
        columns: ["Type", "Department", "Workflow", "Project Detail Pages", "Default", "Requires Site"],
        rows: [
          ["CAU Sales", "Sales", "No Workflow", "No Candidate Create", "Yes", "No"],
          ["Capex Project", "Operations", "No Workflow", "No Project Submission", "No", "Yes"],
          ["Residential", "Residential", "No Workflow", "No Project Submission", "No", "Yes"],
          ["Residential Sales - Multi-t", "Residential", "No Workflow", "Residential Create", "No", "Yes"],
        ],
      },
    ],
  },
  "/manage-template": {
    title: "Manage Templates",
    href: "/manage-template",
    blocks: [
      {
        type: "table",
        filters: [
          { label: "Template Name", value: "", placeholder: "Template name" },
          {
            label: "Status",
            value: "Active",
            type: "select",
            options: ["Active", "Inactive", "All"],
          },
          {
            label: "Scope",
            value: "All",
            type: "select",
            options: ["All", "Project", "Enterprise", "Security"],
          },
        ],
        toolbar: ["New Template", "Edit", "Copy", "Delete"],
        columns: ["Template Name", "Description", "Owner", "Modified", "Status"],
        rows: [
          [
            "CPIM Group template of IT Security Administrator",
            "Enterprise security template for CPIM administrators",
            "System Administrator",
            "24 Mar 2026",
            "Active",
          ],
          [
            "Project Controls Template",
            "Default access model for project control roles",
            "PMO Team",
            "18 Mar 2026",
            "Active",
          ],
          [
            "Inspection Read Only",
            "Read-only inspection access for field teams",
            "Quality Team",
            "10 Mar 2026",
            "Active",
          ],
          [
            "Contract Administration",
            "Security template for contractor coordination",
            "Operations Team",
            "02 Mar 2026",
            "Inactive",
          ],
        ],
      },
    ],
  },
  "/inspector-master-list": {
    title: "Inspection Master",
    href: "/inspector-master-list",
    blocks: [
      {
        type: "table",
        filters: [
          { label: "Inspection Name", value: "", placeholder: "Inspection name" },
          {
            label: "Stage",
            value: "All",
            type: "select",
            options: ["All", "Planning", "Execution", "Close-out"],
          },
          {
            label: "Status",
            value: "Active",
            type: "select",
            options: ["Active", "Inactive", "All"],
          },
        ],
        toolbar: ["New Inspection", "Edit", "Delete"],
        columns: ["Inspection Name", "Stage", "Template", "Owner", "Status"],
        rows: [
          [
            "Gas Pipe Installation Check",
            "Execution",
            "Inspection Standard",
            "QC Team",
            "Active",
          ],
          [
            "Pressure Test Witness",
            "Execution",
            "Site Verification",
            "Inspection Team",
            "Active",
          ],
          [
            "Final Handover Checklist",
            "Close-out",
            "Close-out Review",
            "Operations Team",
            "Active",
          ],
          [
            "Safety Barrier Confirmation",
            "Planning",
            "Pre-start Review",
            "Site Team",
            "Inactive",
          ],
        ],
      },
    ],
  },
  "/workflow-phase": {
    title: "Workflow Phases",
    href: "/workflow-phase",
    blocks: [
      {
        type: "table",
        toolbar: ["New Phase", "Edit", "Delete"],
        columns: ["Phase Name", "Sequence", "Description", "Status"],
        rows: [
          ["Initiation", "10", "Project request and validation", "Active"],
          ["Planning", "20", "Planning and approval activities", "Active"],
          ["Execution", "30", "Delivery and inspection coordination", "Active"],
          ["Close-out", "40", "Close project and archive records", "Active"],
        ],
      },
    ],
  },
  "/workflow-stage": {
    title: "Workflow Stages",
    href: "/workflow-stage",
    blocks: [
      {
        type: "table",
        filters: [
          {
            label: "Phase",
            value: "All",
            type: "select",
            options: ["All", "Initiation", "Planning", "Execution", "Close-out"],
          },
        ],
        toolbar: ["New Stage", "Edit", "Delete"],
        columns: ["Stage Name", "Phase", "Sequence", "Owner", "Status"],
        rows: [
          ["Initial Review", "Initiation", "10", "PMO Team", "Active"],
          ["Budget Approval", "Planning", "20", "Finance Team", "Active"],
          ["Construction Approval", "Execution", "30", "Project Manager", "Active"],
          ["Final Acceptance", "Close-out", "40", "Operations Team", "Active"],
        ],
      },
    ],
  },
  "/change-restart-skip-workflow": {
    title: "Change or Restart Workflows",
    href: "/change-restart-skip-workflow",
    actions: ["Save", "Cancel"],
    blocks: [
      {
        type: "workflow-transfer",
        fields: [
          {
            label: "Enterprise Project Type",
            value: "Gas Main Installation",
            type: "select",
            options: ["Gas Main Installation", "Residential Service", "Inspection Program"],
          },
          {
            label: "Current Workflow",
            value: "Project Delivery Workflow",
            type: "select",
            options: ["Project Delivery Workflow", "Inspection Workflow", "Maintenance Workflow"],
          },
          {
            label: "Action",
            value: "Restart Workflow",
            type: "select",
            options: ["Restart Workflow", "Change Workflow", "Skip To Workflow"],
          },
          {
            label: "Target Workflow",
            value: "Construction Approval",
            type: "select",
            options: ["Construction Approval", "Final Acceptance", "Close-out Review"],
          },
        ],
        availableTitle: "Available Workflow Stages",
        selectedTitle: "Selected Workflow Stages",
        availableItems: [
          "Initial Review",
          "Budget Approval",
          "Resource Commitment",
          "Construction Approval",
          "Site Handover",
        ],
        selectedItems: ["Construction Approval", "Site Handover"],
      },
    ],
  },
  "/timesheet-manager": {
    title: "Specify Timesheet Managers",
    href: "/timesheet-manager",
    actions: ["Save", "Cancel"],
    blocks: [
      {
        type: "message",
        body: "If fixed approval routing is not enabled, users can select from these timesheet managers when they submit their timesheets for approval. Only people who appear on this list and have the approve timesheet permission can give final approval.",
      },
      {
        type: "table",
        toolbar: ["Add Manager", "Remove"],
        columns: ["Manager Name", "Email", "Department"],
        rows: [
          ["Victor Cheng", "victorcheng@ajpcorp.com", "Project Management"],
          ["Susan Chan", "susan.chan@ajpcorp.com", "Finance"],
          ["Andy Lam", "andy.lam@ajpcorp.com", "Operations"],
        ],
      },
    ],
  },
  "/timesheet-settings-and-defaults-1": {
    title: "Timesheet Settings and Defaults",
    href: "/timesheet-settings-and-defaults-1",
    actions: ["Save", "Cancel"],
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "Project Web App Display",
        columns: 2,
        fields: [
          {
            label: "Timesheet will use",
            value: "Standard Overtime and Non-Billable time tracking",
            control: "readonly",
            wide: true,
          },
          {
            label: "Default Timesheet Creation Mode",
            value: "Current task assignments",
            control: "select",
            options: ["Current task assignments", "Current projects", "No prepopulation"],
          },
          {
            label: "Timesheet Grid Column Units",
            value: "Weeks",
            control: "select",
            options: ["Weeks", "Days"],
          },
          {
            label: "Default Reporting Units",
            value: "Hours",
            control: "select",
            options: ["Hours", "Days"],
          },
          { label: "Hours in a standard timesheet day", value: "8" },
          { label: "Hours in a standard timesheet work week", value: "40" },
        ],
      },
    ],
  },
  "/timesheet-settings-and-defaults-2": {
    title: "Timesheet Settings and Defaults",
    href: "/timesheet-settings-and-defaults-2",
    actions: ["Save", "Cancel"],
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "Hourly Reporting Limits",
        columns: 2,
        fields: [
          { label: "Maximum Hours per Timesheet", value: "60" },
          { label: "Minimum Hours per Timesheet", value: "0" },
          { label: "Maximum Hours per Day", value: "24" },
          {
            label: "Allow future time reporting",
            value: "Enabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
          {
            label: "Allow top-level time reporting",
            value: "Enabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
          {
            label: "Manager Approval",
            value: "Disabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
          {
            label: "Require line approval before timesheet approval",
            value: "Disabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
          {
            label: "Fixed approval routing",
            value: "Disabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
        ],
      },
    ],
  },
  "/user-sync": {
    title: "Active Directory Enterprise Resource Pool Synchronization",
    href: "/user-sync",
    actions: ["Save", "Synchronize Now"],
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "Synchronization",
        columns: 2,
        fields: [
          { label: "Active Directory Group", value: "" },
          { label: "Synchronization Status", value: "The synchronization failed because the Active Directory group was empty or not found.", control: "readonly", wide: true },
          {
            label: "Automatically reactivate inactive users found in Active Directory",
            value: "Enabled",
            control: "select",
            options: ["Enabled", "Disabled"],
            wide: true,
          },
        ],
      },
    ],
  },
  "/task-setting-and-display": {
    title: "Task Settings and Display",
    href: "/task-setting-and-display",
    blocks: [
      {
        type: "table",
        columns: ["Section", "Page", "Open", "Edit", "Delete"],
        rows: [
          ["Cost Estimate", "AG Cost Estimate List", "Yes", "Yes", "Yes"],
          ["Cost Estimate", "UG Cost Estimate List", "Yes", "Yes", "Yes"],
          ["Tender", "Tender Profile", "Yes", "Yes", "Yes"],
          ["Tender", "Tender Detail", "Yes", "Yes", "Yes"],
          ["Quotation", "Quotation Profile", "Yes", "Yes", "Yes"],
          ["Quotation", "Quotation Detail", "Yes", "Yes", "Yes"],
          ["CEA", "CEA Profile", "Yes", "Yes", "Yes"],
          ["CEA", "CEA Detail", "Yes", "Yes", "Yes"],
        ],
      },
    ],
  },
  "/manage-view": manageViews,
  "/add-edit-template": addEditTemplate,
  "/project-center": {
    title: "Project Center",
    href: "/project-center",
    quickLaunchActive: "Project Management",
    blocks: [
      {
        type: "project-center",
        months: ["2 March", "12 March", "22 March", "1 April", "11 April", "21 April"],
        prompt: "Add tasks with dates to the timeline",
        columns: [
          "",
          "Project Number",
          "Project Name",
          "Project Status",
          "Primary Contractor",
          "INS",
          "No. of b",
          "No. of flat",
        ],
        rows: [
          ["+", "RP20260004", "victor 20260212 001", "Planning", "", "", "", ""],
          ["+", "RP20260003", "Residential Development at Tung Chung Town Lot no 50(KC)) tes", "Planning", "", "", "", ""],
          ["+", "RP20260002", "victor 20260109 002 invoice test", "Planning", "", "", "", ""],
          ["+", "RP20260001", "victor 20260109 001 invoice test", "Completed", "", "", "0", ""],
          ["+", "RP20250063", "victor 20251229 001", "Planning", "", "", "0", ""],
          ["+", "RP20250062", "T_CEA_2025- Residential Sales", "Planning", "", "", "0", ""],
          ["+", "RP20250061", "victor test internal generate invoice 003", "Planning", "", "", "0", ""],
          ["+", "RP20250060", "victor test internal generate invoice 004", "Planning", "", "", "0", ""],
          ["+", "RP20250059", "victor test internal generate invoice 002", "Planning", "", "", "0", ""],
          ["+", "RP20250058", "victor test internal generate invoice 001", "Planning", "", "", "0", ""],
        ],
      },
    ],
  },
  "/quick-launch": {
    title: "Quick Launch",
    href: "/quick-launch",
    blocks: [
      {
        type: "quick-launch-matrix",
        rows: [
          { name: "Projects", customName: "Project Management", display: true },
          { name: "Approvals", display: true },
          { name: "Tasks", display: true },
          { name: "Timesheet", display: false },
          { name: "Issues and Risks", display: false },
          { name: "Resources", display: true },
          { name: "Status Reports", display: false },
          {
            name: "CPIM Report",
            customName: "CPIM Report",
            customUrl: "/sites/CPIMUAT/ReportData/Reports",
            display: false,
          },
          { name: "Strategy", display: false, emphasis: true },
          { name: "Driver Library", display: false, indent: 1 },
          { name: "Driver Prioritization", display: false, indent: 1 },
          { name: "Portfolio Analyses", display: false, indent: 1 },
          { name: "Reports", display: false },
          { name: "Server Settings", display: false },
          {
            name: "CPIM Template",
            customName: "CPIM Template",
            customUrl: "/sites/CPIMUAT/CPIM%20Template/Forms/AllItems.aspx",
            display: true,
          },
          {
            name: "CPIM Reports",
            customName: "CPIM Reports",
            customUrl: "https://cpimuatrs1az/Reports/",
            display: true,
          },
          {
            name: "Role Access",
            customName: "Role Access",
            customUrl: "/sites/CPIMUAT/SitePages/RoleAccess.aspx",
            display: true,
          },
          {
            name: "Contractor Master",
            customName: "Contractor Master",
            customUrl: "/sites/CPIMUAT/SitePages/ContractorMasterList.aspx",
            display: true,
          },
          {
            name: "Customer Master",
            customName: "Customer Master",
            customUrl: "/sites/CPIMUAT/SitePages/CustomerMasterList.aspx",
            display: true,
          },
          {
            name: "Inspection Master",
            customName: "Inspection Master",
            customUrl: "/sites/CPIMUAT/SitePages/InspectionMasterList.aspx",
            display: true,
          },
        ],
      },
    ],
  },
  "/projects/rp-20250059/information": projectInformation,
  "/project-task-reassign": taskReassignment,
  "/projects/rp-20250059/project-status": projectScreen(
    "/projects/rp-20250059/project-status",
    "Project Status",
    "Project Status",
    [
      {
        type: "form",
        plain: true,
        heading: "Project Status",
        columns: 2,
        fields: [
          { label: "Project Number", value: "RP20260004", required: true, control: "readonly" },
          { label: "Project Category", value: "RP", control: "readonly" },
          {
            label: "Project Status",
            value: "Planning",
            control: "select",
            options: ["Planning", "In Progress", "Completed"],
          },
          { label: "Updated By", value: "victorcheng@ajpcorp.com", control: "readonly" },
        ],
      },
      {
        type: "button-row",
        buttons: ["Save"],
      },
    ],
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
        toolbar: ["New Item", "Edit", "Delete"],
        columns: [
          "Customer Code",
          "Debtor ID",
          "Name (English)",
          "Name (Chinese)",
          "Address",
          "Abbreviation",
          "Type",
          "Parent Company",
        ],
        rows: [
          [
            "0000800618",
            "DES",
            "A&T DESIGN LTD",
            "A&T DESIGN",
            "15/F Yien Yieh Building 32-36 Des Voeux Road West",
            "A&T DESIGN",
            "Architect",
            "",
          ],
          [
            "0000801599",
            "A LEAD ARC",
            "A LEAD ARCHITECTS",
            "A LEAD ARCH",
            "19/F, Wanchai Lockhart Road, Wan Chai, Hong Kong",
            "A LEAD",
            "Architect",
            "",
          ],
          [
            "0000800265",
            "AARONSBURG",
            "AARONSBURG ANGELFIELD",
            "AARONSBURG",
            "6/F World Wide House 19 Des Voeux Road Central",
            "AARONSBURG",
            "Private developer",
            "Henderson Real Estate Agency Ltd",
          ],
          [
            "0000801114",
            "ABB HONG",
            "ABB TIPO INDUSTRIAL",
            "ABB",
            "Kom Estate No.3 Dai Hei Street, Tai Po, NT",
            "ABB",
            "Construction",
            "",
          ],
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
        filters: [
          { label: "BOM Parent", value: "" },
          { label: "Material", value: "", placeholder: "Material description" },
        ],
        toolbar: ["Add Item", "Import", "Remove"],
        columns: ["Material Code", "Material Description", "Unit", "Required Qty", "Reserved Qty"],
        rows: [
          ["PIPE-100", "Steel Gas Pipe", "m", "180", "120"],
          ["VALVE-032", "Isolation Valve", "ea", "12", "10"],
          ["FITTING-004", "Coupling Set", "ea", "36", "18"],
          ["METER-025", "Gas Meter Assembly", "ea", "8", "6"],
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
        columns: ["Tenderer Group Code", "Tenderer Group Description", "Action"],
        rows: [
          ["CM01", "Tenderer list - Ind project", "Edit"],
          ["CM02", "Tenderer list - Com project", "Edit"],
          ["CM03", "Tenderer list - Steam & Chimney", "Edit"],
          ["CM04", "Tenderer list - Compact Unit", "Edit"],
          ["CM05", "Tenderer list - CCMS", "Edit"],
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
  "/projects/rp-20250059/project-management/create-project": {
    title: "Create a new project",
    href: "/projects/rp-20250059/project-management/create-project",
    quickLaunchActive: "Project Management",
    actions: ["Save", "Cancel"],
    blocks: [
      {
        type: "tabs",
        tabs: [{ label: "1" }, { label: "2" }],
      },
      {
        type: "form",
        plain: true,
        heading: "Basic Info",
        columns: 2,
        fields: [
          { label: "Name", value: "", required: true },
          { label: "Company Code", value: "", required: true },
          { label: "Project Type RSP", value: "" },
          { label: "Project District", value: "", required: true },
          { label: "Project Address Line1", value: "", required: true },
          { label: "Project Address Line2", value: "" },
          { label: "Project Address Line3", value: "" },
          { label: "Project Address Line4", value: "" },
          { label: "Received Date", value: "25/03/2026" },
          {
            label: "Require Billing Job",
            value: "Yes",
            control: "select",
            options: ["Yes", "No"],
          },
        ],
      },
    ],
  },
  "/projects/rp-20250059/project-management/project-permissions": {
    title: "Project Permissions: victor 20260212 001",
    href: "/projects/rp-20250059/project-management/project-permissions",
    quickLaunchActive: "Project Management",
    blocks: [
      {
        type: "empty-list",
        heading: "Project Permissions: victor 20260212 001",
        toolbar: ["New", "Edit", "Remove", "Close"],
        columns: ["Name", "Permission"],
        message: "No user or group permissions have been defined for this project.",
      },
    ],
  },
  "/projects/rp-20250059/project-management/issues": {
    title: "Issues Management",
    href: "/projects/rp-20250059/project-management/issues",
    quickLaunchActive: "Project Management",
    blocks: [
      {
        type: "empty-list",
        heading: "Issues Management",
        toolbar: ["Add new item", "Edit in grid view", "Undo", "Share", "Copy link", "Export"],
        filters: ["All Active Issues", "All Closed Issues", "All Issues Assigned to Me", "All Items"],
        columns: ["Attachments", "ID", "Title", "Assigned To", "Status", "Priority", "Category", "Due Date"],
        message: "Welcome to your new list",
        note: "Select the New button to get started.",
      },
    ],
  },
  "/projects/rp-20250059/project-management/deliverables": {
    title: "Deliverables",
    href: "/projects/rp-20250059/project-management/deliverables",
    quickLaunchActive: "Project Management",
    blocks: [
      {
        type: "empty-list",
        heading: "Deliverables",
        toolbar: ["Add new item", "Edit in grid view", "Undo", "Share", "Copy link", "Export"],
        filters: ["All Deliverables", "Open Deliverables", "Closed Deliverables"],
        columns: ["Attachments", "ID", "Title", "Assigned To", "Status", "Category", "Due Date"],
        message: "Welcome to your new list",
        note: "Select the New button to get started.",
      },
    ],
  },
  "/projects/rp-20250059/project-management/risk": {
    title: "Risks",
    href: "/projects/rp-20250059/project-management/risk",
    quickLaunchActive: "Project Management",
    blocks: [
      {
        type: "empty-list",
        heading: "Risks",
        toolbar: ["Add new item", "Edit in grid view", "Undo", "Share", "Copy link", "Export"],
        filters: ["All Active Risks", "All Closed Risks", "All Items"],
        columns: ["Attachments", "ID", "Title", "Assigned To", "Status", "Probability", "Impact", "Due Date"],
        message: "Welcome to your new list",
        note: "Select the New button to get started.",
      },
    ],
  },
  "/projects/rp-20250059/project-management/project-status": {
    title: "Project Status",
    href: "/projects/rp-20250059/project-management/project-status",
    quickLaunchActive: "Project Management",
    projectContext: {
      title: "victor 20260212 001",
      subtitle: "",
      activeItem: "Project Status",
    },
    blocks: [
      {
        type: "form",
        plain: true,
        heading: "Project Status",
        columns: 2,
        fields: [
          { label: "Project Number", value: "RP20260004", required: true, control: "readonly" },
          { label: "Project Category", value: "RP", control: "readonly" },
          {
            label: "Project Status",
            value: "Planning",
            control: "select",
            options: ["Planning", "In Progress", "Completed"],
          },
          { label: "Updated By", value: "victorcheng@ajpcorp.com", control: "readonly" },
        ],
      },
      {
        type: "button-row",
        buttons: ["Save"],
      },
    ],
  },
  "/projects/rp-20250059/project-management/task-bar": {
    title: "Task Bar",
    href: "/projects/rp-20250059/project-management/task-bar",
    quickLaunchActive: "Project Management",
    projectContext: {
      title: "victor 20260212 001",
      subtitle: "",
      activeItem: "Schedule",
    },
    blocks: [
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
        ],
      },
    ],
  },
  "/projects/rp-20250059/task-bar": {
    title: "Task Bar",
    href: "/projects/rp-20250059/task-bar",
    quickLaunchActive: "Project Management",
    projectContext: {
      title: "victor 20260212 001",
      subtitle: "",
      activeItem: "Schedule",
    },
    blocks: [
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
        ],
      },
    ],
  },
  "/projects/rp-20250059/tasks/new": projectScreen(
    "/projects/rp-20250059/tasks/new",
    "New Task",
    "Tasks",
    [
      {
        type: "form",
        plain: true,
        heading: "Task Location",
        columns: 1,
        fields: [
          {
            label: "Task Location",
            value:
              "Select the location where you would like this task to appear on the project plan.",
            control: "readonly",
            wide: true,
          },
          { label: "Parent Task", value: "Project Plan" },
        ],
      },
      {
        type: "form",
        plain: true,
        heading: "Task Details",
        columns: 2,
        fields: [
          { label: "Task Name", value: "", required: true },
          { label: "Start", value: "11/03/2026" },
          { label: "Finish", value: "" },
          { label: "Duration", value: "0d" },
          { label: "Predecessors", value: "" },
          { label: "Comments", value: "", control: "textarea", wide: true },
        ],
      },
      {
        type: "button-row",
        buttons: ["Save", "Cancel"],
      },
    ],
    "Tasks",
  ),
  "/projects/rp-20250059/resources/new-4": projectScreen(
    "/projects/rp-20250059/resources/new-4",
    "New Resource",
    "Resources",
    [
      {
        type: "tabs",
        tabs: [{ label: "Work" }, { label: "Budget" }, { label: "Generic" }],
      },
      {
        type: "form",
        plain: true,
        heading: "Identification Information",
        columns: 2,
        fields: [
          { label: "Name", value: "", required: true },
          { label: "Email Address", value: "" },
          { label: "Initials", value: "" },
          { label: "NT Name", value: "" },
          {
            label: "Resource Type",
            value: "Work",
            control: "select",
            options: ["Work", "Budget", "Generic"],
          },
          { label: "Group", value: "" },
        ],
      },
      {
        type: "button-row",
        buttons: ["Save", "Cancel"],
      },
    ],
    "Resources",
  ),
  "/projects/rp-20250059/resources/new-5": projectScreen(
    "/projects/rp-20250059/resources/new-5",
    "New Resource",
    "Resources",
    [
      {
        type: "form",
        plain: true,
        heading: "Assignment Attributes",
        columns: 2,
        fields: [
          {
            label: "Resource requires approval for all project assignments",
            value: "Enabled",
            control: "select",
            options: ["Enabled", "Disabled"],
            wide: true,
          },
          {
            label: "Resource can be leveled",
            value: "Enabled",
            control: "select",
            options: ["Enabled", "Disabled"],
          },
          {
            label: "Base Calendar",
            value: "Standard",
            control: "select",
            options: ["Standard"],
          },
          {
            label: "Default Booking Type",
            value: "Committed",
            control: "select",
            options: ["Committed", "Proposed"],
          },
          { label: "Timesheet Manager", value: "" },
          { label: "Default Assignment Owner", value: "" },
          { label: "Earliest Available", value: "" },
          { label: "Latest Available", value: "" },
          { label: "Standard Rate", value: "" },
          { label: "Overtime Rate", value: "" },
          { label: "Current Max. Units (%)", value: "5" },
          { label: "Cost/Use", value: "" },
          { label: "Resource Departments", value: "", wide: true },
        ],
      },
      {
        type: "button-row",
        buttons: ["Save", "Cancel"],
      },
    ],
    "Resources",
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
