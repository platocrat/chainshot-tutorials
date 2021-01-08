// SPDX-License-Identifier: MIT
pragma solidity ^0.7.5;

contract Escrow {
    address public depositor;
    address public beneficiary;
    address public arbiter;

    constructor(address _arbiter, address _beneficiary) payable {
        arbiter = _arbiter;
        beneficiary = _beneficiary;
        // `depositor` is the one initializing this contract and will initialize
        // it with an starting balance to be paid out to the beneficiary by the
        // arbiter, once the beneficiary provides their good or service.
        depositor = msg.sender;
    }

    function approve() external {
        // Let only the arbiter call this `approve` function.
        require(msg.sender == arbiter, "This caller is not the arbiter!");
        // Transfer this Escrow contract's balance to the beneficiary.
        payable(beneficiary).transfer(address(this).balance);
    }
}
