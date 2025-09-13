import React, { useState, useEffect } from "react";
import { UsersIcon, UserPlusIcon, UserIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface Member {
  id: string;
  user: UserOption;
  role: string;
}

interface Props {
  totalMembers: string;
  roles: string[];
  memberDirectoryLink: string;
  workGroupId?: string;
}

const MembershipDetails: React.FC<Props> = ({ totalMembers, roles, memberDirectoryLink, workGroupId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Fetch miembros actuales
  useEffect(() => {
    if (workGroupId) {
      setMembersLoading(true);
      fetch(`/api/workgroups/${workGroupId}/members`)
        .then(res => res.json())
        .then(data => setMembers(data))
        .finally(() => setMembersLoading(false));
    }
  }, [workGroupId, modalOpen, success]);

  useEffect(() => {
    if (modalOpen) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [modalOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    if (!selectedUser || !workGroupId) return;
    const res = await fetch(`/api/workgroups/${workGroupId}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSuccess(false);
        setSelectedUser("");
      }, 1200);
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Unknown error" };
      }
      setError((data as any).error || "Error adding user");
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-secondary">
            <UsersIcon className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Membership & Roles</h3>
            <p className="text-xs sm:text-sm text-gray-400">Team members and their roles</p>
          </div>
        </div>
        {workGroupId && (
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Members */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Current Members</span>
          </div>
          {membersLoading ? (
            <div className="p-4 bg-black/50 rounded-lg border border-secondary">
              <p className="text-sm text-gray-400">Loading members...</p>
            </div>
          ) : members?.length === 0 ? (
            <div className="p-4 bg-black/30 rounded-lg border border-secondary">
              <p className="text-sm text-gray-500">No members yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members?.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-secondary">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{m.user?.name || "Unknown user"}</p>
                    <p className="text-xs text-gray-400">{m.user?.email || "No email"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-gray-500/10 text-gray-300 border-gray-500/30">
                    {m.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Roles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Available Roles</span>
          </div>
          <div className="space-y-2">
            {roles.map((role, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-black/50 rounded-lg border border-secondary">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-200">{role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <Card className="bg-black border-secondary max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white">Add Member to WorkGroup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select a user
                  </label>
                  <select
                    className="w-full bg-gray-800 border border-secondary rounded px-3 py-2 text-white"
                    value={selectedUser}
                    onChange={e => setSelectedUser(e.target.value)}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={loading || !selectedUser}
                  >
                    {success ? "Added!" : loading ? "Adding..." : "Add Member"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MembershipDetails; 