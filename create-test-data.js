const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('🚀 Creando datos de prueba...')

    // Crear workgroups de prueba
    const workgroups = [
      {
        name: 'Frontend Development Team',
        type: 'DEVELOPMENT',
        status: 'ACTIVE',
        description: 'Equipo especializado en desarrollo frontend con React, Next.js y TypeScript',
        mission: 'Crear interfaces de usuario excepcionales y experiencias de usuario fluidas',
        scope: 'Desarrollo de componentes UI, páginas web y aplicaciones frontend',
        budget: 50000,
        memberCount: 8,
        quarterlyReports: []
      },
      {
        name: 'Backend Infrastructure',
        type: 'INFRASTRUCTURE',
        status: 'ACTIVE',
        description: 'Equipo responsable de la infraestructura backend, bases de datos y APIs',
        mission: 'Mantener sistemas robustos, escalables y seguros',
        scope: 'APIs, bases de datos, servidores y servicios backend',
        budget: 75000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Design & UX',
        type: 'DESIGN',
        status: 'ACTIVE',
        description: 'Equipo de diseño centrado en la experiencia del usuario y la interfaz',
        mission: 'Crear diseños intuitivos y visualmente atractivos',
        scope: 'Diseño de interfaces, prototipos, investigación de usuarios',
        budget: 35000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Quality Assurance',
        type: 'TESTING',
        status: 'ACTIVE',
        description: 'Equipo de control de calidad y testing automatizado',
        mission: 'Asegurar la calidad y estabilidad de todos los productos',
        scope: 'Testing manual y automatizado, control de calidad, reportes de bugs',
        budget: 40000,
        memberCount: 4,
        quarterlyReports: []
      },
      {
        name: 'Product Management',
        type: 'MANAGEMENT',
        status: 'ACTIVE',
        description: 'Equipo de gestión de productos y roadmap estratégico',
        mission: 'Definir y ejecutar la estrategia de productos',
        scope: 'Roadmap de productos, análisis de mercado, definición de features',
        budget: 60000,
        memberCount: 3,
        quarterlyReports: []
      }
    ]

    console.log('📋 Creando workgroups...')
    const createdWorkgroups = []
    
    for (const workgroup of workgroups) {
      const created = await prisma.workGroup.create({
        data: workgroup
      })
      createdWorkgroups.push(created)
      console.log(`✅ Workgroup creado: ${created.name}`)
    }

    // Crear propuestas de prueba
    const proposals = [
      {
        title: 'Implementación de Sistema de Notificaciones Push',
        description: 'Propuesta para implementar un sistema completo de notificaciones push que permita a los usuarios recibir alertas en tiempo real sobre actualizaciones importantes, cambios de estado en propuestas y actividades relevantes en sus workgroups.',
        proposalType: 'COMMUNITY_PROPOSAL',
        budgetItems: [
          {
            description: 'Servicio de notificaciones push (Firebase/SendGrid)',
            category: 'Infraestructura',
            quantity: 1,
            unit: 'servicio',
            unitPrice: 500,
            total: 500
          },
          {
            description: 'Desarrollo frontend de configuración',
            category: 'Desarrollo',
            quantity: 40,
            unit: 'horas',
            unitPrice: 75,
            total: 3000
          },
          {
            description: 'Desarrollo backend de API',
            category: 'Desarrollo',
            quantity: 60,
            unit: 'horas',
            unitPrice: 75,
            total: 4500
          },
          {
            description: 'Testing y QA',
            category: 'Calidad',
            quantity: 20,
            unit: 'horas',
            unitPrice: 60,
            total: 1200
          }
        ],
        workGroupIds: [createdWorkgroups[0].id, createdWorkgroups[1].id],
        status: 'IN_REVIEW',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        positiveVotes: 12,
        negativeVotes: 2,
        abstainVotes: 1
      },
      {
        title: 'Rediseño del Dashboard Principal',
        description: 'Propuesta para rediseñar completamente el dashboard principal con una interfaz más moderna, mejor organización de la información y nuevas funcionalidades de personalización para mejorar la experiencia del usuario.',
        proposalType: 'COMMUNITY_PROPOSAL',
        budgetItems: [
          {
            description: 'Diseño de nueva interfaz',
            category: 'Diseño',
            quantity: 80,
            unit: 'horas',
            unitPrice: 65,
            total: 5200
          },
          {
            description: 'Implementación frontend',
            category: 'Desarrollo',
            quantity: 120,
            unit: 'horas',
            unitPrice: 75,
            total: 9000
          },
          {
            description: 'Testing de usabilidad',
            category: 'Testing',
            quantity: 30,
            unit: 'horas',
            unitPrice: 60,
            total: 1800
          }
        ],
        workGroupIds: [createdWorkgroups[2].id, createdWorkgroups[0].id],
        status: 'APPROVED',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
        positiveVotes: 18,
        negativeVotes: 0,
        abstainVotes: 2,
        consensusDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Aprobado hace 5 días
      },
      {
        title: 'Sistema de Reportes Automatizados',
        description: 'Implementación de un sistema que genere reportes automáticos sobre el rendimiento de los workgroups, métricas de propuestas y análisis de participación de usuarios.',
        proposalType: 'QUARTERLY_REPORT',
        budgetItems: [
          {
            description: 'Desarrollo de motor de reportes',
            category: 'Desarrollo',
            quantity: 100,
            unit: 'horas',
            unitPrice: 75,
            total: 7500
          },
          {
            description: 'Integración con bases de datos',
            category: 'Infraestructura',
            quantity: 40,
            unit: 'horas',
            unitPrice: 80,
            total: 3200
          },
          {
            description: 'Diseño de templates de reportes',
            category: 'Diseño',
            quantity: 25,
            unit: 'horas',
            unitPrice: 65,
            total: 1625
          }
        ],
        workGroupIds: [createdWorkgroups[1].id, createdWorkgroups[4].id],
        status: 'IN_REVIEW',
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 días
        positiveVotes: 8,
        negativeVotes: 3,
        abstainVotes: 2
      },
      {
        title: 'Migración a Base de Datos Cloud',
        description: 'Propuesta para migrar la base de datos actual a una solución cloud que proporcione mejor escalabilidad, respaldos automáticos y mayor disponibilidad.',
        proposalType: 'COMMUNITY_PROPOSAL',
        budgetItems: [
          {
            description: 'Servicio de base de datos cloud (AWS RDS/Google Cloud SQL)',
            category: 'Infraestructura',
            quantity: 12,
            unit: 'meses',
            unitPrice: 800,
            total: 9600
          },
          {
            description: 'Migración de datos',
            category: 'Servicios',
            quantity: 50,
            unit: 'horas',
            unitPrice: 90,
            total: 4500
          },
          {
            description: 'Testing de rendimiento',
            category: 'Testing',
            quantity: 25,
            unit: 'horas',
            unitPrice: 60,
            total: 1500
          }
        ],
        workGroupIds: [createdWorkgroups[1].id, createdWorkgroups[3].id],
        status: 'REJECTED',
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expiró hace 10 días
        positiveVotes: 6,
        negativeVotes: 15,
        abstainVotes: 4
      },
      {
        title: 'Implementación de Chat en Tiempo Real',
        description: 'Sistema de chat en tiempo real para facilitar la comunicación entre miembros de workgroups y colaboración en proyectos.',
        proposalType: 'COMMUNITY_PROPOSAL',
        budgetItems: [
          {
            description: 'Servicio de WebSockets (Socket.io)',
            category: 'Infraestructura',
            quantity: 1,
            unit: 'servicio',
            unitPrice: 300,
            total: 300
          },
          {
            description: 'Desarrollo del chat',
            category: 'Desarrollo',
            quantity: 80,
            unit: 'horas',
            unitPrice: 75,
            total: 6000
          },
          {
            description: 'Diseño de interfaz de chat',
            category: 'Diseño',
            quantity: 35,
            unit: 'horas',
            unitPrice: 65,
            total: 2275
          }
        ],
        workGroupIds: [createdWorkgroups[0].id, createdWorkgroups[2].id],
        status: 'IN_REVIEW',
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        positiveVotes: 14,
        negativeVotes: 1,
        abstainVotes: 3
      }
    ]

    console.log('📝 Creando propuestas...')
    
    for (const proposal of proposals) {
      const created = await prisma.proposal.create({
        data: {
          ...proposal,
          authorId: 'clx1234567890abcdef', // ID de usuario de ejemplo
          workgroupId: proposal.workGroupIds[0], // Usar el primer workgroup como principal
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Fecha aleatoria en los últimos 30 días
          updatedAt: new Date()
        }
      })
      console.log(`✅ Propuesta creada: ${created.title}`)
    }

    console.log('🎉 ¡Datos de prueba creados exitosamente!')
    console.log(`📊 Se crearon ${createdWorkgroups.length} workgroups`)
    console.log(`📝 Se crearon ${proposals.length} propuestas`)
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestData()
}

module.exports = { createTestData }
