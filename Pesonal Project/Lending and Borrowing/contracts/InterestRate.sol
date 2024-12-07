// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/Interface.sol";

contract InterestRate {
    address public admin;
    uint256 constant decimal = 10000;

    ILendingPool public lendingPool;
    IBorrower public borrower;

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

    event ContractAddressesSet(
        address indexed lendingPool,
        address indexed borrower
    );
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
    event ReserveInitialized(
        address indexed tokenAddress,
        uint256 currentLiquidityRate,
        uint256 currentVariableBorrowRate,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex,
        uint256 lastUpdateTimestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAuthorizedContracts() {
        require(
            msg.sender == address(lendingPool) ||
            msg.sender == address(borrower),
            "Only authorized contracts can call this function"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setContractAddresses(
        address _lendingPool,
        address _borrower
    ) external onlyAdmin {
        lendingPool = ILendingPool(_lendingPool);
        borrower = IBorrower(_borrower);

        emit ContractAddressesSet(_lendingPool, _borrower);
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
            liquidityIndex: 1 * 1e18,
            variableBorrowIndex: 1 * 1e18,
            lastUpdateTimestamp: block.timestamp
        });
        emit ReserveInitialized(
            tokenAddress,
            1 * decimal,
            1 * decimal,
            1 * 1e18,
            1 * 1e18,
            block.timestamp
        );
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
        uint256 rate = (calculateBorrowAPR(tokenAddress) * 1e27) / decimal;

        uint256 SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
        //uint256 borrowAPY;

        uint256 expMinusOne;
        uint256 expMinusTwo;
        uint256 basePowerTwo;
        uint256 basePowerThree;
        unchecked {
            expMinusOne = SECONDS_PER_YEAR - 1;

            expMinusTwo = SECONDS_PER_YEAR - 2;

            basePowerTwo =
                (rate * rate + (1e27 / 2)) /
                1e27 /
                (SECONDS_PER_YEAR * SECONDS_PER_YEAR);
            basePowerThree =
                (basePowerTwo * rate + (1e27 / 2)) /
                1e27 /
                SECONDS_PER_YEAR;
        }

        uint256 secondTerm = SECONDS_PER_YEAR * expMinusOne * basePowerTwo;
        unchecked {
            secondTerm /= 2;
        }
        uint256 thirdTerm = SECONDS_PER_YEAR *
            expMinusOne *
            expMinusTwo *
            basePowerThree;
        unchecked {
            thirdTerm /= 6;
        }
        return
            (((1e27 +
                (rate * SECONDS_PER_YEAR) /
                SECONDS_PER_YEAR +
                secondTerm +
                thirdTerm) - 1e27) * decimal) / 1e27;
    }

    function calculateDepositAPY(
        address tokenAddress
    ) public view returns (uint256) {
        uint256 borrowAPY = calculateBorrowAPY(tokenAddress);
        uint256 utilizationRate = lendingPool.getCurrentUtilizationRate(
            tokenAddress
        );

        uint256 depositAPY = (utilizationRate * borrowAPY) / decimal;

        return depositAPY;
    }

    function updateInterestRates(
        address tokenAddress
    ) external onlyAuthorizedContracts {
        ReserveData storage reserve = reserves[tokenAddress];

        uint256 SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
        uint256 timeElapsed = block.timestamp - reserve.lastUpdateTimestamp;

        // if (timeElapsed == 0) {
        //     return;
        // }

        uint256 borrowAPY = calculateBorrowAPY(tokenAddress);

        uint256 liquidityRate = calculateDepositAPY(tokenAddress);

        reserve.currentLiquidityRate = liquidityRate;
        reserve.currentVariableBorrowRate = borrowAPY;

        unchecked {
            reserve.liquidityIndex =
                (reserve.liquidityIndex *
                    (1e18 +
                        (liquidityRate * 1e14 * timeElapsed) /
                        SECONDS_PER_YEAR)) /
                1e18;

            reserve.variableBorrowIndex =
                (reserve.variableBorrowIndex *
                    (1e18 +
                        (borrowAPY * 1e14 * timeElapsed) /
                        SECONDS_PER_YEAR)) /
                1e18;

            reserve.lastUpdateTimestamp = block.timestamp;
        }

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
