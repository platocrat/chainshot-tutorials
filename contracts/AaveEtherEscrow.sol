// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.7.5;

import "./IERC20.sol";
import "./IWETHGateway.sol";

contract Escrow {
    address arbiter;
    address depositor;
    address beneficiary;
}
