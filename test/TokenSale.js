const TokenSale = artifacts.require('./TokenSale.sol');

contract('TokenSale', function(accounts) {
  var tokenSaleInstance;
  var tokenPrice = 1000000000000000; // in wei

  it('initialises the token sale contract with default values', function() {
    return TokenSale.deployed()
      .then(function(instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then(function(address) {
        assert.notEqual(address, 0x0, 'contract has an address');
        return tokenSaleInstance.tokenContract();
      })
      .then(function(address) {
        assert.notEqual(address, 0x0, 'has an token contract address');
        return tokenSaleInstance.tokenPrice();
      })
      .then(function(price) {
        assert.equal(price.toNumber(), tokenPrice, 'the price is correct');
      });
  });
});
