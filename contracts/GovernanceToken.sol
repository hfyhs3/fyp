// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract GovernanceToken is ERC20Votes, ERC20Permit{
    uint256 public s_maxSupply = 1000000000000000000000000;

    constructor()
        ERC20("GovernanceToken","GT")
        ERC20Permit("GovernanceToken")
    {
        _mint(msg.sender, s_maxSupply);
    }

    function _update(address from, address to, uint256 value) internal virtual override (ERC20Votes, ERC20) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return Nonces(address(this)).nonces(owner);
    }
    
}