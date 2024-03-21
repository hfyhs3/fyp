import { ethers } from 'ethers';
import { deployments } from 'hardhat';

// Define interface types for the contract responses
interface CampaignDetails {
    id: ethers.BigNumber;
    beneficiary: string;
    totalAmount: ethers.BigNumber;
    status: ethers.BigNumber;
    milestoneCount: ethers.BigNumber;
}

interface MilestoneDetails {
    amount: ethers.BigNumber;
    status: ethers.BigNumber;
    workers: ethers.BigNumber;
    materialCost: ethers.BigNumber;
    daysTaken: ethers.BigNumber;
}

const { get } = deployments;

const escrowDeploy = await get("Escrow");
const escrowAddress = escrowDeploy.address;

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const escrowAbi = [
    "function viewCampaignDetails(uint _campaignId) public view returns (uint id, address beneficiary, uint totalAmount, uint status, uint milestoneCount)",
    "function viewMilestoneDetails(uint _campaignId, uint _milestoneIndex) public view returns (uint amount, uint status, uint workers, uint materialCost, uint daysTaken)",
];

const escrow = new ethers.Contract(escrowAddress, escrowAbi, provider);

async function viewCampaignDetails(campaignId: number): Promise<void> {
    try {
        const details: CampaignDetails = await escrow.viewCampaignDetails(campaignId);
        console.log('Campaign Details:', details);
    } catch (error) {
        console.error('Error fetching campaign details:', error);
    }
}

async function viewMilestoneDetails(campaignId: number, milestoneIndex: number): Promise<void> {
    try {
        const details: MilestoneDetails = await escrow.viewMilestoneDetails(campaignId, milestoneIndex);
        console.log(`Milestone ${milestoneIndex} Details:`, details);
    } catch (error) {
        console.error('Error fetching milestone details:', error);
    }
}

const campaignId = 1;
const milestoneIndex = 0;

(async () => {
    await viewCampaignDetails(campaignId);
    await viewMilestoneDetails(campaignId, milestoneIndex);
})();
