var HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = '';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 1,
      gas: 6000000
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      gasPrice: 1,
      gas: 6000000
    },
   rinkerby: {
     provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/01227a0f7c0f46c8a8e050b12093e941")
           },
         network_id: 4,
        // gasPrice: 1,
        gas: 5800000      //make sure this gas allocation isn't over 4M, which is the max
         },
   ropsten: {
     provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://ropsten.infura.io/v3/01227a0f7c0f46c8a8e050b12093e941")
           },
         network_id: 3,
        // gasPrice: 1,
        gas: 5800000      //make sure this gas allocation isn't over 4M, which is the max
         }
  },
 compilers: { 
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
       },
     version: "0.5.2"
    }
  }
};

