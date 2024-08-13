import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("Borrower", function () {
  async function setup() {
    const [admin, user1, user2, user3] = await ethers.getSigners();

    const MockLendingPoolFactory = await ethers.getContractFactory(
      "MockLendingPool"
    );
    const mockLendingPool = await MockLendingPoolFactory.deploy();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = await MockTokenFactory.deploy(admin.address);

    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken.connect(admin).mint(user2.address, ethers.parseUnits("0.01", 18));
    await mockToken.connect(admin).mint(user3.address, initialSupply);


    const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracleFactory.deploy();

    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy();

    const InterestRateFactory = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRateFactory.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();

    const CollateralManagerFactory = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManagerFactory.deploy();

    await borrower.setContractAddresses(
      priceOracle.getAddress(),
      collateralManager.getAddress(),
      lendingPool.getAddress(),
      interestRate.getAddress()
    );
    await collateralManager.setContractAddresses(
      priceOracle.getAddress(),
      borrower.getAddress(),
      lendingPool.getAddress()
    );

    await lendingPool.setContractAddresses(
      priceOracle.getAddress(),
      collateralManager.getAddress(),
      borrower.getAddress(),
      interestRate.getAddress()
    );
    await interestRate.setContractAddresses(
      lendingPool.getAddress(),
      borrower.getAddress()
    );

    await collateralManager.setAllowedToken([mockToken.getAddress()]);

    // await mockToken.connect(user1).approve(lendingPool.getAddress(), initialSupply)

    return {
      collateralManager,
      lendingPool,
      mockToken,
      mockLendingPool,
      priceOracle,
      borrower,
      interestRate,
      admin,
      user1,
      user2,
      user3,
    };
  }

  it("Should set contract addresses when called by admin", async function () {
    const {
      borrower,
      collateralManager,
      priceOracle,
      lendingPool,
      interestRate,
      admin,
    } = await loadFixture(setup);

    await borrower
      .connect(admin)
      .setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        lendingPool.getAddress(),
        interestRate.getAddress()
      );

    expect(await borrower.interestRate()).to.equal(
      await interestRate.getAddress()
    );
    expect(await borrower.priceOracle()).to.equal(
      await priceOracle.getAddress()
    );
    expect(await borrower.lendingPool()).to.equal(
      await lendingPool.getAddress()
    );
    expect(await borrower.collateralManager()).to.equal(
      await collateralManager.getAddress()
    );
  });

  it("Should revert if called by non-admin", async function () {
    const {
      borrower,
      collateralManager,
      priceOracle,
      lendingPool,
      interestRate,
      user1,
    } = await loadFixture(setup);

    await expect(
      borrower
        .connect(user1)
        .setContractAddresses(
          priceOracle.getAddress(),
          collateralManager.getAddress(),
          lendingPool.getAddress(),
          interestRate.getAddress()
        )
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("should set service fee correctly", async () => {
    const { borrower, admin } = await loadFixture(setup);

    await borrower.connect(admin).setServiceFee(100);
    const serviceFee = await borrower.serviceFee();
    expect(serviceFee).to.equal(100);
  });

  it("Should revert if non-admin tries to set service fee", async function () {
    const { borrower, user1 } = await loadFixture(setup);
    const serviceFee = ethers.parseUnits("0.01", 18);

    await expect(
      borrower.connect(user1).setServiceFee(serviceFee)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("should set risk parameters correctly when called by admin", async function () {
    const { borrower, mockToken, admin } = await setup();

    const ltv = ethers.parseUnits("0.05", 4);
    const liquidationThreshold = ethers.parseUnits("0.075", 4);

    await expect(
      borrower
        .connect(admin)
        .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold)
    )
      .to.emit(borrower, "RiskParametersSet")
      .withArgs(mockToken.getAddress(), ltv, liquidationThreshold);

    const riskParams = await borrower.riskParameters(mockToken.getAddress());
    expect(riskParams.ltv).to.equal(ltv);
    expect(riskParams.liquidationThreshold).to.equal(liquidationThreshold);
  });

  it("should fail to set risk parameters if LTV is not less than liquidation threshold", async function () {
    const { borrower, mockToken, admin } = await setup();

    const ltv = ethers.parseUnits("0.08", 4);
    const liquidationThreshold = ethers.parseUnits("0.075", 4);

    await expect(
      borrower
        .connect(admin)
        .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold)
    ).to.be.revertedWith("LTV must be less than Liquidation Threshold");
  });

  it("should fail to set risk parameters if called by non-admin", async function () {
    const { borrower, mockToken, user1 } = await setup();

    const ltv = ethers.parseUnits("0.05", 4);
    const liquidationThreshold = ethers.parseUnits("0.075", 4);

    await expect(
      borrower
        .connect(user1)
        .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should create loan correctly", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const riskParams = await borrower.riskParameters(mockToken.getAddress());

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    //console.log( await collateralManager.getCollateralValueForTokens(user1.address, [collateralAddress]));

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("5", 18);
    const { variableBorrowIndex: postLoanVariableBorrowIndex } =
      await interestRate.getReserveData(mockToken.getAddress());

    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();
    const loanData = await borrower.loans(loanId);

    expect(loanData.loanId).to.equal(loanId);
    expect(loanData.borrower).to.equal(user1.address);
    expect(loanData.tokenAddress).to.equal(await mockToken.getAddress());
    expect(loanData.tokenAmount).to.equal(tokenAmount);
    // expect(loanData.collateralAddresses).to.equal(collateralAddresses);
    expect(loanData.variableBorrowIndex).to.equal(postLoanVariableBorrowIndex);
  });

  it("Should fail if no collateral addresses are provided", async function () {
    const { borrower, admin, mockToken, user1 } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);

    await expect(
      borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), ethers.parseUnits("5", 18), [], {
          value: serviceFee,
        })
    ).to.be.revertedWith("Must provide at least one collateral address");
  });

  it("Should fail if incorrect service fee amount is sent", async function () {
    const { borrower, admin, mockToken, user1 } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);

    const collateralAddress = await mockToken.getAddress();
    const tokenAmount = ethers.parseUnits("5", 18);
    const wrongServiceFee = ethers.parseUnits("0.005", 18);

    await expect(
      borrower
        .connect(user1)
        .createLoan(collateralAddress, tokenAmount, [collateralAddress], {
          value: wrongServiceFee,
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should fail if loan amount exceeds maximum allowed amount", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];

    await expect(
      borrower
        .connect(user1)
        .createLoan(
          collateralAddress,
          ethers.parseUnits("150", 18),
          collateralAddresses,
          { value: serviceFee }
        )
    ).to.be.revertedWith(
      "Loan amount must be greater than zero and less than max loan amount in tokens"
    );
  });

  it("Should calculate borrow APR correctly when utilization rate >= optimal utilization rate", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 40);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const riskParams = await borrower.riskParameters(mockToken.getAddress());

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("5", 18);

    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    await lendingPool.connect(admin).getDepositAPY(collateralAddress);

    //     const loanId = await borrower.loanCounter();
    //     const loanData = await borrower.loans(loanId);

    //     const { variableBorrowIndex: postLoanVariableBorrowIndex } = await interestRate.getReserveData(mockToken.getAddress());

    //     expect(loanData.loanId).to.equal(loanId);
    //     expect(loanData.borrower).to.equal(user1.address);
    //     expect(loanData.tokenAddress).to.equal(await mockToken.getAddress());
    //     expect(loanData.tokenAmount).to.equal(tokenAmount);
    //     // expect(loanData.collateralAddresses).to.equal(collateralAddresses);
    //     expect(loanData.variableBorrowIndex).to.equal(postLoanVariableBorrowIndex);
  });

  it("Should revert when create loan and transferring ETH to lendingPool fails", async function () {
      const { borrower, lendingPool, collateralManager, mockLendingPool, priceOracle, interestRate, mockToken, admin, user1 } = await setup();

      await borrower.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        mockLendingPool.getAddress(),
        interestRate.getAddress()
      );
      await mockLendingPool.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        borrower.getAddress(),
        interestRate.getAddress()
      );
      await interestRate.setContractAddresses(
        mockLendingPool.getAddress(),
        borrower.getAddress()
      );
  
      const serviceFee = ethers.parseUnits("0.01", 18);
      await borrower.connect(admin).setServiceFee(serviceFee);
      await mockLendingPool.connect(admin).setServiceFee(serviceFee);

      const ltv = ethers.parseUnits("0.5", 4);
      const liquidationThreshold = ethers.parseUnits("0.75", 4);
      await borrower.connect(admin).setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

      await interestRate.connect(admin).setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
      await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

      await collateralManager.connect(admin).setAllowedToken([mockToken.getAddress()]);

      const depositAmount = ethers.parseUnits("100", 18);
      await mockToken.connect(user1).approve(mockLendingPool.getAddress(), depositAmount);
      await mockLendingPool.connect(user1).depositAsset(mockToken.getAddress(), depositAmount, { value: serviceFee });

      const collateralAddress = mockToken.getAddress();
      const amount = ethers.parseUnits("100", 18);
      const price = ethers.parseUnits("2", 8);
      await priceOracle.setCustomPrice(collateralAddress, price);

      await mockToken.connect(user1).approve(collateralManager.getAddress(), amount);
      await collateralManager.connect(user1).addCollateral(collateralAddress, amount);

      const collateralAddresses = [collateralAddress];

      
      await expect(
          borrower.connect(user1).createLoan(collateralAddress, ethers.parseUnits("5", 18), collateralAddresses, { value: serviceFee })
      ).to.be.revertedWith("Transfer of service fee failed");
  });

  it("Should revert if the lending pool does not have enough balance to transfer loan", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("1", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const riskParams = await borrower.riskParameters(mockToken.getAddress());

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("5", 18);

    await expect(
      borrower
        .connect(user1)
        .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
          value: serviceFee,
        })
    ).to.be.revertedWith("Insufficient balance in lending pool");
  });

  it("Should repay one part correctly", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = ethers.parseUnits("4", 18);
    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);

    await expect(
      borrower
        .connect(user1)
        .repayLoan(loanId, repayAmount, { value: serviceFee })
    )
      .to.emit(borrower, "LoanRepaid")
      .withArgs(loanId, user1.address, repayAmount);

    const loanData = await borrower.loans(loanId);
    const excessAmount = totalRepayment - repayAmount;
    expect(loanData.tokenAmount).to.equal(excessAmount);
    expect(loanData.variableBorrowIndex).to.equal(currentVariableBorrowIndex);
  });

  it("Should repay all loan correctly", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = totalRepayment;

    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);

    const userBalanceBefore = await mockToken.balanceOf(user1.address);

    const transaction = await borrower
      .connect(user1)
      .repayLoan(loanId, repayAmount, { value: serviceFee });
    const txReceipt = await transaction.wait();
    if (txReceipt === null) {
      throw new Error("Transaction receipt is null");
    }

    const loanData = await borrower.loans(loanId);
    const excessAmount = repayAmount - totalRepayment;
    expect(loanData.tokenAmount).to.equal(0);

    const userBalanceAfter = await mockToken.balanceOf(user1.address);
    expect(userBalanceAfter).to.equal(
      userBalanceBefore - repayAmount + excessAmount
    );
  });

  it("Should repay all loan correctly and 1 part left over", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = ethers.parseUnits("6", 18);

    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);

    const userBalanceBefore = await mockToken.balanceOf(user1.address);
    // console.log(userBalanceBefore);

    const transaction = await borrower
      .connect(user1)
      .repayLoan(loanId, repayAmount, { value: serviceFee });
    const txReceipt = await transaction.wait();
    if (txReceipt === null) {
      throw new Error("Transaction receipt is null");
    }

    const loanData = await borrower.loans(loanId);
    const excessAmount = repayAmount - totalRepayment;
    // console.log(ethers.toBigInt(txReceipt.gasPrice*(txReceipt.cumulativeGasUsed)));
    expect(loanData.tokenAmount).to.equal(0);

    const userBalanceAfter = await mockToken.balanceOf(user1.address);
    expect(userBalanceAfter).to.equal(
      userBalanceBefore - repayAmount + excessAmount
    );
  });

  it("Should revert when repay loan and transferring ETH to lendingPool fails", async function () {
    const { borrower, lendingPool, collateralManager, mockLendingPool, priceOracle, interestRate, mockToken, admin, user1 } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

      await borrower.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        mockLendingPool.getAddress(),
        interestRate.getAddress()
      );
      await mockLendingPool.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        borrower.getAddress(),
        interestRate.getAddress()
      );
      await interestRate.setContractAddresses(
        mockLendingPool.getAddress(),
        borrower.getAddress()
      );

      await mockLendingPool.connect(admin).setServiceFee(serviceFee);

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = totalRepayment;

    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);

    const userBalanceBefore = await mockToken.balanceOf(user1.address);

    await expect(
      borrower
        .connect(user1)
        .repayLoan(loanId, repayAmount, {
          value: serviceFee,
        })
    ).to.be.revertedWith("Transfer of service fee failed");

  });


  it("Should revert when repay all loan correctly and 1 part left over and transferring ETH to lendingPool fails", async function () {
    const { borrower, lendingPool, collateralManager, mockLendingPool, priceOracle, interestRate, mockToken, admin, user1 } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

      await borrower.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        mockLendingPool.getAddress(),
        interestRate.getAddress()
      );
      await mockLendingPool.connect(admin).setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        borrower.getAddress(),
        interestRate.getAddress()
      );
      await interestRate.setContractAddresses(
        mockLendingPool.getAddress(),
        borrower.getAddress()
      );

      await mockLendingPool.connect(admin).setServiceFee(serviceFee);

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = totalRepayment;

    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);

    const userBalanceBefore = await mockToken.balanceOf(user1.address);

    await expect(
      borrower
        .connect(user1)
        .repayLoan(loanId, ethers.parseUnits("0.001", 18), {
          value: serviceFee,
        })
    ).to.be.revertedWith("Transfer of service fee failed");

  });


  it("Should revert if the caller is not the borrower", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();
    const repayAmount = ethers.parseUnits("6", 18);

    await expect(
      borrower
        .connect(user2)
        .repayLoan(loanId, repayAmount, {
          value: ethers.parseUnits("0.01", 18),
        })
    ).to.be.revertedWith("Caller is not the borrower");
  });

  it("Should revert if the repayment amount is zero", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();
    const repayAmount = ethers.parseUnits("0", 18);

    await expect(
      borrower
        .connect(user1)
        .repayLoan(loanId, repayAmount, {
          value: ethers.parseUnits("0.01", 18),
        })
    ).to.be.revertedWith("Invalid repayment amount");
  });

  it("Should revert if the service fee amount is incorrect", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();
    const repayAmount = ethers.parseUnits("5", 18);

    await expect(
      borrower
        .connect(user1)
        .repayLoan(loanId, repayAmount, {
          value: ethers.parseUnits("0.005", 18),
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should return the current variable borrow rate", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    const [
      liquidityIndex,
      variableBorrowIndex,
      currentLiquidityRate,
      currentVariableBorrowRate,
    ] = await interestRate.getReserveData(collateralAddress);
    // console.log(liquidityIndex);
    // console.log(variableBorrowIndex);
    // console.log(currentLiquidityRate);
    // console.log(currentVariableBorrowRate);
    const variableBorrowRate = await borrower.getCurrentVariableBorrowRate(
      mockToken.getAddress()
    );

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();
    const loanData = await borrower.loans(loanId);

    // const APR = await interestRate.calculateBorrowAPR(collateralAddress);
    // console.log(APR);
    // const APY = await interestRate.calculateBorrowAPY(collateralAddress);
    // console.log(APY);
    // const DepositAPY = await interestRate.calculateDepositAPY(collateralAddress);
    // console.log(DepositAPY);
    await expect(variableBorrowRate).to.equal(currentVariableBorrowRate);
    await expect(loanData.variableBorrowIndex).to.equal(variableBorrowIndex);
  });

  it("Should calculate the health factor correctly", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user2,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const loanId = await borrower.loanCounter();

    const [totalRepayment, currentVariableBorrowIndex] =
      await borrower.calculateTotalRepayment(loanId);

    const repayAmount = ethers.parseUnits("5", 18);
    await mockToken.connect(user1).approve(borrower.getAddress(), repayAmount);
    // await borrower.connect(user1).repayLoan(loanId, repayAmount, { value: serviceFee });

    const totalCollateralValueInUSD =
      await collateralManager.getCollateralValueForTokens(user1.address, [
        collateralAddress,
      ]);
    const tokenPriceInUSD = await priceOracle.getAssetPrice(
      mockToken.getAddress()
    );
    const loanAmountInUSD = (totalRepayment * tokenPriceInUSD) / BigInt(1e18);
    const expectedHealthFactor =
      (totalCollateralValueInUSD * liquidationThreshold) / loanAmountInUSD;

    // console.log(tokenPriceInUSD);
    // console.log(totalRepayment);
    // console.log(totalCollateralValueInUSD);
    // console.log(loanAmountInUSD);
    // console.log(expectedHealthFactor);

    const healthFactor = await borrower.checkHealthFactor(loanId);

    expect(healthFactor).to.equal(expectedHealthFactor);
  });

  it("Should return all loan IDs", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);
    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);
    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [collateralAddress];
    const tokenAmount = ethers.parseUnits("5", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    const tokenAmount2 = ethers.parseUnits("3", 18);
    await borrower
      .connect(user1)
      .createLoan(collateralAddress, tokenAmount2, collateralAddresses, {
        value: serviceFee,
      });

    const loanIds = await borrower.getAllLoanIds();

    expect(loanIds.length).to.equal(2);
    expect(loanIds).to.include(1n);
    expect(loanIds).to.include(2n);
  });


  it("Should be called checkUpkeep and performUpkeep correctly when there is no unsafe Id.", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await setup();
    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("100", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const riskParams = await borrower.riskParameters(mockToken.getAddress());

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("5", 18);
    const { variableBorrowIndex: postLoanVariableBorrowIndex } =
      await interestRate.getReserveData(mockToken.getAddress());

    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
      });
    const checkData = "0x"; 

    const result = await borrower.checkUpkeep(checkData);

    const upkeepNeeded = result[0];
    const performDataResult = result[1];

    expect(upkeepNeeded).to.be.a('boolean');
    expect(performDataResult).to.equal("0x");
  });


  it("Should be called checkUpkeep and performUpkeep correctly when there is an unsafe Id.", async function () {
    const {
      borrower,
      lendingPool,
      collateralManager,
      priceOracle,
      interestRate,
      mockToken,
      admin,
      user1,
      user3,
    } = await setup();
    const serviceFee = ethers.parseUnits("0.01", 18);
    await borrower.connect(admin).setServiceFee(serviceFee);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const ltv = ethers.parseUnits("0.5", 4);
    const liquidationThreshold = ethers.parseUnits("0.75", 4);
    await borrower
      .connect(admin)
      .setRiskParameters(mockToken.getAddress(), ltv, liquidationThreshold);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const depositAmount = ethers.parseUnits("500", 18);
    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const riskParams = await borrower.riskParameters(mockToken.getAddress());

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await priceOracle.setCustomPrice(collateralAddress, price);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount);

    await mockToken
      .connect(user3)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user3)
      .addCollateral(collateralAddress, amount);  

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("50", 18);
    const { variableBorrowIndex: postLoanVariableBorrowIndex } =
    await interestRate.getReserveData(mockToken.getAddress());

    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
      });
      const loanId = await borrower.loanCounter();

    await network.provider.send("evm_increaseTime", [6666600000000000]); 
    await network.provider.send("evm_mine");

    await borrower
      .connect(user3)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
    });
    
    await priceOracle.setCustomPrice(mockToken.getAddress(), ethers.parseUnits("0.000001", 8));
    const checkData = "0x"; 

    const result = await borrower.checkUpkeep(checkData);

    const upkeepNeeded = result[0];
    const performDataResult = result[1];

    expect(upkeepNeeded).to.be.a('boolean')

    const performDataBytes = ethers.hexlify(performDataResult);

    expect(performDataBytes).to.be.a('string');
    expect(performDataBytes).to.not.equal("0x");

    const tx = await borrower.performUpkeep(performDataResult);
    await expect(tx).to.emit(borrower, "LoanLiquidated");
  });


});
