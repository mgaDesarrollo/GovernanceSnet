import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.workGroup.deleteMany(); // Limpia la tabla antes de insertar
  await prisma.workGroup.createMany({
    data: [
      {
        name: "African Guild",
        type: "Regional",
        dateOfCreation: new Date("2023-02-01"),
        status: "Active",
        missionStatement: "Impulsar la colaboración y el desarrollo en África.",
        goalsAndFocus: ["Inclusión", "Desarrollo"],
        totalMembers: "10 activos | 2 observadores | 1 pendiente",
        roles: ["Core Contributors", "Observers"],
        memberDirectoryLink: "#"
      },
      {
        name: "AI Ethics WG",
        type: "Governance",
        dateOfCreation: new Date("2023-03-12"),
        status: "Active",
        missionStatement: "Promover la ética en IA.",
        goalsAndFocus: ["Ética", "Gobernanza"],
        totalMembers: "8 activos | 3 observadores | 2 pendientes",
        roles: ["Core Contributors"],
        memberDirectoryLink: "#"
      },
      {
        name: "AI Sandbox/Think Tank",
        type: "Research",
        dateOfCreation: new Date("2023-04-03"),
        status: "Pending",
        missionStatement: "Explorar nuevas ideas en IA.",
        goalsAndFocus: ["Innovación", "Experimentación"],
        totalMembers: "4 activos | 1 observador | 0 pendientes",
        roles: ["Investigadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Archives WG",
        type: "Documentation",
        dateOfCreation: new Date("2023-04-01"),
        status: "Inactive",
        missionStatement: "Gestionar archivos y documentación.",
        goalsAndFocus: ["Archivos", "Documentación"],
        totalMembers: "3 activos | 0 observadores | 0 pendientes",
        roles: ["Archivistas"],
        memberDirectoryLink: "#"
      },
      {
        name: "Education Guild",
        type: "Education",
        dateOfCreation: new Date("2023-06-01"),
        status: "Active",
        missionStatement: "Promover la educación y el aprendizaje en IA.",
        goalsAndFocus: ["Educación", "Aprendizaje"],
        totalMembers: "15 activos | 2 observadores | 1 pendiente",
        roles: ["Educadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Gamers' Guild",
        type: "Community",
        dateOfCreation: new Date("2023-07-15"),
        status: "Active",
        missionStatement: "Fortalecer la comunidad de jugadores y desarrolladores de IA.",
        goalsAndFocus: ["Juegos", "Desarrollo"],
        totalMembers: "10 activos | 1 observador | 0 pendientes",
        roles: ["Jugadores", "Desarrolladores"],
        memberDirectoryLink: "#"
      },
      {
        name: "GitHub PBL WG",
        type: "Project",
        dateOfCreation: new Date("2023-08-20"),
        status: "Active",
        missionStatement: "Colaborar en proyectos de código abierto para IA.",
        goalsAndFocus: ["Código", "Colaboración"],
        totalMembers: "15 activos | 3 observadores | 1 pendiente",
        roles: ["Colaboradores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Governance WG",
        type: "Governance",
        dateOfCreation: new Date("2023-09-01"),
        status: "Active",
        missionStatement: "Gobernar y asegurar la dirección de la comunidad.",
        goalsAndFocus: ["Gobernanza", "Dirección"],
        totalMembers: "12 activos | 4 observadores | 1 pendiente",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Knowledge Base WG",
        type: "Documentation",
        dateOfCreation: new Date("2023-10-10"),
        status: "Active",
        missionStatement: "Gestionar y mantener una base de conocimiento sobre IA.",
        goalsAndFocus: ["Conocimiento", "Documentación"],
        totalMembers: "10 activos | 2 observadores | 0 pendientes",
        roles: ["Documentadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "LatAm Guild",
        type: "Regional",
        dateOfCreation: new Date("2023-11-01"),
        status: "Active",
        missionStatement: "Impulsar la colaboración y el desarrollo en América Latina.",
        goalsAndFocus: ["Inclusión", "Desarrollo"],
        totalMembers: "15 activos | 3 observadores | 1 pendiente",
        roles: ["Core Contributors", "Observers"],
        memberDirectoryLink: "#"
      },
      {
        name: "Marketing Guild",
        type: "Community",
        dateOfCreation: new Date("2023-12-01"),
        status: "Active",
        missionStatement: "Promover la comunidad y la visibilidad de la IA.",
        goalsAndFocus: ["Marketing", "Visibilidad"],
        totalMembers: "10 activos | 2 observadores | 0 pendientes",
        roles: ["Marketing", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Moderators WG",
        type: "Community",
        dateOfCreation: new Date("2024-01-01"),
        status: "Active",
        missionStatement: "Gobernar y moderar la comunidad.",
        goalsAndFocus: ["Gobernanza", "Moderación"],
        totalMembers: "15 activos | 5 observadores | 0 pendientes",
        roles: ["Moderadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Onboarding WG",
        type: "Community",
        dateOfCreation: new Date("2024-02-01"),
        status: "Active",
        missionStatement: "Facilitar el proceso de incorporación de nuevos miembros.",
        goalsAndFocus: ["Incorporación", "Facilitación"],
        totalMembers: "10 activos | 2 observadores | 0 pendientes",
        roles: ["Facilitadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Process Guild",
        type: "Community",
        dateOfCreation: new Date("2024-03-01"),
        status: "Active",
        missionStatement: "Gobernar y mejorar los procesos de la comunidad.",
        goalsAndFocus: ["Gobernanza", "Procesos"],
        totalMembers: "12 activos | 4 observadores | 0 pendientes",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "R&D Guild",
        type: "Research",
        dateOfCreation: new Date("2024-04-01"),
        status: "Active",
        missionStatement: "Promover la investigación y el desarrollo de IA.",
        goalsAndFocus: ["Investigación", "Desarrollo"],
        totalMembers: "15 activos | 5 observadores | 0 pendientes",
        roles: ["Investigadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Strategy Guild",
        type: "Governance",
        dateOfCreation: new Date("2024-05-01"),
        status: "Active",
        missionStatement: "Gobernar y definir la estrategia de la comunidad.",
        goalsAndFocus: ["Gobernanza", "Estrategia"],
        totalMembers: "10 activos | 3 observadores | 0 pendientes",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Translators WG",
        type: "Community",
        dateOfCreation: new Date("2024-06-01"),
        status: "Active",
        missionStatement: "Traducir contenido y documentación de la comunidad.",
        goalsAndFocus: ["Traducción", "Documentación"],
        totalMembers: "12 activos | 4 observadores | 0 pendientes",
        roles: ["Traductores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Treasury Automation WG",
        type: "Community",
        dateOfCreation: new Date("2024-07-01"),
        status: "Active",
        missionStatement: "Automatizar y mejorar el proceso de gestión de recursos.",
        goalsAndFocus: ["Automatización", "Recursos"],
        totalMembers: "10 activos | 3 observadores | 0 pendientes",
        roles: ["Automatizadores", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Treasury Guild",
        type: "Community",
        dateOfCreation: new Date("2024-08-01"),
        status: "Active",
        missionStatement: "Gobernar y gestionar los recursos financieros de la comunidad.",
        goalsAndFocus: ["Recursos", "Financiación"],
        totalMembers: "12 activos | 4 observadores | 0 pendientes",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Video WG",
        type: "Community",
        dateOfCreation: new Date("2024-09-01"),
        status: "Active",
        missionStatement: "Gobernar y gestionar el contenido de video de la comunidad.",
        goalsAndFocus: ["Video", "Gobernanza"],
        totalMembers: "10 activos | 3 observadores | 0 pendientes",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      },
      {
        name: "Writers WG",
        type: "Community",
        dateOfCreation: new Date("2024-10-01"),
        status: "Active",
        missionStatement: "Gobernar y gestionar el contenido escrito de la comunidad.",
        goalsAndFocus: ["Escritura", "Gobernanza"],
        totalMembers: "12 activos | 4 observadores | 0 pendientes",
        roles: ["Gobernantes", "Observadores"],
        memberDirectoryLink: "#"
      }
    ]
  })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect()) 