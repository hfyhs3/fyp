import { deployments, ethers, network } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { DESCRIPTON, FUNC, FUNC_ARGS, MIN_DELAY, PROPOSAL_FILE, campaignId, developmentChains, milestoneIndex } from "../hardhat-helper-config";
import { moveBlocks, moveTime } from "../helpers";
import { log } from "console";

import * as fs from "fs";
import { BigNumber } from "ethers";
import path from "path";

const proposalsPath = path.join(__dirname, "..", PROPOSAL_FILE);

export async function queueAndExec(proposalID: string) {

    const { get } = deployments;

    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;
    const escrow = await ethers.getContractAt("Escrow", escrowAddress);

    const governorDeployment = await get("GovernorContract");
    const governorAddress = governorDeployment.address;
    const governor = await ethers.getContractAt("GovernorContract", governorAddress);

    console.log(`Governor address: ${governor.address}`);
    console.log(`Escrow address: ${escrow.address}`);
    const currentMilestone = await escrow.getDetails(campaignId);
    console.log('Current Milestone:', currentMilestone);

    const campaignStatus = await escrow.getCampaignStatus(campaignId);
    const CamstatusString = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"][campaignStatus];
    console.log(`Campaign Status: ${CamstatusString}`);

    // const proposalDescription = "Support local charity"; 
    const status = await escrow.getCampaignStatus(campaignId);
    const statusString = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"][status];
    console.log(`Campaign Status: ${statusString}`);

    if (CamstatusString ==="ACTIVE") {
        const result = await escrow.getMilestoneDetails(campaignId, milestoneIndex);
        const milestoneStatus = ["PENDING", "RELEASED", "REFUNDED", "PAID", "VERIFIED"][result[1]];
        const amount = result[0];

        console.log('current status of milestone', currentMilestone, ' is: ', milestoneStatus);
        console.log('amount of milestone ', currentMilestone, ' is: ', amount.toString());
        console.log(`Milestone ${currentMilestone} for campaign ${campaignId} has ${ethers.utils.formatEther(amount)} ETH allocated.`);
        const signer = await ethers.provider.getSigner();
        let cost =ethers.BigNumber.from(0);
        const tx = {
            to: escrowAddress,
            value: cost.add(ethers.utils.parseEther("1")) // Add a small buffer amount
        };

        
        const sentTx = await signer.sendTransaction(tx);
        await sentTx.wait();
        console.log('ETH sent to the contract successfully.');

        console.log("Releasing milestone...");
        if (milestoneStatus == "VERIFIED"){
            console.log(`Releasing Milestone ${currentMilestone}...`);
            const releaseTx = await escrow.releaseMilestone(campaignId, 1);
            await releaseTx.wait();
            console.log(`Milestone ${currentMilestone} is ${milestoneStatus}.`);
        }
        console.log(`Milestone ${currentMilestone} is ${milestoneStatus}.`);
    }


   const proposalState = await governor.state(proposalID);
   console.log("Proposal state: ", proposalState.toString());
   console.log("Proposal id: ", proposalID);

   console.log("proposal is in active state.");
   escrow.on("AllMilestonesReceived", (campaignId) => {
        console.log(`All milestones for campaign ID ${campaignId} have been released.`);
    });
    console.log(`Campaign Status: ${statusString}`);
}

const proposals= JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
const chainId = network.config.chainId!.toString();

if (!proposals[chainId] || !Array.isArray(proposals[chainId].campaigns)) {
    console.log(`No proposals found for chain ID ${chainId} or 'campaigns' is not an array`);
    process.exit(0);
}
const networkProposals = proposals[chainId].campaigns.map(campaign => campaign.proposalId);

if (!networkProposals) {
        console.log("No proposals found for this network");
        process.exit(0);
    }
const proposalID = networkProposals[0]; // changed from 0 to 1
console.log("Proposal ID: ", proposalID);

queueAndExec(proposalID).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});
