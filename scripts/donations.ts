import { ethers, deployments } from "hardhat";
import fs from "fs";
import path from "path";

async function matchAndDonate() {
    // Load user preferences
    const usersFilePath = path.join(__dirname, 'users.json');
    const usersFileData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const usersData = usersFileData.users;
    const userDonations = usersData.find((user: any) => user.donations)?.donations;

    if (!userDonations) {
        console.error("No donations found for user.");
        return;
    }

     // Load campaign proposals
    const proposalsFilePath = path.join(__dirname, '..', 'proposal.json');
    const proposalsData = JSON.parse(fs.readFileSync(proposalsFilePath, 'utf8'));
    const campaigns = proposalsData["31337"].campaigns;
    const matchingCampaigns: any[] = [];

    userDonations[0].distribution.forEach((preference: string) => {
        const [percent, description] = preference.split('% '); // Split by '% ' to separate the percentage and description
        const percentage = parseInt(percent) / 100; // Convert to a decimal

        campaigns.forEach((campaign: any) => {
            if (campaign.description.toLowerCase().includes(description.toLowerCase())) {
                matchingCampaigns.push({ 
                    campaignId: campaign.campaignId, 
                    description, 
                    percentage });
                console.log(`Match found. Contributing to campaign '${description}' with ${percentage * 100}% of donation.`);
                // Add logic to contribute to the campaign
            }
        });
    });
    
    // if (matchingCampaigns.length === 0) {
    //     console.log("No matching campaigns found for user preferences.");
    //     return;
    // }

    // Assuming a function to get all campaigns with descriptions
    const { get } = deployments;
    const escrowDeploy = await get("Escrow");
    const escrow = await ethers.getContractAt("Escrow", escrowDeploy.address);
    console.log("Escrow address: ", escrow.address);
    // Calculate donation amounts
    const totalEth = ethers.utils.parseEther(userDonations[0].ethAmount.toString()); // first user
    console.log(`Total donation amount: ${ethers.utils.formatEther(totalEth)} ETH`);
    for (const match of matchingCampaigns) {
        console.log(`Matching campaign: ${match.campaignId} - ${match.description}`);
        const donationAmount = totalEth.mul(ethers.BigNumber.from(match.percentage * 100)).div(100);
        console.log(`Donating ${ethers.utils.formatEther(donationAmount)} ETH to campaign ID ${match.campaignId}...`);
    
        // Contribute to the matching campaign
        try {
            const tx = await escrow.contributeToCampaign(match.campaignId, { value: donationAmount });
            await tx.wait(1);
            console.log(`Donation of ${ethers.utils.formatEther(donationAmount)} ETH successfully contributed to campaign ID ${match.campaignId}.`);
        } catch (error) {
            console.error(`Failed to contribute to campaign ID ${match.campaignId}:`, error);
        }
    }
    
    console.log("Donations successfully processed.");
    
}

matchAndDonate().catch((error) => {
    console.error("Error processing donations:", error);
    process.exit(1);
});
