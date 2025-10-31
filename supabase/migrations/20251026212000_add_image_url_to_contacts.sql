-- Add image_url column to contacts table
ALTER TABLE contacts
ADD COLUMN image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN contacts.image_url IS 'URL to the contact image/photo stored in Supabase Storage';
