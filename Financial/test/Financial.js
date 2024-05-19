const {
    time,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat", "ethers")
  

    describe("UserManagement", function(){
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const UserManagement = await ethers.getContractFactory("UserManagement");
            const userManagement = await UserManagement.deploy();

            return {userManagement, owner, user1, user2};
        }

        it("Should not allow a non-admin to add a user", async function () {
            const {userManagement, owner, user1 } = await loadFixture(setup);

            await expect(
              userManagement.connect(user1).addUser(user1.address, "Binh", "user")
            ).to.be.revertedWith("Only admin can  this function");
          });

        it("Should allow admin to add a user", async function(){
            const {userManagement, owner, user1 } = await loadFixture(setup);

            await userManagement.connect(owner).addUser(user1.address, "Binh", "user");

            const user = await userManagement.user(user1.address);

            expect(user.name).to.equal("Binh");
            expect(user.role).to.equal("user");
        });

        it("Should not allow adding a user if the user already exists", async function(){
            const {userManagement, owner, user1 } = await loadFixture(setup);
            await userManagement.connect(owner).addUser(user1.address, "Binh", "user");

            await expect(userManagement.connect(owner).addUser(user1.address, "Binh", "user"))
            .to.be.revertedWith("User already exists!");
        });

        it("Should allow admin to update user role", async function(){
            const {userManagement, owner, user1 } = await loadFixture(setup);
        
            await userManagement.connect(owner).addUser(user1.address, "Binh", "user");
        
            const newRole = "Leader";
            await userManagement.connect(owner).updateUserRole(user1.address, newRole);
        
            const updatedUser = await userManagement.user(user1.address);
        
            expect(updatedUser.role).to.equal(newRole);
        });
        
        it("Should not allow a non-admin to update user role", async function () {
            const { userManagement, owner, user1, user2 } = await setup();
        
            const newRole = "Admin";
            await expect(userManagement.connect(user1).updateUserRole(user2.address, newRole))
            .to.be.revertedWith("Only admin can  this function");
          });

        it("Should revert if user does not exist when updating role", async function () {
            const { userManagement, owner, user2 } = await setup();
        
            const newRole = "Admin";
            await expect(userManagement.connect(owner).updateUserRole(user2.address, newRole))
            .to.be.revertedWith("User does not exist!");
          });

        it("Should allow admin to get user", async function(){
            const {userManagement, owner, user1 } = await loadFixture(setup);

            await userManagement.connect(owner).addUser(user1.address, "Binh", "user");

            const user = await userManagement.connect(owner).getUser(user1.address);

            expect(user.name).to.equal("Binh");
            expect(user.role).to.equal('user');

        });

        it("Should revert if user does not exist", async function(){
            const {userManagement, owner, user2 } = await loadFixture(setup);

            await expect(userManagement.connect(owner).getUser(user2.address))
            .to.be.revertedWith("User does not exist!");

        });
    });


    describe("FinancialOporations", function(){
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const FinancialOporations = await ethers.getContractFactory("LoanSystem");
            const financialOporations = await FinancialOporations.deploy();
            //console.log(financialOporations);

            return {financialOporations, owner, user1, user2};
        }

        it("Should allow user to deposit funds and update balance ", async function(){
            const {financialOporations, user1} = await loadFixture(setup);
            await financialOporations.connect(user1).deposit({value: 10000});

            const user1Value = await financialOporations.balances(user1.address);

            expect(user1Value).to.equal(10000);
        });
        
        // it("Should allow user to withdraw funds and update balance", async function(){
        //      const { financialOporations, user1 } = await loadFixture(setup);
        //     await financialOporations.connect(user1).deposit({value: 10000});

        //     const initialUserBalance = await ethers.provider.getBalance(user1.address);

        //     const estimateGas = await financialOporations.connect(user1).estimateGas.withDraw(100);

        //     const transaction = await financialOporations.connect(user1).withDraw(100);
        //     await transaction.wait();

        //     const FinalUserBalance = await ethers.provider.getBalance(user1.address);

        //     const expectedFinalBalance = initialUserBalance - estimateGas + 100;

        //     expect(FinalUserBalance).to.equal(expectedFinalBalance);
        // });    

        
        it("should revert if user tries to withdraw more than their balance", async function () {
            const {financialOporations, user1} = await loadFixture(setup);

            const initialBalance = 1000;
            const amountToWithdraw = 1500;
        
            await financialOporations.deposit({ value: initialBalance });
        
            await expect(financialOporations.connect(user1).withDraw(amountToWithdraw))
              .to.be.revertedWith("Insufficient funds");
        });      
    });


    describe("LoanSystem", function(){
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const LoanSystem = await ethers.getContractFactory("LoanSystem");
            const loanSystem = await LoanSystem.deploy();

            return {loanSystem, owner, user1, user2};
        }
        it("Should request a loan", async function() {
            const {loanSystem, user1} = await loadFixture(setup);

            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
        
            const loanRequest = await loanSystem.loanRQ(user1.address);
        
            expect(loanRequest.amount).to.equal(1000);
            expect(loanRequest.duration).to.equal(12);
            expect(loanRequest.interestRate).to.equal(5);
            expect(loanRequest.approved).to.equal(false);
        });

        it("Should fail if loan amount, loanduration, loaninterest is zero", async function() {
            const { loanSystem, user1 } = await loadFixture(setup);
        
            await expect(loanSystem.connect(user1).requestLoan(0, 12, 5))
            .to.be.revertedWith("The loan amount must be greater than 0");

            await expect(loanSystem.connect(user1).requestLoan(1000, 0, 5))
            .to.be.revertedWith("Loan term must be greater than 0");

            await expect(loanSystem.connect(user1).requestLoan(1000, 12, 0))
            .to.be.revertedWith("The loan interest rate must be greater than 0");

        });

        it("Should approve loan by admin", async function() {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
        
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
            await loanSystem.connect(owner).approveLoan(user1.address);
        
            const loanRequest = await loanSystem.loanRQ(user1.address);
            expect(loanRequest.approved).to.equal(true);
        });

        it("The approver is not an admin", async function() {
            const { loanSystem, owner, user1, user2 } = await loadFixture(setup);
        
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
        
            await expect(loanSystem.connect(user2).approveLoan(user1.address))
            .to.be.revertedWith("Only admin can  this function")
        });

        it("Should decline loan by admin", async function() {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
        
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
            await loanSystem.connect(owner).declineLoan(user1.address);
        
            const loanRequest = await loanSystem.loanRQ(user1.address);
            expect(loanRequest.approved).to.equal(false);
        });

        it("The decliner is not an admin", async function() {
            const { loanSystem, owner, user1, user2 } = await loadFixture(setup);
        
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
        
            await expect(loanSystem.connect(user2).declineLoan(user1.address))
            .to.be.revertedWith("Only admin can  this function")
        });

        it("Should fail to approve loan and decline loan if already approved", async function() {
            const { loanSystem, owner, user1, user2 } = await loadFixture(setup);
        
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
            await loanSystem.connect(user2).requestLoan(2000, 6, 2);

            await loanSystem.connect(owner).approveLoan(user1.address);
            await loanSystem.connect(owner).approveLoan(user2.address);

            await expect(loanSystem.connect(owner).approveLoan(user1.address))
            .to.be.revertedWith("Loan has been approved");

            await expect(loanSystem.connect(owner).declineLoan(user2.address))
            .to.be.revertedWith("Loan has been approved");
          });

        it("Should calculate total amount correctly", async function () {
            const { loanSystem, owner, user1, user2 } = await loadFixture(setup);

            const amount = 1000;
            const duration = 12; 
            const interestRate = 5; 
            const totalAmount = await loanSystem.totalAmount(amount, duration, interestRate);

            const expectedTotal = amount +  amount * interestRate * duration/10000
        
            expect(totalAmount).to.equal(expectedTotal);
        });

        // it("should repay loan when the exact amount is paid", async function() {
        //     const { loanSystem, owner, user1, user2 } = await loadFixture(setup);

        //     await loanSystem.connect(user1).requestLoan(1000, 12, 500);
        
        //     await loanSystem.connect(owner).approveLoan(user1.address);
        
        //     const initialBalance = await ethers.provider.getBalance(user1.address);

        //     await loanSystem.connect(user1).repayLoan({ value: await loanSystem.totalAmount(1000, 500, 12) });
            
        //     const finalBalance = await ethers.provider.getBalance(user1.address);
        
        //     expect(await loanSystem.loanRQ(user1.address)).to.equal({
        //       amount: 0,
        //       duration: 0,
        //       interestRate: 0,
        //       approved: false,
        //       timestamp: 0
        //     });
        //     expect(finalBalance).to.equal(initialBalance.sub(await loanSystem.totalAmount(1000, 500, 12)));
        //   });
        it("Should not allow repayment if the loan is not approved", async function() {
            const { loanSystem, user1 } = await loadFixture(setup);
    
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);

            const repaymentAmount = await loanSystem.totalAmount(1000, 5, 12);

            await expect(loanSystem.connect(user1).repayLoan({ value: repaymentAmount }))
            .to.be.revertedWith("Loan has not been approved");
        });
    
        it("Should not allow repayment if the amount is insufficient", async function() {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
    
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
            await loanSystem.connect(owner).approveLoan(user1.address);
    
            const totalAmount = await loanSystem.totalAmount(1000, 12, 5);
            const repaymentAmount = totalAmount - BigInt(1);    
            await expect(loanSystem.connect(user1).repayLoan({ value: repaymentAmount }))
            .to.be.revertedWith("Insufficient repayment amount");
        });          
    });

    describe("UserManagement Events", function() {
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const UserManagement = await ethers.getContractFactory("LoanSystem");
            const userManagement = await UserManagement.deploy();

            return {userManagement, owner, user1, user2};
        }
        it("Should emit UserAdded event", async function(){
            const { userManagement, owner, user1 } = await loadFixture(setup);

            await expect(userManagement.connect(owner).addUser(user1.address, 'A', "user"))
            .to.emit(userManagement, "UserAdded")
            .withArgs(user1.address, 'A', "user");
        });
        it("Should emit UserRoleUpdated event", async function(){
            const { userManagement, owner, user1 } = await loadFixture(setup);

            await userManagement.connect(owner).addUser(user1.address, 'A', "user");

            await expect(userManagement.connect(owner).updateUserRole(user1.address, "leader"))
            .to.emit(userManagement, "UserRoleUpdated")
            .withArgs(user1.address, "leader");
        });
    });

    describe("FinancialOperations Events", function() {
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const FinancialOporations = await ethers.getContractFactory("LoanSystem");
            const financialOporations = await FinancialOporations.deploy();

            return {financialOporations, owner, user1, user2};
        }
        it("Should emit Deposit event", async function(){
            const { financialOporations, owner, user1 } = await loadFixture(setup);

            await expect(financialOporations.connect(user1).deposit({value: 1000}))
            .to.emit(financialOporations, "Deposit")
            .withArgs(user1.address, 1000);

        });
        it("Should emit Withdrawal event", async function(){
            const { financialOporations, owner, user1 } = await loadFixture(setup);

            await financialOporations.connect(user1).deposit({value: 1000})

            await expect(financialOporations.connect(user1).withDraw(100))
            .to.emit(financialOporations, "Withdrawal")
            .withArgs(user1.address, 100);

        });
    });

    describe("LoanSystem Events", function() {
        async function setup(){
            const [owner, user1, user2] = await ethers.getSigners();

            const LoanSystem = await ethers.getContractFactory("LoanSystem");
            const loanSystem = await LoanSystem.deploy();

            return {loanSystem, owner, user1, user2};
        }

        it("Should emit LoanRequested event", async function () {
            const { loanSystem, owner, user1 } = await loadFixture(setup);

            const amount = 1000;
            const duration = 12;
            const interestRate = 5;
    
            await expect(loanSystem.connect(user1).requestLoan(amount, duration, interestRate))
            .to.emit(loanSystem, "LoanRequested")
            .withArgs(user1.address, amount, duration, interestRate);
        });

        it("Should emit LoanApproved event", async function () {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);

            await expect(loanSystem.connect(owner).approveLoan(user1.address))
            .to.emit(loanSystem, "LoanApproved")
            .withArgs(user1.address);
        });

        it("Should emit LoanDeclined event", async function () {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);

            await expect(loanSystem.connect(owner).declineLoan(user1.address))
            .to.emit(loanSystem, "LoanDeclined")
            .withArgs(user1.address);
        });

        it("Should emit LoanRepaid", async function () {
            const { loanSystem, owner, user1 } = await loadFixture(setup);
    
            await loanSystem.connect(user1).requestLoan(1000, 12, 5);
            loanSystem.connect(owner).approveLoan(user1.address);
    
            const repaymentAmount = await loanSystem.totalAmount(1000, 5, 12);
            await expect(loanSystem.connect(user1).repayLoan({ value: repaymentAmount }))
                .to.emit(loanSystem, "LoanRepaid")
                .withArgs(user1.address, repaymentAmount);
        });
    });