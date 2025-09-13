import type { DefaultSession } from "next-auth"
// Estos son los tipos generados por Prisma. Si 'npx prisma generate' fue exitoso, deberían estar disponibles.
import type {
  UserRole as PrismaUserRole,
  ProposalStatus as PrismaProposalStatus,
  VoteType as PrismaVoteType,
  UserAvailabilityStatus as PrismaUserAvailabilityStatus,
  WorkGroup as PrismaWorkGroup, // Corregido: usar WorkGroup
} from "@prisma/client"

export type UserRole = PrismaUserRole
export type ProposalStatusType = PrismaProposalStatus
export type VoteTypeEnum = PrismaVoteType
export type UserAvailabilityStatus = PrismaUserAvailabilityStatus // Exportamos el tipo para usarlo
export type WorkGroupPrisma = PrismaWorkGroup // Exportamos el tipo WorkGroup de Prisma

export interface User {
  id: string
  name: string
  role: UserRole
  email?: string | null
  image?: string | null
  status?: UserAvailabilityStatus | null // Añadido para el status del usuario
  workgroups?: WorkGroupPrisma[] // Para los workgroups del usuario
  fullname?: string | null // Añadido para el nombre completo
}

export type SortableUserKeys = "name" | "role" | "email"

export interface ProposalAuthor {
  id: string
  name: string
  image?: string | null
}

export interface ProposalComment {
  id: string
  content: string
  createdAt: string
  user: ProposalAuthor
  replies?: ProposalComment[] // Respuestas anidadas
  likes?: string[] // Array de IDs de usuarios que dieron like
  dislikes?: string[] // Array de IDs de usuarios que dieron dislike
}

export interface ProposalVote {
  id: string
  type: VoteTypeEnum
  user: ProposalAuthor
  createdAt: string
  comment?: string | null
}

export interface LinkItem {
  title: string
  url: string
}

export interface Proposal {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string // ✅ Campo agregado
  expiresAt: string
  status: ProposalStatusType
  positiveVotes: number
  negativeVotes: number
  abstainVotes: number
  author: ProposalAuthor
  votes?: ProposalVote[]
  comments?: ProposalComment[]
  _count?: {
    votes: number
    comments: number
  }
  userVote?: VoteTypeEnum | null
  userHasCommented?: boolean
  
  // Nuevos campos
  proposalType?: string
  quarter?: string | null  // Trimestre para informes trimestrales
  year?: number | null     // Año para informes trimestrales
  links?: Array<string | LinkItem> // Array de links: soporta cadenas legacy o objetos {title, url}
  budgetItems?: any // JSON de items presupuestarios
  workGroupIds?: string[]
  workgroup?: {
    id: string
    name: string
    type: string
    status: string
  } | null
  attachment?: string | null
  consensusDate?: string | null
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      status?: UserAvailabilityStatus | null // Añadido para el status del usuario
      // fullname?: string | null; // Opcional: si quieres fullname en la sesión
    } & DefaultSession["user"]
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: string
    role?: UserRole
    status?: UserAvailabilityStatus | null // Añadido para el status del usuario
    // fullname?: string | null; // Opcional: si quieres fullname en el token
  }
}

// Tipos para el formulario de perfil, si los necesitas centralizados
export interface ProfileFormData {
  fullname: string
  image: string
  status: UserAvailabilityStatus | ""
  skills: string
  country: string
  languages: string
  professionalProfile: {
    tagline: string
    bio: string
    experience: string
    linkCv: string
  }
  socialLinks: {
    facebook: string
    linkedin: string
    github: string
    x: string
  }
  selectedWorkgroupIds: string[]
}

// Tipos para WorkGroups & Guilds
export type AnchorContact = {
  name: string;
  role: string;
  handle: string;
};

export type Deliverable = {
  title: string;
  status: string;
  timeline: string;
  description: string;
};

export type ProposalSubmission = {
  title: string;
  status: string;
  link: string;
  votingResults: string;
};

export type Collaboration = {
  groupName: string;
  collaborationType: string;
  contact: string;
};

export type OngoingDecision = {
  title: string;
  dueDate: string;
  status: string;
};

export type PastBudget = {
  title: string;
  amount: string;
  link: string;
};

export type WorkGroup = {
  // 1. Basic Identification
  id?: string;
  name: string;
  type: string;
  dateOfCreation: string;
  status: string;
  anchorContacts: AnchorContact[];

  // 2. Mission & Scope
  missionStatement: string;
  goalsAndFocus: string[];

  // 3. Membership & Roles
  totalMembers: string;
  roles: string[];
  memberDirectoryLink: string;

  // 4. Contributions & Deliverables
  keyDeliverables: Deliverable[];
  proposalSubmissions: ProposalSubmission[];

  // 5. Activity Log & Meeting Records
  frequency: string;
  meetingCalendarLink: string;
  meetingNotesArchiveLink: string;
  eventHostingParticipation: string[];

  // 6. Reporting & Evaluation
  createReportLink: string;
  lastReportLink: string;
  selfEvaluation: string;
  communityFeedback: string;
  votingMetrics: string;

  // 7. Budget & Resources
  currentBudgetTier: string;
  currentBudget: string;
  utilizationSummary: string;
  fundingSources: string[];
  nextProposal: string;
  budgetProposalLink: string;
  pastBudgets: PastBudget[];

  // 8. Connections & Dependencies
  collaborations: Collaboration[];
  toolsUsed: string[];
  relatedProposals: string[];

  // 9. Consent & Governance
  ongoingDecisions: OngoingDecision[];
  voteNowLink: string;
  consensusArchiveLink: string;
  participationMetrics: string;

  // 10. Future Plans & Roadmap
  nextSteps: string[];
  milestoneTimelineLink?: string;
  openCalls: string[];
  nextCycleProposalIdeas?: string[];
};
