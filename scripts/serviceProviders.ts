import { BigNumber } from "ethers";
import { deployments, ethers } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { PROPOSAL_FILE } from "../hardhat-helper-config";


const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function formatEther(value, decimals = 2) {
  const etherString = ethers.utils.formatEther(value);
  return parseFloat(etherString).toFixed(decimals);
}

const proposalsPath = path.join(__dirname, "..", PROPOSAL_FILE);
const donationsFilePath = path.join(__dirname, 'users.json');

function question(query: string): Promise<string> {
    return new Promise((resolve) => rl.question(query, resolve));
}

interface MaterialRequest {
  name: string;
  quantity: number;
}

interface ServiceProvider {
  ProviderAddress: Address;
  Workers: number;
  CostPerWorker: BigNumber; 
  Materials: Material[];
}

interface Material {
  Name: string;
  Quantity: string;
  Cost: BigNumber; 
}


const serviceProvider = {
  "food": {
    "ProviderAddress": ethers.Wallet.createRandom().address,
    "Workers": 10,
    "CostPerWorker": ethers.utils.parseEther("0.5"),
    "Materials": [
      {
        "Name": "Rice",
        "Quantity": "500kg",
        "Cost": ethers.utils.parseEther("0.05")
      },
      {
        "Name": "Meat",
        "Quantity": "200kg",
        "Cost": ethers.utils.parseEther("0.03")
      },
      {
        "Name": "Cooking Oil",
        "Quantity": "100 liters",
        "Cost": ethers.utils.parseEther("0.1")
      }
    ]
  },
  "education": {
    "ProviderAddress": ethers.Wallet.createRandom().address,
    "Workers": 5,
    "CostPerWorker": ethers.utils.parseEther("1"),
    "Materials": [
      {
        "Name": "Books",
        "Cost": ethers.utils.parseEther("0.2")
      },
      {
        "Name": "Tables + Seats",
        "Cost": ethers.utils.parseEther("0.4")
      },
      {
        "Name": "Stationary",
        "Cost": ethers.utils.parseEther("0.01")
      }
    ]
  },
  "health": {
    "ProviderAddress": ethers.Wallet.createRandom().address,
    "Workers": 15,
    "CostPerWorker": ethers.utils.parseEther("1.5"),
    "Materials": [
      {
        "Name": "Medical Equipment",
        "Cost": ethers.utils.parseEther("10")
      },
      {
        "Name": "Medications",
        "Cost": ethers.utils.parseEther("0.1")
      },
      {
        "Name": "Personal Protective Equipment",
        "Cost": ethers.utils.parseEther("0.05")
      }
    ]
  }
};

async function requestServices( campaignId, milestoneIndex, milestoneDescription, serviceType) {
    const { get } = deployments;

    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;

    const escrow = await ethers.getContractAt("Escrow", escrowAddress);
    console.log(`Escrow address: ${escrow.address}`);

    const serviceInfo = serviceProvider[serviceType]["ProviderAddress"];
    console.log(`ProviderAddress: ${serviceInfo}`);

    const reqServ = await escrow.requestService(campaignId, milestoneIndex, milestoneDescription, serviceProvider[serviceType]["ProviderAddress"] );
    await reqServ.wait(1); 
    console.log(`Requesting ${serviceType} service for campaign ${campaignId}, milestone ${milestoneIndex}...`);

    console.log('Service requested successfully.');
}

