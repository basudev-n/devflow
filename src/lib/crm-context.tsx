"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  type: "Residential" | "Commercial" | "Mixed-use";
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  units: number;
  unitsSold: number;
  thumbnail: string;
}

export interface Unit {
  id: string;
  projectId: string;
  unitNumber: string;
  floor: number;
  type: "Studio" | "1BR" | "2BR" | "3BR" | "Penthouse" | "Villa";
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  price: number;
  status: "Available" | "Reserved" | "Sold" | "Blocked";
  features: string[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: "Website" | "Referral" | "Agent" | "Advertisement" | "Other";
  budgetMin: number;
  budgetMax: number;
  projectInterest: string;
  unitTypeInterest: string;
  assignedTo: string;
  stage: "New" | "Contacted" | "Qualified" | "Negotiation" | "Won" | "Lost";
  createdAt: string;
  notes: { date: string; text: string }[];
}

export interface Contact {
  id: string;
  type: "Buyer" | "Investor" | "Partner" | "Vendor";
  name: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Payment {
  id: string;
  unitSaleId: string;
  buyerName: string;
  projectName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Pending" | "Paid" | "Overdue";
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "active" | "in_progress" | "completed";
  priority: "high" | "medium" | "low";
  dueDate?: string;
  projectId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: "lead" | "sale" | "payment" | "project" | "milestone" | "task";
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userRole: "admin" | "user";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingComplete: boolean;
}

export interface Settings {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  notifications: {
    newLeads: boolean;
    salesUpdates: boolean;
    paymentAlerts: boolean;
    projectMilestones: boolean;
  };
  theme: "dark" | "light" | "system";
  accentColor: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  projectId: string;
  projectName: string;
  unitNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  validUntil: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  projectId: string;
  projectName: string;
  unitNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";
  dueDate: string;
  paidDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareLink {
  id: string;
  documentType: "quotation" | "invoice";
  documentId: string;
  token: string;
  expiresAt: string;
  accessedAt?: string;
  response?: "accepted" | "rejected" | "pending";
  createdAt: string;
}

interface CRMContextType {
  projects: Project[];
  units: Unit[];
  leads: Lead[];
  contacts: Contact[];
  payments: Payment[];
  tasks: Task[];
  activities: Activity[];
  settings: Settings;
  quotations: Quotation[];
  invoices: Invoice[];
  shareLinks: ShareLink[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addUnit: (unit: Omit<Unit, "id">) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "notes">) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, stage: Lead["stage"]) => void;
  addContact: (contact: Omit<Contact, "id">) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addQuotation: (quotation: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt">) => void;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  createShareLink: (documentType: "quotation" | "invoice", documentId: string) => ShareLink;
  respondToShareLink: (token: string, response: "accepted" | "rejected") => void;
  auth: AuthState;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, firstName: string, lastName: string, phone: string) => boolean;
  logout: () => void;
  completeOnboarding: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateQuotationNumber(): string {
  return "QT-" + Date.now().toString(36).toUpperCase();
}

function generateInvoiceNumber(): string {
  return "INV-" + Date.now().toString(36).toUpperCase();
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Skyline Towers",
    description: "Luxury residential tower with panoramic city views",
    location: "Downtown, Metro City",
    type: "Residential",
    status: "In Progress",
    startDate: "2024-01-15",
    endDate: "2025-06-30",
    budget: 45000000,
    spent: 28500000,
    units: 120,
    unitsSold: 78,
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
  },
  {
    id: "2",
    name: "Harbor View Commercial",
    description: "Grade A office space with waterfront access",
    location: "Harbor District",
    type: "Commercial",
    status: "In Progress",
    startDate: "2024-03-01",
    endDate: "2025-12-31",
    budget: 72000000,
    spent: 31000000,
    units: 45,
    unitsSold: 12,
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
  },
  {
    id: "3",
    name: "Greenfield Residences",
    description: "Eco-friendly residential community",
    location: "Greenfield Suburbs",
    type: "Residential",
    status: "Planning",
    startDate: "2025-02-01",
    endDate: "2027-03-31",
    budget: 38000000,
    spent: 2500000,
    units: 85,
    unitsSold: 0,
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
  },
];

const initialUnits: Unit[] = [
  { id: "1", projectId: "1", unitNumber: "101", floor: 1, type: "2BR", bedrooms: 2, bathrooms: 2, sizeSqft: 1200, price: 450000, status: "Sold", features: ["City View", "Balcony"] },
  { id: "2", projectId: "1", unitNumber: "102", floor: 1, type: "2BR", bedrooms: 2, bathrooms: 2, sizeSqft: 1200, price: 450000, status: "Available", features: ["City View", "Balcony"] },
  { id: "3", projectId: "1", unitNumber: "201", floor: 2, type: "3BR", bedrooms: 3, bathrooms: 2, sizeSqft: 1650, price: 620000, status: "Reserved", features: ["Panoramic View", "Balcony", "Parking"] },
  { id: "4", projectId: "1", unitNumber: "202", floor: 2, type: "3BR", bedrooms: 3, bathrooms: 2, sizeSqft: 1650, price: 620000, status: "Sold", features: ["Panoramic View", "Balcony", "Parking"] },
  { id: "5", projectId: "1", unitNumber: "501", floor: 5, type: "Penthouse", bedrooms: 4, bathrooms: 4, sizeSqft: 3200, price: 1450000, status: "Available", features: ["Private Terrace", "Smart Home", "Wine Cellar"] },
];

const initialLeads: Lead[] = [
  { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "+1 555-0101", source: "Website", budgetMin: 400000, budgetMax: 600000, projectInterest: "Skyline Towers", unitTypeInterest: "2BR", assignedTo: "Sarah Johnson", stage: "Negotiation", createdAt: "2024-11-15", notes: [{ date: "2024-12-01", text: "Interested in floor 5 units" }] },
  { id: "2", name: "Maria Garcia", email: "maria.g@email.com", phone: "+1 555-0102", source: "Referral", budgetMin: 500000, budgetMax: 800000, projectInterest: "Skyline Towers", unitTypeInterest: "3BR", assignedTo: "Mike Chen", stage: "Qualified", createdAt: "2024-12-10", notes: [{ date: "2024-12-15", text: "Looking for investment property" }] },
  { id: "3", name: "Robert Kim", email: "robert.kim@email.com", phone: "+1 555-0103", source: "Agent", budgetMin: 1000000, budgetMax: 1500000, projectInterest: "Skyline Towers", unitTypeInterest: "Penthouse", assignedTo: "Sarah Johnson", stage: "Contacted", createdAt: "2025-01-05", notes: [] },
  { id: "4", name: "Emily Davis", email: "emily.d@email.com", phone: "+1 555-0104", source: "Advertisement", budgetMin: 350000, budgetMax: 450000, projectInterest: "Harbor View Commercial", unitTypeInterest: "1BR", assignedTo: "Mike Chen", stage: "New", createdAt: "2025-01-20", notes: [] },
  { id: "5", name: "David Wilson", email: "david.w@email.com", phone: "+1 555-0105", source: "Website", budgetMin: 600000, budgetMax: 900000, projectInterest: "Greenfield Residences", unitTypeInterest: "Villa", assignedTo: "Sarah Johnson", stage: "Won", createdAt: "2024-10-20", notes: [{ date: "2024-11-05", text: "Signed contract for Villa #12" }] },
];

const initialContacts: Contact[] = [
  { id: "1", type: "Buyer", name: "David Wilson", email: "david.w@email.com", phone: "+1 555-0105" },
  { id: "2", type: "Buyer", name: "Jennifer Brown", email: "jennifer.b@email.com", phone: "+1 555-0201" },
  { id: "3", type: "Investor", name: "Capital Ventures", email: "info@capitalventures.com", phone: "+1 555-0301", company: "Capital Ventures LLC" },
];

const initialPayments: Payment[] = [
  { id: "1", unitSaleId: "u1", buyerName: "David Wilson", projectName: "Skyline Towers", unitNumber: "101", amount: 225000, dueDate: "2025-02-15", paidDate: "2025-02-10", status: "Paid" },
  { id: "2", unitSaleId: "u2", buyerName: "Jennifer Brown", projectName: "Harbor View Commercial", unitNumber: "A101", amount: 190000, dueDate: "2025-02-20", status: "Pending" },
  { id: "3", unitSaleId: "u3", buyerName: "Michael Torres", projectName: "Skyline Towers", unitNumber: "202", amount: 310000, dueDate: "2025-02-28", status: "Pending" },
];

const initialTasks: Task[] = [
  { id: "1", title: "Follow up with John Smith", status: "todo", priority: "high", createdAt: "2025-01-20" },
  { id: "2", title: "Prepare contract for Maria Garcia", status: "in_progress", priority: "high", createdAt: "2025-01-19" },
  { id: "3", title: "Schedule site visit for Robert Kim", status: "active", priority: "medium", createdAt: "2025-01-18" },
  { id: "4", title: "Update inventory prices", status: "completed", priority: "low", createdAt: "2025-01-15" },
];

const initialActivities: Activity[] = [
  { id: "1", type: "sale", title: "Unit Sold", description: "Skyline Towers #101 sold to David Wilson", timestamp: new Date().toISOString(), user: "Sarah Johnson" },
  { id: "2", type: "lead", title: "New Lead", description: "Emily Davis showed interest in Harbor View", timestamp: new Date(Date.now() - 86400000).toISOString(), user: "System" },
  { id: "3", type: "payment", title: "Payment Received", description: "$225,000 received from David Wilson", timestamp: new Date(Date.now() - 172800000).toISOString(), user: "Finance" },
];

const initialSettings: Settings = {
  profile: {
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@devflow.com",
    phone: "+1 555-0100",
  },
  company: {
    name: "DevFlow Properties",
    address: "123 Business Ave, Metro City",
    city: "Metro City",
    country: "United States",
  },
  notifications: {
    newLeads: true,
    salesUpdates: true,
    paymentAlerts: true,
    projectMilestones: true,
  },
  theme: "dark",
  accentColor: "#6366f1",
};

export function CRMProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    onboardingComplete: false,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load users from localStorage
  const getUsers = (): User[] => {
    const saved = localStorage.getItem("crm_users");
    return saved ? JSON.parse(saved) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem("crm_users", JSON.stringify(users));
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("crm_projects");
    const savedUnits = localStorage.getItem("crm_units");
    const savedLeads = localStorage.getItem("crm_leads");
    const savedContacts = localStorage.getItem("crm_contacts");
    const savedPayments = localStorage.getItem("crm_payments");
    const savedTasks = localStorage.getItem("crm_tasks");
    const savedActivities = localStorage.getItem("crm_activities");
    const savedSettings = localStorage.getItem("crm_settings");
    const savedQuotations = localStorage.getItem("crm_quotations");
    const savedInvoices = localStorage.getItem("crm_invoices");
    const savedShareLinks = localStorage.getItem("crm_share_links");
    const savedUsers = localStorage.getItem("crm_users");
    const savedAuth = localStorage.getItem("crm_auth");

    setProjects(savedProjects ? JSON.parse(savedProjects) : initialProjects);
    setUnits(savedUnits ? JSON.parse(savedUnits) : initialUnits);
    setLeads(savedLeads ? JSON.parse(savedLeads) : initialLeads);
    setContacts(savedContacts ? JSON.parse(savedContacts) : initialContacts);
    setPayments(savedPayments ? JSON.parse(savedPayments) : initialPayments);
    setTasks(savedTasks ? JSON.parse(savedTasks) : initialTasks);
    setActivities(savedActivities ? JSON.parse(savedActivities) : initialActivities);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedShareLinks) setShareLinks(JSON.parse(savedShareLinks));
    setUsers(savedUsers ? JSON.parse(savedUsers) : []);
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setAuth({ user: authData.user, isAuthenticated: authData.isAuthenticated, isLoading: false, onboardingComplete: authData.onboardingComplete ?? true });
    } else {
      setAuth(prev => ({ ...prev, isLoading: false, onboardingComplete: false }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("crm_invoices", JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem("crm_share_links", JSON.stringify(shareLinks));
  }, [shareLinks]);
  useEffect(() => {
    localStorage.setItem("crm_users", JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem("crm_auth", JSON.stringify({ user: auth.user, isAuthenticated: auth.isAuthenticated }));
  }, [auth]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Auth functions
  const login = (email: string, password: string): boolean => {
    // First check state, then localStorage
    let user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      // Check localStorage directly
      const savedUsers = JSON.parse(localStorage.getItem("crm_users") || "[]");
      user = savedUsers.find((u: User) => u.email === email && u.password === password);
    }

    if (user) {
      const savedAuth = localStorage.getItem("crm_auth");
      const authData = savedAuth ? JSON.parse(savedAuth) : { onboardingComplete: true };
      setAuth({ user, isAuthenticated: true, isLoading: false, onboardingComplete: authData.onboardingComplete ?? true });
      localStorage.setItem("crm_current_user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const signup = (email: string, password: string, firstName: string, lastName: string, phone: string): boolean => {
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: generateId(),
      email,
      password,
      firstName,
      lastName,
      phone,
      userRole: "user",
      createdAt: new Date().toISOString(),
    };

    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("crm_users", JSON.stringify(updatedUsers));

    // Set auth
    setAuth({ user: newUser, isAuthenticated: true, isLoading: false, onboardingComplete: false });
    localStorage.setItem("crm_auth", JSON.stringify({ user: newUser, isAuthenticated: true, onboardingComplete: false }));
    localStorage.setItem("crm_current_user", JSON.stringify(newUser));

    // Update settings profile with user info
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        firstName,
        lastName,
        email,
        phone,
      }
    }));
    return true;
  };

