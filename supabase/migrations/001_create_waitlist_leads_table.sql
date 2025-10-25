-- Create waitlist_leads table
CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    company text,
    project_count text,
    phone text,
    interested_in_call boolean DEFAULT false NOT NULL,
    lead_status text DEFAULT 'new' NOT NULL CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
    lead_source text DEFAULT 'website_waitlist' NOT NULL,
    notes text,
    contacted_at timestamptz
);

-- Create indexes
CREATE INDEX idx_waitlist_leads_email ON public.waitlist_leads(email);
CREATE INDEX idx_waitlist_leads_created_at ON public.waitlist_leads(created_at DESC);
CREATE INDEX idx_waitlist_leads_lead_status ON public.waitlist_leads(lead_status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_waitlist_leads_updated_at
    BEFORE UPDATE ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to lowercase email before insert/update
CREATE OR REPLACE FUNCTION public.lowercase_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email = LOWER(TRIM(NEW.email));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to lowercase email
CREATE TRIGGER lowercase_waitlist_leads_email
    BEFORE INSERT OR UPDATE OF email ON public.waitlist_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.lowercase_email();

-- Enable Row Level Security
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for public inserts (form submissions)
CREATE POLICY "Allow public to insert waitlist leads"
    ON public.waitlist_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy for authenticated users to view all leads
CREATE POLICY "Allow authenticated users to view all leads"
    ON public.waitlist_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy for authenticated users to update leads
CREATE POLICY "Allow authenticated users to update leads"
    ON public.waitlist_leads
    FOR UPDATE
    TO authenticated
    USING (true);

-- Add comment to table
COMMENT ON TABLE public.waitlist_leads IS 'Stores leads from the EverBuild waitlist signup form';
