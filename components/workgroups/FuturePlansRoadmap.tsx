import React from "react";
import { CompassIcon, CalendarIcon, MegaphoneIcon, LightbulbIcon } from "lucide-react";

interface Props {
  nextSteps?: string[];
  milestoneTimelineLink?: string;
  openCalls?: string[];
  nextCycleProposalIdeas?: string[];
}

const FuturePlansRoadmap: React.FC<Props> = ({ 
  nextSteps = [], 
  milestoneTimelineLink, 
  openCalls = [], 
  nextCycleProposalIdeas = [] 
}) => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-secondary">
        <CompassIcon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Future & Roadmap</h3>
        <p className="text-xs sm:text-sm text-gray-400">Strategic planning and upcoming initiatives</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Next Steps */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Next Steps</span>
        </div>
        {nextSteps.length > 0 ? (
          <div className="space-y-2">
            {nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-black/50 rounded-lg border border-secondary">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-black/30 rounded-lg border border-secondary">
            <p className="text-sm text-gray-500">No next steps defined</p>
          </div>
        )}
      </div>
      
      {/* Open Calls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MegaphoneIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Open Calls</span>
        </div>
        {openCalls.length > 0 ? (
          <div className="space-y-2">
            {openCalls.map((call, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-black/50 rounded-lg border border-secondary">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{call}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-black/30 rounded-lg border border-secondary">
            <p className="text-sm text-gray-500">No open calls</p>
          </div>
        )}
      </div>
    </div>
    
    {/* Milestone Timeline Link */}
    {milestoneTimelineLink && (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CompassIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Roadmap</span>
        </div>
        <div className="p-3 bg-black/50 rounded-lg border border-secondary">
          <a
            href={milestoneTimelineLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline"
          >
            View Visual Roadmap →
          </a>
        </div>
      </div>
    )}
    
    {/* Next Cycle Proposal Ideas */}
    {nextCycleProposalIdeas.length > 0 && (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Next Cycle Ideas</span>
        </div>
        <div className="space-y-2">
          {nextCycleProposalIdeas.map((idea, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{idea}</span>
              </div>
              <button className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-medium hover:bg-purple-600/30 transition-colors border border-secondary">
                Upvote
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default FuturePlansRoadmap; 