import { deployments, ethers, network } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { DESCRIPTON, FUNC, FUNC_ARGS, MIN_DELAY, PROPOSAL_FILE, developmentChains } from "../hardhat-helper-config";
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

    const campaignId = 1; 
    const milestoneIndex = 0; 
    const proposalDescription = "Release funds for milestone 1 of campaign 1"; 

    const descriptionHash = keccak256(ethers.utils.toUtf8Bytes(proposalDescription));
    const encodedFunctionCall = escrow.interface.encodeFunctionData("releaseMilestone", [campaignId, milestoneIndex]);

    log("Queueing release proposal...");

    const queueTx = await governor.queue(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash,
        { gasLimit: 1000000}
    );

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
        descriptionHash
    );

    await executeTX.wait(1);

    console.log("executed.");

    console.log('escrow value is ' + await escrow.retrieve());

}

const proposals= JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
const networkProposals = proposals[network.config.chainId!];

if (!networkProposals) {
    console.log("No proposals found for this network");
    process.exit(0);
  }
const proposalID = ethers.BigNumber.from(networkProposals[0]);
  
console.log("Proposal ID: ", proposalID.toString());

queueAndExec(proposalID.toString()).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});