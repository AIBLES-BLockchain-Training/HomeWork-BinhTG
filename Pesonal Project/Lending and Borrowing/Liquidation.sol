// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/automation/KeeperCompatible.sol";
import "./LendingPool.sol";

contract Liquidation is KeeperCompatibleInterface {
    address public admin;
    // address public chainlinkKeepersAddress;

    ICollateralManager public collateralManager;
    IBorrower public borrower;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // modifier onlyChainlinkKeepers() {
    //     require(msg.sender == chainlinkKeepersAddress, "Only Chainlink Keepers can call this function");
    //     _;
    // }

    function setContractAddresses(
        address _collateralManager,
        address _borrower
    ) external onlyAdmin {
        collateralManager = ICollateralManager(_collateralManager);
        borrower = IBorrower(_borrower);
    }

    // function setChainLinkKeepersAddresses(
    //     address _chainlinkKeepersAddress
    // ) external onlyAdmin {
    //     chainlinkKeepersAddress = _chainlinkKeepersAddress;
    // }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256[] memory allLoans = borrower.getAllLoanIds();
        uint256 maxLoansToCheck = 5;
        uint256[] memory unsafeLoans = new uint256[](maxLoansToCheck);
        uint256 count = 0;

        for (
            uint256 i = 0;
            i < allLoans.length && count < maxLoansToCheck;
            i++
        ) {
            uint256 loanId = allLoans[i];
            uint256 healthFactor = borrower.checkHealthFactor(loanId);

            if (healthFactor <= 1) {
                unsafeLoans[count] = loanId;
                count++;
            }
        }

        if (count > 0) {
            upkeepNeeded = true;
            performData = abi.encode(unsafeLoans, count);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory unsafeLoans, uint256 count) = abi.decode(
            performData,
            (uint256[], uint256)
        );

        for (uint256 i = 0; i < count; i++) {
            uint256 loanId = unsafeLoans[i];
            borrower.liquidateLoan(loanId);
        }
    }
}
