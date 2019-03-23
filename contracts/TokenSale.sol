pragma solidity >=0.4.21 <0.6.0;

import './Token.sol';

contract TokenSale {
  address admin;
  Token public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  event Sell(
    address _buyer,
    uint256 _amount
  );

  constructor(Token _tokenContract, uint _tokenPrice) public {
    admin         = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice    = _tokenPrice;
  }

  function multiply(uint x, uint y) internal pure returns (uint z) {
    require(y == 0 || (z = x * y) / y == x);
  }

  function buyTokens(uint256 _numberOfTokens) public payable {
    require(msg.value == multiply(_numberOfTokens, tokenPrice)); // Can't under pay or over pay for tokens
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens); // balance of this contract, must be greater than the amount of tokens attempted to purchase
    require(tokenContract.transfer(msg.sender, _numberOfTokens)); // require the transfer to be successful

    tokensSold += _numberOfTokens;

    emit Sell(msg.sender, _numberOfTokens);
  }
}
