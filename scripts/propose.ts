import { deployments, ethers, network } from "hardhat";
import { DESCRIPTON, FUNC, FUNC_ARGS, PROPOSAL_FILE, VOTING_DELAY, developmentChains } from "../hardhat-helper-config";
import { moveBlocks } from "../helpers";

import * as fs from "fs";

export async function  makeProposal ()
    {
        const [deployer] = await ethers.getSigners();
        const { get } = deployments;

        const beneficiaryAddress = deployer.address; 
        const totalAmount = ethers.utils.parseEther("3");
        const milestoneCount = 3;
        const campaignDescription = "Support local charity";


        const governorDeployment = await get("GovernorContract");
        const governorAddress = governorDeployment.address;

        const escrowDeploy = await get("Escrow");
        const escrowAddress = escrowDeploy.address;

        const escrow = await ethers.getContractAt("Escrow", escrowAddress)

        const governor = await ethers.getContractAt("GovernorContract", governorAddress );

        const encodedFunctionCall = escrow.interface.encodeFunctionData("createCampaign",[beneficiaryAddress, totalAmount, milestoneCount]);

        const createProposalTx = await governor.propose(
            [escrowAddress],
            [0],
            [encodedFunctionCall],
            campaignDescription
        );

        const proposeReceipt = await createProposalTx.wait(1);
        
        if (developmentChains.includes(network.name)){
            await moveBlocks(VOTING_DELAY + 1);
        } 

        const proposalIdEvent = proposeReceipt.events.find(e => e.event === "ProposalCreated");
        if (!proposalIdEvent) {
            throw new Error("ProposalCreated event not found");
        }
        const proposalID = proposalIdEvent.args[0]; // Assuming the first argument is the proposal ID
        console.log("proposalID: " + proposalID.toString());


        fs.writeFileSync(
            PROPOSAL_FILE,
            JSON.stringify({[network.config.chainId!.toString()]: [proposalID.toString()],
            })
        );
}

makeProposal()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
