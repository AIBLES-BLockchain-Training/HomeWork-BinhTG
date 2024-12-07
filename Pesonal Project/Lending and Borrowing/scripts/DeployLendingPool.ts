import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying LendingPool...");
    
    const LendingPool = await ethers.getContractFactory("LendingPool");
    const lendingPool = await LendingPool.deploy();
    
    const lendingPoolAddr = await lendingPool.getAddress();
    console.log("LendingPool deployed to:", lendingPoolAddr);

    console.log("Wait to verify contract");

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });
    await run("verify:verify", {
        address: lendingPoolAddr,
        constructorArgs: [],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
