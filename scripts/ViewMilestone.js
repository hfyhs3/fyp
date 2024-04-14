const readline = require('readline');
const ethers = require('ethers');
const path = require('path');
const fs = require('fs');
const { PROPOSAL_FILE } = require("../hardhat-helper-config");
const proposalsPath = path.join(__dirname, "..", PROPOSAL_FILE);


// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions to the user
function ask(question) {
  return new Promise((resolve) => rl.question(question, (input) => resolve(input)));
}
function loadProposals() {
  const data = fs.readFileSync(proposalsPath, 'utf8');
  return JSON.parse(data);
}

async function viewStatus() {
  const campaignId = await ask("Enter the campaign ID: ");
  const milestoneIndex = await ask("Enter the milestone index: ");

  const proposal = await loadProposals();
  const campaign = proposal["31337"].campaigns.find(c => c.campaignId === campaignId);

  if (!campaign) {
    console.log("Campaign not found.");
  } else{
    const milestone = campaign.milestones.find(m => m.index.toString() === milestoneIndex);
    if (!milestone) {
      console.log("Milestone not found.");
    } else {
      console.log(`Milestone Details: `, milestone);
    }
  }
  rl.close();
}

async function requestRefund() {
  const campaignId = await ask("Enter the campaign ID for which you want a refund: ");
  const { get } = deployments;

  const escrowDeploy = await get("Escrow");
  const escrowAddress = escrowDeploy.address;
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);
  await escrow.refundContributors(campaignId); 
  
  console.log("Refund requested successfully.");
  rl.close();
}

// Main UI loop
async function main() {
  console.log("Welcome to the Escrow UI");
  const action = await ask("Choose an action (1: View Milestone, 2: Request Refund): ");
  
  switch(action) {
    case '1':
      await viewStatus();
      break;
    case '2':
      await requestRefund();
      break;
    default:
      console.log("Invalid option selected.");
      rl.close();
      break;
  }
}

main().catch((error) => {
  console.error("An error occurred: ", error);
  rl.close();
});
