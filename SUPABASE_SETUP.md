# Supabase Waitlist Setup Guide

This guide explains how to set up Supabase for the EverBuild waitlist form.

## Prerequisites

- A Supabase account (https://supabase.com)
- Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in the project details:
   - **Name**: everbuild-production (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (US for North America)
4. Wait for the project to be created (~2 minutes)

## Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `/supabase/migrations/001_create_waitlist_leads_table.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

This will:
- Create the `waitlist_leads` table with all necessary columns
- Set up indexes for performance
- Create triggers for automatic email lowercasing and timestamp updates
- Configure Row Level Security (RLS) policies

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (the public API key)

## Step 4: Configure Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **IMPORTANT**: Never commit `.env.local` to Git (it's already in `.gitignore`)

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/#signup`

3. Fill out and submit the waitlist form

4. Verify the submission:
   - Go to your Supabase dashboard
   - Navigate to **Table Editor** → **waitlist_leads**
   - You should see your test entry

## Step 6: View Waitlist Leads (Admin)

To view all waitlist leads:

1. Go to **Table Editor** → **waitlist_leads** in your Supabase dashboard
2. You'll see all submissions with:
   - Name, email, company, project count, phone
   - Whether they're interested in a discovery call
   - Lead status (new, contacted, etc.)
   - Timestamps for when they signed up

## Optional: Set Up Email Notifications

To get notified when someone joins the waitlist:

1. Go to **Database** → **Webhooks** in Supabase
2. Create a new webhook for the `waitlist_leads` table
3. Set it to trigger on INSERT
4. Configure it to send to your notification service (Zapier, n8n, etc.)

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and has both variables set
- Restart your development server after adding environment variables

### "Failed to save lead to database" error
- Check that the migration ran successfully
- Verify RLS policies are enabled
- Check browser console for detailed error messages

### Duplicate email error
- This is expected behavior - the system prevents duplicate signups
- The user will see: "This email is already on the waitlist"

## Database Schema

The `waitlist_leads` table includes:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| created_at | timestamptz | When lead was created |
| updated_at | timestamptz | Last update timestamp |
| name | text | Full name (required) |
| email | text | Email address (required, unique) |
| company | text | Company name (optional) |
| project_count | text | Active projects range (optional) |
| phone | text | Phone number (optional) |
| interested_in_call | boolean | Discovery call interest |
| lead_status | text | Lead status tracking |
| lead_source | text | Where lead came from |
| notes | text | Internal notes |
| contacted_at | timestamptz | When first contacted |

## Security Notes

- Row Level Security (RLS) is enabled on the table
- Public users can only INSERT (submit forms)
- Only authenticated users can view/update leads
- Emails are automatically lowercased for consistency
- Duplicate emails are prevented at the database level

## Next Steps

After setup, consider:
1. Setting up a CRM integration (via Supabase webhooks)
2. Creating a simple admin dashboard to view/manage leads
3. Setting up automated email responses to new signups
4. Exporting lead data for marketing campaigns
