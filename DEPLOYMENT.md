# EverBuild - Deployment Guide

This document provides instructions for deploying the EverBuild application to production, specifically targeting Digital Ocean App Platform.

## Environment Variables

### Required Environment Variables

The application requires the following environment variables to function properly. All of these must be configured in your Digital Ocean App Platform settings.

---

### 1. Clerk Authentication

Clerk provides authentication and user management for the application.

#### Public Variables (Safe to expose to browser)

**`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
- **Type**: Public
- **Required**: Yes
- **Description**: Clerk's publishable key for client-side authentication
- **Where to find it**:
  1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
  2. Select your application
  3. Navigate to **API Keys** in the left sidebar
  4. Copy the **Publishable key** (starts with `pk_`)
- **Example**: `pk_test_abc123...`

#### Secret Variables (Server-side only)

**`CLERK_SECRET_KEY`**
- **Type**: Secret
- **Required**: Yes
- **Description**: Clerk's secret key for server-side API calls
- **Where to find it**:
  1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
  2. Select your application
  3. Navigate to **API Keys** in the left sidebar
  4. Copy the **Secret key** (starts with `sk_`)
- **Example**: `sk_test_xyz789...`
- **⚠️ WARNING**: Never expose this to the client

**`CLERK_WEBHOOK_SECRET`**
- **Type**: Secret
- **Required**: Yes
- **Description**: Secret for verifying Clerk webhook signatures
- **Where to find it**:
  1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
  2. Navigate to **Webhooks** in the left sidebar
  3. Click **Add Endpoint**
  4. Set endpoint URL: `https://your-domain.com/api/webhooks/clerk`
  5. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
  6. Copy the **Signing Secret** (starts with `whsec_`)
- **Example**: `whsec_abc123...`
- **⚠️ WARNING**: Never expose this to the client

---

### 2. Supabase Database

Supabase provides the PostgreSQL database and storage backend.

#### Public Variables (Safe to expose to browser)

**`NEXT_PUBLIC_SUPABASE_URL`**
- **Type**: Public
- **Required**: Yes
- **Description**: Your Supabase project URL
- **Where to find it**:
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Navigate to **Settings** → **API**
  4. Copy the **Project URL**
- **Example**: `https://abcdefgh.supabase.co`

**`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- **Type**: Public
- **Required**: Yes
- **Description**: Supabase anonymous/public key (respects RLS policies)
- **Where to find it**:
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Navigate to **Settings** → **API**
  4. Copy the **anon public** key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Note**: This key is safe to expose as it respects Row Level Security (RLS) policies

#### Secret Variables (Server-side only)

**`SUPABASE_SERVICE_ROLE_KEY`**
- **Type**: Secret
- **Required**: Yes
- **Description**: Supabase service role key (bypasses RLS policies)
- **Where to find it**:
  1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
  2. Select your project
  3. Navigate to **Settings** → **API**
  4. Copy the **service_role** key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ WARNING**: This key bypasses all RLS policies. Never expose to the client!
- **⚠️ CRITICAL**: Only use this in server-side code (API routes, server actions)

---

### 3. HubSpot CRM (Waitlist Integration)

HubSpot is used to capture and manage waitlist signups.

#### Secret Variables (Server-side only)

**`HUBSPOT_ACCESS_TOKEN`**
- **Type**: Secret
- **Required**: Yes
- **Description**: Private app access token for HubSpot API
- **Where to find it**:
  1. Go to HubSpot → **Settings** → **Integrations** → **Private Apps**
  2. Create a new Private App (if you haven't already)
  3. Grant these scopes:
     - `crm.objects.contacts.write`
     - `crm.objects.contacts.read`
     - `crm.lists.write`
  4. Copy the **Access Token**
- **Example**: `pat-na1-abc123...`
- **⚠️ WARNING**: Never expose this to the client

**`HUBSPOT_WAITLIST_LIST_ID`**
- **Type**: Secret
- **Required**: Yes
- **Description**: The ID of the HubSpot list for waitlist contacts
- **Where to find it**:
  1. Go to HubSpot → **Contacts** → **Lists**
  2. Create or select your waitlist list
  3. Look at the URL: `lists/12345` - the number is your list ID
- **Example**: `12345`

---

## Digital Ocean App Platform Setup

### Adding Environment Variables

1. **Navigate to your App**:
   - Go to [Digital Ocean Console](https://cloud.digitalocean.com/apps)
   - Select your EverBuild app

2. **Configure Environment Variables**:
   - Click on **Settings** tab
   - Scroll to **Environment Variables**
   - Click **Edit**

3. **Add Each Variable**:
   - For each variable listed above, click **Add Variable**
   - Enter the **Key** (variable name)
   - Enter the **Value** (the actual key/token)
   - Select **Scope**:
     - **All components**: For variables needed by both build and runtime
     - **Build time**: For variables only needed during build
     - **Runtime**: For variables only needed when running the app
   - Toggle **Encrypt**: ON for all secret variables

### Recommended Scope Settings

| Variable | Scope |
|----------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | All components |
| `CLERK_SECRET_KEY` | Runtime |
| `CLERK_WEBHOOK_SECRET` | Runtime |
| `NEXT_PUBLIC_SUPABASE_URL` | All components |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All components |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime |
| `HUBSPOT_ACCESS_TOKEN` | Runtime |
| `HUBSPOT_WAITLIST_LIST_ID` | Runtime |

### Webhook Configuration

After deploying to Digital Ocean, you'll need to update your Clerk webhook endpoint:

1. **Get your production URL**:
   - From Digital Ocean App Platform, copy your app's URL
   - Example: `https://everbuild-abc123.ondigitalocean.app`

