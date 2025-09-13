const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testComments = [
  {
    content: "Esta propuesta tiene un enfoque muy interesante para la gobernanza descentralizada. Me gusta especialmente la parte del presupuesto transparente.",
    likes: [],
    dislikes: []
  },
  {
    content: "Creo que necesitamos más detalles sobre la implementación técnica. ¿Cómo se asegurará la seguridad de los fondos?",
    likes: [],
    dislikes: []
  },
  {
    content: "Excelente iniciativa! Esto podría revolucionar la forma en que tomamos decisiones en la comunidad.",
    likes: [],
    dislikes: []
  },
  {
    content: "Tengo algunas preocupaciones sobre la escalabilidad. ¿Qué pasa cuando tengamos más usuarios?",
    likes: [],
    dislikes: []
  },
  {
    content: "Me parece una propuesta muy bien estructurada. Los workgroups están bien definidos y el presupuesto es realista.",
    likes: [],
    dislikes: []
  }
];

const testReplies = [
  {
    content: "Tienes razón, la seguridad es fundamental. Deberíamos implementar múltiples capas de verificación.",
    likes: [],
    dislikes: []
  },
  {
    content: "Buena pregunta. Estamos considerando usar sharding para manejar el crecimiento.",
    likes: [],
    dislikes: []
  },
  {
    content: "Totalmente de acuerdo. La transparencia en el presupuesto es clave para la confianza.",
    likes: [],
    dislikes: []
  }
];

async function createTestComments() {
  try {
    console.log('🚀 Starting to create test comments...');
    
    // Obtener la primera propuesta disponible
    const proposal = await prisma.proposal.findFirst({
      select: { id: true, title: true }
    });
    
    if (!proposal) {
      console.log('❌ No proposals found. Please create a proposal first.');
      return;
    }
    
    console.log(`📝 Creating comments for proposal: ${proposal.title}`);
    
    // IDs de usuarios de prueba (cada uno diferente para evitar la restricción única)
    const userIds = [
      "cmesrhb7w0000unw4qh4rkiby", // alexandra_tech
      "cmesrhc3o0006unw4dbld0l4g", // sophia_web3
      "cmesrhcdz0009unw49w9njk1o", // david_consensus
      "cmesrhcob000cunw41nf5c645", // elena_governance
      "cmesrhb7w0000unw4qh4rkiby"  // alexandra_tech (para el último comentario)
    ];
    
    // Verificar que no haya comentarios existentes para esta propuesta
    const existingComments = await prisma.comment.count({
      where: { proposalId: proposal.id }
    });
    
    if (existingComments > 0) {
      console.log(`⚠️  Ya existen ${existingComments} comentarios para esta propuesta.`);
      console.log('💡 Para crear nuevos comentarios, primero elimina los existentes o usa una propuesta diferente.');
      return;
    }
    
    // Crear comentarios principales
    for (let i = 0; i < testComments.length; i++) {
      const commentData = testComments[i];
      const userId = userIds[i];
      
      const comment = await prisma.comment.create({
        data: {
          content: commentData.content,
          userId: userId,
          proposalId: proposal.id,
          likes: commentData.likes,
          dislikes: commentData.dislikes
        }
      });
      
      console.log(`✅ Created comment: ${comment.content.substring(0, 50)}...`);
    }
    
    // Obtener el primer comentario para crear respuestas
    const firstComment = await prisma.comment.findFirst({
      where: { proposalId: proposal.id },
      select: { id: true }
    });
    
    if (firstComment) {
      console.log(`\n💬 Creating replies to comment: ${firstComment.id}`);
      
      // Crear respuestas
      for (const replyData of testReplies) {
        const reply = await prisma.comment.create({
          data: {
            content: replyData.content,
            userId: "cmesrhc3o0006unw4dbld0l4g", // ID de sophia_web3
            proposalId: proposal.id,
            parentId: firstComment.id,
            likes: replyData.likes,
            dislikes: replyData.dislikes
          }
        });
        
        console.log(`✅ Created reply: ${reply.content.substring(0, 50)}...`);
      }
    }
    
    console.log('\n🎉 All test comments created successfully!');
    
    // Verificar los comentarios creados
    const totalComments = await prisma.comment.count({
      where: { proposalId: proposal.id }
    });
    
    const mainComments = await prisma.comment.count({
      where: { 
        proposalId: proposal.id,
        parentId: null
      }
    });
    
    const replies = await prisma.comment.count({
      where: { 
        proposalId: proposal.id,
        parentId: { not: null }
      }
    });
    
    console.log(`\n📊 Comments Summary for proposal "${proposal.title}":`);
    console.log(`   Total comments: ${totalComments}`);
    console.log(`   Main comments: ${mainComments}`);
    console.log(`   Replies: ${replies}`);
    
  } catch (error) {
    console.error('❌ Error creating test comments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestComments();
