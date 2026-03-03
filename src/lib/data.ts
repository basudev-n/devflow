// Mock data for DevFlow CRM

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'Residential' | 'Commercial' | 'Mixed-use';
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
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
  type: 'Studio' | '1BR' | '2BR' | '3BR' | 'Penthouse' | 'Villa';
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  price: number;
  status: 'Available' | 'Reserved' | 'Sold' | 'Blocked';
  features: string[];
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Website' | 'Referral' | 'Agent' | 'Advertisement' | 'Other';
  budgetMin: number;
  budgetMax: number;
  projectInterest: string;
  unitTypeInterest: string;
  assignedTo: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Negotiation' | 'Won' | 'Lost';
  createdAt: string;
  notes: { date: string; text: string }[];
}

export interface Contact {
  id: string;
  type: 'Buyer' | 'Investor' | 'Partner' | 'Vendor';
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
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
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface Activity {
  id: string;
  type: 'lead' | 'sale' | 'payment' | 'project' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

// Sample data
export const projects: Project[] = [
  {
    id: '1',
    name: 'Skyline Towers',
    description: 'Luxury residential tower with panoramic city views',
    location: 'Downtown, Metro City',
    type: 'Residential',
    status: 'In Progress',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    budget: 45000000,
    spent: 28500000,
    units: 120,
    unitsSold: 78,
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
  },
  {
    id: '2',
    name: 'Harbor View Commercial',
    description: 'Grade A office space with waterfront access',
    location: 'Harbor District',
    type: 'Commercial',
    status: 'In Progress',
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    budget: 72000000,
    spent: 31000000,
    units: 45,
    unitsSold: 12,
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
  },
  {
    id: '3',
    name: 'Greenfield Residences',
    description: 'Eco-friendly residential community',
    location: 'Greenfield Suburbs',
    type: 'Residential',
    status: 'Planning',
    startDate: '2025-02-01',
    endDate: '2027-03-31',
    budget: 38000000,
    spent: 2500000,
    units: 85,
    unitsSold: 0,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  },
  {
    id: '4',
    name: 'Metro Plaza',
    description: 'Mixed-use development with retail and offices',
    location: 'Central Business District',
    type: 'Mixed-use',
    status: 'Completed',
    startDate: '2022-06-01',
    endDate: '2024-08-15',
    budget: 95000000,
    spent: 92000000,
    units: 200,
    unitsSold: 195,
    thumbnail: 'https://images.unsplash.com/photo-1464938050520-ef2571d86a99?w=400',
  },
  {
    id: '5',
    name: 'Sunset Villa Resort',
    description: 'Luxury villas with private beach access',
    location: 'Coastal Bay',
    type: 'Residential',
    status: 'On Hold',
    startDate: '2024-09-01',
    endDate: '2026-12-31',
    budget: 120000000,
    spent: 8500000,
    units: 30,
    unitsSold: 5,
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
  },
];

export const units: Unit[] = [
  { id: '1', projectId: '1', unitNumber: '101', floor: 1, type: '2BR', bedrooms: 2, bathrooms: 2, sizeSqft: 1200, price: 450000, status: 'Sold', features: ['City View', 'Balcony'] },
  { id: '2', projectId: '1', unitNumber: '102', floor: 1, type: '2BR', bedrooms: 2, bathrooms: 2, sizeSqft: 1200, price: 450000, status: 'Available', features: ['City View', 'Balcony'] },
  { id: '3', projectId: '1', unitNumber: '201', floor: 2, type: '3BR', bedrooms: 3, bathrooms: 2, sizeSqft: 1650, price: 620000, status: 'Reserved', features: ['Panoramic View', 'Balcony', 'Parking'] },
  { id: '4', projectId: '1', unitNumber: '202', floor: 2, type: '3BR', bedrooms: 3, bathrooms: 2, sizeSqft: 1650, price: 620000, status: 'Sold', features: ['Panoramic View', 'Balcony', 'Parking'] },
  { id: '5', projectId: '1', unitNumber: '501', floor: 5, type: 'Penthouse', bedrooms: 4, bathrooms: 4, sizeSqft: 3200, price: 1450000, status: 'Available', features: ['Private Terrace', 'Smart Home', 'Wine Cellar'] },
  { id: '6', projectId: '2', unitNumber: 'A100', floor: 1, type: '1BR', bedrooms: 1, bathrooms: 1, sizeSqft: 800, price: 380000, status: 'Available', features: ['Harbor View'] },
  { id: '7', projectId: '2', unitNumber: 'A101', floor: 1, type: '1BR', bedrooms: 1, bathrooms: 1, sizeSqft: 800, price: 380000, status: 'Sold', features: ['Harbor View'] },
  { id: '8', projectId: '2', unitNumber: 'B200', floor: 2, type: '2BR', bedrooms: 2, bathrooms: 2, sizeSqft: 1400, price: 680000, status: 'Reserved', features: ['Corner Unit', 'Harbor View'] },
];

export const leads: Lead[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 555-0101', source: 'Website', budgetMin: 400000, budgetMax: 600000, projectInterest: 'Skyline Towers', unitTypeInterest: '2BR', assignedTo: 'Sarah Johnson', stage: 'Negotiation', createdAt: '2024-11-15', notes: [{ date: '2024-12-01', text: 'Interested in floor 5 units' }] },
  { id: '2', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '+1 555-0102', source: 'Referral', budgetMin: 500000, budgetMax: 800000, projectInterest: 'Skyline Towers', unitTypeInterest: '3BR', assignedTo: 'Mike Chen', stage: 'Qualified', createdAt: '2024-12-10', notes: [{ date: '2024-12-15', text: 'Looking for investment property' }] },
  { id: '3', name: 'Robert Kim', email: 'robert.kim@email.com', phone: '+1 555-0103', source: 'Agent', budgetMin: 1000000, budgetMax: 1500000, projectInterest: 'Skyline Towers', unitTypeInterest: 'Penthouse', assignedTo: 'Sarah Johnson', stage: 'Contacted', createdAt: '2025-01-05', notes: [] },
  { id: '4', name: 'Emily Davis', email: 'emily.d@email.com', phone: '+1 555-0104', source: 'Advertisement', budgetMin: 350000, budgetMax: 450000, projectInterest: 'Harbor View Commercial', unitTypeInterest: '1BR', assignedTo: 'Mike Chen', stage: 'New', createdAt: '2025-01-20', notes: [] },
  { id: '5', name: 'David Wilson', email: 'david.w@email.com', phone: '+1 555-0105', source: 'Website', budgetMin: 600000, budgetMax: 900000, projectInterest: 'Greenfield Residences', unitTypeInterest: 'Villa', assignedTo: 'Sarah Johnson', stage: 'Won', createdAt: '2024-10-20', notes: [{ date: '2024-11-05', text: 'Signed contract for Villa #12' }] },
  { id: '6', name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 555-0106', source: 'Referral', budgetMin: 500000, budgetMax: 700000, projectInterest: 'Skyline Towers', unitTypeInterest: '2BR', assignedTo: 'Mike Chen', stage: 'Lost', createdAt: '2024-09-15', notes: [{ date: '2024-10-01', text: 'Went with competitor' }] },
];

export const contacts: Contact[] = [
  { id: '1', type: 'Buyer', name: 'David Wilson', email: 'david.w@email.com', phone: '+1 555-0105', company: '' },
  { id: '2', type: 'Buyer', name: 'Jennifer Brown', email: 'jennifer.b@email.com', phone: '+1 555-0201', company: '' },
  { id: '3', type: 'Investor', name: 'Capital Ventures', email: 'info@capitalventures.com', phone: '+1 555-0301', company: 'Capital Ventures LLC' },
  { id: '4', type: 'Partner', name: 'BuildRight Construction', email: 'contact@buildright.com', phone: '+1 555-0401', company: 'BuildRight Construction Inc.' },
  { id: '5', type: 'Vendor', name: 'Premium Interiors', email: 'sales@premiuminteriors.com', phone: '+1 555-0501', company: 'Premium Interiors Co.' },
];

export const payments: Payment[] = [
  { id: '1', unitSaleId: 'u1', buyerName: 'David Wilson', projectName: 'Skyline Towers', unitNumber: '101', amount: 225000, dueDate: '2025-02-15', paidDate: '2025-02-10', status: 'Paid' },
  { id: '2', unitSaleId: 'u2', buyerName: 'Jennifer Brown', projectName: 'Harbor View Commercial', unitNumber: 'A101', amount: 190000, dueDate: '2025-02-20', status: 'Pending' },
  { id: '3', unitSaleId: 'u3', buyerName: 'Michael Torres', projectName: 'Metro Plaza', unitNumber: 'B305', amount: 450000, dueDate: '2025-01-31', paidDate: '2025-01-28', status: 'Paid' },
  { id: '4', unitSaleId: 'u4', buyerName: 'Sarah Martinez', projectName: 'Skyline Towers', unitNumber: '202', amount: 310000, dueDate: '2025-02-28', status: 'Pending' },
  { id: '5', unitSaleId: 'u5', buyerName: 'James Lee', projectName: 'Sunset Villa Resort', unitNumber: 'V8', amount: 850000, dueDate: '2025-01-15', status: 'Overdue' },
];

export const activities: Activity[] = [
  { id: '1', type: 'sale', title: 'Unit Sold', description: 'Skyline Towers #101 sold to David Wilson', timestamp: '2025-02-10T14:30:00', user: 'Sarah Johnson' },
  { id: '2', type: 'lead', title: 'New Lead', description: 'Emily Davis showed interest in Harbor View', timestamp: '2025-02-20T09:15:00', user: 'System' },
  { id: '3', type: 'payment', title: 'Payment Received', description: '$225,000 received from David Wilson', timestamp: '2025-02-10T11:00:00', user: 'Finance' },
  { id: '4', type: 'milestone', title: 'Milestone Complete', description: 'Skyline Towers foundation completed', timestamp: '2025-02-08T16:45:00', user: 'Project Manager' },
  { id: '5', type: 'project', title: 'Project Update', description: 'Harbor View Commercial structural work started', timestamp: '2025-02-15T10:00:00', user: 'Mike Chen' },
];

export const pipelineStages = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'] as const;

export const projectTypes = ['Residential', 'Commercial', 'Mixed-use'] as const;
export const projectStatuses = ['Planning', 'In Progress', 'Completed', 'On Hold'] as const;
export const unitStatuses = ['Available', 'Reserved', 'Sold', 'Blocked'] as const;
export const unitTypes = ['Studio', '1BR', '2BR', '3BR', 'Penthouse', 'Villa'] as const;
