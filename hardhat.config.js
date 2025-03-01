require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey = fs.readFileSync(".secret").toString();

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
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/e0eed5826a694c0392ed16e13c1e1800",
      accounts: [privateKey]
    },
    mainnet: {
      url: "https://polygon-mainnet.infura.io/v3/e0eed5826a694c0392ed16e13c1e1800",
      accounts: [privateKey]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/e0eed5826a694c0392ed16e13c1e1800",
      accounts: [privateKey]
    },
    ropsten: {
      url:"https://ropsten.infura.io/v3/e0eed5826a694c0392ed16e13c1e1800",
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
