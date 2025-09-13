-- Drop unique index on Comment(userId, proposalId) to allow multiple comments and replies per user per proposal
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname = 'Comment_userId_proposalId_key'
  ) THEN
    DROP INDEX "public"."Comment_userId_proposalId_key";
  END IF;
END $$;
