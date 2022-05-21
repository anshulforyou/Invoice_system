/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
const{ROPSTEN_TESTNET_URL, PRIVATE_KEY} = process.env;
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    hardhat: {},
    ropsten: {
      url:ROPSTEN_TESTNET_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  paths: {
    artifacts: "./src/artifacts",
  },
  solidity: "0.8.7",
};
