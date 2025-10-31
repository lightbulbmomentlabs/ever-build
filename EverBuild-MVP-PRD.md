# EverBuild MVP - Product Requirements Document

**Version:** 1.0 (MVP)  
**Last Updated:** October 24, 2025  
**Status:** Ready for Development  
**Target Completion:** ASAP

---

## Executive Summary

This MVP PRD defines the **minimum viable product** for EverBuild - a streamlined version focused on helping spec-home builders get started quickly and experience immediate value. The MVP prioritizes the core builder experience: setting up an account, creating their first project, managing contacts, and building a basic timeline.

**MVP Goal:** Validate that builders can successfully onboard themselves and set up a project in under 15 minutes, proving the app's "stupid-simple" promise.

**What's IN the MVP:**
- ✅ User authentication and account setup
- ✅ Organization/company profile
- ✅ Contact (subcontractor/vendor) management
- ✅ Project creation with basic details
- ✅ Phase timeline creation and management
- ✅ Assigning contacts to phases
- ✅ Simple dashboard showing active projects
- ✅ Manual SMS sending (via Twilio)

**What's OUT of the MVP (Future Phases):**
- ❌ Automated scheduled notifications
- ❌ Real-time timeline adjustments
- ❌ Public status update forms for subs
- ❌ Document management
- ❌ Advanced reporting and analytics
- ❌ Multi-user/team collaboration
- ❌ Audit logs
- ❌ Payment/subscription system (build first, monetize later)

---

## Why This MVP Scope?

### Learning Objectives

This MVP is designed to validate three critical assumptions:

1. **Onboarding Simplicity:** Can builders set up their account and first project in 15 minutes or less?
2. **Data Structure:** Does our project → phases → contacts model match how builders think about their work?
3. **Core Workflow:** Will builders find value in centralizing their project data, even without automation?

### Value Without Automation

Even without automated notifications, this MVP provides immediate value:
- **Single source of truth** for all projects and contacts
- **Visual timeline** that's easier than spreadsheets
- **Quick access** to sub/vendor info from phone
- **Manual SMS** capability (they're doing this anyway, but now with context)

Once builders adopt the tool for basic organization, we can layer in automation in Phase 2.

---

## Target User for MVP

**Primary:** The Builder/General Contractor

We're focusing exclusively on the builder's experience for the MVP. Subcontractor features (status updates) and team collaboration (foreman access) come in later phases.

**Success Scenario:**
- Builder signs up
- Adds their regular subs/vendors (10-20 contacts)
- Creates their first active project
- Breaks it into phases
- Assigns contacts to phases
- Views everything on a dashboard
- Sends a manual text to a sub about an upcoming phase

**Time to value:** Under 30 minutes from signup to first useful action

---

## Technical Stack (MVP)

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context (keep it simple)

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for profile images only in MVP)
- **API:** Next.js API Routes / Server Actions

### Authentication
- **Provider:** Clerk
- **MVP Needs:**
  - Email/password signup
  - Google OAuth (optional but nice to have)
  - Basic user profile

