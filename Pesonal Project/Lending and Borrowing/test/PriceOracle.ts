import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("PriceOracle", function () {
  async function setup() {
    const [admin, user1, user2]= await ethers.getSigners();

    const MockTokenFactory = await ethers.getContractFactory("MockToken");
    const mockToken = await MockTokenFactory.deploy(admin.address);

    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();

    return { priceOracle, mockToken, admin, user1, user2 };
  }

  it("Should set the admin to the deployer", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    expect(await priceOracle.admin()).to.equal(admin.address);
  });

  it("Should allow the admin to set an asset oracle", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    await priceOracle.connect(admin).setAssetOracle(asset, oracle);
    expect(await priceOracle.assetOracles(asset)).to.equal(oracle);
  });

  it("Should emit OracleSet event when setting an asset oracle", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    await expect(priceOracle.connect(admin).setAssetOracle(asset, oracle))
      .to.emit(priceOracle, "OracleSet")
      .withArgs(asset, oracle);
  });

  it("Should allow the owner to set a custom price", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18);
    await priceOracle.connect(admin).setCustomPrice(asset, price);
    expect(await priceOracle.customPrices(asset)).to.equal(price);
  });

  it("Should emit CustomPriceSet event when setting a custom price", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18);

    await expect(priceOracle.connect(admin).setCustomPrice(asset, price))
      .to.emit(priceOracle, "CustomPriceSet")
      .withArgs(asset, price);
  });

  it("should return custom price if available", async function () {
    const { admin, mockToken, priceOracle } = await loadFixture(setup);

    const customPrice = ethers.parseUnits("200", 18); 
    await priceOracle.connect(admin).setCustomPrice(mockToken.getAddress(), customPrice);

    const price = await priceOracle.getAssetPrice(mockToken.getAddress());
    expect(price).to.equal(customPrice);
  });

  it("Should return price from Chainlink Oracle if custom price is not available", async function () {
    const { admin, mockToken, priceOracle } = await loadFixture(setup);

    const MockChainlinkOracle = await ethers.getContractFactory("MockChainlinkOracle");
    const mockChainlinkOracle = await MockChainlinkOracle.deploy(ethers.parseUnits("150", 18));

    await priceOracle.connect(admin).setAssetOracle(mockToken.getAddress(), mockChainlinkOracle.getAddress());

    const price = await priceOracle.getAssetPrice(mockToken.getAddress());
    expect(price).to.equal(ethers.parseUnits("150", 18));
  });

  it("Should revert if Invalid price when get price from chain link", async function () {
    const { admin, mockToken, priceOracle } = await loadFixture(setup);
  
    const MockChainlinkOracle = await ethers.getContractFactory("MockChainlinkOracle");
    const mockChainlinkOracle = await MockChainlinkOracle.deploy(ethers.parseUnits("0", 18));
  
    await priceOracle.connect(admin).setAssetOracle(mockToken.getAddress(), mockChainlinkOracle.getAddress());
  
    await expect(priceOracle.getAssetPrice(mockToken.getAddress()))
    .to.be.revertedWith("Invalid price");  
  });

  it("should revert if no price is available", async function () {
      const { mockToken, priceOracle } = await loadFixture(setup);

      await expect(
          priceOracle.getAssetPrice(mockToken.getAddress()))
      .to.be.revertedWith("No price available for the specified asset");
  });
    it("Should allow the owner to reset an asset oracle", async function () {
      const { priceOracle, admin } = await loadFixture(setup);
      const asset = "0x1234567890123456789012345678901234567890";
      const oracle = "0x0987654321098765432109876543210987654321";

      await priceOracle.connect(admin).setAssetOracle(asset, oracle);
      await priceOracle.connect(admin).resetAssetOracle(asset);
      expect(await priceOracle.assetOracles(asset)).to.equal("0x0000000000000000000000000000000000000000");
    });

  it("Should emit OracleReset event when resetting an asset oracle", async function () {
    const { priceOracle, admin } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    await priceOracle.connect(admin).setAssetOracle(asset, oracle);
    await expect(priceOracle.connect(admin).resetAssetOracle(asset))
      .to.emit(priceOracle, "OracleReset")
      .withArgs(asset);
  });

  it("Should revert when a non-owner tries to set an asset oracle", async function () {
    const { priceOracle, user1 } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const oracle = "0x0987654321098765432109876543210987654321";

    await expect(priceOracle.connect(user1).setAssetOracle(asset, oracle))
      .to.be.revertedWith("Only admin can call this function");
  });

  it("Should revert when a non-owner tries to set a custom price", async function () {
    const { priceOracle, user1 } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";
    const price = ethers.parseUnits("100", 18);

    await expect(priceOracle.connect(user1).setCustomPrice(asset, price))
      .to.be.revertedWith("Only admin can call this function");
  });

  it("Should revert when a non-owner tries to reset an asset oracle", async function () {
    const { priceOracle, user1 } = await loadFixture(setup);
    const asset = "0x1234567890123456789012345678901234567890";

    await expect(priceOracle.connect(user1).resetAssetOracle(asset))
      .to.be.revertedWith("Only admin can call this function");
  });
});














