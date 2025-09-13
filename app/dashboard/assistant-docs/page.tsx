// app/docs/page.tsx
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Info, MessageSquare, Users, User, BarChart3, Shield, ArrowLeft, ListTree } from 'lucide-react';

export default function SaraDocsPage() {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const sections: {
    id: string;
    title: string;
    icon: React.ReactNode;
    body: React.ReactNode;
  }[] = [
    {
      id: 'overview',
      title: 'Governance Assistant Overview',
      icon: <Info className="h-4 w-4" />,
      body: (
        <p className="text-sm opacity-80">
          SARA helps you explore, understand, and interact with governance data in this dashboard.
          Ask natural questions; she’ll use secure, first-party API tools with your session.
        </p>
      ),
    },
    {
      id: 'capabilities',
      title: 'What you can do',
      icon: <Info className="h-4 w-4" />,
      body: (
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Explore proposals by status and view detailed records with votes and threaded comments.</li>
          <li>Browse workgroups, check their mission, focus, and membership (with totals).</li>
          <li>Review governance analytics: participation, consent alignment, objections, diversity, and treasury.</li>
          <li>See trends over time and optionally compare a period with the previous one.</li>
          <li>Filter analytics by workgroup, proposal type, and country to focus insights.</li>
        </ul>
      ),
    },
    {
      id: 'proposals',
      title: 'Proposals',
      icon: <MessageSquare className="h-4 w-4" />,
      body: (
        <div className="space-y-3 text-sm">
          <p className="opacity-80">
            View proposals by status (IN_REVIEW, APPROVED, REJECTED, EXPIRED). Open a proposal to see its author,
            votes, comments (as a nested tree), and associated workgroups. SARA can also highlight your own vote/activity when relevant.
          </p>
          <Examples
            items={[
              'Show proposals that are IN_REVIEW.',
              'Give me details for proposal ID “prop_123” including votes and comments.',
              'How many proposals were approved this month?',
            ]}
          />
        </div>
      ),
    },
    {
      id: 'workgroups',
      title: 'Workgroups',
      icon: <Users className="h-4 w-4" />,
      body: (
        <div className="space-y-3 text-sm">
          <p className="opacity-80">
            Search by name/mission/type or filter by status. Open a specific workgroup to see mission, goals/focus,
            member list (with user names), and a
            <code className="px-1 py-0.5 mx-1 bg-muted rounded">totalMembers</code> count.
          </p>
          <Examples
            items={[
              'Find active workgroups about research.',
              'Show details for workgroup “wg_123”, including members.',
              'How many active vs inactive workgroups exist?',
            ]}
          />
        </div>
      ),
    },

    /* ------------------- NEW: Users (fetchUsers) ------------------- */
    {
      id: 'users',
      title: 'Users',
      icon: <Users className="h-4 w-4" />,
      body: (
        <div className="space-y-3 text-sm">
          <p className="opacity-80">
            Explore platform users with optional filters. You can search by <strong>name</strong> or <strong>email</strong>,
            and/or filter by <strong>role</strong>. Results are ordered by creation date (newest first), and SARA can summarize counts
            by role/status.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Filters:</strong> <code className="px-1 py-0.5 bg-muted rounded">search</code> (name/email), <code className="px-1 py-0.5 bg-muted rounded">role</code></li>
            <li><strong>Returns:</strong> user list (id, name, email, role, status, image, createdAt, updatedAt) + helpful counts</li>
          </ul>
          <Examples
            items={[
              'List all users created most recently.',
              'Find users with “alice” in their name or email.',
              'Show users with role CORE_CONTRIBUTOR.',
              'Search “bob” and filter by role ADMIN.',
            ]}
          />
        </div>
      ),
    },

    /* --------------- NEW: User Profile (fetchUserProfile) ---------- */
    {
      id: 'user-profile',
      title: 'User Profile',
      icon: <User className="h-4 w-4" />,
      body: (
        <div className="space-y-3 text-sm">
          <p className="opacity-80">
            View a <strong>complete profile</strong> for a single user, including professional profile (tagline, bio,
            experience, CV link), social links (LinkedIn/GitHub/X/Facebook), and their workgroups.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Param:</strong> user <code className="px-1 py-0.5 bg-muted rounded">id</code></li>
            <li><strong>Returns:</strong> identity &amp; contact fields, professionalProfile, socialLinks, workgroups</li>
            <li><strong>Auth:</strong> requires a valid session; unauthorized users receive a 401</li>
          </ul>
          <Examples
            items={[
              'Show the full profile for user “usr_123”.',
              'Which workgroups is usr_123 a member of?',
              'Does usr_123 have a LinkedIn or GitHub link?',
              'Summarize usr_123’s professional experience.',
            ]}
          />
        </div>
      ),
    },

    {
      id: 'analytics',
      title: 'Analytics & Trends',
      icon: <BarChart3 className="h-4 w-4" />,
      body: (
        <div className="space-y-3 text-sm">
          <p className="opacity-80">
            Get high-level metrics (participation rate, consent alignment, objection rates, diversity score) and
            treasury allocation by workgroup or proposal type. View monthly time series and compare periods.
          </p>
          <Examples
            items={[
              'Show governance analytics for the last 90 days.',
              'Compare the last 60 days with the previous 60 days.',
              'Analytics for workGroupId “wg_123” and proposalType “BUDGET”.',
              'Give me analytics for Argentina over the last 120 days.',
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/dashboard/assistant"
          className="inline-flex items-center gap-2 text-sm font-medium border rounded-md px-3 py-1.5 hover:opacity-80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>

        <Link
          href="#toc"
          className="lg:hidden inline-flex items-center gap-2 text-sm font-medium border rounded-md px-3 py-1.5 hover:opacity-80"
        >
          <ListTree className="w-4 h-4" />
          Sections
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-8">
        <nav id="toc" className="hidden lg:block">
          <div className="sticky top-6">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 opacity-70">On this page</p>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`#${s.id}`}
                    className="block px-2 py-1 rounded hover:bg-muted"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-6">
          {sections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="rounded-2xl border border-secondary/30 p-4 scroll-mt-24"
            >
              <Header icon={s.icon} title={s.title} />
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="rounded-md border px-2 py-1 text-xs font-semibold inline-flex items-center gap-2">
        {icon}
        {title}
      </span>
    </div>
  );
}

function Examples({ items }: { items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">Examples</p>
      <ul className="space-y-2">
        {items.map((ex, i) => (
          <li key={i} className="text-sm opacity-90">
            “{ex}”
          </li>
        ))}
      </ul>
    </div>
  );
}
