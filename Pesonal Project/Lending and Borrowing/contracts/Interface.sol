// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPriceOracle {
    function getAssetPrice(address asset) external view returns (uint256);
}

interface ICollateralManager {
    struct Collateral {
        uint256 amount;
        bool isLocked;
    }
    function isTokenAllowed(address token) external view returns (bool);
    function getAllowedTokens() external view returns (address[] memory);
    function addCollateral(address collateralAddress, uint256 amount) external;
    function removeCollateral(
        address collateralAddress,
        uint256 amount
    ) external;
    function lockCollaterals(
        address borrower,
        address[] calldata collateralAddresses
    ) external;
    function unlockCollaterals(
        address borrower,
        address[] calldata collateralAddresses
    ) external;
    function getCollateralAmount(
        address user,
        address collateralAddress
    ) external view returns (uint256);
    function getCollateralValueForTokens(
        address borrower,
        address[] memory tokenAddresses
    ) external view returns (uint256);
    function transferCollateral(address collateralAddress, uint256 amount) external;

}

interface ILendingPool {
    struct LenderAsset {
        uint256 amount;
        uint256 liquidityIndex;
    }

    function depositAsset(address tokenAddress, uint256 amount) external;
    function withDraw(address tokenAddress, uint256 amount) external;
    function transferLoan(
        address tokenAddress,
        address borrower,
        uint256 amount
    ) external;
    function transferExcessAmount(address tokenAddress, address user, uint256 amount) external;
    function getCurrentUtilizationRate(
        address tokenAddress
    ) external view returns (uint256);
}

interface IInterestRate {
    struct InterestParams {
        uint256 slope1;
        uint256 slope2;
        uint256 baseRate;
        uint256 utilizationOptimal;
    }

    struct ReserveData {
        uint256 currentLiquidityRate;
        uint256 currentVariableBorrowRate;
        uint256 liquidityIndex;
        uint256 variableBorrowIndex;
        uint256 lastUpdateTimestamp;
    }
    
    function calculateDepositAPY(
        address tokenAddress
    ) external view returns (uint256) ;

    function getInterestRateParams(
        address tokenAddress
    ) external view returns (uint256, uint256, uint256);
    function calculateBorrowAPR(
        address tokenAddress
    ) external view returns (uint256);
    function calculateBorrowAPY(
        address tokenAddress
    ) external view returns (uint256);
    function updateInterestRates(address tokenAddress) external;
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
        );
}

interface IBorrower {
    struct Loan {
        uint256 loanId;
        address borrower;
        address tokenAddress;
        uint256 tokenAmount;
        address[] collateralAddresses;
        uint256 interestRate;
        uint256 startTime;
        bool isRepaid;
        bool isLiquidated;
    }

    struct RiskParameters {
        uint256 ltv;
        uint256 liquidationThreshold;
    }

    function createLoan(
        address tokenAddress,
        uint256 tokenAmount,
        address[] calldata collateralAddresses
    ) external;
    function repayLoan(uint256 loanId, uint256 amount) external;
    function caculateTotalRepayment(
        uint256 loanId
    ) external view returns (uint256);
    function getLoanDetails(uint256 loanId) external view returns (Loan memory);
    function getRiskParameters(
        address token
    ) external view returns (RiskParameters memory);
    function getAllLoanIds() external view returns (uint256[] memory);
    function checkHealthFactor(uint256 loanId) external view returns (uint256);
    function liquidateLoan(uint256 loanId) external;
}
