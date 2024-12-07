import { expect } from "chai";
import { ethers } from "hardhat";
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("MockChainlinkOracle", function () {
  async function setup() {
    const [deployer] = await ethers.getSigners();

    const MockChainlinkOracleFactory = await ethers.getContractFactory(
      "MockChainlinkOracle"
    );
    const mockChainlinkOracle = await MockChainlinkOracleFactory.deploy(
      ethers.parseUnits("1000", 18)
    );

    return { mockChainlinkOracle, deployer };
  }

  it("Should initialize with the correct price", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    const [, price, ,] = await mockChainlinkOracle.latestRoundData();
    expect(price).to.equal(ethers.parseUnits("1000", 18));
  });

  it("Should update price correctly", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    await mockChainlinkOracle.setPrice(ethers.parseUnits("2000", 18));
    const [, price, ,] = await mockChainlinkOracle.latestRoundData();
    expect(price).to.equal(ethers.parseUnits("2000", 18));
  });

  it("Should return correct round data", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    const roundId = 0;
    const [returnedRoundId, price, startedAt, updatedAt, answeredInRound] =
      await mockChainlinkOracle.getRoundData(roundId);

    expect(returnedRoundId).to.equal(roundId);
    expect(price).to.equal(ethers.parseUnits("1000", 18));
    expect(startedAt).to.equal(0);
    expect(updatedAt).to.equal(0);
    expect(answeredInRound).to.equal(0);
  });

  it("Should return correct decimals", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    const decimals = await mockChainlinkOracle.decimals();
    expect(decimals).to.equal(18);
  });

  it("Should return correct description", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    const description = await mockChainlinkOracle.description();
    expect(description).to.equal("Mock Chainlink Oracle");
  });

  it("Should return correct version", async function () {
    const { mockChainlinkOracle } = await loadFixture(setup);

    const version = await mockChainlinkOracle.version();
    expect(version).to.equal(1);
  });
});
