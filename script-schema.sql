
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'Proposal' 
AND column_name IN ('createdAt', 'updatedAt');

-- If needed, we can manually update existing records to set updatedAt = createdAt for records that haven't been edited
UPDATE "Proposal" 
SET "updatedAt" = "createdAt" 
WHERE "updatedAt" = "createdAt";
