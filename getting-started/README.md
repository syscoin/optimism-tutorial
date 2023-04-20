# Getting started developing for Rollux

[![Discord](https://img.shields.io/discord/1087373765014454322)](https://discord.gg/rollux)
[![Twitter Follow](https://img.shields.io/twitter/follow/RolluxL2?style=social)](https://twitter.com/RolluxL2)

This tutorial teaches you the basics of Rollux development.
Rollux is based upon Optimism Bedrock and is [EVM equivalent](https://medium.com/ethereum-optimism/introducing-evm-equivalence-5c2021deb306), meaning we run a slightly modified version of the same `geth` you run on Ethereum mainnet.
Therefore, the differences between Rollux development and Ethereum development are minor.
But a few differences [do exist](https://community.optimism.io/docs/developers/build/differences/#).


## Rollux endpoint URL

To access any Ethereum type network you need an endpoint. RPC and WSS endpoints for Rollux are visible on [Chainlist](https://chainlist.org/?search=rollux&testnets=true).

Another great option for a Rollux RPC endpoint is [Ankr](https://www.ankr.com/rpc/rollux).


### Network choice

For development purposes we recommend you use either a local development node or [Rollux Tanenbaum](https://rollux.tanenbaum.io/).
That way you don't need to spend real money.
If you need SYS on Rollux Tanenbaum for testing purposes, [you can use this faucet](https://sysdomains.xyz/rollux-faucet).

The tests examples below all use the Rollux Tanenbaum testnet.


## Interacting with Rollux contracts

We have [Hardhat's Greeter contract](https://github.com/nomiclabs/hardhat/blob/master/packages/hardhat-core/sample-projects/basic/contracts/Greeter.sol) on Rollux Tanenbaum, at address [0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816](https://rollux.tanenbaum.io/address/0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816). 
You can verify your development stack configuration by interacting with it. 

As you can see in the different development stacks below, the way you deploy contracts and interact with them on Rollux is almost identical to the way you do it with L1 Ethereum.
The most visible difference is that you have to specify a different endpoint (of course). 
The list of other differences is [here](https://community.optimism.io/docs/developers/build/differences/).

## Development stacks

- [Apeworx](#apeworx)
- [Brownie](#brownie)
- [Foundry](#foundry)
- [Hardhat](#hardhat)
- [Remix](#remix)
- [Truffle](#truffle)
- [Waffle](#waffle)

### Hardhat

In [Hardhat](https://hardhat.org/) you use a configuration similar to [this one](hardhat).

#### Connecting to Rollux

Follow these steps to add Rollux Tanenbaum support to an existing Hardhat project (or a newly created one). 

d
1. Define your mnemonic in `.env`:

   ```sh
      MNEMONIC=test test test test test test test test test test just junk

      # API KEY for Ankr.
      ANKR_API_KEY=

      # URL to access Rollux Tanenbaum (if not using Ankr)
      ROLLUX_TANENBAUM_URL=https://rpc-tanenbaum.rollux.com
   ```

1. Add `dotenv` to your project:

   ```sh
   yarn add dotenv
   ```

1. Edit `hardhat.config.js`:

   1. Use `.env` for your blockchain configuration:

      ```js
      require('dotenv').config()
      ```

   1. Get the correct URL from the configuration:

      ```js
         /*This will default to ROLLUX_TANENBAUM_URL if 
         you do not specify ANKR_API_KEY in .env */
         const rolluxTanenbaumUrl = 
         process.env.ANKR_API_KEY ? 
            `https://rpc.ankr.com/rollux_testnet/${process.env.ANKR_API_KEY}` :
            process.env.ROLLUX_TANENBAUM_URL
      ```


   1. Add a network definition in `module.exports.networks`:

   ```js
   "rollux-tanenbaum": {
      url: rolluxTanenbaumUrl,
      chainId: 57000,
      accounts: { mnemonic: process.env.MNEMONIC }
   }   
   ```


#### Greeter interaction

1. Run the console:
   ```sh
   cd hardhat
   yarn
   yarn hardhat console --network rollux-tanenbaum
   ```

1. Connect to the Greeter contract:   

   ```js
   Greeter = await ethers.getContractFactory("Greeter")
   greeter = await Greeter.attach("0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816")
   ```   


1. Read information from the contract:

   ```js
   await greeter.greet()
   ```

1. Submit a transaction, wait for it to be processed, and see that it affected the state.

   ```js
   tx = await greeter.setGreeting(`Hardhat: Hello ${new Date()}`)
   rcpt = await tx.wait()  
   await greeter.greet()
   ```

#### Deploying a contract

To deploy a contract from the Hardhat console:

```
Greeter = await ethers.getContractFactory("Greeter")
greeter = await Greeter.deploy("Greeter from hardhat")
console.log(`Contract address: ${greeter.address}`)
await greeter.greet()
```

### Truffle

In [Truffle](https://trufflesuite.com/) you use a configuration similar to [this one](truffle).

#### Connecting to Rollux

Follow these steps to add Rollux Tanenbaum support to an existing Truffle project. 


1. Define your network configuration in `.env`:

   ```sh
      MNEMONIC=test test test test test test test test test test just junk

      # API KEY for Ankr.
      ANKR_API_KEY=

      # URL to access Rollux Tanenbaum (if not using Ankr)
      ROLLUX_TANENBAUM_URL=https://rpc-tanenbaum.rollux.com
   ```

1. Add `dotenv` and `@truffle/hdwallet-provider` to your project:

   ```sh
   yarn add dotenv @truffle/hdwallet-provider
   ```


1. Edit `truffle-config.js`:

   1. Uncomment this line:

      ```js
      const HDWalletProvider = require('@truffle/hdwallet-provider')
      ```

   1. Use `.env` for your network configuration:

      ```js
      require('dotenv').config()
      ```

   1. Get the correct URL:

      ```js
         /*This will default to ROLLUX_TANENBAUM_URL if 
         you do not specify ANKR_API_KEY in .env */
         const rolluxTanenbaumUrl = 
         process.env.ANKR_API_KEY ? 
            `https://rpc.ankr.com/rollux_testnet/${process.env.ANKR_API_KEY}` :
            process.env.ROLLUX_TANENBAUM_URL
      ```

   1. Add a network definition in `module.exports.networks`:

      ```js
      "rollux-tanenbaum": {
         provider: () => new HDWalletProvider(
            process.env.MNEMONIC,
            rolluxTanenbaumUrl),
         network_id: 57000
      }
      ```


#### Greeter interaction

1. Compile the contract and run the console.

   ```sh
   truffle compile
   truffle console --network rollux-tanenbaum
   ```

1. Connect to the Greeter contact.

   ```js
   greeter = await Greeter.at("0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816")
   ```

1. Read information from the contact.

   ```js
   await greeter.greet()
   ```

1. Submit a transaction.

   ```js
   tx = await greeter.setGreeting(`Truffle: Hello ${new Date()}`)
   ```

1. Wait a few seconds for the transaction to be processed.s

1. See that the greeting has changed.

   ```js
   greeter.greet()
   ```




#### Contract deployment

You deploy a new contract from the console.

``` 
greeter = await Greeter.new("Greeter from Truffle")
```

Wait a few seconds for the deployment to actually happen and then verify.

```
console.log(`Contract address: ${greeter.address}`)
await greeter.greet()
```





### Remix

#### Connecting to Rollux

In [Remix](https://remix.ethereum.org) you access Rollux through your own wallet.

1. Add Rollux Tanenbaum to your wallet. 
   The easiest way to do this is to use [chainlist.org](https://chainlist.org/?search=rollux&testnets=true).

1. Log on with your wallet to Rollux Tanenbaum.

1. Browse to [Remix](https://remix.ethereum.org/).
1. Click the run icon (<img src="assets/remix-run-icon.png" height="24" valign="top" />).
1. Select the Environment **Injected Provider - MetaMask**.
1. Accept the connection in the wallet.

#### Greeter interaction

1. Click the run icon (<img src="assets/remix-run-icon.png" height="24" valign="top" />).

1. Make sure your environment is **Injected Web3** and the network ID is **57000**, reflected by `Custom (57000) network`.

1. Click the files icon (<img src="assets/remix-files-icon.png" height="24" valign="top" />).

1. Download [Greeter.sol](hardhat/contracts/Greeter.sol) and upload (<img src="assets/remix-upload-icon.png" height="24" valign="top" />) it to Remix under **contracts**.

1. Right-click **contracts > Greeter.sol** and select **Compile**.

1. Open **contracts > artifacts** and see that there's a `Greeter.json` file. This file is the compiled version, the API for the contract, etc.

1. Click the run icon (<img src="assets/remix-run-icon.png" height="24" valign="top" />).

1. Scroll down. 
   In the At Address field, type the contract address `0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816`.
   Then, click **At Address**. 
   Expand the contract to see you can interact with it.

   <img src="assets/remix-connect.png" width="300" />

1. Click **greet** and expand the transaction result in the console (bottom right).

   ![](assets/remix-query.png)

1. Type a greeting (preferably, one that starts with the word `Remix`) and then click **setGreeting**. Approve the transaction in your wallet. 
   Note that if the greeting includes a comma you need to enclose it in quotes.

1. See the results on the console and then click **greet** again to see the greeting changed (see it under the **greet** button).




#### Contract deployment

You deploy a new contract:

1. Type a string for the greeter.

1. Click **Deploy**.

   <img src="assets/remix-deploy.png" width="300" />

1. Confirm the transaction in the wallet.



### Foundry

#### Greeter interaction

Foundry does not give us a JavaScript console, everything can be done from the shell command line.

1. Set the RPC URL and the contract address.

   ```sh
   export ETH_RPC_URL= << Your Rollux Tanenbaum URL goes here >>
   export GREETER=0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816   
   ```

1. Call `greet()`. Notice that the response is provided in hex.

   ```sh
   cast call $GREETER "greet()"
   ```

1. Call `greet()` again, and this time translate to ASCII

   ```sh
   cast call $GREETER "greet()" | cast --to-ascii
   ```

1. Put your mnemonic in a file `mnem.delme` and send a transaction. 

   ```sh
   cast send --mnemonic-path mnem.delme $GREETER "setGreeting(string)" "Foundry hello" --legacy
   ```

1. Test that the greeting has changed:

   ```sh
   cast call $GREETER "greet()" | cast --to-ascii
   ```

#### Contract deployment

Use this command:

```sh
forge create --mnemonic-path ./mnem.delme Greeter \
   --constructor-args "Greeter from Foundry" --legacy
```

### Brownie

If you want to develop in Python, you can use the [Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html) toolstack.

#### Greeter interaction

1. Change to the `brownie` directory under `getting-started`.

1. Specify your mnemonic in `.env`:

   ```sh
   # Put the mnemonic for an account on Rollux here
   MNEMONIC=test test test test test test test test test test just junk
   ```

1. Install packages.

   ```sh
   pip3 install eth-brownie 
   pip3 install dotenv
   ```

1. Add the `rollux-testnet` network.

   ```sh
   brownie networks add Rollux Tanenbaum id=rollux-testnet \
   host=https://rpc-tanenbaum.rollux.com chainid=57000 \
   explorer=https://rollux.tanenbaum.io \
   multicall2=0x1F359C32b5D8c9678b076eAac411A4d2Eb11E697
   ```

1. Start the console.

   ```sh
   brownie console --network rollux-testnet
   ```

   Note that the default color scheme assumes a dark background. 
   If your default background is light, you might want to create a file `brownie-config.yaml` with this content:

   ```yaml
   console:
      show_colors: true
      color_style: manni
   ```

1. Read `.env`

   ```python
   import os
   from dotenv import load_dotenv
   load_dotenv()
   ```

1. Add your accounts to the `accounts` list:

   ```python
   from eth_account import Account
   acct = Account.from_mnemonic(os.getenv("MNEMONIC"))
   accounts.add(acct.privateKey)
   ```

1. Create an object for the contract:

   ```python
   greeter = Greeter.at("0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816")
   ```

1. View the current greeting:

   ```python
   greeter.greet()
   ```

1. Modify the greeting and see the new one:

   ```python
   greeter.setGreeting("Brownie hello", {'from': accounts[0] })
   greeter.greet()
   ```

#### Contract deployment

Use this command:

```python
Greeter.deploy("Hello", {'from': accounts[0]})
```



### Apeworx


#### Connect to Rollux

1. Install [Apeworx](https://www.apeworx.io/) and create a new project.

   ```sh
   pip3 install eth-ape
   ape init
   <type project name>
   ```

1. Install plugins.
   In this tutorial we use Solidity, but Vyper is also supported by Apeworx.

   Clone the ape-rollux repository and use [`setuptools`](https://github.com/pypa/setuptools) for the most up-to-date version:

   ```bash
   git clone https://github.com/bstr156/ape-rollux.git
   cd ape-rollux
   python3 setup.py install
   ```

1. Import your account.
   Type this command, followed by your mnemonic (the 12 word phrase) and a pass phrase to protect it.

   ```sh
   ape accounts import test --use-mnemonic
   ```

1. Edit the configuration file, `ape-config.yaml`:

   ```yaml
   name: greeter

   default_ecosystem: rollux

   geth:
   rollux:
         tanenbaum:
            uri: https://rpc-tanenbaum.rollux.com
   ```

#### Greeter interaction


1. Start the console:

   ```sh
   ape console --network rollux:tanenbaum
   ```

1. Connect to the Greeter contract:   

   ```python
   greeter = project.get_contract("Greeter").at("0x32C00875ca5bc5e6E07A84a39F9fb177d4aeF816")
   ```   

1. Read information from the contract:

   ```python
   greeter.greet()
   ```

1. Submit a transaction.

   ```python
   acct = accounts.load("test")
   greeter.setGreeting("Apeworx says hi ("+acct.address+")", sender=acct)  
   ```

   Sign the transaction and provide the passphrase if necessary.
   Ignore error messages if you get them.

1. Verify the greeting changed.

   ```python
   greeter.greet()
   ```

#### Deploying a contract

To deploy a contract from the Apeworx console:

```
project.get_contract("Greeter").deploy("Hello", sender=acct)
```


## Best practices

It is best to start development with the EVM provided by the development stack. 
Not only is it faster, but such EVMs often have extra features, such as the [ability to log messages from Solidity](https://hardhat.org/tutorial/debugging-with-hardhat-network.html) or a [graphical user interface](https://trufflesuite.com/ganache/).

After you are done with that development, debug your decentralized application using either a development node or the Rollux Tanenbaum test network. 
This lets you debug parts that are Rollux specific such as calls to bridges to transfer assets between layers.

Only when you have a version that works well on a test network should you deploy to the production network, where every transaction has a cost.

### Contract source verification

You don't have to upload your source code to block explorers, but it is a good idea. 
On the test network it lets you issue queries and transactions from the explorer's user interface.
On the production network it lets users know exactly what your contract does, which is conducive to trust.
