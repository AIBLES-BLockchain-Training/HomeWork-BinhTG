// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract UserManagement {

    struct User {
        string name;
        string role;
    }

    mapping(address => User) private user;

    address internal admin;
    constructor() {
        admin = msg.sender;
    }
    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can  this function");
        _;
    }

    function userExists() public view returns (bool) {
        return bytes(user[msg.sender].name).length > 0;
    }
    function addUser(string memory name, string memory role) public onlyAdmin{
        require(!userExists(), "User already exists!");

        user[msg.sender] = User(name, role);
    }

    function getUser() public view returns (User memory) {
        require(userExists(), "User does not exist!");

        return user[msg.sender];
    }
}


contract FinancialOporations is UserManagement{

    mapping(address => uint256) public balances;

//Handling deposits
    function deposit() public payable  {
        balances[msg.sender] += msg.value;
    }

//Withdrawals
    function withDraw (uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient funds");
        
        balances[msg.sender] -= amount;

        payable(msg.sender).transfer(amount);
    }
}

contract LoanSystem is FinancialOporations{

    struct LoanRequest{
        uint256 amount;
        uint256 duration;
        uint256 interestRate; 
        bool approved; 
        uint256 timestamp;
    }

    mapping(address => LoanRequest) public loanRQ;

//Define terms for loan requests
    function requestLoan(uint256 amount, uint256 duration, uint256 interestRate) public{
        require(amount > 0, "The loan amount must be greater than 0");
        require(duration  > 0, "Loan term must be greater than 0");
        require(interestRate > 0, "The loan interest rate must be greater than 0");
        
        loanRQ[msg.sender] = LoanRequest({
            amount: amount,
            duration: duration,
            interestRate: interestRate,
            approved: false,
            timestamp: block.timestamp
        }); 
    }

//Approvals by Admin
    function approveLoan(address borrower) public onlyAdmin {
        require(loanRQ[borrower].approved == false, "Loan has been approved");

        loanRQ[borrower].approved = true;
    }
    function declineLoan(address borrower) public onlyAdmin {
        require(loanRQ[borrower].approved == false, "Loan has been approved");

        loanRQ[borrower].approved = false;
    }

//Repayments
    function TotalAmount (uint256 amount, uint256 duration, uint256 interestRate) public pure returns(uint256){
        uint256 interest = amount * interestRate/10000 * duration ;
        return amount + interest;
    }

    function repayLoan(address payable lender) public payable {
        require(loanRQ[msg.sender].approved == true, "Loan has not been approved");
        uint256 caculate = TotalAmount(loanRQ[msg.sender].amount, loanRQ[msg.sender].interestRate , loanRQ[msg.sender].duration);
        
        require(msg.value >= caculate, "Payment amount is not enough");

        lender.transfer(caculate);

        loanRQ[msg.sender].approved = false;

    }

}
