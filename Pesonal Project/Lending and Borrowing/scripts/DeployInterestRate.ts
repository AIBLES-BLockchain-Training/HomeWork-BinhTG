import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying InterestRate...");
    
    const InterestRate = await ethers.getContractFactory("InterestRate");
    const interestRate = await InterestRate.deploy();
    
    const interestRateAddr = await interestRate.getAddress();
    console.log("InterestRate deployed to:", interestRateAddr);

    console.log("Wait to verify contract");

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });
    await run("verify:verify", {
        address: interestRateAddr,
        constructorArgs: [],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
