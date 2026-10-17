// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/// @title Bug Bounty Hunter
/// @notice Pay 100 BUG to hunt. Chainlink VRF decides the severity of the bug you find.
contract BugBountyHunter is VRFConsumerBaseV2Plus {
    using SafeERC20 for IERC20;

    enum Severity { None, Gas, Low, Medium, High, Critical }

    struct Stats { uint32 hunts; uint32 criticals; uint256 totalWon; }
    struct LastHunt { Severity severity; uint256 bounty; uint256 requestId; }

    IERC20 public immutable bug;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;

    uint256 public constant HUNT_COST = 100 ether;
    uint256 public constant MAX_BOUNTY = 1000 ether;
    uint32 public constant CALLBACK_GAS_LIMIT = 500_000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;

    // Pool money promised to hunts that are still waiting for VRF.
    uint256 public reservedForPending;

    mapping(uint256 => address) public requestToPlayer;
    mapping(address => bool) public isHunting;
    mapping(address => LastHunt) public lastHunt;
    mapping(address => Stats) public stats;
    address[] public hunters;
    mapping(address => bool) private seen;

    event HuntStarted(address indexed player, uint256 indexed requestId);
    event HuntResult(address indexed player, uint256 indexed requestId, Severity severity, uint256 bounty);

    error AlreadyHunting();
    error PoolTooLow();
    error UnknownRequest();

    constructor(address coordinator, address bugToken, uint256 subId, bytes32 _keyHash)
        VRFConsumerBaseV2Plus(coordinator)
    {
        bug = IERC20(bugToken);
        subscriptionId = subId;
        keyHash = _keyHash;
    }

    /// @notice Start a hunt. Player must have approved 100 BUG first.
    function hunt() external returns (uint256 requestId) {
        if (isHunting[msg.sender]) revert AlreadyHunting();
        if (poolAvailable() < MAX_BOUNTY) revert PoolTooLow();

        // Effects first
        isHunting[msg.sender] = true;
        reservedForPending += MAX_BOUNTY;
        if (!seen[msg.sender]) {
            seen[msg.sender] = true;
            hunters.push(msg.sender);
        }

        // Interactions
        bug.safeTransferFrom(msg.sender, address(this), HUNT_COST);

        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: true}) // pay with Sepolia ETH
                )
            })
        );
        requestToPlayer[requestId] = msg.sender;
        emit HuntStarted(msg.sender, requestId);
    }

    /// @dev Called by the Chainlink coordinator. Must NEVER revert.
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address player = requestToPlayer[requestId];
        if (player == address(0)) return; // unknown or already cleared
        delete requestToPlayer[requestId];

        Severity severity = rollToSeverity(randomWords[0] % 10_000);
        uint256 bounty = bountyFor(severity);

        reservedForPending -= MAX_BOUNTY;
        isHunting[player] = false;
        lastHunt[player] = LastHunt(severity, bounty, requestId);

        Stats storage s = stats[player];
        s.hunts += 1;
        if (severity == Severity.Critical) s.criticals += 1;
        s.totalWon += bounty;

        if (bounty > 0) bug.safeTransfer(player, bounty);
        emit HuntResult(player, requestId, severity, bounty);
    }

    /// @notice Turns a number 0-9999 into a severity.
    function rollToSeverity(uint256 roll) public pure returns (Severity) {
        if (roll < 4500) return Severity.None;
        if (roll < 7000) return Severity.Gas;
        if (roll < 8500) return Severity.Low;
        if (roll < 9400) return Severity.Medium;
        if (roll < 9850) return Severity.High;
        return Severity.Critical;
    }

    function bountyFor(Severity s) public pure returns (uint256) {
        if (s == Severity.Gas) return 40 ether;
        if (s == Severity.Low) return 100 ether;
        if (s == Severity.Medium) return 200 ether;
        if (s == Severity.High) return 400 ether;
        if (s == Severity.Critical) return 1000 ether;
        return 0;
    }

    /// @notice Pool tokens not promised to pending hunts.
    function poolAvailable() public view returns (uint256) {
        uint256 bal = bug.balanceOf(address(this));
        return bal > reservedForPending ? bal - reservedForPending : 0;
    }

    /// @notice Everything the leaderboard needs in one call.
    function getLeaderboard()
        external
        view
        returns (address[] memory players, uint256[] memory won, uint32[] memory criticals, uint32[] memory huntCounts)
    {
        uint256 n = hunters.length;
        players = hunters;
        won = new uint256[](n);
        criticals = new uint32[](n);
        huntCounts = new uint32[](n);
        for (uint256 i = 0; i < n; i++) {
            Stats memory s = stats[hunters[i]];
            won[i] = s.totalWon;
            criticals[i] = s.criticals;
            huntCounts[i] = s.hunts;
        }
    }

    /// @notice Safety valve: if VRF never answers, owner refunds the player.
    function clearStuckHunt(uint256 requestId) external onlyOwner {
        address player = requestToPlayer[requestId];
        if (player == address(0)) revert UnknownRequest();
        delete requestToPlayer[requestId];
        reservedForPending -= MAX_BOUNTY;
        isHunting[player] = false;
        bug.safeTransfer(player, HUNT_COST);
    }
}