// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";

let ethers;
let TestERC721;
let owner;

async function main() {
  ethers = (await network.connect()).ethers;
  const { wallets } = await getSecrets();
  owner = wallets.owner;
  const receiver = ethers.Wallet.createRandom(); // !!! change this to valid address on production !!!

  const TestERC721Address = ""; // paste here your deployed smart contract address
  if (!ethers.isAddress(TestERC721Address)) {
    console.log("Invalid TestERC721Address");
    return false;
  } else {
    const TestERC721Factory = await ethers.getContractFactory(
      "contracts/TestERC721/TestERC721.sol:TestERC721",
      owner
    );
    TestERC721 = TestERC721Factory.attach(TestERC721Address);
  }

  const tokenId = 2009; // this is a sample value, use proper ID for production
  let tx = await TestERC721.safeMint(owner.address, tokenId);
  await tx.wait(3);

  console.log(
    `TestERC721 NFT with tokenId ${tokenId} has been minted to ${await TestERC721.ownerOf(
      tokenId
    )}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
