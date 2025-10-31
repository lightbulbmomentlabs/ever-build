# Known Issues & Limitations - EverBuild MVP

This document tracks known issues, bugs, limitations, and their workarounds. Update this as issues are discovered and resolved.

## Table of Contents

1. [Active Issues](#active-issues)
2. [Known Limitations](#known-limitations)
3. [Resolved Issues](#resolved-issues)
4. [Planned Improvements](#planned-improvements)

---

## Active Issues

### Critical (P0) - Production Broken
*No critical issues at this time*

---

### High Priority (P1) - Major Feature Broken
*No high priority issues at this time*

---

### Medium Priority (P2) - Feature Partially Broken
*No medium priority issues at this time*

---

### Low Priority (P3) - Minor Issues
*No low priority issues at this time*

---

## Known Limitations

These are intentional MVP constraints, not bugs. They will be addressed in future phases.

### Authentication & Onboarding
- **Invite-only access**: Users must be invited via Clerk allowlist
  - *Reason*: MVP is in private beta
  - *Workaround*: Admin manually adds emails to Clerk allowlist
  - *Planned Fix*: Public beta in Phase 2 (Month 4)

- **Single organization per user**: Users can only belong to one organization
  - *Reason*: Simplified MVP data model
  - *Workaround*: User must create separate account for each org
  - *Planned Fix*: Multi-org support in Phase 3 (Month 6)

### Contact Management
- **US phone numbers only**: International phone numbers not supported
  - *Reason*: Twilio configuration and validation for US only
  - *Workaround*: Enter international numbers as notes field
  - *Planned Fix*: International support in Phase 2 (Month 4)

- **No bulk contact import**: Must add contacts one at a time
  - *Reason*: MVP focuses on core CRUD operations
  - *Workaround*: None - manual entry required
  - *Planned Fix*: CSV import in Phase 2 (Month 4)

- **Case-sensitive search**: Contact search is case-sensitive
  - *Reason*: Basic Supabase ILIKE query
  - *Workaround*: Users should search with lowercase
  - *Planned Fix*: Full-text search in Phase 2 (Month 4)

### Project Management
- **Single template only**: Only "Standard 65-Day Spec Home" template available
  - *Reason*: MVP provides one common template
  - *Workaround*: Users can modify template after creation
  - *Planned Fix*: Multiple templates in Phase 2 (Month 5)

- **No project duplication**: Cannot duplicate existing project
  - *Reason*: Not prioritized for MVP
  - *Workaround*: Create new project with same template, manually adjust
  - *Planned Fix*: Clone project feature in Phase 3 (Month 6)

- **No address autocomplete**: Must manually type full address
  - *Reason*: No Google Maps API integration yet
  - *Workaround*: Copy-paste address from Google Maps
  - *Planned Fix*: Address autocomplete in Phase 2 (Month 5)

### Phase Timeline
- **Simple timeline visualization**: Horizontal bars, not full Gantt chart
  - *Reason*: MVP uses CSS-based bars for simplicity
  - *Workaround*: None - basic timeline is functional
  - *Planned Fix*: Interactive Gantt chart in Phase 2 (Month 5)

- **No drag-drop date adjustment**: Must edit phase form to change dates
  - *Reason*: Complex interaction not prioritized for MVP
  - *Workaround*: Use edit modal to adjust dates
  - *Planned Fix*: Drag-drop timeline in Phase 2 (Month 5)

- **No weekend skipping**: Phase dates don't automatically skip weekends
  - *Reason*: Business logic complexity
  - *Workaround*: Manually account for weekends when setting dates
  - *Planned Fix*: Business days calculation in Phase 2 (Month 5)

- **No automatic timeline adjustments**: Delays don't cascade to dependent phases
  - *Reason*: Automation is Phase 2 priority
  - *Workaround*: Manually adjust dependent phase dates
  - *Planned Fix*: Auto-cascade in Phase 2 (Month 4)

### SMS Sending
- **One-way SMS only**: No reply handling or two-way messaging
  - *Reason*: MVP focuses on outbound notifications
  - *Workaround*: Subs can call or text builder's regular phone
  - *Planned Fix*: Two-way SMS with webhooks in Phase 2 (Month 4)

- **No delivery tracking**: Can't confirm if SMS was delivered
  - *Reason*: No Twilio webhook integration yet
  - *Workaround*: Check Twilio dashboard for delivery status
  - *Planned Fix*: Delivery tracking in Phase 2 (Month 4)

- **No message history UI**: SMS logs stored in DB but no UI to view
  - *Reason*: Not prioritized for MVP
  - *Workaround*: Check database directly if needed
  - *Planned Fix*: Message history page in Phase 2 (Month 5)

- **Manual sending only**: No scheduled or automated SMS
  - *Reason*: Automation is core of Phase 2
  - *Workaround*: Set reminders to send SMS manually
  - *Planned Fix*: Automated notifications in Phase 2 (Month 4)

### Dashboard
- **No real-time updates**: Must refresh to see changes
  - *Reason*: No Supabase Realtime subscriptions yet
  - *Workaround*: Refresh page after making changes
  - *Planned Fix*: Real-time updates in Phase 2 (Month 5)

- **No project search**: Must scroll to find project
  - *Reason*: Not prioritized for MVP
  - *Workaround*: Use browser search (Cmd/Ctrl+F)
  - *Planned Fix*: Global search in Phase 3 (Month 6)

### General
- **No undo/redo**: Destructive actions are permanent
  - *Reason*: Complex state management
  - *Workaround*: Use soft deletes (archive) instead of hard deletes
  - *Planned Fix*: Undo for critical actions in Phase 3 (Month 7)

- **No audit log UI**: Changes tracked in DB but no UI
  - *Reason*: Phase 3 feature
  - *Workaround*: Query database directly if audit needed
  - *Planned Fix*: Audit log page in Phase 3 (Month 6)

- **No team collaboration**: Single user per organization only
  - *Reason*: Phase 3 feature
  - *Workaround*: Share login credentials (not recommended)
  - *Planned Fix*: Multi-user with roles in Phase 3 (Month 6)

---

## Resolved Issues

### [Date] - Issue Title
**Priority**: P1
**Description**: Brief description of the issue
**Impact**: What functionality was affected
**Root Cause**: Why the issue occurred
**Fix**: How it was resolved
**Resolved By**: Developer name
**Commit**: Link to commit or PR

*No resolved issues yet - MVP is in development*

---

## Planned Improvements

Tracked in the main PRD roadmap. Key items:

### Phase 2 (Months 4-5)
- Automated SMS notifications
- Real-time timeline adjustments
- Two-way SMS with delivery tracking
- International phone numbers
- Multiple project templates
- CSV contact import
- Interactive Gantt chart timeline

### Phase 3 (Months 6-7)
- Multi-user support with roles
- Audit log UI
- Document management
- Global search
- Project duplication
- Team collaboration

### Phase 4 (Months 8-12)
- Weather integration
- Budget tracking
- Performance analytics
- Mobile native apps
- API access

---

## Reporting Issues

### For Developers

When you discover a bug:

1. **Document it here immediately**
   - Add to appropriate priority section
   - Include reproduction steps
   - Note affected features
   - Assign priority

2. **Create failing test**
   - Write test that exposes the bug
   - Commit test (failing) to track regression

3. **Fix and verify**
   - Implement fix
   - Ensure test passes
   - Run full test suite
   - Move to Resolved Issues section

### For Beta Users

Report issues to: beta@everbuild.app

Include:
- What you were trying to do
- What happened (actual behavior)
- What you expected (expected behavior)
- Steps to reproduce
- Screenshots if applicable
- Device/browser information

---

## Issue Template

Use this template when adding new issues:

```markdown
### [Date] - Short Issue Title

**Priority**: P0/P1/P2/P3
**Status**: Investigating / In Progress / Fixed

**Description**:
Clear description of the issue.

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen.

**Actual Behavior**:
What actually happens.

**Impact**:
Which features/users are affected.

**Workaround** (if available):
Temporary solution until fixed.

**Root Cause** (if known):
Technical reason for the issue.

**Proposed Fix**:
How to resolve it.

**Related Issues**:
Links to related bugs or features.

**Assigned To**: Developer name
**Target Fix Date**: Date
```

---

## Bug Priority Guidelines

### P0 (Critical) - Fix Immediately
- App is completely broken
- Data loss occurring
- Security vulnerability
- Payment processing broken
- No workaround available

**SLA**: Fix within 4 hours

### P1 (High) - Fix Within 24 Hours
- Major feature completely broken
- Blocking beta users from core workflows
- Workaround is difficult or unknown

**SLA**: Fix within 24 hours

### P2 (Medium) - Fix Within 1 Week
- Feature partially broken
- Affects some users
- Workaround exists but inconvenient

**SLA**: Fix within 1 week

### P3 (Low) - Fix in Next Sprint
- Minor cosmetic issues
- Edge case bugs
- Nice-to-have improvements
- Workaround is easy

**SLA**: Fix in next development sprint

---

**Last Updated**: [Date]
**Maintained By**: Development Team
