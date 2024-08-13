import { ethers, run } from "hardhat";

async function main() {
    await run("compile");
    console.log("Compiled contract...");

    console.log("Deploying MockToken...");
    const ownerAddress = "0xEcf58FE15b7606DA86D7CAa7B58aa878D206041a"
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(ownerAddress);
    
    const mockTokenAddr = await mockToken.getAddress();
    console.log("MockToken deployed to:", mockTokenAddr);

    console.log("Wait to verify contract");

    await new Promise((resolve) => {
        setTimeout(resolve, 60 * 1000);
    });
    await run("verify:verify", {
        address: mockTokenAddr,
        constructorArguments: [ownerAddress],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
