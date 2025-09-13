import React from "react";
import { Collaboration } from "../../lib/types";
import { LinkIcon, WrenchIcon, FileTextIcon } from "lucide-react";

interface Props {
  collaborations?: Collaboration[];
  toolsUsed?: string[];
  relatedProposals?: string[];
}

const ConnectionsDependencies: React.FC<Props> = ({ 
  collaborations = [], 
  toolsUsed = [], 
  relatedProposals = [] 
}) => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-secondary">
        <LinkIcon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Connections & Dependencies</h3>
        <p className="text-xs sm:text-sm text-gray-400">External collaborations and tools</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Collaborations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Collaborations</span>
        </div>
        {collaborations.length > 0 ? (
          <div className="space-y-2">
            {collaborations.map((collab, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-secondary">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{collab.groupName}</p>
                  <p className="text-xs text-gray-400">{collab.collaborationType} • {collab.contact}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-gray-800/30 rounded-lg border border-secondary">
            <p className="text-sm text-gray-500">No collaborations specified</p>
          </div>
        )}
      </div>
      
      {/* Tools Used */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <WrenchIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Tools Used</span>
        </div>
        {toolsUsed.length > 0 ? (
          <div className="space-y-2">
            {toolsUsed.map((tool, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-secondary">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{tool}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-gray-800/30 rounded-lg border border-secondary">
            <p className="text-sm text-gray-500">No tools specified</p>
          </div>
        )}
      </div>
    </div>
    
    {/* Related Proposals */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileTextIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Related Proposals</span>
      </div>
      {relatedProposals.length > 0 ? (
        <div className="space-y-2">
          {relatedProposals.map((proposal, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">Proposal {i + 1}</span>
              </div>
              <a
                href={proposal}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-xs font-medium hover:underline"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-800/30 rounded-lg border border-secondary">
          <p className="text-sm text-gray-500">No related proposals</p>
        </div>
      )}
    </div>
  </div>
);

export default ConnectionsDependencies; 