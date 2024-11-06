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

    event ContractAddressesUpdated(
        address indexed priceOracle,
        address indexed borrower,
        address indexed lendingPool
    );
    event AllowedTokensUpdated(address[] newTokens);
    event CollateralAdded(
        address indexed user,
        address indexed collateralAddress,
        uint256 amount
    );
    event CollateralRemoved(
        address indexed user,
        address indexed collateralAddress,
        uint256 amount
    );
    event CollateralLocked(
        address indexed user,
        address indexed collateralAddress,
        bool isLocked
    );
    event CollateralUnlocked(
        address indexed user,
        address indexed collateralAddress,
        bool isLocked
    );
    event ServiceFeeSet(uint256 serviceFee);
    event CollateralTransferred(
        address indexed borrower,
        address indexed collateralAddress,
        uint256 amount
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyAuthorizeContract() {
        require(
            msg.sender == address(borrower),
            "Only authorized contracts can call this function"
        );
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

        emit ContractAddressesUpdated(_priceOracle, _borrower, _lendingPool);
    }

    function setAllowedToken(address[] memory tokens) public onlyAdmin {
        require(
            tokens.length <= 5 && tokens.length > 0,
            "You can only set up tp 5 allowed tokens"
        );

        for (uint256 i = 0; i < allowedTokens.length; i++) {
            isTokenAllowed[tokens[i]] = false;
        }

        allowedTokens = tokens;
        for (uint256 i = 0; i < tokens.length; i++) {
            isTokenAllowed[tokens[i]] = true;
        }

        emit AllowedTokensUpdated(tokens);
    }

    function setServiceFee(uint256 _serviceFee) external onlyAdmin {
        serviceFee = _serviceFee;
        emit ServiceFeeSet(serviceFee);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }

    function getAllowedTokens() external view returns (address[] memory) {
        return allowedTokens;
    }

    function getUserCollateralAddresses(
        address user
    ) external view returns (address[] memory) {
        return userCollateralAddresses[user];
    }

    function addCollateral(
        address collateralAddress,
        uint256 amount
    ) external payable {
        Collateral storage collateral = userCollaterals[msg.sender][
            collateralAddress
        ];

        require(collateralAddress != address(0), "Invalid collateralAddress");
        require(amount > 0, "Token amount must be greater than zero");
        require(isTokenAllowed[collateralAddress], "Token is not allowed");
        require(!collateral.isLocked, "Collateral is currently locked");
        require(msg.value == serviceFee, "Incorrect service fee amount");

        if (collateral.amount == 0) {
            userCollateralAddresses[msg.sender].push(collateralAddress);
        }

        collateral.amount += amount;

        (bool feeSuccess, ) = address(lendingPool).call{value: serviceFee}("");
        require(feeSuccess, "Transfer of service fee failed");

        IERC20(collateralAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        emit CollateralAdded(msg.sender, collateralAddress, amount);
    }

    function removeCollateral(
        address collateralAddress,
        uint256 amount
    ) external payable {
        Collateral storage collateral = userCollaterals[msg.sender][
            collateralAddress
        ];

        require(!collateral.isLocked, "Collateral is currently locked");
        require(collateral.amount >= amount, "Not enough collateral to remove");
        require(msg.value == serviceFee, "Incorrect service fee amount");

        collateral.amount -= amount;

        IERC20(collateralAddress).transfer(msg.sender, amount);

        (bool feeSuccess, ) = address(lendingPool).call{value: serviceFee}("");
        require(feeSuccess, "Transfer of service fee failed");

        emit CollateralRemoved(msg.sender, collateralAddress, amount);
    }

    function lockCollaterals(
        address user,
        address[] calldata collateralAddresses
    ) public onlyAuthorizeContract {
        for (uint256 i = 0; i < collateralAddresses.length; i++) {
            address collateralAddress = collateralAddresses[i];
            Collateral storage collateral = userCollaterals[user][
                collateralAddress
            ];
            collateral.isLocked = true;

            emit CollateralLocked(user, collateralAddress, true);
        }
    }

    function unlockCollaterals(
        address user,
        address[] calldata collateralAddresses
    ) public onlyAuthorizeContract {
        for (uint256 i = 0; i < collateralAddresses.length; i++) {
            address collateralAddress = collateralAddresses[i];
            Collateral storage collateral = userCollaterals[user][
                collateralAddress
            ];
            collateral.isLocked = false;

            emit CollateralUnlocked(user, collateralAddress, false);
        }
    }

    function isCollateralLocked(
        address user,
        address[] calldata collaterals
    ) external view returns (bool) {
        for (uint256 i = 0; i < collaterals.length; i++) {
            if (userCollaterals[user][collaterals[i]].isLocked == true) {
                return true;
            }
        }
        return false;
    }

    function getCollateralAmount(
        address user,
        address collateralAddress
    ) external view returns (uint256) {
        return userCollaterals[user][collateralAddress].amount;
    }

    function getCollateralValueForTokens(
        address user,
        address[] memory tokenAddresses
    ) public view returns (uint256) {
        uint256 totalValue = 0;

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];
            if (isTokenAllowed[tokenAddress]) {
                uint256 assetPrice = priceOracle.getAssetPrice(tokenAddress);
                uint256 collateralValue = (assetPrice *
                    userCollaterals[user][tokenAddress].amount) / 1e18;
                totalValue += collateralValue;
            }
        }
        return totalValue;
    }

    function transferCollateral(
        address collateralAddress,
        uint256 amount
    ) external onlyAuthorizeContract {
        IERC20(collateralAddress).transfer(address(lendingPool), amount);

        emit CollateralTransferred(msg.sender, collateralAddress, amount);
    }
}
