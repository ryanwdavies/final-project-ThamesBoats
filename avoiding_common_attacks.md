# Avoiding common attacks

*A document called avoiding_common_attacks.md that explains what measures you took to ensure that your contracts are not susceptible to common attacks. (Module 9 Lesson 3)**

*Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks*

We consider the aspect and ideas below to ensure that the contract is secure against attack.

#### Reentrancy
We protect against [reentrancy](https://consensys.github.io/smart-contract-best-practices/known_attacks/) in two ways; using a proven design basic pattern and using a function modifier which enforces exclusive use of functions with a global mutex. 

The [withdrawal](https://solidity.readthedocs.io/en/v0.4.24/common-patterns.html) design pattern is used for the withdrawFunds function, which in itself should protect against DAO-style reentrancy attacks. 

The function modifier "*nonReentrant*" is implemented which calls the ReentracyGuard contract before and after the modified function is called, setting and unsetting a global mutex "*reenrancy_lock*".

#### Overflow and Underflow
The OpenZepplin SafeMath library is used for all maths operations to prevent against underflow and overflow operations.


use audited code / libs
Overflow / underflow
Poison data - require conditions to check all input
All data is public
automated testing, testnet used

https://consensys.github.io/smart-contract-best-practices/

https://www.kingoftheether.com/contract-safety-checklist.html


### Security Analysis with Mythril
We use [Mythril](https://mythx.io/) to check against certain contract [vulnerabilities](https://github.com/ConsenSys/mythril-classic/wiki/Mythril-Detection-Capabilities). The output is a the bottom of this file since it is lengthy.

The analysis reduces to two findings: 
1.  
```
==== Integer Overflow ====
SWC ID: 101
Type: Warning
Contract: ThamesBoats
Function name: getBoat(uint256)
PC address: 8184
Estimated Gas Usage: 1622 - 3136
This binary add operation can result in integer overflow.
```



### Areas for progress and improvement
The security of TB could be improved further by:
* *Bug bounty program* - a program to incentivise community 
Third party audit




myth -xo markdown ThamesBoats.sol



# Analysis results for ThamesBoats.sol

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `addBoat(string,string,uint256,uint256)`
- PC address: 3150
- Estimated Gas Usage: 406 - 501

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:4

### Code

```
trancyGuard.sol";

/// @title A mar
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `addBoat(string,string,uint256,uint256)`
- PC address: 3235
- Estimated Gas Usage: 582 - 677

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:4

### Code

```
trancyGuard.sol";

/// @title A mar
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `addClub(string,string)`
- PC address: 4596
- Estimated Gas Usage: 338 - 433

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:4

### Code

```
trancyGuard.sol";

/// @title A mar
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `addClub(string,string)`
- PC address: 4681
- Estimated Gas Usage: 514 - 609

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:4

### Code

```
trancyGuard.sol";

/// @title A mar
```

## Exception state
- SWC ID: 110
- Type: Informational
- Contract: ThamesBoats
- Function name: `clubList(uint256)`
- PC address: 6252
- Estimated Gas Usage: 769 - 864

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: ./contracts/ThamesBoats.sol:24

### Code

```
uint256[] public clubList
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getBoat(uint256)`
- PC address: 8184
- Estimated Gas Usage: 1622 - 3136

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:234

### Code

```
Boat memory boat = boats[boatId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getBoat(uint256)`
- PC address: 8346
- Estimated Gas Usage: 2647 - 4539

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:234

### Code

```
Boat memory boat = boats[boatId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getBoat(uint256)`
- PC address: 8356
- Estimated Gas Usage: 3068 - 5055

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:234

### Code

```
Boat memory boat = boats[boatId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getBoat(uint256)`
- PC address: 8366
- Estimated Gas Usage: 3489 - 5571

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:234

### Code

```
Boat memory boat = boats[boatId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `boats(uint256)`
- PC address: 8723
- Estimated Gas Usage: 1432 - 2000

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:38

### Code

```
mapping(uint256 => Boat) public boats
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `boats(uint256)`
- PC address: 8881
- Estimated Gas Usage: 2445 - 3296

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:38

### Code

```
mapping(uint256 => Boat) public boats
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `boats(uint256)`
- PC address: 8887
- Estimated Gas Usage: 2857 - 3708

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:38

### Code

```
mapping(uint256 => Boat) public boats
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `boats(uint256)`
- PC address: 8893
- Estimated Gas Usage: 3269 - 4120

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:38

### Code

```
mapping(uint256 => Boat) public boats
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getClub(uint256)`
- PC address: 9049
- Estimated Gas Usage: 1007 - 2473

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:206

### Code

```
Club memory club = clubs[clubId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getClub(uint256)`
- PC address: 9211
- Estimated Gas Usage: 2035 - 3879

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:206

### Code

```
Club memory club = clubs[clubId]
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `getClub(uint256)`
- PC address: 9373
- Estimated Gas Usage: 3060 - 5282

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:206

### Code

```
Club memory club = clubs[clubId]
```

## Exception state
- SWC ID: 110
- Type: Informational
- Contract: ThamesBoats
- Function name: `marketAdminRoleList(uint256)`
- PC address: 9485
- Estimated Gas Usage: 723 - 818

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: ./contracts/ThamesBoats.sol:20

### Code

```
address[] public marketAdminRoleList
```

## Exception state
- SWC ID: 110
- Type: Informational
- Contract: ThamesBoats
- Function name: `clubBoats(uint256,uint256)`
- PC address: 9578
- Estimated Gas Usage: 857 - 1142

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: ./contracts/ThamesBoats.sol:36

### Code

```
mapping(uint256 => uint256[]) public clubBoats
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10156
- Estimated Gas Usage: 787 - 1072

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:42

### Code

```
mapping(uint256 => Purchase) public purchases
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10162
- Estimated Gas Usage: 1199 - 1484

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:42

### Code

```
mapping(uint256 => Purchase) public purchases
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10200
- Estimated Gas Usage: 1647 - 2262

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:42

### Code

```
mapping(uint256 => Purchase) public purchases
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchases(uint256)`
- PC address: 10206
- Estimated Gas Usage: 2059 - 2674

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:42

### Code

```
mapping(uint256 => Purchase) public purchases
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `clubs(uint256)`
- PC address: 11587
- Estimated Gas Usage: 844 - 1459

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:34

### Code

```
mapping(uint256 => Club) public clubs
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `clubs(uint256)`
- PC address: 11745
- Estimated Gas Usage: 1857 - 2755

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:34

### Code

```
mapping(uint256 => Club) public clubs
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `clubs(uint256)`
- PC address: 11903
- Estimated Gas Usage: 2870 - 4051

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:34

### Code

```
mapping(uint256 => Club) public clubs
```

## Exception state
- SWC ID: 110
- Type: Informational
- Contract: ThamesBoats
- Function name: `clubOwnerRoleList(uint256)`
- PC address: 11936
- Estimated Gas Usage: 767 - 862

### Description

A reachable exception (opcode 0xfe) has been detected. This can be caused by type errors, division by zero, out-of-bounds array access, or assert violations. Note that explicit `assert()` should only be used to check invariants. Use `require()` for regular input checking.
In file: ./contracts/ThamesBoats.sol:22

### Code

```
address[] public clubOwnerRoleList
```

## Integer Overflow
- SWC ID: 101
- Type: Warning
- Contract: ThamesBoats
- Function name: `purchaseBoat(uint256,uint256)`
- PC address: 16951
- Estimated Gas Usage: 6842 - 28117

### Description

This binary add operation can result in integer overflow.
In file: ./contracts/ThamesBoats.sol:373

### Code

```
boats[boatId].boatStatus
```


