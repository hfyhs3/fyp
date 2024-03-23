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

const proposalsPath = path.join(__dirname, "..", PROPOSAL_FILE);


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
  "Food": {
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
  "Education": {
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
  "Health": {
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
//print out this info for the campaign to see
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
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  const campaignId = await question('Enter campaign ID: ');
  const currentMilestone = await escrow.getDetails(campaignId);
  console.log('Current Milestone:', currentMilestone);

  const milestoneIndex = await question('Enter milestone index: ');
  const milestoneDescription = await question('Enter milestone description: ');
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
    value: cost.add(ethers.utils.parseEther("2")) // Add a small buffer amount
  };
  const sentTx = await signer.sendTransaction(tx);
  await sentTx.wait();
  console.log('ETH sent to the contract successfully.');

  console.log('Calculating cost...');
  await calculateCost(campaignId, milestoneIndex, serviceProvider, { serviceType, requiredWorkers, requiredMaterials });
  console.log('confirming bill...');
  await confirmBill(campaignId, milestoneIndex);
  console.log('Paying service provider...');
  await payServiceProvider(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);
  console.log('Final steps...');
  try{
    const submit = await escrow.submitServiceCompletion(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);
    await submit.wait(1);

    console.log('Service completion submitted successfully.');

    const result = await escrow.getMilestoneDetails(campaignId, milestoneIndex);
    const milestoneStatus = ["PENDING", "RELEASED", "REFUNDED", "PAID", "VERIFIED"][result[1]];
    console.log(`Milestone ${milestoneIndex} for campaign ${campaignId} has ${milestoneStatus}.`);

    await markMilestone(campaignId, milestoneIndex, serviceProvider[serviceType].ProviderAddress);

    console.log("Releasing milestone...");
      if (milestoneStatus == "VERIFIED"){
          console.log(`Releasing Milestone ${milestoneIndex}...`);
          const releaseTx = await escrow.releaseMilestone(campaignId, milestoneIndex);
          await releaseTx.wait();
          console.log(`Milestone ${milestoneIndex} is ${milestoneStatus}.`);
      }
      console.log(`Milestone ${currentMilestone} is ${milestoneStatus}.`);

  } catch(e){
    console.error('Failed to submit service completion:', e);
  }
  rl.close();
}

async function calculateCost(campaignId, milestoneIndex, serviceProvider, serviceRequest) {
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
      console.log(`Worker cost in ether: ${ethers.utils.formatEther(workerCost)}`);
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
        console.log(`Cost per unit for ${materialRequest.name} in ether: ${ethers.utils.formatEther(materialCostPerUnit)}`);
        const quantityBn = BigNumber.from(materialRequest.quantity.toString());
        console.log(`Quantity for ${materialRequest.name}: ${quantityBn}`);
        requiredCost = materialCostPerUnit.mul(quantityBn);
        console.log('something');
        const requiredCostEther = ethers.utils.formatEther(requiredCost);

        console.log(`Required cost in ether: ${requiredCostEther}`);
        const availableQuantity = parseFloat(materialInfo.Quantity.split("kg")[0] || materialInfo.Quantity.split("liters")[0]);

        if (availableQuantity < materialRequest.quantity) {
          console.log(`Insufficient quantity for ${materialRequest.name}. Required: ${materialRequest.quantity}, Available: ${availableQuantity}`);
          return;
        } else {
          totalCost = totalCost.add(requiredCost);
        }
    }

  console.log(`Total Cost for ${serviceRequest.serviceType}: ${ethers.utils.formatEther(totalCost)} ETH`);
  console.log('Submitting bill for campaign ${campaignId}, milestone ${milestoneIndex}...');
  const billing = await escrow.submitBilling(campaignId, milestoneIndex, workerCost, requiredCost);
  await billing.wait();
  console.log('Billing submitted successfully.');

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

// no eth is being passed. no information is being passed about the money how can the function continue then??

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



main().catch(error => {
  console.error(error);
  process.exit(1);
});



