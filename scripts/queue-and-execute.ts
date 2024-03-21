import { deployments, ethers, network } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { DESCRIPTON, FUNC, FUNC_ARGS, MIN_DELAY, PROPOSAL_FILE, campaignId, developmentChains, milestoneIndex } from "../hardhat-helper-config";
import { moveBlocks, moveTime } from "../helpers";
import { log } from "console";

import * as fs from "fs";
import { BigNumber } from "ethers";

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

        console.log('current status of milestone ${milestoneIndex} is: ', milestoneStatus);
        console.log('amount of milestone ${milestoneIndex} is: ', amount.toString());
        console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} has ${ethers.utils.formatEther(amount)} ETH allocated.`);

        console.log("Releasing milestone due to sufficient contributions...");
        if (milestoneStatus == "VERIFIED"){
            const totalContributions = await escrow.calculateTotalContributionsForMilestone(campaignId, milestoneIndex);
            console.log(`Total contributions for Milestone ${milestoneIndex}: ${ethers.utils.formatEther(totalContributions)} ETH`);
            if (totalContributions.gte(amount)){
                console.log(`Releasing Milestone ${milestoneIndex}...`);
                const releaseTx = await escrow.releaseMilestone(campaignId, milestoneIndex);
                await releaseTx.wait();
                console.log(`Milestone ${milestoneIndex} is ${milestoneStatus}.`);
            } else {
                console.log(`Milestone ${milestoneIndex} is not ready to be released.`);
            }
        }
    } 
    console.log("checking if all released");
    const txCheck = await escrow.checkAndAdvanceMilestone(campaignId);
    await txCheck.wait(1);
    console.log(`Milestone ${milestoneIndex} is released.`);

    // const encodedFunctionCall = governor.interface.encodeFunctionData("releaseMilestone", [campaignId, milestoneIndex]); // campaign id in args
    // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription));

    // log("Queueing release proposal...");


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
