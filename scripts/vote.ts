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
        "Cause yeah");
    
    await voteTX.wait(1);

    let proposalState = await governor.state(proposalID);
    console.log("proposal state before is: ", proposalState);

    if (developmentChains.includes(network.name)){
        await moveBlocks(VOTING_PERIOD + 1);
    }
    proposalState = await governor.state(proposalID);
    console.log("proposal state after is: ", proposalState);
}

const proposals= JSON.parse(fs.readFileSync(PROPOSAL_FILE, "utf8"));
const networkProposals = proposals[network.config.chainId!];

if (!networkProposals) {
    console.log("No proposals found for this network");
    process.exit(0);
  }
  const proposalID = networkProposals[0];
  
  console.log("Proposal ID: ", proposalID);
  
vote(proposalID).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});