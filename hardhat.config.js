require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
// require("hardhat-gas-reporter");
require("solidity-coverage");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
const fs = require("fs");
const privateKey = fs
  .readFileSync('C:\\Users\\RaymondYuan\\workspace\\contract\\contract-demo\\.env')
  .toString()
  .trim();

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

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.8",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:8545",
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },
    // bscmainnet:{
    //     url:'https://bsc-dataseed.binance.org/',
    //     accounts: [process.env.PRIVATE_KEY_ADMIN_BSC_MAINNET],
    //     // chainId: 97,
    //     gas: 12000000,
    //     blockGasLimit: 0x1fffffffffffff,
    //     allowUnlimitedContractSize: true,
    //     timeout: 1800000
    // },

    // bsctestnet:{
    //     // url:'https://data-seed-prebsc-1-s1.binance.org:8545/',
    //     // url:'https://apis.ankr.com/50bd5c469ec54f36b130ccd2822fc3d5/5d0917ddd371b9a49e4545790b5a918e/binance/full/test',
    //     url: process.env.GET_THE_BLOCK_KEY_03,
    //     // url:'https://data-seed-prebsc-2-s2.binance.org:8545/',
    //     // url:'https://speedy-nodes-nyc.moralis.io/636ddc42206b702437b677d7/bsc/testnet',
    //     accounts: [
    //         process.env.PRIVATE_KEY_ADMIN,            // ipland admin 0x8ADadDD29FaE5fFadD6D8D06E333BFa53fbD4277
    //         process.env.IPLAND_TESTER_01_PRIVATE_KEY, // ipland admin 0x8ADadDD29FaE5fFadD6D8D06E333BFa53fbD4277
    //     ],
    //     // chainId: 97,
    //     gas: 12000000,
    //     gasPrice: 20000000000,
    //     blockGasLimit: 0x1fffffffffffff,
    //     allowUnlimitedContractSize: true,
    //     timeout: 1800000
    // },
    // bsctestnetmainland:{
    //     // url:'https://data-seed-prebsc-1-s1.binance.org:8545/',
    //     url:'https://data-seed-prebsc-2-s3.binance.org:8545/',
    //     // url:'https://data-seed-prebsc-2-s2.binance.org:8545/',
    //     accounts: [
    //         process.env.PRIVATE_KEY_ADMIN
    //     ],
    //     // chainId: 97,
    //     gas: 12000000,
    //     blockGasLimit: 0x1fffffffffffff,
    //     allowUnlimitedContractSize: true,
    //     timeout: 1800000
    // },

    // arbitrum:{
    //     // url: 'https://rinkeby.arbitrum.io/rpc',
    //     url: process.env.INFURA_KEY,
    //     accounts: [
    //         process.env.PRIVATE_KEY_ADMIN,
    //       ],
    //       timeout: 1800000
    //     // ChainID: 421611
    //     // Symbol: ETH
    // },
    // mumbai:{
    //     // url: 'https://rpc-mumbai.matic.today',
    //     url: 'https://matic-mumbai.chainstacklabs.com',
    //     // url: 'https://matic-mumbai.chainstacklabs.com',
    //     accounts: [
    //         process.env.PRIVATE_KEY_ADMIN,
    //     ],
    //     maxPriorityFeePerGas: 40000000000,
    //     timeout: 18000000
    // },
    // matic:{
    //     url: 'https://polygon-rpc.com/',
    //     accounts: [
    //         process.env.PRIVATE_KEY_ADMIN,
    //     ],
    //     // chainId: 137,
    //     // gas: 12000000,
    //     gasPrice: 50000000000,
    //     // blockGasLimit: 0x1fffffffffffff,
    //     // allowUnlimitedContractSize: true,
    //     timeout: 18000000
    // },
    rinkeby: {
      // url: 'https://eth.getblock.io/rinkeby/?api_key=' + process.env.GET_THE_BLOCK_KEY_01,
      // url: 'https://eth.getblock.io/rinkeby/?api_key=' + process.env.GET_THE_BLOCK_KEY_02,
      url: "https://rpc.ankr.com/eth_rinkeby",
      accounts: [privateKey],
      // chainId: 137,
      // gas: 12000000,
      // gasPrice: 3300000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 180000000,
    },
    hardhat: {
      initialBaseFeePerGas: 10, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  // gasReporter: {
  //   enabled: true,
  //   currency: "USD",
  // },
  etherscan: {
    apiKey: 'QPYP41XP5TR4EUF42TMRQITA9MIS2C5F9T',
  },
};
