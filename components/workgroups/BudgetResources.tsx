import React from "react";
import { PastBudget } from "../../lib/types";
import { DollarSignIcon, TrendingUpIcon, CalendarIcon, LinkIcon } from "lucide-react";

interface Props {
  currentBudgetTier?: string;
  currentBudget?: string;
  utilizationSummary?: string;
  fundingSources?: string[];
  nextProposal?: string;
  budgetProposalLink?: string;
  pastBudgets?: PastBudget[];
}

const BudgetResources: React.FC<Props> = ({
  currentBudgetTier,
  currentBudget,
  utilizationSummary,
  fundingSources = [],
  nextProposal,
  budgetProposalLink,
  pastBudgets = [],
}) => (
  <div className="w-full space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-secondary">
        <DollarSignIcon className="w-5 h-5 text-gray-300" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white">Budget & Resources</h3>
        <p className="text-xs sm:text-sm text-gray-400">Financial planning and resource allocation</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Current Budget Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSignIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Current Budget</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-secondary">
            <span className="text-sm text-gray-400">Tier:</span>
            <span className="text-sm font-medium text-white">{currentBudgetTier || "Not specified"}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-secondary">
            <span className="text-sm text-gray-400">Amount:</span>
            <span className="text-sm font-medium text-white">{currentBudget || "Not specified"}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-secondary">
            <span className="text-sm text-gray-400">Next Proposal:</span>
            <span className="text-sm font-medium text-white">{nextProposal || "Not specified"}</span>
          </div>
        </div>
      </div>
      
      {/* Utilization Summary */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Utilization Summary</span>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg border border-secondary">
          <p className="text-sm text-gray-200">
            {utilizationSummary || "No utilization summary available"}
          </p>
        </div>
      </div>
    </div>
    
    {/* Funding Sources */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSignIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Funding Sources</span>
      </div>
      {fundingSources.length > 0 ? (
        <div className="space-y-2">
          {fundingSources.map((source, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-secondary">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-200">{source}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-800/30 rounded-lg border border-secondary">
          <p className="text-sm text-gray-500">No funding sources specified</p>
        </div>
      )}
    </div>
    
    {/* Budget Proposal Link */}
    {budgetProposalLink && (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Budget Proposal</span>
        </div>
        <div className="p-3 bg-gray-800/50 rounded-lg border border-secondary">
          <a
            href={budgetProposalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline"
          >
            View Budget Proposal →
          </a>
        </div>
      </div>
    )}
    
    {/* Past Budgets */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Past Budgets</span>
      </div>
      {pastBudgets.length > 0 ? (
        <div className="space-y-2">
          {pastBudgets.map((budget, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-secondary">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-white">{budget.title}</p>
                  <p className="text-xs text-gray-400">{budget.amount}</p>
                </div>
              </div>
              {budget.link && (
                <a
                  href={budget.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-xs font-medium hover:underline"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-800/30 rounded-lg border border-secondary">
          <p className="text-sm text-gray-500">No past budgets available</p>
        </div>
      )}
    </div>
  </div>
);

export default BudgetResources; 