//
//
// Test purpose - in this script we will requesting the createResource method of the SolanaCall precompile. We will be passing a random generated salt which can also be passed to method getResourceAddress in order to get the account address previously made by the createResource instruction. This method can be used to create account with any size defined by us ( can be used instead of createAccountWithSeed )
//
//

import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";
import web3 from "@solana/web3.js";
import { config } from "./config";
import { ACCOUNT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token";

let ethers;
let networkName;
let owner;

async function main() {
  ethers = (await network.connect()).ethers;
  networkName = (await network.connect()).networkName;
  const { wallets } = await getSecrets();
  owner = wallets.owner;

  let SOLANA_NODE;
  let TestCallSolanaAddress;
  if (networkName == "neonmainnet") {
    SOLANA_NODE = config.SOLANA_NODE_MAINNET;
    TestCallSolanaAddress = config.CALL_SOLANA_SAMPLE_CONTRACT_MAINNET;
  } else if (networkName == "neondevnet") {
    SOLANA_NODE = config.SOLANA_NODE;
    TestCallSolanaAddress = config.CALL_SOLANA_SAMPLE_CONTRACT;
  }

  const connection = new web3.Connection(SOLANA_NODE, "processed");

  const TestCallSolanaFactory = await ethers.getContractFactory(
    "contracts/TestCallSolana/TestCallSolana.sol:TestCallSolana",
    owner
  );
  let TestCallSolana;
  let tx;
  let receipt;

  if (ethers.isAddress(TestCallSolanaAddress)) {
    TestCallSolana = TestCallSolanaFactory.attach(TestCallSolanaAddress);
  } else {
    TestCallSolana = await ethers.deployContract(
      "contracts/TestCallSolana/TestCallSolana.sol:TestCallSolana",
      owner
    );
    await TestCallSolana.waitForDeployment();

    TestCallSolanaAddress = TestCallSolana.target;
    console.log(`TestCallSolana deployed to ${TestCallSolana.target}`);
  }

  const contractPublicKeyInBytes = await TestCallSolana.getNeonAddress(
    TestCallSolanaAddress
  );
  const contractPublicKey = ethers.encodeBase58(contractPublicKeyInBytes);
  console.log(contractPublicKey, "contractPublicKey");

  // ============================= SPLTOKEN ACCOUNT ATA CREATION EXAMPLE ====================================
  console.log("Creating SPLToken account through createResource method ...");
  let salt = ethers.encodeBytes32String("salt" + Date.now().toString()); // random seed on each script call
  tx = await TestCallSolana.createResource(
    salt,
    ACCOUNT_SIZE,
    await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE),
    config.utils.publicKeyToBytes32(TOKEN_PROGRAM_ID)
  );
  receipt = await tx.wait(3);
  console.log(tx, "tx");
  console.log(receipt.logs[0].args, "receipt args");

  let getResourceAddress = await TestCallSolana.connect(
    owner
  ).getResourceAddress(salt);
  console.log(getResourceAddress, "getResourceAddress");

  // ============================= ACCOUNT CREATION EXAMPLE ====================================
  console.log("Creating Account through createResource method ...");
  salt = ethers.encodeBytes32String("salt" + Date.now().toString()); // random seed on each script call
  tx = await TestCallSolana.createResource(
    salt,
    0,
    await connection.getMinimumBalanceForRentExemption(0),
    config.utils.publicKeyToBytes32(web3.SystemProgram.programId)
  );
  receipt = await tx.wait(3);
  console.log(tx, "tx");
  console.log(receipt.logs[0].args, "receipt args");

  getResourceAddress = await TestCallSolana.connect(owner).getResourceAddress(
    salt
  );
  console.log(getResourceAddress, "getResourceAddress");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
