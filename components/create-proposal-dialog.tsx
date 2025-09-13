"use client";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import BudgetItems, { BudgetItem } from "@/components/budget-items";
import WorkGroupSelector from "@/components/workgroup-selector";
import type { LinkItem } from "@/lib/types";
import MDEditor from "@uiw/react-md-editor";
import * as commands from "@uiw/react-md-editor/commands";

export function CreateProposalDialog({
  onSuccess,
  open,
  setOpen
}: {
  onSuccess?: () => void,
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([{
    description: "",
    name: "",
    id: Date.now().toString(),
    quantity: 1,
    type: "Admin",
    unitPrice: 0,
    total: 0
  }]);
  const [description, setDescription] = useState("");
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState("Q1");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [proposalType, setProposalType] = useState<"COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT">("COMMUNITY_PROPOSAL");
  const router = useRouter();

  const isQuartelyReportType = proposalType === "QUARTERLY_REPORT"

  useEffect(() => {
    if (isQuartelyReportType && description.trim() === "") {
      setDescription("Paste your Quarterly Report here, ensuring updates from the consent process are reflected in Gov_Dash and the Google Drive doc.")
    }
  }, [proposalType])

  const handleAddLink = () => {
    setLinkError(null);
    let title = newLinkTitle.trim();
    let url = newLinkUrl.trim();
    if (!title && !url) {
      setLinkError("Enter a title and URL");
      return;
    }
    if (!url) {
      setLinkError("Enter the URL");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    try {

      new URL(url);
    } catch {
      setLinkError("Enter a valid URL");
      return;
    }
    if (!title) title = url;
    setLinks([...links, { title, url }]);
    setNewLinkTitle("");
    setNewLinkUrl("");
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !expiresAt) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          proposalType,
          expiresAt: new Date(expiresAt).toISOString(),
          budgetItems,
          workGroupIds: selectedWorkGroups,
          quarter: isQuartelyReportType ? quarter : undefined,
          year: isQuartelyReportType ? year : undefined,
          links,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create proposal");
      }
      const proposal = await response.json();
      setOpen(false);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        router.push(`/dashboard/proposals/${proposal.id}`);
      }, 100);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isQuartelyReportType) setQuarter("Q1");
  }, [proposalType]);

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <button className="bg-secondary! hover:bg-primary/80! text-white! px-4 py-2 rounded font-bold">Create Proposal</button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="bg-slate-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle >Create New Proposal</DialogTitle>
          <DialogDescription className="text-slate-400">Fill out the form to create a new proposal.</DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded mb-4">{error}</div>
        )}
        <div className="h-[90vh] max-h-[90vh] overflow-y-auto pr-2 flex flex-col justify-start">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="proposal-type" className="block mb-1">Proposal Type</label>
              <select id="proposal-type" value={proposalType} onChange={e => {
                setProposalType(e.target.value as any)
                setSelectedWorkGroups([])
              }} className="w-full border border-secondary p-2 rounded bg-slate-700 text-white">
                <option value="COMMUNITY_PROPOSAL">Community Proposal</option>
                <option value="QUARTERLY_REPORT">Quarterly Report & Proposal</option>
              </select>
            </div>

            <div>
              <label htmlFor="proposal-title" className="block mb-1">Proposal Title</label>
              <input id="proposal-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required minLength={5} className="w-full border border-secondary p-2 rounded bg-slate-700 text-white" />
            </div>

            {isQuartelyReportType && (
              <div>
                <label htmlFor="proposal-quarter" className="block mb-1">Select a quarter</label>
                <select id="proposal-quarter" value={quarter} onChange={e => setQuarter(e.target.value)} className="w-full border border-secondary p-2 rounded bg-slate-700 text-white">
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
                <div className="mt-3">
                  <label htmlFor="proposal-year" className="block mb-1">Year</label>
                  <select
                    id="proposal-year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full border border-secondary p-2 rounded bg-slate-700 text-white"
                  >
                    {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block mb-1">Workgroups</label>
              <div className="mt-2">

                <WorkGroupSelector
                  selectedWorkGroups={selectedWorkGroups}
                  proposalType={proposalType}
                  onChange={(newSelection) => {
                    if (isQuartelyReportType) {
                      const last = newSelection[newSelection.length - 1];
                      setSelectedWorkGroups(last ? [last] : []);
                    } else {
                      setSelectedWorkGroups(newSelection);
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="proposal-expiration" className="block mb-1">Expiration Date & Time</label>
              <input id="proposal-expiration" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required className="w-full border border-secondary p-2 rounded bg-slate-700 text-white" />
            </div>

            <div>
              <label htmlFor="proposal-description" className="block mb-1">Description</label>
              <MDEditor
                value={description}
                onChange={(v) => setDescription(v || "")}
                previewOptions={{ className: "prose prose-invert max-w-none" }}
                height={200}
                overflow={false}
                commands={[
                  commands.bold,
                  commands.italic,
                  commands.strikethrough,
                  commands.hr,
                  commands.group(
                    [commands.heading1, commands.heading2, commands.heading3, commands.heading4, commands.heading5, commands.heading6],
                    { name: "title", groupName: "title", buttonProps: { "aria-label": "Insert title" } }
                  ),
                  commands.link,
                  commands.quote,
                  commands.code,
                  commands.unorderedListCommand,
                  commands.orderedListCommand,
                  // commands.image  <-- ✗ leave this out to hide the image button
                ]}
                className="scale-[0.99] bg-transparent! text-red-500!"
              />
            </div>

            <div>
              <BudgetItems items={budgetItems} onChange={(items: BudgetItem[]) => setBudgetItems(items)} />
            </div>

            <div>
              <label className="block mb-1">Relevant Links</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input type="text" placeholder="Title" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} className="border border-secondary p-2 rounded bg-slate-700 text-white" />
                <input type="url" placeholder="https://..." value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="md:col-span-2 border border-secondary p-2 rounded bg-slate-700 text-white" />
                <button type="button" onClick={handleAddLink} className="md:col-span-3 bg-white text-black px-4 py-2 rounded">Add link</button>
              </div>
              {linkError && <p className="text-red-400 text-sm mb-2">{linkError}</p>}
              <ul className="list-disc pl-5">
                {links.map((link, idx) => (
                  <li key={idx} className="mb-1">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-green-400 underline break-all">{link.title}</a>
                    <button type="button" className="ml-2 text-xs text-red-400" onClick={() => handleRemoveLink(idx)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <button type="submit" disabled={isSubmitting} className="w-full border border-secondary bg-white text-black py-3 rounded font-bold mt-6">
                {isSubmitting ? "Creating..." : "Create Proposal"}
              </button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
