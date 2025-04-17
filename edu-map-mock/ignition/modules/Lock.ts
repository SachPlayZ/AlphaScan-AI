const hre = require("hardhat");

async function main() {
  const deployedContract = await hre.ethers.deployContract("ALTToken");
  await deployedContract.waitForDeployment();
  console.log(`ALTToken contract deployed to ${deployedContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
