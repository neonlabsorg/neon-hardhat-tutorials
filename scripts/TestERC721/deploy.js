import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";

let ethers;
let owner;

async function main() {
  ethers = (await network.connect()).ethers;
  const { wallets } = await getSecrets();
  owner = wallets.owner;

  const TestERC721 = await ethers.deployContract(
    "contracts/TestERC721/TestERC721.sol:TestERC721",
    owner
  );
  await TestERC721.waitForDeployment();

  console.log(`TestERC721 token contract is deployed to ${TestERC721.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
