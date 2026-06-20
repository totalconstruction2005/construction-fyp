// Employee types and utilities
export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: "Active" | "On Leave" | "Inactive";
};

export type EmployeeForm = Omit<Employee, "id">;

// Project types and utilities
export type ProjectStatus =
  | "PendingApproval"
  | "Contacted"
  | "Approved"
  | "In Progress"
  | "Completed"
  | "Rejected";

export type ContractType = "basic" | "standard" | "premium";

export type Project = {
  id: string;
  name: string;
  client: string;
  clientPhone1: string;
  clientPhone2?: string;
  clientEmail: string;
  contractType: ContractType;
  siteLocation: string;
  mapImage: string; // Base64 or URL of map/plot image
  plotNumber: string;
  plotSize: string;
  status: ProjectStatus;
};

export type ProjectForm = Omit<Project, "id" | "status">;

// Appointment types
export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export type Appointment = {
  id: string;
  client: string;
  service: string;
  date: string;
  status: AppointmentStatus;
};

// Project Update types
export type ProjectReply = {
  id: string;
  projectId: string;
  updateId: string;
  message: string;
  createdAt: string;
  createdBy: "admin" | "client";
  parentReplyId?: string; // when admin replies to a client reply
};

export type ProjectUpdate = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  attachments: Attachment[];
  createdAt: string; // ISO timestamp
  createdBy: "admin" | "client"; // Sender of update
  replies?: ProjectReply[]; // nested discussion under an update
};

export type Attachment = {
  id: string;
  name: string;
  type: "image" | "file"; // image or file
  data: string; // base64 or mock URL
  url?: string; // optional object URL for opening
  uploadedAt: string;
};

export type ProjectUpdateForm = Omit<ProjectUpdate, "id" | "createdAt" | "createdBy" | "replies">;

// Demo data
export const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-demo-1",
    name: "Residential Complex - Downtown",
    client: "Ahmed Hassan",
    clientPhone1: "+92 300 1234567",
    clientPhone2: "+92 321 7654321",
    clientEmail: "ahmed.hassan@email.com",
    contractType: "premium",
    siteLocation: "Gulberg, Lahore",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/74.3587,31.5204,12,400x300@2x?access_token=placeholder",
    plotNumber: "A-456",
    plotSize: "50,000 sq ft",
    status: "PendingApproval",
  },
  {
    id: "proj-demo-2",
    name: "Shopping Mall Renovation",
    client: "Malik Enterprises",
    clientPhone1: "+92 333 9876543",
    clientPhone2: "+92 322 1112233",
    clientEmail: "contact@malikenterprises.com",
    contractType: "standard",
    siteLocation: "Defense, Karachi",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/67.0099,24.8607,12,400x300@2x?access_token=placeholder",
    plotNumber: "B-789",
    plotSize: "120,000 sq ft",
    status: "PendingApproval",
  },
  {
    id: "proj-demo-3",
    name: "Office Building - Tech Park",
    client: "TechVision Solutions",
    clientPhone1: "+92 345 5556677",
    clientPhone2: "+92 311 8889900",
    clientEmail: "info@techvision.com.pk",
    contractType: "premium",
    siteLocation: "Islamabad Business District, Islamabad",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/72.8479,33.6844,12,400x300@2x?access_token=placeholder",
    plotNumber: "C-234",
    plotSize: "75,000 sq ft",
    status: "Contacted",
  },
  {
    id: "proj-demo-4",
    name: "School Infrastructure Upgrade",
    client: "Education Ministry",
    clientPhone1: "+92 51 9012345",
    clientEmail: "projects@education.gov.pk",
    contractType: "basic",
    siteLocation: "F-10, Islamabad",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/72.8419,33.7294,12,400x300@2x?access_token=placeholder",
    plotNumber: "D-567",
    plotSize: "30,000 sq ft",
    status: "Approved",
  },
  {
    id: "proj-demo-5",
    name: "Coastal Hotel Expansion",
    client: "Harborline Resorts",
    clientPhone1: "+92 302 2228899",
    clientEmail: "projects@harborlineresorts.com",
    contractType: "premium",
    siteLocation: "Clifton, Karachi",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/67.0220,24.8138,12,400x300@2x?access_token=placeholder",
    plotNumber: "E-902",
    plotSize: "95,000 sq ft",
    status: "Approved",
  },
  {
    id: "proj-demo-6",
    name: "Metro Station Concourse",
    client: "City Transit Authority",
    clientPhone1: "+92 51 8776677",
    clientEmail: "metro.projects@cta.gov.pk",
    contractType: "standard",
    siteLocation: "I-9, Islamabad",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/73.0369,33.6531,12,400x300@2x?access_token=placeholder",
    plotNumber: "F-118",
    plotSize: "40,000 sq ft",
    status: "In Progress",
  },
  {
    id: "proj-demo-7",
    name: "City Library Refurbishment",
    client: "Municipal Council",
    clientPhone1: "+92 41 4556677",
    clientEmail: "library.works@council.pk",
    contractType: "basic",
    siteLocation: "People's Colony, Faisalabad",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/73.0773,31.4180,12,400x300@2x?access_token=placeholder",
    plotNumber: "G-44",
    plotSize: "18,000 sq ft",
    status: "Completed",
  },
  {
    id: "proj-demo-8",
    name: "Warehouse Logistics Hub",
    client: "NorthGate Logistics",
    clientPhone1: "+92 300 5544332",
    clientEmail: "ops@northgatelogistics.com",
    contractType: "standard",
    siteLocation: "Sundar Industrial Estate, Lahore",
    mapImage: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/74.1459,31.3479,12,400x300@2x?access_token=placeholder",
    plotNumber: "H-77",
    plotSize: "60,000 sq ft",
    status: "Rejected",
  },
];

export const DEMO_PROJECT_UPDATES: ProjectUpdate[] = [
  {
    id: "update-demo-1",
    projectId: "proj-demo-1",
    title: "Foundation Work Started",
    description: "Initial foundation excavation and leveling completed. Concrete pouring scheduled for next week.",
    attachments: [],
    createdAt: "2026-01-05T10:30:00Z",
    createdBy: "admin",
    replies: [],
  },
  {
    id: "update-demo-2",
    projectId: "proj-demo-1",
    title: "Status Changed to In Progress",
    description: "Project status updated from Approved to In Progress.",
    attachments: [],
    createdAt: "2026-01-06T14:00:00Z",
    createdBy: "admin",
    replies: [],
  },
  {
    id: "update-demo-3",
    projectId: "proj-demo-2",
    title: "Structural Steel Installation",
    description: "Main structural steel framework is 40% complete. High strength bolts being used for connections.",
    attachments: [],
    createdAt: "2026-01-03T09:15:00Z",
    createdBy: "admin",
    replies: [],
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "appt-1",
    client: "Ayesha Khan",
    service: "Custom Design",
    date: "2025-12-28",
    status: "Pending",
  },
  {
    id: "appt-2",
    client: "Bilal Ahmed",
    service: "Site Visit",
    date: "2025-12-30",
    status: "Confirmed",
  },
  {
    id: "appt-3",
    client: "Zara Malik",
    service: "3D Visualization",
    date: "2026-01-02",
    status: "Pending",
  },
];

// Storage keys
export const STORAGE_KEYS = {
  EMPLOYEES: "buildsmart_employees",
  APPROVED_PROJECTS: "buildsmart_approved_projects",
  PROJECTS: "buildsmart_projects",
  APPOINTMENTS: "buildsmart_appointments",
  PROJECT_UPDATES: "buildsmart_project_updates",
  PENDING_PROJECTS: "buildsmart_pending_projects",
} as const;
