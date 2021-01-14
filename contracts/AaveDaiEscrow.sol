//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/ILendingPool.sol";

contract AaveDaiEscrow {
    address arbiter;
    address depositor;
    address beneficiary;
    uint256 initialDeposit;

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
        initialDeposit = _amount;

        // Transfer `_amount` of dai to this contract
        dai.transferFrom(msg.sender, address(this), _amount);
        // Approve the DAI spend
        dai.approve(address(pool), _amount);
        // Deposit the DAI to the pool contract
        pool.deposit(address(dai), _amount, address(this), 0);
    }

    function approve() external {
        // Only the `arbiter` call the `approve()` method.
        require(msg.sender == arbiter);

        // To pay the `beneficiary`, we must first approve the `pool` to spend
        // our `aDai` balance.
        aDai.approve(address(pool), type(uint256).max);
        // Withdraw directly to the `beneficiary`
        pool.withdraw(
            // When you call `withdraw`, you must specify the underlying asset
            // you are trying to withdraw, not the interest bearing asset.
            address(dai),
            initialDeposit,
            beneficiary
        );
        // Pay accrued interest to the depositor (not that accrued interest is
        // in the underlying asset and NOT in the Aave interest earning)
        pool.withdraw(address(dai), type(uint256).max, depositor);
    }
}
