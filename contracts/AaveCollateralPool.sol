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
pragma solidity ^0.7.5;

import "./IERC20.sol";
import "./ILendingPool.sol";

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
contract CollateralGroup {
    // What is this?
    ILendingPool pool =
        ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // What is this?
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    // What is this?
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3);

    /** @dev Why is this amount in bits???? */
    uint256 depositAmount = 10000e18;
    address[] members;
}
