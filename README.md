
# Thames Boats 

### Backstory

The river Thames in London has a  <a href="https://en.wikipedia.org/wiki/Rowing_on_the_River_Thames" target="_blank">vibrant community</a> of rowers and rowing clubs, and has a deep history steeped in tradition. 

Thames Boats is a market place to serve the rowing community based on the River Thames, centred in London around London. The aim of the boat market is to allow clubs to sell new and second hand and new boats.


### Introduction

Thames Boats has been produced for the  [ConsenSys developer bootcamp](https://consensys.net/academy/bootcamp) final assignment.


The users stories is the application, of those using Thames Boats, are:

#### Owner
The Owner can suspend and resume the market place from trading, in the event of a system bug or problem. The owner can add (and revoke) a Market Admin role, so that others may join in the oversight of the market place. 

#### Market Admins
A Market Admin is able to grant other users the Club Owner role, which will allow those users to add their rowing boat club. 

#### Club Owners
Those with the Club Owner role may add a Boat Club. To that club that can add a stock of rowing boat. The can alter the status (For Sale / Not For Sale) of those boats, and remove them from sale completely. A boat Club Owner may temporarily mark their club as open or closed to trading, and may permanently remove their club. They may withdraw the funds from their club account at any point, and even if the boat market were itself suspended. 

#### Buyers
Anyone with account is able to buy boats, the sales of which are recorded in a sales ledger. 


## Demonstration

The project can be accessed online here, which is connected to the <a href="https://rinkeby.etherscan.io/" target="_blank">Rinkerby</a> test network:


<a href="https://ipfs.io/ipns/thamesboats.ryanwdavies.com" target="_blank">https://ipfs.io/ipns/thamesboats.ryanwdavies.com</a> 



## Project Artefacts

The base project directory contains an "*app*" directory with the files for the presentation layer, and a "*thamesboats*" directory which contains the Truffle-related content. The remaining "*md*" and "*txt*" files are for purposes of the project requirements.
```
app
thames_boats

avoiding_common_attacks.md
deployed_addresses.txt
design_pattern_desicions.md

LICENSE
README.md
```

## Installation Instructions
### Prerequisites 
The following software prerequisites must be met to run Thames Boats. The instruction linked are for Ubuntu Linux. 


* <a href="https://www.liquidweb.com/kb/install-git-ubuntu-16-04-lts/" target="_blank">Git</a> 

* <a href="https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/" target="_blank">NodeJS, v8.9.4</a> (or later)

* <a href="https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/" target="_blank">npm v6</a>  (or later)

* <a href="https://truffleframework.com/docs/truffle/getting-started/installation" target="_blank">Truffle</a> (latest version)

* <a href="https://truffleframework.com/ganache" target="_blank">Ganache</a> (latest version)

* Either Chrome or FireFox with the MetaMask extension installed.

git clone the project directory to your local file system:
```bash
git clone https://github.com/ryanwdavies/final-project-ThamesBoats.git
```
Note: 

The artefacts in the project are configured to use socket: http://127.0.0.1:8545 (same as http://localhost:8545). Ganache GUI defaults to port 7545 and should be configured in the settings to use port 8545.

The 12 word mnemonic in truffle should be seeded in the MetaMask browser extension so that MetaMask can sign for and display those same balances.

### Compile, Migrate and Test Thames Boats 
Ensure that Ganache is running and listening on port 8545.

#### Install node packages 
We install the Node required packages (bignumber.js, truffle-assertions):
```bash
cd final-project-ThamesBoats/thames_boats
npm install 
```

#### Compile: 
```bash
truffle compile
```
```
final-project-ThamesBoats/thames_boats$ truffle compile 
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/ReentrancyGuard.sol...
Compiling ./contracts/SafeMath.sol...
Compiling ./contracts/ThamesBoats.sol...
Writing artifacts to ./build/contracts
```

#### Migrate:
```
truffle migrate --reset
```
```
Starting migrations...
======================
> Network name:    'development'
> Network id:      5777
> Block gas limit: 6721975

...
...

Summary
> Total deployments:   4
> Final cost:          0.00000000000583878 ETH
```

##### Test:
```
truffle test
```

```bash
NOTE: setting 'debug = true' will give verbose output.


  Contract: ThamesBoats
    ✓ addMarketAdmin - called by owner, should add marketAdmin and emit an event to record (100ms)
    ✓ addClubOwner - called by marketAdmin, should add clubOwner to roleClubowner and emit an event to record (129ms)
    ✓ addClub - called by clubOwner, should add the club particulars to the Clubs mapping (147ms)
    ✓ addBoat - called by clubOwner, should add the boat particulars to the clubOwner boat stock (114ms)
    ✓ purchaseBoat - called by buyer, should purchase a boat with overpayment (231ms)
    ✓ purchaseBoat - called by buyer, should fail to purchase a boat attempted as insufficent funds used (52ms)
    ✓ withdrawFunds - called by clubOwner, should withdraw all owned funds (119ms)


  7 passing (993ms)
```


### Web interface configuration  

##### Install node packages 
We install the Node required packages:
ing, merging, and uploading file modifications.
Here we install required Node packages for lite-server and launch:
```
cd ../app
npm install
npm start
```
The list-server should launch Thames Boats in its full glory on port 3000 (or the next highest available port). When you navigate to the Boat Market page MetaMask will prompt for permission to connect.





## Responding to the project requirements


#### Smart  Contract code
The ThamesBoats smart contract code in commented using Natspec-style comment and Doxgen strings. An issue was encountered in this area with the Truffle docstring parser, *(please see Project experiences below)*. The contract also adheres to the [Solidity style guide](https://solidity.readthedocs.io/en/v0.5.2/style-guide.html) to follow the recommend contract layout and style points.

* *Smart Contract code should be commented according to the [specs in the documentation](https://solidity.readthedocs.io/en/v0.4.21/layout-of-source-files.html#comments)*

#### User Interface Requirements:
The requirement listed below are demonstrated in the UI. Please note, the page may need refreshing to update with the latest results, since the UI is very simple.
* *Run the app on a dev server locally for testing/grading*
* *You should be able to visit a URL and interact with the application*
* *App recognizes current account*
* *Sign transactions using MetaMask or uPort*
* *Contract state is updated*
* *Update reflected in UI*


#### Test Requirements:
Thames Boats has seven tests written in JavaScript. These test are commented in the "*thamesboats.test.js*" file. They are written to test key aspects of the application, and to accommodate different types of test (catching revert, use of BigNumber for arithmetic, funds transactions, and checking event output).

A problem was encountered writing testing in Solidity related to use of DeployedAddresses() and Payable address types, and I have raised this with the Truffle team (on Gitter and Github). Comments on this below, *see Project experiences*.

* *Write 5 tests for each contract you wrote*
* *Solidity or JavaScript*
* *Explain why you wrote those tests*
* *Tests run with truffle test*

#### Design Pattern Requirements:
A discussion of the design pattern choices, and of the circuit breaker (the toggle to suspend the market) is provided in *design_pattern_desicions.md*.
* *Implement a circuit breaker (emergency stop) pattern*
* *What other design patterns have you used / not used?*
* *Why did you choose the patterns that you did?*
* *Why not others?*


#### Security Tools / Common Attacks
*design_pattern_desicions.md* is included in the project root directory to explain key design choices,  highlights common attacks which may affect Thames Boats, how these can protected against, and how those countermeasures are implemented in the project.
* *Explain what measures you’ve taken to ensure that your contracts are not susceptible to common attacks*

#### Use of a library or EthPM package
Thames Boats makes use of two artefacts from Open Zeppelin; SafeMath and ReentrancyGuard. These are discussed in the avoiding common attacks MD.


#### Deployment on test network (Rinkerby)
Thames Boats has been deploy, (*in all of its glory!*), on the Rinkerby test network. The address is included in *deployed_addresses.txt*. Discussed there is the difficulty adding the code to EtherScan, where attempts to add SafeMath fail with "*The [Deployed Contract ByteCode (secondary check)] does NOT match the Compiled Code*". This has prevented adding of the Solidity code to the contract addresses on EtherScan.

https://rinkeby.etherscan.io/address/0xf8327d2d33a88e7767457dc58c0d70072e3831dd#code
[Thames Boats web application](https://ipfs.io/ipfs/QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP) (IPFS address)
<a href="https://ipfs.io/ipns/thamesboats.ryanwdavies.com" target="_blank">https://ipfs.io/ipns/thamesboats.ryanwdavies.com</a> (IPNS address)


## Stretch requirements

The web artefacts have been deployed on IPFS, and published from an IPFS daemon running on a server which is always available with port 4001 open (the swarm port). 

```bash
$ ipfs add -r www
....
added QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP www

$ ipfs pin add QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP
pinned QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP recursively

$ ipfs name publish QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP
Published to QmcfDBw6MrQZCTARawXJS3BZLaAPBrAvMuwbosR3AXoYqZ: /ipfs/QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP

$ ipfs name resolve /ipns/QmciMBB8hhPPfmypqqR5eg9uwPRMtbCjUWbnG2sg3RTFZm
/ipfs/QmciMBB8hhPPfmypqqR5eg9uwPRMtbCjUWbnG2sg3RTFZm


IPFS: /ipfs/QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP
IPNS: /ipns/QmcfDBw6MrQZCTARawXJS3BZLaAPBrAvMuwbosR3AXoYqZ
```

Add a TXT record for thamesboats.ryanwdavies.com  "dnslink=/ipfs/QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP"
```
dig TXT thamesboats.ryanwdavies.com|grep ipfs

thamesboats.ryanwdavies.com. 3470 IN  TXT  "dnslink=/ipfs/QmcuUhfbVBHxbGzhJX1kNbE6iaxrQcwFFNFA8y3JCCioqP"
```
(the IPNS lookup is not working properly here and needs resolving - for now we hard-code to the IPFS hash, where the preference would be to publish the IPNS reference).

([notes](https://hackernoon.com/ten-terrible-attempts-to-make-the-inter-planetary-file-system-human-friendly-e4e95df0c6fa), [notes](https://medium.com/coinmonks/how-to-add-site-to-ipfs-and-ipns-f121b4cfc8ee))


## Improvements
Thames Boats has a poor UI and would be improve very many times with the hand of an experienced web developer; the few days I left myself to learn React proved woefully inadequate(!)

I would have liked to make the UI more dynamic in a React-style, with event listeners on events emitted to update part of the UI, and that will need to be in a later phase, and after my React course.


## Project experiences



### Testing in Solidity DeployedAddresses()
I wrote Truffle tests in Solidity and encountered a problem with payable address types and the DeployedAddresses Truffle function, which seems like a bug affecting Solidity ^0.5.0. I reached out on Truffle Gitter and have subsequently raised the matter on Github:
[Truffle testing with Solidity ^0.5; DeployedAddresses not supporting payable addresses #1640](https://github.com/trufflesuite/truffle/issues/1640)


### Adding Code to EtherScan
Adding code to EtherScan seem to have issues. 

I had three contracts to add (ReentrancyGuard, SafeMath, ThamesBoats). All had been compiled and migrated to Rinkerby and Ropsten, and it was only possible to add code for ReentrancyGuard. I tried different approaches (via Truffle and Remix, with and without optimisation, and using the [Truffle flattener](https://www.npmjs.com/package/truffle-flattener) and the process described [here](https://michalzalecki.com/how-to-verify-smart-contract-on-etherscan/)), which all yielded:
```
Sorry! The [Deployed Contract ByteCode (secondary check)] does NOT match the Compiled Code for Address 0x5d2B3Aa11F79a0E2483862F4f401F8FC465723bE).
```

The only success I had was with ReentrancyGuard - there the approach need to compile and migrate with optimisation enabled, and then to upload the code to EtherScan with optimisation *disabled*.  Very odd and I was unable to make progress with SafeMath (which then ThamesBoats is dependent on).

### DocStrings
I thought this would be the easy part(!)

The Truffle docstring parser raised *DocstringParsingError* stating that the variable declared in the docstring was not found in the function, where clearly it is: 
```
  /// @notice Mark the given club as Open
  /// @dev May only be called by the owner of the given club
  /// @param _clubId ID of the club to be opened
  function openClub(uint256 _clubId)
      external
      ownsThisClub(_clubId)
      ifMarketNotSuspended
  {
      if(clubs[_clubId].clubStatus != ClubStatus.Removed) {
          clubs[_clubId].clubStatus = ClubStatus.Open;
          emit LogClubOpen(_clubId, msg.sender);
      }
  }
```
truffle test, yielded:
```
DocstringParsingError: Documented parameter "_clubId" not found in the parameter list of the function.
```

This was really baffling. I prefer to "_" prefix arguments so that parameters within the function code are denoted. This is common practice.  

Using the *same code* in Remix, and remix (which does validate docstrings) did not complain. So it appears Truffle and Remix are yielding different results.

Reluctantly I refactored the code to remove the "_" prefix from the argument names. 

I notice that the argument "*_address*" was accepted by Truffle, whereas all others (_clubId, _boatId, _quantity, _price) received the complaint above. 

Others online had similar. I will revisit and raise with the Truffle team if appropriate.
