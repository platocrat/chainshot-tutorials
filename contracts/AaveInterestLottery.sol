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
    mapping(address => bool) hasTicket;
    // Used to draw from and select the winner
    address[] ticketPurchasers;

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
        require(!hasTicket[msg.sender], "You have already purchased a ticket!");

        // Accept DAI in exchange for tickets
        dai.transferFrom(msg.sender, address(this), ticketPrice);
        // Track ticket purchase of depositor
        hasTicket[msg.sender] = true;
        // Keep track of users that purchased ticket to select winner from
        ticketPurchasers.push(msg.sender);

        // Approve the DAI deposit into the Aave v2 lending pool
        dai.approve(address(pool), ticketPrice);
        // Deposit the DAI to the Aave v2 pool contract
        pool.deposit(address(dai), ticketPrice, address(this), 0);
    }

    event Winner(address);

    function pickWinner() external {
        require(
            block.timestamp >= drawing,
            "Winner can only be picked after the 'drawing' timestamp"
        );

        uint256 totalPurchasers = ticketPurchasers.length;
        // This is insecure method of selecting a winner since the outcome can
        // be manipulated by miners
        uint256 winnerIndex =
            uint256(blockhash(block.number - 1)) % totalPurchasers;
        address winner = ticketPurchasers[winnerIndex];

        emit Winner(winner);

        aDai.approve(address(pool), type(uint256).max);

        /** @dev Step 5: Winner Payout */
        // Each participant should get their money back and the winner should
        // additionally receive all interest earned
        for (var i = 0; i < totalPurchasers; i++) {
            pool.withdraw(address(dai), ticketPrice, ticketPurchasers[i]);
        }

        // Pay accrued interest to the depositor (not that accrued interest is
        // in the underlying asset and NOT in the Aave interest earning asset)
        pool.withdraw(address(aDai), type(uint256).max, winner);
    }
}
