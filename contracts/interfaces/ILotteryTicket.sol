pragma solidity ^0.8.0;

interface ILotteryTicket {
    function safeMint(address to, uint256 _tokenId) external returns (uint256);

    function ownerOfAddress(uint256 tokenId) external returns (address);

    function fulfillRandomWords(uint256 requestId, uint256 randomness) external;
}