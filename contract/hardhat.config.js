const { task } = require("hardhat/config");

require("dotenv/config");
require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("mint", "Mint new asset")
  .addPositionalParam("address", "contract address")
  .addPositionalParam("metadata", "metadata uri")
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getSigner(0);
    const nft = await hre.ethers.getContractAt("NFT", taskArgs.address);
    await nft
      .safeMint(signer.address, taskArgs.metadata)
      .then((tx) => tx.wait());

    console.log("Minted");
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.INFURA_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
