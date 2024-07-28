// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Borrower {
    address public admin;
    IPriceOracle public priceOracle;
    ICollateralManager public collateralManager;
    ILendingPool public lendingPool;
    IInterestRate public interestRate;

    uint256 public loanCounter;
    uint256 public serviceFee;
    uint256[] public loanIds;
    uint256 public decimal = 10000;

    struct Loan {
        uint256 loanId;
        address borrower;
        address tokenAddress;
        uint256 tokenAmount;
        address[] collateralAddresses;
        uint256 variableBorrowIndex;
    }

    struct RiskParameters {
        uint256 ltv;
        uint256 liquidationThreshold;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    mapping(address => RiskParameters) public riskParameters;

    event ServiceFeeSet(uint256 serviceFee);
    event RiskParametersSet(
        address indexed token,
        uint256 l,
        uint256 liquidationThreshold
    );
    event LoanCreated(
        uint256 loanId,
        address borrower,
        address tokenAddress,
        uint256 tokenAmount,
        address[] collateralAddresses
    );
    event LoanRepaid(uint256 loanId, address borrower, uint256 amount);
    event LoanLiquidated(uint256 loanId, address borrower);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
        loanCounter = 0;
    }

    function setContractAddresses(
        address _priceOracle,
        address _collateralManager,
        address _lendingPool,
        address _interestRate
    ) external onlyAdmin {
        priceOracle = IPriceOracle(_priceOracle);
        collateralManager = ICollateralManager(_collateralManager);
        lendingPool = ILendingPool(_lendingPool);
        interestRate = IInterestRate(_interestRate);
    }

    function setServiceFee(uint256 _serviceFee) external onlyAdmin {
        serviceFee = _serviceFee;
        emit ServiceFeeSet(serviceFee);
    }

    function setRiskParameters(
        address token,
        uint256 _ltv,
        uint256 _liquidationThreshold
    ) external onlyAdmin {
        require(
            _ltv < _liquidationThreshold,
            "LTV must be less than Liquidation Threshold"
        );
        riskParameters[token] = RiskParameters({
            ltv: _ltv,
            liquidationThreshold: _liquidationThreshold
        });

        emit RiskParametersSet(token, _ltv, _liquidationThreshold);
    }

    // function getCollateralValueForTokens(address user, address[] memory tokenAddresses) public view returns (uint256) {
    //     return collateralManager.getCollateralValueForTokens(user, tokenAddresses);
    // }

    function createLoan(
        address tokenAddress,
        uint256 tokenAmount,
        address[] calldata collateralAddresses
    ) external payable{
        require(
            collateralAddresses.length > 0,
            "Must provide at least one collateral address"
        );
        require(msg.value == serviceFee, "Incorrect service fee amount");

        uint256 totalCollateralValueInUSD = collateralManager.getCollateralValueForTokens(msg.sender, collateralAddresses);

        uint256 maxLoanAmountInUSD = (totalCollateralValueInUSD *
            riskParameters[tokenAddress].ltv) / decimal;

        uint256 tokenPriceInUSD = priceOracle.getAssetPrice(tokenAddress);

        uint256 maxLoanAmountInTokens = (maxLoanAmountInUSD / tokenPriceInUSD) *
            1e18;

        require(
            tokenAmount > 0 && tokenAmount <= maxLoanAmountInTokens,
            string(
                abi.encodePacked(
                    "Loan amount must be greater than zero and less than max loan amount in tokens"
                )
            )
        );

        loanCounter++;
        uint256 loanId = loanCounter;

        (, uint256 currentVariableBorrowIndex, , ) = interestRate
            .getReserveData(tokenAddress);

        collateralManager.lockCollaterals(msg.sender, collateralAddresses);

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            tokenAddress: tokenAddress,
            tokenAmount: tokenAmount,
            collateralAddresses: collateralAddresses,
            variableBorrowIndex: currentVariableBorrowIndex
        });

        loanIds.push(loanId);
        userLoans[msg.sender].push(loanId);

        lendingPool.transferLoan(tokenAddress, msg.sender, tokenAmount);

        (bool feeSuccess, ) = address(lendingPool).call{value: serviceFee}("");
        require(feeSuccess, "Transfer of service fee failed");        

        interestRate.updateInterestRates(tokenAddress);

        emit LoanCreated(
            loanId,
            msg.sender,
            tokenAddress,
            tokenAmount,
            collateralAddresses
        );
    }

    function repayLoan(uint256 loanId, uint256 amount) external payable {
        Loan storage loan = loans[loanId];
        require(loan.borrower == msg.sender, "Caller is not the borrower");
        require(amount > 0, "Invalid repayment amount");

        (
            uint256 totalRepayment,
            uint256 currentVariableBorrowIndex
        ) = calculateTotalRepayment(loanId);
        loan.tokenAmount = totalRepayment;
        require(msg.value == serviceFee, "Incorrect service fee amount");

        if (amount < totalRepayment) {
            loan.tokenAmount -= amount;
            loan.variableBorrowIndex = currentVariableBorrowIndex;

            IERC20(loan.tokenAddress).transferFrom(
                msg.sender,
                address(lendingPool),
                amount
            );

            (bool feeSuccess, ) = address(lendingPool).call{value: serviceFee}("");
            require(feeSuccess, "Transfer of service fee failed");

        } else {
            uint256 excessAmount = amount - totalRepayment;
            loan.tokenAmount = 0;

            IERC20(loan.tokenAddress).transferFrom(
                msg.sender,
                address(lendingPool),
                amount
            );

            (bool feeSuccess, ) = address(lendingPool).call{value: serviceFee}("");
            require(feeSuccess, "Transfer of service fee failed");

            if (excessAmount > 0) {
                lendingPool.transferExcessAmount(loan.tokenAddress, msg.sender, excessAmount);
            }

            collateralManager.unlockCollaterals(
                msg.sender,
                loan.collateralAddresses
            );

            removeLoanIdFromBorrower(msg.sender, loanId);
            removeLoanIdFromGlobalList(loanId);
        }

        interestRate.updateInterestRates(loan.tokenAddress);

        emit LoanRepaid(loanId, msg.sender, amount);
    }

    function removeLoanIdFromBorrower(address user, uint256 loanId) internal {
        uint256[] storage userLoanIds = userLoans[user];
        for (uint256 i = 0; i < userLoanIds.length; i++) {
            if (userLoanIds[i] == loanId) {
                userLoanIds[i] = userLoanIds[userLoanIds.length - 1];
                userLoanIds.pop();
                break;
            }
        }
    }

    function removeLoanIdFromGlobalList(uint256 loanId) internal {
        for (uint256 i = 0; i < loanIds.length; i++) {
            if (loanIds[i] == loanId) {
                loanIds[i] = loanIds[loanIds.length - 1];
                loanIds.pop();
                break;
            }
        }
    }

    function calculateTotalRepayment(
        uint256 loanId
    ) public view returns (uint256, uint256) {
        Loan memory loan = loans[loanId];
        (, uint256 currentVariableBorrowIndex, , ) = interestRate
            .getReserveData(loan.tokenAddress);

        uint256 totalRepayment = (loan.tokenAmount *
            currentVariableBorrowIndex) / loan.variableBorrowIndex;

        return (totalRepayment, currentVariableBorrowIndex);
    }

    function getCurrentVariableBorrowRate(
        address tokenAddress
    ) public view returns (uint256) {
        (, , , uint256 currentVariableBorrowRate) = interestRate.getReserveData(
            tokenAddress
        );
        return currentVariableBorrowRate;
    }

    function checkHealthFactor(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 totalCollateralValueInUSD = collateralManager
            .getCollateralValueForTokens(
                loan.borrower,
                loan.collateralAddresses
            );
        uint256 tokenPriceInUSD = priceOracle.getAssetPrice(loan.tokenAddress);

        (uint256 totalLoanAmount, ) = calculateTotalRepayment(loanId);
        
        uint256 loanAmountInUSD = (totalLoanAmount * tokenPriceInUSD) / 1e18;
        uint256 liquidationThreshold = riskParameters[loan.tokenAddress]
            .liquidationThreshold;

        uint256 healthFactor = (totalCollateralValueInUSD *
            liquidationThreshold) / loanAmountInUSD;

        return healthFactor;
    }

    function getAllLoanIds() external view returns (uint256[] memory) {
        return loanIds;
    }

    function liquidateLoan(uint256 loanId) external {   // Thêm onlyAuthorized
        Loan memory loan = loans[loanId];

        collateralManager.unlockCollaterals(
            loan.borrower,
            loan.collateralAddresses
        );

        for (uint256 j = 0; j < loan.collateralAddresses.length; j++) {
            address collateralAddress = loan.collateralAddresses[j];
            uint256 collateralAmount = collateralManager.getCollateralAmount(
                loan.borrower,
                collateralAddress
            );

            collateralManager.transferCollateral(collateralAddress, collateralAmount);
        }

        removeLoanIdFromBorrower(loan.borrower, loanId);
        removeLoanIdFromGlobalList(loanId);
    }
}