### Communications
- **SMS Provider:** Twilio
- **MVP Scope:** Manual SMS sending only (one-off messages to contacts)
- **No automated scheduling** (that's Phase 2)

### Hosting
- **Platform:** Digital OCean
- **Environments:** Production, Development (no staging needed for MVP)

### Monitoring (Minimal)
- **Errors:** Digital Ocean built-in error tracking
- **Analytics:** Digital Ocean Analytics (simple page views)
- **No complex analytics** until we have users

---

## Core Features (MVP)

### Feature 1: User Authentication & Onboarding

#### Description
Frictionless signup flow that gets builders into the app and productive within minutes.

#### User Flow
1. User lands on signup page. This needs to be password protected so only admin can access while in private beta. Same for Sign-in page.
2. Chooses signup method (email/password or Google)
3. Enters basic info:
   - Full name
   - Company name
   - Phone number (for their own SMS sending)
4. Brief welcome screen: "Let's get you set up in 3 steps"
5. Redirects to dashboard with empty state

#### Acceptance Criteria
- Signup completes in under 2 minutes
- User sees personalized welcome message with company name
- Clerk session persists across page refreshes
- Mobile-responsive signup forms

#### Technical Implementation
- Clerk handles authentication (use Clerk Components)
- After Clerk signup, create user record in Supabase via API route:
  ```typescript
  // /api/user/create
  POST {
    clerk_user_id: string
    email: string
    full_name: string
    company_name: string
    phone: string
  }
  ```
- Store in `users` table (see data model below)

#### UI Components Needed
- SignUp page component
- Welcome modal/screen
- Loading states

---

### Feature 2: Contact Management (Mini-CRM)

#### Description
Centralized directory where builders store all their subcontractor and vendor information. This is foundational - builders need contacts before they can assign them to projects.

#### User Flow - Adding Contacts
1. From dashboard, click "Contacts" in navigation
2. Clicks "Add Contact" button
3. Fills in form:
   - **Required:**
     - Company name
     - Contact person name
     - Trade/specialty (dropdown + custom)
     - Phone number
   - **Optional:**
     - Email
     - Secondary phone
     - Lead time (how many days' notice they need)
     - Notes
4. Saves contact
5. Sees contact in list view

#### User Flow - Managing Contacts
- **List view:** Shows all contacts with search and filter
  - Filter by trade (Plumbing, Electrical, Framing, etc.)
  - Search by name or company
- **Detail view:** Click contact to see full info and edit
- **Quick actions:** Call, text, edit, archive
- **Import (Phase 2):** CSV upload for bulk adding

#### Acceptance Criteria
- Can add unlimited contacts
- Phone number validation (US format)
- Contacts appear instantly after saving (optimistic UI)
- Can edit and archive contacts (soft delete)
- Search returns results as user types (debounced)
- Mobile-optimized (large touch targets for call/text)

#### Technical Implementation

**API Routes:**
```typescript
// /api/contacts
GET    - List all contacts for user's organization
POST   - Create new contact

// /api/contacts/[id]
GET    - Get single contact
PATCH  - Update contact
DELETE - Archive contact (soft delete)
```

**Database Schema:**
```sql
contacts (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  trade TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  lead_time_days INTEGER DEFAULT 2,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**UI Components:**
- ContactList (table/card view)
- ContactForm (add/edit modal)
- ContactDetail (sidebar or full page)
- ContactFilters (trade dropdown, search input)
- Trade selector (preset options + custom)

**Preset Trades:**
- Excavation
- Foundation
- Framing
- Roofing
- Plumbing
- Electrical
- HVAC
- Insulation
- Drywall
- Painting
- Flooring
- Cabinets
- Countertops
- Trim/Finish Carpentry
- Landscaping
- Inspector
- Material Supplier
- Other (custom)

---

### Feature 3: Project Creation & Management

#### Description
Builders create projects (spec homes) with basic information. Each project is a container for phases, contacts, and (eventually) documents.

#### User Flow - Creating a Project
1. From dashboard, clicks "New Project"
2. Fills in project details form:
   - **Required:**
     - Project name (e.g., "123 Oak Street" or "Lot 15 - Oakwood")
     - Address (street, city, state, zip)
     - Target completion date
   - **Optional:**
     - Lot number
     - Model/plan type
     - Square footage
     - Notes
3. Chooses setup method:
   - **Option A:** "Use Template" (shows preset phase templates)
   - **Option B:** "Start from Scratch" (empty project)
4. Saves project
5. Redirects to project detail view

#### User Flow - Project Templates (MVP: 1-2 templates)

**Template 1: Standard 65-Day Spec Home**
Pre-populated with typical phases:
1. Permitting (14 days)
2. Site Prep (3 days)
3. Foundation (7 days)
4. Foundation Inspection (1 day)
5. Framing (10 days)
6. Framing Inspection (1 day)
7. Rough-In (Plumbing, Electrical, HVAC) (5 days)
8. Rough-In Inspection (1 day)
9. Insulation (2 days)
10. Drywall (5 days)
11. Interior Trim (5 days)
12. Painting (4 days)
13. Flooring (3 days)
14. Cabinets & Countertops (3 days)
15. Fixtures & Final (2 days)
16. Final Inspection (1 day)

Builder can then customize dates and phases.

**Template 2: Custom** (start from scratch)

#### User Flow - Managing Projects
- **List view:** Dashboard shows all projects as cards
  - Status: Active, Completed, On Hold
  - Current phase
  - Days remaining until target completion
- **Detail view:** Full project page
  - Project info at top
  - Phase timeline below
  - Quick edit project details
- **Archive:** Mark project as completed (soft delete)

#### Acceptance Criteria
- Project creation takes under 5 minutes
- Template applies phases automatically with sequential dates
- Can edit project details after creation
- Projects appear on dashboard immediately
- Can have unlimited active projects (no tier limits in MVP)

#### Technical Implementation

**API Routes:**
```typescript
// /api/projects
GET    - List all projects for organization
POST   - Create new project

// /api/projects/[id]
GET    - Get project details with phases
PATCH  - Update project info
DELETE - Archive project

// /api/projects/templates
GET    - List available templates
```

**Database Schema:**
```sql
projects (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lot_number TEXT,
  model_type TEXT,
  square_footage INTEGER,
  status TEXT DEFAULT 'active', -- active, completed, on_hold
  target_completion_date DATE NOT NULL,
  actual_completion_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**UI Components:**
- ProjectList (dashboard cards)
- ProjectForm (modal/page)
- ProjectDetail (full page with tabs)
- TemplateSelector (modal with template cards)
- ProjectCard (dashboard component)

---

### Feature 4: Phase Timeline Management

#### Description
The heart of EverBuild. Builders break projects into phases (stages of construction), set dates, and define the sequence. This is the foundation for all future automation.

#### User Flow - Adding Phases
1. In project detail view, sees "Timeline" tab
2. If using template, phases are pre-populated (can edit)
3. If starting from scratch, clicks "Add Phase"
4. Fills in phase form:
   - **Required:**
     - Phase name
     - Planned start date
     - Planned duration (in days)
   - **Optional:**
     - Description
     - Depends on (which phase must finish before this one starts)
     - Buffer days (padding before next phase)
5. Saves phase
6. Phase appears in timeline visualization

#### User Flow - Managing Phases
- **Timeline view:** Visual representation of all phases
  - Horizontal bars showing duration
  - Color coding by status (not started, in progress, completed)
  - Dependencies shown with arrows/lines
- **List view:** Table of all phases
  - Columns: Name, Start, End, Duration, Status, Assigned Contacts
  - Sortable and filterable
- **Edit phases:** 
  - Click to edit dates, duration, dependencies
  - Drag to reorder (sequence)
  - Delete phases (with confirmation)

#### Phase Statuses (MVP)
- Not Started (gray)
- In Progress (blue)
- Completed (green)
- Delayed (yellow) - manual flag only in MVP

#### Acceptance Criteria
- Can add unlimited phases per project
- Phase dates calculate automatically (start + duration = end)
- Can set phase dependencies (one phase must complete before another starts)
- Timeline visualization is clear and readable on mobile
- Changes save immediately (optimistic UI)

#### Technical Implementation

**API Routes:**
```typescript
// /api/projects/[projectId]/phases
GET    - List all phases for project
POST   - Create new phase

// /api/phases/[id]
GET    - Get phase details
PATCH  - Update phase (dates, status, etc.)
DELETE - Delete phase
```

**Database Schema:**
```sql
phases (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  planned_start_date DATE NOT NULL,
  planned_duration_days INTEGER NOT NULL,
  planned_end_date DATE NOT NULL, -- calculated: start + duration
  actual_start_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed, delayed
  predecessor_phase_id UUID REFERENCES phases(id), -- dependency
  buffer_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Timeline Calculation Logic:**
- When adding/editing a phase:
  1. Calculate end_date = start_date + duration_days
  2. If predecessor_phase_id is set:
     - This phase can't start until predecessor is complete
     - Validate that start_date >= predecessor.end_date + buffer_days
  3. Re-sequence phases if order changes

**UI Components:**
- PhaseTimeline (visual timeline - can use a library or build simple version)
- PhaseList (table view)
- PhaseForm (add/edit modal)
- PhaseCard (summary card)
- DependencySelector (dropdown of available phases)

**Timeline Visualization Options:**
- **MVP Simple:** Horizontal bars with CSS (no fancy Gantt library)
- **Phase 2:** Use react-gantt-chart or similar for drag-drop

---

### Feature 5: Assigning Contacts to Phases

#### Description
The connection between phases and contacts. Builders assign subcontractors/vendors to specific phases so they know who's responsible for what work.

#### User Flow
1. In phase detail or edit view, sees "Assigned Contacts" section
2. Clicks "Assign Contact"
3. Searches/selects from contact list (filtered by relevant trades)
4. Optionally sets:
   - Role (e.g., "Lead", "Helper", "Material Supplier")
   - Notification advance (how many days before phase start to notify) - stored but not used in MVP
5. Contact is assigned to phase
6. Can assign multiple contacts to one phase
7. Can remove contact assignments

#### Display
- In phase view, see all assigned contacts with call/text quick actions
- In contact view, see all phases they're assigned to across projects

#### Acceptance Criteria
- Can assign unlimited contacts to a phase
- Can assign same contact to multiple phases
- Search filters contacts by trade for easier selection
- Quick actions (call/text) work from phase view
- Removing assignment doesn't delete the contact

#### Technical Implementation

**API Routes:**
```typescript
// /api/phases/[phaseId]/contacts
GET    - List contacts assigned to phase
POST   - Assign contact to phase
DELETE - Remove contact from phase
```

**Database Schema:**
```sql
phase_contacts (
  id UUID PRIMARY KEY,
  phase_id UUID REFERENCES phases(id),
  contact_id UUID REFERENCES contacts(id),
  role TEXT, -- "Lead", "Helper", "Material Supplier", etc.
  notification_advance_days INTEGER DEFAULT 2, -- for future use
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(phase_id, contact_id) -- can't assign same contact twice to same phase
)
```

**UI Components:**
- ContactAssignment (modal/inline)
- ContactSelector (searchable dropdown)
- AssignedContactsList (chips or list)
- QuickActions (call/text buttons)

---

### Feature 6: Dashboard

#### Description
Home screen that gives builders an at-a-glance view of all their projects and what needs attention.

#### Layout

**Top Section: Summary Stats**
- Total active projects
- Projects on track
- Projects delayed (manual flag only in MVP)

**Main Section: Project Cards**
Each card shows:
- Project name and address
- Current phase (name and dates)
- Progress bar (phases completed / total phases)
- Status indicator (on track, delayed, not started)
- Quick actions:
  - "View Project" button
  - Archive/complete button

**Empty State** (for new users):
- Friendly illustration
- "Welcome to EverBuild! Let's create your first project."
- Big "Create Project" button
- Secondary "Import Contacts" button

#### Filters/Views
- All Projects (default)
- Active Only
- Completed
- Sort by: Target completion date, Name, Recently updated

#### Acceptance Criteria
- Dashboard loads in under 2 seconds
- Shows up to 50 projects without performance issues
- Responsive on mobile (cards stack vertically)
- Empty state is encouraging and clear
- Real-time updates (if viewing dashboard while editing project)

#### Technical Implementation

**API Routes:**
```typescript
// /api/dashboard
GET - Get summary data for dashboard
  Returns:
  - stats: { total_projects, active_projects, completed_projects }
  - projects: [{ id, name, address, current_phase, progress, status, ... }]
```

**Query Optimization:**
- Use Supabase view or computed fields for efficient aggregation
- Cache dashboard data for 5 minutes (SWR or React Query)

**UI Components:**
- Dashboard (main page)
- SummaryStats (stat cards at top)
- ProjectCard (individual project card)
- EmptyState (for new users)
- ProjectFilters (filter/sort controls)

---

### Feature 7: Manual SMS Sending

#### Description
Builders can send manual text messages to contacts directly from the app. This provides immediate utility even without automation, and lets us test Twilio integration.

#### User Flow
1. From contact detail or phase view, clicks "Send Text"
2. Modal opens with:
   - To: Contact name and phone (pre-filled)
   - Message: Text area for message
   - Template suggestions (optional):
     - "Hi [Name], just confirming you're scheduled for [Phase] at [Address] on [Date]. Let me know if you have any questions."
     - "Quick update: [Phase] at [Address] has been pushed back to [Date]. New start time is [Time]."
     - Custom message
3. Previews message character count
4. Clicks "Send"
5. Confirmation: "Message sent to [Name]"
6. Message is logged (for MVP: just in database, no UI to view history yet)

#### Acceptance Criteria
- SMS sends successfully via Twilio
- Character count shows (160 chars = 1 SMS, warn if over)
- Message templates save time
- Can't send empty messages
- Error handling if SMS fails (show user error message)
- Logged in database for future reference

#### Technical Implementation

**API Routes:**
```typescript
// /api/sms/send
POST {
  to_phone: string,
  message: string,
  contact_id: UUID,
  project_id: UUID (optional),
  phase_id: UUID (optional)
}
```

**Twilio Integration:**
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: message,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: to_phone
});
```

**Database Schema:**
```sql
sms_messages (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  phase_id UUID REFERENCES phases(id),
  to_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  twilio_sid TEXT, -- Twilio message ID
  status TEXT, -- sent, delivered, failed
  error_message TEXT
)
```

**UI Components:**
- SendSMSModal (form to compose and send)
- MessageTemplates (predefined messages)
- CharacterCounter (show count as user types)

**Twilio Setup:**
- Create Twilio account
- Purchase phone number
- Set up credentials in environment variables
- In Phase 2, set up webhooks for delivery status

---

### Feature 8: Navigation & Layout

#### Description
Clean, intuitive navigation that makes it easy to move between sections of the app.

#### Layout Structure

**Main Navigation (Sidebar on desktop, bottom nav on mobile):**
- Dashboard (home icon)
- Projects (folder icon)
- Contacts (users icon)
- Settings (gear icon)

**Top Bar:**
- Company logo/name
- User menu (profile, sign out)
- (Future: Notifications icon)

**Project Context:**
When viewing a project, show:
- Breadcrumb: Dashboard > Projects > [Project Name]
- Tabs within project:
  - Overview
  - Timeline
  - Contacts
  - (Future: Documents, History)

#### Mobile Considerations
- Bottom navigation bar (Dashboard, Projects, Contacts, Menu)
- Hamburger menu for Settings and other options
- Swipe gestures (nice to have)

#### Acceptance Criteria
- Navigation is consistent across all pages
- Active page is clearly highlighted
- Breadcrumbs help user understand location
- Mobile navigation accessible with thumbs

#### Technical Implementation

**UI Components:**
- Layout (wrapper with navigation)
- Sidebar (desktop nav)
- BottomNav (mobile nav)
- TopBar (user menu and context)
- Breadcrumbs (navigation trail)

**Routing Structure:**
```
/                          → Dashboard
/projects                  → Projects list (same as dashboard for MVP)
/projects/new              → Create project
/projects/[id]             → Project detail (overview tab)
/projects/[id]/timeline    → Project timeline
/projects/[id]/contacts    → Project contacts
/contacts                  → Contacts list
/contacts/new              → Add contact
/contacts/[id]             → Contact detail
/settings                  → Settings
/settings/profile          → User profile
/settings/company          → Company settings
```

---

## Data Model (MVP)

### Core Tables

```sql
-- Organizations (companies)
organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Users (builders)
users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Contacts (subcontractors, vendors)
contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  trade TEXT NOT NULL,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT,
  email TEXT,
  lead_time_days INTEGER DEFAULT 2,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Projects (spec homes)
projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lot_number TEXT,
  model_type TEXT,
  square_footage INTEGER,
  status TEXT DEFAULT 'active',
  target_completion_date DATE NOT NULL,
  actual_completion_date DATE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Phases (construction stages)
phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER NOT NULL,
  planned_start_date DATE NOT NULL,
  planned_duration_days INTEGER NOT NULL,
  planned_end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  status TEXT DEFAULT 'not_started',
  predecessor_phase_id UUID REFERENCES phases(id),
  buffer_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Phase-Contact assignments
phase_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID REFERENCES phases(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role TEXT,
  notification_advance_days INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phase_id, contact_id)
)

-- SMS Messages (for manual sending)
sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  project_id UUID REFERENCES projects(id),
  phase_id UUID REFERENCES phases(id),
  to_phone TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  twilio_sid TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT
)
```

### Indexes (for performance)

```sql
-- Users
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_users_org ON users(organization_id);

-- Contacts
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_trade ON contacts(trade);
CREATE INDEX idx_contacts_active ON contacts(is_active);

-- Projects
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Phases
CREATE INDEX idx_phases_project ON phases(project_id);
CREATE INDEX idx_phases_sequence ON phases(sequence_order);

-- Phase Contacts
CREATE INDEX idx_phase_contacts_phase ON phase_contacts(phase_id);
CREATE INDEX idx_phase_contacts_contact ON phase_contacts(contact_id);
```

### Row Level Security (RLS)

Enable RLS on all tables to ensure users only see their organization's data:

```sql
-- Example for contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's contacts"
  ON contacts FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE clerk_user_id = auth.uid()
  ));

CREATE POLICY "Users can create contacts in their org"
  ON contacts FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE clerk_user_id = auth.uid()
  ));

-- Similar policies for UPDATE and DELETE
```

---

## User Flows (MVP)

### Flow 1: First-Time User Setup

1. **Sign Up**
   - User visits everbuild.app
   - Clicks "Sign Up"
   - Enters email, password, name, company name, phone
   - Clerk creates account
   - API creates user + organization in Supabase
   - Redirects to dashboard

2. **Welcome Tour (Optional)**
   - Modal appears: "Welcome! Let's get you started in 3 steps"
   - Step 1: Add your first contact
   - Step 2: Create your first project
   - Step 3: Set up your timeline
   - User can skip or follow tour

3. **Add Contacts**
   - Clicks "Contacts" in nav
   - Sees empty state: "Add your subcontractors and vendors"
   - Clicks "Add Contact"
   - Fills in form (company, name, trade, phone)
   - Saves
   - Repeats for 5-10 key contacts

4. **Create First Project**
   - Clicks "New Project" from dashboard
   - Fills in project details (name, address, target date)
   - Chooses template: "Standard 65-Day Spec Home"
   - Template creates project with 16 phases
   - Redirects to project timeline

5. **Assign Contacts to Phases**
   - Views timeline, sees all phases
   - Clicks first phase: "Site Prep"
   - Clicks "Assign Contact"
   - Selects excavation contractor from list
   - Repeats for key phases
   - Dashboard now shows project with progress

**Success:** User has a functional project setup in under 20 minutes.

---

### Flow 2: Daily Usage - Checking Schedule

1. **Morning Check**
   - Builder opens app on phone
   - Dashboard shows 3 active projects
   - Sees "Framing" phase starts today on Project A
   - Clicks project card

2. **View Phase Details**
   - Sees "Framing" phase in progress
   - Assigned contact: "Smith Framing, John Smith"
   - Calls or texts directly from app: "Hey John, ready to start today?"
   - John confirms via text reply

3. **Update Status**
   - Builder marks phase "In Progress" (manual toggle)
   - Checks next phase: "Framing Inspection" scheduled in 10 days
   - Makes note to schedule inspector

**Value:** Quick visibility into what's happening today without digging through spreadsheets.

---

### Flow 3: Adjusting Schedule

1. **Delay Occurs**
   - Plumbing phase takes 2 extra days due to permit issue
   - Builder opens project, goes to "Plumbing Rough-In" phase
   - Edits end date (pushes out 2 days)
   - Saves

2. **Manual Coordination** (MVP - no automation yet)
   - Builder sees next phase is "Electrical Rough-In"
   - Clicks assigned contact: "ABC Electric, Mike"
   - Clicks "Send Text"
   - Template: "Hi Mike, heads up - electrical start is pushed to [new date] due to permit delay."
   - Sends SMS

3. **Future** (Phase 2)
   - System automatically adjusts dependent phases
   - Sends notifications to all affected subs
   - Builder just reviews and approves

**Value:** Even without automation, having all contacts and schedules in one place speeds up coordination.

---

## Non-Functional Requirements (MVP)

### Performance
- Page load: < 3 seconds on 3G mobile
- API response: < 1 second for standard queries
- Can handle 100 active projects per organization without slowdown

### Reliability
- 99% uptime (using Digital Ocean and Supabase's infrastructure)
- Daily automated database backups (Supabase handles this)

### Security
- HTTPS only
- Clerk handles authentication securely
- Supabase RLS enforces data isolation
- Input validation on all forms
- No sensitive data in URLs

### Accessibility
- WCAG 2.1 AA compliance (basics)
- Keyboard navigation works
- Screen reader compatible (test with VoiceOver/NVDA)
- Color contrast meets standards
- Touch targets minimum 44x44px on mobile

### Browser Support
- Chrome, Safari, Firefox, Edge (last 2 versions)
- iOS Safari 14+
- Android Chrome 10+

### Mobile
- Fully responsive design
- Works well on screens as small as 375px wide (iPhone SE)
- Touch-optimized buttons and forms
- No horizontal scrolling

---

## Implementation Plan

### Week 1: Foundation
**Goal:** Authentication and basic structure

**Tasks:**
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure Clerk authentication
- [ ] Set up Supabase project and database
- [ ] Create database schema (run SQL migrations)
- [ ] Build main layout and navigation
- [ ] Implement sign up / sign in flows
- [ ] Create organization on user signup

**Deliverable:** Users can sign up and see empty dashboard

---

### Week 2: Contact Management
**Goal:** Builders can add and manage contacts

**Tasks:**
- [ ] Build Contacts page (list view)
- [ ] Create ContactForm component (add/edit)
- [ ] Implement contact CRUD API routes
- [ ] Add search and filter functionality
- [ ] Build contact detail view
- [ ] Add phone/email validation
- [ ] Implement archive functionality
- [ ] Mobile optimization

**Deliverable:** Fully functional contact management

---

### Week 3: Projects & Phases
**Goal:** Builders can create projects and timelines

**Tasks:**
- [ ] Build project creation flow
- [ ] Create phase templates (65-day spec home)
- [ ] Implement project CRUD API routes
- [ ] Build timeline visualization (simple horizontal bars)
- [ ] Create phase add/edit functionality
- [ ] Implement phase status updates
- [ ] Calculate phase end dates automatically
- [ ] Add phase dependencies (basic)

**Deliverable:** Projects with timelines functional

---

### Week 4: Assignment & Integration
**Goal:** Connect contacts to phases, add SMS

**Tasks:**
- [ ] Build contact assignment to phases
- [ ] Create junction table and API routes
- [ ] Show assigned contacts in phase view
- [ ] Show phases in contact view
- [ ] Set up Twilio account
- [ ] Implement manual SMS sending
- [ ] Build SendSMS modal with templates
- [ ] Add quick actions (call/text buttons)

**Deliverable:** End-to-end workflow complete

---

### Week 5: Dashboard & Polish
**Goal:** Great first impression and usability

**Tasks:**
- [ ] Build dashboard with project cards
- [ ] Calculate and display progress metrics
- [ ] Create empty states for new users
- [ ] Add loading states everywhere
- [ ] Implement error handling and messages
- [ ] Optimize performance (lazy loading, caching)
- [ ] Mobile testing and fixes
- [ ] Accessibility audit and fixes

**Deliverable:** Polished, production-ready MVP

---

### Week 6: Testing & Launch Prep
**Goal:** Ready for first users

**Tasks:**
- [ ] End-to-end testing of all flows
- [ ] Fix bugs from testing
- [ ] Write basic documentation / help content
- [ ] Set up error monitoring (Sentry optional)
- [ ] Create onboarding materials (welcome email, tooltips)
- [ ] Deploy to production
- [ ] Invite 5-10 beta testers
- [ ] Set up feedback collection

**Deliverable:** MVP live with beta users

---

## Success Metrics (MVP)

### Onboarding Metrics
- **Time to first project:** < 15 minutes average
- **Completion rate:** 80%+ of signups create at least 1 project
- **Contact creation:** Average 8+ contacts added per user

### Engagement Metrics
- **Daily active users:** 50%+ of users use app at least 3x/week
- **Projects created:** Average 2-3 per user in first month
- **SMS sent:** Average 5+ messages per user per week

### Qualitative Feedback
- **User interviews:** Conduct 10+ interviews with beta users
- **NPS score:** Target 40+ (good for early product)
- **Feature requests:** Document top 10 most requested features
- **Pain points:** Identify top 3 friction points in current flow

### Technical Metrics
- **Page load time:** < 3 seconds p95
- **API response time:** < 1 second p95
- **Error rate:** < 1% of requests
- **Uptime:** 99%+

---

## What's Next After MVP?

### Phase 2: Automation (Weeks 7-10)
**Goal:** Automate notifications and schedule adjustments

**New Features:**
- Automated scheduled SMS notifications (2 days before phase starts)
- Public status update forms (no-login for subs)
- Real-time timeline adjustments based on status updates
- Notification delivery tracking
- Communication log/history

**Value:** This is where the magic happens. Builders stop manually coordinating and let the system handle it.

---

### Phase 3: Team & Documents (Weeks 11-14)
**Goal:** Enable collaboration and document management

**New Features:**
- Multi-user support (invite foreman, add team members)
- Role-based permissions (admin, project manager, foreman)
- Document upload and storage
- Phase-specific document attachments
- Document preview and sharing

**Value:** Full team can use the app, and documents are centralized.

---

### Phase 4: Analytics & Monetization (Weeks 15-18)
**Goal:** Insights and revenue

**New Features:**
- Advanced reporting (project analytics, delay trends)
- Audit log and detailed history
- Stripe integration for subscriptions
- Subscription tiers (Starter, Professional, Business)
- Custom branding (Business tier)
- Export functionality (CSV, PDF reports)

**Value:** Builders get insights to improve, we generate revenue.

---

## Development Guidelines

### Code Standards
- **TypeScript:** Use strict mode, type everything
- **Components:** Functional components with hooks
- **Naming:** Descriptive names (no abbreviations)
- **File structure:** Co-locate related files
- **Comments:** Explain why, not what

### Best Practices
- **Mobile-first:** Design for mobile, enhance for desktop
- **Accessibility:** Use semantic HTML, ARIA labels
- **Error handling:** Always handle errors gracefully
- **Loading states:** Show loading indicators for async actions
- **Optimistic UI:** Update UI immediately, rollback on error
- **Form validation:** Client-side and server-side validation

### Testing Strategy (MVP - Minimal)
- **Manual testing:** Test all flows on multiple devices
- **Browser testing:** Chrome, Safari, Firefox, mobile browsers
- **User testing:** Have 3-5 beta users test before wider release
- **No automated tests yet** (add in Phase 2 as app stabilizes)

---

## MVP Constraints & Trade-offs

### What We're NOT Building (Yet)

**1. Automated Notifications**
- Why: Complex scheduling logic, need to validate data model first
- Workaround: Manual SMS still saves time vs. phone calls

**2. Status Update Forms for Subs**
- Why: Need MVP to validate that builders will actually use the system
- Workaround: Subs can text back manually, builder updates status

**3. Document Management**
- Why: File storage and permissions are complex
- Workaround: Builders can text photos via SMS for now

**4. Team Collaboration**
- Why: Multi-user with permissions adds complexity
- Workaround: Single user per org, can share login if needed

**5. Advanced Timeline Features**
- Why: Drag-drop timeline, automatic cascade, complex dependencies
- Workaround: Simple manual date editing works for MVP

**6. Reporting & Analytics**
- Why: Need usage data before we know what insights matter
- Workaround: Basic progress indicators on dashboard

**7. Subscription/Payments**
- Why: Need to validate product-market fit first
- Workaround: Free during MVP/beta, add pricing in Phase 4

### Technical Debt We're Accepting
- **No automated tests:** Will add after MVP stabilizes
- **Simple timeline UI:** Will upgrade to proper Gantt chart later
- **No caching strategy:** Will optimize as performance needs arise
- **Minimal error monitoring:** Will add Sentry in Phase 2
- **Basic email notifications:** Will enhance with templates in Phase 2

---

## Risk Mitigation

### Risk 1: Users Don't Complete Setup
**Mitigation:**
- Excellent empty states with clear next steps
- Optional onboarding tour
- Celebrate small wins (e.g., "First contact added! 🎉")
- Keep forms short and simple

### Risk 2: Timeline Visualization Confusing
**Mitigation:**
- User testing before finalizing design
- Multiple view options (timeline, list, calendar)
- Helpful labels and colors
- Video tutorial showing how to use it

### Risk 3: Mobile Experience Poor
**Mitigation:**
- Design mobile-first
- Test on real devices (not just Chrome DevTools)
- Large touch targets (minimum 44x44px)
- Minimize typing required

### Risk 4: Twilio SMS Issues
**Mitigation:**
- Comprehensive error handling
- Show clear error messages to user
- Log all SMS attempts for debugging
- Test with multiple phone carriers

### Risk 5: Data Model Doesn't Fit Real Use Cases
**Mitigation:**
- This is why we're building an MVP!
- User interviews during beta
- Be prepared to pivot data structure in Phase 2
- Keep schema flexible (use JSONB for extra fields)

---

## Testing & Quality Assurance Strategy

### Overview

This MVP includes a comprehensive testing strategy to ensure:
1. **Code Quality**: Catch bugs before they reach production
2. **Regression Prevention**: Ensure new features don't break existing functionality
3. **Confidence in Refactoring**: Make changes safely with test coverage
4. **Documentation**: Tests serve as living documentation of expected behavior

### Test Coverage Requirements

**Minimum Coverage Targets:**
- Business logic functions: 80% coverage
- Critical paths (auth, SMS, data mutations): 100% coverage
- API routes: 100% integration test coverage
- React components: 70% coverage
- Overall codebase: 75% coverage

**Coverage Enforcement:**
- Pre-commit hooks run unit tests
- CI/CD pipeline blocks merges below coverage threshold
- Weekly coverage reports reviewed

### Test Types & Tooling

#### 1. Unit Tests (Vitest)
**Purpose:** Test individual functions and utilities in isolation

**What to test:**
- Date calculation logic (phase end dates, dependencies)
- Validation schemas (Zod validators)
- Utility functions (formatters, parsers)
- Business logic (timeline adjustments, calculations)

**Example:**
```typescript
// tests/unit/utils/date-utils.test.ts
describe('calculatePhaseEndDate', () => {
  it('should add duration days to start date', () => {
    const start = new Date('2025-01-01');
    const duration = 10;
    const end = calculatePhaseEndDate(start, duration);
    expect(end).toEqual(new Date('2025-01-11'));
  });
});
```

#### 2. Integration Tests (Vitest)
**Purpose:** Test API routes and database operations

**What to test:**
- All API route handlers
- Database CRUD operations
- Supabase client operations
- External service integrations (Twilio with test credentials)

**Example:**
```typescript
// tests/integration/api/projects.test.ts
describe('POST /api/projects', () => {
  it('should create project and return 201', async () => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(mockProject),
      headers: { 'Cookie': authCookie }
    });
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.project.name).toBe(mockProject.name);
  });
});
```

#### 3. Component Tests (React Testing Library)
**Purpose:** Test React components in isolation

**What to test:**
- Component rendering with various props
- User interactions (clicks, form submissions)
- Conditional rendering logic
- Accessibility (ARIA labels, keyboard navigation)

**Example:**
```typescript
// tests/components/ContactForm.test.tsx
describe('ContactForm', () => {
  it('should show validation error for invalid phone', async () => {
    render(<ContactForm />);
    const phoneInput = screen.getByLabelText('Phone');
    await userEvent.type(phoneInput, 'invalid');
    await userEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
  });
});
```

#### 4. End-to-End Tests (Playwright)
**Purpose:** Test complete user workflows across the entire application

**What to test:**
- Critical user journeys (signup → create project → add contacts)
- Multi-page workflows
- Authentication flows
- Mobile responsive behavior
- Cross-browser compatibility

**Example:**
```typescript
// tests/e2e/project-creation.spec.ts
test('user can create project with template', async ({ page }) => {
  await page.goto('/projects/new');
  await page.fill('[name="name"]', '123 Oak Street');
  await page.fill('[name="address"]', '123 Oak St');
  await page.click('text=Use Template');
  await page.click('text=Standard 65-Day Spec Home');
  await page.click('button:has-text("Create Project")');
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
  await expect(page.locator('text=Permitting')).toBeVisible();
});
```

### Testing Workflow

#### Daily Development
1. **Watch Mode**: Run unit tests in watch mode during development
   ```bash
   pnpm test:watch
   ```
2. **Quick Feedback**: Tests run on file save
3. **Focused Testing**: Use `.only` to test specific cases during development

#### Pre-Commit
1. **Git Hooks**: Husky runs tests before commit
2. **Linting**: ESLint checks for code quality issues
3. **Type Checking**: TypeScript compiler catches type errors
4. **Fast Tests Only**: Only unit and integration tests (< 30 seconds)

#### Pre-Push
1. **Full Test Suite**: All tests including E2E
2. **Coverage Check**: Verify coverage meets thresholds
3. **Build Validation**: Ensure production build succeeds

#### CI/CD Pipeline
1. **Automated Testing**: All tests run on every PR
2. **Coverage Reports**: Generate and publish coverage reports
3. **Visual Regression**: Capture screenshots for visual diffs (future)
4. **Performance Tests**: Check for performance regressions

### Regression Testing Protocol

**When Adding New Features:**

1. **Pre-Development**
   - Run full test suite to establish baseline
   - Document current coverage percentage
   - Review related features that might be affected

2. **During Development**
   - Write tests for new feature first (TDD approach)
   - Implement feature to pass tests
   - Run affected tests frequently
   - Add tests for edge cases discovered

3. **Post-Development**
   - Run complete test suite
   - Verify no existing tests broken
   - Check coverage hasn't decreased
   - Add regression test for any bugs found
   - Update FEATURE_TESTS.md checklist

4. **Documentation**
   - Document new test cases in FEATURE_TESTS.md
   - Update API documentation if routes changed
   - Add comments explaining complex test scenarios
   - Update KNOWN_ISSUES.md if applicable

### Test Documentation

#### TESTING.md (Root Level)
Comprehensive testing guide including:
- How to run tests locally
- How to write new tests
- Test organization and naming conventions
- Debugging failed tests
- Coverage reporting
- CI/CD integration

#### FEATURE_TESTS.md (Root Level)
Feature-specific test documentation:
- Manual test checklists per feature
- Automated test coverage mapping
- Regression test scenarios
- Edge cases and boundary conditions
- Known limitations

#### KNOWN_ISSUES.md (Root Level)
Track known issues and workarounds:
- Issues discovered in testing
- Temporary workarounds
- Plans for fixes
- Priority and severity
- Affected features

### Manual Testing Checklists

Even with extensive automation, manual testing remains important for:
- User experience validation
- Visual design verification
- Accessibility with real assistive technology
- Mobile device testing (real devices, not just simulators)
- Cross-browser quirks

**Weekly Manual Testing:**
- [ ] Complete signup flow on mobile (iOS/Android)
- [ ] Create project with template on different browsers
- [ ] Add and assign contacts on slow 3G connection
- [ ] Send test SMS and verify receipt
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Verify responsive design breakpoints
- [ ] Check all forms with invalid data
- [ ] Test error states and edge cases

### Accessibility Testing

**Automated (axe-core):**
```typescript
import { axe } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<ContactForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Manual Checklist:**
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators visible and clear
- [ ] ARIA labels present and descriptive
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] Forms have proper labels and error messages
- [ ] Screen reader announces important changes
- [ ] Touch targets minimum 44x44px on mobile

### Performance Testing

**Metrics to Track:**
- Page load time (target: < 2 seconds on 4G)
- Time to Interactive (TTI) (target: < 3 seconds)
- API response time (target: < 500ms p95)
- Database query performance (target: < 100ms)
- Bundle size (target: < 300KB gzipped)

**Tools:**
- Lighthouse CI for page performance
- Chrome DevTools Performance panel
- Supabase Dashboard for query analysis
- Bundle analyzer for JavaScript size

### Security Testing

**Automated Checks:**
- Dependency vulnerability scanning (npm audit)
- OWASP Top 10 checks in code review
- Environment variable leakage prevention

**Manual Security Review:**
- [ ] RLS policies tested for all tables
- [ ] API routes validate user permissions
- [ ] No sensitive data in URLs or logs
- [ ] CSRF protection on state-changing operations
- [ ] Input sanitization on all user inputs
- [ ] Rate limiting on public endpoints

### Bug Tracking & Resolution

**When a Bug is Found:**

1. **Reproduce**: Create minimal reproduction case
2. **Document**: Log in KNOWN_ISSUES.md with steps to reproduce
3. **Test**: Write failing test that exposes the bug
4. **Fix**: Implement fix to make test pass
5. **Verify**: Run full regression suite
6. **Deploy**: Push fix with increased test coverage
7. **Monitor**: Watch error logs for reoccurrence

**Bug Priority Levels:**
- **P0 (Critical)**: App broken, data loss, security issue - fix immediately
- **P1 (High)**: Major feature broken - fix within 24 hours
- **P2 (Medium)**: Feature partially broken - fix within 1 week
- **P3 (Low)**: Minor issue, workaround exists - fix in next sprint

### Test Data Management

**Test Database:**
- Separate test database (Supabase project or local)
- Seed scripts for consistent test data
- Factory functions for creating test objects
- Cleanup after each test run

**Test Fixtures:**
```typescript
// tests/fixtures/project.fixture.ts
export const mockProject = {
  name: 'Test Project',
  address: '123 Test St',
  city: 'Test City',
  state: 'TX',
  zip_code: '12345',
  target_completion_date: '2025-12-31'
};
```

### Continuous Improvement

**Weekly Review:**
- Review test failures and flakiness
- Identify slow tests for optimization
- Update test documentation
- Refactor duplicate test code

**Monthly Review:**
- Analyze coverage trends
- Identify under-tested areas
- Evaluate new testing tools
- Share testing best practices with team

---

## Beta Launch Plan

### Beta Criteria
- All Week 1-6 tasks complete
- Tested on iOS and Android mobile browsers
- No critical bugs
- Onboarding flow polished
- 3+ internal testers have used it successfully

### Beta Recruitment
**Target:** 10-15 beta users

**Outreach:**
1. Personal network (builders you know)
2. Landing page waitlist (from validation phase)
3. Local builder associations
4. Construction Facebook groups
5. LinkedIn outreach to builders

**Incentive:**
- Free lifetime access (or 50% off forever)
- Direct input into product roadmap
- Recognition as founding member
- Potential case study opportunity

### Beta Support
- Dedicated email: beta@everbuild.app
- Weekly check-in emails
- Optional 15-minute calls for feedback
- Shared Slack or Discord channel (optional)
- Quick response time (< 24 hours)

### Beta Goals
- Validate time-to-value (can they set up in 15 min?)
- Identify biggest friction points
- Determine which missing features matter most
- Get testimonials and case studies
- Confirm pricing assumptions

---

## Environment Setup

### Required Accounts
- [ ] Digital Ocean account (free tier)
- [ ] Supabase account (free tier)
- [ ] Clerk account (free tier: 5,000 MAUs)
- [ ] Twilio account (pay-as-you-go: $0.0079/SMS)
- [ ] GitHub account (for code hosting)

### Environment Variables
```bash
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Twilio
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1234567890

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Appendix: UI Wireframes (Text Descriptions)

### Dashboard
```
┌─────────────────────────────────────────┐
│ [Logo] EverBuild            [👤 Menu]  │
├─────────────────────────────────────────┤
│                                         │
│  📊 Dashboard                           │
│                                         │
│  ┌───────┐  ┌───────┐  ┌───────┐      │
│  │   5   │  │   3   │  │   2   │      │
│  │Active │  │On Track│  │Delayed│      │
│  └───────┘  └───────┘  └───────┘      │
│                                         │
│  Active Projects                        │
│  ┌───────────────────────────────────┐ │
│  │ 123 Oak Street                    │ │
│  │ Current: Framing (Day 26-35)      │ │
│  │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░ 40%      │ │
│  │ On Track                          │ │
│  │ [View Details]                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 456 Maple Drive                   │ │
│  │ Current: Drywall (Day 46-50)      │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 70%        │ │
│  │ 2 days delayed                    │ │
│  │ [View Details]                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [+ New Project]                        │
│                                         │
├─────────────────────────────────────────┤
│ 🏠 Dashboard │ 📁 Projects │ 👥 Contacts│
└─────────────────────────────────────────┘
```

### Project Timeline
```
┌─────────────────────────────────────────┐
│ ← Back to Dashboard                     │
├─────────────────────────────────────────┤
│ 123 Oak Street                          │
│ Target Completion: Dec 15, 2025         │
│                                         │
│ ┌─ Overview ─ Timeline ─ Contacts ──┐  │
│ │                                    │  │
│ │ Timeline View                      │  │
│ │                                    │  │
│ │ Permitting       ▓▓▓▓▓▓▓ (Done)   │  │
│ │ Site Prep        ▓▓ (Done)        │  │
│ │ Foundation       ▓▓▓▓ (Done)      │  │
│ │ Framing          ▓▓▓▓▓→ (Current) │  │
│ │ Rough-In         ░░░ (Upcoming)   │  │
│ │ Drywall          ░░░ (Not Started)│  │
│ │                                    │  │
│ │ [+ Add Phase]                      │  │
│ │                                    │  │
│ │ Framing (Current Phase)            │  │
│ │ Oct 26 - Nov 4 (10 days)          │  │
│ │ Status: In Progress                │  │
│ │                                    │  │
│ │ Assigned Contacts:                 │  │
│ │ • Smith Framing (Lead)             │  │
│ │   [📞 Call] [💬 Text]             │  │
│ │                                    │  │
│ │ [Edit Phase] [Mark Complete]       │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Contact List
```
┌─────────────────────────────────────────┐
│ Contacts                    [+ Add]     │
├─────────────────────────────────────────┤
│                                         │
│ [🔍 Search contacts...]                 │
│ Filter by: [All Trades ▼]              │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ ABC Plumbing                      │  │
│ │ John Doe • Plumbing               │  │
│ │ (555) 123-4567                    │  │
│ │ [📞 Call] [💬 Text] [Edit]       │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ Smith Framing                     │  │
│ │ Jane Smith • Framing              │  │
│ │ (555) 234-5678                    │  │
│ │ [📞 Call] [💬 Text] [Edit]       │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ XYZ Electric                      │  │
│ │ Mike Johnson • Electrical         │  │
│ │ (555) 345-6789                    │  │
│ │ [📞 Call] [💬 Text] [Edit]       │  │
│ └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Final Checklist Before Launch

### Technical
- [ ] All features working end-to-end
- [ ] Mobile-responsive on iOS and Android
- [ ] Error handling on all forms and API calls
- [ ] Loading states everywhere
- [ ] SSL certificate configured
- [ ] Environment variables set in Digital Ocean
- [ ] Database backups configured
- [ ] Row-level security policies tested

### Content
- [ ] Empty states have helpful copy
- [ ] Error messages are user-friendly
- [ ] Success messages confirm actions
- [ ] Help text where needed
- [ ] Terms of Service page
- [ ] Privacy Policy page

### Testing
- [ ] Tested on Chrome, Safari, Firefox
- [ ] Tested on iPhone and Android
- [ ] All user flows work (signup → project creation → SMS)
- [ ] Twilio SMS sends successfully
- [ ] No console errors
- [ ] Performance acceptable (< 3s load times)

### Onboarding
- [ ] Welcome email configured
- [ ] Beta feedback form created
- [ ] Support email set up (beta@everbuild.app)
- [ ] Quick start guide written
- [ ] Video tutorial recorded (optional)

### Launch
- [ ] Beta users invited
- [ ] Monitoring set up (check logs daily)
- [ ] Feedback collection method ready
- [ ] Weekly check-in schedule planned
- [ ] Go/no-go criteria defined for Phase 2

---

**Ready to build? Let's go! 🚀**

This MVP gets builders experiencing value quickly while teaching us what matters most. Once they're hooked on the organization and visibility, we layer in the automation that makes EverBuild truly magical.
