import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LendingPool", function () {
  async function setup() {
    const [admin, user1, user2] = await ethers.getSigners();

    const MockLendingPoolFactory = await ethers.getContractFactory(
      "MockLendingPool"
    );
    const mockLendingPool = await MockLendingPoolFactory.deploy();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = await MockTokenFactory.deploy(admin.address);

    const initialSupply = ethers.parseUnits("1000", 18);
    await mockToken.connect(admin).mint(admin.address, initialSupply);
    await mockToken.connect(admin).mint(user1.address, initialSupply);
    await mockToken
      .connect(admin)
      .mint(user2.address, ethers.parseUnits("0.01", 18));

    const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracleFactory.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();

    const InterestRateFactory = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRateFactory.deploy();

    const CollateralManagerFactory = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManagerFactory.deploy();

    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy();

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
    await collateralManager.setContractAddresses(
      priceOracle.getAddress(),
      borrower.getAddress(),
      lendingPool.getAddress()
    );

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), initialSupply);
    return {
      lendingPool,
      mockToken,
      mockLendingPool,
      priceOracle,
      collateralManager,
      borrower,
      interestRate,
      admin,
      user1,
      user2,
    };
  }

  it("Should set contract addresses when called by admin", async function () {
    const {
      lendingPool,
      collateralManager,
      priceOracle,
      borrower,
      interestRate,
      admin,
    } = await loadFixture(setup);

    await lendingPool
      .connect(admin)
      .setContractAddresses(
        priceOracle.getAddress(),
        collateralManager.getAddress(),
        borrower.getAddress(),
        interestRate.getAddress()
      );

    expect(await lendingPool.interestRate()).to.equal(
      await interestRate.getAddress()
    );
    expect(await lendingPool.priceOracle()).to.equal(
      await priceOracle.getAddress()
    );
    expect(await lendingPool.borrower()).to.equal(await borrower.getAddress());
    expect(await lendingPool.collateralManager()).to.equal(
      await collateralManager.getAddress()
    );
  });

  it("Should revert if called by non-admin", async function () {
    const {
      lendingPool,
      collateralManager,
      priceOracle,
      borrower,
      interestRate,
      user1,
    } = await loadFixture(setup);

    await expect(
      lendingPool
        .connect(user1)
        .setContractAddresses(
          priceOracle.getAddress(),
          collateralManager.getAddress(),
          borrower.getAddress(),
          interestRate.getAddress()
        )
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("should return the correct list of allowed tokens", async function () {
    const { lendingPool, collateralManager, mockToken, admin } =
      await loadFixture(setup);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    const allowedTokens = await lendingPool.getAllowedTokens();

    expect(allowedTokens).to.have.lengthOf(1);
    expect(allowedTokens[0]).to.equal(await mockToken.getAddress());
  });

  it("should set service fee correctly", async () => {
    const { lendingPool, admin } = await loadFixture(setup);

    await lendingPool.connect(admin).setServiceFee(100);
    const serviceFee = await lendingPool.serviceFee();
    expect(serviceFee).to.equal(100);
  });

  it("Should revert if non-admin tries to set service fee", async function () {
    const { lendingPool, user1 } = await loadFixture(setup);
    const serviceFee = ethers.parseUnits("0.01", 18);

    await expect(
      lendingPool.connect(user1).setServiceFee(serviceFee)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should deposit assets correctly", async () => {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const lenderAsset = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );
    expect(lenderAsset.amount).to.equal(depositAmount);
    expect(lenderAsset.liquidityIndex).to.equal(liquidityIndexRetrieved);

    const assetBalance = await lendingPool.assetBalances(
      mockToken.getAddress()
    );
    expect(assetBalance).to.equal(depositAmount);

    const totalSupplied = await lendingPool.totalSupplied(
      mockToken.getAddress()
    );
    expect(totalSupplied).to.equal(depositAmount);
  });

  it("Should revert if the service fee is incorrect when deposit", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await expect(
      lendingPool
        .connect(user1)
        .depositAsset(mockToken.getAddress(), depositAmount, {
          value: ethers.parseUnits("0.005", 18),
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should deposit assets correctly twice", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });
  });

  it("Should revert if amount is zero", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);

    await mockToken.connect(user1).approve(lendingPool.getAddress(), 0);
    await expect(
      lendingPool.connect(user1).depositAsset(mockToken.getAddress(), 0)
    ).to.be.revertedWith("The amount must be greater than zero");
  });

  it("Should revert if token is not allowed", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);

    const invalidAddress = "0x0000000000000000000000000000000000000000";
    const depositAmount = ethers.parseUnits("100", 18);

    await expect(
      lendingPool.connect(user1).depositAsset(invalidAddress, depositAmount)
    ).to.be.revertedWith("Token is not allowed for deposit");
  });

  // it("should revert with 'Transfer of service fee failed' when fee transfer fails", async function () {
  //     const { lendingPool, mockToken, admin, user1 } = await loadFixture(setup);

  //     const serviceFee = ethers.parseUnits("0.01", 18);
  //     await lendingPool.connect(admin).setServiceFee(serviceFee);

  //     const depositAmount = ethers.parseUnits("100", 18);

  //     await mockToken.connect(user1).approve(lendingPool.getAddress(), depositAmount);

  //     await lendingPool.connect(user1).depositAsset(mockToken.getAddress(), depositAmount, { value: serviceFee });

  //     await expect(
  //         lendingPool.connect(user1).depositAsset(mockToken.getAddress(), depositAmount, { value: serviceFee })
  //     ).to.be.revertedWith("Transfer of service fee failed");
  // });

  it("Should withdraw correctly", async function () {
    const {
      lendingPool,
      collateralManager,
      mockToken,
      interestRate,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const initialUserBalance = await ethers.provider.getBalance(user1.address);

    const [totalBalance] = await lendingPool
      .connect(user1)
      .getTotalBalance(mockToken.getAddress());

    const withdrawAmount = ethers.parseUnits("50", 18);
    await lendingPool
      .connect(user1)
      .withDraw(mockToken.getAddress(), withdrawAmount, { value: serviceFee });

    const lenderAsset = await lendingPool.lenderAssets(
      user1.address,
      mockToken.getAddress()
    );

    const reserveData = await interestRate.getReserveData(
      mockToken.getAddress()
    );
    const currentLiquidityIndex = reserveData[0];

    const expectedAmount = totalBalance - withdrawAmount;

    expect(lenderAsset.amount).to.equal(expectedAmount);
    expect(lenderAsset.liquidityIndex).to.equal(currentLiquidityIndex);
  });

  it("should fail to withdraw when amount is zero", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);

    await expect(
      lendingPool.connect(user1).withDraw(mockToken.getAddress(), 0)
    ).to.be.revertedWith("The withdrawal amount must be greater than zero");
  });

  it("should fail to withdraw when token is not allowed", async function () {
    const { lendingPool, mockToken, user1 } = await loadFixture(setup);

    await expect(
      lendingPool
        .connect(user1)
        .withDraw(mockToken.getAddress(), ethers.parseUnits("50", 18))
    ).to.be.revertedWith("Token is not allowed for withdrawal");
  });

  it("Should revert if the service fee is incorrect when with draw", async function () {
    const {
      lendingPool,
      collateralManager,
      interestRate,
      mockToken,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    const withdrawAmount = ethers.parseUnits("50", 18);

    await expect(
      lendingPool
        .connect(user1)
        .withDraw(mockToken.getAddress(), withdrawAmount, {
          value: ethers.parseUnits("0.05", 18),
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should fail to withdraw when balance is insufficient", async function () {
    const { lendingPool, collateralManager, mockToken, admin, user1 } =
      await loadFixture(setup);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await expect(
      lendingPool
        .connect(user1)
        .withDraw(mockToken.getAddress(), ethers.parseUnits("50", 18))
    ).to.be.revertedWith("Insufficient balance");
  });

  it("Should fail to withdraw when liquidity is insufficient", async function () {
    const {
      lendingPool,
      collateralManager,
      mockToken,
      interestRate,
      admin,
      user1,
    } = await loadFixture(setup);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });

    const initialUserBalance = await ethers.provider.getBalance(user1.address);

    const [totalBalance] = await lendingPool
      .connect(user1)
      .getTotalBalance(mockToken.getAddress());

    const withdrawAmount = ethers.parseUnits("150", 18);

    await expect(
      lendingPool
        .connect(user1)
        .withDraw(mockToken.getAddress(), withdrawAmount, { value: serviceFee })
    ).to.be.revertedWith("Insufficient liquidity");
  });

  it("Should revert if a non-authorized contract tries to transfer", async function () {
    const {
      lendingPool,
      borrower,
      mockToken,
      collateralManager,
      interestRate,
      admin,
      user1,
    } = await loadFixture(setup);

    await expect(
      lendingPool
        .connect(user1)
        .transferLoan(mockToken.getAddress(), user1.address, 1000)
    ).to.be.revertedWith("Only authorized contracts can call this function");

    await expect(
      lendingPool
        .connect(user1)
        .transferExcessAmount(mockToken.getAddress(), user1.address, 1000)
    ).to.be.revertedWith("Only authorized contracts can call this function");
  });

  // it("Should revert if transfer of service fee fails in withDraw", async function () {
  //     const { lendingPool, borrower, mockToken, collateralManager, interestRate, priceOracle, admin, user1 } = await loadFixture(setup);
  //     const amount = ethers.parseUnits("100", 18);

  //     await lendingPool.connect(admin).setContractAddresses(borrower.getAddress(), collateralManager.getAddress(), interestRate.getAddress(), priceOracle.getAddress());

  //     await expect(
  //       lendingPool.connect(user1).withDraw(mockToken.getAddress(), amount, { value: ethers.parseUnits("1", "ether") })
  //     ).to.be.revertedWith("Transfer of service fee failed");
  // });

  it("Should calculate utilization rate correctly", async function () {
    const {
      lendingPool,
      borrower,
      mockToken,
      collateralManager,
      interestRate,
      admin,
      user1,
    } = await loadFixture(setup);
    const serviceFee = ethers.parseUnits("0.01", 18);
    await lendingPool.connect(admin).setServiceFee(serviceFee);

    await interestRate
      .connect(admin)
      .setInterestRateParams(mockToken.getAddress(), 500, 750, 500, 4000);
    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());

    const depositAmount = ethers.parseUnits("100", 18);

    await collateralManager
      .connect(admin)
      .setAllowedToken([mockToken.getAddress()]);

    await interestRate.connect(admin).initializeReserve(mockToken.getAddress());
    const [liquidityIndexRetrieved] = await interestRate.getReserveData(
      mockToken.getAddress()
    );

    await mockToken
      .connect(user1)
      .approve(lendingPool.getAddress(), depositAmount);

    await lendingPool
      .connect(user1)
      .depositAsset(mockToken.getAddress(), depositAmount, {
        value: serviceFee,
      });
    const utilizationRate = await lendingPool.getCurrentUtilizationRate(
      mockToken.getAddress()
    );
    const totalSupplied = ethers.parseUnits("100", 18);
    const totalBorrowed = ethers.parseUnits("0", 18);
    const expectedUtilizationRate =
      (totalBorrowed * BigInt(10000)) / totalSupplied;

    expect(utilizationRate).to.equal(expectedUtilizationRate);
  });

  it("Should revert if totalSupplied is zero", async function () {
    const { lendingPool, mockToken } = await loadFixture(setup);

    const tokenAddress = mockToken.getAddress();

    await expect(
      lendingPool.getCurrentUtilizationRate(tokenAddress)
    ).to.be.revertedWith("No supply for the token");
  });

  it("Should allow admin to withdraw service fee", async function () {
    const { collateralManager, mockToken, lendingPool, admin, user1 } =
      await loadFixture(setup);

    const amount = ethers.parseUnits("100", 18);
    const collateralAddress = await mockToken.getAddress();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    const user1Balance = await ethers.provider.getBalance(user1.address);
    expect(user1Balance).to.be.gt(
      serviceFee,
      "User1 does not have enough ETH to cover the service fee"
    );

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    const withdrawAmount = ethers.parseUnits("0.0005", 18);

    const initialAdminBalance = await ethers.provider.getBalance(admin.address);
    const initialContractBalance = await ethers.provider.getBalance(
      lendingPool.getAddress()
    );

    const transaction = await lendingPool
      .connect(admin)
      .withdrawServiceFee(withdrawAmount);
    const txReceipt = await transaction.wait();
    if (txReceipt === null) {
      throw new Error("Transaction receipt is null");
    }
    // console.log(ethers.toBigInt(txReceipt.gasPrice*(txReceipt.cumulativeGasUsed)));

    const finalAdminBalance = await ethers.provider.getBalance(admin.address);
    const finalContractBalance = await ethers.provider.getBalance(
      lendingPool.getAddress()
    );

    expect(finalAdminBalance).to.be.equal(
      initialAdminBalance +
        withdrawAmount -
        txReceipt.gasPrice * txReceipt.cumulativeGasUsed
    );
    expect(finalContractBalance).to.be.equal(
      initialContractBalance - withdrawAmount
    );
  });

  it("Should revert when non-admin tries to withdraw service fee", async function () {
    const { collateralManager, mockToken, lendingPool, admin, user1 } =
      await loadFixture(setup);

    const amount = ethers.parseUnits("100", 18);
    const collateralAddress = await mockToken.getAddress();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    const user1Balance = await ethers.provider.getBalance(user1.address);
    expect(user1Balance).to.be.gt(
      serviceFee,
      "User1 does not have enough ETH to cover the service fee"
    );

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    const withdrawAmount = ethers.parseUnits("5", 18);

    await expect(
      lendingPool.connect(user1).withdrawServiceFee(withdrawAmount)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should revert when trying to withdraw more than the service fee balance", async function () {
    const { collateralManager, mockToken, lendingPool, admin, user1 } =
      await loadFixture(setup);

    const amount = ethers.parseUnits("100", 18);
    const collateralAddress = await mockToken.getAddress();

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    const user1Balance = await ethers.provider.getBalance(user1.address);
    expect(user1Balance).to.be.gt(
      serviceFee,
      "User1 does not have enough ETH to cover the service fee"
    );

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    const withdrawAmount = ethers.parseUnits("15", 18);

    await expect(
      lendingPool.connect(admin).withdrawServiceFee(withdrawAmount)
    ).to.be.revertedWith("Insufficient service fee balance");
  });
});
