// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "./interfaces/IMath.sol";
import "hardhat/console.sol";

contract LotteryTicket is ReentrancyGuardUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
  using CountersUpgradeable for CountersUpgradeable.Counter;
  using SafeMathUpgradeable for uint256;

  CountersUpgradeable.Counter public _activityId;
  bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");

  uint256 public fee;
  address public Dai;
  address public math;
  address public platform;

  struct Activity {
    uint256 startTime;
    uint256 duration;
    uint256 totalTicket;
    uint256 price;
    // runtion param
    uint256 targetNumber; // random number
    uint256 balance;
  }

  // activityId => Activity
  mapping(uint256 => Activity) public activityMap;


  struct UserInf {
    uint256 activityId;
    uint256 number;
    uint256 ticketAmount;
    bool winner;
  }
  // activityId =>userAddress => UserInf
  mapping(uint256 => mapping(address => UserInf)) public userMap;

  // chainlink

  mapping(uint256 => uint256) requestInfoMap;

  // activity => winner 
  mapping(uint256 => address) public winnerMap;



 // ========== modifier ==========


 modifier notStartOrEnd() {
  _;
 }
 function initialize(address _dai) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VAULT_ROLE, msg.sender);

        _activityId.increment();
        fee = 20;
        Dai = _dai;
    }

  // ========== Set func =========
  function setFee(uint256 _fee) public onlyRole(DEFAULT_ADMIN_ROLE) {
    fee = _fee;  
  }

  function setMath(address _math) public onlyRole(DEFAULT_ADMIN_ROLE) {
    math = _math;
  }

  function setPlatform(address _platform) public onlyRole(DEFAULT_ADMIN_ROLE) {
    platform = _platform;
  }

  // ========== Admin func ==========

  function lauchActivity(uint256 _startTime, uint256 _duration, uint256 _price ) public onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256)  {
    uint256 acId = _activityId.current();
    if (acId.sub(1) >=1 ){
      Activity storage preAc = activityMap[acId.sub(1)];
      uint256 endTime = preAc.duration.mul(1 days).add(preAc.startTime);
      require(endTime  <= block.timestamp, "Exist an activity is running......");
    }
      Activity memory ac = Activity({
        startTime:_startTime,
        duration: _duration,
        totalTicket: 0,
        price: _price,
        targetNumber: 0,
        balance:0
      });

    activityMap[acId] = ac;
    _activityId.increment();

    return acId;
  }
  
  function claimRandom(uint256 _acId) public onlyRole(DEFAULT_ADMIN_ROLE) {
    Activity storage ac = activityMap[_acId];
    uint256 endTime = ac.duration.mul(1 days).add(ac.startTime);
    console.log("endtime",endTime, block.timestamp);
    require(endTime  <= block.timestamp, "Activity is running......");
    require(ac.targetNumber == 0, "Already set random number");

    //TODO fist number maybe zero

    // ac.targetNumber = getRandomNumber()%10000;
    // Test 
    ac.targetNumber = 4870;

  }

  // withdraw fee and other remain token
  function withdrawERC20(uint256 _balance, address _to) public onlyRole(DEFAULT_ADMIN_ROLE) {
      IERC20Upgradeable(Dai).transfer(_to, _balance);
  }

  // ========== participant func ========== 
  function buyTicket(uint256 _ticketId,uint256 _number, uint256 _ticketAmount) public {
      Activity storage ac = activityMap[_ticketId];
      uint256 endTime = ac.duration.mul(1 days).add(ac.startTime);
      
      require(ac.startTime <= block.timestamp &&  block.timestamp <= endTime, "initial stage or end" );
      uint256 userBal = IERC20Upgradeable(Dai).balanceOf(msg.sender);
      uint256 payment = ac.price.mul(_ticketAmount);
      console.log("buy ticket:", userBal > payment);
      require(userBal >= payment, "Insufficient assets");

      IERC20Upgradeable(Dai).transferFrom(msg.sender, address(this), payment);
      ac.totalTicket = ac.totalTicket.add(_ticketAmount);
      ac.balance = ac.balance.add(payment);

      // if user has buy
      if (userMap[_ticketId][msg.sender].activityId == 0) {
          UserInf memory ui = UserInf({
            activityId:_ticketId,
            number: _number,
            ticketAmount: _ticketAmount,
            winner: false
          });

          userMap[_ticketId][msg.sender] = ui;
      }else {
        UserInf storage ui = userMap[_ticketId][msg.sender];
        ui.ticketAmount = ui.ticketAmount.add(_ticketAmount);
      }
      
  }


  function claimAsset(uint256 ticketId ) public {
    Activity storage ac = activityMap[ticketId] ;

    UserInf storage userInf = userMap[ticketId][msg.sender];
    require(userInf.winner==false, "Already claim");
    require(ac.targetNumber == userInf.number, "Not winner");

    userInf.winner = true;
    uint256 winnerAmount = ac.balance.mul(userInf.ticketAmount).mul(80).div(ac.totalTicket).div(100);

    uint256 platformAmount = ac.balance.mul(userInf.ticketAmount).mul(fee).div(ac.totalTicket).div(100);


    ac.balance = ac.balance.sub(winnerAmount).sub(platformAmount);

    console.log("winner asset:", winnerAmount, platformAmount);
    IERC20Upgradeable(Dai).transfer(msg.sender, winnerAmount);
    IERC20Upgradeable(Dai).transfer(platform, platformAmount);
    winnerMap[ticketId] = msg.sender;
    
  }


  // ========== external function ==========
  function getLuckyCodeAndWinner(uint256 _activityId) public view returns(uint256, address) {

    return (activityMap[_activityId].targetNumber, winnerMap[_activityId]);
  }

  /*
     * Callback function used by VRF Coordinator
     */
    // The following functions are overrides required by Solidity.
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

  // chainlink callback
  function fulfillRandomWords(
        uint256 requestId, /* requestId */
        uint256 randomWord
    ) public {
        require(msg.sender == address(math), "Only linkAccessor can call");
        requestInfoMap[requestId] = randomWord;
    }
  


   function getRandomNumber() public view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp +
                            block.difficulty +
                            ((
                                uint256(
                                    keccak256(abi.encodePacked(block.coinbase))
                                )
                            ) / (block.timestamp)) +
                            block.gaslimit +
                            ((
                                uint256(keccak256(abi.encodePacked(msg.sender)))
                            ) / (block.timestamp)) +
                            block.number
                    )
                )
            );
    }
}