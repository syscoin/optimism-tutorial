// Plugins
require('@nomiclabs/hardhat-ethers')

// Load environment variables from .env
require('dotenv').config();

const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
validLength = [12, 15, 18, 24]
if (!validLength.includes(words)) {
  console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
  process.exit(-1)
}

module.exports = {
  networks: {
    'tanenbaum': {
      chainId: 5700,
      url: `https://rpc.tanenbaum.io`,
      accounts: { mnemonic: process.env.MNEMONIC }
    },
    'optimism-mainnet': {
      chainId: 10,
      url: `https://rpc-bedrock.rollux.com/`,
      accounts: { mnemonic: process.env.MNEMONIC }
    }
  },
  solidity: '0.8.13',
}
