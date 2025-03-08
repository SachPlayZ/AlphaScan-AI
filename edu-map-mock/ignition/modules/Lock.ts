const hre = require("hardhat");

async function main() {
  const deployedContract = await hre.ethers.deployContract("Linking");
  await deployedContract.waitForDeployment();
  console.log(`Linking contract deployed to ${deployedContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
