# EverBuild - Product Requirements Document

**Version:** 1.0  
**Last Updated:** October 24, 2025  
**Status:** Draft

---

## Executive Summary

EverBuild is a progressive web application designed to streamline how residential spec-home builders coordinate construction projects with their subcontractors, vendors, and suppliers. The app acts as a centralized hub for managing home-building timelines, communications, and documents in a "stupid-simple" way that fits the fast-paced, on-site nature of construction.

**Key Value Proposition:** By automating schedule notifications and updates, EverBuild helps reduce miscommunication and delays, ultimately saving time and money on each build.

---

## Problem Statement

### Current Pain Points

Spec-home builders face significant challenges in project coordination:

1. **Manual Coordination Overhead:** Builders spend excessive time calling, texting, and emailing subcontractors and suppliers to ensure on-site presence at the right time

2. **Fragmented Tools:** Small builders rely on a patchwork of spreadsheets, calendar reminders, and phone tag to keep projects on track, leading to information silos

3. **Communication Failures:** Poor communication is the primary reason that one-third of construction projects fail

4. **Cascading Delays:** A single missed message or scheduling oversight can cascade into significant downtime. Example: If plumbing finishes but inspection isn't scheduled promptly, it can create a 10-day gap before drywall, idling crews and pushing back subsequent trades

5. **Thin Profit Margins:** Every day a home sits unfinished incurs carrying costs and lost sales opportunities, directly cutting into profits

6. **Multi-Project Complexity:** Managing multiple spec homes simultaneously compounds these issues exponentially

---

## Solution Overview

EverBuild provides an intuitive, automated platform for builders to manage each spec home project from start to finish with far less hassle.

### Core Approach

- **Centralized Timeline:** Interactive phased timeline serves as the single source of truth for scheduling
- **Automated Communication:** System handles routine messaging and timeline adjustments automatically
- **Real-Time Updates:** Status updates from the field trigger dynamic schedule adjustments
- **Mobile-First:** SMS-based interface meets builders and subs where they are (on their phones)
- **Zero-Friction for Subs:** No login required; subcontractors interact via simple text message links

### Key Benefits

- **Reduced Manual Coordination:** Eliminates dozens of daily calls and texts
- **Prevented Delays:** Automatic schedule adjustments prevent small delays from snowballing
- **Improved Communication:** 98% SMS open rate ensures messages are received and read within minutes
- **Better Visibility:** Single dashboard view of all active projects and their status
- **Lower Costs:** Reduced idle time and better coordination directly impact profit margins

---

## Target Market

### Primary Users

**Small to Medium-Sized Spec-Home Builders**
- Geographic focus: Continental United States
- Portfolio: Typically managing 10-15 spec homes at any given time throughout the year
- Build duration: Average turnaround time of 65 days from start to completion
- Team structure:
  - General Contractor / Owner
  - Foreman / Site Supervisor
  - Controller / Bookkeeper (administrative support)
  - 10-20 regular subcontractors and vendors per project

### User Personas

#### 1. Builder/General Contractor (Primary)
- Age: 35-60
- Tech comfort: Moderate
- Pain points: Juggling multiple projects, endless phone calls, schedule delays eating into margins
- Goals: Complete builds on time and under budget, reduce stress, scale operations

#### 2. Foreman/Site Supervisor (Secondary)
- Age: 30-55
- Tech comfort: Moderate to Low
- Pain points: Coordinating crews on-site, waiting for materials, unclear schedules
- Goals: Keep the site moving, clear daily priorities, quick access to plans

#### 3. Subcontractor (External)
- Age: 25-65
- Tech comfort: Low to Moderate
- Pain points: Showing up to sites that aren't ready, missed scheduling communications, unclear expectations
- Goals: Know when and where to be, get in/get out efficiently, get paid on time

---

## Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS
- **State Management:** React Context / Zustand (if needed)
- **Progressive Web App:** Next.js PWA support

### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage (for documents, images)
- **API:** Next.js API Routes / Server Actions

### Authentication
- **Provider:** Clerk
- **Features needed:**
  - Email/password authentication
  - Google OAuth
  - User metadata storage
  - Organization support (for builder teams)

### Payments
- **Provider:** Stripe
- **Integration needs:**
  - Subscription billing (monthly/annual tiers)
  - Customer portal for subscription management
  - Webhook handling for subscription events

### Communications
- **Primary SMS Provider:** Twilio
- **Alternative consideration:** Other SMS providers with MCP support
- **Email:** SendGrid or Resend (for transactional emails)
- **Features needed:**
  - Programmable SMS
  - Two-way SMS (receive status updates)
  - SMS templates
  - Delivery tracking

### Hosting & Deployment
- **Platform:** Vercel (recommended for Next.js)
- **Environment:** Production, Staging, Development

---

## Core Features & Functionality

### 1. Project & Phase Timeline Management

#### Description
Builders can create projects (spec homes) and break them into phases with expected start/end dates. Phases are arranged sequentially with dependencies so delays in one phase automatically shift subsequent phases.

#### Key Capabilities
- Create new project with basic info (address, lot number, model type, etc.)
- Define custom phases or use templates (e.g., Permitting, Site Prep, Foundation, Framing, Rough-In Plumbing, Rough-In Electrical, Insulation, Drywall, Trim, Painting, Flooring, Final, etc.)
- Set start/end dates for each phase
- Configure phase dependencies (which phases must complete before others can start)
- Visual timeline view (Gantt chart or calendar)
- Drag-and-drop date adjustments
- Automatic conflict detection and warnings
- Bulk schedule adjustments (e.g., push entire project back by X days)

#### User Stories
- As a builder, I want to create a new project and set up the construction phases, so I have a structured plan to follow
- As a builder, I want to see all my project phases on a visual timeline, so I can understand the full construction sequence at a glance
- As a builder, I want to drag a phase to adjust its dates, so I can quickly respond to changes
- As a foreman, I want to view the current phase and upcoming phases, so I know what to prepare for

