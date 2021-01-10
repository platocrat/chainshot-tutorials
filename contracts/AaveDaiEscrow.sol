//SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/ILendingPool.sol";

contract AaveDaiEscrow {
    address arbiter;
    address depositor;
    address beneficiary;

    // The mainnet Aave v2 lending pool
    ILendingPool pool =
        ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // Aave interest bearning DAI
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3);
    // The DAI stablecoin
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    constructor(
        address _arbiter,
        address _beneficiary,
        uint256 _amount
    ) {
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        depositor = msg.sender;

        // Transfer `_amount` of dai to this contract
        dai.transferFrom(msg.sender, address(this), _amount);
        // Approve the DAI spend
        dai.approve(address(pool), _amount);
        // Deposit the DAI through the pool contract
        pool.deposit(address(dai), _amount, address(this), 0);
    }

    function approve() external {}
}
