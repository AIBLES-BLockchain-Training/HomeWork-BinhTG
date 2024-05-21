// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract UserManagement {

    event UserAdded(address indexed userAddress, string name, string role);
    event UserRoleUpdated(address indexed userAddress, string newRole);

    struct User {
        string name;
        string role;
    }

    mapping(address => User) public user;

    address internal admin;
    constructor() {
        admin = msg.sender;
    }
    modifier onlyAdmin {
        require(msg.sender == admin, "Only admin can  this function");
        _;
    }

    function userExists(address userAddress) public view returns (bool) {
        return bytes(user[userAddress].name).length > 0;
    }
    function addUser(address userAddress, string memory name, string memory role) public onlyAdmin{
        require(!userExists(userAddress), "User already exists!");
        user[userAddress] = User(name, role);

        emit UserAdded(userAddress, name, role);
    }

    function updateUserRole(address userAddress, string memory newRole) public onlyAdmin {
        require(userExists(userAddress), "User does not exist!");
        user[userAddress].role = newRole;

        emit UserRoleUpdated(userAddress, newRole);
    }

    function getUser(address userAddress) public view returns (User memory) {
        require(userExists(userAddress), "User does not exist!");

        return user[userAddress];
    }
}


contract FinancialOporations is UserManagement{

    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;

        emit Deposit(msg.sender, msg.value);
    }

    function withDraw(uint256 amount) public {

        require(balances[msg.sender] >= amount, "Insufficient funds");
        
        balances[msg.sender] -= amount;

        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }
}

contract LoanSystem is FinancialOporations {
    event LoanRequested(address indexed borrower, uint256 amount, uint256 duration, uint256 interestRate);
    event LoanApproved(address indexed borrower);
    event LoanDeclined(address indexed borrower);
    event LoanRepaid(address indexed borrower, uint256 amount);

    struct LoanRequest {
        uint256 amount;
        uint256 duration;
        uint256 interestRate; 
        bool approved; 
        uint256 timestamp;
    }

    mapping(address => LoanRequest) public loanRQ;

    function requestLoan(uint256 amount, uint256 duration, uint256 interestRate) public {
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
        emit LoanRequested(msg.sender, amount, duration, interestRate);
    }

    function approveLoan(address borrower) public onlyAdmin {
        require(loanRQ[borrower].approved == false, "Loan has been approved");

        loanRQ[borrower].approved = true;

        emit LoanApproved(borrower);
    }

    function declineLoan(address borrower) public onlyAdmin {
        require(loanRQ[borrower].approved == false, "Loan has been approved");

        loanRQ[borrower].approved = false;

        emit LoanDeclined(borrower);
    }

    
    function totalAmount(uint256 amount, uint256 duration, uint256 interestRate) public pure returns(uint256) {
        uint256 interest = amount * interestRate * duration / 10000;
        return amount + interest;
    }

    function repayLoan() public payable {
        require(loanRQ[msg.sender].approved == true, "Loan has not been approved");
        uint256 calculate = totalAmount(loanRQ[msg.sender].amount, loanRQ[msg.sender].interestRate, loanRQ[msg.sender].duration);       
        
        if(msg.value == calculate){
            loanRQ[msg.sender].amount = 0;
            loanRQ[msg.sender].duration = 0;
            loanRQ[msg.sender].interestRate = 0;
            loanRQ[msg.sender].approved = false;
            loanRQ[msg.sender].timestamp = 0;
            emit LoanRepaid(msg.sender, msg.value);
        }
        else{
            revert("Insufficient repayment amount");
        }
    }
}
