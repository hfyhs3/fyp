const readline = require('readline');
const path = require('path');
const fs = require('fs');

const donationsFilePath = path.join(__dirname, 'users.json');
const sessionFilePath = path.join(__dirname, 'session.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const loadSession = () => {
    try {
        const sessionData = fs.readFileSync(sessionFilePath, 'utf8');
        return JSON.parse(sessionData);
    } catch (error) {
        console.error('Error loading session data:', error);
        return null;
    }
};

const storeDonationData = ({userId, ethAmount, distribution}) => {

    let donationsData = JSON.parse(fs.readFileSync(donationsFilePath, 'utf8'));

    let userIndex = donationsData.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        donationsData.users.push({
            id: userId,
            donations: [{ ethAmount, distribution }]
        });
    } else {
        donationsData.users[userIndex].donations.push({ ethAmount, distribution });
    }
    fs.writeFileSync(donationsFilePath, JSON.stringify(donationsData, null, 2), 'utf8');
    console.log('Donation data saved successfully.');
    rl.close();
  };

  // Function to ask for donation amount
const askDonationAmount = (choices) => {
  rl.question('Enter the amount of ETH you want to donate: ', (amount) => {
    const ethAmount = parseFloat(amount);
    if (isNaN(ethAmount) || ethAmount <= 0) {
      console.log('Please enter a valid amount.');
      askDonationAmount(choices);
    } else {
      console.log(`You've chosen to donate ${ethAmount} ETH.`);
      askDonationDistribution(choices, ethAmount);
    }
  });
};

// Function to ask for the user's donation distribution
const askDonationDistribution = (choices, ethAmount) => {
    const session = loadSession();
    if (!session || !session.userId) {
        console.log('Session not found. Please log in.');
        rl.close();
        return;
    }
  rl.question('Enter how you want to divide your donation among the selected campaigns (e.g., 50% education, 30% health, 20% food): ', (distribution) => {
    const distributionArr = distribution.split(',').map(item => item.trim());
    const totalPercentage = distributionArr.reduce((total, current) => {
      const [percentage] = current.split('%');
      return total + parseInt(percentage, 10);
    }, 0);

    if (totalPercentage !== 100) {
      console.log('Total distribution must equal 100%. Please try again.');
      askDonationDistribution(choices, ethAmount);
    } else {
      console.log(`Your donation will be divided as follows: ${distribution}`);
      storeDonationData({ ethAmount, distribution: distributionArr, choices });
      rl.close();
    }
  });
};

// Function to handle the campaign selection and call the donation distribution function
const handleCampaignSelection = () => {
  rl.question('Select campaigns you want to donate to (1 for education, 2 for health, 3 for food. E.g., 1,2 for education and health): ', (answer) => {
    const choicesMap = { '1': 'education', '2': 'health', '3': 'food' };
    const selectedChoices = answer.split(',').map(num => choicesMap[num.trim()]).filter(Boolean);

    if (selectedChoices.length === 0) {
      console.log('No valid campaign selected. Please try again.');
      handleCampaignSelection();
    } else {
      console.log(`You've selected to donate to: ${selectedChoices.join(', ')}`);
      askDonationAmount(selectedChoices);
    }
  });
};

console.log('Welcome to the donation allocation system. Please choose from the following campaigns:');
console.log('1. Education\n2. Health\n3. Food');
handleCampaignSelection();
