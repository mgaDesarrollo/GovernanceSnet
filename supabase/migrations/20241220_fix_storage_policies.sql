-- Fix storage policies for NextAuth integration
-- Drop existing policies first
DROP POLICY IF EXISTS "proposal_attachments_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;

-- Create new policies that work with NextAuth
-- Allow authenticated users to read files (any authenticated user)
CREATE POLICY "Allow authenticated users to read files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

-- Allow authenticated users to upload files (any authenticated user)
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proposal-attachments');

-- Allow authenticated users to update files (any authenticated user)
CREATE POLICY "Allow authenticated users to update files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

-- Allow authenticated users to delete files (any authenticated user)
CREATE POLICY "Allow authenticated users to delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'proposal-attachments');

-- Also create a policy for the service role (for admin operations)
CREATE POLICY "Allow service role full access"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'proposal-attachments')
  WITH CHECK (bucket_id = 'proposal-attachments');