async function main() {
  const { get } = deployments;
  const escrowDeploy = await get("Escrow");
  const escrowAddress = escrowDeploy.address;
  const signer = await ethers.provider.getSigner();

  const start = Date.now();

  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  const governorDeployment = await get("GovernorContract");
  const governorAddress = governorDeployment.address;
  const governor = await ethers.getContractAt("GovernorContract", governorAddress);

  const campaignId = await question('Enter campaign ID: ');

  const data = await fs.readFile(proposalsPath, 'utf8');
  const proposals = JSON.parse(data);

  const chainId = "31337";
  const campaigns = proposals[chainId].campaigns;

  let campaign = campaigns.find(p => p.campaignId === campaignId);
  const proposalID = campaign.proposalId;
  let proposalState = await governor.state(proposalID);
  if (proposalState != 4){
    console.log("proposalState: " + proposalState, "therefore not allowed to proceed.");
    process.exit(0);
  }

  // checking if milestone here is same as milestone in the backend
  const currentMilestone = await escrow.getDetails(campaignId);
  console.log('Current Milestone:', currentMilestone);

  const campaignStatus = await escrow.getCampaignStatus(campaignId);
  const CamstatusString = ["PENDING", "ACTIVE", "COMPLETED", "REJECTED"][campaignStatus];
  console.log(`Campaign Status: ${CamstatusString}`);

  const milestoneIndex = await question('Enter milestone index: ');
  const milestoneDescription = await printdetails(campaignId, milestoneIndex);

  console.log("Checking milestone amount...");

  const details = await escrow.getMilestoneDetails(campaignId, milestoneIndex);

  const status = ["PENDING", "RELEASED", "REFUNDED", "HALF_COMPLETE", "PAID", "VERIFIED"][details[1]];
  console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} is ${status}.`);

  const milestoneFunds = await escrow.TotalContributions(campaignId);
  const contrib = ethers.utils.formatEther(milestoneFunds[milestoneIndex].totalContributed);
  const isFunded = milestoneFunds[milestoneIndex].isFullyFunded;

  if (details[0] > ethers.utils.parseEther("2.8")) {
    if (status != "HALF_COMPLETE"){

      const newStatus = 3;
      const setTx = await escrow.setMilestoneStatus(campaignId, milestoneIndex, newStatus);
      await setTx.wait();

      console.log(`The milestone amount is: ${ethers.utils.formatEther(details[0])} 
                  ETH, therefore 20% of the milestone will be released.`);

      console.log(`Please complete 80% of the milestone at your convenience`);
      console.log("Releasing 20%");

      const release = await escrow.releaseMilestone(campaignId, milestoneIndex);
      await release.wait();
      console.log(`20% of the milestone released successfully.`);

      const result = await escrow.getMilestoneDetails(campaignId, milestoneIndex);
      const Status = ["PENDING", "RELEASED", "REFUNDED", "HALF_COMPLETE", "PAID", "VERIFIED"][result[1]];
      console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} is ${Status} and the amount remaining is ${result[0]}.`);

      process.exit(0);
    }
  } else if (!isFunded){
    console.log("Contributions are not enough: ", contrib, "ETH");
    console.log("Milestone amount needed is: ", ethers.utils.parseEther(details[0]), "ETH");
    process.exit(0);
  }

  const serviceType = await question('Enter the service type (Food, Education, Health): ');
  const requiredWorkers = parseInt((await question('Enter the number of required workers: ')) as string, 10);
  const materialsCount = parseInt((await question('How many different types of materials are required? ')) as string, 10);

  const requiredMaterials: MaterialRequest[] = [];

  for (let i = 0; i < materialsCount; i++) {
      const name  = await question(`Enter the name of material #${i+1}: `);
      const quantityInput = await question(`Enter the quantity of material #${i+1}: `);
      const quantity = parseFloat(quantityInput);

      requiredMaterials.push({ name, quantity });
  }

  await requestServices(campaignId, milestoneIndex, milestoneDescription, serviceType );
  
  let cost =ethers.BigNumber.from(0);
  const tx = {
    to: escrowAddress,
    value: cost.add(ethers.utils.parseEther("2")) 
  };

  const sentTx = await signer.sendTransaction(tx);
  await sentTx.wait();

  console.log('ETH sent to the contract successfully.');
  const result = await escrow.getMilestoneDetails(campaignId, milestoneIndex);
  const milestoneStatus = ["PENDING", "RELEASED", "HALF_COMPLETE", "PAID", "VERIFIED"][result[1]];
  console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} has ${milestoneStatus}.`);

  console.log('Calculating cost...');
  await calculateCost(campaignId, milestoneIndex, serviceProvider, result[0], result[1], { serviceType, requiredWorkers, requiredMaterials });
  
  console.log('confirming bill...');
  await confirmBill(campaignId, milestoneIndex);
  
  console.log('Paying service provider...');
  await payServiceProvider(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);
  
  console.log('Final steps...');

  try{
    const submit = await escrow.submitServiceCompletion(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);
    await submit.wait(1);

    console.log('Service completion submitted successfully.');
    console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} has ${milestoneStatus}.`);

    console.log(`Campaign Status: ${CamstatusString}`);
    await markMilestone(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);

    console.log("Releasing milestone...");
      if (milestoneStatus == "VERIFIED"){
          console.log(`Releasing Milestone ${milestoneIndex}...`);

          const releaseTx = await escrow.releaseMilestone(campaignId, milestoneIndex);
          await releaseTx.wait();

          console.log(`Milestone ${milestoneIndex} is ${milestoneStatus}.`);
          console.log(`Campaign Status: ${CamstatusString}`);
      }
      const end = Date.now();
      console.log(`Time taken: ${end - start}ms`);
  } catch(e){
    console.error('Failed to submit service completion:', e);
  }
  rl.close();
}

