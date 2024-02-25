// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

interface IEscrow {
    function createCampaign(address beneficiary, uint totalAmount, uint milestoneCount) external;
    function approveCampaign(uint campaignId) external;
    function rejectCampaign(uint campaignId) external;
    function releaseMilestone(uint campaignId, uint milestoneIndex) external;
}

contract GovernorContract is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {

    IEscrow public escrow;
    constructor(
        IVotes _token, 
        TimelockController _timelock, 
        uint256 _votingDelay, 
        uint256 _votingPeriod, 
        uint256 _quorumPercentage,
        address escrowAddress
        )

        Governor("GovernorContract")
        GovernorSettings(
        uint48(_votingDelay), /* Voting detal 1 block = 12 secs */
        uint32(_votingPeriod), /* voting period of 1 week */
        0
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {
        require(address(escrowAddress) != address(0), "Escrow address cannot be the zero address.");
        escrow = IEscrow(escrowAddress);
    }


    modifier onlyDAO() {
        require(msg.sender == address(this), "GovernorContract: caller is not the DAO");
        _;
    }

    function proposeCharityCampaign(
        address beneficiary,
        uint totalAmount,
        uint milestoneCount,
        string memory description
    ) public returns (uint256){
        bytes[] memory calldataArray = new bytes[](1);
        calldataArray[0] = abi.encodeWithSelector(
            IEscrow.createCampaign.selector,
            beneficiary,
            totalAmount,
            milestoneCount
        );

        address[] memory targets = new address[](1);
        targets[0] = address(escrow);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;

        return propose(
            targets,
            values,
            calldataArray,
            description
        );
    }

    function approveCampaign(uint campaignId) public onlyDAO returns (uint256){
        bytes[] memory calldataArray = new bytes[](1);
        calldataArray[0] = abi.encodeWithSelector(IEscrow.approveCampaign.selector, campaignId);

        address[] memory targets = new address[](1);
        targets[0] = address(escrow);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        return propose(
            targets,
            values,
            calldataArray, 
            "Proposal: Campaign Approved" 
        );
    }

    function rejectCampaign(uint campaignId) public onlyDAO returns (uint256){
        bytes[] memory calldataArray = new bytes[](1);
        calldataArray[0] = abi.encodeWithSelector(IEscrow.rejectCampaign.selector, campaignId);

        address[] memory targets = new address[](1);
        targets[0] = address(escrow);

        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        return propose(
            targets,
            values,
            calldataArray,
            "Proposal: Campaign Rejected" 
        );
    }

    function releaseMilestone(uint campaignId, uint milestoneIndex) public onlyDAO {
        escrow.releaseMilestone(campaignId, milestoneIndex);
    }

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    // function proposalNeedsQueuing(uint256 proposalId)
    //     public
    //     view
    //     override(Governor, GovernorTimelockControl)
    //     returns (bool)
    // {
    //     return super.proposalNeedsQueuing(proposalId);
    // }


    function propose(
        address[] memory targets, 
        uint256[] memory values, 
        bytes[] memory calldatas, 
        string memory descriptionHash)
        public override (Governor, IGovernor)
        returns (uint256 proposalId)
    {
        return super.propose(targets, values, calldatas, descriptionHash);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId) public view override(Governor, GovernorTimelockControl) returns (bool){
        return super.supportsInterface(interfaceId);
    }
}