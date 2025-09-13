import React from "react";
import { OngoingDecision } from "../../lib/types";
import { CheckCircleIcon, VoteIcon, ArchiveIcon, BarChartIcon } from "lucide-react";

interface Props {
  ongoingDecisions?: OngoingDecision[];
  voteNowLink?: string;
  consensusArchiveLink?: string;
  participationMetrics?: string;
}

const ConsentGovernance: React.FC<Props> = ({
  ongoingDecisions = [],
  voteNowLink,
  consensusArchiveLink,
  participationMetrics,
}) => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-secondary">
        <CheckCircleIcon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Consent & Governance</h3>
        <p className="text-xs sm:text-sm text-gray-400">Decision making and voting processes</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ongoing Decisions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <VoteIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Ongoing Decisions</span>
        </div>
        {ongoingDecisions.length > 0 ? (
          <div className="space-y-2">
            {ongoingDecisions.map((decision, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-secondary">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{decision.title}</p>
                  <p className="text-xs text-gray-400">Due: {decision.dueDate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  decision.status === 'Consent' ? 'bg-green-500/20 text-green-300 border-secondary' :
                  decision.status === 'Object' ? 'bg-red-500/20 text-red-300 border-secondary' :
                  decision.status === 'Abstain' ? 'bg-yellow-500/20 text-yellow-300 border-secondary' :
                  'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }`}>
                  {decision.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-black/30 rounded-lg border border-secondary">
            <p className="text-sm text-gray-500">No ongoing decisions</p>
          </div>
        )}
      </div>
      
      {/* Participation Metrics */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChartIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Participation Metrics</span>
        </div>
        <div className="p-3 bg-black/50 rounded-lg border border-secondary">
          <p className="text-sm text-gray-200">
            {participationMetrics || "No participation metrics available"}
          </p>
        </div>
      </div>
    </div>
    
    {/* Action Links */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <VoteIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Actions</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {voteNowLink && (
          <a
            href={voteNowLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
          >
            <VoteIcon className="w-4 h-4" />
            Vote Now
          </a>
        )}
        {consensusArchiveLink && (
          <a
            href={consensusArchiveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium hover:underline text-sm"
          >
            <ArchiveIcon className="w-4 h-4" />
            View Consent Archive
          </a>
        )}
      </div>
    </div>
  </div>
);

export default ConsentGovernance; 