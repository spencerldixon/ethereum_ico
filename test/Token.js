const Token = artifacts.require('./Token.sol');

contract('Token', function(accounts) {
  it('sets the total supply on init', function() {
    return Token.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          'sets total supply to 1 million',
        );
      });
  });
});
