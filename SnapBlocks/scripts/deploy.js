const hre = require("hardhat");

async function main() {
    const SnapBlocks = await ethers.getContractFactory("SnapBlocks");
    const snapBlocks = await SnapBlocks.deploy(); // Deploys the contract
    await snapBlocks.waitForDeployment(); // Wait for the deployment to complete
  
    console.log("SnapBlocks deployed to:", snapBlocks.target); // Log the deployed address
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  