//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployBug } from "./DeployBug.s.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run when to deploy multiple contracts at once
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all contracts sequentially
        // Add new deployments here when needed

        DeployBug deployBug = new DeployBug();
        deployBug.run();

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
    }
}
