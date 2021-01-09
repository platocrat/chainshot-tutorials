// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/IWETHGateway.sol";

contract AaveEtherEscrow {
    address arbiter;
    address depositor;
    address beneficiary;

    /**
     * @dev One tricky aspect here is that the Aave lending pool contract is
     * designed to work with ERC20 tokens. Thus, we'll need to use Wrapped
     * ether (or WETH) if we want to deposit ether into the lending pool.
     *
     * Fortunately, Aave deployed a WETHGateway that we can deposit our ether
     * directly into. This gateway will convert ether into wrapped ether and
     * deposit it into the Aave lending pool for us. In return, the escrow will
     * receive aWETH, an interest bearing asset.
     */
    IWETHGateway gateway =
        IWETHGateway(0xDcD33426BA191383f1c9B431A342498fdac73488);
    IERC20 aWETH = IERC20(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e);

    constructor(address _arbiter, address _beneficiary) payable {
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = msg.sender; // Depositor deploys this contract

        /**
         * @dev Deposit ETH through the WETH gateway.
         * @notice When making an external function call, we can specify the
         * value we'd like to send to it:
         * ```
         * contract Other {
         *     function deposit() external payable {}
         * }
         * contract Sender {
         *     Other other;
         *     constructor(Other, _other) {
         *         other = _other;
         *     }
         *     function send() external {
         *          // sending 1 ether to the other contract
         *          other.deposit{ value: 1 ether }()
         *     }
         * }
         * ```
         * @notice @todo Unfortunately, there's this external function call bug,
         * `Error: Transaction reverted: function call to a non-contract account`
         * that I cannot solve.
         * @param address onBehalfOf
         * @param uint256 referralCode
         */
        gateway.depositETH{value: address(this).balance}(address(this), 0);
    }

    function approve() external {}
}
