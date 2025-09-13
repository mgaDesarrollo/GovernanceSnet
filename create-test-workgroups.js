const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestWorkgroups() {
  try {
    console.log('🚀 Creando workgroups de prueba...')

    // Crear workgroups de prueba
    const workgroups = [
      // Workgroups existentes mejorados
      {
        name: 'Frontend Development Team',
        type: 'DEVELOPMENT',
        status: 'ACTIVE',
        description: 'Equipo especializado en desarrollo frontend con React, Next.js y TypeScript. Responsable de crear interfaces de usuario excepcionales y experiencias de usuario fluidas.',
        mission: 'Crear interfaces de usuario excepcionales y experiencias de usuario fluidas que deleiten a nuestros usuarios',
        scope: 'Desarrollo de componentes UI, páginas web, aplicaciones frontend, optimización de performance y accesibilidad',
        budget: 75000,
        memberCount: 12,
        quarterlyReports: []
      },
      {
        name: 'Backend Infrastructure',
        type: 'INFRASTRUCTURE',
        status: 'ACTIVE',
        description: 'Equipo responsable de la infraestructura backend, bases de datos y APIs. Mantiene sistemas robustos, escalables y seguros.',
        mission: 'Mantener sistemas robustos, escalables y seguros que soporten el crecimiento de la plataforma',
        scope: 'APIs, bases de datos, servidores, servicios backend, monitoreo y escalabilidad',
        budget: 120000,
        memberCount: 8,
        quarterlyReports: []
      },
      {
        name: 'Design & UX',
        type: 'DESIGN',
        status: 'ACTIVE',
        description: 'Equipo de diseño centrado en la experiencia del usuario y la interfaz. Crea diseños intuitivos y visualmente atractivos.',
        mission: 'Crear diseños intuitivos y visualmente atractivos que mejoren la experiencia del usuario',
        scope: 'Diseño de interfaces, prototipos, investigación de usuarios, sistemas de diseño y branding',
        budget: 55000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Quality Assurance',
        type: 'TESTING',
        status: 'ACTIVE',
        description: 'Equipo de control de calidad y testing automatizado. Asegura la calidad y estabilidad de todos los productos.',
        mission: 'Asegurar la calidad y estabilidad de todos los productos a través de testing exhaustivo',
        scope: 'Testing manual y automatizado, control de calidad, reportes de bugs, CI/CD testing',
        budget: 65000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Product Management',
        type: 'MANAGEMENT',
        status: 'ACTIVE',
        description: 'Equipo de gestión de productos y roadmap estratégico. Define y ejecuta la estrategia de productos.',
        mission: 'Definir y ejecutar la estrategia de productos que impulse el crecimiento del negocio',
        scope: 'Roadmap de productos, análisis de mercado, definición de features, métricas de producto',
        budget: 85000,
        memberCount: 4,
        quarterlyReports: []
      },
      // Nuevos workgroups aleatorios
      {
        name: 'AI Research & Development',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Equipo dedicado a la investigación y desarrollo de inteligencia artificial y machine learning. Explora nuevas tecnologías y aplica IA a productos existentes.',
        mission: 'Innovar en el campo de la IA para crear soluciones inteligentes que transformen la experiencia del usuario',
        scope: 'Machine Learning, Deep Learning, NLP, Computer Vision, investigación aplicada, prototipos de IA',
        budget: 150000,
        memberCount: 8,
        quarterlyReports: []
      },
      {
        name: 'Blockchain & Web3',
        type: 'INNOVATION',
        status: 'ACTIVE',
        description: 'Equipo pionero en tecnologías blockchain y Web3. Desarrolla soluciones descentralizadas y explora el futuro de internet.',
        mission: 'Construir el futuro descentralizado de internet a través de tecnologías blockchain innovadoras',
        scope: 'Smart Contracts, DeFi, NFTs, DApps, integración blockchain, investigación Web3',
        budget: 180000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Mobile Development',
        type: 'DEVELOPMENT',
        status: 'ACTIVE',
        description: 'Equipo especializado en desarrollo móvil nativo y cross-platform. Crea aplicaciones móviles excepcionales para iOS y Android.',
        mission: 'Crear aplicaciones móviles excepcionales que proporcionen valor real a los usuarios móviles',
        scope: 'iOS Development, Android Development, React Native, Flutter, mobile UI/UX, app store optimization',
        budget: 95000,
        memberCount: 7,
        quarterlyReports: []
      },
      {
        name: 'Data Science & Analytics',
        type: 'ANALYTICS',
        status: 'ACTIVE',
        description: 'Equipo de científicos de datos y analistas que transforman datos en insights accionables. Impulsa decisiones basadas en datos.',
        mission: 'Transformar datos en insights accionables que impulsen decisiones estratégicas y mejoren productos',
        scope: 'Análisis de datos, machine learning aplicado, visualización, métricas de producto, A/B testing',
        budget: 110000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Cloud Infrastructure',
        type: 'INFRASTRUCTURE',
        status: 'ACTIVE',
        description: 'Equipo responsable de la infraestructura cloud y servicios en la nube. Optimiza costos y mejora la escalabilidad.',
        mission: 'Proporcionar infraestructura cloud escalable, segura y rentable que soporte el crecimiento del negocio',
        scope: 'AWS, Azure, GCP, Kubernetes, Docker, serverless, cost optimization, cloud security',
        budget: 140000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Security & Compliance',
        type: 'SECURITY',
        status: 'ACTIVE',
        description: 'Equipo de seguridad que protege la plataforma y asegura el cumplimiento normativo. Implementa mejores prácticas de seguridad.',
        mission: 'Proteger la plataforma y los datos de los usuarios mientras aseguramos el cumplimiento normativo',
        scope: 'Security audits, penetration testing, compliance, security monitoring, incident response, security training',
        budget: 90000,
        memberCount: 4,
        quarterlyReports: []
      },
      {
        name: 'DevOps & Automation',
        type: 'OPERATIONS',
        status: 'ACTIVE',
        description: 'Equipo que automatiza procesos de desarrollo y despliegue. Mejora la velocidad de entrega y la calidad del código.',
        mission: 'Acelerar la entrega de software a través de automatización y mejores prácticas de DevOps',
        scope: 'CI/CD pipelines, infrastructure as code, monitoring, logging, automation, deployment strategies',
        budget: 100000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Game Development',
        type: 'CREATIVE',
        status: 'ACTIVE',
        description: 'Equipo creativo que desarrolla juegos y experiencias interactivas. Combina arte, tecnología y narrativa.',
        mission: 'Crear experiencias de juego inmersivas y entretenidas que conecten con los usuarios',
        scope: 'Game design, Unity development, 3D modeling, game mechanics, user experience, monetization',
        budget: 200000,
        memberCount: 10,
        quarterlyReports: []
      },
      {
        name: 'Marketing & Growth',
        type: 'MARKETING',
        status: 'ACTIVE',
        description: 'Equipo de marketing digital que impulsa el crecimiento de la plataforma. Desarrolla estrategias de adquisición y retención.',
        mission: 'Impulsar el crecimiento de la plataforma a través de estrategias de marketing digital efectivas',
        scope: 'Digital marketing, SEO, social media, content marketing, growth hacking, analytics',
        budget: 80000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Customer Success',
        type: 'SUPPORT',
        status: 'ACTIVE',
        description: 'Equipo dedicado a la satisfacción del cliente y soporte técnico. Asegura que los usuarios tengan éxito con la plataforma.',
        mission: 'Asegurar que cada usuario tenga éxito con nuestra plataforma y se convierta en un defensor de la marca',
        scope: 'Customer support, onboarding, training, success metrics, feedback collection, user advocacy',
        budget: 70000,
        memberCount: 8,
        quarterlyReports: []
      },
      {
        name: 'Research & Innovation',
        type: 'RESEARCH',
        status: 'ACTIVE',
        description: 'Equipo de investigación que explora nuevas tecnologías y tendencias. Mantiene la plataforma a la vanguardia de la innovación.',
        mission: 'Mantener la plataforma a la vanguardia de la innovación tecnológica a través de investigación continua',
        scope: 'Technology research, trend analysis, innovation projects, proof of concepts, technology scouting',
        budget: 120000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Content Creation',
        type: 'CREATIVE',
        status: 'ACTIVE',
        description: 'Equipo creativo que produce contenido de alta calidad para la plataforma. Incluye escritores, diseñadores y productores multimedia.',
        mission: 'Crear contenido de alta calidad que eduque, entretenga y conecte con nuestra audiencia',
        scope: 'Content writing, graphic design, video production, social media content, educational materials',
        budget: 75000,
        memberCount: 7,
        quarterlyReports: []
      },
      {
        name: 'Business Development',
        type: 'BUSINESS',
        status: 'ACTIVE',
        description: 'Equipo que desarrolla alianzas estratégicas y oportunidades de negocio. Expande el alcance de la plataforma.',
        mission: 'Expandir el alcance de la plataforma a través de alianzas estratégicas y oportunidades de negocio',
        scope: 'Partnership development, business opportunities, market expansion, strategic planning, relationship management',
        budget: 95000,
        memberCount: 4,
        quarterlyReports: []
      },
      {
        name: 'Legal & Compliance',
        type: 'LEGAL',
        status: 'ACTIVE',
        description: 'Equipo legal que asegura el cumplimiento normativo y protege los intereses de la empresa. Maneja asuntos legales y regulatorios.',
        mission: 'Proteger los intereses de la empresa y asegurar el cumplimiento normativo en todas las operaciones',
        scope: 'Legal compliance, contract review, regulatory matters, intellectual property, risk management',
        budget: 110000,
        memberCount: 3,
        quarterlyReports: []
      },
      {
        name: 'Finance & Operations',
        type: 'OPERATIONS',
        status: 'ACTIVE',
        description: 'Equipo que maneja las finanzas y operaciones de la empresa. Optimiza procesos y asegura la eficiencia operativa.',
        mission: 'Optimizar las operaciones financieras y operativas para maximizar la eficiencia y rentabilidad',
        scope: 'Financial planning, budgeting, process optimization, operational efficiency, cost management',
        budget: 85000,
        memberCount: 5,
        quarterlyReports: []
      },
      {
        name: 'Human Resources',
        type: 'HR',
        status: 'ACTIVE',
        description: 'Equipo de recursos humanos que atrae, desarrolla y retiene talento. Crea una cultura organizacional positiva.',
        mission: 'Atraer, desarrollar y retener el mejor talento mientras creamos una cultura organizacional positiva',
        scope: 'Talent acquisition, employee development, culture building, performance management, employee relations',
        budget: 70000,
        memberCount: 4,
        quarterlyReports: []
      },
      {
        name: 'International Expansion',
        type: 'EXPANSION',
        status: 'ACTIVE',
        description: 'Equipo que lidera la expansión internacional de la plataforma. Adapta productos para mercados globales.',
        mission: 'Llevar nuestra plataforma a mercados globales adaptando productos para diferentes culturas y regiones',
        scope: 'Market research, localization, international partnerships, cultural adaptation, global strategy',
        budget: 150000,
        memberCount: 6,
        quarterlyReports: []
      },
      {
        name: 'Sustainability & ESG',
        type: 'SUSTAINABILITY',
        status: 'ACTIVE',
        description: 'Equipo que integra prácticas sostenibles y ESG en todas las operaciones. Promueve la responsabilidad social corporativa.',
        mission: 'Integrar prácticas sostenibles y ESG en todas las operaciones para crear un impacto positivo en la sociedad',
        scope: 'ESG initiatives, sustainability reporting, social impact, environmental responsibility, stakeholder engagement',
        budget: 80000,
        memberCount: 4,
        quarterlyReports: []
      }
    ]

    console.log('📋 Creando workgroups...')
    const createdWorkgroups = []

    for (const workgroup of workgroups) {
      try {
        const created = await prisma.workGroup.create({
          data: workgroup
        })
        createdWorkgroups.push(created)
        console.log(`✅ Workgroup creado: ${created.name} (${created.type})`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Workgroup ya existe: ${workgroup.name}`)
        } else {
          console.error(`❌ Error creando workgroup ${workgroup.name}:`, error.message)
        }
      }
    }

    console.log('🎉 ¡Workgroups de prueba creados exitosamente!')
    console.log(`📋 Se crearon ${createdWorkgroups.length} workgroups`)

    // Mostrar estadísticas
    const typeStats = {}
    createdWorkgroups.forEach(workgroup => {
      typeStats[workgroup.type] = (typeStats[workgroup.type] || 0) + 1
    })

    console.log('\n📊 Estadísticas por tipo:')
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} workgroups`)
    })

    const totalBudget = createdWorkgroups.reduce((sum, wg) => sum + wg.budget, 0)
    const totalMembers = createdWorkgroups.reduce((sum, wg) => sum + wg.memberCount, 0)
    
    console.log(`\n💰 Presupuesto total: $${totalBudget.toLocaleString()}`)
    console.log(`👥 Total de miembros: ${totalMembers}`)
    console.log(`📊 Promedio de presupuesto por workgroup: $${Math.round(totalBudget / createdWorkgroups.length).toLocaleString()}`)
    console.log(`📊 Promedio de miembros por workgroup: ${Math.round(totalMembers / createdWorkgroups.length)}`)

  } catch (error) {
    console.error('❌ Error creando workgroups de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestWorkgroups()
}

module.exports = { createTestWorkgroups }
