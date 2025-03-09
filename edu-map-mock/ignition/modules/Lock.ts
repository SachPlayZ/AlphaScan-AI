const hre = require("hardhat");

async function main() {
  const deployedContract = await hre.ethers.deployContract("DealToken");
  await deployedContract.waitForDeployment();
  console.log(`DealToken contract deployed to ${deployedContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
