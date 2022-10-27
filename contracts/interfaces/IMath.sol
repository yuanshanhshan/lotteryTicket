pragma solidity ^0.8.0;

interface IMath {
    function getRandomNumber() external returns (uint256);

    function requestRandomWords() external returns (uint256);
}