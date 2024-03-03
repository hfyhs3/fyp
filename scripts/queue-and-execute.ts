import { deployments, ethers, network } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { DESCRIPTON, FUNC, FUNC_ARGS, MIN_DELAY, PROPOSAL_FILE, campaignId, developmentChains, milestoneIndex } from "../hardhat-helper-config";
import { moveBlocks, moveTime } from "../helpers";
import { log } from "console";

import * as fs from "fs";

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

    // const campaignId = 1;  //recheck
    // const milestoneIndex = 0; // recheck
    const proposalDescription = "Support local charity"; 

    const encodedFunctionCall = governor.interface.encodeFunctionData("approveCampaign", [campaignId]); // campaign id in args
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription));

    log("Queueing release proposal...");

    const status = await escrow.getCampaignStatus(campaignId);
    console.log(`Campaign Status: ${escrow.getCampaignStatus(campaignId)}`);

    if (status.toString() !== escrow.getCampaignStatus(campaignId)) {
        console.log("Campaign is not in ACTIVE status.");
        const approve = await escrow.approveCampaign(campaignId);
        await approve.wait(1);
        console.log(`Campaign approved: ${approve}`);
    }

   const proposalState = await governor.state("64211841402750563409348020008446934387029839689634311668291959018123029582102");
   console.log("Proposal state: ", proposalState.toString());
   console.log("Proposal id: ", proposalID);

   console.log("proposal is in active state.");
    const queueTx = await governor.queue(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash,
        { gasLimit: 5000000});

    console.log("1: proposal in queue.");

    await queueTx.wait(1);

    console.log("proposal in queue.");


    if(developmentChains.includes(network.name)){
        await moveTime(MIN_DELAY +1);
        await moveBlocks(1);
    }

    console.log("executing proposal...");

    const executeTX = await governor.execute(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash,
        { gasLimit: 5000000}
    );

    await executeTX.wait(1);

    console.log("executed");
        
    // console.log('escrow value is ' + await escrow.retrieve());

}

const proposals= JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
const networkProposals = proposals[network.config.chainId!];

if (!networkProposals) {
        console.log("No proposals found for this network");
        process.exit(0);
    }
const proposalID = networkProposals[1]; // changed from 0 to 1
console.log("Proposal ID: ", proposalID);

queueAndExec(proposalID).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});
