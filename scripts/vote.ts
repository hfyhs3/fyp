import { deployments, ethers, network } from "hardhat";
import { MIN_DELAY, PROPOSAL_FILE, VOTING_PERIOD, developmentChains } from "../hardhat-helper-config";
import * as fs from "fs";
import { moveBlocks, moveTime } from "../helpers";

const VOTE_NO = 0;
const VOTE_YES =1;
const VOTE_ABSTAIN = 2;

export async function vote(proposalID: string, voteType: number = VOTE_YES) {

    console.log("voting...");

    const { get } = deployments;
    
    const governorDeployment = await get("GovernorContract");
    const governorAddress = governorDeployment.address;

    const governor = await ethers.getContractAt("GovernorContract", governorAddress);

    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;
    const escrow = await ethers.getContractAt("Escrow", escrowAddress);

    const voteTX = await governor.castVoteWithReason(
        proposalID, 
        voteType,
        "Yes");
    
    const receipt = await voteTX.wait(1);

    let proposalState = await governor.state(proposalID);
    if  (proposalState != 1){
        throw new Error(`Proposal is not in active state. Current State: ${proposalState}`);
    }else{
        console.log("proposal state before is: ", proposalState.toString());

        if (developmentChains.includes(network.name)){
            await moveBlocks(VOTING_PERIOD + 1);
            
        }
        proposalState = await governor.state(proposalID);
        console.log("proposal state after is: ", proposalState.toString());
    }
}

const proposals = JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));

const chainId = network.config.chainId!.toString();

if (!proposals[chainId] || !Array.isArray(proposals[chainId].campaigns)) {
    console.log(`No proposals found for chain ID ${chainId} or 'campaigns' is not an array`);
    process.exit(0);
}

const networkProposals = proposals[chainId].campaigns.map(campaign => campaign.proposalId);

if (networkProposals.length === 0) {
    console.log(`No proposal IDs found for chain ID ${chainId}`);
    process.exit(0);
}

const proposalID = networkProposals[0]; // Use the first proposal ID for voting
console.log("Proposal ID: ", proposalID);
  
vote(proposalID).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});