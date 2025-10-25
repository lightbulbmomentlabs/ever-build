-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public to insert waitlist leads" ON public.waitlist_leads;
DROP POLICY IF EXISTS "Allow authenticated users to view all leads" ON public.waitlist_leads;
DROP POLICY IF EXISTS "Allow authenticated users to update leads" ON public.waitlist_leads;

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.waitlist_leads TO anon;

-- Recreate the INSERT policy for anon role (public form submissions)
CREATE POLICY "Enable insert for anon users"
    ON public.waitlist_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Recreate policies for authenticated users
CREATE POLICY "Enable read for authenticated users"
    ON public.waitlist_leads
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update for authenticated users"
    ON public.waitlist_leads
    FOR UPDATE
    TO authenticated
    USING (true);
