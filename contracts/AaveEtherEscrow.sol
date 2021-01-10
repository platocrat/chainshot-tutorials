// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/IWETHGateway.sol";

contract AaveEtherEscrow {
    address arbiter;
    address depositor;
    address beneficiary;
    uint256 initialDeposit;

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
        initialDeposit = msg.value; // To pay the beneficiary after delivery

        gateway.depositETH{value: address(this).balance}(address(this), 0);
    }

    event Received(address, uint256);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function approve() external {
        /**
         * @dev `AaveEtherEscrow` sends ether to the WETH gateway, which sends
         * WETH to the Aave lending pool, which mints Aave interest bearing
         * WETH, or `aWETH`.
         *
         * If we want to withdraw ETH from Aave, we will need to first approve
         * the WETH gateway to spend our `aWETH`. The WETH gateway will attempt
         * to call `transferFrom` on the `aWETH` contract. This assumes that we
         * already have approved the spend from our contract.
         */
        require(msg.sender == arbiter);

        uint256 balance = aWETH.balanceOf(address(this));
        aWETH.approve(address(gateway), balance);

        /**
         * @dev Withdraw ETH into the AaveEtherEscrow contract.
         */
        gateway.withdrawETH(type(uint256).max, address(this));

        /** @dev Pay the initial deposit that was promised to the beneficiary.*/
        payable(beneficiary).transfer(initialDeposit);
        /** @dev Pay accrued interest on deposit to depositor. */
        payable(depositor).transfer(address(this).balance);

        selfdestruct(address(this));
    }
}
