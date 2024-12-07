import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying CollateralManager...");
    
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy();
    
    const collateralManagerAddr = await collateralManager.getAddress();
    console.log("CollateralManager deployed to:", collateralManagerAddr);

    console.log("Wait to verify contract");

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });
    await run("verify:verify", {
        address: collateralManagerAddr,
        constructorArgs: [],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
