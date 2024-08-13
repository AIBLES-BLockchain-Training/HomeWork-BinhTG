import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CollateralManager", function () {
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
    await mockToken.connect(admin).mint(user2.address, initialSupply);

    const PriceOracleFactory = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracleFactory.deploy();

    const BorrowerFactory = await ethers.getContractFactory("Borrower");
    const borrower = await BorrowerFactory.deploy();

    const LendingPoolFactory = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPoolFactory.deploy();

    const InterestRateFactory = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRateFactory.deploy();

    const CollateralManagerFactory = await ethers.getContractFactory(
      "CollateralManager"
    );
    const collateralManager = await CollateralManagerFactory.deploy();

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

    await borrower.setContractAddresses(
      priceOracle.getAddress(),
      collateralManager.getAddress(),
      lendingPool.getAddress(),
      interestRate.getAddress()
    );

    await interestRate.setContractAddresses(
      lendingPool.getAddress(),
      borrower.getAddress()
    );

    await collateralManager.setAllowedToken([mockToken.getAddress()]);

    return {
      collateralManager,
      priceOracle,
      borrower,
      lendingPool,
      interestRate,
      mockToken,
      mockLendingPool,
      admin,
      user1,
      user2,
    };
  }

  it("Should set contract addresses when called by admin", async function () {
    const { collateralManager, priceOracle, borrower, lendingPool, admin } =
      await loadFixture(setup);

    await collateralManager
      .connect(admin)
      .setContractAddresses(
        priceOracle.getAddress(),
        borrower.getAddress(),
        lendingPool.getAddress()
      );

    expect(await collateralManager.priceOracle()).to.equal(
      await priceOracle.getAddress()
    );
    expect(await collateralManager.borrower()).to.equal(
      await borrower.getAddress()
    );
    expect(await collateralManager.lendingPool()).to.equal(
      await lendingPool.getAddress()
    );
  });

  it("Should revert if called by non-admin", async function () {
    const {
      collateralManager,
      priceOracle,
      borrower,
      lendingPool,
      admin,
      user1,
    } = await loadFixture(setup);

    await expect(
      collateralManager
        .connect(user1)
        .setContractAddresses(
          priceOracle.getAddress(),
          borrower.getAddress(),
          lendingPool.getAddress()
        )
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should allow the admin to set allowed tokens", async function () {
    const { collateralManager, admin } = await loadFixture(setup);
    const tokens = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
    ];
    await collateralManager.connect(admin).setAllowedToken(tokens);
    const allowedTokens = await collateralManager.getAllowedTokens();
    expect(allowedTokens).to.deep.equal(tokens);
  });

  it("Should revert if called by non-admin", async function () {
    const { collateralManager, admin, user1 } = await loadFixture(setup);
    const tokens = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
    ];
    await expect(
      collateralManager.connect(user1).setAllowedToken(tokens)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should revert if if there are more than 5 tokensn", async function () {
    const { collateralManager, admin, user1 } = await loadFixture(setup);
    const tokens = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
      "0x0000000000000000000000000000000000000005",
      "0x0000000000000000000000000000000000000006",
    ];
    await expect(
      collateralManager.connect(admin).setAllowedToken(tokens)
    ).to.be.revertedWith("You can only set up tp 5 allowed tokens");
  });

  it("Should allow the admin to set the service fee", async function () {
    const { collateralManager, admin } = await loadFixture(setup);
    const serviceFee = ethers.parseUnits("0.01", 18);

    await collateralManager.connect(admin).setServiceFee(serviceFee);
    expect(await collateralManager.serviceFee()).to.equal(serviceFee);
  });

  it("Should revert if non-admin tries to set service fee", async function () {
    const { collateralManager, admin, user1 } = await loadFixture(setup);
    const serviceFee = ethers.parseUnits("0.01", 18);

    await expect(
      collateralManager.connect(user1).setServiceFee(serviceFee)
    ).to.be.revertedWith("Only admin can call this function");
  });

  it("Should revert if user add collateral and collateral is locked", async function () {
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

    const collateralAddresses = [mockToken.getAddress()];
    const tokenAmount = ethers.parseUnits("5", 18);

    await borrower
      .connect(user1)
      .createLoan(mockToken.getAddress(), tokenAmount, collateralAddresses, {
        value: serviceFee,
      });

    await expect(
      collateralManager
        .connect(user1)
        .removeCollateral(collateralAddress, amount)
    ).to.be.revertedWith("Collateral is currently locked");

    await expect(
      collateralManager.connect(user1).addCollateral(collateralAddress, amount)
    ).to.be.revertedWith("Collateral is currently locked");
  });

  it("Should allow users to add collateral", async function () {
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

    await expect(() =>
      collateralManager
        .connect(user1)
        .addCollateral(collateralAddress, amount, { value: serviceFee })
    ).to.changeEtherBalance(lendingPool, serviceFee);

    expect(
      await collateralManager.getCollateralAmount(
        user1.address,
        collateralAddress
      )
    ).to.equal(amount);
  });

  it("Should allow users to add collateral twice time", async function () {
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

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await expect(() =>
      collateralManager
        .connect(user1)
        .addCollateral(collateralAddress, amount, { value: serviceFee })
    ).to.changeEtherBalance(lendingPool, serviceFee);

    expect(
      await collateralManager.getCollateralAmount(
        user1.address,
        collateralAddress
      )
    ).to.equal(ethers.parseUnits("200", 18));
  });

  it("Should revert if collateralAddress is invalid", async function () {
    const { collateralManager, admin } = await loadFixture(setup);
    const invalidAddress = "0x0000000000000000000000000000000000000000";
    const amount = ethers.parseUnits("100", 18);

    await expect(
      collateralManager.connect(admin).addCollateral(invalidAddress, amount)
    ).to.be.revertedWith("Invalid collateralAddress");
  });

  it("Should revert if token amount is zero", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );
    const tokenAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("0", 18);

    await expect(
      collateralManager.connect(user1).addCollateral(tokenAddress, amount)
    ).to.be.revertedWith("Token amount must be greater than zero");
  });

  it("Should revert if token is not allowed", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );
    const tokenAddress = "0x0000000000000000000000000000000000000001";
    const amount = ethers.parseUnits("100", 18);

    await expect(
      collateralManager.connect(user1).addCollateral(tokenAddress, amount)
    ).to.be.revertedWith("Token is not allowed");
  });

  it("Should fail to add collateral if incorrect service fee amount", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );
    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await expect(
      collateralManager
        .connect(user1)
        .addCollateral(collateralAddress, amount, {
          value: ethers.parseUnits("0.005", 18),
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should allow users to remove collateral", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });
    await collateralManager
      .connect(user1)
      .removeCollateral(collateralAddress, amount, { value: serviceFee });
    expect(
      await collateralManager.getCollateralAmount(
        user1.address,
        collateralAddress
      )
    ).to.equal(0);
  });

  it("Should revert if there is not enough collateral to remove", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const tooMuchAmount = ethers.parseUnits("200", 18);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    await expect(
      collateralManager
        .connect(user1)
        .removeCollateral(collateralAddress, tooMuchAmount, {
          value: serviceFee,
        })
    ).to.be.revertedWith("Not enough collateral to remove");
  });

  it("Should revert if the service fee is incorrect", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);
    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);

    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    await expect(
      collateralManager
        .connect(user1)
        .removeCollateral(collateralAddress, amount, {
          value: ethers.parseUnits("0.005", 18),
        })
    ).to.be.revertedWith("Incorrect service fee amount");
  });

  it("Should revert when add collateral and transferring ETH to lendingPool fails", async function () {
    const {
      admin,
      user1,
      mockToken,
      priceOracle,
      borrower,
      collateralManager,
      mockLendingPool,
    } = await loadFixture(setup);

    await collateralManager.setContractAddresses(
      priceOracle.getAddress(),
      borrower.getAddress(),
      mockLendingPool.getAddress()
    );

    const collateralAmount = ethers.parseUnits("100", 18);
    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), collateralAmount);

    await expect(
      collateralManager
        .connect(user1)
        .addCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        })
    ).to.be.revertedWith("Transfer of service fee failed");
  });

  it("Should revert when remove collateral and transferring ETH to lendingPool fails", async function () {
    const {
      admin,
      user1,
      mockToken,
      priceOracle,
      borrower,
      collateralManager,
      mockLendingPool,
    } = await loadFixture(setup);

    const collateralAmount = ethers.parseUnits("100", 18);
    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), collateralAmount);

    await collateralManager
      .connect(user1)
      .addCollateral(mockToken.getAddress(), collateralAmount, {
        value: serviceFee,
      });
    await collateralManager.setContractAddresses(
      priceOracle.getAddress(),
      borrower.getAddress(),
      mockLendingPool.getAddress()
    );
    await expect(
      collateralManager
        .connect(user1)
        .removeCollateral(mockToken.getAddress(), collateralAmount, {
          value: serviceFee,
        })
    ).to.be.revertedWith("Transfer of service fee failed");
  });

  it("Should calculate collateral value correctly", async function () {
    const { collateralManager, mockToken, admin, user1, priceOracle } =
      await loadFixture(setup);

    const collateralAddress = mockToken.getAddress();
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await collateralManager.connect(admin).setAllowedToken([collateralAddress]);
    await priceOracle.setCustomPrice(collateralAddress, price);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(collateralAddress, amount, { value: serviceFee });

    const collateralValue = await collateralManager.getCollateralValueForTokens(
      user1.address,
      [collateralAddress]
    ); //

    const totalValue = (amount * price) / BigInt(10 ** 18);
    expect(collateralValue).to.equal(totalValue);
  });

  it("Should revert if a non-authorized contract tries to lock and unlock collaterals", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );

    await expect(
      collateralManager
        .connect(user1)
        .lockCollaterals(user1.address, [mockToken.getAddress()])
    ).to.be.revertedWith("Only authorized contracts can call this function");

    await expect(
      collateralManager
        .connect(user1)
        .unlockCollaterals(user1.address, [mockToken.getAddress()])
    ).to.be.revertedWith("Only authorized contracts can call this function");
  });

  it("Should calculate collateral value correctly for mixed allowed and non-allowed tokens", async function () {
    const { collateralManager, mockToken, admin, user1, priceOracle } =
      await loadFixture(setup);

    const allowedTokenAddress = mockToken.getAddress();
    const disallowedTokenAddress = "0x0000000000000000000000000000000000000000";
    const amount = ethers.parseUnits("100", 18);
    const price = ethers.parseUnits("2", 8);

    await collateralManager
      .connect(admin)
      .setAllowedToken([allowedTokenAddress]);
    await priceOracle.setCustomPrice(allowedTokenAddress, price);

    const serviceFee = ethers.parseUnits("0.01", 18);
    await collateralManager.connect(admin).setServiceFee(serviceFee);

    await mockToken
      .connect(user1)
      .approve(collateralManager.getAddress(), amount);
    await collateralManager
      .connect(user1)
      .addCollateral(allowedTokenAddress, amount, { value: serviceFee });

    const collateralValue = await collateralManager.getCollateralValueForTokens(
      user1.address,
      [allowedTokenAddress, disallowedTokenAddress]
    );

    const totalValue = (amount * price) / BigInt(10 ** 18);
    expect(collateralValue).to.equal(
      totalValue,
      "Total value should include only allowed tokens"
    );
  });

  it("Should revert if a non-authorized contract tries to transfer collateral", async function () {
    const { collateralManager, mockToken, admin, user1 } = await loadFixture(
      setup
    );

    await expect(
      collateralManager
        .connect(user1)
        .transferCollateral(mockToken.getAddress(), 1000)
    ).to.be.revertedWith("Only authorized contracts can call this function");
  });
});
