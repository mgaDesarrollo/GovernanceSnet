"use client";
import React, { useState, useEffect } from "react";
import { WorkGroup } from '../../lib/types';
import BasicIdentificationCard from './BasicIdentificationCard';
import MissionScopeCard from './MissionScopeCard';
import MembershipDetails from './MembershipDetails';
import BudgetResources from './BudgetResources';
import ConnectionsDependencies from './ConnectionsDependencies';
import ConsentGovernance from './ConsentGovernance';
import FuturePlansRoadmap from './FuturePlansRoadmap';
import { useSession } from "next-auth/react";
import { 
  BuildingIcon, 
  CalendarIcon, 
  ClockIcon, 
  UsersIcon, 
  CurrencyIcon,
  TargetIcon,
  TrendingUpIcon,
  FileTextIcon,
  SettingsIcon,
  XIcon,
  PinIcon,
  CalendarDaysIcon,
  WalletIcon,
  LinkIcon,
  CompassIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const tabs = [
  { key: 'general', label: 'General', icon: PinIcon },
  { key: 'activity', label: 'Activity & Reports', icon: CalendarDaysIcon },
  { key: 'budget', label: 'Budget & Resources', icon: WalletIcon },
  { key: 'links', label: 'Links & Governance', icon: LinkIcon },
  { key: 'future', label: 'Future & Roadmap', icon: CompassIcon },
];

interface Props {
  workGroup: WorkGroup;
  setWorkgroup?: (wg: WorkGroup | null) => void;
}

const statusOptions = ['Active', 'Inactive', 'Pending'];
const typeOptions = ['Governance', 'Community', 'Research', 'Education', 'Regional', 'Documentation', 'Project', 'Data'];

const WorkGroupDetails: React.FC<Props> = ({ workGroup, setWorkgroup }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editOpen, setEditOpen] = useState(false);
  const [localWG, setLocalWG] = useState(workGroup);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    report: any;
  }>({ open: false, report: null });
  const { data: session } = useSession();

  useEffect(() => {
    if ((localWG as any).id) {
      setLoadingRequests(true);
      fetch(`/api/workgroups/${(localWG as any).id}/join-request`)
        .then(res => res.json())
        .then(data => setJoinRequests(data))
        .finally(() => setLoadingRequests(false));
     
      // Cargar reportes del workgroup
      setLoadingReports(true);
      fetch(`/api/workgroups/${(localWG as any).id}/quarterly-reports`)
        .then(res => res.json())
        .then(data => {
          // Verificar que data sea un array
          if (Array.isArray(data)) {
            setReports(data);
          } else {
            console.error('API returned non-array data:', data);
            setReports([]);
          }
        })
        .catch(err => {
          console.error('Error loading reports:', err);
          setReports([]);
        })
        .finally(() => setLoadingReports(false));
    }
  }, [localWG]);

  const handleAcceptRequest = async (requestId: string, userId: string) => {
    setAcceptingId(requestId);
    // Logic to accept: add as member and update request status
    await fetch(`/api/workgroups/${(localWG as any).id}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    // Refresh pending requests from backend
    fetch(`/api/workgroups/${(localWG as any).id}/join-request`)
      .then(res => res.json())
      .then(data => setJoinRequests(data));
    setAcceptingId(null);
  };

  // Here you can condition the button visibility based on user/role/status
  const canRequestJoin = true; // Change this in the future based on membership logic

  // Form state for editing
  const [form, setForm] = useState({
    name: localWG.name,
    type: localWG.type,
    status: localWG.status,
    missionStatement: localWG.missionStatement,
    goalsAndFocus: localWG.goalsAndFocus.join(', '),
    totalMembers: localWG.totalMembers,
    roles: localWG.roles.join(', '),
    memberDirectoryLink: localWG.memberDirectoryLink,
  });

  const handleEdit = () => setEditOpen(true);
  const handleClose = () => {
    setEditOpen(false)
    setWorkgroup(null)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess(false);
    setEditError("");

    try {
      const response = await fetch(`/api/workgroups/${(localWG as any).id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          goalsAndFocus: form.goalsAndFocus.split(',').map(s => s.trim()),
          roles: form.roles.split(',').map(s => s.trim()),
        }),
      });

      if (response.ok) {
        const updatedWG = await response.json();
        setLocalWG(updatedWG);
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 2000);
        setEditOpen(false);
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || "Error updating workgroup");
      }
    } catch (error) {
      setEditError("Network error");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      alert("Please log in to join this workgroup");
      return;
    }

    const userId = session.user.id;
    try {
      const res = await fetch(`/api/workgroups/${(localWG as any).id}/join-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: joinMessage }),
      });
      if (res.ok) {
        setJoinSuccess(true);
        setTimeout(() => {
          setJoinOpen(false);
          setJoinSuccess(false);
          setJoinMessage("");
        }, 1500);
      } else {
        alert("Error sending request");
      }
    } catch (error) {
      alert("Error sending request");
    }
  };

  const handleViewReportDetail = (report: any) => {
    setDetailModal({ open: true, report });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 w-full">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-secondary">
                <BuildingIcon className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {localWG.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-400 font-medium">
                  {localWG.missionStatement}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-white border-secondary hover:border-gray-500"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-black border-secondary overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Members</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">{localWG.totalMembers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-secondary overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <TargetIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Type</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">{localWG.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-secondary overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Status</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">{localWG.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-secondary overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Created</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {localWG.dateOfCreation ? new Date(localWG.dateOfCreation).getFullYear() : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="border-secondary" />

        {/* Navigation Tabs */}
        <Card className="bg-black border-secondary overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Workgroup Details</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? "default" : "outline-solid"}
                    size="sm"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white border-secondary hover:border-gray-500 hover:bg-black'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="space-y-6 w-full overflow-hidden">
          {/* MODO EDICIÓN EN PÁGINA */}
          {editOpen ? (
            <Card className="bg-black border-secondary w-full">
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Edit Workgroup</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-secondary rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                      <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-secondary rounded px-3 py-2 text-white"
                      >
                        {typeOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mission Statement</label>
                    <textarea
                      name="missionStatement"
                      value={form.missionStatement}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-800 border border-secondary rounded px-3 py-2 text-white"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                  
                  {editSuccess && (
                    <p className="text-green-400 text-sm">Changes saved successfully!</p>
                  )}
                  {editError && (
                    <p className="text-red-400 text-sm">{editError}</p>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6 w-full">
                  <Card className="bg-black border-secondary w-full overflow-hidden">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Basic Information</h3>
                    </CardHeader>
                    <CardContent>
                      <BasicIdentificationCard
                        name={localWG.name}
                        type={localWG.type}
                        dateOfCreation={localWG.dateOfCreation}
                        status={localWG.status}
                        anchorContacts={localWG.anchorContacts}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black border-secondary w-full overflow-hidden">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Mission & Scope</h3>
                    </CardHeader>
                    <CardContent>
                      <MissionScopeCard
                        missionStatement={localWG.missionStatement}
                        goalsAndFocus={localWG.goalsAndFocus}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black border-secondary w-full overflow-hidden">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Membership</h3>
                    </CardHeader>
                    <CardContent>
                      <MembershipDetails
                        totalMembers={localWG.totalMembers}
                        roles={localWG.roles}
                        memberDirectoryLink={localWG.memberDirectoryLink}
                        workGroupId={(localWG as any).id}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Activity & Reports Tab */}
              {activeTab === 'activity' && (
                <Card className="bg-black border-secondary w-full overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Quarterly Reports</h3>
                      <Button
                        onClick={() => window.open('/dashboard/quarterly-reports', '_blank')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        View all
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingReports ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-gray-400">Loading reports...</p>
                      </div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-lg font-semibold mb-2">No reports yet</p>
                        <p className="text-sm">This workgroup has no quarterly reports yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reports.map((report: any) => (
                          <Card key={report.id} className="bg-black border-secondary hover:border-secondary transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-white">
                                    {report.year} {report.quarter}
                                  </h4>
                                  <p className="text-sm text-gray-400">
                                    {report.participants?.length || 0} participants • ${report.budgetItems?.reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) || 0} budget
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleViewReportDetail(report)}
                                  className="bg-purple-600 hover:bg-purple-700"
                                  size="sm"
                                >
                                  View detail
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Budget Tab */}
              {activeTab === 'budget' && (
                <Card className="bg-black border-secondary w-full overflow-hidden">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white">Budget & Resources</h3>
                  </CardHeader>
                  <CardContent>
                    <BudgetResources
                      currentBudgetTier={localWG.currentBudgetTier}
                      currentBudget={localWG.currentBudget}
                      utilizationSummary={localWG.utilizationSummary}
                      fundingSources={localWG.fundingSources}
                      nextProposal={localWG.nextProposal}
                      budgetProposalLink={localWG.budgetProposalLink}
                      pastBudgets={localWG.pastBudgets}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Links & Governance Tab */}
              {activeTab === 'links' && (
                <div className="space-y-6 w-full">
                  <Card className="bg-black border-secondary w-full overflow-hidden">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Connections & Dependencies</h3>
                    </CardHeader>
                    <CardContent>
                      <ConnectionsDependencies
                        collaborations={localWG.collaborations}
                        toolsUsed={localWG.toolsUsed}
                        relatedProposals={localWG.relatedProposals}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black border-secondary w-full overflow-hidden">
                    <CardHeader>
                      <h3 className="text-xl font-bold text-white">Consent & Governance</h3>
                    </CardHeader>
                    <CardContent>
                      <ConsentGovernance
                        ongoingDecisions={localWG.ongoingDecisions}
                        voteNowLink={localWG.voteNowLink}
                        consensusArchiveLink={localWG.consensusArchiveLink}
                        participationMetrics={localWG.participationMetrics}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Future & Roadmap Tab */}
              {activeTab === 'future' && (
                <Card className="bg-black border-secondary w-full overflow-hidden">
                  <CardHeader>
                    <h3 className="text-xl font-bold text-white">Future & Roadmap</h3>
                  </CardHeader>
                  <CardContent>
                    <FuturePlansRoadmap
                      nextSteps={localWG.nextSteps}
                      milestoneTimelineLink={localWG.milestoneTimelineLink}
                      openCalls={localWG.openCalls}
                      nextCycleProposalIdeas={localWG.nextCycleProposalIdeas}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Join Requests Section */}
          {joinRequests.length > 0 && (
            <Card className="bg-black border-secondary w-full overflow-hidden">
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Pending Join Requests</h3>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <p className="text-gray-400">Loading requests...</p>
                ) : (
                  <div className="space-y-2">
                    {joinRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between bg-black rounded-lg px-4 py-2">
                        <div>
                          <span className="font-semibold text-white">{req.user?.name}</span>
                          <span className="ml-2 text-gray-400 text-xs">{req.user?.email}</span>
                          {req.message && <span className="ml-4 text-gray-300 italic">"{req.message}"</span>}
                        </div>
                        <Button
                          onClick={() => handleAcceptRequest(req.id, req.userId)}
                          disabled={acceptingId === req.id}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {acceptingId === req.id ? "Accepting..." : "Accept"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Join Modal */}
      {joinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs overflow-hidden">
          <Card className="bg-black border-secondary max-w-md w-full">
            <CardHeader>
              <h3 className="text-xl font-bold text-white">Request to join this WorkGroup</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Optional message</label>
                  <textarea
                    value={joinMessage}
                    onChange={e => setJoinMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-secondary rounded px-3 py-2 text-white"
                    placeholder="Why do you want to join? (optional)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={joinSuccess}>
                    {joinSuccess ? "Request sent!" : "Send request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setJoinOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="bg-black border-secondary max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Quarterly Report Details</h3>
                <Button
                  onClick={() => setDetailModal({ open: false, report: null })}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Workgroup:</span> 
                  <span className="text-white">{detailModal.report?.workGroup?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Year:</span> 
                  <span className="text-white">{detailModal.report?.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Quarter:</span> 
                  <span className="text-white">{detailModal.report?.quarter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Created at:</span> 
                  <span className="text-white">{detailModal.report?.createdAt ? new Date(detailModal.report?.createdAt).toLocaleString() : "-"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Detail:</span>
                  <div className="bg-black rounded-lg px-4 py-2 mt-1 border border-secondary whitespace-pre-line text-white">
                    {detailModal.report?.detail || "No detail provided"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Theory of Change / Objective:</span>
                  <div className="bg-black rounded-lg px-4 py-2 mt-1 border border-secondary whitespace-pre-line text-white">
                    {detailModal.report?.theoryOfChange || "No theory of change provided"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Plans for Next Quarter:</span>
                  <div className="bg-black rounded-lg px-4 py-2 mt-1 border border-secondary whitespace-pre-line text-white">
                    {detailModal.report?.plans || "No plans provided"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Participants:</span> 
                  <span className="text-white">{detailModal.report?.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Budget (USD):</span> 
                  <span className="text-white">{detailModal.report?.budgetItems?.reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkGroupDetails; 