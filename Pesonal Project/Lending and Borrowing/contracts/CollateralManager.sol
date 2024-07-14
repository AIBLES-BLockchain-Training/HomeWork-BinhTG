// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CollateralManager {

    struct Collateral {
        uint256 amount;
        bool isLocked;
    }

    IPriceOracle public priceOracle;
    IBorrower public borrower;
    ILendingPool public lendingPool;

    address public admin;
    address[] public allowedTokens;
    uint256 public serviceFee;

    mapping(address => mapping(address => Collateral)) public userCollaterals;
    mapping(address => address[]) public userCollateralAddresses; 
    mapping(address => bool) public isTokenAllowed; 

    event CollateralAdded(address indexed user, address indexed collateralAddress, uint256 amount);
    event CollateralRemoved(address indexed user, address indexed collateralAddress, uint256 amount);
    event LoanLiquidated(uint256 indexed loanId, address borrower);
    event CollateralLocked(address indexed user, address indexed collateralAddress, bool isLocked);
    event CollateralUnlocked(address indexed user, address indexed collateralAddress, bool isLocked);
    event ServiceFeeSet(uint256 serviceFee);

    modifier onlyAdmin() { 
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }    

    modifier onlyAuthorizeContract {
        require(msg.sender == address(borrower) || msg.sender == address(this), "Only authorize contract can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setContractAddresses(
        address _priceOracle,
        address _borrower,
        address _lendingPool
    ) external onlyAdmin {
        priceOracle = IPriceOracle(_priceOracle);
        borrower = IBorrower(_borrower);
        lendingPool = ILendingPool(_lendingPool);
    }

    function setAllowedToken(address[] memory tokens) public onlyAdmin {
        require(tokens.length <= 5, "You can only set up tp 5 allowed tokens");

        for(uint256 i = 0; i < allowedTokens.length; i++) {
            isTokenAllowed[tokens[i]] = false;
        }

        allowedTokens = tokens;
        for(uint256 i = 0; i < tokens.length; i++) {
            isTokenAllowed[tokens[i]] = true;
        }
    }

    function getAllowedTokens() external view returns (address[] memory) {
        return allowedTokens;
    }

    function setServiceFee(uint256 _serviceFee) external onlyAdmin {  
        serviceFee = _serviceFee;
        emit ServiceFeeSet(serviceFee);
    }

    function addCollateral(address collateralAddress, uint256 amount) external {
        Collateral storage collateral = userCollaterals[msg.sender][collateralAddress];

        require(collateralAddress != address(0), "Invalid collateralAddress");
        require(amount > 0, "Token amount must be greater than zero") ;
        require(isTokenAllowed[collateralAddress], "Token is not allowed");
        require(!collateral.isLocked, "Collateral is currently locked");

        if(collateral.amount == 0) {
            userCollateralAddresses[msg.sender].push(collateralAddress);
        }
        collateral.amount += amount;

        IERC20(collateralAddress).transferFrom(msg.sender, address(this), amount);

        payable(address(lendingPool)).transfer(serviceFee);
        lendingPool.updateServiceFeeETH(serviceFee);

        emit CollateralAdded(msg.sender, collateralAddress, amount);
    }

    function removeCollateral(address collateralAddress, uint256 amount) external {
        Collateral storage collateral = userCollaterals[msg.sender][collateralAddress];
        
        require(!collateral.isLocked, "Collateral is currently locked");
        require(collateral.amount >= amount, "Not enough collateral to remove");

        collateral.amount -= amount;

        IERC20(collateralAddress).transfer(msg.sender, amount);

        payable(address(lendingPool)).transfer(serviceFee);
        lendingPool.updateServiceFeeETH(serviceFee);

        emit CollateralRemoved(msg.sender, collateralAddress, amount);
    }

    function lockCollaterals(address user, address[] calldata collateralAddresses) public onlyAuthorizeContract {
        for (uint256 i = 0; i < collateralAddresses.length; i++) {
            address collateralAddress = collateralAddresses[i];
            Collateral storage collateral = userCollaterals[user][collateralAddress];
            require(collateral.amount > 0, "Collateral amount must be greater than zero");

            collateral.isLocked = true;

            emit CollateralLocked(user, collateralAddress, true);
        }
    }

    function unlockCollaterals(address user, address[] calldata collateralAddresses) public onlyAuthorizeContract {
        for (uint256 i = 0; i < collateralAddresses.length; i++) {
            address collateralAddress = collateralAddresses[i];
            Collateral storage collateral = userCollaterals[user][collateralAddress];
            require(collateral.amount > 0, "Collateral amount must be greater than zero");

            collateral.isLocked = false;

            emit CollateralUnlocked(user, collateralAddress, false);
        }
    }
    function getCollateralAmount(address user, address collateralAddress) external view returns (uint256) {
        return userCollaterals[user][collateralAddress].amount;
    }

    function getCollateralValueForTokens(address user, address[] memory tokenAddresses) external view returns (uint256) {
        uint256 totalValue = 0;

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];
            if (isTokenAllowed[tokenAddress]) {
                uint256 assetPrice = priceOracle.getAssetPrice(tokenAddress);
                uint256 collateralValue = (assetPrice * userCollaterals[user][tokenAddress].amount) / 1e18;
                totalValue += collateralValue;
            }
        }
        return totalValue;
    }
}