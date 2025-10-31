# EverBuild MVP - Setup Instructions

This document outlines the remaining setup steps to complete the authentication and onboarding flow for the EverBuild MVP.

## Current Status

✅ **Completed:**
- Next.js 14+ project structure with App Router
- Supabase database schema deployed
- Clerk authentication integrated
- Foundational code architecture (validations, services, utilities)
- Testing infrastructure (Vitest + Playwright)
- Authentication pages (sign-in/sign-up)
- Dashboard skeleton with navigation
- Webhook handler for Clerk user synchronization
- API routes for user data

## Required Setup Steps

### 1. Configure Clerk Webhook

The Clerk webhook is essential for synchronizing users between Clerk and Supabase.

#### Steps:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Select your application
2. Navigate to **Webhooks** in the left sidebar
3. Click **Add Endpoint**
4. Set the endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - For local development, you can use a tool like [ngrok](https://ngrok.com) to create a tunnel
   - Example: `https://abc123.ngrok.io/api/webhooks/clerk`
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add it to your `.env.local` file:
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

### 2. Configure Clerk Allowlist (Invite-Only Access)

To implement invite-only beta access:

#### Steps:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Select your application
2. Navigate to **User & Authentication** → **Restrictions**
3. Enable **Allowlist**
4. Add email addresses or domains you want to allow:
   - Individual emails: `user@example.com`
   - Entire domains: `@yourcompany.com`
5. Users not on the allowlist will see an error when trying to sign up

### 3. Test the Authentication Flow

Once the webhook is configured:

1. Start the development server:
   ```bash
   PORT=3002 pnpm dev
   ```

2. Test user registration:
   - Visit `http://localhost:3002/sign-up`
   - Register a new user with an email on your allowlist
   - Check Supabase to verify the user was created in the `users` table
   - Check that an organization was automatically created in the `organizations` table

3. Test sign-in:
   - Visit `http://localhost:3002/sign-in`
   - Sign in with the registered user
   - Verify you're redirected to `/dashboard`

4. Test protected routes:
   - Try accessing `/dashboard` without being signed in
   - Verify you're redirected to `/sign-in`

### 4. Verify Webhook in Development

If testing webhooks locally with ngrok:

1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3002`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update the Clerk webhook endpoint URL to: `https://abc123.ngrok.io/api/webhooks/clerk`
5. Test user creation and check ngrok logs to see webhook events

### 5. Next Development Steps

After authentication is working, proceed with Week 2 development:

1. **Contacts Management** (Week 3 in original plan, can be done earlier):
   - Create contact list page with data table
   - Create contact detail/edit pages
   - Create add contact form
   - Implement contact search and filtering
   - Add unit tests for contact service

2. **Projects Management** (Week 2):
   - Create project list page
   - Create project detail page
   - Create add/edit project forms
   - Implement project filtering
   - Add unit tests for project service

3. **Phase Management** (Week 2):
   - Create phase list within project details
   - Create add/edit phase forms
   - Implement phase dependency logic
   - Calculate phase dates automatically
   - Add unit tests for phase calculations

## Testing Commands

After setup is complete, use these commands to ensure everything works:

```bash
# Run all tests
pnpm test:ci

# Run unit tests only
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Check test coverage
pnpm test:coverage

# Run tests in watch mode during development
pnpm test:watch
```

## Environment Variables Checklist

Ensure all required environment variables are set in `.env.local`:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ⚠️  `CLERK_WEBHOOK_SECRET` (needs to be configured)
- ✅ `TWILIO_ACCOUNT_SID`
- ✅ `TWILIO_AUTH_TOKEN`
- ✅ `TWILIO_PHONE_NUMBER`
- ✅ `HUBSPOT_ACCESS_TOKEN`
- ✅ `HUBSPOT_WAITLIST_LIST_ID`
- ✅ `NEXT_PUBLIC_APP_URL`

## Troubleshooting

### Webhook Not Receiving Events
- Verify the webhook URL is publicly accessible
- Check that the signing secret is correct in `.env.local`
- Verify the webhook is subscribed to the correct events
- Check Clerk Dashboard → Webhooks → Event Log for delivery status

### User Not Created in Supabase
- Check the webhook logs for errors
- Verify Supabase Service Role Key is correct
- Check Supabase RLS policies are not blocking the insert
- Verify the database schema is applied correctly

### Authentication Redirects Not Working
- Check middleware configuration in `middleware.ts`
- Verify Clerk publishable key and secret key are correct
- Clear browser cookies and try again

### Build Errors
- Run `pnpm build` to check for TypeScript errors
- Verify all dependencies are installed: `pnpm install`
- Check that all imports are correct

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Testing Documentation](./TESTING.md)
- [Feature Test Checklists](./FEATURE_TESTS.md)
- [MVP PRD](./EverBuild-MVP-PRD.md)

## Support

If you encounter issues during setup, check:
1. The error message in the terminal
2. Browser console for client-side errors
3. Clerk Dashboard → Event Log for webhook issues
4. Supabase Dashboard → Logs for database issues
