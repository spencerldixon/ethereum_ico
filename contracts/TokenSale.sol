pragma solidity >=0.4.21 <0.6.0;

import './Token.sol';

contract TokenSale {
  address admin;
  Token public tokenContract;
  uint256 public tokenPrice;

  constructor(Token _tokenContract, uint _tokenPrice) public {
    admin         = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice    = _tokenPrice;
  }
}
