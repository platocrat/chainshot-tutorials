// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.5 <=0.8.0;

interface IWETHGateway {
    function depositETH(address onBehalfOf, uint256 referralCode)
        external
        payable;

    function withdrawETH(uint256 amount, address onBehalfOf) external;

    function repayETH(
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external payable;

    function borrowETH(
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode
    ) external;
}
