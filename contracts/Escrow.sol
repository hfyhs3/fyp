// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "contracts/Governance_standard/GovernorContract.sol";
import "hardhat/console.sol";

contract Escrow is Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _campaignIdCounter;
    receive() external payable {}

    Counters.Counter private _itemIdCounter;
    enum CampaignStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        REJECTED
    }

    enum MilestoneStatus {
        PENDING,
        RELEASED,
        REFUNDED,
        HALF_COMPLETE,
        PAID,
        VERIFIED
    }

    struct TransactionHistory {
        uint workers;
        uint materialCost;
        uint daysTaken;
    }

    struct DonorSpecification{
        uint256 targetAmount;
    }

    struct MilestoneFunding {
        uint totalContributed;
        bool isFullyFunded;
    }


    struct Milestone{
        uint amount;
        MilestoneStatus status;
        TransactionHistory history;
        string description;

        //service requests
        string serviceDescription;
        address serviceProvider;
        //service completion
        bool serviceComplete;
        Billing billing;
    }
    struct Campaign {
        uint id;
        address beneficiary;
        uint totalAmount;
        CampaignStatus status;
        Milestone[] milestones;
        uint currentIndex;

        uint totalContributions;
        mapping(address => uint) contributions;
    }

    struct Billing {
        uint workersCost;
        uint materialsCost;
        uint totalCost;
        bool isSubmitted;
        bool isConfirmed;
    }


    address public escAccount;
    address public daoAddress;
    // GovernorContract public dao;

    mapping(uint => Campaign) public campaigns;
    mapping(uint => DonorSpecification[]) public donorSpecs;
    mapping(string => address) public serviceProviders;
    mapping(uint => mapping(address => uint)) public campaignContributions;
    mapping(uint => address[]) private campaignContributors;


    // campaign events
    event CampaignCreated(uint indexed campaignId, address indexed beneficiary, uint totalAmount);
    event CampaignStatusChanged(uint indexed campaignId, CampaignStatus status);
    event CampaignCompleted(uint indexed campaignId);

    //milestone events
    event MilestoneUpdated(uint indexed campaignId, uint milestoneIndex, MilestoneStatus status);
    event ContributionReceived(address indexed contributor, uint indexed campaignId, uint targetAmount);
    event TransactionHistUpdate(uint indexed campaignId, uint indexed milestoneIndex);
    event MilestoneVerified(uint indexed campaignId, uint milestoneIndex);
    event RefundIssued(uint id, address contributor, uint refundAmt);
    event AllMilestonesReceived(uint indexed campaignId);
    event MilestoneDescriptionUpdated(uint indexed campaignId, uint indexed milestoneIndex, string description);
    event MilestoneReached(uint indexed campaignId, uint milestoneIndex);
    
    // service provider events
    event ServiceProviderPaid(uint indexed campaignId, uint indexed milestoneIndex, address serviceProvider, uint amount, uint remainingAmount);
    event ServiceRequested(uint indexed campaignId, uint indexed milestoneIndex, string serviceDescription, address serviceProvider);
    event ServiceCompletionSubmitted(uint indexed campaignId, uint indexed milestoneIndex, address serviceProvider);
    event BillingSubmitted(uint indexed campaignId, uint indexed milestoneIndex, uint workersCost, uint materialsCost, uint totalCost);
    event BillingConfirmed(uint indexed campaignId, uint indexed milestoneIndex);



    constructor(address payable initialOwner, address _daoAddress, address _escAccount) Ownable() {
        require(initialOwner != address(0), "Initial owner cannot be the zero address");
        require(_escAccount != address(0), "Escrow account cannot be the zero address");
        require(_daoAddress != address(0), "DAO address cannot be the zero address.");
        transferOwnership(initialOwner);
        daoAddress = _daoAddress;
        escAccount = _escAccount;
        // dao = GovernorContract(payable(daoAddress));
    }

    // modifier onlyEscrowDAO() {
    //     require(msg.sender == daoAddress, "Caller is not the DAO account");
    //     _;
    // }

    function setMilestoneDescription(uint _campaignId, uint _milestoneIndex, string memory _description) public {
        // Only the campaign owner or an authorized account can set the description
        Milestone storage milestone = campaigns[_campaignId].milestones[_milestoneIndex];
        milestone.description = _description;
        emit MilestoneDescriptionUpdated(_campaignId, _milestoneIndex, _description);
    }

    function getMilestoneCount(uint _campaignId) public view returns (uint) {
        return campaigns[_campaignId].milestones.length;
    }

    function getMilestoneDetails(uint _campaignId, uint _milestoneIndex) public view returns (uint amount, MilestoneStatus status) {
        Campaign storage campaign = campaigns[_campaignId];
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        return (milestone.amount, milestone.status);
    }

    function getDetails(uint campaignId) public view returns (int ){
        Campaign storage campaign = campaigns[campaignId];
        for (uint i = 0; i < campaign.milestones.length; i++){
            if (campaign.milestones[i].status == MilestoneStatus.PENDING || campaign.milestones[i].status == MilestoneStatus.HALF_COMPLETE){
                return int(i);
            }
        }
        return -1;
    }

    function setMilestoneStatus(uint _campaignId, uint _milestoneIndex, MilestoneStatus _status) public {
    // require(msg.sender == daoAddress, "Only DAO can update milestone status");
        Milestone storage milestone = campaigns[_campaignId].milestones[_milestoneIndex];
        milestone.status = _status;
        emit MilestoneUpdated(_campaignId, _milestoneIndex, _status);
    }

    function getCampaignStatus(uint _campaignId) public view returns (CampaignStatus) {
         return campaigns[_campaignId].status;
    }

    function setDAOAddress(address _daoAddress) external onlyOwner {
        require(_daoAddress != address(0), "DAO address cannot be the zero address");
        daoAddress = _daoAddress;
        // dao = GovernorContract(payable(daoAddress));
    }

    function getDaoAddress() public view returns (address) {
        return daoAddress;
    }

    function createCampaign(address _beneficiary, uint _totalAmount, uint _milestoneCount) external {
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address.");
        require(_totalAmount > 0, "Total amount must be greater than zero.");
        require(_milestoneCount > 0, "At least one milestone required.");

        _campaignIdCounter.increment();
        uint newCampaignId = _campaignIdCounter.current();

        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.id = newCampaignId;
        newCampaign.beneficiary = _beneficiary;
        newCampaign.totalAmount = _totalAmount;
        console.log("Total Amount Before Setting: ", newCampaign.totalAmount);
        newCampaign.totalAmount = _totalAmount;
        console.log("Total Amount After Setting: ", newCampaign.totalAmount);
        newCampaign.status = CampaignStatus.PENDING;
        newCampaign.currentIndex = 1;
        for (uint i = 0; i < _milestoneCount; i++) {
            TransactionHistory memory history = TransactionHistory({
                workers: 0,
                materialCost: 0,
                daysTaken: 0
            });
            uint milestoneAmt = _totalAmount / _milestoneCount;
            console.log("Milestone Amount: ", milestoneAmt);
            newCampaign.milestones.push(Milestone({
                amount: milestoneAmt,
                status: MilestoneStatus.PENDING,
                history: TransactionHistory({workers: 0, materialCost: 0, daysTaken: 0}),
                description: "",
                serviceDescription: "",
                serviceProvider: address(0), // Assuming an empty address for initialization
                serviceComplete: false, // Assuming false for initialization
                billing: Billing({workersCost: 0, materialsCost: 0, totalCost: 0, isSubmitted: false, isConfirmed: false})
            }));
            emit CampaignCreated(newCampaignId, _beneficiary, _totalAmount);
        }
    }

    function approveCampaign(uint _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];

        // require(campaign.status == CampaignStatus.PENDING, "Campaign must be pending approval.");
        campaign.status = CampaignStatus.ACTIVE;
        emit CampaignStatusChanged(_campaignId, CampaignStatus.ACTIVE);
    }

    function rejectCampaign(uint _campaignId) external {
        Campaign storage campaign = campaigns[_campaignId];
        // require(campaign.status == CampaignStatus.PENDING, "Campaign must be pending approval.");

        campaign.status = CampaignStatus.REJECTED;
        emit CampaignStatusChanged(_campaignId, CampaignStatus.REJECTED);


        //MANAGE REFUNDS IF ANY MADE IF CAMPAIGN WAS APPROVED THEN REJECTED LATER
    }

    function contributeToCampaign(uint _campaignId, uint _amount) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active.");
        require(msg.value > 0, "Contribution must be greater than zero.");

        campaign.contributions[msg.sender] += msg.value;
        campaign.totalContributions += msg.value;

        donorSpecs[_campaignId].push(DonorSpecification({
        targetAmount: _amount
        }));
        emit ContributionReceived(msg.sender, _campaignId, _amount);

        uint256 contributionPerMilestone = msg.value / campaign.milestones.length;
        for (uint i = 0; i < campaign.milestones.length; i++) {
            campaign.milestones[i].amount += contributionPerMilestone;
        }
    }

    // 6. release milestone
    function releaseMilestone(uint _campaignId, uint _milestoneIndex) external {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active.");
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        // require(milestone.amount > 0, "Milestone has no funds allocated.");
        require(milestone.status == MilestoneStatus.HALF_COMPLETE || milestone.status == MilestoneStatus.VERIFIED, "Milestone must be either half complete or verified before release.");

        uint releaseAmount;
        if (milestone.amount > 2.8 ether) { // 10,000 usd approximately
            releaseAmount = milestone.amount * 20 / 100; // Calculate 20% of the milestone amount
            milestone.status = MilestoneStatus.HALF_COMPLETE;
        } else if (milestone.status == MilestoneStatus.HALF_COMPLETE){
            releaseAmount = milestone.status == MilestoneStatus.HALF_COMPLETE ? (milestone.amount * 80 / 100) : milestone.amount;
            milestone.status = MilestoneStatus.RELEASED;        
        } else  if (milestone.amount <= 2.8 ether){
            releaseAmount = milestone.amount;
            milestone.status = MilestoneStatus.RELEASED;
        }

        address payable beneficiary = payable(campaign.beneficiary);
        console.log(releaseAmount);
        // Ensure the contract has enough balance to cover the transfer
        require(address(this).balance >= releaseAmount, "Insufficient funds in the contract.");

        // Ensure the transfer is successful
        (bool success, ) = beneficiary.call{value: releaseAmount}("");
        require(success, "Transfer failed.");

        emit MilestoneUpdated(_campaignId, _milestoneIndex, MilestoneStatus.RELEASED);
       
        bool allMilestonesReleased = true;
        for (uint i = 0; i < campaign.milestones.length; i++) {
            if (campaign.milestones[i].status != MilestoneStatus.RELEASED) {
                allMilestonesReleased = false;
                break;
            }
        }
        if (allMilestonesReleased) {
            campaign.status = CampaignStatus.COMPLETED;
            emit CampaignStatusChanged(_campaignId, CampaignStatus.COMPLETED);
        }
    }

    /**
    Allows beneficiaries to input detailed transaction history for each milestone */

    function VerifyTransaction(uint _campaignId, uint _milestoneIndex, uint _workers, uint _materialCost, uint _daysTaken) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active.");
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        require(milestone.status == MilestoneStatus.PAID, "Milestone must be paid before verification.");
        milestone.history = TransactionHistory(_workers, _materialCost, _daysTaken);
        milestone.status = MilestoneStatus.VERIFIED;
        emit MilestoneVerified(_campaignId, _milestoneIndex);
    }

    function getTransactionHistory(uint _campaignId, uint _milestoneIndex) public view returns (TransactionHistory memory) {
        Campaign storage campaign = campaigns[_campaignId];
        require(_milestoneIndex < campaign.milestones.length, "Invalid milestone index");
        
        return campaign.milestones[_milestoneIndex].history;
    }


    function refundContributors(uint _campaignId) public  {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.REJECTED || (campaign.status == CampaignStatus.COMPLETED && campaign.totalAmount > address(this).balance), "Invalid campaign status for refund.");        

        address[] storage contributors = campaignContributors[_campaignId];

        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            uint contribution = campaignContributions[_campaignId][contributor];
            if (contribution > 0){
                uint refundAmount = (contribution * 98) / 100; //2% flat rate deduction from the refund amount

                campaignContributions[_campaignId][contributor] = 0; //resetting value to prevent re-entrancy attacks

                (bool sent, ) = contributor.call{value:refundAmount}("");
                require(sent, "failed to send refund");

                emit RefundIssued(_campaignId, contributor, refundAmount);


            }
        }
        
        if (campaign.status != CampaignStatus.COMPLETED){
            campaign.status = CampaignStatus.COMPLETED;
            emit CampaignStatusChanged(_campaignId, CampaignStatus.COMPLETED);

        }
    }

    // Utility function to get contributors list for a campaign
    function TotalContributions(uint _campaignId) public
        view
        returns (MilestoneFunding[] memory contributions)
    {
        Campaign storage campaign = campaigns[_campaignId];
        contributions = new MilestoneFunding[](campaign.milestones.length);

        for (uint i = 0; i < campaign.milestones.length; i++) {
            uint milestoneContribution = campaign.milestones[i].amount;
            bool isFullyFunded = milestoneContribution >= campaign.milestones[i].amount;
            contributions[i] = MilestoneFunding(milestoneContribution, isFullyFunded);
        }

        return contributions;
    }
    /**
    Allow donor to view details of campaign they have contributed to */
    function viewCampaignDetails(uint _campaignId) public view returns (
        uint id,
        address beneficiary,
        uint totalAmount,
        CampaignStatus status,
        uint milestoneCount
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.contributions[msg.sender] > 0, "You have not contributed to this campaign.");
        return (
            campaign.id,
            campaign.beneficiary,
            campaign.totalAmount,
            campaign.status,
            campaign.milestones.length
        );
    }

    /**
     * Allows a donor to view the details and transaction history of a specific milestone within a campaign.
     * @param _campaignId The ID of the campaign.
     * @param _milestoneIndex The index of the milestone within the campaign.
     */
    function viewMilestoneDetails(uint _campaignId, uint _milestoneIndex) public view returns (
        uint amount,
        MilestoneStatus status,
        uint workers,
        uint materialCost,
        uint daysTaken
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        require(_milestoneIndex < campaign.milestones.length, "Invalid milestone index.");
        require(campaign.contributions[msg.sender] > 0, "You have not contributed to this campaign.");

        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        return (
            milestone.amount,
            milestone.status,
            milestone.history.workers,
            milestone.history.materialCost,
            milestone.history.daysTaken
        );
    }

