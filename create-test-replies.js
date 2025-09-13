const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestReplies() {
  try {
    console.log('Creating test replies...');
    
    // Get existing comments
    const comments = await prisma.consensusComment.findMany({
      where: { 
        reportId: 'test-report-1',
        parentCommentId: null // Only main comments
      }
    });

    if (comments.length === 0) {
      console.log('No comments found. Please create comments first.');
      return;
    }

    // Get test user
    const user = await prisma.user.findFirst({
      where: { id: 'test-user-1' }
    });

    if (!user) {
      console.log('Test user not found.');
      return;
    }

    // Check if replies already exist
    const existingReplies = await prisma.consensusComment.findMany({
      where: { 
        reportId: 'test-report-1',
        parentCommentId: { not: null }
      }
    });

    if (existingReplies.length > 0) {
      console.log('Test replies already exist:', existingReplies.length);
      return;
    }

    // Create replies to the first comment
    const firstComment = comments[0];
    
    const reply1 = await prisma.consensusComment.create({
      data: {
        userId: user.id,
        reportId: 'test-report-1',
        parentCommentId: firstComment.id,
        content: 'Esta es una respuesta del administrador al comentario anterior. Gracias por tu feedback.',
        likes: [],
        dislikes: []
      }
    });

    const reply2 = await prisma.consensusComment.create({
      data: {
        userId: user.id,
        reportId: 'test-report-1',
        parentCommentId: firstComment.id,
        content: 'Otra respuesta para mostrar cómo se ven las respuestas anidadas.',
        likes: [],
        dislikes: []
      }
    });

    console.log('Created test replies:');
    console.log('- Reply 1:', reply1.id);
    console.log('- Reply 2:', reply2.id);

    console.log('Test replies created successfully!');

  } catch (error) {
    console.error('Error creating test replies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReplies(); 