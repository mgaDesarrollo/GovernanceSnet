-- Add optional 'year' column to Proposal for Quarterly Reports
ALTER TABLE "Proposal" ADD COLUMN IF NOT EXISTS "year" INTEGER;
