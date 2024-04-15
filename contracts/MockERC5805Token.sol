// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC5805Token is ERC20, ERC20Votes {
    constructor() ERC20("MockERC5805Token", "M5805") ERC20Permit("MockERC5805Token") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // Mint 1 million tokens for use in tests
    }

    // The functions below are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
