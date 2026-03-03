# DevFlow CRM - Specification Document

## 1. Project Overview

**Project Name:** DevFlow CRM
**Project Type:** Full-stack Web Application (SaaS)
**Core Functionality:** A comprehensive CRM tailored for Real Estate Developers to manage projects, leads, inventory, finances, and client communications in one unified platform.
**Target Users:** Real estate development companies, property developers, construction firms with sales divisions

---

## 2. Problem Statement

Real estate developers face unique challenges:
- Managing multiple development projects simultaneously with different timelines
- Tracking leads through long sales cycles (often 6-12 months)
- Managing inventory of unsold units across multiple projects
- Coordinating documents (contracts, permits, blueprints)
- Financial tracking across projects
- Communication with buyers, investors, and stakeholders

Generic CRMs lack these domain-specific features, forcing teams to use spreadsheets, which become unwieldy as projects grow.

---

## 3. User Personas

### 1. Sales Team
- Track leads and convert them to buyers
- Manage unit reservations and contracts
- View commissions and performance

### 2. Project Managers
- Monitor project milestones and budgets
- Coordinate with construction teams
- Update stakeholders on progress

### 3. Finance Team
- Track payments and receivables
- Generate financial reports
- Monitor profitability per project

### 4. Administrators
- Manage team members and roles
- Configure system settings
- Access all data for oversight

### 5. External Clients (Buyers/Investors)
- Track their unit status
- View payment schedules
- Download documents

---

## 4. UI/UX Specification

### Layout Structure

**Main Layout:**
- Collapsible sidebar navigation (280px expanded, 72px collapsed)
- Top header with search, notifications, user menu
- Main content area with breadcrumbs
- Responsive: sidebar becomes bottom nav on mobile

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Design

**Color Palette:**
```css
--bg-primary: #0a0a0b;
--bg-secondary: #141416;
--bg-tertiary: #1c1c1f;
--bg-elevated: #232328;

--accent-primary: #6366f1;      /* Indigo - main brand */
--accent-primary-hover: #818cf8;
--accent-secondary: #10b981;    /* Emerald - success/money */
--accent-warning: #f59e0b;      /* Amber - warnings */
--accent-danger: #ef4444;       /* Red - errors/delete */
--accent-info: #06b6d4;         /* Cyan - info */

--text-primary: #fafafa;
--text-secondary: #a1a1aa;
--text-muted: #71717a;

--border-default: #27272a;
--border-hover: #3f3f46;
```

**Typography:**
- Font Family: "Outfit" (headings), "DM Sans" (body)
- Headings:
  - H1: 32px/700
  - H2: 24px/600
  - H3: 20px/600
  - H4: 16px/600
- Body: 14px/400
- Small: 12px/400

**Spacing System:**
- Base unit: 4px
- Common: 8, 12, 16, 20, 24, 32, 48, 64

**Visual Effects:**
- Cards: 1px border, subtle shadow
- Hover states: border-color transition 150ms
- Focus rings: 2px offset, accent color
- Animations: 200ms ease-out default
- Glassmorphism on modals: backdrop-blur(12px)

### Components

**Navigation Sidebar:**
- Logo at top
- Icon + label nav items
- Active state: accent bg, white text
- Collapse toggle at bottom

**Top Header:**
- Global search (cmd+k)
- Notification bell with badge
- User avatar dropdown

**Data Tables:**
- Sortable columns
- Row hover highlight
- Bulk selection checkboxes
- Pagination controls

**Cards:**
- Stat cards with icon, value, label, trend indicator
- Project cards with thumbnail, progress bar, key metrics

**Forms:**
- Floating labels
- Inline validation
- Error states with red border + message

**Modals:**
- Centered with backdrop blur
- Close on escape and backdrop click
- Smooth scale-in animation

**Charts:**
- Consistent color scheme matching brand
- Tooltips on hover
- Legend below chart

---

## 5. Functionality Specification

### Authentication & Authorization

**Features:**
- Email/password login
- Password reset flow
- Role-based access control (Admin, Manager, Sales, Finance, Client)

**Roles & Permissions:**
| Feature | Admin | Manager | Sales | Finance | Client |
|---------|-------|---------|-------|---------|--------|
| All Projects | ✓ | ✓ | Assigned | ✓ | Own |
| All Leads | ✓ | ✓ | Assigned | - | - |
| Create/Edit Projects | ✓ | ✓ | - | - | - |
| Financial Reports | ✓ | ✓ | - | ✓ | - |
| Manage Team | ✓ | - | - | - | - |
| Client Portal | - | - | - | - | ✓ |

### Dashboard

**Widgets:**
1. **KPI Stats Row:**
   - Total Revenue (with trend)
   - Active Leads
   - Units Sold / Total Units
   - Projects In Progress

2. **Sales Pipeline Chart:**
   - Funnel visualization
   - Conversion rates per stage

3. **Recent Activity Feed:**
   - New leads, sales, payments
   - Timestamp + user

4. **Top Projects Table:**
   - Project name, progress, revenue

