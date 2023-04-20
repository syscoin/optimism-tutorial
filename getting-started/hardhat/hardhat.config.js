require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

//This will default to ROLLUX_TANENBAUM_URL if you do not specify ANKR_API_KEY in .env
const rolluxTanenbaumUrl = 
  process.env.ANKR_API_KEY ? 
    `https://rpc.ankr.com/rollux_testnet/${process.env.ANKR_API_KEY}` :
    process.env.ROLLUX_TANENBAUM_URL

const words = process.env.MNEMONIC.match(/[a-zA-Z]+/g).length
validLength = [12, 15, 18, 24]
if (!validLength.includes(words)) {
   console.log(`The mnemonic (${process.env.MNEMONIC}) is the wrong number of words`)
   process.exit(-1)
}

module.exports = {
  solidity: "0.8.13",
  networks: {
    "local-devnode": {
       url: "http://localhost:8545",
       accounts: { mnemonic: "test test test test test test test test test test just junk" }
    },
    "rollux-tanenbaum": {
       url: rolluxTanenbaumUrl,
       chainId: 57000,
       accounts: { mnemonic: process.env.MNEMONIC }
    }
  }
};