async function calculateCost(campaignId, milestoneIndex, serviceProvider, amount, status, serviceRequest) {
  const { get } = deployments;

  const escrowDeploy = await get("Escrow");
  const escrowAddress = escrowDeploy.address;
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  const serviceInfo = serviceProvider[serviceRequest.serviceType];
  if (!serviceInfo) {
      console.log("Service type not recognized.");
      return;
  }

  let totalCost = ethers.BigNumber.from(0);
  let workerCost = ethers.BigNumber.from(0);

  if (serviceInfo.Workers < serviceRequest.requiredWorkers) {
      console.log("Insufficient workers.");
      return;
  } else {
      const CostPerWorker = ethers.utils.parseUnits(serviceInfo.CostPerWorker.toString(), 'ether');
      workerCost = CostPerWorker.mul(serviceRequest.requiredWorkers);

      console.log(`Worker cost in ether: ${formatEther(workerCost)}`);

      totalCost = totalCost.add(workerCost);
  }

  let requiredCost = ethers.BigNumber.from(0);

  for (const materialRequest of serviceRequest.requiredMaterials) {
      const materialInfo = serviceInfo.Materials.find(m => m.Name === materialRequest.name);

      if (!materialInfo) {
          console.log(`${materialRequest.name} is not available.`);
          return;
      }

        const materialCostPerUnit = ethers.utils.parseUnits(materialInfo.Cost.toString(), 'ether');
        console.log(`Cost per unit for ${materialRequest.name} in ether: ${formatEther(materialCostPerUnit)}`);

        const quantityBn = BigNumber.from(materialRequest.quantity.toString());
        console.log(`Quantity for ${materialRequest.name}: ${quantityBn}`);

        requiredCost = materialCostPerUnit.mul(quantityBn);
        const requiredCostEther = ethers.utils.formatEther(requiredCost);

        console.log(`Required cost in ether: ${requiredCostEther}`);

        let availableQuantity = materialInfo.Quantity;

        if (serviceRequest.serviceType === "food") {
          availableQuantity = parseFloat(materialInfo.Quantity.split("kg")[0] || materialInfo.Quantity.split("liters")[0]);
        }

        if (availableQuantity < materialRequest.quantity) {
          console.log(`Insufficient quantity for ${materialRequest.name}. Required: ${materialRequest.quantity}, 
                      Available: ${availableQuantity}`);
          return;
        } else {
          totalCost = totalCost.add(requiredCost);
        }
    }
    if (amount == totalCost || totalCost > amount || amount > ethers.utils.parseEther("2.8")) {
        console.log("verification successful.")
        console.log(`Total Cost for ${serviceRequest.serviceType}: ${formatEther(totalCost)} ETH`);
        console.log(`Status is: ${status}`);
        console.log('Submitting bill for campaign ${campaignId}, milestone ${milestoneIndex}...');

        const billing = await escrow.submitBilling(campaignId, milestoneIndex, workerCost, requiredCost);
        await billing.wait();

        console.log('Billing submitted successfully.');
    } else {
        console.log('verification failed. services do not match milestone description. Please restart.');
        process.exit(0);
    }
  }

async function confirmBill(campaignId, milestoneIndex) {
  const { get } = deployments;

  const escrowDeploy = await get("Escrow");
  const escrowAddress = escrowDeploy.address;
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  console.log('confirming billing');
  const confirmBill = await escrow.confirmBilling(campaignId, milestoneIndex);
  await confirmBill.wait(1);
  console.log('Billing confirmed successfully.');
}


async function payServiceProvider(campaignId, milestoneIndex, serviceProviderAddress) {
  const { get } = deployments;

  const escrowDeploy = await get("Escrow");
  const escrowAddress = escrowDeploy.address;
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  console.log('Paying service provider...');
  try {
    const payServiceResponse = await escrow.payServiceProvider(campaignId, milestoneIndex, serviceProviderAddress);
    await payServiceResponse.wait();
    console.log('Service provider paid successfully.');
  } catch (error) {
      console.error('Failed to pay the service provider:', error);
  }
}

async function markMilestone(campaignId, milestoneIndex, serviceProviderAddress) {
  try {
    // Read the existing proposals
    const data = await fs.readFile(proposalsPath, 'utf8');
    const proposals = JSON.parse(data);

    // Update the specified milestone's completed status
    const chainId = "31337";
    const campaigns = proposals[chainId].campaigns;

    const campaign = campaigns.find(p => p.campaignId === campaignId);

    if (campaign && campaign.milestones[milestoneIndex]) {
      campaign.milestones[milestoneIndex].completed = true;
      campaign.milestones[milestoneIndex].serviceProvider = serviceProviderAddress;
      await fs.writeFile(proposalsPath, JSON.stringify(proposals, null, 2), 'utf8');

      console.log(`Milestone ${milestoneIndex} of campaign ${campaignId} marked as completed.`);
    } else {
      console.error('Campaign or milestone not found.');
    }
  } catch (error) {
    console.error('Failed to mark milestone as completed:', error);
  }
}

async function printdetails(campaignId, milestoneIndex) {
  const data = await fs.readFile(proposalsPath, 'utf8');
  const proposals = JSON.parse(data);

  const chainId = "31337";
  const campaigns = proposals[chainId].campaigns;

  let campaign = campaigns.find(p => p.campaignId === campaignId);
  return campaign.milestones[milestoneIndex].description;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});






