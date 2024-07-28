// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockFailingContract {
    // Hàm fallback sẽ revert khi nhận tiền
    // fallback() external payable {
    //     revert("Transfer of service fee123 failed");
    // }
}