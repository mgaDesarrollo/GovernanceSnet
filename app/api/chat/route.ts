import { asiProvider } from '@/lib/ai/asi-provider';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';

export const maxDuration = 30;

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const cookieHeader = cookies().toString()

    const systemPrompt = `
        Your name is SARA.
        
        You are an SingularityNET's AI assistant designed to help users interact with this Governance Dashboard. Your primary role is to assist users in navigating the dashboard, answering questions related to governance data, and providing insights based on the information available within the dashboard.
        
        The AGIX token is the official SingularityNET's.
        
        AGIX Price: ${config.agix.price}
        
        AGIX Decimals: ${config.agix.decimals}
    `

    const result = streamText({
        model: asiProvider.languageModel('asi1-mini'),
        messages: convertToModelMessages(messages),
        system: systemPrompt,
        stopWhen: stepCountIs(10),
        maxOutputTokens: 5120,
        tools: {
            fetchProposals: {
                description: 'Fetch governance proposals from the dashboard',
                inputSchema: z.object({
                    status: z.enum(["IN_REVIEW", "APPROVED", "REJECTED", "EXPIRED"]).optional()
                }),
                execute: async ({ status }) => {
                    try {
                        let url = `${baseUrl}/api/proposals`;

                        if (status) {
                            url += `?status=${status}`;
                        }
                        const response = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (!response.ok) {
                            console.error('Proposals fetch failed:', response.status);
                            return { proposals: [] };
                        }

                        const data = await response.json();
                        console.log("Fetched proposals data:", data.proposals);
                        return {
                            proposals: data.proposals || [],
                            totalProposals: data.proposals ? data.proposals.length : 0,
                            totalInReview: data.proposals ? data.proposals.filter((p: any) => p.status === 'IN_REVIEW').length : 0,
                            totalApproved: data.proposals ? data.proposals.filter((p: any) => p.status === 'APPROVED').length : 0,
                            totalRejected: data.proposals ? data.proposals.filter((p: any) => p.status === 'REJECTED').length : 0,
                            totalExpired: data.proposals ? data.proposals.filter((p: any) => p.status === 'EXPIRED').length : 0,
                        };
                    } catch (error) {
                        return {
                            proposals: [],
                            totalProposals: 0,
                            totalInReview: 0,
                            totalApproved: 0,
                            totalRejected: 0,
                            totalExpired: 0,
                        };
                    }

                }
            },
            fetchProposalDetails: {
                description:
                    'Get a specific proposal with votes, threaded comments, associated workgroups, and user-specific flags.',
                inputSchema: z.object({
                    id: z.string().min(1, 'proposal id is required'),
                }),
                execute: async ({ id }) => {
                    try {
                        const url = `${baseUrl}/api/proposals/${encodeURIComponent(id)}`;
                        const res = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (res.status === 401) return { ok: false, unauthorized: true };
                        if (res.status === 404) return { ok: false, notFound: true };

                        if (!res.ok) {
                            console.error('fetchProposalDetails failed:', res.status, await res.text());
                            return { ok: false };
                        }

                        const data = await res.json();
                        return {
                            ok: true,
                            proposal: data,
                        };
                    } catch (err) {
                        console.error('fetchProposalDetails error:', err);
                        return { ok: false };
                    }
                },
            },
            fetchWorkgroups: {
                description: 'Fetch workgroups. Supports optional text search and status filter.',
                inputSchema: z.object({
                    search: z.string().min(1).optional(),
                    status: z.enum(['Active', 'Inactive']).optional(),
                }),
                execute: async ({ search, status }) => {
                    try {
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (status) params.set('status', status);

                        const url = `${baseUrl}/api/workgroups${params.toString() ? `?${params.toString()}` : ''}`;

                        const response = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (!response.ok) {
                            console.error('Workgroups fetch failed:', response.status, await response.text());
                            return { workgroups: [] as any[] };
                        }

                        const data = await response.json();

                        return {
                            workgroups: Array.isArray(data) ? data : [],
                            totalWorkgroups: Array.isArray(data) ? data.length : 0,
                            totalActiveWorkgroups: Array.isArray(data) ? data.filter((wg: any) => wg.status === 'Active').length : 0,
                            totalInactiveWorkgroups: Array.isArray(data) ? data.filter((wg: any) => wg.status === 'Inactive').length : 0,
                        };
                    } catch (err) {
                        console.error('Workgroups fetch error:', err);
                        return {
                            workgroups: [] as any[],
                            totalWorkgroups: 0,
                            totalActiveWorkgroups: 0,
                            totalInactiveWorkgroups: 0,
                        };
                    }
                },
            },
            fetchWorkgroupDetails: {
                description: 'Get a single workgroup by id with members and totalMembers.',
                inputSchema: z.object({
                    id: z.string().min(1, 'workgroup id is required'),
                }),
                execute: async ({ id }) => {
                    try {
                        const url = `${baseUrl}/api/workgroups/${encodeURIComponent(id)}`;
                        const res = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (res.status === 400) return { ok: false, badRequest: true };
                        if (res.status === 404) return { ok: false, notFound: true };
                        if (!res.ok) {
                            console.error('fetchWorkgroupDetails failed:', res.status, await res.text());
                            return { ok: false };
                        }

                        const data = await res.json();
                        return { ok: true, workgroup: data };
                    } catch (err) {
                        console.error('fetchWorkgroupDetails error:', err);
                        return { ok: false };
                    }
                },
            },
            fetchAnalytics: {
                description:
                    'Fetch analytics for governance (participation, consent alignment, objections, diversity, treasury, and monthly time series). Supports period, comparison, workgroup, country, and proposalType filters.',
                inputSchema: z.object({
                    periodDays: z.number().int().min(1).max(3650).optional(),
                    compare: z.boolean().optional(),
                    workGroupId: z.string().min(1).optional(),
                    country: z.string().min(1).optional(),
                    proposalType: z.string().min(1).optional(),
                }),
                execute: async ({ periodDays, compare, workGroupId, country, proposalType }) => {
                    try {
                        const params = new URLSearchParams();
                        if (typeof periodDays === 'number') params.set('periodDays', String(periodDays));
                        if (typeof compare === 'boolean') params.set('compare', compare ? 'true' : 'false');
                        if (workGroupId) params.set('workGroupId', workGroupId);
                        if (country) params.set('country', country);
                        if (proposalType) params.set('proposalType', proposalType);

                        const url = `${baseUrl}/api/analytics${params.toString() ? `?${params.toString()}` : ''}`;

                        const response = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (!response.ok) {
                            console.error('Analytics fetch failed:', response.status, await response.text());
                            return {
                                ok: false,
                                workGroups: null,
                                participants: null,
                                activity: null,
                                governance: null,
                                diversity: null,
                                treasury: null,
                                timeSeries: null,
                                previousPeriod: null,
                            };
                        }

                        const data = await response.json();

                        return {
                            ok: true,
                            workGroups: data.workGroups ?? null,
                            participants: data.participants ?? null,
                            activity: data.activity ?? null,
                            governance: data.governance ?? null,
                            diversity: data.diversity ?? null,
                            treasury: data.treasury ?? null,
                            timeSeries: data.timeSeries ?? null,
                            previousPeriod: data.previousPeriod ?? null
                        };
                    } catch (err) {
                        console.error('Analytics fetch error:', err);
                        return {
                            ok: false,
                            workGroups: null,
                            participants: null,
                            activity: null,
                            governance: null,
                            diversity: null,
                            treasury: null,
                            timeSeries: null,
                            previousPeriod: null,
                        };
                    }
                }
            },
            fetchUsers: {
                description:
                    'Fetch users with optional text search (name/email) and role filter. Returns list plus useful counts.',
                inputSchema: z.object({
                    search: z.string().min(1).optional(),
                    role: z.string().min(1).optional(),
                }),
                execute: async ({ search, role }) => {
                    try {
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (role) params.set('role', role);

                        const url = `${baseUrl}/api/users${params.toString() ? `?${params.toString()}` : ''}`;

                        const res = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (!res.ok) {
                            console.error('Users fetch failed:', res.status, await res.text());
                            return {
                                ok: false,
                                users: [] as any[],
                                totalUsers: 0,
                                totalsByRole: {} as Record<string, number>,
                                totalsByStatus: {} as Record<string, number>,
                            };
                        }

                        const data = await res.json();
                        const users = Array.isArray(data) ? data : [];

                        const totalsByRole: Record<string, number> = {};
                        const totalsByStatus: Record<string, number> = {};

                        for (const u of users) {
                            const r = (u.role ?? 'UNKNOWN') as string;
                            const s = (u.status ?? 'UNKNOWN') as string;
                            totalsByRole[r] = (totalsByRole[r] ?? 0) + 1;
                            totalsByStatus[s] = (totalsByStatus[s] ?? 0) + 1;
                        }

                        return {
                            ok: true,
                            users,
                            totalUsers: users.length,
                            totalsByRole,
                            totalsByStatus,
                            newestCreatedAt: users[0]?.createdAt ?? null, // list is createdAt desc per API
                        };
                    } catch (err) {
                        console.error('Users fetch error:', err);
                        return {
                            ok: false,
                            users: [] as any[],
                            totalUsers: 0,
                            totalsByRole: {} as Record<string, number>,
                            totalsByStatus: {} as Record<string, number>,
                        };
                    }
                },
            },
            fetchUserProfile: {
                description:
                    'Fetch a complete user profile by id (includes professionalProfile, socialLinks, and workgroups).',
                inputSchema: z.object({
                    id: z.string().min(1, 'user id is required'),
                }),
                execute: async ({ id }) => {
                    try {
                        const url = `${baseUrl}/api/users/${encodeURIComponent(id)}`;
                        const res = await fetch(url, {
                            headers: { Cookie: cookieHeader },
                            cache: 'no-store',
                        });

                        if (res.status === 401) {
                            return { ok: false, unauthorized: true };
                        }
                        if (res.status === 404) {
                            return { ok: false, notFound: true };
                        }
                        if (!res.ok) {
                            console.error('fetchUserProfile failed:', res.status, await res.text());
                            return { ok: false };
                        }

                        const user = await res.json();

                        const workgroupsCount = Array.isArray(user?.workgroups) ? user.workgroups.length : 0;
                        const primaryLinks = {
                            linkedin: user?.socialLinks?.linkedin ?? null,
                            github: user?.socialLinks?.github ?? null,
                            x: user?.socialLinks?.x ?? null,
                            facebook: user?.socialLinks?.facebook ?? null,
                        };

                        return {
                            ok: true,
                            user,
                            meta: {
                                workgroupsCount,
                                hasProfile:
                                    !!user?.professionalProfile?.tagline ||
                                    !!user?.professionalProfile?.bio ||
                                    !!user?.professionalProfile?.experience ||
                                    !!user?.professionalProfile?.linkCv,
                                primaryLinks,
                            },
                        };
                    } catch (err) {
                        console.error('fetchUserProfile error:', err);
                        return { ok: false };
                    }
                },
            },
        }
    });

    return result.toUIMessageStreamResponse();
}
