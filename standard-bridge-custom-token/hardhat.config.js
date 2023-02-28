// Plugins
require('@nomiclabs/hardhat-ethers')

// Load environment variables from .env
require('dotenv').config();

// const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
// validLength = [12, 15, 18, 24]
// if (!validLength.includes(words)) {
//   console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
//   process.exit(-1)
// }

module.exports = {
  networks: {
    'tanenbaum': {
      chainId: 5700,
      url: `https://rpc.tanenbaum.io`,
      accounts: [process.env.PK]
    },
    'rollux': {
      chainId: 57000,
      url: `https://rpc-bedrock.rollux.com/`,
      accounts: [process.env.PK]
    }
  },
  solidity: '0.8.13',
}
