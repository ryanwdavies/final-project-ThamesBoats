
# Design pattern decisions 

*A document called design_pattern_desicions.md that explains why you chose to use the design patterns that you did.*
* *Implement a circuit breaker (emergency stop) pattern*
* *What other design patterns have you used / not used?*
* *Why did you choose the patterns that you did?*
* *Why not others?*
---
Here we comment on implemented and considered ideas and design patterns [[1](https://medium.com/coinmonks/common-attacks-in-solidity-and-how-to-defend-against-them-9bc3994c7c18), [2](https://solidity.readthedocs.io/en/v0.5.2/common-patterns.html), [3](https://medium.com/coinmonks/optimizing-your-solidity-contracts-gas-usage-9d65334db6c7), [4](https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/recommendations.md), [5](https://github.com/cjgdev/smart-contract-patterns), [6](https://consensys.github.io/smart-contract-best-practices/)].

#### Keep it simple
Thames Boats (TB) favours simplicity over complexity, and where possible leaves the complexity to the application layer. Where possible we make use of audited, battle-tested, third party libraries so that we aren't "rolling our own". TB makes use of SafeMath for arithmetic safeness and ReentrancyGuard to protect against re-entrancy. 

There is a balance which needs to be struck in the tradeoff [between complexity and simplicity](https://consensys.github.io/smart-contract-best-practices/general_philosophy/). 

#### Modular vs Monolithic
TB consists of one main contract, and makes use of SafeMath and ReentrancyGuard. The application functions seemed sensibly grouped in one contract, and there was no advantage to modularise the components into separate contracts; in the case of TB this may introduce unnecessary complexity and make review and development unnecessarily complex.

Modularity within the contract is encourage: the functions in TB are kept small to make the design simple, allow re-use, and improve clarity.

#### Modifiers
Function modifiers are used to allow re-use of frequently used checks, and to improve code readability and maintenance. 

#### Circuit Breaker
A [circuit breaker](https://github.com/ConsenSys/smart-contract-best-practices/blob/master/docs/software_engineering.md#circuit-breakers-pause-contract-functionality) patterns has been implemented so that the owner can suspend the market when necessary, and to limit the potential impact if a problem is found. Club owners are able to withdraw funds while the market is suspended.

Leaving the power to suspend the application to one person has disadvantages also; if the owner looses their key, is compromised, or decides to act maliciously, the market is at risk. For this reason club owners are able to withdraw funds at any point. 

A difference governance model could be adopted in the future, and one which requires input from more that actor to have affect - multi-signature schemes are tools which can be used to share responsibility and privilege. On-chain governance models are an area which receives much discussion.

#### Withdrawal pattern
The [withdrawal pattern](https://solidity.readthedocs.io/en/v0.5.2/common-patterns.html) is used to allow club owners to withdraw funds. This is discussed in <a href="https://github.com/ryanwdavies/final-project-ThamesBoats/blob/master/avoiding_common_attacks.md" target="_blank"> avoiding_common_attacks.md</a>.

*address.transfer()* is used in preference of *address.send()* for push transactions, since *address.send()* can fail silently whereas *address.transfer()* will revert if it fails. 

#### Loops and storage modification
Loops have been avoided to reduce gas costs and the risk that the cost of a loop operation may exceed the block gas limit, rendering that function unusable.  Modification of state variable is costly and it is a design consideration to limit such changes except where necessary. 

#### uint256 vs uint
A uint declared variable is of uint256 type; unit and uint256 are the same thing. For clarity use of uint256 is favoured over uint.

#### Compiler lock  
We specify explicitly compiler version using "pragma 0.5.2" (omitting the use of "^") to [lock to a compiler version](https://consensys.github.io/smart-contract-best-practices/recommendations/#lock-pragmas-to-specific-compiler-version) and reduce risk on undiscovered bugs.

#### Assertions vs Require
require() is used to check the required conditions and data input. assert() is used to detect invariants; to safeguard if the contract reaches an invalid state. Formal analysis tools can be used to ensure that the assertion opcode is not used.

require() is [favoured over](https://medium.com/coinmonks/common-attacks-in-solidity-and-how-to-defend-against-them-9bc3994c7c18) "*if* statements since if the require() statement is not met it will throw a revert to caller and stop; if statements can fail silently.
  

#### Short Circuit Rules
Optimising for gas usage consideration is given to the use of Short Circuit constructs; prefer *(oftenTrue || oftenFalse)* over *(oftenFalse || oftenTrue)*), to lower gas usage.



---

### Thames Boats - Future areas for development
#### Upgradable design
An [upgradable contract pattern](https://medium.com/cardstack/upgradable-contracts-in-solidity-d5af87f0f913) could be implemented so that problems maybe fixed and enhancements made. A [registry approach](https://consensys.github.io/smart-contract-best-practices/software_engineering/#upgrading-broken-contracts) could be used for this where an interim contract is used as a proxy and delegatecall used to forward data and calls.
#### Strings vs bytes32
Strings are used where it would be possible to use bytes32 - this can be more efficient and lower gas usage, and is a potential improvement. 

#### String max length
Data input is not limited. Some consideration could be given to setting a string length limit.

#### Ownership Transfer; using Ownable
The Ownable contract, from Open Zeppelin, could be implemented as a battle-tested way to allow the contract owner to transfer or renounce ownership. 

#### Third party review
As is best practice, contract review by a third party would be a recommended prior to mainnet release. 