#### Acceptance Criteria
- Projects can be created with name, address, and target completion date
- Minimum of 10 customizable phases per project
- Phase dependencies are respected (dependent phases shift automatically)
- Timeline visualization clearly shows phase durations, gaps, and current status
- Changes to phase dates trigger automatic recalculation of dependent phases

#### Technical Considerations
- Database schema: projects table, phases table (with project_id FK)
- Phase dependencies: stored as relationships (predecessor_phase_id)
- Date calculations: use date library (date-fns) for robust date math
- UI component: Consider react-gantt-chart or build custom with canvas/SVG

---

### 2. Subcontractor/Vendor Database (Mini-CRM)

#### Description
Centralized directory of all contacts including subcontractors, material suppliers, inspectors, and other stakeholders. Each contact can be reused across projects.

#### Key Capabilities
- Add/edit/archive contacts
- Store contact details:
  - Company name
  - Contact person name
  - Trade/specialty (e.g., Framing, Plumbing, Electrical)
  - Phone number (primary, secondary)
  - Email address
  - Typical lead time needed
  - Notes (reliability, preferences, special instructions)
  - Rating/history
- Assign contacts to specific project phases
- Search and filter contacts by trade
- View contact history (projects worked on, performance)
- Import contacts from CSV

#### User Stories
- As a builder, I want to save all my subcontractor information in one place, so I don't have to hunt through my phone contacts
- As a builder, I want to assign specific subs to phases across multiple projects, so the system knows who to notify
- As a builder, I want to add notes about each subcontractor, so I remember important details like lead times or reliability
- As a builder, I want to see which projects a subcontractor has worked on, so I can track our history together

#### Acceptance Criteria
- Can store unlimited contacts
- Contact information is validated (phone format, email format)
- Contacts can be assigned to multiple phases across different projects
- Search functionality returns results in under 1 second
- Archive feature hides unused contacts without deleting history

#### Technical Considerations
- Database: contacts table with company, name, phone, email, trade, notes, lead_time_days, is_active
- Relationships: project_phases_contacts junction table (many-to-many)
- Phone validation: use libphonenumber-js for international format support
- Search: Supabase full-text search or use RLS with ILIKE queries

---

### 3. Automated Notifications (SMS & Email)

#### Description
Proactive notification engine that contacts subcontractors and stakeholders as key dates approach or change. This is the core automation that reduces manual coordination.

#### Key Capabilities
- Configurable advance notice (e.g., 48 hours, 1 week before phase start)
- Personalized SMS messages including:
  - Project name
  - Phase name
  - Site address with Google Maps link
  - Scheduled start date and time
  - Special instructions
  - Unique link to status update form
- Schedule change notifications (delays, accelerations)
- Completion reminders
- Inspection scheduling notifications
- Material delivery reminders
- Custom message templates
- Notification preferences per contact (SMS, email, or both)
- Delivery tracking and read receipts (where available)
- Retry logic for failed deliveries

#### User Stories
- As a builder, I want subcontractors to automatically receive a text 2 days before their phase starts, so they know when to show up without me calling
- As a builder, I want to customize how far in advance each notification is sent, so I can account for different lead times
- As a subcontractor, I want to receive a text with the job address and date, so I know exactly where to be and when
- As a builder, I want subs to be notified immediately when a schedule changes, so they don't show up on the wrong day
- As a foreman, I want to be notified when a phase is completed, so I can prepare the site for the next trade

#### Acceptance Criteria
- SMS notifications sent successfully at configured lead times (verified via delivery receipts)
- Messages include all required information and are under 160 characters (or properly segmented)
- Links in SMS are shortened and trackable
- Schedule change notifications sent within 5 minutes of a status update
- Email fallback works if SMS fails
- Builder can preview notifications before they go out
- Notification log shows sent/delivered/failed status

#### Technical Considerations
- Twilio integration: use Programmable SMS API
- Message queue: implement job queue for reliable delivery (consider Supabase Edge Functions or Next.js cron jobs)
- URL shortening: use Bitly API or custom short links with tracking
- Template system: store message templates in database with variable substitution
- Scheduling: use node-cron or database triggers to check upcoming phases
- Rate limiting: respect Twilio rate limits and implement exponential backoff
- Link generation: unique token per notification (UUID) linked to project_phase and contact

---

### 4. Real-Time Status Updates & Timeline Adjustments

#### Description
Subcontractors provide status updates via simple web forms (no login required), which automatically update the project timeline and trigger schedule adjustments.

#### Key Capabilities
- One-click status update from SMS link
- Status options:
  - Job Completed
  - In Progress (on schedule)
  - Running Late (same day)
  - Delayed (specify number of days)
  - Issue/Problem (requires attention)
  - Material Delivered
  - Inspection Passed/Failed
- Optional fields:
  - Notes/comments
  - Photo uploads
  - Completion percentage
- Automatic timeline recalculation when delays reported
- Cascade effect: subsequent phases automatically shift
- Affected parties notified of new schedule
- Builder approval workflow (optional) for major changes
- Real-time dashboard updates (via Supabase Realtime)
- Status history log

#### User Stories
- As a subcontractor, I want to click a link and tap "Completed" when I finish, so I can quickly confirm without a phone call
- As a subcontractor, I want to report a delay with a reason, so the builder knows why and can adjust
- As a builder, I want the schedule to automatically adjust when a sub reports a delay, so I don't have to manually update everything
- As a builder, I want to be notified immediately when a phase completes or is delayed, so I can take action if needed
- As a foreman, I want to upload photos when marking a phase complete, so there's a visual record

#### Acceptance Criteria
- Status update form loads in under 2 seconds on mobile
- No authentication required to access status update form
- Form submission updates database and triggers timeline recalculation
- Dependent phases shift automatically based on reported delays
- Affected contacts receive updated schedule notifications within 5 minutes
- Photo uploads support JPEG/PNG, max 5MB each, up to 5 photos
- Builder receives real-time notification of status changes
- Status updates appear in project audit log with timestamp