  const logout = () => {
    const savedAuth = localStorage.getItem("crm_auth");
    const authData = savedAuth ? JSON.parse(savedAuth) : {};
    localStorage.setItem("crm_auth", JSON.stringify({ ...authData, user: null, isAuthenticated: false }));
    setAuth({ user: null, isAuthenticated: false, isLoading: false, onboardingComplete: true });
  };

  const completeOnboarding = () => {
    const authData = { user: auth.user, isAuthenticated: true, onboardingComplete: true };
    localStorage.setItem("crm_auth", JSON.stringify(authData));
    setAuth(prev => ({ ...prev, onboardingComplete: true }));
  };

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const addProject = (project: Omit<Project, "id">) => {
    const newProject: Project = { ...project, id: generateId() };
    setProjects(prev => [...prev, newProject]);
    addActivity({ type: "project", title: "Project Added", description: `${project.name} was added`, user: "You" });
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setUnits(prev => prev.filter(u => u.projectId !== id));
  };

  const addUnit = (unit: Omit<Unit, "id">) => {
    const newUnit: Unit = { ...unit, id: generateId() };
    setUnits(prev => [...prev, newUnit]);
  };

  const updateUnit = (id: string, data: Partial<Unit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const deleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  const addLead = (lead: Omit<Lead, "id" | "createdAt" | "notes">) => {
    const newLead: Lead = {
      ...lead,
      id: generateId(),
      createdAt: new Date().toISOString(),
      notes: [],
    };
    setLeads(prev => [...prev, newLead]);
    addActivity({ type: "lead", title: "New Lead", description: `${lead.name} was added as a lead`, user: "You" });
  };

  const updateLead = (id: string, data: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const moveLeadStage = (id: string, stage: Lead["stage"]) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      updateLead(id, { stage });
      if (stage === "Won") {
        addActivity({ type: "sale", title: "Deal Won", description: `${lead.name} converted to customer`, user: "You" });
      }
    }
  };

