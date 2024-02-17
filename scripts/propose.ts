import { deployments, ethers, network } from "hardhat";
import { DESCRIPTON, FUNC, FUNC_ARGS, PROPOSAL_FILE, VOTING_DELAY, developmentChains } from "../hardhat-helper-config";
import { moveBlocks } from "../helpers";

import * as fs from "fs";

export async function  makeProposal (
    functionToCall: string, 
    args: number[], 
    proposalDescription: string
    // ItemId: number,
    // escrowAddress: string) 
    )
    {
        const [deployer] = await ethers.getSigners();
        const { get } = deployments;

        const governorDeployment = await get("GovernorContract");
        const governorAddress = governorDeployment.address;

        const boxDeployment = await get("Box");
        const boxAddress = boxDeployment.address;

        // const escrow = await ethers.getContractAt("Escrow", escrowAddress)

        const governor = await ethers.getContractAt("GovernorContract", governorAddress );
        const box = await ethers.getContractAt("Box", boxAddress);

        const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall,args);

        const createProposalTx = await governor.propose(
            [boxAddress],
            [0],
            [encodedFunctionCall],
            proposalDescription
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

makeProposal (
    FUNC,
    [FUNC_ARGS], 
    DESCRIPTON).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});

