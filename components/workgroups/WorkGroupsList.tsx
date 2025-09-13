"use client";

import React from "react";
import { WorkGroup } from "../../lib/types";

interface Props {
  workGroups?: WorkGroup[];
  onSelect?: (workGroup: WorkGroup) => void;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-700 text-green-100 border-green-500",
  Inactive: "bg-black text-gray-300 border-gray-500",
  Pending: "bg-yellow-700 text-yellow-100 border-yellow-500",
};

const WorkGroupsList: React.FC<Props> = ({ workGroups, onSelect }) => {
  if (!workGroups) {
    return <div className="text-center text-slate-400 py-12">Loading groups...</div>;
  }
  if (workGroups.length === 0) {
    return <div className="text-center text-slate-400 py-12">No groups registered.</div>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
      {workGroups.map((wg, i) => (
        <div
          key={i}
          className="group bg-black border border-secondary rounded-xl shadow-md hover:shadow-xl transition-shadow duration-200 p-6 flex flex-col gap-4 relative overflow-hidden hover:border-purple-500"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-purple-200 group-hover:text-purple-400 transition-colors truncate max-w-[70%]">{wg.name}</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[wg.status] || 'bg-black text-slate-300 border-secondary'}`}>{wg.status}</span>
          </div>
          <div className="text-slate-300 text-sm mb-2 line-clamp-2 min-h-[2.5em]">{wg.missionStatement}</div>
          <div className="flex flex-wrap gap-2 items-center text-xs mb-2">
            <span className="bg-black border border-secondary rounded px-2 py-0.5 text-slate-400">{wg.type}</span>
            <span className="bg-black border border-secondary rounded px-2 py-0.5 text-slate-400">{wg.totalMembers}</span>
          </div>
          <button
            className="mt-auto text-purple-400 hover:text-white hover:bg-purple-700/20 border border-purple-700 rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-150 self-end"
            onClick={() => onSelect && onSelect(wg)}
          >
            View details
          </button>
        </div>
      ))}
    </div>
  );
};

export default WorkGroupsList; 