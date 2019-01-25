// https://mikemcl.github.io/bignumber.js
// https://hackernoon.com/a-note-on-numbers-in-ethereum-and-javascript-3e6ac3b2fad9
// We use BigNumber for some maths operations to avoid the limitation of JavaScript 
// to represent and manipulate large numbers, as described above.
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')
const ThamesBoats = artifacts.require('ThamesBoats')

contract('ThamesBoats', accounts => {
 
    // contract accounts
    const owner = accounts[0]
    const marketAdmin = accounts[1]
    const clubOwner = accounts[2]
    const buyer = accounts[3]

    // debug flag for verbose output
    let debug = false

    // testing variables 
    let thamesBoats
    let clubId 
    let boatId

    let clubName = 'Thames Rowing Club'
    let clubLocation = 'Putney, SW15'

    let boatName = 'Empacher, Bootswerft - racing eight' 
    let boatDescription = 'Brand new - 85-95kg racing shell with riggers'
    let price = 55010000
    let quantity = 5

    // variables to represent contract enums
    let ClubStatus = Object.freeze({'Closed':0, 'Open':1, 'Removed':2})
    let BoatStatus = Object.freeze({'NotForSale':0, 'ForSale':1, 'Removed':2})
 
    // run before first test 
    before(async () => {
       thamesBoats = await ThamesBoats.deployed()
    })
 
    console.log('\n\nNOTE: setting \'debug = true\' will give verbose output.') 

    // Test that the owner can add a market admin to the roleMarketAdmin mapping. This grants the user the 
    // marketAdmin role. We test that the LogAddMarketAdmin event correctly emits the marketAdmin address.
    it('addMarketAdmin - called by owner, should add marketAdmin and emit an event to record', async () => {
        const tx = await thamesBoats.addMarketAdmin(marketAdmin, {from: owner}) 
        if (debug) {console.log(truffleAssert.prettyPrintEmittedEvents(tx))}
        truffleAssert.eventEmitted(tx, 'LogAddMarketAdmin', params => 
        { 
            return params.newAdmin == marketAdmin
        },
            'addMarketAdmin did not emit as expected recording that marketAdmin was made a market admin'
        )
       
        const confirmAddress = await await thamesBoats.roleMarketAdmin(marketAdmin)
        assert.equal(confirmAddress, true, 'the address marketAdmin was not added to mapping roleMarketAdmin')
    })

    // As above for marketAdmin, here we test the same for clubOwner: we test that clubOwner can be added to 
    // roleClubOwner by marketAdmin. Again we test the associated event and its output.
    it('addClubOwner - called by marketAdmin, should add clubOwner to roleClubowner and emit an event to record', async () => {
        const tx = await thamesBoats.addClubOwner(clubOwner, {from: marketAdmin})
        if (debug) {console.log(truffleAssert.prettyPrintEmittedEvents(tx))}
        truffleAssert.eventEmitted(tx, 'LogAddClubOwner', params =>
        {   
            return params.newClubOwner == clubOwner
        },  
            'addClubAdmin did not emit as expected recording that clubOWner was made a club owner'
        )

        const confirmAddress = await thamesBoats.roleClubOwner(clubOwner)
        assert.equal(confirmAddress, true, 'the address clubOwner was not added to mapping roleClubOwner')
    })

    // Test that the clubOwner is able to add their club. The Club struct values are verified and the 
    // values in the associated event are checked. We also check that the ownertoClub mapping is updated properly.
    it('addClub - called by clubOwner, should add the club particulars to the Clubs mapping', async () => {

        const tx = await thamesBoats.addClub(clubName, clubLocation, {from: clubOwner})
        if (debug) { console.log(truffleAssert.prettyPrintEmittedEvents(tx)) }
        truffleAssert.eventEmitted(tx, 'LogClubAdded', params =>
        {   
            return params.actionedBy == clubOwner 
        },  
            'addClubAdmin did not emit an event as expected recording that clubOWner was made a club owner'
        )
        txClubId = tx.logs[0].args.clubId.toString(10)
        result = await thamesBoats.getClub(txClubId)
        if (debug) { console.log('\nthamesBoats.getClub(clubId) yields:\n\n', result) }
    
        assert.equal(result[0], clubOwner, 'the club owner has not been set as expected')
        assert.equal(result[1], clubName, 'the club name has not been set as expected')
        assert.equal(result[2], clubLocation, 'the club location has not been set as expected')
        assert.equal(result[3].toString(10), ClubStatus.Open, 'the club status has not been set to Open')

        clubId = await thamesBoats.ownertoClub(clubOwner)
        assert.equal(txClubId, clubId, 'the clubOwner => clubId has not been recorded properly in owertoClub mapping')
    })

    // Test that the clubOwner can add a boat and that all of the inputs are correctly recorded in the 
    // struct for the Boat and in the associated mappings. Verify that the event outputs matches the inputs. 
    it('addBoat - called by clubOwner, should add the boat particulars to the clubOwner boat stock', async () => {

        const tx = await thamesBoats.addBoat(boatName, boatDescription, price, quantity, {from: clubOwner})    
        if (debug) { console.log(truffleAssert.prettyPrintEmittedEvents(tx)) }
        truffleAssert.eventEmitted(tx, 'LogBoatAdded', params =>
        {  
            return params.actionedBy == clubOwner &&
                params.price.toString(10) == price && 
                params.quantity.toString(10) == quantity &&
                params.clubId.toString(10) == clubId
        },  
            'addBoat did not emit an event as expect recording details of the boat added'
        )   

        boatId = tx.logs[0].args.boatId.toString(10)
        result = await thamesBoats.boats(boatId)
        if (debug) { console.log('\nthamesBoats.boats(boatId) yields:\n\n', result) }

        assert.equal(result[0], boatName, 'boat name not correctly recorded in boats.Boat')
        assert.equal(result[1], boatDescription, 'boat description not correctly recorded in boats.Boat')
        assert.equal(result[2].toString(10), price, 'boat price not correctly recorded in boats.Boat')
        assert.equal(result[3].toString(10), quantity, 'boat name not correctly recorded in boats.Boat')
        assert.equal(result[4].toString(10), BoatStatus.ForSale, 'boat status is not correctly recorded in boats.Boat')
    })
  
    // Test boatPurchase called by buyer with overpayment to test that:
    // 1. the purchase by buyer occurs, and is recorded in event LogPurchase and purchases mapping
    // 2. the clubOwner balance is credited with sale price
    // 3. the buyer is debited for the correct amount and refunded for over payment
    // 4. the boat stock is reduced in the selling club
    it('purchaseBoat - called by buyer, should purchase a boat with overpayment', async () => {
        let initalBalanceClubOwner = await thamesBoats.balances(clubOwner)
        let initalEtherClubOwner = await web3.eth.getBalance(clubOwner)
        let initalEtherBuyer = await web3.eth.getBalance(buyer)
        let initalStock = await thamesBoats.boats(boatId) 
        initalStock = initalStock[3].toNumber()

        let purchaseQuantity = 1
        let costOfSale = purchaseQuantity * price
        // 2000 is added to the costOfSale, to make an overpayment
        let overpayment = costOfSale + 2000

        const tx = await thamesBoats.purchaseBoat(boatId, purchaseQuantity, {from: buyer, value: overpayment})
        if (debug) { console.log(truffleAssert.prettyPrintEmittedEvents(tx)) }

        // 1 (as comments above)
        truffleAssert.eventEmitted(tx, 'LogPurchase', params =>
        {
            return params.purchasedBy == buyer &&
                params.clubOwner == clubOwner &&
                params.clubId.toString(10) == clubId &&
                params.boatId.toString(10) == boatId && 
                params.quantity.toString(10) == purchaseQuantity 
                params.costOfSale == price * purchaseQuantity && 
                params.fundsSent == overpayment &&
                params.refund == overpayment - costOfSale
        },
            'purchaseBoat did not emit an event with the expected values recording the boat purchase'
        )

        purchaseId = tx.logs[0].args.purchaseId.toString(10)
        result = await thamesBoats.purchases(purchaseId)
        if (debug) { console.log('thamesBoats.purchases(purchaseId) yields:\n\n', result) }
   
        assert.equal(result[0].toString(10), clubId, 'clubId not correctly recorded in puchase against the purchaseId')
        assert.equal(result[1].toString(10), boatId, 'boatId not correctly recorded in puchase against the purchaseId')
        assert.equal(result[2], buyer, 'the buyer is not correctly recorded in puchase against the purchaseId')
        assert.equal(result[3].toString(10), purchaseQuantity, 
            'quantity purchased  correctly recorded in puchase against the purchaseId')
        assert.equal(result[4].toString(10), costOfSale, 'costOfSale not correctly recorded in puchase against the purchaseId')
    
        // 2, 3, 4 (as comments above) 
        let resultBalanceClubOwner = await thamesBoats.balances(clubOwner)
        let resultEtherClubOwner = await web3.eth.getBalance(clubOwner)
        let resultEtherBuyer = await web3.eth.getBalance(buyer)
        let resultStock = await thamesBoats.boats(boatId)
        resultStock = resultStock[3].toNumber()
 
        // calcuate cost transaction gas costs
        let gasUsed = tx.receipt.gasUsed
        let txDetails = await web3.eth.getTransaction(tx.tx)
        let gasPrice = txDetails.gasPrice
        let gasCost = gasUsed * gasPrice

        if (debug) { 
            console.log('\ninitalBalanceClubOwner = ', initalBalanceClubOwner, typeof(initalBalanceClubOwner))
            console.log('initalEtherClubOwner = ', initalEtherClubOwner, typeof(initalEtherClubOwner))
            console.log('initalEtherBuyer = ', initalEtherBuyer, typeof(initalEtherBuyer))
            console.log('costOfSale = ', costOfSale, typeof(costOfSale))
            console.log('overpayment =', overpayment, typeof(overpayment))
            console.log('initalStock = ', initalStock, typeof(initalStock))
    
            console.log('\nresultBalanceClubOwner = ', resultBalanceClubOwner, typeof(resultBalanceClubOwner))
            console.log('resultEtherClubOwner = ', resultEtherClubOwner, typeof(resultEtherClubOwner))
            console.log('resultEtherBuyer = ', resultEtherBuyer, typeof(resultEtherBuyer))
            console.log('resultStock = ', resultStock, typeof(resultStock))
    
            console.log('transaction gasUsed = ', gasUsed, typeof(gasUsed))
            console.log('transaction gasPrice = ', gasPrice, typeof(gasPrice))
            console.log('transaction gasCost = ', gasCost, typeof(gasCost))
            console.log('\ntx = ', txDetails)
            console.log('\nBigNumber calc: resultEtherBuyer = ', resultEtherBuyer.toString())
            console.log('BigNumber calc: initalEtherBuyer - costOfSale - gasCost = ', 
                BigNumber(initalEtherBuyer).minus(costOfSale).minus(gasCost).toString())
            console.log('\n', tx.receipt)
        }

        assert.equal(
            BigNumber.sum(initalBalanceClubOwner, costOfSale).toString(10),
            resultBalanceClubOwner.toString(10),
            'the clubOwner\'s account has not been increased by the costOfSale')
        assert.equal(
            BigNumber(initalEtherBuyer).minus(costOfSale).minus(gasCost).toString(10),
            BigNumber(resultEtherBuyer).toString(10),
            'the buyers\'s account has not been debited by the costOfSale')
        assert.equal(
            initalStock - purchaseQuantity, 
            resultStock, 
            'the stock balance has not been reduced by the purchaseQuantity')
    })

    // Test boatPurchase called by buyer with underpayment to test that the purchase by buyer fails.
    // We use try/catch to handle the throw.
    it('purchaseBoat - called by buyer, should fail to purchase a boat attempted as insufficent funds used', async () => {
        let purchaseQuantity = 1
        let costOfSale = purchaseQuantity * price
        // 900 is deducted from the costOfSale, to make an underpayment
        let underpayment = costOfSale - 900
        let failed = false

        try {
            const tx = await thamesBoats.purchaseBoat(boatId, purchaseQuantity, {from: buyer, value: underpayment})
        } catch(err) {
            failed = true
        } 
        assert.equal(failed, true, 'throw not received; the boat was purchased using an underpayment'); 
    })

    // Test that we can withdraw funds. Test that the remaining balance is zero, and that the 
    // withdrawer (the clubOwner) is credited with balance in Eth, less the gas costs of the transaction.
    // Ensure that the withdrawl is recorded in the event LogWithdrawl.
    it('withdrawFunds - called by clubOwner, should withdraw all owned funds', async () => {
        let initalBalanceClubOwner = await thamesBoats.balances(clubOwner)
        let initalEtherClubOwner = await web3.eth.getBalance(clubOwner)

        const tx = await thamesBoats.withdrawFunds({from: clubOwner})
        if (debug) { console.log(truffleAssert.prettyPrintEmittedEvents(tx)) }

        truffleAssert.eventEmitted(tx, 'LogWithdrawl', params =>
        {
            return params.withdrawer == clubOwner &&
                params.value == initalBalanceClubOwner.toString(10)
        },
            'withdrawFunds did not emit an event with the expected values recording withdrawl'
        )

        let resultBalanceClubOwner = await thamesBoats.balances(clubOwner)
        let resultEtherClubOwner = await web3.eth.getBalance(clubOwner)

        // calcuate cost transaction gas costs
        let gasUsed = tx.receipt.gasUsed
        let txDetails = await web3.eth.getTransaction(tx.tx)
        let gasPrice = txDetails.gasPrice
        let gasCost = gasUsed * gasPrice

        if (debug) { 
            console.log('\ninitalBalanceClubOwner = ', initalBalanceClubOwner, typeof(initalBalanceClubOwner))
            console.log('initalEtherClubOwner = ', initalEtherClubOwner, typeof(initalEtherClubOwner))
            console.log('resultBalanceClubOwner = ', resultBalanceClubOwner, typeof(resultBalanceClubOwner))
            console.log('resultEtherClubOwner = ', resultEtherClubOwner, typeof(resultEtherClubOwner))

            console.log('transaction gasUsed = ', gasUsed, typeof(gasUsed))
            console.log('transaction gasPrice = ', gasPrice, typeof(gasPrice))
            console.log('transaction gasCost = ', gasCost, typeof(gasCost))
            console.log('\ntx = ', txDetails)
            console.log('\nBigNumber: initalEtherClubOwner + initalBalanceClubOwner = ', 
                BigNumber(initalEtherClubOwner).plus(initalBalanceClubOwner).toString(10))
            console.log('BigNumber: resultEtherClubOwner + gasCost = ', 
                BigNumber(resultEtherClubOwner).plus(gasCost).toString(10))
            console.log('\n', tx.receipt)
        }

        assert.equal(
            0,
            resultBalanceClubOwner, 
            'balances[clubOwner] is non-zero after withdrawl')
        assert.equal(
            BigNumber(initalEtherClubOwner).plus(initalBalanceClubOwner).toString(),
            BigNumber(resultEtherClubOwner).plus(gasCost).toString(),
            'the expected Ether amount has not been withdrawn to the clubOwner')
    })
})




