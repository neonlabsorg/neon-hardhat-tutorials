# neon-hardhat-tutorials

## Secret values setup

Secret values (such as private keys) used in tests and scripts should be stored using Hardhat's encrypted keystore file.
This keystore file is specific to this _Hardhat_ project, you can run the following command in the CLI to display the
keystore file path for this _Hardhat_ project:

```shell
npx hardhat keystore path
```

To store encrypted secret values into this project's Hardhat keystore file, run the following commands in the CLI:

```shell
npx hardhat keystore set PRIVATE_KEY_OWNER
```

```shell
npx hardhat keystore set PRIVATE_KEY_USER_1
```

You will be asked to choose a password (which will be used to encrypt provided secrets) and to enter the secret values
to be encrypted. The keystore password can be added to the `.env` file (as `KEYSTORE_PASSWORD`) which allows secrets
to be decrypted automatically when running Hardhat tests and scripts. Otherwise, each running Hardhat test and script
will have the CLI prompt a request to enter the keystore password manually.

> [!CAUTION]
> Although it is not recommended (as it involves risks of leaking secrets) it is possible to store plain-text secrets in
> `.env` file using the same keys as listed above. When doing so, user will be asked to confirm wanting to use plain-text
> secrets found in `.env` file when running Hardhat tests and scripts.

## Deploying an ERC20 token example on Neon EVM Devnet

1. To deploy `TestERC20.sol`, run the following -

```sh
npx hardhat run scripts/TestERC20/deploy.js --network neondevnet
```

2. To initiate a transfer from the deployer address to a randomly generated address and add the deployed address from the above step in the `transfer.js` file and run the following -

```sh
npx hardhat run scripts/TestERC20/transfer.js --network neondevnet
```

## Deploying an ERC721 non-fungible token example on Neon EVM Devnet

This is an example of deploying an ERC721 non-fungible token on Neon EVM Devnet and Mainnet.

1. To deploy `TestERC721.sol`, run the following -

```sh
npx hardhat run scripts/TestERC721/deploy.js --network neondevnet
```

2. Paste the deployed contract address from the above step in the `mint.js` file. to mint some NFTs to the deployer address, run the following -

```sh
npx hardhat run scripts/TestERC721/mint.js --network neondevnet
```

## Chainlink Price Data Feeds Integration Example on Neon EVM Devnet

To deploy `TestChainlink.sol`, run the following -

```sh
npx hardhat run scripts/TestChainlink/deploy.js --network neondevnet
```

## Reading Solana token account data example on Neon EVM Devnet

To deploy `TestReadTokenAccountData.sol`, run the following -

```sh
npx hardhat run scripts/TestReadSolanaData/TestReadTokenAccountData.js --network neondevnet
```

## Examples of Interacting with Solana from Neon EVM

The following examples are based on the `Composability` feature of Solana. `TestCallSolana.sol` contract is deployed on both Neon EVM Devnet and Mainnet and the contract addresses are added in the `config.js` file.

1. [Mint an SPLToken](https://github.com/neonlabsorg/neon-hardhat-tutorials/blob/main/scripts/TestCallSolana/MintSPLToken.js) - This script mints a new SPLToken and attach Metaplex metadata to it on Solana Devnet via Neon EVM Devnet.

```sh
npx hardhat run scripts/TestCallSolana/MintSPLToken.js --network neondevnet
```

2. [Transfer SOLs between accounts](https://github.com/neonlabsorg/neon-hardhat-tutorials/blob/main/scripts/TestCallSolana/TransferSOLsBetweenAccounts.js) - This script demonstrates transferring SOLs between two accounts on Solana Devnet via Neon EVM Devnet.

```sh
npx hardhat run scripts/TestCallSolana/TransferSOLsBetweenAccounts.js --network neondevnet
```

3. [Transfer SPLToken between accounts](https://github.com/neonlabsorg/neon-hardhat-tutorials/blob/main/scripts/TestCallSolana/TransferSPLTokenBetweenAccounts.js) - This script demonstrates transferring an SPLToken between two accounts on Solana Devnet via Neon EVM Devnet.

```sh
npx hardhat run scripts/TestCallSolana/TransferSPLTokenBetweenAccounts.js --network neondevnet
```
