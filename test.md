# Thames Boats 

### Introduction

Thames Boats is a market place for rowing clubs on the river Thames to sell boats within the rowing community. The river Thames in London has a  <a href="https://en.wikipedia.org/wiki/Rowing_on_the_River_Thames" target="_blank">vibrant community</a> of rowers and rowing clubs, and has a deep history steeped in tradition.

Thames Boats is a market place to serve the rowing community based on the River Thames, centred in London around London. The aim of the boat market is to allow clubs to sell second hand and new boats, and sometimes new boats.

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

### Installation Instructions
#### Prerequisites 
The following software prerequisites must be met to run Thames Boats. The instruction linked are for Ubuntu Linux. 


<a href="https://www.liquidweb.com/kb/install-git-ubuntu-16-04-lts/" target="_blank">Git</a> 
<a href="https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/" target="_blank">NodeJS, v8.9.4</a> (or later)
<a href="https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/" target="_blank">npm v6</a>  (or later)
<a href="https://truffleframework.com/docs/truffle/getting-started/installation" target="_blank">Truffle</a> (latest version)
<a href="https://truffleframework.com/ganache" target="_blank">Ganache</a> (latest version)
Either Chrome or FireFox with the MetaMask extension installed.

git clone the project directory to your local file system:
```bash
git clone https://github.com/ryanwdavies/final-project-ThamesBoats.git
```
Note: The artefacts in the project are configured to use socket: http://127.0.0.1:8545 (same as http://localhost:8545). Ganache GUI defaults to port 7545 and should be configured in the settings to use port 8545.

#### Compile, Migrate and Test Thames Boats 
Ensure that Ganache is running and listening on port 8545.

##### Install node packages 
We install the Node required packages:
```bash
cd thames_boats
npm install 
```

##### Compile: 
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

##### Migrate:
```
truffle migrate --reset
```
```
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



#### Web interface confugration and 
Here we install required Node packages and launch lite-server:
```
cd ../app
npm install
npm start
```

```
Inline-style: 
![alt text](https://github.com/ryanwdavies/final-project-ThamesBoats/blob/master/app/www/images/screenshot.png "Thames Boats")

```

##### Install node packages 
We install the Node required packages:
ing, merging, and uploading file modifications.

There are two types of synchronization and they can complement each other:

- The workspace synchronization will sync all your files, folders and settings automatically. This will allow you to fetch your workspace on any other device.
	> To start syncing your workspace, just sign in with Google in the menu.

- The file synchronization will keep one file of the workspace synced with one or multiple files in **Google Drive**, **Dropbox** or **GitHub**.
	> Before starting to sync files, you must link an account in the **Synchronize** sub-menu.

## Open a file

You can open a file from **Google Drive**, **Dropbox** or **GitHub** by opening the **Synchronize** sub-menu and clicking **Open from**. Once opened in the workspace, any modification in the file will be automatically synced.

## Save a file

You can save any file of the workspace to **Google Drive**, **Dropbox** or **GitHub** by opening the **Synchronize** sub-menu and clicking **Save on**. Even if a file in the workspace is already synced, you can save it to another location. StackEdit can sync one file with multiple locations and accounts.

## Synchronize a file

Once your file is linked to a synchronized location, StackEdit will periodically synchronize it by downloading/uploading any modification. A merge will be performed if necessary and conflicts will be resolved.

If you just have modified your file and you want to force syncing, click the **Synchronize now** button in the navigation bar.

> **Note:** The **Synchronize now** button is disabled if you have no file to synchronize.

## Manage file synchronization

Since one file can be synced with multiple locations, you can list and manage synchronized locations by clicking **File synchronization** in the **Synchronize** sub-menu. This allows you to list and remove synchronized locations that are linked to your file.


