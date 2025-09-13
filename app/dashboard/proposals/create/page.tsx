"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
type BudgetItem = { name: string; amount: number };

function CreateProposalPage() {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
	const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [quarter, setQuarter] = useState('Q1');
	const [links, setLinks] = useState<string[]>([]);
	const [newLink, setNewLink] = useState("");
	const [proposalType, setProposalType] = useState<"COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT">("COMMUNITY_PROPOSAL");
	const router = useRouter();
	const isAuthorized = true; // Reemplaza por tu lógica real de autorización

	const handleSelectedWorkGroupsChange = useCallback((workGroupIds: string[]) => {
		setSelectedWorkGroups(workGroupIds);
	}, []);

	const handleBudgetItemsChange = useCallback((items: BudgetItem[]) => {
		setBudgetItems(items);
	}, []);

	const handleAddLink = () => {
		if (newLink && /^https?:\/\//.test(newLink)) {
			setLinks([...links, newLink]);
			setNewLink("");
		}
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
					quarter: proposalType === "QUARTERLY_REPORT" ? quarter : undefined, // Solo incluir el trimestre si es un informe trimestral
					links,
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to create proposal");
			}
			const proposal = await response.json();
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
		if (proposalType === 'QUARTERLY_REPORT') setQuarter('Q1');
	}, [proposalType]);

		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-900">
				<div className="max-w-3xl w-full bg-slate-800 rounded-lg shadow-lg p-8">
					<h2 className="text-3xl font-bold mb-6 text-center text-white">Create New Proposal</h2>
					{error && (
						<div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded mb-4">
							{error}
						</div>
					)}
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label className="block text-white mb-1">Title</label>
							<input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white" />
						</div>
						<div className="mb-4">
							<label className="block text-white mb-1">Description</label>
							<textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white" />
						</div>
						<div className="mb-4">
							<label className="block text-white mb-1">Expiration Date</label>
							<input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white" />
						</div>
						{/* Relevant Links */}
						<div className="mb-4">
							<label className="block text-white mb-1">Relevant Links</label>
							<div className="flex gap-2 mb-2">
								<input type="url" placeholder="Add a link..." value={newLink} onChange={e => setNewLink(e.target.value)} className="flex-1 p-2 rounded bg-slate-700 text-white" />
								<button type="button" onClick={handleAddLink} className="bg-white text-black px-4 py-2 rounded">Add</button>
							</div>
							<ul className="list-disc pl-5">
								{links.map((link, idx) => (
									<li key={idx} className="mb-1">
										<Link href={link} target="_blank" rel="noopener noreferrer" className="text-green-400 underline break-all">{link}</Link>
										<button type="button" className="ml-2 text-xs text-red-400" onClick={() => handleRemoveLink(idx)}>Remove</button>
									</li>
								))}
							</ul>
						</div>
						<button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-3 rounded font-bold mt-6">
							{isSubmitting ? "Creating..." : "Create Proposal"}
						</button>
					</form>
				</div>
			</div>
		);
}

export default CreateProposalPage;
