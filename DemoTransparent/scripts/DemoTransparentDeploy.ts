import { ethers, upgrades, run } from "hardhat";

async function main() {
  await run("compile");
  console.log("Compiled contract...");

  console.log("Deploying DemoTransparent...");

  const constructorArgs: [string, bigint] = [
    "0xEcf58FE15b7606DA86D7CAa7B58aa878D206041a",
    100n,
  ];

  const DemoTransparent = await ethers.getContractFactory("DemoTransparent");

  const demoTransparent = await upgrades.deployProxy(
    DemoTransparent,
    constructorArgs,
    {
      kind: "transparent",
      initializer: "initialize",
    }
  );
  await demoTransparent.waitForDeployment();

  const proxyAddr = await demoTransparent.getAddress();
  console.log("DemoTransparent deployed at: ", proxyAddr);

  const proxyAdminAddress = await upgrades.erc1967.getAdminAddress(proxyAddr);
  console.log("ProxyAdmin address:", proxyAdminAddress);

  console.log("Wait to verify contract");

  await new Promise((resolve) => {
    setTimeout(resolve, 60 * 1000);
  });
  await run("verify:verify", {
    address: proxyAddr,
    constructorArgs: [],
  });
  const implAddr = await upgrades.erc1967.getImplementationAddress(proxyAddr);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