// 20% of the amount required will be released from the contributors to the campaign if amount is too high
//feasibility and limitations and benefits of this entire project
// identify patterns from web2 to web3 and what are the best practices
// show the entire process transparency


    // 1. request service first
    function requestService(uint campaignId, uint milestoneIndex, string memory serviceDescription, address serviceProvider) public {
        // require(campaigns[campaignId].beneficiary == msg.sender, "Only campaign beneficiary can request services");
        require(milestoneIndex < campaigns[campaignId].milestones.length, "Invalid milestone index");
        Milestone storage milestone = campaigns[campaignId].milestones[milestoneIndex];
        require(milestone.status == MilestoneStatus.PENDING || milestone.status == MilestoneStatus.HALF_COMPLETE, "Service can only be requested for pending or half complete milestones");
        
        milestone.serviceDescription = serviceDescription;
        milestone.serviceProvider = serviceProvider;
        
        emit ServiceRequested(campaignId, milestoneIndex, serviceDescription, serviceProvider);
    }

    // 4. pay service provider
    function payServiceProvider(uint _campaignId, uint _milestoneIndex, address payable _serviceProvider) public {
        // Ensure milestone is verified and funds are ready to be transferred
        Campaign storage campaign = campaigns[_campaignId];
        Milestone storage milestone = campaigns[_campaignId].milestones[_milestoneIndex];
        require(milestone.status == MilestoneStatus.PENDING || milestone.status == MilestoneStatus.HALF_COMPLETE, "Milestone not pending or half complete");
        require (campaign.totalAmount >= milestone.amount, "Insufficient funds in campaign" );

        // Transfer funds to service provider
        campaign.totalAmount -= milestone.amount;
        _serviceProvider.transfer(milestone.amount);
        milestone.status = MilestoneStatus.PAID; // Update status to indicate payment
        emit ServiceProviderPaid(_campaignId, _milestoneIndex, _serviceProvider, milestone.amount, campaign.totalAmount);
    }

    // 2. submit billing
    function submitBilling(uint campaignId, uint milestoneIndex, uint workersCost, uint materialsCost) public {
        Milestone storage milestone = campaigns[campaignId].milestones[milestoneIndex];
        uint totalCost = workersCost + materialsCost;

        milestone.billing = Billing({
            workersCost: workersCost,
            materialsCost: materialsCost,
            totalCost: totalCost,
            isSubmitted: true,
            isConfirmed: false
        });

        emit BillingSubmitted(campaignId, milestoneIndex, workersCost, materialsCost, totalCost);
    }

    // 3. confirm billing
    function confirmBilling(uint campaignId, uint milestoneIndex) public {
        Campaign storage campaign = campaigns[campaignId];
        // require(campaign.beneficiary == msg.sender, "Only the campaign beneficiary can confirm billing");
        
        Milestone storage milestone = campaign.milestones[milestoneIndex];
        require(milestone.billing.isSubmitted, "Billing must be submitted first");
        require(!milestone.billing.isConfirmed, "Billing has already been confirmed");

        milestone.billing.isConfirmed = true;

        emit BillingConfirmed(campaignId, milestoneIndex);
    }

    // 5. submit service completion
    function submitServiceCompletion(uint campaignId, uint milestoneIndex, address serviceProvider) public {
        // require(campaigns[campaignId].milestones[milestoneIndex].serviceProvider == msg.sender, "Only assigned service provider can submit completion");
        Milestone storage milestone = campaigns[campaignId].milestones[milestoneIndex];
        require(milestone.billing.isConfirmed, "Billing must be confirmed before submitting service completion");
        require(milestone.status == MilestoneStatus.PAID, "Service completion can only be submitted for paid milestones");

        // Optionally, you can verify the details or require additional proof before marking as completed
        milestone.status = MilestoneStatus.VERIFIED;
        milestone.serviceComplete = true;
        
        emit ServiceCompletionSubmitted(campaignId, milestoneIndex, serviceProvider);
    }

}