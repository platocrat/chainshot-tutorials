// SPDX-License-Identifier: UNLICENSED
/**
 * @dev Several colleagues decide they want to pool their funds together in a
 * smart contract to create a collateral pool in case any of them want to borrow
 * ERC20 assets. They want to earn interest on their collateral while also
 * allowing borrowing against it.
 *
 * We can build a smart contract to support this very use case! Let's learn how to pool collateral, earn interest and
 * borrow against it in this code tutorial.
 */
pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./ILendingPool.sol";

/**
 * @title Aave Collateral Pool
 * @author platocrat [platocrat@tuta.io]
 * @notice Collect DAI from anyone seeking to join this collateral group.
 * Prospective members will need to contribute 10,000 DAI in order to
 * successfully join.
 *
 * This DAI will serve as the collateral for any member who wishes to borrow
 * against the group's assets. After all debts have been paid, members will be
 * be able to retrieve their initial deposit plus any interest earned.
 * @dev Explain to a developer any extra details
 */
contract AaveCollateralGroup {
    // The mainnet Aave v2 lending pool
    ILendingPool pool =
        ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // The DAI stablecoin
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    // Aave interest earning DAI
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3);

    // 1 ether == 1e18 (https://docs.soliditylang.org/en/v0.8.0/units-and-global-variables.html#ether-units)
    uint256 depositAmount = 10000e18;
    address[] members;

    constructor(address[] memory _members) {
        members = _members;

        // Collect DAI from anyone seeking to join this collateral group
        for (uint256 i = 0; i < _members.length; i++) {
            dai.transferFrom(members[i], address(this), depositAmount);
        }
    }

    function withdraw() external {}

    function borrow(address asset, uint256 amount) external {}

    function repay(address asset, uint256 amount) external {}
}
