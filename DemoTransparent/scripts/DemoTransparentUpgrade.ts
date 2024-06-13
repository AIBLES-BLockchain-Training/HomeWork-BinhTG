import * as dotenv from "dotenv";
import { ethers, upgrades, run } from "hardhat";
dotenv.config();

async function main() {
  await run("compile");
  console.log("Compiled contracts...");

  console.log("Upgrade DemoTransparent");

  const owner = new ethers.Wallet(
    process.env.DEPLOYER_PRIVATE_KEY || "",
    ethers.provider
  );

  const proxyAddr = "0x861b8Eb752AB23778A26dA5Db13cAFB0BF7096a3";
  const DemoTransparent = await ethers.getContractFactory("DemoTransparent");
  
  const demoTransparentUpgrade = await upgrades.upgradeProxy(
    proxyAddr,
    DemoTransparent.connect(owner)
  );

  await demoTransparentUpgrade.waitForDeployment();

  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);

  console.log("Contract upgrade to new implemention: ", implAddr);
  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });

  await run("verify:verify", {
    address: implAddr,
    constructorArgs: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
