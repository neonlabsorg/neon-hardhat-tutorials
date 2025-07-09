// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";

let ethers;
let owner;

async function main() {
  ethers = (await network.connect()).ethers;
  const { wallets } = await getSecrets();
  owner = wallets.owner;

  const TestERC20 = await ethers.deployContract(
    "contracts/TestERC20/TestERC20.sol:TestERC20",
    owner
  );
  await TestERC20.waitForDeployment();

  console.log(`TestERC20 token contract is deployed to ${TestERC20.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
