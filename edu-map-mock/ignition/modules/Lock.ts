const hre = require("hardhat");

async function main() {
  const deployedContract = await hre.ethers.deployContract("ALTToken");
  const deployedContract2 = await hre.ethers.deployContract("DealToken");
  const deployedContract3 = await hre.ethers.deployContract("Linking");
  await deployedContract.waitForDeployment();
  await deployedContract2.waitForDeployment();
  await deployedContract3.waitForDeployment();
  console.log(`ALTToken contract deployed to ${deployedContract.target}`);
  console.log(`DealToken contract deployed to ${deployedContract2.target}`);
  console.log(`Linking contract deployed to ${deployedContract3.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
