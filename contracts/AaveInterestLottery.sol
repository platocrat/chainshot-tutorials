// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "./interfaces/IERC20.sol";
import "./interfaces/ILendingPool";

contract AaveInterestLottery {
    // Timestamp of the drawing event
    uint256 public drawing;
    // Price of the ticket in DAI (100 DAI)
    uint256 ticketPrice = 100e18;
    // Used to track user's ticket purchase
    mapping(address => bool) ticketPurchased;

    // The mainnet Aave v2 lending pool
    ILendingPool pool =
        ILendingPool(0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9);
    // Aave interest earning DAI
    IERC20 aDai = IERC20(0x028171bCA77440897B824Ca71D1c56caC55b68A3);
    // The DAI stablecoin
    IERC20 dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    constructor() {
        // Set the lottery drawing to be 1 week after the contract is deployed
        drawing = block.timestamp + 1 weeks;
    }

    function purchase() external {
        // If a user already has a ticket, don't let them buy another
        require(
            !ticketPurchased[msg.sender],
            "You have already purchased a ticket!"
        );

        // Accept DAI in exchange for tickets
        dai.transferFrom(msg.sender, address(this), ticketPrice);

        ticketPurchased[msg.sender] = true;

        
    }

    event Winner(address);

    function pickWinner() external {}
}
