// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BugToken} from "../contracts/BugToken.sol";
import {BugBountyHunter} from "../contracts/BugBountyHunter.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract BugBountyHunterTest is Test {
    BugToken token;
    BugBountyHunter game;
    VRFCoordinatorV2_5Mock vrf;
    uint256 subId;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        // Fake Chainlink: base fee, gas price, LINk price in wei
        vrf = new VRFCoordinatorV2_5Mock(0.1 ether, 1e9, 4e15);
        subId = vrf.createSubscription();
        vrf.fundSubscriptionWithNative{value: 100 ether}(subId); // VRF is paid in ETH

        token = new BugToken(address(this));
        game = new BugBountyHunter(address(vrf), address(token), subId, bytes32(0));
        vrf.addConsumer(subId, address(game));

        token.transfer(address(game), 2_000_000 ether); // prize pool
        token.transfer(alice, 1_000 ether);
        vm.prank(alice);
        token.approve(address(game), type(uint256).max);
    }

    /// alice hunts, then the fake Chainlink answers with 'roll'
    function _huntAndFulfill(uint256 roll) internal returns (uint256 requestId) {
        vm.prank(alice);
        requestId = game.hunt();
        uint256[] memory words = new uint256[](1);
        words[0] = roll;
        vrf.fulfillRandomWordsWithOverride(requestId, address(game), words);
    }

    function test_HuntTakesCostAndReserves() public {
        vm.prank(alice);
        game.hunt();
        assertEq(token.balanceOf(alice), 900 ether);
        assertTrue(game.isHunting(alice));
        assertEq(game.reservedForPending(), 1000 ether);
    }

    function test_CriticalPays1000() public {
        _huntAndFulfill(9999);
        assertEq(token.balanceOf(alice), 900 ether + 1000 ether);
        assertFalse(game.isHunting(alice));
        assertEq(game.reservedForPending(), 0);
        (BugBountyHunter.Severity sev, uint256 bounty,) = game.lastHunt(alice);
        assertEq(uint256(sev), uint256(BugBountyHunter.Severity.Critical));
        assertEq(bounty, 1000 ether);
    }

    function test_NoFindingPaysNothing() public {
        _huntAndFulfill(0);
        assertEq(token.balanceOf(alice), 900 ether);
    }

    function test_SeverityThresholds() public view {
        assertEq(uint256(game.rollToSeverity(4499)), uint256(BugBountyHunter.Severity.None));
        assertEq(uint256(game.rollToSeverity(4500)), uint256(BugBountyHunter.Severity.Gas));
        assertEq(uint256(game.rollToSeverity(7000)), uint256(BugBountyHunter.Severity.Low));
        assertEq(uint256(game.rollToSeverity(8500)), uint256(BugBountyHunter.Severity.Medium));
        assertEq(uint256(game.rollToSeverity(9400)), uint256(BugBountyHunter.Severity.High));
        assertEq(uint256(game.rollToSeverity(9850)), uint256(BugBountyHunter.Severity.Critical));
    }

    function test_StatsAndLeaderboard() public {
        _huntAndFulfill(9999);
        (address[] memory players, uint256[] memory won, uint32[] memory crits, uint32[] memory hunts) =
            game.getLeaderboard();
        assertEq(players.length, 1);
        assertEq(players[0], alice);
        assertEq(won[0], 1000 ether);
        assertEq(crits[0], 1);
        assertEq(hunts[0], 1);
    }

    // --- invalid actions ---
    function test_RevertWhen_NoApproval() public {
        token.transfer(bob, 100 ether); // bob has tokens but never approved
        vm.prank(bob);
        vm.expectRevert();
        game.hunt();
    }

    function test_RevertWhen_NotEnoughTokens() public {
        vm.prank(bob);
        token.approve(address(game), type(uint256).max); // bob approved but has 0 BUG
        vm.prank(bob);
        vm.expectRevert();
        game.hunt();
    }

    function test_RevertWhen_AlreadyHunting() public {
        vm.startPrank(alice);
        game.hunt();
        vm.expectRevert(BugBountyHunter.AlreadyHunting.selector);
        game.hunt();
        vm.stopPrank();
    }

    function test_RevertWhen_PoolTooLow() public {
        BugBountyHunter small = new BugBountyHunter(address(vrf), address(token), subId, bytes32(0));
        vrf.addConsumer(subId, address(small));
        token.transfer(address(small), 1500 ether);
        token.transfer(bob, 100 ether);
        vm.prank(alice);
        token.approve(address(small), type(uint256).max);
        vm.prank(bob);
        token.approve(address(small), type(uint256).max);

        vm.prank(alice);
        small.hunt(); // pool 1600, 1000 reserved -> only 600 free
        vm.prank(bob);
        vm.expectRevert(BugBountyHunter.PoolTooLow.selector);
        small.hunt();
    }

    // --- safety valve ---
    function test_OwnerCanClearStuckHunt() public {
        vm.prank(alice);
        uint256 requestId = game.hunt();
        game.clearStuckHunt(requestId); // this test contract deployed the game = owner
        assertEq(token.balanceOf(alice), 1000 ether); // refunded
        assertFalse(game.isHunting(alice));
        assertEq(game.reservedForPending(), 0);
    }

    function test_RevertWhen_NonOwnerClearsHunt() public {
        vm.prank(alice);
        uint256 requestId = game.hunt();
        vm.prank(bob);
        vm.expectRevert("Only callable by owner");
        game.clearStuckHunt(requestId);
    }

    // fuzz: any random number keeps the books correct
    function testFuzz_AnyRollPaysCorrectly(uint256 roll) public {
        _huntAndFulfill(roll);
        uint256 expected = game.bountyFor(game.rollToSeverity(roll % 10_000));
        assertEq(token.balanceOf(alice), 900 ether + expected);
        assertEq(game.reservedForPending(), 0);
        assertFalse(game.isHunting(alice));
    }
}