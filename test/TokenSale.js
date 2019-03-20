const Token     = artifacts.require('./Token.sol');
const TokenSale = artifacts.require('./TokenSale.sol');

contract('TokenSale', function(accounts) {
  var tokenSaleInstance;
  var tokenPrice = 1000000000000000; // in wei
  var buyer = accounts[1];
  var numberOfTokens = 10;
  var admin = accounts[0];
  var tokensAvailable = 750000 // Provision 75% of tokens to the token sale

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

  it('facilitates token buying', function() {
    return Token.deployed().then(function(instance) {
      // Grab token instance
      tokenInstance = instance;
      return TokenSale.deployed();
    }).then(function(instance) {
      // Grab token sale instance
      tokenSaleInstance = instance;
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
    }).then(function(receipt){
      return tokenSaleInstance.buyTokens(10, {from: buyer, value: 10 * tokenPrice })
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, 10, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then(function(amount) {
      assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold')
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), numberOfTokens);
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
      // try to buy tokens different from the ether value / guard against underpaying
      return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1})
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
      return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
    });
  });


  it('ends token sale', function() {
    return Token.deployed().then(function(instance) {
      // Grab token instance
      tokenInstance = instance;
      return TokenSale.deployed();
    }).then(function(instance) {
      // Grab token sale instance
      tokenSaleInstance = instance;
      // Try to end the sale from someone other than admin
      return tokenSaleInstance.endSale({from: buyer})
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, "errors when non admin tries to end sale")
      // End sale as admin
      return tokenSaleInstance.endSale({from: admin})
    }).then(function(receipt) {
      return tokenInstance.balanceOf(admin)
    }).then(function(balance) {
      // spends 25100 more tokens for some reason
      assert.equal(balance.toNumber(), 999990, "returns unsold tokens to admin")
      // check token price was reset when self destruct called
      return tokenSaleInstance.tokenPrice()
    }).then(function(price) {
      assert.equal(price, 0, "token price was reset")
    })
  });

});
