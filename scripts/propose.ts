import { deployments, ethers, network } from "hardhat";
import { DESCRIPTON, FUNC, FUNC_ARGS, PROPOSAL_FILE, VOTING_DELAY, developmentChains, milestoneIndex } from "../hardhat-helper-config";
import { moveBlocks } from "../helpers";

import * as fs from "fs";
import * as path from "path";

const PROPOSAL_FILE_PATH = path.join(__dirname, "..", PROPOSAL_FILE);

function readProposals(){
    if (!fs.existsSync(PROPOSAL_FILE_PATH)){
        console.error('does not exist, create a new one');
        return {};
    }
    return JSON.parse(fs.readFileSync(PROPOSAL_FILE_PATH, 'utf8'));
}

function writeProposals(proposals: any){
    const json = JSON.stringify(proposals, null, 2);
    fs.writeFileSync(PROPOSAL_FILE_PATH, json);
}

function addProposalId(chainId: string, campaignId:string, proposalId: string){
    const proposals = readProposals();
    if (!proposals[chainId]) {
        proposals[chainId] = {};
    }
    if (!proposals[chainId][campaignId]) {
        proposals[chainId][campaignId] = proposalId;
        console.log(`Associated proposal ID ${proposalId} with campaign ID ${campaignId} for network ${chainId}.`);
    } else {
        console.log(`Campaign ID ${campaignId} already associated with a proposal ID for network ${chainId}.`);
    }
    writeProposals(proposals);
}

export async function  makeProposal ()
{
    const [deployer] = await ethers.getSigners();
    const { get } = deployments;

    const beneficiaryAddress = deployer.address; 
    const totalAmount = ethers.utils.parseEther("3"); //recheck
    const milestoneCount = 3; // recheck
    const campaignDescription = "Support local charity";


    const governorDeployment = await get("GovernorContract");
    const governorAddress = governorDeployment.address;

    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;

    const escrow = await ethers.getContractAt("Escrow", escrowAddress);

    // const daoAddress = await escrow.daoAddress();
    // console.log("daoAddress: " + daoAddress);

    // const daoSigner = await ethers.getSigner(daoAddress);
    // const escrowSigner = await escrow.connect(daoSigner);

    const governor = await ethers.getContractAt("GovernorContract", governorAddress );

    const createCampaignTx = await escrow.createCampaign(beneficiaryAddress, totalAmount, milestoneCount);
    const createCampaignReceipt = await createCampaignTx.wait(1);

    const campaignCreatedEvent = createCampaignReceipt.events?.find(e => e.event === "CampaignCreated");
    if (!campaignCreatedEvent || !campaignCreatedEvent.args) throw new Error("CampaignCreated event not found");

    const campaignId = campaignCreatedEvent.args[0];
    const beneficiary = campaignCreatedEvent.args[1];
    const amount = campaignCreatedEvent.args[2];

    const formattedAmount = ethers.utils.formatEther(amount);

    console.log(`Campaign Created with ID: ${campaignId}`);
    console.log(`Beneficiary: ${beneficiary}`);
    console.log(`Total Amount: ${formattedAmount} ETH`);

    console.log(`Campaign created with ID: ${campaignId}`);
    
    const encodedFunctionCall = governor.interface.encodeFunctionData("approveCampaign",[campaignId]);

    const createProposalTx = await governor.propose(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        campaignDescription
    );

    const status = await escrow.getCampaignStatus(campaignId);
    const statusString = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"][status];
    console.log(`Campaign Status: ${statusString}`);

    if (status.toString() !== "1") {
        const approve = await escrow.approveCampaign(campaignId);
        await approve.wait(1);
        const newStatus = await escrow.getCampaignStatus(campaignId);
        const newStatusString = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"][newStatus];
        console.log(`Campaign approved: ${newStatusString}`);

    }

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

    addProposalId(network.config.chainId!.toString(), campaignId, proposalID.toString());
}

makeProposal()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
