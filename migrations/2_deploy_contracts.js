const Token     = artifacts.require('Token');
const TokenSale = artifacts.require('TokenSale');

module.exports = function(deployer) {
  deployer.deploy(Token, 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(TokenSale, Token.address, tokenPrice);
  });
};