#### Technical Considerations
- Unique token system: generate UUID for each notification, store in notifications table with project_phase_id and contact_id
- Public API route: /api/status/[token] - validates token and renders form
- Form validation: check token validity, ensure phase is still active
- Timeline recalculation algorithm:
  1. Identify dependent phases (where predecessor_phase_id = current phase)
  2. Calculate delay days (reported end date - original end date)
  3. Shift all dependent phases by delay days
  4. Store adjustments in phase_history table
  5. Queue notifications for affected contacts
- Photo storage: Supabase Storage bucket with public read access (authenticated upload)
- Real-time updates: use Supabase Realtime subscriptions on phases table
- Optimistic locking: prevent concurrent update conflicts with version column

---

### 5. Document & Permit Management

#### Description
Digital document repository for each project, storing blueprints, permits, inspection reports, photos, and other important files. Documents can be associated with the overall project or specific phases.

#### Key Capabilities
- Upload documents (PDF, JPEG, PNG, DOCX, XLS)
- Organize documents by:
  - Project-level (plans, permits, contracts)
  - Phase-level (phase-specific drawings, specs)
- Document metadata:
  - Title/description
  - Upload date
  - Uploaded by
  - File size
  - Version number (optional)
- Preview documents in-app (for PDFs and images)
- Share documents via link (included in SMS notifications)
- Download documents
- Document version history
- Automatic thumbnail generation for images
- Search documents by name or description
- Tag system for categorization
- Mobile document upload (photos from camera)

#### User Stories
- As a builder, I want to upload the building permit and blueprints, so everyone can reference the latest version
- As a builder, I want to attach specific drawings to a phase, so the subcontractor sees only what they need
- As a subcontractor, I want to view the plans for my phase from my phone, so I don't need paper copies
- As a foreman, I want to upload inspection reports and photos, so there's a record of completed work
- As a builder, I want to search for a specific permit document, so I can quickly find it during an inspection

#### Acceptance Criteria
- Supports common file types: PDF, JPEG, PNG, DOCX, XLS (max 50MB per file)
- Documents can be uploaded via web interface and mobile
- Documents can be attached to project or specific phases
- PDF preview works in browser (no download required)
- Document links in SMS open in mobile browser with readable preview
- Search returns results instantly
- Folder structure is intuitive and matches construction workflow
- Document access log tracks who viewed what and when

#### Technical Considerations
- Storage: Supabase Storage buckets
  - documents_project (project-level docs)
  - documents_phase (phase-level docs)
  - photos (photos from status updates)
- Database: documents table with project_id, phase_id (nullable), file_path, file_name, file_type, file_size, uploaded_by, uploaded_at, metadata (JSONB)
- Access control: Row-level security in Supabase based on project membership
- File processing:
  - Generate thumbnails for images using sharp
  - Extract text from PDFs for search using pdf-parse
- Signed URLs: use Supabase Storage signed URLs with expiration (24 hours)
- Mobile optimization: compress images on upload to reduce bandwidth

---

### 6. Visual Dashboard & Progress Tracking

#### Description
Overview dashboard for builders to see all active projects at a glance, with key metrics, alerts, and upcoming tasks.

#### Key Capabilities
- Project cards showing:
  - Project name and address
  - Current phase
  - Percent complete
  - Days on schedule (ahead/behind)
  - Active alerts (delays, issues)
  - Next critical task
  - Weather forecast for site location
- Filters:
  - By project status (Active, Completed, On Hold)
  - By phase
  - By subcontractor
- Calendar view:
  - All upcoming phases across projects
  - Inspection dates
  - Material delivery dates
- Metrics:
  - Total active projects
  - Average days to completion
  - On-time completion rate
  - Most common delay causes
- Project timeline visualization
- Quick actions (mark complete, report delay, contact sub)

#### User Stories
- As a builder, I want to see all my active projects on one screen, so I know what needs attention today
- As a builder, I want to see which projects are behind schedule, so I can prioritize my time
- As a foreman, I want a calendar view of this week's phases, so I can plan my site visits
- As a builder, I want to see completion metrics, so I can identify bottlenecks and improve processes
- As a controller, I want to see which phases are completed, so I can process payments

#### Acceptance Criteria
- Dashboard loads in under 2 seconds with up to 50 active projects
- Project cards clearly indicate status with color coding (green = on track, yellow = minor delay, red = critical)
- Real-time updates reflect in dashboard without page refresh
- Calendar view is mobile-responsive and easy to navigate
- Metrics are accurate and update daily
- Dashboard is customizable (builder can choose which widgets to show)

#### Technical Considerations
- Dashboard API route: aggregate data from multiple tables
  - Projects, phases, phase_history, notifications
  - Use Supabase views for complex queries
- Caching: cache dashboard data for 5 minutes using Next.js ISR or SWR
- Real-time: Supabase Realtime subscription for critical updates only
- Progress calculation:
  - Total phases vs. completed phases
  - Weighted by phase duration (longer phases count more)
- Chart library: recharts or Chart.js for metrics visualization
- Calendar component: react-big-calendar or FullCalendar
- Performance: use React.memo and useMemo for expensive calculations

---

### 7. User Roles & Collaboration

#### Description
Support multiple users on a builder's team with appropriate access levels, while keeping external subcontractors interaction friction-free.

#### Key Capabilities
- User roles:
  - **Owner/Admin:** Full access, billing, user management
  - **Project Manager:** Create/edit projects, manage schedules, view all data
  - **Foreman:** View assigned projects, update status, upload documents
  - **Read-Only:** View projects and timelines only (for office staff)
- Organization/team support (via Clerk Organizations)
- Invite team members by email
- Per-project permissions (optional)
- Activity log (who changed what)
- Role-based dashboard views
- Subcontractor access (no account required):
  - Status update via unique links
  - View phase-specific documents
  - No access to other projects or sensitive data

