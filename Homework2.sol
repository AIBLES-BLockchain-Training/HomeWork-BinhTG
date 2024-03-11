// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract NumberManager{
    uint private totalSum;
    uint public lastAddedNumber;

    constructor(){
        totalSum = 0;
        lastAddedNumber = 0;
    }

    function addNumber(uint number) public {
        lastAddedNumber = number;
        increamentTotalSum(number);
    }

    function getTotalSum() external view returns (uint){
        return totalSum;
    }
    
    function increamentTotalSum(uint number) private {
        totalSum += number;
    }

   // function getIncreamentTotalSum(uint number) public{
   //     increamentTotalSum(number);
   //     lastAddedNumber = number;
  //}
}

