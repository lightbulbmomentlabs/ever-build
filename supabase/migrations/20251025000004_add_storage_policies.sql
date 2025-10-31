-- Storage Policies for project-documents bucket
-- These policies allow users to manage documents within their organization's folder
-- Note: RLS is already enabled on storage.objects by default in Supabase

-- Policy: Allow users to view/download documents from their organization
CREATE POLICY "Users can view org documents in storage"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM public.users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Policy: Allow users to upload documents to their organization's folder
CREATE POLICY "Users can upload documents to org folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM public.users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Policy: Allow users to update documents in their organization's folder
CREATE POLICY "Users can update org documents in storage"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM public.users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Policy: Allow users to delete documents from their organization's folder
CREATE POLICY "Users can delete org documents from storage"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'project-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text
    FROM public.users
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  )
);

-- Comments for documentation
COMMENT ON POLICY "Users can view org documents in storage" ON storage.objects
IS 'Allows users to view and download files from their organization folder in project-documents bucket';

COMMENT ON POLICY "Users can upload documents to org folder" ON storage.objects
IS 'Allows users to upload files to their organization folder in project-documents bucket';

COMMENT ON POLICY "Users can delete org documents from storage" ON storage.objects
IS 'Allows users to delete files from their organization folder in project-documents bucket';
