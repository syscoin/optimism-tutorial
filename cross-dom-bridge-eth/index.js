#! /usr/local/bin/node

// Transfers between L1 and L2 using the Optimism SDK

const ethers = require("ethers")
const optimismSDK = require("@eth-optimism/sdk")
require('dotenv').config()


const l1Url = process.env.L1_RPC_URL
const l2Url = process.env.L2_RPC_URL


// Global variable because we need them almost everywhere
let crossChainMessenger
let addr    // Our address

// contracts from dev L1-L2
const contractsDev = {
  l1_dev: {
    AddressManager: '0xf2ad472ade2009Ef5eeb26B7fe27BA9fd27dE46A',
    L1CrossDomainMessenger: '0x9032E3EB1DC211ad0280A108303EC238f82A7A7F',
    L1StandardBridge: '0x39CadECd381928F1330D1B2c13c8CAC358Dce65A',
    StateCommitmentChain: ethers.constants.AddressZero,
    CanonicalTransactionChain: ethers.constants.AddressZero,
    BondManager: ethers.constants.AddressZero,
    OptimismPortal: '0x61200B9fcBB421aFD0Bb5A732fe48ec98482E39C',
    L2OutputOracle: '0x63D297aa3feCbf6eEdE0aCd15B0308B9C8379afb',
  },
  l2_dev: {
    L2ToL1MessagePasser: '0x4200000000000000000000000000000000000016',
    DeployerWhitelist: '0x4200000000000000000000000000000000000002',
    L2CrossDomainMessenger: '0x4200000000000000000000000000000000000007',
    GasPriceOracle: '0x420000000000000000000000000000000000000F',
    L2StandardBridge: '0x4200000000000000000000000000000000000010',
    SequencerFeeVault: '0x4200000000000000000000000000000000000011',
    OptimismMintableERC20Factory: '0x4200000000000000000000000000000000000012',
    L1BlockNumber: '0x4200000000000000000000000000000000000013',
    L1Block: '0x4200000000000000000000000000000000000015',
    LegacyERC20ETH: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
    WETH9: '0x4200000000000000000000000000000000000006',
    GovernanceToken: '0x4200000000000000000000000000000000000042',
    LegacyMessagePasser: '0x4200000000000000000000000000000000000000',
    L2ERC721Bridge: '0x4200000000000000000000000000000000000014',
    OptimismMintableERC721Factory: '0x4200000000000000000000000000000000000017',
    ProxyAdmin: '0x4200000000000000000000000000000000000018',
    BaseFeeVault: '0x4200000000000000000000000000000000000019',
    L1FeeVault: '0x420000000000000000000000000000000000001a',
  },
}

const getSigners = async () => {
  const l1RpcProvider = new ethers.providers.JsonRpcProvider(l1Url)
  const l2RpcProvider = new ethers.providers.JsonRpcProvider(l2Url)
  const privateKey = process.env.PK;
  const l1Wallet = new ethers.Wallet(privateKey, l1RpcProvider)
  const l2Wallet = new ethers.Wallet(privateKey, l2RpcProvider)

  return [l1Wallet, l2Wallet]
}   // getSigners


const setup = async () => {
  const [l1Signer, l2Signer] = await getSigners()
  addr = l1Signer.address



  crossChainMessenger = new optimismSDK.CrossChainMessenger({
    l1ChainId: 5700,    // Tanenbaum
    l2ChainId: 57000,  // RolluxDev
    l1SignerOrProvider: l1Signer,
    l2SignerOrProvider: l2Signer,
    contracts: { l1: contractsDev.l1_dev, l2: contractsDev.l2_dev },
    bedrock: true,
    bridges: {
      ETH: {
        Adapter: optimismSDK.ETHBridgeAdapter,
        l1Bridge: contractsDev.l1_dev.L1StandardBridge,
        l2Bridge: contractsDev.l2_dev.L2StandardBridge,
      },
      Standard: {
        Adapter: optimismSDK.StandardBridgeAdapter,
        l1Bridge: contractsDev.l1_dev.L1StandardBridge,
        l2Bridge: contractsDev.l2_dev.L2StandardBridge,
      }
    }
  })
}    // setup



const gwei = BigInt(1e9)
const eth = gwei * gwei   // 10^18
const centieth = eth; // just do one SYS


const reportBalances = async () => {
  const l1Balance = (await crossChainMessenger.l1Signer.getBalance()).toString().slice(0, -9)
  const l2Balance = (await crossChainMessenger.l2Signer.getBalance()).toString().slice(0, -9)

  console.log(`On L1:${l1Balance} Gwei    On L2:${l2Balance} Gwei`)
}    // reportBalances


const depositETH = async () => {


  return;

  console.log("Deposit ETH")
  await reportBalances()
  const start = new Date()

  const response = await crossChainMessenger.depositETH(1000n * gwei)
  console.log(`Transaction hash (on L1): ${response.hash}`)
  await response.wait()
  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
    optimismSDK.MessageStatus.RELAYED)

  await reportBalances()
  console.log(`depositETH took ${(new Date() - start) / 1000} seconds\n\n`)
}     // depositETH()





const withdrawETH = async () => {

  console.log("Withdraw ETH")
  const start = new Date()
  await reportBalances()

  const response = await (new ethers.providers.JsonRpcProvider(l2Url)).getTransactionReceipt("0xffe02f56091429a462bd50d33cce0df83aa0d4da4fd888e48044019f7070c8e1");

  console.log(response);


  // console.log(`Transaction hash (on L2): ${response.hash}`)
  // console.log(`\tFor more information: visit explorer.`)
  // await response.wait()

  console.log("Waiting for status to be READY_TO_PROVE")
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.transactionHash,
    optimismSDK.MessageStatus.READY_TO_PROVE)
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.proveMessage(response.transactionHash)


  console.log("In the challenge period, waiting for status READY_FOR_RELAY")
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response.hash,
    optimismSDK.MessageStatus.READY_FOR_RELAY)
  console.log("Ready for relay, finalizing message now")
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.finalizeMessage(response.hash)

  console.log("Waiting for status to change to RELAYED")
  console.log(`Time so far ${(new Date() - start) / 1000} seconds`)
  await crossChainMessenger.waitForMessageStatus(response,
    optimismSDK.MessageStatus.RELAYED)

  await reportBalances()
  console.log(`withdrawETH took ${(new Date() - start) / 1000} seconds\n\n\n`)
}     // withdrawETH()


const main = async () => {
  await setup()

  await reportBalances();

  await withdrawETH();
  // await depositETH()
  // await withdrawETH()
  // await depositERC20()
  // await withdrawERC20()
}  // main



main().then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })





