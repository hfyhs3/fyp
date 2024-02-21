// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Escrow is Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _campaignIdCounter;

    Counters.Counter private _itemIdCounter;
    // enum Available {NO, YES}
    enum CampaignStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        REJECTED
    }

    enum MilestoneStatus {
        PENDING,
        RELEASED,
        REFUNDED
    }

    struct Milestone{
        uint amount;
        MilestoneStatus status;
    }

    struct Campaign {
        uint id;
        address beneficiary;
        uint totalAmount;
        CampaignStatus status;
        Milestone[] milestones;
        mapping(address => uint) contributions;
    }

    address public escAccount;
    address public daoAddress;

    mapping(uint => Campaign) public campaigns;

    mapping(uint => mapping(address => uint)) public campaignContributions;
    mapping(uint => address[]) private campaignContributors;


    event CampaignCreated(uint indexed campaignId, address indexed beneficiary, uint totalAmount);
    event CampaignStatusChanged(uint indexed campaignId, CampaignStatus status);
    event MilestoneUpdated(uint indexed campaignId, uint milestoneIndex, MilestoneStatus status);
    event ContributionReceived(address indexed contributor, uint amount, uint indexed campaignId);
    event RefundIssued(uint id, address contributor, uint refundAmt);

    constructor(address payable initialOwner, address _daoAddress, address _escAccount) Ownable() {
        require(initialOwner != address(0), "Initial owner cannot be the zero address");
        require(_escAccount != address(0), "Escrow account cannot be the zero address");
        require(_daoAddress != address(0), "DAO address cannot be the zero address.");
        transferOwnership(initialOwner);
        daoAddress = _daoAddress;
        escAccount = _escAccount;
    }

    modifier onlyEscrowDAO() {
        require(msg.sender == daoAddress, "Caller is not the DAO account");
        _;
    }

    function setDAOAddress(address _daoAddress) external onlyOwner {
        require(_daoAddress != address(0), "DAO address cannot be the zero address");
        daoAddress = _daoAddress;
    }

    function createCampaign(address _beneficiary, uint _totalAmount, uint _milestoneCount) external onlyEscrowDAO{
        require(_beneficiary != address(0), "Beneficiary cannot be the zero address.");
        require(_totalAmount > 0, "Total amount must be greater than zero.");
        require(_milestoneCount > 0, "At least one milestone required.");

        _campaignIdCounter.increment();
        uint newCampaignId = _campaignIdCounter.current();

        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.id = newCampaignId;
        newCampaign.beneficiary = _beneficiary;
        newCampaign.totalAmount = _totalAmount;
        newCampaign.status = CampaignStatus.PENDING;

        for (uint i = 0; i < _milestoneCount; i++) {
            newCampaign.milestones.push(Milestone( _totalAmount / _milestoneCount, MilestoneStatus.PENDING ));
        }

        emit CampaignCreated(newCampaignId, _beneficiary, _totalAmount);

    }

    function approveCampaign(uint _campaignId) external onlyEscrowDAO {
        Campaign storage campaign = campaigns[_campaignId];

        require(campaign.status == CampaignStatus.PENDING, "Campaign must be pending approval.");
        campaign.status = CampaignStatus.ACTIVE;
        emit CampaignStatusChanged(_campaignId, CampaignStatus.ACTIVE);
    }

    function rejectCampaign(uint _campaignId) external onlyEscrowDAO {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.PENDING, "Campaign must be pending approval.");

        campaign.status = CampaignStatus.REJECTED;
        emit CampaignStatusChanged(_campaignId, CampaignStatus.REJECTED);


        //MANAGE REFUNDS IF ANY MADE IF CAMPAIGN WAS APPROVED THEN REJECTED LATER
    }

    function contributeToCampaign(uint _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active.");
        require(msg.value > 0, "Contribution must be greater than zero.");

        campaign.contributions[msg.sender] += msg.value;
        emit ContributionReceived(msg.sender, msg.value, _campaignId);
    }

    function releaseMilestone(uint _campaignId, uint _milestoneIndex) external onlyEscrowDAO {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign must be active.");
        Milestone storage milestone = campaign.milestones[_milestoneIndex];
        require(milestone.status == MilestoneStatus.PENDING, "Milestone must be pending.");

        payable(campaign.beneficiary).transfer(milestone.amount);

        milestone.status = MilestoneStatus.RELEASED;
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

    function refundContributors(uint _campaignId) public onlyEscrowDAO {
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
    function calculateTotalContributionsForMilestone(uint _campaignId, uint _milestoneIndex) public view returns (uint256) { 
        Campaign storage campaign = campaigns[_campaignId]; 
        // MileStone storage milestone = campaign.milestones[_milestoneIndex];

        uint256 totalContributionsForMilestone = 0; 

        for (uint i = 0; i < campaignContributors[_campaignId].length; i++) { 
            address contributor = campaignContributors[_campaignId][i];
            totalContributionsForMilestone += campaign.contributions[contributor];
        }
        require(totalContributionsForMilestone >= campaign.milestones[_milestoneIndex].amount, "Milestone not reached.");
        return totalContributionsForMilestone; 
    }
}