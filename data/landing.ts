import {
  Plus,
  Database,
  BrainCog,
  PlayCircle,
  ShieldCheck,
  Share2,
  ChartSpline,
  Users,
  ListChecks,
  GripVertical,
  BrainCircuit,
  Store,
  LockKeyhole,
  RefreshCcw,
  ArrowUpNarrowWide,
} from "lucide-react";

export const efficiencyData = [
  {
    id: 1,
    title: "Design Your API Visually",
    icon: Plus,
    color: "blue",
    content:
      "Start by dragging and dropping components to define your API structure endpoints, methods (GET, POST, etc.), and input/output formats.",
  },
  {
    id: 2,
    title: "Connect to Your Data Source",
    icon: Database,
    color: "green",
    content:
      "Choose from databases like Airtable, Firebase, Google Sheets, or connect custom REST APIs to fetch and send data.",
  },
  {
    id: 3,
    title: "Add Logic with AI Assistance",
    icon: BrainCog,
    color: "amber",
    content:
      "Use natural language prompts or AI-generated suggestions to define business rules, filters, conditions, or transformations.",
  },
  {
    id: 4,
    title: "Test in Real Time",
    icon: PlayCircle,
    color: "red",
    content:
      "Run live requests and inspect responses instantly using the built-in testing console, no Postman needed.",
  },
  {
    id: 5,
    title: "Secure & Control Access",
    icon: ShieldCheck,
    color: "purple",
    content:
      "Apply authentication, role-based access, and CORS settings to protect your endpoints right from the builder.",
  },
  {
    id: 6,
    title: "Publish & Integrate Anywhere",
    icon: Share2,
    color: "orange",
    content:
      "Deploy your API with one click and connect it to your apps, automation tools (like Zapier or Make), or frontend interfaces.",
  },
];

export const efficencyChips = [
  {
    id: 1,
    text: "Smart Analytics",
    icon: ChartSpline,
  },
  {
    id: 2,
    text: "Real-Time Collaboration",
    icon: Users,
  },
  {
    id: 3,
    text: "Task Prioritization",
    icon: ListChecks,
  },
];

export const benefitsData = [
  {
    id: 1,
    title: "Drag and Drop API Builder",
    color: "rgba(255, 99, 132, 0.5)",
    icon: GripVertical,
    content:
      "Design and deploy APIs using an intuitive drag-and-drop interface—no coding required.",
  },
  {
    id: 2,
    title: "AI-Assisted Logic",
    color: "rgba(54, 162, 235, 0.5)",
    icon: BrainCircuit,
    content:
      "Let built-in AI help you define endpoint logic, map data, and auto-generate payloads intelligently.",
  },
  {
    id: 3,
    title: "Marketplace",
    color: "rgba(255, 206, 86, 0.5)",
    icon: Store,
    content:
      "Various aopi templates will be avilable, bulid custom api's and sell them in marketplace",
  },
  {
    id: 4,
    title: "Authentication & Access Control",
    color: "rgba(50, 205, 50, 0.5)",
    icon: LockKeyhole,
    content:
      "Secure your APIs with built-in token management, CORS settings, and role-based permissions.",
  },
  {
    id: 5,
    title: "Real-Time Testing Console",
    color: "rgba(138, 43, 226, 0.5)",
    icon: RefreshCcw,
    content:
      "Test, debug, and validate your API endpoints instantly with live request/response previews.",
  },
  {
    id: 6,
    title: "Scalable & Production-Ready",
    color: "rgba(255, 99, 71, 0.5)",
    icon: ArrowUpNarrowWide,
    content:
      "Launch confidently with infrastructure that scales from MVPs to enterprise-level applications.",
  },
];

export const comparisionData = {
  we: [
    "Rapid API creation in minutes using UI tools",
    "Lower cost, no need for backend developers",
    "Intuitive drag-and-drop interface, AI assistance",
    "Preconfigured auth, CORS, and token controls",
    "Easy to modify, scale, and deploy changes fast",
    "Real-time analytics and request tracking",
  ],
  others: [
    "Slower, requires planning, coding, testing",
    "Higher development and maintenance costs",
    "Requires technical skills & coding expertise",
    "Needs to be coded and audited manually",
    "Slower iterations, risk of breaking changes",
    "Requires setting up logging frameworks",
  ],
};

export const faqData = [
  {
    question: "Can I define custom logic or transformations in my API?",
    answer:
      "Yes. You can use built-in logic blocks or AI-assisted prompts to create conditionals, loops, data mappings, and custom payload transformations—all without writing code.",
  },
  {
    question: "How secure are the APIs built with this tool?",
    answer:
      "Every API comes with built-in authentication, token-based access, and CORS control. You can also manage role-based permissions and secure endpoints with industry-standard protocols.",
  },
  {
    question:
      "Can I integrate this with my existing backend or third-party services?",
    answer:
      "Absolutely. You can connect external REST APIs, webhooks, or databases like Firebase, PostgreSQL, or Airtable using native or custom connectors.",
  },
  {
    question:
      "What environments or stages can I manage (dev, staging, production)?",
    answer:
      "You can create and manage multiple environments with versioned endpoints. This makes it easy to test changes before pushing to production without downtime.",
  },
  {
    question: "Is it possible to export or migrate the API to code later?",
    answer:
      "Yes. You can export the OpenAPI (Swagger) spec or auto-generate a boilerplate in code format for future customization outside the platform.",
  },
];
