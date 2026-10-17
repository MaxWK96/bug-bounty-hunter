// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BugToken} from "../contracts/BugToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

contract BugTokenTest is Test {
    BugToken token;
    address owner = makeAddr("owner");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        token = new BugToken(owner); // this test contract is the deployer (gets 3M)
    }

    function test_InitialDistribution() public view {
        assertEq(token.totalSupply(), 7_000_000 ether);
        assertEq(token.faucetBalance(), 4_000_000 ether);
        assertEq(token.balanceOf(address(this)), 3_000_000 ether);
        assertEq(token.cap(), 10_000_000 ether);
        assertEq(token.owner(), owner);
    }

    // --- mint ---
    function test_OwnerCanMint() public {
        vm.prank(owner);
        token.mint(alice, 1000 ether);
        assertEq(token.balanceOf(alice), 1000 ether);
    }

    function test_RevertWhen_NonOwnerMints() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        token.mint(alice, 1 ether);
    }

    function test_RevertWhen_MintExceedsCap() public {
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, 10_000_000 ether + 1, 10_000_000 ether)
        );
        token.mint(alice, 3_000_000 ether + 1);
    }

    // --- burn & transfer ---
    function test_HolderCanBurn() public {
        token.transfer(alice, 500 ether);
        vm.prank(alice);
        token.burn(200 ether);
        assertEq(token.balanceOf(alice), 300 ether);
        assertEq(token.totalSupply(), 7_000_000 ether - 200 ether);
    }

    function test_Transfer() public {
        token.transfer(alice, 100 ether);
        vm.prank(alice);
        token.transfer(bob, 40 ether);
        assertEq(token.balanceOf(alice), 60 ether);
        assertEq(token.balanceOf(bob), 40 ether);
    }

    function test_RevertWhen_TransferMoreThanBalance() public {
        vm.prank(alice); // alice has 0
        vm.expectRevert();
        token.transfer(bob, 1 ether);
    }

    // --- faucet ---
    function test_Claim() public {
        vm.prank(alice);
        token.claim();
        assertEq(token.balanceOf(alice), 500 ether);
        assertEq(token.nextClaimTime(alice), block.timestamp + 24 hours);
    }

    function test_RevertWhen_ClaimTwiceWithin24h() public {
        vm.startPrank(alice);
        token.claim();
        vm.expectRevert(abi.encodeWithSelector(BugToken.ClaimTooSoon.selector, block.timestamp + 24 hours));
        token.claim();
        vm.stopPrank();
    }

    function test_CanClaimAgainAfter24h() public {
        vm.startPrank(alice);
        token.claim();
        vm.warp(block.timestamp + 24 hours);
        token.claim();
        vm.stopPrank();
        assertEq(token.balanceOf(alice), 1000 ether);
    }

    function test_RevertWhen_FaucetEmpty() public {
        deal(address(token), address(token), 100 ether); // force faucet down to 100 BUG
        vm.prank(alice);
        vm.expectRevert(BugToken.FaucetEmpty.selector);
        token.claim();
    }
}