-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CORE_CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "public"."UserAvailabilityStatus" AS ENUM ('AVAILABLE', 'BUSY', 'VERY_BUSY');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."VoteType" AS ENUM ('POSITIVE', 'NEGATIVE', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "public"."ConsensusStatus" AS ENUM ('PENDING', 'IN_CONSENSUS', 'CONSENSED');

-- CreateEnum
CREATE TYPE "public"."ConsensusVoteType" AS ENUM ('A_FAVOR', 'EN_CONTRA', 'OBJETAR', 'ABSTENERSE');

-- CreateEnum
CREATE TYPE "public"."ObjectionStatus" AS ENUM ('PENDIENTE', 'VALIDA', 'INVALIDA');

-- CreateEnum
CREATE TYPE "public"."VotingRoundStatus" AS ENUM ('ACTIVA', 'CERRADA', 'CONSENSADA');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CORE_CONTRIBUTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT,
    "status" "public"."UserAvailabilityStatus" DEFAULT 'AVAILABLE',
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "fullname" VARCHAR(255),
    "skills" TEXT,
    "country" VARCHAR(255),
    "languages" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfessionalProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tagline" VARCHAR(255),
    "bio" TEXT,
    "experience" TEXT,
    "linkCv" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialLinks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "facebook" VARCHAR(2048),
    "linkedin" VARCHAR(2048),
    "github" VARCHAR(2048),
    "x" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "positiveVotes" INTEGER NOT NULL DEFAULT 0,
    "negativeVotes" INTEGER NOT NULL DEFAULT 0,
    "abstainVotes" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "workgroupId" TEXT,
    "attachment" TEXT,
    "proposalType" TEXT NOT NULL DEFAULT 'COMMUNITY_PROPOSAL',
    "budgetItems" JSONB,
    "workGroupIds" TEXT[],
    "consensusDate" TIMESTAMP(3),
    "quarter" TEXT,
    "links" JSONB,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vote" (
    "id" TEXT NOT NULL,
    "type" "public"."VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateOfCreation" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "missionStatement" TEXT NOT NULL,
    "goalsAndFocus" TEXT[],
    "totalMembers" TEXT NOT NULL,
    "roles" TEXT[],
    "memberDirectoryLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkGroupMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workGroupId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkGroupJoinRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workGroupId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkGroupJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsensusVote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" "public"."ConsensusVoteType" NOT NULL,
    "comment" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsensusVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConsensusComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "likes" TEXT[],
    "dislikes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsensusComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Objection" (
    "id" TEXT NOT NULL,
    "voteId" TEXT NOT NULL,
    "status" "public"."ObjectionStatus" NOT NULL DEFAULT 'PENDIENTE',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VotingRound" (
    "id" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" "public"."VotingRoundStatus" NOT NULL DEFAULT 'ACTIVA',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "VotingRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserWorkgroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserWorkgroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalProfile_userId_key" ON "public"."ProfessionalProfile"("userId");

-- CreateIndex
CREATE INDEX "ProfessionalProfile_userId_idx" ON "public"."ProfessionalProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinks_userId_key" ON "public"."SocialLinks"("userId");

-- CreateIndex
CREATE INDEX "SocialLinks_userId_idx" ON "public"."SocialLinks"("userId");

-- CreateIndex
CREATE INDEX "Proposal_authorId_idx" ON "public"."Proposal"("authorId");

-- CreateIndex
CREATE INDEX "Proposal_workgroupId_idx" ON "public"."Proposal"("workgroupId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "public"."Vote"("userId");

-- CreateIndex
CREATE INDEX "Vote_proposalId_idx" ON "public"."Vote"("proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_proposalId_key" ON "public"."Vote"("userId", "proposalId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_proposalId_idx" ON "public"."Comment"("proposalId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_userId_proposalId_key" ON "public"."Comment"("userId", "proposalId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkGroup_name_key" ON "public"."WorkGroup"("name");

-- CreateIndex
CREATE INDEX "ConsensusVote_roundId_idx" ON "public"."ConsensusVote"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsensusVote_userId_roundId_key" ON "public"."ConsensusVote"("userId", "roundId");

-- CreateIndex
CREATE INDEX "ConsensusComment_parentCommentId_idx" ON "public"."ConsensusComment"("parentCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "Objection_voteId_key" ON "public"."Objection"("voteId");

-- CreateIndex
CREATE INDEX "Objection_status_idx" ON "public"."Objection"("status");

-- CreateIndex
CREATE INDEX "VotingRound_status_idx" ON "public"."VotingRound"("status");

-- CreateIndex
CREATE INDEX "_UserWorkgroups_B_index" ON "public"."_UserWorkgroups"("B");

-- AddForeignKey
ALTER TABLE "public"."ProfessionalProfile" ADD CONSTRAINT "ProfessionalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialLinks" ADD CONSTRAINT "SocialLinks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_workgroupId_fkey" FOREIGN KEY ("workgroupId") REFERENCES "public"."WorkGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkGroupMember" ADD CONSTRAINT "WorkGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkGroupMember" ADD CONSTRAINT "WorkGroupMember_workGroupId_fkey" FOREIGN KEY ("workGroupId") REFERENCES "public"."WorkGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkGroupJoinRequest" ADD CONSTRAINT "WorkGroupJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkGroupJoinRequest" ADD CONSTRAINT "WorkGroupJoinRequest_workGroupId_fkey" FOREIGN KEY ("workGroupId") REFERENCES "public"."WorkGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsensusVote" ADD CONSTRAINT "ConsensusVote_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "public"."VotingRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsensusVote" ADD CONSTRAINT "ConsensusVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsensusComment" ADD CONSTRAINT "ConsensusComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."ConsensusComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConsensusComment" ADD CONSTRAINT "ConsensusComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Objection" ADD CONSTRAINT "Objection_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Objection" ADD CONSTRAINT "Objection_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "public"."ConsensusVote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserWorkgroups" ADD CONSTRAINT "_UserWorkgroups_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserWorkgroups" ADD CONSTRAINT "_UserWorkgroups_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."WorkGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
