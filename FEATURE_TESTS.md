# Feature Testing Checklist - EverBuild MVP

This document tracks testing coverage for each feature in the MVP. Use this to ensure comprehensive testing and prevent regressions when adding new features.

## Table of Contents

1. [Feature 1: Authentication & Onboarding](#feature-1-authentication--onboarding)
2. [Feature 2: Contact Management](#feature-2-contact-management)
3. [Feature 3: Project Creation & Management](#feature-3-project-creation--management)
4. [Feature 4: Phase Timeline Management](#feature-4-phase-timeline-management)
5. [Feature 5: Contact Assignment to Phases](#feature-5-contact-assignment-to-phases)
6. [Feature 6: Dashboard](#feature-6-dashboard)
7. [Feature 7: Manual SMS Sending](#feature-7-manual-sms-sending)
8. [Feature 8: Navigation & Layout](#feature-8-navigation--layout)
9. [Cross-Feature Integration Tests](#cross-feature-integration-tests)

---

## Feature 1: Authentication & Onboarding

### Overview
Frictionless signup flow using Clerk with invite-only access, organization creation, and redirect to dashboard.

### Acceptance Criteria
- [ ] Signup completes in under 2 minutes
- [ ] User sees personalized welcome message with company name
- [ ] Clerk session persists across page refreshes
- [ ] Mobile-responsive signup forms
- [ ] Invite-only access enforced

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/auth/validation.test.ts
- [ ] validates email format
- [ ] validates password strength requirements
- [ ] validates company name (not empty)
- [ ] validates phone number format (US)
- [ ] rejects invalid phone formats
```

#### Integration Tests
```typescript
// tests/integration/api/auth.test.ts
- [ ] POST /api/user/create - creates user record in Supabase after Clerk signup
- [ ] POST /api/user/create - creates organization for new user
- [ ] POST /api/user/create - links Clerk user_id to Supabase user
- [ ] POST /api/user/create - rejects duplicate email
- [ ] POST /api/user/create - returns 400 for invalid data
- [ ] POST /api/user/create - returns 500 for database errors
```

#### Component Tests
```typescript
// tests/components/auth/SignUpForm.test.tsx
- [ ] renders all form fields (email, password, name, company, phone)
- [ ] validates required fields on submit
- [ ] shows validation errors inline
- [ ] disables submit button while submitting
- [ ] shows loading state during submission
- [ ] redirects to dashboard on success
- [ ] shows error message on failure
- [ ] password field has show/hide toggle
- [ ] accepts valid phone formats (555-555-5555, (555) 555-5555, etc.)
```

#### E2E Tests
```typescript
// tests/e2e/auth.spec.ts
- [ ] user can sign up with valid data and see dashboard
- [ ] user cannot sign up without invite code
- [ ] user sees validation errors for invalid data
- [ ] user can sign in after signing up
- [ ] user session persists after page refresh
- [ ] user is redirected to signin if not authenticated
- [ ] user can sign out successfully
- [ ] organization is created and visible in database
```

### Manual Test Checklist
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test keyboard navigation
- [ ] Test on slow 3G connection
- [ ] Test invite-only access (with and without valid invite)
- [ ] Verify email validation edge cases
- [ ] Verify password strength indicator works
- [ ] Verify company name appears in welcome message

### Known Issues / Limitations
- None yet

### Edge Cases to Test
- [ ] User navigates away during signup (data persists in form)
- [ ] User closes browser during signup (no partial account created)
- [ ] User tries to sign up with existing email
- [ ] User enters international phone number
- [ ] User enters very long company name (>100 chars)

---

## Feature 2: Contact Management

### Overview
Centralized directory for storing subcontractor and vendor information with search, filter, and CRUD operations.

### Acceptance Criteria
- [ ] Can add unlimited contacts
- [ ] Phone number validation (US format)
- [ ] Contacts appear instantly after saving (optimistic UI)
- [ ] Can edit and archive contacts (soft delete)
- [ ] Search returns results as user types (debounced)
- [ ] Mobile-optimized with large touch targets

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/validation/contact.test.ts
- [ ] validates phone number formats
- [ ] accepts various phone formats (with/without dashes, parentheses)
- [ ] rejects invalid phone numbers
- [ ] validates email format (optional field)
- [ ] validates lead_time_days is positive integer
- [ ] validates trade selection

// tests/unit/utils/phone.test.ts
- [ ] formats phone number for display
- [ ] normalizes phone number for storage
- [ ] generates tel: link from phone number
```

#### Integration Tests
```typescript
// tests/integration/api/contacts.test.ts
- [ ] GET /api/contacts - returns all contacts for organization
- [ ] GET /api/contacts - filters by trade
- [ ] GET /api/contacts - searches by name/company
- [ ] GET /api/contacts - excludes archived contacts by default
- [ ] GET /api/contacts - respects RLS (only org's contacts)
- [ ] POST /api/contacts - creates new contact
- [ ] POST /api/contacts - returns 400 for invalid data
- [ ] POST /api/contacts - validates phone format
- [ ] GET /api/contacts/[id] - returns single contact
- [ ] GET /api/contacts/[id] - returns 404 for non-existent contact
- [ ] PATCH /api/contacts/[id] - updates contact
- [ ] PATCH /api/contacts/[id] - validates updated data
- [ ] DELETE /api/contacts/[id] - archives contact (soft delete)
- [ ] DELETE /api/contacts/[id] - doesn't delete from database
```

#### Component Tests
```typescript
// tests/components/contacts/ContactForm.test.tsx
- [ ] renders all form fields
- [ ] validates required fields (company, person, trade, phone)
- [ ] shows validation errors inline
- [ ] phone field shows formatting hints
- [ ] trade selector shows preset trades + custom option
- [ ] lead time defaults to 2 days
- [ ] notes field accepts long text
- [ ] submit button disabled until valid
- [ ] calls onSubmit with correct data
- [ ] clears form after successful submit
- [ ] shows error message on submit failure

// tests/components/contacts/ContactList.test.tsx
- [ ] renders contacts in table/card view
- [ ] shows empty state when no contacts
- [ ] search filters contacts as user types
- [ ] debounces search input (300ms)
- [ ] trade filter works correctly
- [ ] clicking contact opens detail view
- [ ] call button generates tel: link
- [ ] text button opens SMS modal
- [ ] edit button opens edit form
- [ ] archive button shows confirmation
- [ ] archived contacts not shown in list

// tests/components/contacts/ContactDetail.test.tsx
- [ ] displays all contact information
- [ ] shows project history for contact
- [ ] shows phases assigned to contact
- [ ] quick actions (call/text/edit) work
- [ ] archive confirmation modal appears
```

#### E2E Tests
```typescript
// tests/e2e/contact-management.spec.ts
- [ ] user can add new contact with all fields
- [ ] user can add contact with only required fields
- [ ] user sees validation errors for invalid data
- [ ] user can search for contact by name
- [ ] user can filter contacts by trade
- [ ] user can edit existing contact
- [ ] user can archive contact
- [ ] archived contact doesn't appear in list
- [ ] user can view contact details
- [ ] user can call contact (tel: link works)
- [ ] user can text contact (opens SMS modal)
- [ ] contacts persist after page refresh
```

### Manual Test Checklist
- [ ] Test on mobile with various phone formats
- [ ] Test search performance with 100+ contacts
- [ ] Test filter combinations
- [ ] Test keyboard navigation through list
- [ ] Test screen reader announcement of contact count
- [ ] Test long contact names and company names
- [ ] Test notes field with very long text
- [ ] Test call/text actions on mobile device
- [ ] Verify optimistic UI updates feel instant

### Known Issues / Limitations
- Phone validation currently US-only
- Search is case-sensitive (to be improved)
- No bulk import yet (Phase 2)

### Edge Cases to Test
- [ ] Contact with no secondary phone or email
- [ ] Contact with very long notes (>1000 chars)
- [ ] Contact with special characters in name
- [ ] Search with no results
- [ ] Filter with no matching contacts
- [ ] Rapid typing in search field (debouncing)
- [ ] Editing contact while viewing detail
- [ ] Archiving contact assigned to active phase

---

## Feature 3: Project Creation & Management

### Overview
Create spec home projects with basic details, use templates for phases, and manage project lifecycle.

### Acceptance Criteria
- [ ] Project creation takes under 5 minutes
- [ ] Template applies phases automatically with sequential dates
- [ ] Can edit project details after creation
- [ ] Projects appear on dashboard immediately
- [ ] Can have unlimited active projects

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/services/project.test.ts
- [ ] validates project name (not empty)
- [ ] validates address fields
- [ ] validates zip code format
- [ ] validates target completion date is future
- [ ] validates square footage is positive number
- [ ] calculates days until completion
- [ ] determines if project is on schedule

// tests/unit/templates/project-templates.test.ts
- [ ] Standard 65-Day template has all phases
- [ ] phases are in correct sequence
- [ ] phase durations add up to 65 days
- [ ] template can be customized
- [ ] template calculates dates from start date
```

#### Integration Tests
```typescript
// tests/integration/api/projects.test.ts
- [ ] GET /api/projects - returns all projects for organization
- [ ] GET /api/projects - filters by status
- [ ] GET /api/projects - respects RLS
- [ ] POST /api/projects - creates project with template
- [ ] POST /api/projects - creates project without template
- [ ] POST /api/projects - creates phases from template
- [ ] POST /api/projects - validates project data
- [ ] POST /api/projects - returns 400 for invalid data
- [ ] GET /api/projects/[id] - returns project with phases
- [ ] GET /api/projects/[id] - returns 404 for non-existent project
- [ ] PATCH /api/projects/[id] - updates project details
- [ ] PATCH /api/projects/[id] - doesn't update phases on project edit
- [ ] DELETE /api/projects/[id] - archives project
- [ ] DELETE /api/projects/[id] - cascades to phases
- [ ] GET /api/projects/templates - returns available templates
```

#### Component Tests
```typescript
// tests/components/projects/ProjectForm.test.tsx
- [ ] renders all required fields
- [ ] validates required fields
- [ ] address fields auto-capitalize
- [ ] zip code field limits to 5 digits
- [ ] target date picker shows calendar
- [ ] target date must be future date
- [ ] template selector shows available templates
- [ ] template preview shows phases
- [ ] can skip template and start blank
- [ ] submit creates project with correct data
- [ ] shows loading state during creation
- [ ] redirects to project page on success

// tests/components/projects/ProjectList.test.tsx
- [ ] renders projects as cards
- [ ] shows empty state for new user
- [ ] filters by status (active/completed/on hold)
- [ ] sorts by date, name, etc.
- [ ] shows current phase for each project
- [ ] shows days remaining
- [ ] shows progress bar
- [ ] clicking card opens project detail

// tests/components/projects/ProjectDetail.test.tsx
- [ ] displays all project information
- [ ] shows timeline of phases
- [ ] edit button opens edit form
- [ ] archive button shows confirmation
- [ ] tabs switch between overview/timeline/contacts
```

#### E2E Tests
```typescript
// tests/e2e/project-creation.spec.ts
- [ ] user can create project with template
- [ ] user can create project from scratch
- [ ] template phases appear immediately
- [ ] user can edit template phases before saving
- [ ] user can edit project after creation
- [ ] user can archive project
- [ ] archived project moves to completed
- [ ] user can view project timeline
- [ ] user can navigate between project tabs
- [ ] project appears on dashboard after creation
```

### Manual Test Checklist
- [ ] Test on mobile (form should be easy to fill)
- [ ] Test address autocomplete if implemented
- [ ] Test date picker on mobile
- [ ] Test creating multiple projects in succession
- [ ] Test very long project names
- [ ] Test projects with same address (different lots)
- [ ] Verify template phases are editable
- [ ] Verify archived projects don't appear in active list

### Known Issues / Limitations
- No address autocomplete yet (Phase 2)
- Only one template available in MVP
- No project duplication feature yet

### Edge Cases to Test
- [ ] Project with very long address
- [ ] Project with PO Box address
- [ ] Project with completion date 1 year+ out
- [ ] Project with completion date 1 day out
- [ ] Creating project without template
- [ ] Modifying template phases during creation
- [ ] Navigating away during project creation
- [ ] Archiving project with active phases

---

## Feature 4: Phase Timeline Management

### Overview
Break projects into sequential phases with start/end dates, dependencies, and status tracking.

### Acceptance Criteria
- [ ] Can add unlimited phases per project
- [ ] Phase dates calculate automatically (start + duration = end)
- [ ] Can set phase dependencies (predecessor must complete first)
- [ ] Timeline visualization is clear on mobile
- [ ] Changes save immediately (optimistic UI)

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/services/phase.test.ts
- [ ] calculates phase end date from start + duration
- [ ] validates predecessor creates no circular dependency
- [ ] validates phase sequence order
- [ ] calculates buffer days between phases
- [ ] determines if phase can start (predecessor complete)
- [ ] calculates total project duration
- [ ] identifies critical path
- [ ] detects schedule conflicts

// tests/unit/utils/date-calculator.test.ts
- [ ] adds days to date correctly
- [ ] skips weekends if configured
- [ ] handles month boundaries
- [ ] handles year boundaries
- [ ] calculates business days
- [ ] calculates days between dates
```

#### Integration Tests
```typescript
// tests/integration/api/phases.test.ts
- [ ] GET /api/projects/[id]/phases - returns all phases for project
- [ ] GET /api/projects/[id]/phases - orders by sequence
- [ ] POST /api/projects/[id]/phases - creates new phase
- [ ] POST /api/projects/[id]/phases - validates phase data
- [ ] POST /api/projects/[id]/phases - calculates end date
- [ ] POST /api/projects/[id]/phases - validates no circular dependencies
- [ ] GET /api/phases/[id] - returns phase details
- [ ] PATCH /api/phases/[id] - updates phase dates
- [ ] PATCH /api/phases/[id] - recalculates dependent phases
- [ ] PATCH /api/phases/[id] - updates status
- [ ] PATCH /api/phases/[id] - validates status transitions
- [ ] DELETE /api/phases/[id] - deletes phase
- [ ] DELETE /api/phases/[id] - updates dependent phases
```

#### Component Tests
```typescript
// tests/components/phases/PhaseForm.test.tsx
- [ ] renders all fields
- [ ] validates required fields (name, start date, duration)
- [ ] duration must be positive integer
- [ ] calculates and displays end date
- [ ] predecessor dropdown shows available phases
- [ ] prevents selecting phases that would create cycle
- [ ] buffer days defaults to 0
- [ ] status dropdown shows valid statuses
- [ ] description is optional
- [ ] submit button disabled until valid

// tests/components/phases/PhaseTimeline.test.tsx
- [ ] renders horizontal timeline bars
- [ ] phases appear in sequence order
- [ ] phase width corresponds to duration
- [ ] shows current date indicator
- [ ] completed phases show in green
- [ ] in-progress phases show in blue
- [ ] not-started phases show in gray
- [ ] delayed phases show in yellow
- [ ] dependencies show as connecting lines
- [ ] hovering phase shows details tooltip
- [ ] clicking phase opens phase detail
- [ ] responsive on mobile (stacks vertically)

// tests/components/phases/PhaseList.test.tsx
- [ ] renders phases in table format
- [ ] shows all phase details (dates, duration, status)
- [ ] sortable by date, name, status
- [ ] shows assigned contacts
- [ ] edit button opens phase form
- [ ] delete button shows confirmation
- [ ] reorder handles allow drag-drop (future)
```

#### E2E Tests
```typescript
// tests/e2e/phase-management.spec.ts
- [ ] user can add phase to project
- [ ] user can add phase with predecessor
- [ ] user can edit phase dates
- [ ] dependent phases shift automatically
- [ ] user can change phase status
- [ ] user can delete phase
- [ ] user can view timeline visualization
- [ ] timeline is responsive on mobile
- [ ] user can add buffer days between phases
- [ ] validation prevents circular dependencies
```

### Manual Test Checklist
- [ ] Test timeline visualization on various screen sizes
- [ ] Test creating 20+ phases (performance)
- [ ] Test complex dependency chains
- [ ] Test phase date calculations across months
- [ ] Test status transitions (not started → in progress → completed)
- [ ] Verify timeline colors are accessible (color blind friendly)
- [ ] Test drag-drop reordering (if implemented)
- [ ] Test printing timeline view

### Known Issues / Limitations
- Timeline is simple bars, not full Gantt chart (Phase 2)
- No drag-drop date adjustment yet
- No automatic weekend skipping yet

### Edge Cases to Test
- [ ] Phase with 0 duration (milestone)
- [ ] Phase with 100+ day duration
- [ ] Project with 50+ phases
- [ ] Deleting phase that has dependents
- [ ] Changing phase that affects multiple dependents
- [ ] Phase dates spanning year boundary
- [ ] Circular dependency detection (A→B→C→A)
- [ ] Moving completed phase (should this be allowed?)

---

## Feature 5: Contact Assignment to Phases

### Overview
Assign subcontractors and vendors to specific construction phases, creating the connection between contacts and work.

### Acceptance Criteria
- [ ] Can assign unlimited contacts to a phase
- [ ] Can assign same contact to multiple phases
- [ ] Search filters contacts by trade for easier selection
- [ ] Quick actions (call/text) work from phase view
- [ ] Removing assignment doesn't delete the contact

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/services/phase-contacts.test.ts
- [ ] validates contact belongs to same organization as project
- [ ] validates role field (if provided)
- [ ] validates notification_advance_days is positive
- [ ] prevents duplicate assignments (same contact + phase)
```

#### Integration Tests
```typescript
// tests/integration/api/phase-contacts.test.ts
- [ ] GET /api/phases/[id]/contacts - returns assigned contacts
- [ ] GET /api/phases/[id]/contacts - includes contact details
- [ ] GET /api/phases/[id]/contacts - includes role and notification settings
- [ ] POST /api/phases/[id]/contacts - assigns contact to phase
- [ ] POST /api/phases/[id]/contacts - validates contact exists
- [ ] POST /api/phases/[id]/contacts - prevents duplicate assignment
- [ ] POST /api/phases/[id]/contacts - returns 400 for invalid data
- [ ] DELETE /api/phases/[id]/contacts/[contactId] - removes assignment
- [ ] DELETE /api/phases/[id]/contacts/[contactId] - doesn't delete contact record
- [ ] GET /api/contacts/[id]/phases - returns phases for contact (reverse lookup)
```

#### Component Tests
```typescript
// tests/components/phases/ContactAssignment.test.tsx
- [ ] shows list of assigned contacts
- [ ] shows empty state when no contacts assigned
- [ ] "Assign Contact" button opens modal
- [ ] modal shows searchable contact list
- [ ] modal filters by trade
- [ ] modal highlights already-assigned contacts
- [ ] can select contact and assign
- [ ] can set role (optional)
- [ ] can set notification advance days
- [ ] shows confirmation after assignment
- [ ] remove button shows confirmation
- [ ] displays contact's trade badge
- [ ] quick action buttons work (call/text)

// tests/components/contacts/ContactSelector.test.tsx
- [ ] renders searchable dropdown
- [ ] searches contacts as user types
- [ ] filters by trade if provided
- [ ] displays contact name and company
- [ ] shows trade badge for each contact
- [ ] handles empty search results
- [ ] keyboard navigation works
```

#### E2E Tests
```typescript
// tests/e2e/contact-assignment.spec.ts
- [ ] user can assign contact to phase
- [ ] user can assign multiple contacts to one phase
- [ ] user can assign one contact to multiple phases
- [ ] user can set role when assigning
- [ ] user can remove contact from phase
- [ ] user can view assigned contacts in phase detail
- [ ] user can call assigned contact from phase view
- [ ] user can text assigned contact from phase view
- [ ] user can view all phases for a contact
- [ ] assignments persist after page refresh
```

### Manual Test Checklist
- [ ] Test search performance with 100+ contacts
- [ ] Test filtering by relevant trades
- [ ] Test assigning contact with very long name
- [ ] Test removing assignment with confirmation
- [ ] Test quick actions on mobile device
- [ ] Verify contact's phase list updates after assignment
- [ ] Verify phase's contact list updates after removal
- [ ] Test assigning archived contact (should this be allowed?)

### Known Issues / Limitations
- No bulk assignment yet
- No assignment history/audit trail yet
- Role field is free text (no preset roles)

### Edge Cases to Test
- [ ] Assigning contact to phase in different project
- [ ] Removing contact assigned as Lead (affects notifications)
- [ ] Assigning contact to completed phase
- [ ] Contact assigned to sequential phases (Rough-In Plumbing → Final Plumbing)
- [ ] Contact with multiple roles (e.g., Plumber + Material Supplier)
- [ ] Very high notification advance days (30+ days)
- [ ] Zero notification advance days

---

## Feature 6: Dashboard

### Overview
At-a-glance view of all active projects with summary stats, progress indicators, and quick actions.

### Acceptance Criteria
- [ ] Dashboard loads in under 2 seconds
- [ ] Shows up to 50 projects without performance issues
- [ ] Responsive on mobile (cards stack vertically)
- [ ] Empty state is encouraging and clear
- [ ] Real-time updates when editing project

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/services/dashboard.test.ts
- [ ] calculates total active projects correctly
- [ ] calculates on-track vs delayed projects
- [ ] calculates progress percentage per project
- [ ] determines current phase for project
- [ ] calculates days remaining until completion
- [ ] sorts projects by various criteria
```

#### Integration Tests
```typescript
// tests/integration/api/dashboard.test.ts
- [ ] GET /api/dashboard - returns summary stats
- [ ] GET /api/dashboard - returns project list with details
- [ ] GET /api/dashboard - includes current phase for each project
- [ ] GET /api/dashboard - calculates progress correctly
- [ ] GET /api/dashboard - respects project status filters
- [ ] GET /api/dashboard - paginates for 100+ projects
- [ ] GET /api/dashboard - caches data appropriately
- [ ] dashboard query is optimized (uses joins, not N+1)
```

#### Component Tests
```typescript
// tests/components/dashboard/Dashboard.test.tsx
- [ ] renders summary stats at top
- [ ] shows correct project count
- [ ] shows project cards
- [ ] empty state shows for new users
- [ ] empty state has "Create Project" CTA
- [ ] filters work (All/Active/Completed)
- [ ] sort dropdown changes order
- [ ] loading state shows while fetching

// tests/components/dashboard/ProjectCard.test.tsx
- [ ] displays project name and address
- [ ] shows current phase name and dates
- [ ] displays progress bar with percentage
- [ ] status indicator color matches status
- [ ] "View Project" button links correctly
- [ ] quick actions work (if implemented)
- [ ] shows days remaining or overdue
- [ ] on-track badge shows for healthy projects
- [ ] delayed badge shows for late projects

// tests/components/dashboard/SummaryStats.test.tsx
- [ ] shows total projects count
- [ ] shows on-track count
- [ ] shows delayed count
- [ ] updates when projects change
- [ ] animates numbers on change (optional)
```

#### E2E Tests
```typescript
// tests/e2e/dashboard.spec.ts
- [ ] user sees empty state on first login
- [ ] user can create first project from empty state
- [ ] dashboard shows projects after creation
- [ ] clicking project card navigates to project
- [ ] filters update project list
- [ ] sort changes project order
- [ ] creating new project updates dashboard
- [ ] archiving project removes from dashboard
- [ ] dashboard shows loading state initially
```

### Manual Test Checklist
- [ ] Test dashboard with 0, 1, 10, 50 projects
- [ ] Test on mobile (cards should stack nicely)
- [ ] Test on tablet (2-column layout)
- [ ] Test scrolling performance with many projects
- [ ] Verify progress bars are accurate
- [ ] Test filter combinations
- [ ] Test empty state messaging and CTA
- [ ] Verify real-time updates (open in two tabs)

### Known Issues / Limitations
- No real-time updates in MVP (refresh required)
- No project search on dashboard yet
- No bulk actions yet

### Edge Cases to Test
- [ ] User with 100+ projects (pagination)
- [ ] Projects with identical names
- [ ] Projects with very long names (truncation)
- [ ] Projects with completion date in past
- [ ] Projects with no phases
- [ ] Projects with all phases completed
- [ ] Dashboard loading slow network (3G)
- [ ] Dashboard with stale cache data

---

## Feature 7: Manual SMS Sending

### Overview
Send text messages to contacts directly from the app with message templates and logging.

### Acceptance Criteria
- [ ] SMS sends successfully via Twilio
- [ ] Character count shows (160 chars = 1 SMS, warn if over)
- [ ] Message templates save time
- [ ] Can't send empty messages
- [ ] Error handling if SMS fails
- [ ] Messages logged in database

### Automated Test Coverage

#### Unit Tests
```typescript
// tests/unit/services/sms.test.ts
- [ ] validates phone number before sending
- [ ] counts message characters correctly
- [ ] calculates SMS segments (160 chars = 1 segment)
- [ ] formats message templates with variables
- [ ] validates message not empty
- [ ] sanitizes message content

// tests/unit/templates/sms-templates.test.ts
- [ ] phase reminder template fills variables correctly
- [ ] schedule change template fills variables correctly
- [ ] custom template validates placeholders
```

#### Integration Tests
```typescript
// tests/integration/api/sms.test.ts
- [ ] POST /api/sms/send - sends SMS via Twilio (test mode)
- [ ] POST /api/sms/send - validates phone number
- [ ] POST /api/sms/send - validates message not empty
- [ ] POST /api/sms/send - returns 400 for invalid data
- [ ] POST /api/sms/send - logs message in database
- [ ] POST /api/sms/send - associates with contact/project/phase
- [ ] POST /api/sms/send - handles Twilio errors gracefully
- [ ] POST /api/sms/send - returns Twilio SID on success
- [ ] POST /api/sms/send - respects rate limits
```

#### Component Tests
```typescript
// tests/components/sms/SendSMSModal.test.tsx
- [ ] renders modal when opened
- [ ] pre-fills recipient from context
- [ ] shows recipient name and phone
- [ ] text area for message
- [ ] character counter updates as user types
- [ ] warns when exceeding 160 chars (multiple segments)
- [ ] template selector shows available templates
- [ ] selecting template fills message
- [ ] template variables are replaced (name, date, etc.)
- [ ] send button disabled when message empty
- [ ] shows loading state while sending
- [ ] shows success confirmation after send
- [ ] shows error message if send fails
- [ ] closes modal after success

// tests/components/sms/MessageTemplates.test.tsx
- [ ] displays available templates
- [ ] templates show preview
- [ ] clicking template populates message
- [ ] templates fill placeholders correctly
```

#### E2E Tests
```typescript
// tests/e2e/sms-sending.spec.ts
- [ ] user can send SMS from contact detail
- [ ] user can send SMS from phase view
- [ ] user can use template
- [ ] user can type custom message
- [ ] user sees character count
- [ ] user sees warning for long messages
- [ ] user sees success confirmation
- [ ] user sees error if send fails
- [ ] message appears in database after sending
- [ ] Twilio receives message (test mode)
```

### Manual Test Checklist
- [ ] Test sending SMS to real phone number (Twilio test mode)
- [ ] Test message with special characters
- [ ] Test very long message (> 160 chars)
- [ ] Test message with emojis (count as 2 chars)
- [ ] Test all message templates
- [ ] Test template variable replacement
- [ ] Verify message logged in database
- [ ] Test error handling (invalid phone, Twilio error)
- [ ] Test on mobile (keyboard should stay open)

### Known Issues / Limitations
- SMS is one-way only (no replies yet)
- US phone numbers only
- No delivery tracking yet (webhook needed)
- No message history UI yet (in database only)

### Edge Cases to Test
- [ ] Sending to contact with no phone number
- [ ] Sending to invalid phone number
- [ ] Sending message with 0 characters
- [ ] Sending message with 1000+ characters
- [ ] Sending message with only spaces
- [ ] Twilio API timeout
- [ ] Twilio account out of credits
- [ ] Rate limit exceeded (multiple sends)
- [ ] Network error during send

---

## Feature 8: Navigation & Layout

### Overview
Clean, intuitive navigation structure with sidebar (desktop) and bottom nav (mobile).

### Acceptance Criteria
- [ ] Navigation is consistent across all pages
- [ ] Active page is clearly highlighted
- [ ] Breadcrumbs help user understand location
- [ ] Mobile navigation accessible with thumbs

### Automated Test Coverage

#### Component Tests
```typescript
// tests/components/layout/Navigation.test.tsx
- [ ] renders all nav items
- [ ] highlights active page
- [ ] shows user menu
- [ ] sign out link works
- [ ] mobile nav shows bottom bar
- [ ] desktop nav shows sidebar
- [ ] logo links to dashboard
- [ ] icons are accessible (aria-labels)

// tests/components/layout/Breadcrumbs.test.tsx
- [ ] shows correct breadcrumb trail
- [ ] links work for each breadcrumb
- [ ] current page not linked
- [ ] truncates long project names
- [ ] responsive on mobile

// tests/components/layout/TopBar.test.tsx
- [ ] shows company name/logo
- [ ] shows user menu
- [ ] user menu has sign out option
- [ ] user menu has settings link
- [ ] profile picture shows if available

// tests/components/layout/Sidebar.test.tsx
- [ ] shows all nav items
- [ ] highlights current route
- [ ] collapses on mobile
- [ ] icons and text visible
- [ ] logout button at bottom
```

#### E2E Tests
```typescript
// tests/e2e/navigation.spec.ts
- [ ] user can navigate to all main pages
- [ ] active page is highlighted
- [ ] breadcrumbs show correct path
- [ ] back button navigates correctly
- [ ] user can sign out from any page
- [ ] navigation works on mobile
- [ ] keyboard navigation works
- [ ] navigation persists user session
```

### Manual Test Checklist
- [ ] Test on mobile (bottom nav should be easy to reach)
- [ ] Test on tablet (sidebar or bottom nav?)
- [ ] Test keyboard navigation (Tab key)
- [ ] Test with screen reader
- [ ] Verify active page highlight is clear
- [ ] Test breadcrumbs on deep pages (Project → Phase → Contact)
- [ ] Verify logo links to dashboard
- [ ] Test user menu dropdown

### Known Issues / Limitations
- No notifications icon yet (Phase 2)
- No global search yet
- No keyboard shortcuts yet

### Edge Cases to Test
- [ ] Very long project name in breadcrumbs
- [ ] User with no projects (nav still works)
- [ ] Deep nesting in breadcrumbs (4+ levels)
- [ ] Navigating back after signing in
- [ ] Direct URL access (deep link)
- [ ] Navigation on slow network (loading states)

---

## Cross-Feature Integration Tests

These tests verify that multiple features work together correctly.

### End-to-End User Journeys

```typescript
// tests/e2e/user-journeys.spec.ts

describe('Complete Project Setup Journey', () => {
  it('new user completes full onboarding and creates first project', async () => {
    // 1. Sign up
    // 2. See empty dashboard
    // 3. Add 3 contacts
    // 4. Create project with template
    // 5. Assign contacts to phases
    // 6. View dashboard with project
    // 7. Sign out and back in
    // 8. Verify data persists
  });

  it('user manages project from start to finish', async () => {
    // 1. Create project
    // 2. Add phases
    // 3. Assign contacts
    // 4. Update phase status to in-progress
    // 5. Send SMS to contact
    // 6. Complete phase
    // 7. Verify next phase dates adjust
    // 8. Complete all phases
    // 9. Archive project
  });

  it('user coordinates schedule change across multiple contacts', async () => {
    // 1. Open project with assigned contacts
    // 2. Edit phase date (push out 2 days)
    // 3. Verify dependent phases shift
    // 4. Send SMS to affected contacts
    // 5. Verify message logs in database
    // 6. Check dashboard reflects changes
  });
});
```

### Data Consistency Tests

```typescript
// tests/integration/data-consistency.test.ts

describe('Data Consistency', () => {
  it('deleting project cascades to phases', async () => {});
  it('archiving contact removes from phases', async () => {});
  it('RLS prevents cross-organization data access', async () => {});
  it('updating phase dates maintains dependency integrity', async () => {});
  it('concurrent edits handle conflicts correctly', async () => {});
});
```

### Performance Tests

```typescript
// tests/performance/load-times.test.ts

describe('Performance', () => {
  it('dashboard loads in < 2 seconds with 50 projects', async () => {});
  it('project page loads in < 1 second', async () => {});
  it('contact search returns results in < 500ms', async () => {});
  it('SMS sends in < 2 seconds', async () => {});
  it('app remains responsive with 100+ contacts', async () => {});
});
```

### Security Tests

```typescript
// tests/security/authorization.test.ts

describe('Security & Authorization', () => {
  it('user cannot access another org's projects', async () => {});
  it('user cannot access another org's contacts', async () => {});
  it('API routes require authentication', async () => {});
  it('RLS policies enforce org boundaries', async () => {});
  it('public SMS status form requires valid token', async () => {});
});
```

---

## Regression Test Protocol

When adding new features or making changes:

1. **Before Starting**
   - [ ] Run full test suite to establish baseline
   - [ ] Document current coverage percentage
   - [ ] Review potentially affected features

2. **During Development**
   - [ ] Write tests for new feature
   - [ ] Run affected feature tests frequently
   - [ ] Update this document with new test cases

3. **After Completion**
   - [ ] Run full test suite
   - [ ] Verify no existing tests broken
   - [ ] Check coverage hasn't decreased
   - [ ] Add regression tests for any bugs found
   - [ ] Update feature status in this document

4. **Before Deployment**
   - [ ] Run complete E2E suite
   - [ ] Manual testing on staging
   - [ ] Cross-browser testing
   - [ ] Mobile device testing
   - [ ] Accessibility audit

---

## Test Coverage Tracking

| Feature | Unit | Integration | Component | E2E | Manual | Status |
|---------|------|-------------|-----------|-----|--------|--------|
| Authentication | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Contacts | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Projects | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Phases | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Contact Assignment | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Dashboard | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| SMS | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |
| Navigation | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 0% | 🔴 Not Tested | 🔴 Not Started |

Legend:
- 🔴 0-49% coverage
- 🟡 50-79% coverage
- 🟢 80-100% coverage

Update this table as tests are implemented.

---

**Last Updated:** [Date]
**Updated By:** [Your Name]
