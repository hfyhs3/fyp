// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

interface Escrow {
    function createCampaign(address beneficiary, uint totalAmount, uint milestoneCount) external;
    function approveCampaign(uint campaignId) external;
    function rejectCampaign(uint campaignId) external;
    function releaseMilestone(uint campaignId, uint milestoneIndex) external;
}
contract GovernorContract is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {

    Escrow public escrow;
    constructor(
        IVotes _token, 
        TimelockController _timelock, 
        uint256 _votingDelay, 
        uint256 _votingPeriod, 
        uint256 _quorumPercentage,
        address _escrowAddress
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
        require(address(_escrowAddress) != address(0), "Escrow address cannot be the zero address.");
        escrow = Escrow(_escrowAddress);
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
        bytes memory calldataCreateCampaign = abi.encodeWithSelector(
            Escrow.createCampaign.selector,
            beneficiary,
            totalAmount,
            milestoneCount
        );
        return propose(
            [address(escrow)], // targets
            [0], // values (no ether is sent)
            [calldataCreateCampaign], // calldatas
            description 
        );
    }

    function approveCampaign(uint campaignId) public onlyDAO {
        // Prepare calldata for the `approveCampaign` function of the Escrow contract
        bytes memory callData = abi.encodeWithSelector(Escrow.approveCampaign.selector, campaignId);

        // Create a proposal in the Governor contract to approve the campaign
        return propose(
            [address(escrow)], // targets
            [0], // values
            [callData], // calldatas
            "Proposal: Campaign Approved" // description
        );
    }

    function rejectCampaign(uint campaignId) public onlyDAO {
        // Prepare calldata for the `rejectCampaign` function of the Escrow contract
        bytes memory callData = abi.encodeWithSelector(Escrow.rejectCampaign.selector, campaignId);

        // Create a proposal in the Governor contract to reject the campaign
        return propose(
            [address(escrow)], // targets
            [0], // values
            [callData], // calldatas
            "Proposal: Campaign Rejected" // description
        );
    }

    function releaseMilestone(uint campaignId, uint milestoneIndex) public onlyDAO {
        escrow.releaseMilestone(campaignId, milestoneIndex);
    }

    
 
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
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

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
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
}