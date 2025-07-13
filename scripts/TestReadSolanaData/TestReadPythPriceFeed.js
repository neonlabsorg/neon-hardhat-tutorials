// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";
import { NEON_CONFIG } from "../NEON_CONFIG";

let ethers;
let networkName;
let TestReadPythPriceFeed;
let owner;

async function main() {
  ethers = (await network.connect()).ethers;
  networkName = (await network.connect()).networkName;
  const { wallets } = await getSecrets();
  owner = wallets.owner;

  const TestReadPythPriceFeedAddress = "";

  const TestReadPythPriceFeedFactory = await ethers.getContractFactory(
    "contracts/TestReadSolanaData/TestReadPythPriceFeed.sol:TestReadPythPriceFeed",
    owner
  );

  let PYTH_PRICE_FEEDS;
  if (networkName == "neonmainnet") {
    PYTH_PRICE_FEEDS = NEON_CONFIG.MAINNET.PYTH.PYTH_PRICE_FEEDS;
  } else if (networkName == "neondevnet") {
    PYTH_PRICE_FEEDS = NEON_CONFIG.DEVNET.PYTH.PYTH_PRICE_FEEDS;
  }

  if (ethers.isAddress(TestReadPythPriceFeedAddress)) {
    TestReadPythPriceFeed = TestReadPythPriceFeedFactory.attach(
      TestReadPythPriceFeedAddress
    );
  } else {
    TestReadPythPriceFeed = await ethers.deployContract(
      "contracts/TestReadSolanaData/TestReadPythPriceFeed.sol:TestReadPythPriceFeed",
      owner
    );
    await TestReadPythPriceFeed.waitForDeployment();

    console.log(
      `TestReadPythPriceFeed deployed to ${TestReadPythPriceFeed.target}`
    );
  }

  let neonPrice = await TestReadPythPriceFeed.readSolanaPythPriceFeed(
    PYTH_PRICE_FEEDS.NEON_USD,
    0,
    await TestReadPythPriceFeed.readSolanaDataAccountLen(
      PYTH_PRICE_FEEDS.NEON_USD
    )
  );
  console.log(neonPrice, "neonPrice");

  let solPrice = await TestReadPythPriceFeed.readSolanaPythPriceFeed(
    PYTH_PRICE_FEEDS.SOL_USD,
    0,
    await TestReadPythPriceFeed.readSolanaDataAccountLen(
      PYTH_PRICE_FEEDS.SOL_USD
    )
  );
  console.log(solPrice, "solPrice");

  let ethPrice = await TestReadPythPriceFeed.readSolanaPythPriceFeed(
    PYTH_PRICE_FEEDS.ETH_USD,
    0,
    await TestReadPythPriceFeed.readSolanaDataAccountLen(
      PYTH_PRICE_FEEDS.ETH_USD
    )
  );
  console.log(ethPrice, "ethPrice");

  let btcPrice = await TestReadPythPriceFeed.readSolanaPythPriceFeed(
    PYTH_PRICE_FEEDS.BTC_USD,
    0,
    await TestReadPythPriceFeed.readSolanaDataAccountLen(
      PYTH_PRICE_FEEDS.BTC_USD
    )
  );
  console.log(btcPrice, "btcPrice");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
