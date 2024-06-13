// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract DemoTransparent is Initializable{
    uint public value;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function initialize(address _owner, uint256 _value) external initializer {
        owner = _owner;
        value = _value;
    }

    function incrementV3() public {
        value = value + 100;
    }

    function decrementV3() public {
        value = value - 100;
    }
}