2. **Update Clerk webhook**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks**
   - Edit your webhook endpoint
   - Update URL to: `https://your-production-url.com/api/webhooks/clerk`
   - Save changes

3. **Test the webhook**:
   - Create a test user in your production app
   - Verify the user appears in your Supabase database
   - Check Digital Ocean logs for any webhook errors

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured in Digital Ocean
- [ ] Clerk webhook endpoint is updated with production URL
- [ ] Clerk allowlist is configured for beta access control
- [ ] Supabase RLS policies are enabled and tested
- [ ] HubSpot list is created and ID is correct
- [ ] SSL certificate is configured (Digital Ocean handles this automatically)
- [ ] Custom domain is configured (if applicable)
- [ ] Google Analytics is configured (if using)
- [ ] Error tracking is configured (optional - Sentry, etc.)

---

## Beta Access Control

### Clerk Allowlist Configuration

To restrict sign-ups to invite-only beta users:

1. **Enable Allowlist**:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to **User & Authentication** → **Restrictions**
   - Toggle **Allowlist** to ON

2. **Add Allowed Emails/Domains**:
   - Click **Add identifier**
   - Enter individual emails (e.g., `user@example.com`)
   - Or enter entire domains (e.g., `@yourcompany.com`)
   - Save changes

3. **Test**:
   - Try signing up with an email NOT on the allowlist
   - You should see an error message
   - Try signing up with an allowed email
   - Sign-up should succeed

---

## Security Best Practices

### Environment Variable Security

1. **Never commit secrets**:
   - `.env.local` is in `.gitignore` - keep it there
   - Never add actual secrets to `.env.local.example`

2. **Rotate keys regularly**:
   - Plan to rotate API keys every 90 days
   - Update keys in both Clerk/Supabase/HubSpot and Digital Ocean

3. **Use service role key sparingly**:
   - Only use `SUPABASE_SERVICE_ROLE_KEY` in API routes
   - Never expose it to the client
   - Prefer using the anon key with RLS policies when possible

4. **Monitor for leaks**:
   - Use tools like `git-secrets` to scan for accidentally committed secrets
   - Enable GitHub secret scanning
   - Review Digital Ocean access logs regularly

### Database Security

1. **Verify RLS Policies**:
   - All tables should have RLS enabled
   - Test policies with different user roles
   - Use the anon key for client-side operations

2. **Backup Strategy**:
   - Supabase provides automatic daily backups
   - Configure point-in-time recovery for production
   - Test restore process in development

---

## Troubleshooting

### Common Issues

**1. Webhook not receiving events**
- Verify webhook URL is correct and publicly accessible
- Check Clerk webhook logs for delivery attempts
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Check Digital Ocean logs for errors

**2. Database connection errors**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check Supabase project status
- Verify RLS policies aren't blocking access
- Test with service role key to isolate RLS issues

**3. Authentication not working**
- Verify all Clerk env vars are set correctly
- Check that domain is added to Clerk's allowed origins
- Verify redirect URLs are configured in Clerk
- Clear browser cache and cookies

**4. Waitlist form not submitting**
- Verify `HUBSPOT_ACCESS_TOKEN` and `HUBSPOT_WAITLIST_LIST_ID` are set
- Check HubSpot API status
- Verify private app scopes include required permissions
- Check Digital Ocean logs for API error responses

### Viewing Logs

**Digital Ocean Logs**:
1. Go to your app in Digital Ocean Console
2. Click **Runtime Logs** tab
3. Filter by component (web, worker, etc.)
4. Search for error messages

**Supabase Logs**:
1. Go to Supabase Dashboard
2. Navigate to **Logs** in left sidebar
3. Filter by Postgres, Auth, or Realtime
4. Look for failed queries or auth attempts

---

## Support

If you encounter issues during deployment:

1. **Check logs** in Digital Ocean and Supabase
2. **Review documentation**:
   - [Digital Ocean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
   - [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
   - [Clerk Deployment Docs](https://clerk.com/docs/deployments/overview)
   - [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
3. **Contact the team** if you're stuck

---

## Post-Deployment Tasks

After successful deployment:

1. **Test critical flows**:
   - [ ] Sign up with allowlisted email
   - [ ] Sign in with existing account
   - [ ] Create a new project
   - [ ] Add a phase to project
   - [ ] Assign a contact to phase
   - [ ] Upload a document
   - [ ] Test waitlist form on home page

2. **Monitor performance**:
   - Check Digital Ocean metrics
   - Review Supabase query performance
   - Monitor error rates

3. **Set up alerts**:
   - Configure Digital Ocean alerts for downtime
   - Set up error tracking (Sentry, etc.)
   - Monitor Supabase usage limits

---

Last updated: 2025-10-31
