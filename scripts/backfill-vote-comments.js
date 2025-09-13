// Backfill Vote.comment from top-level Comment matching (userId, proposalId)
// Usage: node scripts/backfill-vote-comments.js

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('Starting backfill of vote comments...')

    const votes = await prisma.vote.findMany({
      select: { id: true, userId: true, proposalId: true, comment: true },
    })

    let updated = 0
    for (const v of votes) {
      if (v.comment && v.comment.trim().length > 0) continue
      const c = await prisma.comment.findFirst({
        where: { userId: v.userId, proposalId: v.proposalId, parentId: null },
        select: { content: true },
      })
      if (c && c.content && c.content.trim().length > 0) {
        await prisma.vote.update({
          where: { id: v.id },
          data: { comment: c.content.trim() },
        })
        updated++
      }
    }

    console.log(`Backfill complete. Updated ${updated} votes.`)
  } catch (err) {
    console.error('Backfill error:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
