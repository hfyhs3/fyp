const assert = require('assert');
const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../helpers");
const { MIN_DELAY, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, campaignId } = require("../hardhat-helper-config");

describe("GasCost Test", function () {
    let governor;
    let escrow;
    let votingToken;
    let deployer, voter1, voter2, voter3;
    let proposalId;

    before(async function () {
        [deployer, voter1, voter2, voter3] = await ethers.getSigners();

        // Deploy the voting token and distribute it to voters
        const Token = await ethers.getContractFactory("GovernanceToken");
        votingToken = await Token.deploy();
        await votingToken.deployed();
        console.log(`Voting token deployed at ${votingToken.address}`);

        // Voters receive tokens
        const tokens = ethers.utils.parseEther("1000");
        await Promise.all([
            votingToken.transfer(voter1.address, tokens),
            votingToken.transfer(voter2.address, tokens),
            votingToken.transfer(voter3.address, tokens)
    
        ]);
        const TimelockController = await ethers.getContractFactory("TimelockController");
        let proposers = [deployer.address];
        let executors = [deployer.address];
        let admin = deployer.address;
        const timelock = await TimelockController.deploy(MIN_DELAY, proposers, executors, admin);
        await timelock.deployed();
        
        const escAccount = deployer.address; 
        const daoAddress = deployer.address;
    
        // Deploy the Escrow contract
        const Escrow = await ethers.getContractFactory("Escrow");
        escrow = await Escrow.deploy(deployer.address, daoAddress, escAccount);
        await escrow.deployed();

        console.log("Escrow deployed successfully at", escrow.address);
    
        // Deploy the Governor contract
        const Governor = await ethers.getContractFactory("GovernorContract");
        governor = await Governor.deploy(
            votingToken.address, 
            timelock.address, 
            VOTING_DELAY, 
            VOTING_PERIOD, 
            QUORUM_PERCENTAGE, 
            escrow.address);
        await governor.deployed();
        console.log("Governor deployed successfully");
        // Propose a new campaign
        const amount = ethers.utils.parseEther("3");

        const createCampaignTx = await escrow.createCampaign(deployer.address, amount, 3);
        const createCampaignReceipt = await createCampaignTx.wait(1);
        let totalgas = ethers.BigNumber.from(0);
        totalgas = totalgas.add(createCampaignReceipt.gasUsed);

        const campaignId = 1;

        const tx = await governor.connect(deployer).proposeCharityCampaign(
            voter1.address, // beneficiary
            ethers.utils.parseEther("3"), // total amount for the campaign
            3, // milestone count
            "education" // description
        );

        console.log("Proposal created:", tx.hash);
        const receipt = await tx.wait();
        console.log(`Gas used for proposal: ${receipt.gasUsed.toString()}`);
        proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

        const encodedFunctionCall = governor.interface.encodeFunctionData("approveCampaign",[campaignId]);

        const createProposalTx = await governor.propose(
            [escAccount],
            [0],
            [encodedFunctionCall],
            "Education"
        );
        const createProposalReceipt = await createProposalTx.wait(1);
        totalgas = totalgas.add(createProposalReceipt.gasUsed);

        const approve = await escrow.approveCampaign(campaignId);
        const tx1 = await approve.wait(1);
        totalgas = totalgas.add(tx1.gasUsed);
        console.log(`total gas used for creating campaign and proposal: ${totalgas.toString()}`);

        await moveBlocks(1);
        console.log("Move time forward to pass the voting delay");
    });

    it("Gas cost for voting", async function () {
        let totalgas = ethers.BigNumber.from(0);
        console.log("Proposal testing");
        this.timeout(400000);
        const tx1 = await governor.connect(voter1).castVoteWithReason(proposalId, 1, "Supporting");
        const receipt1 = await tx1.wait(1);
        totalgas = totalgas.add(receipt1.gasUsed);
        console.log(`Voting1 gas: ${receipt1.gasUsed.toString()}`);

        const tx2 = await governor.connect(voter2).castVoteWithReason(proposalId, 1, "Supporting");
        const receipt2 = await tx2.wait(1);
        totalgas = totalgas.add(receipt2.gasUsed);
        console.log(`Voting2 gas: ${receipt2.gasUsed.toString()}`);

        // Move time to pass the voting period
        await moveBlocks(VOTING_PERIOD + 1);

        console.log(`Total gas used for voting: ${totalgas.toString()}`);
    });

    it("Contribution and serviceProvider Cost", async function () {
        const escAccount = deployer; 
        const signer = await ethers.provider.getSigner();
        let totalgas = ethers.BigNumber.from(0);

        let amountToSend = ethers.utils.parseEther("4");
        try{
            console.log(`Sending ${ethers.utils.formatEther(amountToSend)} ETH to the contract...`);
            const txContract = {
                to: escrow.address,
                value: amountToSend
            };
            const sentTx = await signer.sendTransaction(txContract);
            await sentTx.wait();
        
            console.log('ETH sent to the contract successfully.');
            if (sentTx && sentTx.gasUsed) {
                totalgas = totalgas.add(sentTx.gasUsed);
            }
        } catch (error) {
            console.error("Error during sending ETH to the contract:", error);
            return;
        }

        const campaignId = 1;
        try {
            const tx = await escrow.connect(deployer).contributeToCampaign(campaignId, 1, { value: ethers.utils.parseEther("3") });
            const receipt = await tx.wait();
            totalgas = totalgas.add(receipt.gasUsed);
            console.log(`Gas used for contribution: ${receipt.gasUsed.toString()}`);
        } catch (error) {
            console.error("Error during contribution:", error);
            console.error("Parameters:", {
                campaignId: campaignId,
                value: ethers.utils.parseEther("3").toString()
            });
        }

        const requestServiceTx = await escrow.requestService(campaignId, 1, "Need service for education", escAccount.address);
        const requestServiceReceipt = await requestServiceTx.wait();
        totalgas = totalgas.add(requestServiceReceipt.gasUsed);
        console.log(`Gas used for requesting services: ${requestServiceReceipt.gasUsed.toString()}`);

        const submitBillingTx = await escrow.submitBilling(campaignId, 1, ethers.utils.parseEther("0.5"), ethers.utils.parseEther("0.5"));
        const submitBillingReceipt = await submitBillingTx.wait();
        totalgas = totalgas.add(submitBillingReceipt.gasUsed);
        console.log(`Gas used for submitting billing: ${submitBillingReceipt.gasUsed.toString()}`);

        const confirmBillingTx = await escrow.confirmBilling(campaignId, 1);
        const confirmBillingReceipt = await confirmBillingTx.wait();
        totalgas = totalgas.add(confirmBillingReceipt.gasUsed);
        console.log(`Gas used for confirming billing: ${confirmBillingReceipt.gasUsed.toString()}`);

        const payServiceTx = await escrow.payServiceProvider(campaignId, 1, escAccount.address); // Example for paying a service provider
        const payServiceReceipt = await payServiceTx.wait();
        totalgas = totalgas.add(payServiceReceipt.gasUsed);
        console.log(`Gas used for paying service provider: ${payServiceReceipt.gasUsed.toString()}`);

        const submitTx = await escrow.submitServiceCompletion(campaignId, 1, escAccount.address);
        const receiptTx = await submitTx.wait();
        totalgas = totalgas.add(receiptTx.gasUsed);
        console.log(`Gas used for submitting service completion: ${receiptTx.gasUsed.toString()}`);

        const releaseTx = await escrow.releaseMilestone(campaignId, 1);
        const releaseReceipt = await releaseTx.wait();
        totalgas = totalgas.add(releaseReceipt.gasUsed);
        console.log(`Gas used for releasing milestone: ${releaseReceipt.gasUsed.toString()}`);

        console.log(`Total gas used for contribution and service provider: ${totalgas.toString()}`);
    });

    after(async function () {
        // Clean up and revert any state changes if necessary
    });
});
