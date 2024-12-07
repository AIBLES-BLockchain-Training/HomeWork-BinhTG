// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceOracle {
    address public admin;

    mapping(address => address) public assetOracles;
    mapping(address => uint256) public customPrices;

    event OracleSet(address indexed asset, address indexed oracle);
    event CustomPriceSet(address indexed asset, uint256 price);
    event OracleReset(address indexed asset);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setAssetOracle(address asset, address oracle) external onlyAdmin {
        assetOracles[asset] = oracle;
        emit OracleSet(asset, oracle);
    }

    function setCustomPrice(address asset, uint256 price) external onlyAdmin {
        customPrices[asset] = price;
        emit CustomPriceSet(asset, price);
    }

    function getAssetPrice(address asset) public view returns (uint256) {
        if (customPrices[asset] != 0) {
            return customPrices[asset];
        }
        if (assetOracles[asset] != address(0)) {
            return _getPriceFromChainLink(assetOracles[asset]);
        }
        revert("No price available for the specified asset");
    }

    function resetAssetOracle(address asset) external onlyAdmin {
        delete assetOracles[asset];
        emit OracleReset(asset);
    }

    function _getPriceFromChainLink(
        address oracle
    ) internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(oracle);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }
}
