import React from "react";
import { Deliverable, ProposalSubmission } from "../../lib/types";
import Link from "next/link";

interface Props {
  keyDeliverables: Deliverable[];
  proposalSubmissions: ProposalSubmission[];
}

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Under Review": "bg-blue-100 text-blue-800",
};

const ContributionsDeliverables: React.FC<Props> = ({ keyDeliverables, proposalSubmissions }) => (
  <section className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col gap-6">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">🗂️ Contributions and Deliverables</h3>
    <div>
      <span className="font-semibold text-slate-700">Key deliverables:</span>
      <ul className="mt-2 flex flex-col gap-3">
        {keyDeliverables.map((d, i) => (
          <li key={i} className="border rounded-lg p-3 bg-slate-50">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium text-slate-800">{d?.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[d?.status] || 'bg-gray-200 text-gray-700'}`}>{d?.status}</span>
              <span className="text-xs text-slate-500 ml-2">{d?.timeline}</span>
            </div>
            <p className="text-slate-700 text-sm mt-1">{d?.description}</p>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Proposals submitted:</span>
      <ul className="mt-2 flex flex-col gap-3">
        {proposalSubmissions.map((p, i) => (
          <li key={i} className="border rounded-lg p-3 bg-slate-50">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-medium text-slate-800">{p?.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[p?.status] || 'bg-gray-200 text-gray-700'}`}>{p?.status}</span>
              <Link href={p?.link} className="text-xs text-purple-600 hover:underline ml-2">See proposal →</Link>
            </div>
            <span className="text-xs text-slate-500">Voting results: {p?.votingResults}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ContributionsDeliverables; 