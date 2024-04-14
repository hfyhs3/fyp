const readline = require('readline');
const path = require('path');
const fs = require('fs');

const donationsFilePath = path.join(__dirname, 'users.json');
const sessionFilePath = path.join(__dirname, 'session.json');
const { PROPOSAL_FILE } = require("../hardhat-helper-config");
const proposalsPath = path.join(__dirname, "..", PROPOSAL_FILE);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const loadCampaigns = () => {
  try {
    const data = fs.readFileSync(proposalsPath, 'utf8');
    const proposals = JSON.parse(data);
    chainID = "31337";
    return proposals[chainID].campaigns;
  } catch (error) {
    console.error('Error loading campaign data:', error);
    return [];
  }
};

const saveProposals = (campaigns) => {
  try {
    const proposals = loadCampaigns();
    proposals["31337"].campaigns =  campaigns;
    fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save proposals:', error);
  }
};

const printCampaignDetails = (campaigns) => {
  console.log('Available Campaigns:');
  campaigns.forEach(campaign => {
    console.log(`Campaign ID: ${campaign.campaignId}, Description: ${campaign.description}`);
    campaign.milestones.forEach(milestone => {
      console.log(`  Milestone ${milestone.index}: ${milestone.description} ${milestone.completed ? '(Completed)' : ''}`);
    });
  });
};

const loadSession = () => {
    try {
        const sessionData = fs.readFileSync(sessionFilePath, 'utf8');
        return JSON.parse(sessionData);
    } catch (error) {
        console.error('Error loading session data:', error);
        return null;
    }
};

const loadUserDonations = () => {
  try {
    const data = fs.readFileSync(donationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading user donations:', error);
    return {users: []};
  }
};

const storeDonationData = ({ethAmount, distribution, campaignId}) => {
  const session = loadSession();
  const userId = session.userId;
  let donationsData = loadUserDonations();

  console.log(`Storing donation data for userId: ${userId}`);
  let userIndex = donationsData.users.find(user => user.id === userId);

  if (!userIndex) {
    user = {
      id: userId,
      donations: [{ ethAmount, distribution, campaignId }]
    };
    donationsData.users.push(user); // Add the new user to the users array.
  } else {
    // If user exists, add the new donation.
    if (!userIndex.donations) {
      userIndex.donations = []; // Initialize the donations array if it doesn't exist.
    }
    userIndex.donations.push({ ethAmount, distribution, campaignId });
  }

  // Save the updated donations data back to the file.
  try {
    fs.writeFileSync(donationsFilePath, JSON.stringify(donationsData, null, 2), 'utf8');
    console.log('Donation data stored successfully.');
  } catch (error) {
    console.error('Failed to store donation data:', error);
  }
};

  const contribute = async (campaignId) => {
    const { get } = deployments;
    console.log('Contribute to campaign:', campaignId);
    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;
    const escrow = await ethers.getContractAt("Escrow", escrowAddress);

    rl.question('Enter the amount of ETH you want to donate: ', async (amount) => {
      const ethAmount = ethers.utils.parseEther(amount.toString());
      if (ethAmount.lte(0)) {
        console.log('Please enter a valid amount.');
        rl.close();
        return;
      } else {
        console.log(`You've chosen to donate ${ethAmount} ETH.`);
      }

    rl.question('Enter how you want to divide your donation among the selected campaigns (e.g., 50% education, 30% health, 20% food): ', async (distribution) => {
      const distributionArr = distribution.split(',').map(item => item.trim());
      const totalPercentage = distributionArr.reduce((total, current) => {
        const [percentage] = current.split('%');
        return total + parseInt(percentage, 10);
      }, 0);
  
      if (totalPercentage !== 100) {
        console.log('Total distribution must equal 100%. Please try again.');
        rl.close();
        return;
      }
        console.log(`Your donation will be divided as follows: ${distribution}`);
        storeDonationData({ ethAmount, distribution: distributionArr, campaignId });
        distributionArr.forEach(async dist => {
          const [percentageStr, campaignType] = dist.split('% ');
          const proportion = ethers.BigNumber.from(percentageStr);
          // Calculate the amount of ETH for this campaign. Assume ethAmount is already a BigNumber
          const contributionAmount = ethAmount.mul(proportion).div(100);
          console.log(`Contributing ${ethers.utils.formatEther(contributionAmount)} ETH to campaign ${campaignId} (${campaignType})`);
          try {
            const formattedCampaignId = ethers.BigNumber.from(campaignId).toNumber();
            const options = { value: contributionAmount };
            await escrow.contributeToCampaign(formattedCampaignId, contributionAmount, options );
            console.log(`Contributed ${ethers.utils.formatEther(contributionAmount)} ETH to campaign ${campaignId} (${campaignType})`);
          } catch (error) {
            console.error('Failed to contribute to campaign:', error);
          }
        });
        rl.close();
      });
  });
};

// Function to handle the campaign selection and call the donation distribution function
const handleCampaignSelection = () => {
  const campaigns = loadCampaigns();
  printCampaignDetails(campaigns);
  rl.question('Select campaigns you want to donate to: ', (campaignId) => {
    const selectedCampaign = campaigns.find(campaign => campaign.campaignId === campaignId);
    if (!selectedCampaign) {
      console.log('No valid campaign selected. Please try again.');
      handleCampaignSelection();
    } else {
      console.log(`You've selected to donate to campaign ID: ${selectedCampaign.campaignId}, Description: ${selectedCampaign.description}`);
      contribute(campaignId);
    }
  });
};

console.log('Welcome to the donation allocation system. Please choose from the following campaigns:');
handleCampaignSelection();
