// Debug script for all elements in the proposal creation form

const debugProposal = {
  title: "Test Proposal Title",
  description: "This is a test description for debugging purposes.",
  proposalType: "QUARTERLY_REPORT",
  expiresAt: new Date().toISOString(),
  attachment: {
    url: "https://example.com/test.pdf",
    name: "test.pdf",
    type: "application/pdf",
    size: 123456
  },
  budgetItems: [
    { name: "Item 1", amount: 100, type: "Admin" },
    { name: "Item 2", amount: 200, type: "Operative" }
  ],
  workGroupIds: ["bee328b0-22d7-466d-b8d1-7f9d55e38ae0", "18e5a53b-7cb0-4aa6-aa13-f4fd15e26961"],
  quarter: "Q1",
  links: [
    "https://github.com/",
    "https://supabase.com/"
  ]
};

console.log("Debug Proposal Object:", debugProposal);

// You can add more debug outputs or send this object to your API for testing
// Example:
// fetch('/api/proposals', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(debugProposal)
// }).then(res => res.json()).then(console.log).catch(console.error);
