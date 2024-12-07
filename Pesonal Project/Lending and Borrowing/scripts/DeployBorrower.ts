import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying Borrower...");
    
    const Borrower = await ethers.getContractFactory("Borrower");
    const borrower = await Borrower.deploy();
    
    const borrowerAddr = await borrower.getAddress();
    console.log("Borrower deployed to:", borrowerAddr);

    console.log("Wait to verify contract");

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });
    await run("verify:verify", {
        address: borrowerAddr,
        constructorArgs: [],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
