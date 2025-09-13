import React from "react";
import { TargetIcon, CompassIcon } from "lucide-react";

interface Props {
  missionStatement: string;
  goalsAndFocus: string[];
}

const MissionScopeCard: React.FC<Props> = ({ missionStatement, goalsAndFocus }) => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-secondary">
        <CompassIcon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Mission & Scope</h3>
        <p className="text-xs sm:text-sm text-gray-400">Strategic direction and objectives</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mission Statement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Mission Statement</span>
        </div>
        <div className="p-4 bg-black/50 rounded-lg border border-secondary">
          <p className="text-sm text-gray-200 leading-relaxed">
            {missionStatement}
          </p>
        </div>
      </div>
      
      {/* Focus Areas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Focus Areas</span>
        </div>
        <div className="space-y-2">
          {goalsAndFocus.map((goal, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-black/50 rounded-lg border border-secondary">
              <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 shrink-0"></div>
              <p className="text-sm text-gray-200">{goal}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MissionScopeCard; 