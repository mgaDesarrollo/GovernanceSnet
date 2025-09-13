"use client";
import React, { useState, useEffect } from "react";
import WorkGroupDetails from "@/components/workgroups/WorkGroupDetails";
import type { WorkGroup } from "@/lib/types";
import { 
  SearchIcon,
  FilterIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

// Tipo extendido para aceptar 'members'
type WorkGroupWithMembers = WorkGroup & { members?: any[] };

export default function WorkGroupsPage() {
  const [workGroups, setWorkGroups] = useState<WorkGroupWithMembers[]>([]);
  const [selected, setSelected] = useState<WorkGroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/workgroups")
      .then(res => res.json())
      .then(data => {
        setWorkGroups(data.length > 0 ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredWorkGroups = workGroups?.filter(wg => {
    const matchesSearch = wg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wg.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || wg.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500/20 text-green-300 border-secondary font-semibold">Active</Badge>;
      case 'Inactive':
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 font-semibold">Inactive</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-secondary font-semibold">{status}</Badge>;
    }
  };

  const stats = {
    total: workGroups?.length || 0,
    active: workGroups?.filter(wg => wg.status === 'Active').length || 0,
    inactive: workGroups?.filter(wg => wg.status === 'Inactive').length || 0,
    totalMembers: workGroups?.reduce((sum, wg) => sum + parseInt(wg.totalMembers || '0'), 0) || 0
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 xl:p-12 max-w-none">
      {loading ? (
        <LoadingSkeleton type="page" />
      ) : !selected ? (
        <>
          {/* Header Section */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Workgroups</h1>
              <p className="text-gray-400 font-medium">Manage and explore workgroups</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <Card className="bg-linear-to-br from-blue-900/30 to-blue-800/20 border-secondary overflow-hidden">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-400 font-medium">Total Groups</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-green-900/30 to-green-800/20 border-secondary overflow-hidden">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-400 font-medium">Active Groups</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-purple-900/30 to-purple-800/20 border-secondary overflow-hidden">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-400 font-medium">Total Members</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
                </CardContent>
              </Card>

              <Card className="bg-linear-to-br from-orange-900/30 to-orange-800/20 border-secondary overflow-hidden">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-400 font-medium">Growth Rate</p>
                  <p className="text-2xl font-bold text-white">+12%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="border-secondary" />

          {/* Search and Filters */}
          <Card className="bg-black border-secondary w-full overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FilterIcon className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold text-white tracking-wide">Search & Filters</h3>
                </div>
                {/* <Button className="bg-purple-600 hover:bg-purple-700 font-bold">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Workgroup
                </Button> */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search workgroups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black border-secondary text-white placeholder-gray-400"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border bg-black border-secondary text-white rounded-md px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <div className="flex items-center justify-end">
                  <Badge variant="outline" className="text-gray-400 font-bold">
                    {filteredWorkGroups.length} workgroup{filteredWorkGroups.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workgroups Grid */}
          <div className="w-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400 font-medium">Loading workgroups...</p>
              </div>
            ) : !workGroups || workGroups.length === 0 ? (
              <Card className="bg-black border-secondary w-full">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">No Workgroups Found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto font-medium">
                    Get started by creating your first workgroup.
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700 font-bold">
                    Create Workgroup
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {filteredWorkGroups.map((wg) => (
                  <Card 
                    key={wg.id} 
                    className="overflow-hidden bg-black border-secondary hover:border-secondary transition-all duration-200 hover:shadow-lg cursor-pointer group"
                    onClick={() => setSelected(wg)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-white text-lg tracking-wide group-hover:text-purple-300 transition-colors">
                            {wg.name}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium">{wg.type}</p>
                        </div>
                        {getStatusBadge(wg.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Members</p>
                            <p className="text-sm font-bold text-white">{wg.totalMembers}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Created</p>
                            <p className="text-sm font-bold text-white">
                              {wg.dateOfCreation ? new Date(wg.dateOfCreation).toLocaleDateString() : "-"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <span className="text-xs text-gray-500 font-medium">Click to view details</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="w-full">
          <WorkGroupDetails setWorkgroup={setSelected} workGroup={selected as any} />
        </div>
      )}
    </div>
  );
} 