#### User Stories
- As a builder, I want to invite my foreman to the app, so he can update project status from the field
- As a foreman, I want to see only the projects I'm responsible for, so I'm not overwhelmed with information
- As a controller, I want read-only access to check project completion, so I can process invoices accurately
- As a builder, I want to control who can edit schedules, so only authorized people make changes
- As a subcontractor, I want to interact with EverBuild without creating an account, so I don't have another login to manage

#### Acceptance Criteria
- Team members can be invited via email
- Each role has clearly defined permissions that are enforced in the UI and API
- Subcontractors never need to create an account
- Activity log tracks all significant changes with user attribution
- Organization billing is separate from individual user accounts
- Role changes take effect immediately

#### Technical Considerations
- Authentication: Clerk with Organizations feature
  - Map Clerk user_id to internal users table
  - Store role in user_metadata or separate user_roles table
- Authorization: middleware to check role on protected routes
- Supabase RLS: use Clerk JWT to enforce row-level security
- Permissions matrix:
  ```
  | Action              | Admin | PM | Foreman | Read-Only |
  |---------------------|-------|----|---------| ---------|
  | Create project      | ✓     | ✓  | ✗       | ✗        |
  | Edit schedule       | ✓     | ✓  | ✗       | ✗        |
  | Update status       | ✓     | ✓  | ✓       | ✗        |
  | Upload documents    | ✓     | ✓  | ✓       | ✗        |
  | View all projects   | ✓     | ✓  | ✗       | ✓        |
  | Manage billing      | ✓     | ✗  | ✗       | ✗        |
  | Invite users        | ✓     | ✓  | ✗       | ✗        |
  ```
- Public routes (no auth): /api/status/[token], /api/documents/public/[id]

---

### 8. Audit Trail & Communication Log

#### Description
Comprehensive logging of all communications, status changes, and schedule modifications for accountability and dispute resolution.

#### Key Capabilities
- Automatic logging of:
  - Notifications sent (SMS, email)
  - Delivery receipts
  - Link clicks
  - Status updates submitted
  - Schedule changes (who, what, when)
  - Document uploads/views
  - User actions
- Searchable log with filters:
  - By project
  - By date range
  - By contact
  - By event type
- Export log to CSV or PDF
- Timestamped entries with timezone
- Immutable records (append-only)
- Evidence for disputes (proof of notification)
- Performance metrics (average response time, etc.)

#### User Stories
- As a builder, I want to see when a notification was sent and if it was delivered, so I can confirm the subcontractor was informed
- As a builder, I want to review all schedule changes for a project, so I can understand why it's behind schedule
- As a builder, I want to export the communication log, so I can include it in project reports
- As a controller, I want to see when phases were completed, so I can verify payment milestones
- As a builder, I want proof that a subcontractor received a notification, so I can resolve billing disputes

#### Acceptance Criteria
- All significant events are logged automatically
- Log entries are immutable (cannot be edited or deleted)
- Log is searchable and filterable with results in under 2 seconds
- Export generates a readable report with all requested entries
- Timestamps include timezone information
- Log retention: minimum 7 years for compliance

#### Technical Considerations
- Database: audit_log table with columns:
  - id (UUID)
  - project_id
  - phase_id (nullable)
  - contact_id (nullable)
  - user_id (nullable)
  - event_type (enum: notification_sent, status_updated, schedule_changed, etc.)
  - event_data (JSONB for flexible storage)
  - timestamp (timestamptz)
  - ip_address (for security)
- Indexing: multi-column index on (project_id, timestamp) for fast queries
- Append-only: use database constraints to prevent updates/deletes
- Partitioning: partition by year for performance with large datasets
- Export: use server-side PDF generation (Puppeteer) or CSV export
- Privacy: PII should be encrypted at rest (consider Supabase encryption)

---

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds on 4G mobile
- API response time: < 500ms for 95th percentile
- Dashboard refresh: real-time updates within 5 seconds
- Support 100+ concurrent users without degradation
- Handle 50 projects per builder smoothly

### Scalability
- Support up to 10,000 builders (initial scale)
- 500,000 projects in database
- 5 million SMS messages per month
- Horizontal scaling capability for future growth

### Reliability
- 99.9% uptime SLA
- Automated backups (daily, retained 30 days)
- Point-in-time recovery for database
- Graceful degradation (if SMS fails, queue and retry)
- Error logging and monitoring (Sentry or similar)

### Security
- HTTPS only (TLS 1.3)
- SQL injection prevention (parameterized queries)
- XSS protection (input sanitization, CSP headers)
- CSRF protection (tokens on forms)
- Rate limiting on public endpoints (100 req/min per IP)
- Secure password storage (handled by Clerk)
- Row-level security for multi-tenant data isolation
- Audit logging for compliance
- Regular security updates (dependencies)

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- High contrast mode
- Mobile-friendly (responsive design)
- Minimum touch target size: 44x44px
- Font size: minimum 16px, scalable

