pragma solidity 0.4.25;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ThamesBoats.sol";

// NOTES
// https://ethereum.stackexchange.com/questions/54646/bytes4keccak256functionuint-vs-abi-encodewithsignaturebuyuin
//
// Assert.sol: https://github.com/trufflesuite/truffle/blob/develop/packages/truffle-core/lib/testing/Assert.sol
//
// supplychain = new SupplyChain();
//  supplychain = SupplyChain(DeployedAddresses.SupplyChain());
//
// Sol 0.5.0 breaking changes
// https://solidity.readthedocs.io/en/v0.5.0/050-breaking-changes.html?highlight=payable

contract TestThamesBoats {

  // Initial Ether balance
  uint public initialBalance = 1 ether;

  // ThrowProxy assignments
  ThamesBoats public thamesBoats;

  // beforeEach - test setup
  function beforeEach () public {

      thamesBoats = ThamesBoats(DeployedAddresses.ThamesBoats());
      // Set up new contract instances for each test; clean room
      thamesBoats = ThamesBoats(DeployedAddresses.ThamesBoats());
      //thamesBoats = new ThamesBoats();

     // thamesBoats.addMarketAdmin((marketAdmin));
      // Fund the buyer with 10,000,000 wei
   //   address(buyer).transfer(10000000);
  }

  function testAddMarketAdmin() public {
      address test;
      (test) = thamesBoats.owner;
      Assert.equal(test, 2, "marketAdmin has not been made a market admin");
  }
    

  // Allow this contract to receive ether
  function () external payable {}

}

