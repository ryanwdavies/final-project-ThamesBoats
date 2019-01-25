App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
  
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      //App.web3Provider = new Web3.providers.HttpProvider(
      // "http://localhost:8545"
      // );

      App.web3Provider = new Web3.providers.WebsocketProvider(
        "ws://localhost:8545"
      );
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON("../contracts/ThamesBoats.json", function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ThamesBoatsArtifact = data;
      App.contracts.ThamesBoats = TruffleContract(ThamesBoatsArtifact);

      // Set the provider for our contract
      App.contracts.ThamesBoats.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.render();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on("click", ".btn-addMarketAdmin", App.handleAddMarketAdmin);
    $(document).on(
      "click",
      ".btn-removeMarketAdmin",
      App.handleRemoveMarketAdmin
    );
    $(document).on("click", ".btn-suspendMarket", App.handleSuspendMarket);
    $(document).on("click", ".btn-addClubOwner", App.handleAddClubOwner);
    $(document).on("click", ".btn-removeClubOwner", App.handleRemoveClubOwner);
    $(document).on(
      "click",
      ".btn-boatClubOpenClose",
      App.handleBoatClubOpenClose
    );
    $(document).on("click", ".btn-addBoatClub", App.handleAddBoatClub);
    $(document).on("click", ".btn-removeBoatClub", App.handleRemoveBoatClub);
    $(document).on("click", ".btn-addBoat", App.handleAddBoat);

    $(document).on("click", ".btn-removeBoat", App.handleRemoveBoat);
    $(document).on(
      "click",
      ".btn-toggleBoatStatus",
      App.handleToggleBoatStatus
    );
    $(document).on("click", ".btn-buyBoat", App.handleBuyBoat);
    $(document).on("click", ".btn-withdrawFunds", App.handleWithdrawFunds);

    // detect MetaMask account change and reload
    window.ethereum.on("accountsChanged", function() {
      location.reload();
    });
  },

  boatStatus: function(statusId) {
    return statusId === 0 ? "Not For Sale" :
      statusId === 1 ? "For Sale" :
        statusId === 2 ? "Removed" :
          "unknown";
  },

  clubStatus: function(statusId) {
    return statusId === 0 ? "Closed" :
      statusId === 1 ? "Open" :
        statusId === 2 ? "Removed" :
          "unknown";
  },

  /* BOATS FOR SALE
   */
  boatsForSale: function() {
    //get roles
    App.contracts.ThamesBoats.deployed().then(async function(instance) {
      let suspended = await instance.suspended.call();
      if (suspended) {
        document.getElementById("boatMarketStatus").innerHTML =
          "<span style='color: grey;'>The Boat Market is currently suspended - please check back later</span>";
        return;
      } else {
        document.getElementById("boatMarketStatus").innerHTML =
          "Boats for Sale!";
      }

      // loop through open clubs, and their boats status For Sale
      let clubList = await instance.getClubIds();
      if (clubList.length === 0) {
        return;
      }

      let boatsRow = $("#boatMarket");
      let boatTemplate = $("#boatMarketTemplate");

      // loop over clubs
      for (k = 0; k < clubList.length; k++) {
        let clubId = clubList[k].toNumber()
        let clubData = await instance.clubs.call(clubId);
        let clubStatus = App.clubStatus(clubData[3].c[0]);

        if (clubStatus !== "Open") {
          continue;
        }
        let boatClubName = clubData[1];
        let boatClubLocation = clubData[2];

        // get boats
        let boatIds = await instance.getBoatsIdbyClubId(clubId);
        if (boatIds.length === 0) {
          continue;
        }

        for (j = 0; j < boatIds.length; j++) {
          let boatId = boatIds[j].toNumber();
          let boatData = await instance.getBoat(boatId);
          let boatStatus = App.boatStatus(boatData[4].toNumber());
          let boatQuantity = boatData[3].toNumber();
          // skip Removed and Not For Sale
          if (boatStatus !== "For Sale" || boatQuantity === 0) {
            continue;
          }
          let boatName = boatData[0];
          let boatDescription = boatData[1];
          let boatPrice = boatData[2];
          // boatPrice is in Wei data type BN.
          // convert to Eth, and numberic
          boatPrice = web3.fromWei(boatPrice, "ether").toNumber();

          boatTemplate.find(".boatName").text(boatName);
          boatTemplate.find(".boatDescription").text(boatDescription);
          boatTemplate.find(".boatPrice").text(boatPrice + " ETH");
          boatTemplate.find(".boatQuantity").text(boatQuantity);
          boatTemplate.find(".boatStatus").text(boatStatus);
          boatTemplate.find(".boatId").text(boatId);
          boatTemplate.find(".boatClubName").text(boatClubName);
          boatTemplate.find(".boatLocation").text(boatClubLocation);
          boatTemplate.find(".clubId").text(clubId);
          boatTemplate.find(".btn-buyBoat").attr("data-id", boatId);

          let select = "";
          let t;
          for (t = 1; t < boatQuantity + 1; t++) {
            select += "<option val=" + t + ">" + t + "</option>";
          }

          boatTemplate
            .find(".btn-quantity")
            .html(select)
            .attr("name", "boatId" + boatId.toString());

          boatsRow.append(boatTemplate.html());
        } // boats list
      } // club list
    });
  },

  render: function(account) {
    var account = web3.eth.accounts[0];
    let roles = "";
    let contractAddress;

    App.boatsForSale();
    //get roles
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        // contract_address = await deployedcontract.address;
        let owner = await instance.owner.call();
        let marketAdmin = await instance.roleMarketAdmin(account);
        contractAddress = instance.contract.address;
        let clubOwner = await instance.roleClubOwner(account);
        let suspended = await instance.suspended.call();
        let clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        let club = await instance.clubs.call(clubId);

        if (clubId > 0) {
          let clubStatus = App.clubStatus(club[3].c[0]);
          let balance = await instance.balances.call(account);
          balance = web3.fromWei(balance, "ether").toNumber();
          // is clubOwner
          // hide addBoatClub form
          document.getElementById("input-addBoatClub").style.display = "none";

          // display club details
          document.getElementById("showMyBoatClub").style.display = "block";
          document.getElementById("showMyBoatClubId").innerHTML = clubId;
          document.getElementById("showMyBoatClubName").innerHTML = club[1];
          document.getElementById("showMyBoatClubLocation").innerHTML = club[2];

          // display balance
          document.getElementById("showMyBalance").innerHTML = balance + " ETH";
          if (balance > 0) {
            document.getElementById("btn-withdrawFunds").style.display =
              "block";
          }

          // get boats
          let boatIds = await instance.getBoatsIdbyClubId(clubId);
          if (boatIds.length > 0 && clubStatus !== "Removed") {
            let boatsRow = $("#showBoats");
            let boatTemplate = $("#boatTemplate");

            for (i = 0; i < boatIds.length; i++) {
              let boatId = boatIds[i].toNumber();
              let boatData = await instance.getBoat(boatId);
              let boatStatus = App.boatStatus(boatData[4].toNumber());
              let boatQuantity = boatData[3].toNumber();

              if (boatStatus !== "Removed" && boatQuantity > 0) {
                let boatName = boatData[0];
                let boatDescription = boatData[1];
                let boatPrice = boatData[2];
                // boatPrice is in Wei data type BN.
                // convert to Eth, and numberic
                boatPrice = web3
                  .fromWei(boatPrice, "ether")
                  .toNumber();

                document.getElementById("showBoats").style.display = "block";
                boatTemplate.find(".boatName").text(boatName);
                boatTemplate
                  .find(".boatDescription")
                  .text(boatDescription);
                boatTemplate
                  .find(".boatPrice")
                  .text(boatPrice + " ETH");
                boatTemplate
                  .find(".boatQuantity")
                  .text(boatQuantity);
                boatTemplate.find(".boatStatus").text(boatStatus);
                boatTemplate.find(".boatId").text(boatId);
                boatTemplate
                  .find(".btn-toggleBoatStatus")
                  .attr("data-id", boatId);
                boatTemplate
                  .find(".btn-removeBoat")
                  .attr("data-id", boatId);
                boatsRow.append(boatTemplate.html());
              }
            }
          }

          //get market admins
          if (clubStatus === "Open") {
            document.getElementById("showMyBoatClubStatus").innerHTML =
              "<span style='color: forestgreen;'><b>Open - <i>it's business as usual!</i><b/></span>";
            document.getElementById("btn-boatClubOpenClose").innerHTML =
              "Close Club";
            document.getElementById("input-addBoatClub").style.display = "none";
            document.getElementById("showAddBoats").style.display = "block";
          } else if (clubStatus === "Closed") {
            document.getElementById("showMyBoatClubStatus").innerHTML =
              "<span style='color: red;'><b>Closed</i><b/></span>";
            document.getElementById("btn-boatClubOpenClose").innerHTML =
              "Open Club";
            document.getElementById("showAddBoats").style.display = "block";
          } else if (clubStatus === "Removed") {
            document.getElementById("showMyBoatClubStatus").innerHTML =
              "<span style='color: grey;'><b>Removed / Permanently Closed</i><b/></span>";
            document.getElementById("btn-boatClubOpenClose").style.display =
              "none";
            document.getElementById("myClubButtons").style.display = "none";
            document.getElementById("showAddBoats").style.display = "none";
          }
        } else {
          // no club added yet, so we hide add boat and my club details
          document.getElementById("showMyBoatClub").style.display = "none";
          document.getElementById("showAddBoats").style.display = "none";
        }

        if (suspended) {
          document.getElementById("market-status").innerHTML =
            "<span style='color: red;'><b>Market Suspended</b></span>";
          document.getElementById("btn-suspendMarket").innerHTML =
            "Resume Thames Boats";
        } else {
          document.getElementById("market-status").innerHTML =
            "<span style='color: forestgreen;'><b>Open - <i>it's business as usual!</i><b/></span>";
          document.getElementById("btn-suspendMarket").innerHTML =
            "Suspend Thames Boats";
        }

        // Hide all controls
        document.getElementById("ownerControls").style.display = "none";
        document.getElementById("marketAdminControls").style.display = "none";
        document.getElementById("clubOwnerControls").style.display = "none";

        if (owner === account) {
          roles =
            "<b>Owner</b>";
          document.getElementById("ownerControls").style.display = "block";
          document.getElementById("marketAdminControls").style.display =
            "block";
          // list the market admins
          let marketAdmins = await instance.getMarketAdmins();
          if (marketAdmins.length > 0) {
            let marketAdminsRow = $("#listMarketAdmins");
            let marketAdminsTemplate = $("#marketAdminsTemplate");
            let k
            let marketAdmin
            let marketAdminList = []
            let isMarketAdmin
            // loop over getMarketAdmins (marketAdminRoleList)
            for (k = 0; k < marketAdmins.length; k++) {
              marketAdmin = marketAdmins[k].toString()
              isMarketAdmin = await instance.roleMarketAdmin(marketAdmin)
              // check if address is true in roleMarketAdmin
              if (isMarketAdmin) {
                if (!marketAdminList.includes(marketAdmin)) {
                  marketAdminList.push(marketAdmin)
                  marketAdminsTemplate
                    .find(".marketAdminAddress")
                    .text(marketAdmin);
                  marketAdminsRow.append(marketAdminsTemplate.html())
                } // end if marketAdmin in marketAdminList
              } // end if marketAdmin address has roleMarketAdmin
            }
            marketAdminsRow.append('<br />')
            document.getElementById("listMarketAdmins").style.display = "block";
          }

        }
        if (marketAdmin) {
          if (roles !== "") {
            roles = roles + ", ";
          }
          roles = roles + "<b>Market Admin</b>";
          document.getElementById("marketAdminControls").style.display =
            "block";
          
          // list the accounts with club owner roles
          let clubOwners = await instance.getClubOwners()
          if (clubOwners.length > 0) {
            let clubOwnerRow = $("#listClubOwners")
            let clubOwnerTemplate = $("#clubOwnerTemplate")
            let k
            let clubOwner
            let clubOwnerList = []
            let isClubOwner
            // loop over clubs
            for (k = 0; k < clubOwners.length; k++) {
              clubOwner = clubOwners[k].toString()
              isClubOwner = await instance.roleClubOwner(clubOwner)
              // check if address is true in roleClubOwner
              if (isClubOwner) {
                if (!clubOwnerList.includes(clubOwner)) {
                  clubOwnerList.push(clubOwner)
                  clubOwnerTemplate
                    .find(".clubOwnerAddress")
                    .text(clubOwner)
                  clubOwnerRow.append(clubOwnerTemplate.html())
                } // end if club Owner in clubOwnerList
              } // end if club owner address has roleClub Owner
            }
            clubOwnerRow.append("<br />");
            document.getElementById("listClubOwners").style.display = "block";
          }
        }

        if (clubOwner) {
          if (roles !== "") {
            roles = roles + ", ";
          }
          roles = roles + "<b>Club Owner</b>";
          document.getElementById("clubOwnerControls").style.display = "block";
        }

        if (roles === "") {
          roles = "<i>none</i>";
        }
        return roles;
      })
      .then(function(roles) {
        document.getElementById("account-roles").innerHTML = roles;
        document.getElementById("account-address").innerHTML =
          "<b>" + account + "</b>";
        document.getElementById("contract-address").innerHTML =
          "<b>" + contractAddress + "</b>";
      });
  },

  isAddress: function(address) {
    return web3.isAddress(address);
    // console.log("ADDRESS CHECK - isAddress ", web3.isAddress(address));

    // if (address.length >= 40) {
    //   let addressValid = false;
    //   // function isAddress(address) {
    //   if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    //     // check if it has the basic requirements of an address
    //     console.log("isAddress - unexpected characters in ", address);
    //   } else if (
    //     /^(0x)?[0-9a-f]{40}$/.test(address) ||
    //     /^(0x)?[0-9A-F]{40}$/.test(address)
    //   ) {
    //     // If it's all small caps or all all caps, return "true
    //     addressValid = true;
    //   }

    //   if (!addressValid) {
    //     // Otherwise check if check summed address
    //     //isChecksumAddress(address);
    //     address = address.replace("0x", "");
    //     var addressHash = web3.sha3(address.toLowerCase());
    //     for (var i = 0; i < 40; i++) {
    //       // the nth letter should be uppercase if the nth digit of casemap is 1
    //       if (
    //         (parseInt(addressHash[i], 16) > 7 &&
    //           address[i].toUpperCase() !== address[i]) ||
    //         (parseInt(addressHash[i], 16) <= 7 &&
    //           address[i].toLowerCase() !== address[i])
    //       ) {
    //         console.log("failed - addressValid");
    //       }
    //     }
    //   }
    //   addressValid = true; // TODO we override this function for now, since checksummed addresses aren't validating
    //   return addressValid;
    // } else {
    //   return false;
    // }
  },

  /* TOGGLE FORSALE / NOTFORSALE
   */
  handleToggleBoatStatus: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
        let clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        let boatId = parseInt($(event.target).data("id"));

        return instance.toggleBoatStatus(boatId, { from: account });
      })
      .then(function(result) {
        document.getElementById("toggleBoatStatus-result").innerHTML =
          "<span style='color: forestgreen;'><b>Boat removed</b></span>";
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("toggleBoatStatus-result").innerHTML =
          "<span style='color: red;'><b>" + err.message + "</b></span>");
      });
  },

  /* WITHDRAW FUNDS
   */
  handleWithdrawFunds: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
       
        return instance.withdrawFunds({ from: account });
      })
      .then(function(result) {
        document.getElementById("withdrawFunds-result").innerHTML = "<span style='color: forestgreen;'><b>Funds withdrawn</b></span>";
        document.getElementById("showMyBalance").innerHTML = 0 + " ETH";
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("toggleBoatStatus-result").innerHTML =
          "<span style='color: red;'><b>" + err.message + "</b></span>");
      });
  },

  /* BUY THE BOAT
   */
  handleBuyBoat: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
        let clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        let boatId = parseInt($(event.target).data("id"));

        let e = document.getElementsByName("boatId" + boatId.toString());
        e = e[0];
        let chosenQuantity = e.options[e.selectedIndex].value;

        let boatData = await instance.getBoat(boatId);
        let boatPrice = boatData[2];
        // boatPrice is in Wei data type BN.
        // convert to Eth, and numberic
        boatPriceEth = web3.fromWei(boatPrice, "ether").toNumber();
        let totalPrice = boatPriceEth * chosenQuantity;
        totalPriceWei = web3.toWei(totalPrice, "ether");

        return instance.purchaseBoat(boatId, chosenQuantity, {
          from: account,
          value: totalPriceWei
        });
      })
      .then(function(result) {
        document.getElementById("toggleBoatStatus-result").innerHTML =
          "<span style='color: forestgreen;'><b>Boat removed</b></span>";
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("toggleBoatStatus-result").innerHTML =
          "<span style='color: red;'><b>" + err.message + "</b></span>");
      });
  },

  /* REMOVE BOAT
   */
  handleRemoveBoat: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
        let clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        let boatId = parseInt($(event.target).data("id"));

        return instance.removeBoat(boatId, { from: account });
      })
      .then(function() {
        document.getElementById("removeBoat-result").innerHTML =
          "<span style='color: forestgreen;'><b>Boat removed</b></span>";
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("removeBoat-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* ADD BOAT CLUB
   */
  handleAddBoat: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    let boatName = document.getElementById("data-addBoatName").value.trim();
    let boatDescription = document
      .getElementById("data-addBoatDescription")
      .value.trim();
    let boatPrice = document.getElementById("data-addBoatPrice").value.trim();
    boatPrice = web3.toWei(boatPrice, "ether");

    let boatQuantity = document
      .getElementById("data-addBoatQuantity")
      .value.trim();

    let addBoat = true;
    if (boatName.length === 0) {
      document.getElementById("addBoatName-result").innerHTML =
        "<span style='color: red;'><b>Name cannot be blank</b></span>";
      addBoat = false;
    }
    if (boatDescription.length === 0) {
      // address not proper
      document.getElementById("addBoatDescription-result").innerHTML =
        "<span style='color: red;'><b>Location cannot be blank</b></span>";
      addBoat = false;
    }
    if (boatPrice <= 0 || !$.isNumeric(boatPrice)) {
      document.getElementById("addBoatPrice-result").innerHTML =
        "<span style='color: red;'><b>Boat price must be greater than zerop</b></span>";
      addBoat = false;
    }
    if (boatQuantity <= 0 || !$.isNumeric(boatQuantity)) {
      document.getElementById("addBoatQuantity-result").innerHTML =
        "<span style='color: red;'><b>Boat quantity must be greater than zerop</b></span>";
      addBoat = false;
    }

    if (!addBoat) {
      return;
    }
    var account = web3.eth.accounts[0];

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        return instance.addBoat(
          boatName,
          boatDescription,
          boatPrice,
          boatQuantity,
          {
            from: account
          }
        );
      })
      .then(function() {
        document.getElementById("addBoat-result").innerHTML =
          "<span style='color: forestgreen;'><b>Boat added!</b></span>";
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("addMarketAdmin-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* REMOVE BOAT CLUB
   */
  handleRemoveBoatClub: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    var account = web3.eth.accounts[0];
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        return instance.removeClub(clubId, {
          from: account
        });
      })
      .then(function() {
        document.getElementById("removeBoatClub-result").innerHTML =
          "<span style='color: forestgreen;'><b>Boat Club removed</b></span>";
        location.reload(false)
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("removeBoatClub-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* ADD BOAT CLUB
   */
  handleAddBoatClub: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    let boatClubName = document
      .getElementById("data-addBoatClubName")
      .value.trim();
    let boatClubLocation = document
      .getElementById("data-addBoatClubLocation")
      .value.trim();

    if (boatClubName.length === 0) {
      document.getElementById("addBoatClubName-result").innerHTML =
        "<span style='color: red;'><b>Name canot be blank</b></span>";
      return;
    } else if (boatClubLocation.length === 0) {
      // address not proper
      document.getElementById("addBoatClubLocation-result").innerHTML =
        "<span style='color: red;'><b>Location canot be blank</b></span>";
      return;
    }

    var account = web3.eth.accounts[0];
    let displayAdded = false;
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        return instance.addClub(boatClubName, boatClubLocation, {
          from: account
        });
      })
      .then(function() {
        if (displayAdded) {
          document.getElementById("addBoatClub-result").innerHTML
            = "<span style='color: forestgreen;'><b>Market Admin added</b></span>";
        }
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("addBoatClub-result").innerHTML = "<b>" + err.message + "</b>");
      });
  },

  /* OPEN / CLOSE CLUB
   */
  handleBoatClubOpenClose: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
        let clubId = await instance.ownertoClub.call(account);
        clubId = clubId.c[0];
        let club = await instance.clubs.call(clubId);
        let clubStatus = App.clubStatus(club[3].c[0]);

        if (clubId > 0) {
          // is clubOwner
          // hide addBoatClub form
          if (clubStatus === "Open") {
            // close club
            return instance.closeClub(clubId, {
              from: account
            });
          } else if (clubStatus === "Closed") {
            // open club
            return instance.openClub(clubId, {
              from: account
            });
          }
        }
      })
      .then(async function () {
        location.reload(false);
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("suspendMarket-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* SUSPEND MARKET
   */
  handleSuspendMarket: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let account = web3.eth.accounts[0];
        let owner = await instance.owner.call();

        if (owner !== account) {
          document.getElementById("suspendMarket-result").innerHTML =
            "<span style='color: red;'><b>You are not the Market Owner!</b></span>";
          return false;
        }
        // Execute adopt as a transaction by sending account
        return instance.toggleThamesBoatsActive({
          from: account
        });
      })
      .then(async function(result) {
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("suspendMarket-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* REMOVE MARKET ADMIN
   */
  handleRemoveMarketAdmin: function(event) {
    event.preventDefault();
    App.resetAllMessages();

    let entered_address = document
      .getElementById("data-removeMarketAdmin")
      .value.trim();

    if (!App.isAddress(entered_address)) {
      // address not proper
      console.log("Address not in the expected format: ", entered_address);
      document.getElementById("removeMarketAdmin-result").innerHTML =
        "<span style='color: red;'><b>Address not in the expected format</b></span>";
      // alert('The address provided is not in the expcted format:\n' + entered_address)
      return;
    }

    var account = web3.eth.accounts[0];
    let displayRemoved = false;
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let owner = await instance.owner.call();
        if (owner !== account) {
          return (document.getElementById(
            "removeMarketAdmin-result"
          ).innerHTML =
            "<span style='color: red;'><b>You are not the Market Owner!</b></span>");
        }
        if (owner == entered_address) {
          return (document.getElementById(
            "removeMarketAdmin-result"
          ).innerHTML =
            "<span style='color: red;'><b>The Market Admin role cannot be rmoeved from the owner!</b></span>");
        }
        already_admin = await instance.roleMarketAdmin(entered_address);
        if (!already_admin) {
          return (document.getElementById(
            "removeMarketAdmin-result"
          ).innerHTML =
            "<span style='color: red;'><b>Entered address is not a Market Admin</b></span>");
        }
        displayRemoved = true;
        // Execute adopt as a transaction by sending account
        return instance.removeMarketAdmin(entered_address, {
          from: account
        });
      })
      .then(function(result) {
        if (displayRemoved) {
          document.getElementById("removeMarketAdmin-result").innerHTML =
            "<span style='color: forestgreen;'><b>Market Admin removed</b></span>";
          location.reload(false)
        }
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("removeMarketAdmin-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* RESET ALL UI MESSAGES
   */
  resetAllMessages: function() {
    tags = [
      "addBoatClubLocation-result",
      "addBoatClubName-result",
      "addBoatClub-result",
      "addBoatDescription-result",
      "addBoatName-result",
      "addBoatPrice-result",
      "addBoatQuantity-result",
      "addBoat-result",
      "addClubOwner-result",
      "addMarketAdmin-result",
      "removeBoatClub-result",
      "removeBoat-result",
      "removeClubOwner-result",
      "removeMarketAdmin-result",
      "showMyBalance-result",
      "suspendMarket-result",
      "toggleBoatStatus-result",
      "withdrawFunds-result"
    ];
    for (const tag of tags) {
      try {
        document.getElementById(tag).innerHTML = "";
      } catch (err) {
        console.log("resetAllMessages - tag error, ", tag);
      }
    }
  },

  /* ADD MARKET ADMIN
   */
  handleAddMarketAdmin: function(event) {
    event.preventDefault();
    App.resetAllMessages();
    entered_address = document
      .getElementById("data-addMarketAdmin")
      .value.trim();
    App.resetAllMessages();

    if (!App.isAddress(entered_address)) {
      // address not proper
      document.getElementById("addMarketAdmin-result").innerHTML =
        "<span style='color: red;'><b>Address not in the expected format</b></span>";
      return;
    }

    var account = web3.eth.accounts[0];
    let displayAdded = false;
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        let owner = await instance.owner.call();
        if (owner !== account) {
          return (document.getElementById("addMarketAdmin-result").innerHTML =
            "<span style='color: red;'><b>You are not the Market Owner!</b></span>");
        }
        let already_admin = await instance.roleMarketAdmin(entered_address);
        if (already_admin) {
          return (document.getElementById("addMarketAdmin-result").innerHTML =
            "<span style='color: red;'><b>Entered address is already a Market Admin</b></span>");
        }
        displayAdded = true;
        // Execute adopt as a transaction by sending account
        return instance.addMarketAdmin(entered_address, {
          from: account
        });
      })
      .then(function(result) {
        if (displayAdded) {
          document.getElementById("addMarketAdmin-result").innerHTML =
            "<span style='color: forestgreen;'><b>Market Admin added</b></span>";
          location.reload(false);
        }
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("addMarketAdmin-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* REMOVE CLUB OWNER ********************************************************
   */
  handleRemoveClubOwner: function(event) {
    event.preventDefault();
    App.resetAllMessages();
    entered_address = document
      .getElementById("data-removeClubOwner")
      .value.trim();

    if (!App.isAddress(entered_address)) {
      // address not proper
      console.log("Address not in the expected format: ", entered_address);
      document.getElementById("removeClubOwner-result").innerHTML =
        "<span style='color: red;'><b>Address not in the expected format</b></span>";
      // alert('The address provided is not in the expcted format:\n' + entered_address)
      return;
    }

    var account = web3.eth.accounts[0];
    let displayRemoved = false;
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        suspended = await instance.suspended.call();
        if (suspended) {
          return (document.getElementById("removeClubOwner-result").innerHTML =
            "<span style='color: red;'><b>May not remove a Club Owner when the market is suspended</b></span>");
        }
        already_clubOwner = await instance.roleClubOwner(entered_address);
        if (!already_clubOwner) {
          return (document.getElementById("removeClubOwner-result").innerHTML =
            "<span style='color: red;'><b>Entered address is not a Club Owner</b></span>");
        }
        displayRemoved = true;
        // Execute adopt as a transaction by sending account
        return instance.removeClubOwner(entered_address, {
          from: account
        });
      })
      .then(function(result) {
        if (displayRemoved) {
          document.getElementById("removeClubOwner-result").innerHTML =
            "<span style='color: forestgreen;'><b>Club owner removed</b></span>";
          location.reload(false)
        }
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("removeClubOwner-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  },

  /* ADD CLUB OWNER
   */
  handleAddClubOwner: async function(event) {
    event.preventDefault();
    App.resetAllMessages();
    entered_address = document.getElementById("data-addClubOwner").value.trim();

    if (!App.isAddress(entered_address)) {
      // address not proper
      console.log("Address not in the expected format: ", entered_address);
      document.getElementById("addClubOwner-result").innerHTML =
        "<span style='color: red;'><b>Address not in the expected format</b></span>";
      return;
    }

    var account = web3.eth.accounts[0];
    let displayAdded = false;
    App.contracts.ThamesBoats.deployed()
      .then(async function(instance) {
        suspended = await instance.suspended.call();
        if (suspended) {
          return (document.getElementById("addClubOwner-result").innerHTML =
            "<span style='color: red;'><b>May not add a Club Owner when the market is suspended</b></span>");
        }
        already_clubOwner = await instance.roleClubOwner(entered_address);
        if (already_clubOwner) {
          return (document.getElementById("addClubOwner-result").innerHTML =
            "<span style='color: red;'><b>Entered address is already a Club Owner</b></span>");
        }
        displayAdded = true;
        // Execute adopt as a transaction by sending account
        return instance.addClubOwner(entered_address, {
          from: account
        });
      })
      .then(function(result) {
        if (displayAdded) {
          document.getElementById("addClubOwner-result").innerHTML =
            "<span style='color: forestgreen;'><b>Club owner added</b></span>";
          location.reload(false)
        }
        return;
      })
      .catch(function(err) {
        console.log(err.message);
        return (document.getElementById("addClubOwner-result").innerHTML =
          "<b>" + err.message + "</b>");
      });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
