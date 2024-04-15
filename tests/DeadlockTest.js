const assert = require('assert');
const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../helpers");
const { MIN_DELAY, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE, campaignId } = require("../hardhat-helper-config");

describe("Governor and Escrow Integration Test", function () {
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
        
        const escAccount = deployer.address; // You might want to use a different address in a real scenario
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
        console.log("passing args");
        // Propose a new campaign
        const tx = await governor.connect(deployer).proposeCharityCampaign(
            voter1.address, // beneficiary
            ethers.utils.parseEther("5"), // total amount for the campaign
            3, // milestone count
            "education" // description
        );
        console.log("Proposal created:", tx.hash);
        const receipt = await tx.wait();
        proposalId = receipt.events.find(e => e.event === "ProposalCreated").args.proposalId;

        // Move time forward to pass the voting delay
        await moveBlocks(1);
        console.log("Move time forward to pass the voting delay");
    });

    console.log("testing #2");
    it("should allow users to vote on the proposal and deny if one against", async function () {
        console.log("Proposal testing");
        this.timeout(400000);
        await governor.connect(voter1).castVoteWithReason(proposalId, 1, "Supporting");
        await governor.connect(voter2).castVoteWithReason(proposalId, 0, "Against");

        // Move time to pass the voting period
        await moveBlocks(VOTING_PERIOD + 1);

        const stateAfter = await governor.state(proposalId);
        console.log(`State after votes: ${stateAfter}`);
        assert.strictEqual(stateAfter, 3, "State should be cancelled (3)");
    });

    it("should reject the proposal if unsuccessful", async function () {
        const tx = await governor.connect(deployer).rejectCampaign(campaignId);
        await tx.wait();

        // Validate execution
        const state = await governor.state(proposalId);
        assert.strictEqual(state, 3, "State should be defeated (3)");

    });

    after(async function () {
        // Clean up and revert any state changes if necessary
    });
});
