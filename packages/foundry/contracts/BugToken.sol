// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title $BUG - Bug Bounty Token
/// @notice Meme token for the Bug Bounty Hunter game, with a built-in faucet.
contract BugToken is ERC20, ERC20Burnable, ERC20Capped, Ownable {
    uint256 public constant FAUCET_AMOUNT = 500 ether;     // 500 BUG
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    // wallet => timestamp of its last claim (0 = never claimed)
    mapping(address => uint256) public lastClaim;

    event Claimed(address indexed user, uint256 amount);

    error ClaimTooSoon(uint256 nextClaimTime);
    error FaucetEmpty();

    constructor(address initialOwner)
        ERC20("Bug Bounty Token", "BUG")
        ERC20Capped(10_000_000 ether)
        Ownable(initialOwner)
    {
        _mint(address(this), 4_000_000 ether); // faucet reserve
        _mint(msg.sender, 3_000_000 ether);    // deployer: game pool + owner share
    }

    /// @notice Owner creates new tokens. ERC20Capped stops it at 10M.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Get 500 BUG, once every 24 hours per wallet.
    function claim() external {
        uint256 next = nextClaimTime(msg.sender);
        if (block.timestamp < next) revert ClaimTooSoon(next);
        if (balanceOf(address(this)) < FAUCET_AMOUNT) revert FaucetEmpty();

        lastClaim[msg.sender] = block.timestamp; // update state before moving tokens
        _transfer(address(this), msg.sender, FAUCET_AMOUNT);
        emit Claimed(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice When this wallet can claim next. 0 = right now.
    function nextClaimTime(address user) public view returns (uint256) {
        if (lastClaim[user] == 0) return 0;
        return lastClaim[user] + FAUCET_COOLDOWN;
    }

    /// @notice Tokens left in the faucet.
    function faucetBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }

    // Required by Solidity because both ERC20 and ERC20Capped define _update.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped)
    {
        super._update(from, to, value);
    }
}