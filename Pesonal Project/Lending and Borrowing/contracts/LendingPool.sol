// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LendingPool {
    address public admin;
    uint256 public serviceFee;
    uint256 public serviceFeeBalance;

    IPriceOracle public priceOracle;
    ICollateralManager public collateralManager;
    IBorrower public borrower;
    IInterestRate public interestRate;

    struct LenderAsset {
        uint256 amount;
        uint256 liquidityIndex;
    }

    mapping(address => uint256) public assetBalances;
    mapping(address => mapping(address => LenderAsset)) public lenderAssets;
    mapping(address => uint256) public totalSupplied;
    mapping(address => uint256) public totalBorrowed;

    event AssetDeposit(
        address indexed lender,
        address tokenAddress,
        uint256 amount
    );
    event AssetWithdraw(
        address indexed lender,
        address tokenAddress,
        uint256 amount
    );
    event LoanTransferred(
        address indexed tokenAddress,
        address indexed user,
        uint256 amount
    );
    event ServiceFeeSet(uint256 serviceFeeBalance);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAuthorizedContracts() {
        require(
            msg.sender == address(borrower) ||
            msg.sender == address(collateralManager) ||
            msg.sender == address(this),
            "Only authorized contracts can call this function"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setContractAddresses(
        address _priceOracle,
        address _collateralManager,
        address _borrower,
        address _interestRate
    ) external onlyAdmin {
        priceOracle = IPriceOracle(_priceOracle);
        collateralManager = ICollateralManager(_collateralManager);
        borrower = IBorrower(_borrower);
        interestRate = IInterestRate(_interestRate);
    }

    function getAllowedTokens() public view returns (address[] memory) {
        return collateralManager.getAllowedTokens();
    }

    function isTokenAllowed(address tokenAddress) public view returns (bool) {
        return collateralManager.isTokenAllowed(tokenAddress);
    }

    function setServiceFee(uint256 _serviceFee) external onlyAdmin {
        serviceFee = _serviceFee;
        emit ServiceFeeSet(serviceFee);
    }

    function depositAsset(address tokenAddress, uint256 amount) external payable{
        require(amount > 0, "The amount must be greater than zero");
        require(
            isTokenAllowed(tokenAddress),
            "Token is not allowed for deposit"
        );
        require(msg.value == serviceFee, "Incorrect service fee amount");
        
        (bool feeSuccess, ) = address(this).call{value: serviceFee}("");
        require(feeSuccess, "Transfer of service fee failed");
        
        LenderAsset storage lenderAsset = lenderAssets[msg.sender][
            tokenAddress
        ];

        (uint256 liquidityIndex, , , ) = interestRate.getReserveData(
            tokenAddress
        );

        if (lenderAsset.amount > 0) {
            lenderAsset.amount =
                (lenderAsset.amount * liquidityIndex) /
                lenderAsset.liquidityIndex;
        }

        lenderAsset.amount += amount;
        lenderAsset.liquidityIndex = liquidityIndex;

        assetBalances[tokenAddress] += amount;
        totalSupplied[tokenAddress] += amount;

        
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);

        interestRate.updateInterestRates(tokenAddress);

        emit AssetDeposit(msg.sender, tokenAddress, amount);
    }

    function withDraw(address tokenAddress, uint256 amount) external payable{
        require(amount > 0, "The withdrawal amount must be greater than zero");
        require(
            isTokenAllowed(tokenAddress),
            "Token is not allowed for withdrawal"
        );
        require(msg.value == serviceFee, "Incorrect service fee amount");

        LenderAsset storage lenderAsset = lenderAssets[msg.sender][
            tokenAddress
        ];
        require(lenderAsset.amount > 0, "Insufficient balance");

        (uint256 totalBalance, uint256 currentLiquidityIndex) = getTotalBalance(
            tokenAddress
        );
        lenderAsset.amount = totalBalance;

        require(totalBalance >= amount, "Insufficient liquidity");

        lenderAsset.amount -= amount;
        lenderAsset.liquidityIndex = currentLiquidityIndex;

        assetBalances[tokenAddress] -= amount;
        totalSupplied[tokenAddress] -= amount;

        (bool feeSuccess, ) = address(this).call{value: serviceFee}("");
        require(feeSuccess, "Transfer of service fee failed");
        //updateServiceFee(serviceFee);

        IERC20(tokenAddress).transfer(msg.sender, amount);

        interestRate.updateInterestRates(tokenAddress);

        emit AssetWithdraw(msg.sender, tokenAddress, amount);
    }

    function getDepositAPY(
        address tokenAddress
    ) external view returns (uint256) {
        uint256 depositAPY = interestRate.calculateDepositAPY(tokenAddress);
        return depositAPY;
    }

    function getTotalBalance(
        address tokenAddress
    ) public view returns (uint256, uint256) {
        LenderAsset storage lenderAsset = lenderAssets[msg.sender][
            tokenAddress
        ];
        (uint256 currentLiquidityIndex, , , ) = interestRate.getReserveData(
            tokenAddress
        );

        uint256 totalBalance = (lenderAsset.amount * currentLiquidityIndex) /
            lenderAsset.liquidityIndex;

        return (totalBalance, currentLiquidityIndex);
    }

    function transferLoan(
        address tokenAddress,
        address user,
        uint256 amount
    ) external onlyAuthorizedContracts {
        require(
            assetBalances[tokenAddress] >= amount,
            "Insufficient balance in lending pool"
        );

        assetBalances[tokenAddress] -= amount;
        totalBorrowed[tokenAddress] += amount;

        IERC20(tokenAddress).transfer(user, amount);
        emit LoanTransferred(tokenAddress, user, amount);
    }

    function transferExcessAmount(address tokenAddress, address user, uint256 amount) external onlyAuthorizedContracts {
        IERC20(tokenAddress).transfer(user, amount);
    } 

    function getCurrentUtilizationRate(
        address tokenAddress
    ) public view returns (uint256) {
        require(totalSupplied[tokenAddress] > 0, "No supply for the token");

        return
            (totalBorrowed[tokenAddress] * 10000) / totalSupplied[tokenAddress];
    }

    function withdrawServiceFee(uint256 amount) external onlyAdmin {
        require(
            serviceFeeBalance >= amount,
            "Insufficient service fee balance"
        );

        serviceFeeBalance -= amount;
        payable(admin).transfer(amount);
    }

    // function updateServiceFee(uint256 amount) public onlyAuthorizedContracts {
    //     serviceFeeBalance += amount;
    //     emit ServiceFeeUpdated(serviceFeeBalance);
    // }

    receive() external payable {
        serviceFeeBalance += msg.value;
    }

    // fallback() external payable {
    //     serviceFeeBalance += msg.value;
    // }
}
