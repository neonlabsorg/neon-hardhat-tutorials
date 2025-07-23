//
//
// Test purpose - in this script we will be minting a new SPLToken instance and adding a Metaplex data to it. Mint & freeze authorities are given to the contract account.
//
//

import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";
import web3 from "@solana/web3.js";
import { config } from "./config";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMint2Instruction,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

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
  let solanaTx;
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

  const payer = ethers.encodeBase58(await TestCallSolana.getPayer());
  console.log(payer, "payer");

  const contractPublicKeyInBytes = await TestCallSolana.getNeonAddress(
    TestCallSolanaAddress
  );
  const contractPublicKey = ethers.encodeBase58(contractPublicKeyInBytes);
  console.log(contractPublicKey, "contractPublicKey");

  const user1PublicKeyInBytes = await TestCallSolana.getNeonAddress(
    owner.address
  );
  const user1PublicKey = ethers.encodeBase58(user1PublicKeyInBytes);
  console.log(user1PublicKey, "user1PublicKey");

  const seed = "seed" + Date.now().toString(); // random seed on each script call
  const createWithSeed = await web3.PublicKey.createWithSeed(
    new web3.PublicKey(contractPublicKey),
    seed,
    new web3.PublicKey(TOKEN_PROGRAM_ID)
  );
  console.log(createWithSeed, "createWithSeed");

  const minBalance = await connection.getMinimumBalanceForRentExemption(
    MINT_SIZE
  );

  // ============================= createAccountWithSeed INSTRUCTION ====================================
  solanaTx = new web3.Transaction();
  solanaTx.add(
    web3.SystemProgram.createAccountWithSeed({
      fromPubkey: new web3.PublicKey(payer),
      basePubkey: new web3.PublicKey(contractPublicKey),
      newAccountPubkey: createWithSeed,
      seed: seed,
      lamports: minBalance, // enough lamports to make the account rent exempt
      space: MINT_SIZE,
      programId: new web3.PublicKey(TOKEN_PROGRAM_ID), // programId
    })
  );

  // ============================= InitializeMint2 INSTRUCTION ====================================
  solanaTx.add(
    createInitializeMint2Instruction(
      createWithSeed,
      9, // decimals
      new web3.PublicKey(contractPublicKey), // mintAuthority
      new web3.PublicKey(contractPublicKey), // freezeAuthority
      new web3.PublicKey(TOKEN_PROGRAM_ID) // programId
    )
  );

  // ============================= CreateMetadataAccountV3Instruction INSTRUCTION ====================================
  const metaplex = new Metaplex(connection);
  const metadata = metaplex.nfts().pdas().metadata({ mint: createWithSeed });
  solanaTx.add(
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadata,
        mint: createWithSeed,
        mintAuthority: new web3.PublicKey(contractPublicKey),
        payer: new web3.PublicKey(payer),
        updateAuthority: new web3.PublicKey(contractPublicKey),
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: "Doge coin on Neon EVM",
            symbol: "DOGE",
            uri: "https://ipfs.io/ipfs/QmW2JdmwWsTVLw1Gx4ympCn1VHJiuojfNLS5ZNLEPcBd5x/doge.json",
            sellerFeeBasisPoints: 0,
            collection: null,
            creators: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    )
  );

  console.log("Processing batchExecute method with all instructions ...");
  [tx, receipt] = await config.utils.batchExecute(
    solanaTx.instructions,
    [minBalance, 0, 100000000],
    TestCallSolana,
    undefined,
    owner
  );
  console.log(tx, "tx");
  for (let i = 0, len = receipt.logs.length; i < len; ++i) {
    console.log(receipt.logs[i].args, " receipt args instruction #", i);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
