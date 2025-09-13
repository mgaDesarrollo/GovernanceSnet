-- Create the storage policy function
create or replace function create_storage_policy(
  bucket_name text,
  policy_name text,
  definition text
)
returns void
language plpgsql
security definer
as $$
begin
  execute format(
    'create policy if not exists %I on storage.objects
     for insert
     to authenticated
     using (bucket_id = %L and %s)',
    policy_name,
    bucket_name,
    definition
  );
end;
$$;

-- Create initial policies
select create_storage_policy(
  'proposal-attachments',
  'proposal_attachments_insert_policy',
  '(auth.role() = ''authenticated'')'
);

-- Allow authenticated users to read files
create policy "Authenticated users can read files"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'proposal-attachments' );

-- Allow authenticated users to insert files
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'proposal-attachments' );

-- Allow authenticated users to update their own files
create policy "Authenticated users can update own files"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'proposal-attachments' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Allow authenticated users to delete their own files
create policy "Authenticated users can delete own files"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'proposal-attachments' AND auth.uid()::text = (storage.foldername(name))[1] );
