//
//
// Test purpose - in this script we will be creating ATA account instructions for the contract and the test users ONLY if their ATA accounts are not currently made yet. ATA account is a primary Token Account. The Token Mint address have to be defined in the tokenMintPublicKey variable. You can place any SPLToken address in that variable or head to MintSPLToken.js test and deploy a SPLToken there. Anyone can create ATA for any account for any Token Mint.
//
//

import { network } from "hardhat";
import { getSecrets } from "../../neon-secrets.js";
import web3 from "@solana/web3.js";
import { config } from "./config";
import {
  ACCOUNT_SIZE,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

let ethers;
let networkName;
let owner;
let user1;

async function main() {
  ethers = (await network.connect()).ethers;
  networkName = (await network.connect()).networkName;
  const { wallets } = await getSecrets();
  owner = wallets.owner;
  user1 = wallets.user1;

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
  const tokenMintPublicKey = "8hQ8pZXBvTXim93E9TyweEucUJ9MLkcxaaYZPedyC2M";
  if (tokenMintPublicKey == "") {
    return console.error(
      "Before proceeding with instructions execution please set value for the tokenMintPublicKey variable."
    );
  }
  const token = new web3.PublicKey(tokenMintPublicKey);

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

  const user2PublicKeyInBytes = await TestCallSolana.getNeonAddress(
    user1.address
  );
  const user2PublicKey = ethers.encodeBase58(user2PublicKeyInBytes);
  console.log(user2PublicKey, "user2PublicKey");

  const minBalance = await connection.getMinimumBalanceForRentExemption(
    ACCOUNT_SIZE
  );
  console.log(minBalance, "minBalance");

  // ============================= SPLTOKEN ACCOUNT ATA CREATION EXAMPLE ====================================
  let ataContract = await getAssociatedTokenAddress(
    // calculates Token Account PDA of some account
    token,
    new web3.PublicKey(contractPublicKey),
    true
  );
  console.log(ataContract, "ataContract");

  const contractInfo = await connection.getAccountInfo(ataContract);
  console.log(contractInfo, "contractInfo");
  if (!contractInfo || !contractInfo.data) {
    // initialize contract's Token Account
    solanaTx = new web3.Transaction();
    solanaTx.add(
      createAssociatedTokenAccountInstruction(
        new web3.PublicKey(payer),
        ataContract,
        new web3.PublicKey(contractPublicKey),
        token
      )
    );
    [tx, receipt] = await config.utils.execute(
      solanaTx.instructions[0],
      minBalance,
      TestCallSolana,
      undefined,
      owner
    );
    console.log(tx, "tx");
    console.log(receipt.logs[0].args, "receipt args");
  }

  let ataUser1 = await getAssociatedTokenAddress(
    token,
    new web3.PublicKey(user1PublicKey),
    true
  );
  console.log(ataUser1, "ataUser1");

  const user1Info = await connection.getAccountInfo(ataUser1);
  console.log(user1Info, "user1Info");
  if (!user1Info || !user1Info.data) {
    // initialize contract's Token Account
    solanaTx = new web3.Transaction();
    solanaTx.add(
      createAssociatedTokenAccountInstruction(
        new web3.PublicKey(payer),
        ataUser1,
        new web3.PublicKey(user1PublicKey),
        token
      )
    );
    [tx, receipt] = await config.utils.execute(
      solanaTx.instructions[0],
      minBalance,
      TestCallSolana,
      undefined,
      owner
    );
    console.log(tx, "tx");
    console.log(receipt.logs[0].args, "receipt args");
  }

  let ataUser2 = await getAssociatedTokenAddress(
    token,
    new web3.PublicKey(user1PublicKey),
    true
  );
  console.log(ataUser2, "ataUser2");

  const user2Info = await connection.getAccountInfo(ataUser2);
  console.log(user2Info, "user2Info");
  if (!user2Info || !user2Info.data) {
    // initialize contract's Token Account
    solanaTx = new web3.Transaction();
    solanaTx.add(
      createAssociatedTokenAccountInstruction(
        new web3.PublicKey(payer),
        ataUser2,
        new web3.PublicKey(user2PublicKey),
        token
      )
    );
    [tx, receipt] = await config.utils.execute(
      solanaTx.instructions[0],
      minBalance,
      TestCallSolana,
      undefined,
      user1
    );
    console.log(tx, "tx");
    console.log(receipt.logs[0].args, "receipt args");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