  const addContact = (contact: Omit<Contact, "id">) => {
    const newContact: Contact = { ...contact, id: generateId() };
    setContacts(prev => [...prev, newContact]);
    addActivity({ type: "lead", title: "Contact Added", description: `${contact.name} was added as ${contact.type}`, user: "You" });
  };

  const updateContact = (id: string, data: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
    setTasks(prev => [...prev, newTask]);
    addActivity({ type: "task", title: "Task Created", description: task.title, user: "You" });
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    if (data.status === "completed" && task && task.status !== "completed") {
      addActivity({ type: "task", title: "Task Completed", description: task.title, user: "You" });
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment: Payment = { ...payment, id: generateId() };
    setPayments(prev => [...prev, newPayment]);
    if (payment.status === "Paid") {
      addActivity({ type: "payment", title: "Payment Received", description: `$${payment.amount.toLocaleString()} received from ${payment.buyerName}`, user: "You" });
    }
  };

  const updatePayment = (id: string, data: Partial<Payment>) => {
    const payment = payments.find(p => p.id === id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    if (data.status === "Paid" && payment && payment.status !== "Paid") {
      addActivity({ type: "payment", title: "Payment Received", description: `$${payment.amount.toLocaleString()} received from ${payment.buyerName}`, user: "You" });
    }
  };

  // Quotation functions
  const addQuotation = (quotation: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt">) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: generateId(),
      quotationNumber: generateQuotationNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotations(prev => [...prev, newQuotation]);
    addActivity({ type: "sale", title: "Quotation Created", description: `${newQuotation.quotationNumber} created for ${quotation.customerName}`, user: "You" });
  };

  const updateQuotation = (id: string, data: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q));
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  // Invoice functions
  const addInvoice = (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInvoice]);
    addActivity({ type: "sale", title: "Invoice Created", description: `${newInvoice.invoiceNumber} created for ${invoice.customerName}`, user: "You" });
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  // Share link functions
  const createShareLink = (documentType: "quotation" | "invoice", documentId: string): ShareLink => {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const newLink: ShareLink = {
      id: generateId(),
      documentType,
      documentId,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    setShareLinks(prev => [...prev, newLink]);
    return newLink;
  };

  const respondToShareLink = (token: string, response: "accepted" | "rejected") => {
    const link = shareLinks.find(l => l.token === token);
    if (link) {
      setShareLinks(prev => prev.map(l => l.token === token ? { ...l, response, accessedAt: new Date().toISOString() } : l));

      if (link.documentType === "quotation") {
        const quotation = quotations.find(q => q.id === link.documentId);
        if (quotation) {
          updateQuotation(link.documentId, { status: response === "accepted" ? "Accepted" : "Rejected" });
          addActivity({ type: "sale", title: `Quotation ${response === "accepted" ? "Accepted" : "Rejected"}`, description: `${quotation.quotationNumber} was ${response} by customer`, user: "Customer" });
        }
      } else {
        const invoice = invoices.find(i => i.id === link.documentId);
        if (invoice) {
          updateInvoice(link.documentId, { status: response === "accepted" ? "Paid" : "Cancelled" });
          addActivity({ type: "payment", title: `Invoice ${response === "accepted" ? "Paid" : "Cancelled"}`, description: `${invoice.invoiceNumber} was ${response} by customer`, user: "Customer" });
        }
      }
    }
  };

  return (
    <CRMContext.Provider value={{
      projects, units, leads, contacts, payments, tasks, activities, settings,
      quotations, invoices, shareLinks, auth,
      addProject, updateProject, deleteProject,
      addUnit, updateUnit, deleteUnit,
      addLead, updateLead, deleteLead, moveLeadStage,
      addContact, updateContact, deleteContact,
      addTask, updateTask, deleteTask,
      addPayment, updatePayment,
      addActivity,
      updateSettings,
      addQuotation, updateQuotation, deleteQuotation,
      addInvoice, updateInvoice, deleteInvoice,
      createShareLink, respondToShareLink,
      login, signup, logout, completeOnboarding,
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within CRMProvider");
  }
  return context;
}
