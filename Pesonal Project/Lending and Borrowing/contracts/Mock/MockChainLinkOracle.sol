// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MockChainlinkOracle is AggregatorV3Interface {
    int256 private _price;

    constructor(int256 initialPrice) {
        _price = initialPrice;
    }

    function setPrice(int256 newPrice) external {
        _price = newPrice;
    }

    // Implement all required methods from AggregatorV3Interface
    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _price, 0, 0, 0);
    }

    function getRoundData(
        uint80 /*_roundId*/
    )
        external
        view
        override
        returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, _price, 0, 0, 0);
    }

    function decimals() external pure override returns (uint8) {
        return 18; // Return the number of decimals
    }

    function description() external pure override returns (string memory) {
        return "Mock Chainlink Oracle";
    }

    function version() external pure override returns (uint256) {
        return 1; // Mock version number
    }
}
