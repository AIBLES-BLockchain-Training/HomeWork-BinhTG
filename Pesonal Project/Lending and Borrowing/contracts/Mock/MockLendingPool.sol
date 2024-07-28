// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockLendingPool {
    address public admin;
    uint256 public serviceFee;
    address public lendingPool;

    constructor() {
        admin = msg.sender;
    }

    // function transferLoan(
    //     address tokenAddress,
    //     address user,
    //     uint256 amount
    // ) external {
    //     require(
    //         assetBalances[tokenAddress] >= amount,
    //         "Insufficient balance in lending pool"
    //     );

    //     assetBalances[tokenAddress] -= amount;
    //     totalBorrowed[tokenAddress] += amount;

    //     IERC20(tokenAddress).transfer(user, amount);
    // }
}