### Browser Support
- Chrome (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Mobile Support
- Progressive Web App (installable)
- Offline capability for viewing (cached data)
- Camera integration for photos
- Geolocation for site check-ins (future)
- Push notifications (future)

---

## Data Model

### Core Entities

#### Organizations
- id (UUID)
- name (string)
- created_at (timestamp)
- subscription_tier (enum)
- stripe_customer_id (string)

#### Users
- id (UUID)
- organization_id (UUID FK)
- clerk_user_id (string, unique)
- email (string)
- full_name (string)
- role (enum: admin, project_manager, foreman, readonly)
- created_at (timestamp)

#### Projects
- id (UUID)
- organization_id (UUID FK)
- name (string)
- address (string)
- city (string)
- state (string)
- zip_code (string)
- lot_number (string, optional)
- model_type (string, optional)
- status (enum: active, completed, on_hold, cancelled)
- target_completion_date (date)
- actual_completion_date (date, nullable)
- created_by (UUID FK → users)
- created_at (timestamp)
- updated_at (timestamp)

#### Phases
- id (UUID)
- project_id (UUID FK)
- name (string)
- description (text, optional)
- sequence_order (integer)
- planned_start_date (date)
- planned_end_date (date)
- actual_start_date (date, nullable)
- actual_end_date (date, nullable)
- status (enum: not_started, in_progress, completed, delayed, blocked)
- predecessor_phase_id (UUID FK → phases, nullable)
- days_buffer (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)

#### Contacts
- id (UUID)
- organization_id (UUID FK)
- company_name (string)
- contact_person (string)
- trade (string)
- phone_primary (string)
- phone_secondary (string, optional)
- email (string, optional)
- lead_time_days (integer, default 2)
- notes (text, optional)
- rating (decimal, 1-5, optional)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

#### PhaseContacts (junction table)
- id (UUID)
- phase_id (UUID FK)
- contact_id (UUID FK)
- role (string, e.g., "Lead", "Helper", "Material Supplier")
- notification_advance_days (integer, default 2)
- created_at (timestamp)

#### Notifications
- id (UUID)
- project_id (UUID FK)
- phase_id (UUID FK)
- contact_id (UUID FK)
- notification_type (enum: phase_reminder, schedule_change, completion_request, etc.)
- status (enum: queued, sent, delivered, failed, clicked)
- token (UUID, unique)
- sent_at (timestamp, nullable)
- delivered_at (timestamp, nullable)
- clicked_at (timestamp, nullable)
- message_body (text)
- message_sid (string, Twilio SID, nullable)
- error_message (text, nullable)

#### StatusUpdates
- id (UUID)
- notification_id (UUID FK)
- phase_id (UUID FK)
- contact_id (UUID FK)
- status (enum: completed, in_progress, running_late, delayed, issue)
- delay_days (integer, nullable)
- notes (text, optional)
- photos (text[], array of file paths, optional)
- submitted_at (timestamp)
- ip_address (inet)

#### Documents
- id (UUID)
- project_id (UUID FK)
- phase_id (UUID FK, nullable)
- file_name (string)
- file_path (string)
- file_type (string)
- file_size (integer, bytes)
- title (string)
- description (text, optional)
- uploaded_by (UUID FK → users)
- uploaded_at (timestamp)
- version (integer, default 1)
- is_active (boolean, default true)

#### AuditLog
- id (UUID)
- project_id (UUID FK, nullable)
- phase_id (UUID FK, nullable)
- contact_id (UUID FK, nullable)
- user_id (UUID FK, nullable)
- event_type (string)
- event_data (JSONB)
- timestamp (timestamptz)
- ip_address (inet, nullable)

### Relationships
- Organizations → Users (one-to-many)
- Organizations → Projects (one-to-many)
- Organizations → Contacts (one-to-many)
- Projects → Phases (one-to-many)
- Phases → Phases (self-referencing, predecessor)
- Phases → PhaseContacts (one-to-many)
- Contacts → PhaseContacts (one-to-many)
- PhaseContacts → Notifications (one-to-many)
- Notifications → StatusUpdates (one-to-one)
- Projects → Documents (one-to-many)
- Phases → Documents (one-to-many)

---

## User Workflows

### 1. Builder Creates New Project

**Steps:**
1. Builder logs in to dashboard
2. Clicks "New Project" button
3. Fills in project details form:
   - Project name (e.g., "123 Oak Street")
   - Address, city, state, zip
   - Lot number (optional)
   - Model type (optional)
   - Target completion date
4. Chooses to start from template or build custom timeline
5. If template:
   - Selects template (e.g., "Standard 2-Story, 65-day build")
   - Reviews pre-populated phases
   - Adjusts dates/phases as needed
6. If custom:
   - Adds phases one-by-one
   - Sets start/end dates
   - Defines dependencies
7. Assigns contacts to phases:
   - Selects from existing contact list
   - Sets notification advance time per contact
8. Reviews timeline visualization
9. Saves project
10. Dashboard shows new project card

**Validation:**
- All required fields completed
- Dates are logical (start before end)
- Dependencies don't create circular loops
- At least one phase defined

---

### 2. Subcontractor Receives & Responds to Notification

**Steps:**
1. Subcontractor receives SMS: "EverBuild: Your Framing work at 123 Oak St starts on Oct 28. Tap to confirm: https://everbuild.app/s/abc123"
2. Clicks link on phone
3. Lands on mobile-optimized status page:
   - Shows project name, address (with map link)
   - Phase name and scheduled dates
   - Any attached documents (plans, specs)
4. Scrolls to status update section
5. Selects status:
   - "I'll be there on time" → Job confirms, no action needed
   - "Job completed" → Phase marked complete, triggers notifications
   - "Running 1 day late" → Reschedules phase start +1 day
   - "Delayed 3 days - waiting on material" → Extends phase +3 days, adds note
6. Optionally uploads photos
7. Submits form
8. Sees confirmation: "Thanks! The builder has been notified."
9. Builder receives push notification of update
10. Timeline automatically adjusts
11. Dependent subcontractors receive updated schedule notifications

**Edge Cases:**
- Token expired → Show message, provide contact info
- Phase already marked complete → Show status, no update form
- Network error during submit → Retry logic, show error message

---

### 3. Foreman Updates Progress from Field

**Steps:**
1. Foreman opens EverBuild on phone
2. Navigates to active project
3. Views current phase (e.g., "Plumbing Rough-In")
4. Phase status shows "In Progress" with progress bar at 60%
5. Foreman walks site, checks work
6. Opens phase detail
7. Marks checklist items complete:
   - Supply lines run ✓
   - Drain lines installed ✓
   - Pressure test pending
8. Takes photos of completed work
9. Uploads photos to phase documents
10. Updates progress to 85%
11. Adds note: "Pressure test scheduled for tomorrow AM"
12. Saves update
13. Builder sees real-time update on dashboard
14. System checks: if 100%, prompts foreman to mark phase complete
15. If marked complete, triggers:
    - Notification to builder
    - Notification to inspector (if required)
    - Next phase subcontractor notified (if scheduled)

---

### 4. Builder Reviews Weekly Schedule

**Steps:**
1. Builder opens dashboard Monday morning
2. Views "This Week" calendar widget
3. Sees phases scheduled to start:
   - Project A: Drywall (Tuesday)
   - Project B: Framing inspection (Wednesday)
   - Project C: HVAC rough-in (Thursday)
   - Project D: Tile work (Friday)
4. Checks weather widget: Rain forecasted Wednesday
5. Opens Project B details
6. Adjusts framing inspection to Thursday
7. System automatically pushes drywall start to Friday
8. Notifies drywall sub of new date
9. Reviews alerts:
   - Project E: Electrical delayed 2 days (material shortage)
   - Project F: Foundation completed early
10. Opens Project E, reviews delay note
11. Calls electrical sub for details
12. Updates expected delivery date in app
13. System recalculates and notifies affected parties
14. Exports weekly schedule to PDF
15. Emails PDF to team

---

## API Endpoints

### Authentication (Clerk)
- Handled by Clerk SDK
- Use Clerk middleware for protected routes

### Projects
- `GET /api/projects` - List all projects for organization
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Archive project (soft delete)
- `GET /api/projects/:id/timeline` - Get full timeline with phases
- `GET /api/projects/:id/documents` - List project documents
- `POST /api/projects/:id/documents` - Upload document

### Phases
- `GET /api/projects/:projectId/phases` - List phases for project
- `POST /api/projects/:projectId/phases` - Create new phase
- `GET /api/phases/:id` - Get phase details
- `PATCH /api/phases/:id` - Update phase (dates, status, etc.)
- `DELETE /api/phases/:id` - Delete phase
- `POST /api/phases/:id/contacts` - Assign contact to phase
- `DELETE /api/phases/:id/contacts/:contactId` - Remove contact from phase

### Contacts
- `GET /api/contacts` - List all contacts for organization
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact details
- `PATCH /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Archive contact
- `GET /api/contacts/:id/history` - Get contact project history

### Notifications
- `GET /api/notifications` - List recent notifications (with filters)
- `POST /api/notifications/send` - Manually send notification
- `GET /api/notifications/:id` - Get notification details and status

### Status Updates (Public)
- `GET /api/status/:token` - Get status update form (public, no auth)
- `POST /api/status/:token` - Submit status update (public, no auth)

### Documents
- `GET /api/documents/:id` - Get document metadata
- `GET /api/documents/:id/download` - Download document (signed URL)
- `GET /api/documents/public/:id` - Public document access (for subs)
- `DELETE /api/documents/:id` - Delete document

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary data
- `GET /api/dashboard/upcoming` - Get upcoming phases (calendar view)
- `GET /api/dashboard/alerts` - Get active alerts/issues

### Audit Log
- `GET /api/audit-log` - Get audit log entries (with filters)
- `GET /api/audit-log/export` - Export audit log to CSV

### Webhooks
- `POST /api/webhooks/twilio` - Receive Twilio status callbacks
- `POST /api/webhooks/stripe` - Receive Stripe subscription events

---

## Subscription Tiers & Pricing

### Tier 1: Starter (Recommended for new users)
**Price:** $49/month or $470/year (save $118)

**Features:**
- Up to 5 active projects
- Unlimited phases per project
- Up to 50 contacts
- 500 SMS notifications per month
- Document storage: 5GB
- 1 user account (builder)
- Email support

**Target:** Solo builders or very small operations just starting out

---

### Tier 2: Professional (Most Popular)
**Price:** $99/month or $950/year (save $238)

**Features:**
- Up to 15 active projects
- Unlimited phases per project
- Unlimited contacts
- 2,000 SMS notifications per month
- Document storage: 25GB
- Up to 3 user accounts (builder + team)
- Priority email support
- Custom message templates
- Advanced reporting

**Target:** Established small builders (10-15 homes/year)

---

### Tier 3: Business
**Price:** $199/month or $1,910/year (save $478)

**Features:**
- Unlimited active projects
- Unlimited phases per project
- Unlimited contacts
- 5,000 SMS notifications per month
- Document storage: 100GB
- Up to 10 user accounts
- Phone + email support
- Custom branding (logo in notifications)
- API access (future)
- Dedicated onboarding
- Quarterly business review

**Target:** Larger builders or small builders scaling rapidly (20+ homes/year)

---

### Add-ons (All Tiers)
- Extra SMS messages: $0.02 per message
- Additional storage: $10/month per 10GB
- Additional user seats: $15/month per user
- Premium support: $50/month (phone support for Starter/Professional)

---

### Free Trial
- 14-day free trial (no credit card required)
- Full access to Professional tier features
- 100 SMS included during trial
- After trial, prompt to select tier or downgrade to Starter

---

## Implementation Phases

### Phase 1: MVP (Months 1-3)
**Goal:** Launch functional app with core features

**Features:**
- User authentication (Clerk)
- Project creation and management
- Phase timeline (basic, no Gantt chart yet)
- Contact management
- Manual SMS sending (via Twilio)
- Status update forms (public links)
- Basic dashboard
- Document upload and storage

**Success Criteria:**
- 10 beta users actively managing projects
- 500 SMS sent successfully
- Positive feedback on core workflow

---

### Phase 2: Automation (Months 4-5)
**Goal:** Automate notifications and schedule adjustments

**Features:**
- Automated scheduled notifications
- Real-time timeline adjustments based on status updates
- Cascade schedule changes to dependent phases
- Notification delivery tracking
- Enhanced dashboard with real-time updates
- Calendar view of upcoming phases

**Success Criteria:**
- 80% of notifications sent automatically
- 90% of timeline adjustments happen without manual intervention
- User reports 50% reduction in manual coordination time

---

### Phase 3: Collaboration & Polish (Months 6-7)
**Goal:** Support team collaboration and improve UX

**Features:**
- Multi-user support with roles
- Audit log and communication history
- Advanced filtering and search
- Gantt chart timeline visualization
- Mobile app (PWA) optimization
- Export reports (PDF, CSV)
- Custom notification templates

**Success Criteria:**
- 50 paying customers
- Average of 2.5 users per organization
- 4.5+ star rating in user feedback

---

### Phase 4: Growth & Optimization (Months 8-12)
**Goal:** Scale and add differentiating features

**Features:**
- Weather integration (delay predictions)
- Material tracking integration
- Budget tracking per project
- Vendor/sub performance analytics
- Mobile push notifications
- Integrations (QuickBooks, BuilderTrend, etc.)
- API for third-party developers

**Success Criteria:**
- 200 paying customers
- $20k MRR
- 95% customer retention rate
- NPS score > 50

---

## Success Metrics (KPIs)

### User Acquisition
- Monthly signups
- Free trial to paid conversion rate (target: 25%)
- Organic vs. paid acquisition split
- Cost per acquisition (CPA)

### User Engagement
- Daily active users (DAU)
- Weekly active users (WAU)
- Average sessions per user per week
- Average session duration
- Feature adoption rates

### Business Impact (User-Reported)
- Average time saved per project (target: 10+ hours)
- Reduction in project delays (target: 30%)
- Improvement in on-time completion (target: 20% increase)
- ROI compared to subscription cost (target: 10x)

### Product Performance
- SMS delivery rate (target: 99%)
- Notification click-through rate (target: 60%)
- Status update completion rate (target: 70%)
- Average API response time (target: <500ms)
- App uptime (target: 99.9%)

### Financial
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Customer lifetime value (LTV)
- LTV:CAC ratio (target: 3:1)
- Churn rate (target: <5% monthly)
- Net revenue retention (target: >100%)

### Customer Satisfaction
- Net Promoter Score (NPS) (target: >50)
- Customer satisfaction score (CSAT) (target: >4.5/5)
- Support ticket resolution time (target: <24 hours)
- Feature request volume and themes

---

## Risks & Mitigations

### Risk 1: Low Subcontractor Adoption
**Description:** Subcontractors may ignore SMS notifications or fail to submit status updates.

**Likelihood:** Medium  
**Impact:** High

**Mitigation:**
- Make status updates incredibly simple (one tap)
- Provide value to subs (clear schedules, easy document access)
- Builder education: encourage builders to communicate the benefits to their subs
- Incentive program: builders can offer bonuses for consistent updates
- Fallback: builders can manually update on behalf of subs

---

### Risk 2: Inaccurate Schedule Adjustments
**Description:** Automated timeline adjustments may not account for all real-world factors, leading to suboptimal schedules.

**Likelihood:** Medium  
**Impact:** Medium

**Mitigation:**
- Allow builders to review and approve major schedule changes before notifications sent
- Provide override capabilities for all automated changes
- Use conservative buffer times by default
- Machine learning (future): learn from past projects to improve predictions
- Clear documentation on how automation works

---

### Risk 3: SMS Deliverability Issues
**Description:** SMS may fail to deliver due to carrier issues, invalid numbers, or spam filtering.

**Likelihood:** Low  
**Impact:** High

**Mitigation:**
- Use Twilio with dedicated short code or 10DLC registration for high deliverability
- Validate phone numbers before sending
- Implement retry logic with exponential backoff
- Provide email fallback option
- Monitor delivery rates and alert on anomalies
- Clear opt-out mechanism to comply with regulations

---

### Risk 4: Data Security Breach
**Description:** Unauthorized access to sensitive project data, documents, or contact information.

**Likelihood:** Low  
**Impact:** Critical

**Mitigation:**
- Follow security best practices (OWASP Top 10)
- Use Clerk for authentication (industry-standard security)
- Implement row-level security in Supabase
- Regular security audits and penetration testing
- Encrypt sensitive data at rest and in transit
- Incident response plan
- Cyber insurance
- SOC 2 Type II certification (future)

---

### Risk 5: Competition from Established Players
**Description:** Large construction management platforms (Procore, Buildertrend) may add similar features.

**Likelihood:** Medium  
**Impact:** Medium

**Mitigation:**
- Focus on niche: small spec-home builders (underserved by enterprise tools)
- Emphasize simplicity and speed (vs. bloated feature sets)
- Competitive pricing for target market
- Build community and loyalty early
- Move fast and iterate based on user feedback
- Consider partnerships or acquisition opportunities

---

### Risk 6: Scalability Issues
**Description:** System performance degrades as user base grows.

**Likelihood:** Medium  
**Impact:** High

**Mitigation:**
- Design for scale from day one (stateless architecture)
- Use managed services (Supabase, Vercel) that scale automatically
- Monitor performance continuously (New Relic, Datadog)
- Load testing before major launches
- Database optimization (indexing, query optimization)
- Horizontal scaling plan
- CDN for static assets (Cloudflare)

---

## Competitive Analysis

### Direct Competitors

#### 1. BuilderTrend
**Strengths:**
- Established brand in construction management
- Comprehensive feature set
- Strong customer support
- Integrations with accounting software

**Weaknesses:**
- Expensive ($99-$399/month per user)
- Complex interface (steep learning curve)
- Over-featured for small builders
- Slow mobile experience

**Differentiation:** EverBuild is simpler, cheaper, and designed specifically for spec-home builders' workflow.

---

#### 2. CoConstruct
**Strengths:**
- Popular with custom home builders
- Good client communication features
- Financial management tools
- Strong reporting

**Weaknesses:**
- $99/month minimum (even for 1 user)
- Focused on custom homes (not spec)
- Requires significant setup time
- Not optimized for fast-paced spec builds

**Differentiation:** EverBuild focuses on speed and automation for spec homes, not custom builds with clients.

---

#### 3. Procore
**Strengths:**
- Market leader
- Robust feature set
- Mobile apps
- Good support

**Weaknesses:**
- $499/month for full features
- Overkill for small builders
- Steep learning curve
- Requires dedicated admin

**Differentiation:** EverBuild is 5-10x cheaper and can be set up in minutes, not days.

---

### Indirect Competitors

#### 4. Spreadsheets + Phone/Text
**Strengths:**
- Free or cheap
- Familiar to everyone
- Flexible

**Weaknesses:**
- Manual and time-consuming
- Error-prone
- No automation
- Poor collaboration
- Information silos

**Differentiation:** EverBuild automates the tedious parts while maintaining simplicity.

---

#### 5. Asana / Monday.com
**Strengths:**
- General project management
- Good collaboration features
- Modern UI

**Weaknesses:**
- Not construction-specific
- No SMS automation
- No subcontractor-friendly interface
- Requires everyone to have accounts
- $10-15/user/month adds up

**Differentiation:** EverBuild is purpose-built for construction with SMS-first approach.

---

## Future Roadmap (Post-Launch)

### Year 1 Enhancements
- Weather integration (automatically adjust for rain delays)
- Material tracking (log deliveries, track usage)
- Budget tracking per project
- Inspection scheduling automation
- Integration with Google Calendar
- White-label option (builders can brand the app)

### Year 2 Expansions
- Mobile native apps (iOS, Android)
- Supplier integrations (automated material ordering)
- Accounting integrations (QuickBooks, Xero)
- AI-powered schedule optimization
- Predictive analytics (delay predictions based on historical data)
- Crew management (track labor hours)
- Homeowner portal (for spec home buyers post-sale)

### Year 3+ Vision
- Marketplace for subcontractors (connect builders with rated subs)
- Financing integrations (construction loans)
- Warranty management
- Multi-trade company support (GCs managing commercial projects)
- International expansion
- Open API platform (third-party integrations)
- Machine learning for automatic schedule creation

---

## Appendix

### Glossary

- **Spec Home:** A speculative home built by a builder without a specific buyer, intended to be sold upon or after completion.
- **Subcontractor (Sub):** An independent contractor hired to perform a specific trade (e.g., plumbing, electrical, framing).
- **Phase:** A distinct stage of construction (e.g., Foundation, Framing, Drywall).
- **Lead Time:** The advance notice a subcontractor needs before starting work.
- **Cascade:** When a delay in one phase causes subsequent dependent phases to shift automatically.
- **Progressive Web App (PWA):** A web application that can be installed on a device and works offline.

---

### Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js React App (PWA)                                     │
│  - Dashboard, Project Management, Timeline UI                │
│  - Responsive Design (Mobile + Desktop)                      │
│  - Offline Capability (Service Worker)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes / Server Actions                         │
│  - Business Logic                                             │
│  - Authentication Middleware (Clerk)                         │
│  - Authorization Checks                                      │
│  - Data Validation                                           │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Supabase   │ │    Clerk     │ │   Twilio     │
    │              │ │              │ │              │
    │  PostgreSQL  │ │     Auth     │ │  SMS API     │
    │  Realtime    │ │  User Mgmt   │ │              │
    │  Storage     │ │              │ │              │
    └──────────────┘ └──────────────┘ └──────────────┘
            │
            │
    ┌──────────────┐
    │    Stripe    │
    │              │
    │   Payments   │
    │ Subscriptions│
    └──────────────┘
```

---

### Sample Project Timeline (65-Day Spec Home Build)

| Phase                  | Duration | Start Day | End Day | Key Tasks                          |
|------------------------|----------|-----------|---------|-------------------------------------|
| Permitting             | 14 days  | Day 1     | Day 14  | Submit plans, await approval        |
| Site Preparation       | 3 days   | Day 15    | Day 17  | Clear lot, stake, temp utilities   |
| Foundation             | 7 days   | Day 18    | Day 24  | Footings, pour, cure                |
| Foundation Inspection  | 1 day    | Day 25    | Day 25  | Inspector sign-off                  |
| Framing                | 10 days  | Day 26    | Day 35  | Walls, roof trusses, sheathing     |
| Framing Inspection     | 1 day    | Day 36    | Day 36  | Inspector sign-off                  |
| Rough-In Plumbing      | 3 days   | Day 37    | Day 39  | Supply/drain lines                  |
| Rough-In Electrical    | 3 days   | Day 37    | Day 39  | Wiring, boxes (parallel with plumb)|
| Rough-In HVAC          | 3 days   | Day 40    | Day 42  | Ductwork, units                     |
| Rough-In Inspection    | 1 day    | Day 43    | Day 43  | Inspector sign-off                  |
| Insulation             | 2 days   | Day 44    | Day 45  | Spray foam or batts                 |
| Drywall                | 5 days   | Day 46    | Day 50  | Hang, tape, mud, sand               |
| Interior Trim          | 5 days   | Day 51    | Day 55  | Doors, baseboards, crown            |
| Painting               | 4 days   | Day 56    | Day 59  | Prime, paint walls/trim/ceiling    |
| Flooring               | 3 days   | Day 56    | Day 58  | Hardwood, tile (parallel w/ paint) |
| Cabinets & Countertops | 3 days   | Day 60    | Day 62  | Install kitchen/bath                |
| Fixtures & Appliances  | 2 days   | Day 63    | Day 64  | Lights, faucets, appliances         |
| Final Cleanup          | 1 day    | Day 65    | Day 65  | Clean, touch-ups                    |
| Final Inspection       | 1 day    | Day 65    | Day 65  | Certificate of occupancy            |

**Note:** Actual timelines vary based on size, complexity, weather, and permit delays. EverBuild adjusts automatically as phases complete early or late.

---

### Contact Information

**Product Owner:** [Your Name]  
**Email:** [your@email.com]  
**Project Repository:** [GitHub URL]  
**Documentation:** [URL to docs]  
**Version Control:** Git / GitHub  

---

**End of Document**
