// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/Interface.sol";

contract InterestRate {
    address public admin;
    uint256 constant decimal = 1000;

    ILendingPool public lendingPool;

    struct InterestParams {
        uint256 slope1;
        uint256 slope2;
        uint256 baseRate;
        uint256 utilizationOptimal;
    }

    struct ReserveData {
        uint256 liquidityIndex;
        uint256 variableBorrowIndex;
        uint256 currentLiquidityRate;
        uint256 currentVariableBorrowRate;
        uint256 lastUpdateTimestamp;
    }

    mapping(address => InterestParams) public interestParams;
    mapping(address => ReserveData) public reserves;

    event InterestRateSet(
        address indexed tokenAddress,
        uint256 slope1,
        uint256 slope2,
        uint256 baseRate,
        uint256 _utilizationOptimal
    );
    event ReserveDataUpdated(
        address indexed tokenAddress,
        uint256 liquidityRate,
        uint256 variableBorrowRate,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor(address _lendingPool) {
        admin = msg.sender;
        lendingPool = ILendingPool(_lendingPool);
    }

    function setInterestRateParams(
        address tokenAddress,
        uint256 _slope1,
        uint256 _slope2,
        uint256 _baseRate,
        uint256 _utilizationOptimal
    ) external onlyAdmin {
        interestParams[tokenAddress] = InterestParams({
            slope1: _slope1,
            slope2: _slope2,
            baseRate: _baseRate,
            utilizationOptimal: _utilizationOptimal
        });

        emit InterestRateSet(
            tokenAddress,
            _slope1,
            _slope2,
            _baseRate,
            _utilizationOptimal
        );
    }

    function getInterestRateParams(
        address tokenAddress
    ) external view returns (uint256, uint256, uint256) {
        InterestParams storage params = interestParams[tokenAddress];
        return (params.slope1, params.slope2, params.baseRate);
    }

    function initializeReserve(address tokenAddress) external onlyAdmin {
        reserves[tokenAddress] = ReserveData({
            currentLiquidityRate: 1 * decimal,
            currentVariableBorrowRate: 1 * decimal,
            liquidityIndex: 1 * decimal,
            variableBorrowIndex: 1 * decimal,
            lastUpdateTimestamp: block.timestamp
        });
    }

    function calculateBorrowAPR(
        address tokenAddress
    ) public view returns (uint256) {
        uint256 utilizationRate = lendingPool.getCurrentUtilizationRate(
            tokenAddress
        );

        InterestParams memory params = interestParams[tokenAddress];
        uint256 borrowAPR;

        if (utilizationRate <= params.utilizationOptimal) {
            borrowAPR =
                params.baseRate +
                (utilizationRate * params.slope1) /
                params.utilizationOptimal;
        } else {
            uint256 excessUtilization = utilizationRate -
                params.utilizationOptimal;
            borrowAPR =
                params.baseRate +
                params.slope1 +
                (excessUtilization * params.slope2) /
                (1 * decimal - params.utilizationOptimal);
        }

        return borrowAPR;
    }

    function calculateBorrowAPY(
        address tokenAddress
    ) public view returns (uint256) {
        uint256 borrowRate = calculateBorrowAPR(tokenAddress);

        uint256 n = 365 * 24 * 60 * 60;
        uint256 borrowAPY = ((1 * decimal + borrowRate / n) ** n - 1 * decimal);

        return borrowAPY;
    }
    function calculateDepositAPY(
        address tokenAddress
    ) external view returns (uint256) {
        uint256 borrowAPY = calculateBorrowAPY(tokenAddress);
        uint256 utilizationRate = lendingPool.getCurrentUtilizationRate(
            tokenAddress
        );

        uint256 depositAPY = (utilizationRate * borrowAPY) / decimal;

        return depositAPY;
    }

    function updateInterestRates(address tokenAddress) external {
        ReserveData storage reserve = reserves[tokenAddress];

        uint256 timeElapsed = block.timestamp - reserve.lastUpdateTimestamp;

        if (timeElapsed == 0) {
            return;
        }

        uint256 utilizationRate = lendingPool.getCurrentUtilizationRate(
            tokenAddress
        );
        uint256 borrowAPY = calculateBorrowAPY(tokenAddress);

        uint256 liquidityRate = (borrowAPY * utilizationRate) / decimal;

        reserve.currentLiquidityRate = liquidityRate;
        reserve.currentVariableBorrowRate = borrowAPY;

        reserve.liquidityIndex =
            reserve.liquidityIndex *
            (1 +
                (((liquidityRate / decimal) * timeElapsed) /
                    (365 * 24 * 60 * 60)));
        reserve.variableBorrowIndex =
            reserve.variableBorrowIndex *
            (1 +
                (((borrowAPY / decimal) * timeElapsed) / (365 * 24 * 60 * 60)));
        reserve.lastUpdateTimestamp = block.timestamp;

        emit ReserveDataUpdated(
            tokenAddress,
            liquidityRate,
            borrowAPY,
            reserve.liquidityIndex,
            reserve.variableBorrowIndex
        );
    }

    function getReserveData(
        address tokenAddress
    )
        external
        view
        returns (
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint256 currentLiquidityRate,
            uint256 currentVariableBorrowRate
        )
    {
        ReserveData memory reserve = reserves[tokenAddress];
        return (
            reserve.liquidityIndex,
            reserve.variableBorrowIndex,
            reserve.currentLiquidityRate,
            reserve.currentVariableBorrowRate
        );
    }
}
