pragma solidity 0.5.2;

import "./SafeMath.sol";
import "./ReentrancyGuard.sol";

/// @title A market for rowing boat clubs on the river Thames to sell rowing boats
/// @author Ryan Davies
contract ThamesBoats is ReentrancyGuard {

  // owner, marketAdmin, clubOwner, buyer variables
  // the contract owner
  address public owner;
  // whether the market is suspended
  bool public suspended = false;
  // records numeric sequence of boat, club, purchase IDs
  uint256 public boatIdSeq;
  uint256 public clubIdSeq;
  uint256 private purchaseIdSeq;
  // array of addresses assigned marketAdmin role
  address[] public marketAdminRoleList;
  // array of addreses assigned clubOwnerRole
  address[] public clubOwnerRoleList;
  // array of club IDs
  uint256[] public clubList;

  // mappings
  // roleMarketAdmins
  mapping(address => bool) public roleMarketAdmin;
  // roleClubOwners
  mapping(address => bool) public roleClubOwner;
  // owner => clubId
  mapping(address => uint256) public ownertoClub;
  // clubId => Clubs
  mapping(uint256 => Club) public clubs;
  // clubId => BoatIds
  mapping(uint256 => uint256[]) public clubBoats; 
  // boatId => boat
  mapping(uint256 => Boat) public boats;
  // boatId => clubId
  mapping(uint256 => uint256) public boatIdtoClubId;
  // purchaseId => Purchase
  mapping(uint256 => Purchase) public purchases;
  // balances of the ClubOwners
  mapping(address => uint256) public balances;

  // struct of boats details, prices, stock
  struct Boat {
      string name;
      string description;
      uint256 price; 
      uint256 quantity; 
      BoatStatus boatStatus;
  }

  // struct of clubs and their statuses
  struct Club {
      address payable owner; 
      string name;
      string location;
      ClubStatus clubStatus;
  }

  // struct of buyer purchases
  struct Purchase {
      uint256 clubId; 
      uint256 boatId;
      address buyer;
      uint256 quantity;
      uint256 totalPaid;
  }

  enum ClubStatus {
      Closed,     // 0
      Open,       // 1
      Removed     // 2
  }
  
  enum BoatStatus {
      NotForSale, // 0
      ForSale,    // 1
      Removed     // 2
  }

  // events
  event LogToggleThamesBoatsSuspended(address indexed actionedBy, bool suspended);
  event LogAddMarketAdmin(address indexed newAdmin);
  event LogRemoveMarketAdmin(address indexed removedAdmin);
  event LogRemoveClubOwner(address indexed removedClubOwner, address actionedBy);
  event LogAddClubOwner(address indexed newClubOwner, address actionedBy);
  event LogClubRemoved(uint256 indexed clubId, address actionedBy);
  event LogClubClosed(uint256 indexed clubId, address actionedBy);
  event LogClubAdded(uint256 indexed clubId, address actionedBy);
  event LogClubOpen(uint256 indexed clubId, address actionedBy);
  event LogBoatAdded(
      uint256 indexed clubId, 
      uint256 indexed boatId, 
      uint256 price, 
      uint256 quantity, 
      address actionedBy
  );
  event LogBoatRemoved(uint256 indexed boatId, address actionedBy);
  event LogBoatStatusToggled(uint256 indexed boatId, uint256 boatStatus);
  event LogPaymentReceived(address indexed sender, uint256 value);
  event LogPaymentRefund(uint256 indexed purchaseId, uint256 refund);
  event LogWithdrawl(address indexed withdrawer, uint256 value);
  event LogPurchase(
      address indexed purchasedBy, 
      uint256 indexed purchaseId, 
      address clubOwner, 
      uint256 clubId,
      uint256 boatId, 
      uint256 quantity, 
      uint256 costOfSale,
      uint256 fundsSent,
      uint256 refund
  );

  /// modifier, require that the market is not suspended
  modifier ifMarketNotSuspended {
      require(!suspended, "function cannot run while the Boat Market is suspended");
      _; 
  }
 
  /// modifier, require that the market is suspended
  modifier ifMarketSuspended { 
      require(suspended, "function cannot run while the Boat Market is running");
      _; 
  }

  /// modifier, checks that the caller is the owner
  modifier isOwner() { 
     require(msg.sender == owner, "caller is not the contract owner"); 
     _; 
  }
 
  /// modifier, checks that caller ia a MarketAdmin
  modifier hasMarketAdminRole() {
     require(roleMarketAdmin[msg.sender], "caller is not a Market Admin");
     _;
  }

  /// modifier, checks that caller is club owner or is a market admin
  modifier hasClubOwnerRole() {
      require((roleClubOwner[msg.sender] || roleMarketAdmin[msg.sender]), 
              "caller is not a Club Owner nor a Market Admin");
      _;
  }

  /// modifier, checks that caller owns this club
  modifier ownsThisClub(uint256 clubId) {
      require((clubs[clubId].owner == msg.sender), 
              "caller is not owner of the specified Club nor a Market Admin");
      _;
  }

  /// modifier, checks that caller owns the given boat
  modifier ownsThisBoat(uint256 boatId) {
      uint256 ownsClubId = ownertoClub[msg.sender];
      require(boatIdtoClubId[boatId] != 0, "this boat is not owned by any club - does not exist");
      require(ownsClubId == boatIdtoClubId[boatId], "you are not the owner of this boat");
      _;
  }


  /// @notice constructor funtion
  /// @dev assign the owner the market admin role by default
  constructor() public {
      owner = msg.sender;
      roleMarketAdmin[msg.sender] = true;
      marketAdminRoleList.push(msg.sender);
  }

  /// @notice Fallback funtion
  /// @dev We require that no data can be sent to fallback to prevent accidental usage
  /// @dev and loss of funds sent
  function() external payable  { 
      require(msg.data.length == 0, "message data may not be sent to the fallback");
  }

  /// @notice Emergency contract circuit breaker
  //  @dev May only be called by the owner
  function toggleThamesBoatsActive()
      external
      isOwner
  {
      suspended = !suspended;
      emit LogToggleThamesBoatsSuspended(msg.sender, suspended);
  }

  /// @notice Returns the details for a given club ID
  /// @param clubId of the club details requested
  /// @return address of the club owner
  /// @return name of the club
  /// @return location of the club
  /// @return status of the rowing club, enum ClubStatus
  function getClub(uint256 clubId) 
      external
      view 
      returns(
          address,
          string memory,
          string memory,
          uint256 
      )
  {
      Club memory club = clubs[clubId];

      return(
          club.owner,
          club.name,
          club.location,
          uint256(club.clubStatus)
      );
  }

  /// @notice Returns the details of a given boat ID
  /// @param boatId for required boat
  /// @return name of the boat
  /// @return decription of the boat
  /// @return price of the boat in Wei
  /// @return quantity of the boat in stock
  /// @return boatStatus of the boat, enum BoatStatus
  function getBoat(uint256 boatId) 
      external 
      view
      returns(
          string memory,
          string memory,
          uint256,
          uint256,
          uint256
      )
  {
      Boat memory boat = boats[boatId];

      return(
          boat.name,
          boat.description,
          boat.price,
          boat.quantity,
          uint256(boat.boatStatus)
      );
  }

  /// @notice Gets the complete list of club IDs
  /// @return an array of boat club IDs
  function getClubIds() external view returns(uint256[] memory) {
      return clubList;        
  }

  /// @notice Gets the array of Market Admins addresses every assigned
  /// @return the array of Market Admin addresses
  function getMarketAdmins() external view returns(address[] memory) {
      return marketAdminRoleList;
  }

  /// @notice Gets the array of Club Owner addresses ever assigned
  /// @return the arrary of Club Owner addresses
  function getClubOwners() external view returns(address[] memory) {
      return clubOwnerRoleList;
  }
 
  /// @notice Gets the balance of the requesting address from the balances mapping
  /// @return the balance in Wei as an integer
  function getMyBalance() external view returns(uint256) {
      return balances[msg.sender];
  }

  /// @notice Gets the boat IDs owned by a given club ID
  /// @param clubId ID of club which owns the returned boat ID
  /// @return arrary of boat IDs
  function getBoatsIdbyClubId(uint256 clubId) external view returns(uint256[] memory) {
      return clubBoats[clubId];      
  }

  /// @notice Add boat details, mapped to the callers club ID
  /// @dev The caller must have the club owner role and have a club
  /// @param name name or title of the boat
  /// @param description details about the boat for sale
  /// @param price price in Wei
  /// @param quantity quantity of the boat
  /// @return boatIdSeq of the new boat added
  function addBoat(
      string calldata name, 
      string calldata description, 
      uint256 price, 
      uint256 quantity
  )
      external
      hasClubOwnerRole
      ifMarketNotSuspended
      returns(uint256)
  {
      uint256 nameLength = bytes(name).length;
      require(nameLength > 0, "boats must have a name");
      uint256 myClubId = ownertoClub[msg.sender];
      // Assert that a clubOwner must have a clubId assigned in mapping ownertoClub.
      // clubId is incremented before first use, and therefore will always be set 
      // and always greater than 1
      assert(myClubId > 0);

      boatIdSeq++;
      clubBoats[myClubId].push(boatIdSeq);   
      boatIdtoClubId[boatIdSeq] = myClubId;
      boats[boatIdSeq] = Boat({
          name: name,
          description: description,
          price: price,
          quantity: quantity,
          boatStatus: BoatStatus.ForSale
      }); 
      emit LogBoatAdded(myClubId, boatIdSeq, price, quantity, msg.sender);
      return boatIdSeq;
  }   
 
  /// @notice Remove a boat by given boat ID
  /// @dev The caller must be the owner of the given boat ID
  /// @param boatId ID of the boat to be marked as Removed
  /// @return bool
  function removeBoat(uint256 boatId)
      external
      ownsThisBoat(boatId)
      ifMarketNotSuspended
      returns(bool)
  { 
      // Check that mapping exist by ensuring nane length is non-zero
      uint256 nameLength = bytes(boats[boatId].name).length;
      if(nameLength > 0 &&
         boats[boatId].boatStatus != BoatStatus.Removed)
      {
          boats[boatId].boatStatus = BoatStatus.Removed;  
          emit LogBoatRemoved(boatId, msg.sender);
      }
      return true;
  }

  /// @notice Toggles the state of a given boat ID between ForSale and NotForSale
  /// @dev The caller must be the owner of the given boat ID
  /// @param boatId of boat to change status
  /// @return bool
  function toggleBoatStatus(uint256 boatId)
      external
      ownsThisBoat(boatId)
      ifMarketNotSuspended
      returns(bool)
  {
      if (boats[boatId].boatStatus == BoatStatus.ForSale) {  
          (boats[boatId].boatStatus = BoatStatus.NotForSale);
      } else {
          (boats[boatId].boatStatus = BoatStatus.ForSale);
      } 
      uint256 boatStatus = uint256(boats[boatId].boatStatus);
      emit LogBoatStatusToggled(boatId, boatStatus);
      return true;
  }

  /// @notice Purchase a given boat specifing the boat ID and quantity
  /// @dev The function uses SafeMath for calculations to prevent against underflow
  /// @dev and overflow errors or attacks. 
  /// @dev The function uses the modifier nonReentrant provided by OpenZeppelin, to 
  /// @dev prevent against reentrancy attacks.
  /// @param boatId ID of boat to purchase
  /// @param quantity number of the boat to purcahse
  /// @return purchaseIdSeq, the ID of the purchase recorded in the purcahses mapping
  function purchaseBoat(uint256 boatId, uint256 quantity)
      external
      payable 
      ifMarketNotSuspended
      nonReentrant
      returns(uint256)
  {
      // ensure purchaseer and seller conditions are met
      require(boats[boatId].boatStatus == BoatStatus.ForSale, "boat not for sale");
      require(boats[boatId].quantity >= quantity, "not enough boats available");
      uint256 costOfSale = SafeMath.mul(boats[boatId].price, quantity);
      require(msg.value >= costOfSale, "not enough funds sent for purchase");
      uint256 clubIdOfBoat = boatIdtoClubId[boatId];
      require(clubs[clubIdOfBoat].clubStatus == ClubStatus.Open, "Club is not currently open");
 
      // record the sale in sales ledger
      purchaseIdSeq++;
      purchases[purchaseIdSeq] = Purchase({
          clubId: clubIdOfBoat,
          boatId: boatId,
          buyer: msg.sender,
          quantity: quantity,         
          totalPaid: costOfSale
      });

      // pay the club owner the cost of sale 
      address payable clubOwnerAddr = clubs[clubIdOfBoat].owner;
      // assert the stored club owner address is non-zero, should never occur
      assert(clubOwnerAddr != address(0));
      balances[clubOwnerAddr] = SafeMath.add(balances[clubOwnerAddr], costOfSale);
 
      // reduce club's stock on hand
      boats[boatId].quantity = SafeMath.sub(boats[boatId].quantity, quantity);

      // we refund any excess to the caller
      uint256 amountToRefund = SafeMath.sub(msg.value, costOfSale);
      if(amountToRefund > 0) {
          msg.sender.transfer(amountToRefund);
          emit LogPaymentRefund(purchaseIdSeq, amountToRefund);
      }

      // log the purchase
      emit LogPurchase(
          msg.sender, 
          purchaseIdSeq,  
          clubOwnerAddr, 
          clubIdOfBoat, 
          boatId, 
          quantity, 
          costOfSale,
          msg.value,
          amountToRefund
      );

      return purchaseIdSeq;
  }

  /// @notice Withdraw funds recorded in balances for the callers account
  /// @dev The function uses the nonReentrant modifier to prevent against
  /// @dev reentrancy attacks. nonReentrant is provided ReentrancyGuard 
  /// @dev developed by OpenZeppelin.
  /// @dev The function is also written using the withdrawl design pattern.
  function withdrawFunds()
      external
      payable
      hasClubOwnerRole
      nonReentrant
  {
      require(balances[msg.sender] > 0, "no funds to withdraw");
      uint amounttoWithdraw = balances[msg.sender];
      // assert the funds to withdraw exist, should always be the case
      assert(address(this).balance >= amounttoWithdraw);

      // set balanaces[msg.sender] to zero, before transfering funds, the normal 
      // design to avoid reentranncy. The nonReentrant modifer is also used.
      balances[msg.sender] = 0;
      msg.sender.transfer(amounttoWithdraw);
      emit LogWithdrawl(msg.sender, amounttoWithdraw);
  }

  /// @notice Add a rowing boat club
  /// @dev The called must have been granted the club owner role
  /// @param name name of the rowing boat club
  /// @param location location of the club
  function addClub(string calldata name, string calldata location) 
      external 
      hasClubOwnerRole 
      ifMarketNotSuspended 
  {
      require(ownertoClub[msg.sender] == 0, "caller already owns a club and can only own one club");
      uint256 nameLength = bytes(name).length;
      require(nameLength > 0, "a club must have a name");

      clubIdSeq++;  
      clubList.push(clubIdSeq);
      ownertoClub[msg.sender] = clubIdSeq; 
      clubs[clubIdSeq] = Club({
          owner: msg.sender,
          name: name,
          location: location,
          clubStatus: ClubStatus.Open
      }); 
      emit LogClubAdded(clubIdSeq, msg.sender);
  }

  /// @notice Mark the given club as Removed, and therefore 
  /// @notice permanently closed
  /// @dev May only be called by the owner of the given club
  /// @param clubId ID of the club to be removed
  function removeClub(uint256 clubId) 
      external 
      ownsThisClub(clubId)
      ifMarketNotSuspended 
  {
      if(clubs[clubId].clubStatus != ClubStatus.Removed) {
          clubs[clubId].clubStatus = ClubStatus.Removed;
          emit LogClubRemoved(clubId, msg.sender);
      }
  }

  /// @notice Mark the given club as Closed
  /// @dev May only be called by the owner of the given club
  /// @param clubId ID of the club to be closed
  function closeClub(uint256 clubId) 
      external 
      ownsThisClub(clubId)
      ifMarketNotSuspended 
  {   
      // close club if open (i.e. not closed and not removed) 
      if(clubs[clubId].clubStatus == ClubStatus.Open) {
          clubs[clubId].clubStatus = ClubStatus.Closed;
          emit LogClubClosed(clubId, msg.sender);
      }   
  }

  /// @notice Mark the given club as Open
  /// @dev May only be called by the owner of the given club
  /// @param clubId ID of the club to be opened
  function openClub(uint256 clubId) 
      external
      ownsThisClub(clubId)
      ifMarketNotSuspended
  {
      if(clubs[clubId].clubStatus != ClubStatus.Removed) {
          clubs[clubId].clubStatus = ClubStatus.Open;
          emit LogClubOpen(clubId, msg.sender);
      }
  }

  /// @notice Add the market admin role to the given address 
  /// @param _address the address to be granted the market admin role
  function addMarketAdmin(address _address) 
      external 
      isOwner 
      ifMarketNotSuspended
  {
      if (roleMarketAdmin[_address] == false) {
          roleMarketAdmin[_address] = true;
          marketAdminRoleList.push(_address);
          emit LogAddMarketAdmin(_address);
      }
  }

  /// @notice Remove the market admin role from the given address
  /// @param _address the address to be removed
  function removeMarketAdmin(address _address) 
      external 
      isOwner 
      ifMarketNotSuspended
  {
      require(_address != owner, "the Market Admin role cannot be removed from the owner");
      if (roleMarketAdmin[_address] == true) {
          roleMarketAdmin[_address] = false;
          emit LogRemoveMarketAdmin(_address);
      }
  }

  /// @notice Add the club owner role to a given address
  /// @param _address the address to receive the club owner role
  function addClubOwner(address _address) 
      external  
      hasMarketAdminRole 
      ifMarketNotSuspended
  {
      if (roleClubOwner[_address] == false) {
          roleClubOwner[_address] = true;
          clubOwnerRoleList.push(_address);
          emit LogAddClubOwner(_address, msg.sender);
      }
  }

  /// @notice Remove the club owner role from a given address
  /// @param _address the address of the club owner
  function removeClubOwner(address _address) 
      external 
      hasMarketAdminRole 
      ifMarketNotSuspended
  {
      if (roleClubOwner[_address] == true) {
          // close the boat club if one has been opened
          if(clubs[ownertoClub[_address]].owner != address(0)) {
              clubs[ownertoClub[_address]].clubStatus = ClubStatus.Closed;
          }
          roleClubOwner[_address] = false;
          emit LogRemoveClubOwner(_address, msg.sender);
      }
  }

}

