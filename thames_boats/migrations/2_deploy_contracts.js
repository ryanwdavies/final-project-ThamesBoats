var SafeMath = artifacts.require("./SafeMath.sol");
var ReentrancyGuard = artifacts.require("./ReentrancyGuard.sol");
var ThamesBoats = artifacts.require("./ThamesBoats.sol");

module.exports = function(deployer, accounts) {
    deployer.deploy(ReentrancyGuard);
    deployer.deploy(SafeMath);
    deployer.link(ReentrancyGuard, ThamesBoats);
    deployer.link(SafeMath, ThamesBoats);
    deployer.deploy(ThamesBoats);
};
