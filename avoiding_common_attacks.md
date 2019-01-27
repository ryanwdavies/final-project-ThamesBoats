
# Avoiding common attacks

*A document called avoiding_common_attacks.md that explains what measures you took to ensure that your contracts are not susceptible to common attacks. (Module 9 Lesson 3)**

*Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks*

---
We discuss here ideas to help ensure that the contract is secure against attacks [[1](https://www.kingoftheether.com/contract-safety-checklist.html), [2](https://consensys.github.io/smart-contract-best-practices/known_attacks/), [3](https://medium.com/coinmonks/common-attacks-in-solidity-and-how-to-defend-against-them-9bc3994c7c18), [4](https://solidity.readthedocs.io/en/v0.4.24/security-considerations.html#security-considerations)].

#### Reentrancy
We protect against [reentrancy](https://consensys.github.io/smart-contract-best-practices/known_attacks/) in two ways; using a proven design basic pattern and using a function modifier which enforces exclusive use of functions with a global mutex. 

The [withdrawal](https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html) design pattern is used for the withdrawFunds function, which in itself should protect against DAO-style reentrancy attacks. 

The function modifier "*nonReentrant*" is implemented which calls the ReentracyGuard contract before and after the modified function is called, setting and unsetting a global mutex "*reenrancy_lock*". The use of ReentrancyGuard is used carefully, since the mutex is global and create problems with a high degree of concurrency. 

#### Arithmetic Overflow and Underflow
The OpenZepplin SafeMath library is used for all maths operations to prevent against underflow and overflow operations.

Variables which are incremented (++) on each call are uint256 and are inherently protected against overflow, since it is not possible to call a function 2^256 times and affect an overflow.


#### Poison Data - use of Require
require() is used to validate data input and ensure the required conditions are met. Such validation is also used to prevent "*poison data*" attacks.


#### Loops and Gas Limit
Loops have been avoided to reduce gas costs and the risk that the cost of a loop operation may exceed the block gas limit, rendering that function unusable.  

#### Unintended Ether
There are three ways to forcibly send Ether to a contract: sending with a selfdestruct function from another contract; by [calculating the contract address](https://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed) before the contract is created and funding that address; or by setting the contract address as the a mining reward coinbase transaction address. Since this is not preventable it is not good practice to require that the behaviour of the contract should be determined by the balance of the contract address itself. The ThamesBoats contract has no such dependancy.

#### Security Analysis with Mythril
We make use of Mythril for contract verification, *please see the section below*.


### Future Areas for Development 
The security of contract could be improved further by:
* *Bug bounty program* - a program could be started to incentivise community involvement and encourage responsible disclosure of contract bugs.
* *Third party audit* - as widely recommended, an independant  third party audit can help ensure against bugs.

                                           

## Security Analysis with Mythril
We use [Mythril](https://mythx.io/) to check against certain contract [vulnerabilities](https://github.com/ConsenSys/mythril-classic/wiki/Mythril-Detection-Capabilities). 

The analysis highlights a potential Integer Overflow venerability. We discount this as a vulnerability since to overflow uint256 by calling a function would require an unfeasible amount of computation.

```
myth -xo markdown ThamesBoats.sol --max-depth 10
```
## Analysis results for ThamesBoats.sol


### Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10156
- Estimated Gas Usage: 787 - 1072

#### Description

This binary add operation can result in integer overflow.
In file: ThamesBoats.sol:42

#### Code

```
mapping(uint256 => Purchase) public purchases
```

### Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10162
- Estimated Gas Usage: 1199 - 1484

#### Description

This binary add operation can result in integer overflow.
In file: ThamesBoats.sol:42

#### Code

```
mapping(uint256 => Purchase) public purchases
```

### Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10200
- Estimated Gas Usage: 1647 - 2262

#### Description

This binary add operation can result in integer overflow.
In file: ThamesBoats.sol:42

#### Code

```
mapping(uint256 => Purchase) public purchases
```

### Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10206
- Estimated Gas Usage: 2059 - 2674

#### Description

This binary add operation can result in integer overflow.
In file: ThamesBoats.sol:42

#### Code

```
mapping(uint256 => Purchase) public purchases
```