5. **Upcoming Milestones:**
   - Next 5 project deadlines

### Projects Module

**Project List:**
- Grid/List view toggle
- Filter by status (Planning, In Progress, Completed, On Hold)
- Sort by name, start date, revenue

**Project Details:**
- Header: Name, status badge, location, dates
- Tabs: Overview, Units, Leads, Documents, Finances, Milestones

**Project Fields:**
- Name, description
- Location (address)
- Type (Residential, Commercial, Mixed-use)
- Status
- Start date, End date (planned & actual)
- Total budget, spent, remaining
- Thumbnail image

**Milestones:**
- Name, target date, status
- Dependencies
- Progress percentage

### Inventory/Units Module

**Unit Management:**
- Per-project unit list
- Unit types (Studio, 1BR, 2BR, 3BR, Penthouse, Villa)
- Floor, unit number
- Status (Available, Reserved, Sold, Blocked)
- Price, size (sqft), bedrooms, bathrooms
- Features/tags

**Inventory Views:**
- Grid view (visual floor plan style)
- Table view with filters
- Availability calendar

### Leads/Contacts Module

**Lead Pipeline:**
- Kanban board view (default)
- Table view option
- Pipeline stages: New, Contacted, Qualified, Negotiation, Won, Lost

**Lead Fields:**
- Name, email, phone
- Source (Website, Referral, Agent, Advertisement, Other)
- Budget range
- Preferred project, unit type
- Assigned agent
- Notes timeline
- Tags

**Contact Management:**
- Separate from leads
- Buyers, Investors, Partners, Vendors
- Full contact history

### Documents Module

**Features:**
- Folder structure per project
- Upload (drag & drop)
- Preview (PDF, images)
- Version history
- Share links (external access)
- Tags and search

**Document Types:**
- Contracts
- Permits
- Blueprints
- Financial documents
- Marketing materials

### Finances Module

**Features:**
- Income tracking (sales, deposits)
- Expense tracking (construction, permits, marketing)
- Payment schedules
- Installment tracking

**Reports:**
- Project P&L
- Cash flow
- Revenue by project
- Outstanding payments

**Per Unit:**
- Total price
- Payment history
- Outstanding balance

### Client Portal

**For Buyers:**
- View purchased unit details
- Payment schedule & history
- Download contracts
- Project updates/announcements
- Communication with developer

### Settings

- Company profile
- Team management (invite, roles)
- Pipeline stages customization
- Email templates
- Integrations (future)

---

## 6. Data Model

### Core Entities

```
User
- id, email, password_hash, name, role, avatar_url, created_at

Project
- id, name, description, location, type, status, start_date, end_date
- actual_end_date, budget, spent, thumbnail_url, created_by

Unit
- id, project_id, unit_number, floor, type, bedrooms, bathrooms
- size_sqft, price, status, features (JSON), created_at

Lead
- id, name, email, phone, source, budget_min, budget_max
- project_interest, unit_type_interest, assigned_to, stage
- created_at, converted_at

Contact
- id, type (Buyer, Investor, Partner, Vendor)
- user_id (if portal access), company, name, email, phone
- address, notes

UnitSale
- id, unit_id, lead_id, sale_price, discount, status
- contract_date, expected_completion

Payment
- id, unit_sale_id, amount, due_date, paid_date
- method, reference, status

Document
- id, project_id, name, type, file_url, size, uploaded_by
- version, tags, created_at

Milestone
- id, project_id, name, target_date, completed_date
- status, progress, dependencies (JSON)
```

---

## 7. Page Structure

```
/                       → Redirect to /dashboard
/login                  → Login page
/forgot-password        → Password reset
/dashboard              → Main dashboard

/projects               → Project list
/projects/new           → Create project
/projects/[id]          → Project details

/inventory              → All units across projects
/projects/[id]/units    → Units for specific project

/leads                  → Lead pipeline
/leads/[id]             → Lead details

/contacts               → Contact directory

/documents              → Document hub

/finances               → Financial overview
/finances/reports       → Reports

/settings               → Settings
/settings/team          → Team management
```

---

## 8. Acceptance Criteria

### Authentication
- [ ] User can register and login
- [ ] Protected routes redirect to login
- [ ] Role-based UI shows/hides features

### Dashboard
- [ ] Shows KPI cards with real data
- [ ] Activity feed updates in real-time
- [ ] Charts render correctly

### Projects
- [ ] Can create, edit, delete projects
- [ ] Project progress calculates correctly
- [ ] Milestones can be added and tracked

### Units
- [ ] Can add units to projects
- [ ] Status changes reflect immediately
- [ ] Grid view shows visual floor plan

### Leads
- [ ] Kanban drag-and-drop works
- [ ] Stage changes persist
- [ ] Lead can be converted to sale

### Finances
- [ ] Payments link to units correctly
- [ ] Outstanding balance calculates
- [ ] Reports show accurate data

### Performance
- [ ] Page loads under 2 seconds
- [ ] Smooth animations (60fps)
- [ ] No console errors
